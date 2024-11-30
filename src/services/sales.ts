import {supabase} from '../lib/supabase';

export type DrinkType = 'half' | 'one';

interface Sale {
  id?: number;
  drink_type: DrinkType;
  count: number;
  price: number;
  total: number;
  created_at?: string;
}

export const saveSale = async (sales: Omit<Sale, 'id' | 'created_at'>[]) => {
  try {
    const {data, error} = await supabase.from('sales').insert(sales).select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving sale:', error);
    throw error;
  }
};
