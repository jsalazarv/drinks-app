import {supabase} from '../lib/supabase';

export type CashoutType = 'daily' | 'monthly';

export interface OrderItem {
  id: number;
  total_amount: number;
  created_at: string;
}

export interface Cashout {
  id: number;
  type: CashoutType;
  total_amount: number;
  total_orders: number;
  start_date: string;
  end_date: string;
  created_at: string;
  orders?: OrderItem[];
}

const getLastCashoutDate = async (): Promise<string> => {
  const {data: lastCashout} = await supabase
    .from('cashouts')
    .select('end_date')
    .order('end_date', {ascending: false})
    .limit(1)
    .single();

  return lastCashout?.end_date || new Date(0).toISOString();
};

const getPendingOrders = async (
  startDate: string,
  endDate: string,
): Promise<OrderItem[]> => {
  // 1. Obtener los IDs de órdenes ya incluidas en cortes
  const {data: orderIds} = await supabase
    .from('cashouts_orders')
    .select('order_id');

  // 2. Obtener órdenes no incluidas en cortes
  let query = supabase
    .from('orders')
    .select('id, total_amount, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Solo aplicar el filtro not in si hay órdenes existentes
  if (orderIds && orderIds.length > 0) {
    const ids = orderIds.map(item => item.order_id);
    query = query.filter('id', 'not.in', `(${ids.join(',')})`);
  }

  const {data: orders, error} = await query;

  if (error) {
    throw error;
  }

  if (!orders || orders.length === 0) {
    throw new Error('No hay órdenes nuevas para generar el corte');
  }

  return orders;
};

const createCashoutRecord = async (
  type: CashoutType,
  totalAmount: number,
  totalOrders: number,
  startDate: string,
  endDate: string,
): Promise<Cashout> => {
  const {data: cashout, error} = await supabase
    .from('cashouts')
    .insert({
      type,
      total_amount: totalAmount,
      total_orders: totalOrders,
      start_date: startDate,
      end_date: endDate,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return cashout;
};

const linkOrdersToCashout = async (
  cashoutId: number,
  orders: OrderItem[],
): Promise<void> => {
  const cashoutOrders = orders.map(order => ({
    cashout_id: cashoutId,
    order_id: order.id,
  }));

  const {error} = await supabase.from('cashouts_orders').insert(cashoutOrders);

  if (error) {
    throw error;
  }
};

export const generateCashout = async (type: CashoutType): Promise<Cashout> => {
  try {
    // 1. Obtener la fecha del último corte
    const startDate = await getLastCashoutDate();
    const endDate = new Date().toISOString();

    // 2. Obtener órdenes pendientes
    const orders = await getPendingOrders(startDate, endDate);

    // 3. Calcular totales
    const totalAmount = orders.reduce(
      (sum, order) => sum + order.total_amount,
      0,
    );

    // 4. Crear el corte de caja
    const cashout = await createCashoutRecord(
      type,
      totalAmount,
      orders.length,
      startDate,
      endDate,
    );

    // 5. Relacionar órdenes con el corte
    await linkOrdersToCashout(cashout.id, orders);

    return {
      ...cashout,
      orders,
    };
  } catch (error) {
    console.error('Error generating cashout:', error);
    throw error;
  }
};

const getCashoutOrders = async (cashoutId: number): Promise<OrderItem[]> => {
  // 1. Obtener los IDs de las órdenes del corte
  const {data: orderIds, error: idsError} = await supabase
    .from('cashouts_orders')
    .select('order_id')
    .eq('cashout_id', cashoutId);

  if (idsError) {
    throw idsError;
  }

  if (!orderIds || orderIds.length === 0) {
    return [];
  }

  // 2. Obtener los detalles de las órdenes
  const ids = orderIds.map(item => item.order_id);
  const {data: orders, error: ordersError} = await supabase
    .from('orders')
    .select('id, total_amount, created_at')
    .in('id', ids);

  if (ordersError) {
    throw ordersError;
  }

  return orders || [];
};

export const getCashouts = async (): Promise<Cashout[]> => {
  try {
    // 1. Obtener todos los cortes
    const {data: cashouts, error} = await supabase
      .from('cashouts')
      .select('*')
      .order('created_at', {ascending: false});

    if (error) {
      throw error;
    }

    if (!cashouts) {
      return [];
    }

    // 2. Obtener las órdenes para cada corte
    const cashoutsWithOrders = await Promise.all(
      cashouts.map(async cashout => ({
        ...cashout,
        orders: await getCashoutOrders(cashout.id),
      })),
    );

    return cashoutsWithOrders;
  } catch (error) {
    console.error('Error fetching cashouts:', error);
    throw error;
  }
};
