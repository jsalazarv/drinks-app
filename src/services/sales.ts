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

export const saveSale = async (items: Omit<OrderItem, 'id' | 'order_id'>[]) => {
  try {
    // Calcular el total de la orden
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    // 1. Crear la orden
    const {data: orderData, error: orderError} = await supabase
      .from('orders')
      .insert({total_amount: totalAmount})
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
