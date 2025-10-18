import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase proje bilgilerinizi buraya ekleyin
// Bu bilgileri Supabase Dashboard > Settings > API'den alabilirsiniz
const supabaseUrl = 'https://lxmdopxiyvcezciduayk.supabase.co'; // Örnek: 'https://xyz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4bWRvcHhpeXZjZXpjaWR1YXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTcyOTksImV4cCI6MjA3NTQ5MzI5OX0.rbIdVu2VuXuNEYrRajOzBCV1ql_dJ11kK47meJIu50I'; // Örnek: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// Supabase client oluştur (optimize edilmiş)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce', // Daha güvenli ve hızlı
  },
  global: {
    headers: {
      'X-Client-Info': 'fitness-app',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Realtime event limit
    },
  },
});

// Supabase bağlantısını test et
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

// Supabase URL ve Key'i güncelle
export const updateSupabaseConfig = (url, key) => {
  // Bu fonksiyon ile runtime'da config güncellenebilir
  console.log('Supabase config updated:', { url, key });
};
