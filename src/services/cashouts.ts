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

const getLastCashoutDate = async (): Promise<string | null> => {
  try {
    // Obtener el último corte
    const {data: lastCashout, error: lastCashoutError} = await supabase
      .from('cashouts')
      .select('end_date')
      .order('end_date', {ascending: false})
      .limit(1)
      .single();

    console.log('Last cashout query result:', {lastCashout, lastCashoutError});

    if (lastCashout?.end_date) {
      return lastCashout.end_date;
    }

    return null;
  } catch (error) {
    console.error('Error in getLastCashoutDate:', error);
    return null;
  }
};

const getPendingOrders = async (
  lastCashoutDate: string | null,
): Promise<OrderItem[]> => {
  try {
    // 1. Obtener los IDs de órdenes ya incluidas en cortes
    const {data: orderIds, error: orderIdsError} = await supabase
      .from('cashouts_orders')
      .select('order_id');

    console.log('Existing cashout orders:', {orderIds, orderIdsError});

    // 2. Construir la consulta base
    const query = supabase
      .from('orders')
      .select('id, total_amount, created_at')
      .order('created_at', {ascending: true});

    // 3. Si hay un último corte, filtrar desde esa fecha
    if (lastCashoutDate) {
      query.gt('created_at', lastCashoutDate);
    }

    // 4. Excluir órdenes ya incluidas en cortes
    if (orderIds && orderIds.length > 0) {
      const ids = orderIds.map(item => item.order_id);
      query.not('id', 'in', `(${ids.join(',')})`);
    }

    const {data: orders, error: ordersError} = await query;

    console.log('Pending orders query result:', {
      orders,
      ordersError,
    });

    if (ordersError) {
      throw ordersError;
    }

    if (!orders || orders.length === 0) {
      throw new Error('No hay órdenes nuevas para generar el corte');
    }

    return orders;
  } catch (error) {
    console.error('Error in getPendingOrders:', error);
    throw error;
  }
};

const createCashoutRecord = async (
  type: CashoutType,
  totalAmount: number,
  totalOrders: number,
  startDate: string,
  endDate: string,
): Promise<Cashout> => {
  try {
    console.log('Creating cashout record:', {
      type,
      totalAmount,
      totalOrders,
      startDate,
      endDate,
    });

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
  } catch (error) {
    console.error('Error in createCashoutRecord:', error);
    throw error;
  }
};

const linkOrdersToCashout = async (
  cashoutId: number,
  orders: OrderItem[],
): Promise<void> => {
  try {
    const cashoutOrders = orders.map(order => ({
      cashout_id: cashoutId,
      order_id: order.id,
    }));

    console.log('Linking orders to cashout:', {
      cashoutId,
      orderCount: orders.length,
      cashoutOrders,
    });

    const {error} = await supabase
      .from('cashouts_orders')
      .insert(cashoutOrders);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error in linkOrdersToCashout:', error);
    throw error;
  }
};

export const generateCashout = async (type: CashoutType): Promise<Cashout> => {
  try {
    // 1. Obtener la fecha del último corte
    const lastCashoutDate = await getLastCashoutDate();

    // 2. Obtener órdenes pendientes
    const orders = await getPendingOrders(lastCashoutDate);

    // Validar si hay órdenes pendientes
    if (orders.length === 0) {
      throw new Error('No hay órdenes pendientes para generar el corte');
    }

    // 3. Usar la primera y última fecha de las órdenes como rango
    const startDate = orders[0].created_at;
    const endDate = orders[orders.length - 1].created_at;

    console.log('Generating cashout with dates:', {
      lastCashoutDate,
      startDate,
      endDate,
      ordersCount: orders.length,
    });

    // 4. Calcular totales
    const totalAmount = orders.reduce(
      (sum, order) => sum + order.total_amount,
      0,
    );

    // 5. Crear el corte de caja
    const cashout = await createCashoutRecord(
      type,
      totalAmount,
      orders.length,
      startDate,
      endDate,
    );

    // 6. Relacionar órdenes con el corte
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

export const deleteCashout = async (cashoutId: number): Promise<void> => {
  try {
    // 1. Eliminar las relaciones en cashouts_orders
    const {error: relationsError} = await supabase
      .from('cashouts_orders')
      .delete()
      .eq('cashout_id', cashoutId);

    if (relationsError) {
      throw relationsError;
    }

    // 2. Eliminar el corte de caja
    const {error: cashoutError} = await supabase
      .from('cashouts')
      .delete()
      .eq('id', cashoutId);

    if (cashoutError) {
      throw cashoutError;
    }
  } catch (error) {
    console.error('Error deleting cashout:', error);
    throw error;
  }
};
