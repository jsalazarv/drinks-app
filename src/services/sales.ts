import {supabase} from '../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';

export type DrinkType = 'half' | 'one';

export interface OrderItem {
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

let ordersSubscription: RealtimeChannel | null = null;

export const subscribeToOrders = (
  onOrdersUpdate: (orders: Order[]) => void,
) => {
  // Limpiar suscripción anterior si existe
  if (ordersSubscription) {
    ordersSubscription.unsubscribe();
  }

  // Crear nueva suscripción
  ordersSubscription = supabase
    .channel('orders-channel')
    .on(
      'postgres_changes',
      {
        event: '*', // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'orders',
      },
      async () => {
        // Cuando hay un cambio, obtener todas las órdenes actualizadas
        const orders = await getOrders();
        onOrdersUpdate(orders);
      },
    )
    .subscribe();

  return () => {
    if (ordersSubscription) {
      ordersSubscription.unsubscribe();
      ordersSubscription = null;
    }
  };
};

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

export const getOrderById = async (orderId: number): Promise<Order | null> => {
  try {
    // Obtener la orden
    const {data: order, error: orderError} = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw orderError;
    }
    if (!order) {
      return null;
    }

    // Obtener los items de la orden
    const {data: items, error: itemsError} = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) {
      throw itemsError;
    }

    return {
      ...order,
      items,
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const updateOrder = async (
  orderId: number,
  items: OrderItem[],
  fee: number = 0,
  tip: number = 0,
): Promise<Order> => {
  try {
    // Calcular el nuevo total
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subtotal + fee + tip;

    // 1. Actualizar la orden
    const {data: orderData, error: orderError} = await supabase
      .from('orders')
      .update({
        total_amount: totalAmount,
        fee,
        tip,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // 2. Eliminar items anteriores
    const {error: deleteError} = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (deleteError) {
      throw deleteError;
    }

    // 3. Crear nuevos items
    const orderItems = items.map(item => ({
      ...item,
      order_id: orderId,
    }));

    const {data: itemsData, error: itemsError} = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      throw itemsError;
    }

    return {
      ...orderData,
      items: itemsData,
    };
  } catch (error) {
    console.error('Error updating order:', error);
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

    if (ordersError) {
      throw ordersError;
    }

    // 2. Obtener los items para cada orden
    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const {data: items, error: itemsError} = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) {
          throw itemsError;
        }

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

export const deleteOrder = async (orderId: number): Promise<void> => {
  try {
    // First, delete the order items
    const {error: itemsError} = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (itemsError) {
      throw itemsError;
    }

    // Then, delete the order itself
    const {error: orderError} = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (orderError) {
      throw orderError;
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};
