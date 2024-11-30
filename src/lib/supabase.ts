import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://faejchfopgqttzbtrnqq.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZWpjaGZvcGdxdHR6YnRybnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwMDEwNDksImV4cCI6MjA0ODU3NzA0OX0._MHfUvz5rFKZjtnPOEreOxbO2SfFuoPk9coKky7Kn4s';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
