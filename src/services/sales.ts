import {supabase} from '../lib/supabase';

export type DrinkType = 'half' | 'one';

interface OrderItem {
  id?: number;
  order_id?: number;
  drink_type: DrinkType;
  count: number;
  price: number;
  total: number;
}

export interface Order {
  id: number;
  total_amount: number;
  fee: number;
  tip: number;
  created_at: string;
  items?: OrderItem[];
}

export const saveSale = async (
  items: Omit<OrderItem, 'id' | 'order_id'>[],
  fee: number = 0,
  tip: number = 0,
) => {
  try {
    // Calcular el total de la orden
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subtotal + fee + tip;

    // 1. Crear la orden
    const {data: orderData, error: orderError} = await supabase
      .from('orders')
      .insert({
        total_amount: totalAmount,
        fee: fee,
        tip: tip,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // 2. Crear los items de la orden
    const orderItems = items.map(item => ({
      ...item,
      order_id: orderData.id,
    }));

    const {data: itemsData, error: itemsError} = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }

    return {
      ...orderData,
      items: itemsData,
    };
  } catch (error) {
    console.error('Error saving sale:', error);
    throw error;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    // 1. Obtener las órdenes
    const {data: orders, error: ordersError} = await supabase
      .from('orders')
      .select('*')
      .order('created_at', {ascending: false});

    if (ordersError) throw ordersError;

    // 2. Obtener los items para cada orden
    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const {data: items, error: itemsError} = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) throw itemsError;

        return {
          ...order,
          items,
        };
      }),
    );

    return ordersWithItems;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};
