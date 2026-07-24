import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase proje bilgileri ortam değişkenlerinden okunur.
// Yerel geliştirme için: MyFitly/.env dosyasına
//   EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
// değerlerini ekleyin (bkz. .env.example). Bu değişkenler Supabase
// Dashboard > Settings > API üzerinden alınabilir.
const envSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const envSupabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(envSupabaseUrl && envSupabaseKey);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase yapılandırması eksik. EXPO_PUBLIC_SUPABASE_URL ve ' +
    'EXPO_PUBLIC_SUPABASE_ANON_KEY ortam değişkenlerini .env dosyasında ' +
    'tanımlayın (bkz. .env.example). Uygulama açılacak ancak auth/veri ' +
    'işlemleri başarısız olacaktır.'
  );
}

// createClient() throws synchronously if given an empty URL/key, which would
// crash the app at import time. Fall back to harmless placeholders so the
// app can still boot (and show the warning above / fail gracefully on each
// network call) when env vars haven't been configured yet.
const supabaseUrl = envSupabaseUrl || 'https://placeholder.supabase.co';
const supabaseKey = envSupabaseKey || 'placeholder-anon-key';

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
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

// Supabase URL ve Key'i güncelle
export const updateSupabaseConfig = (url, key) => {
  // Bu fonksiyon ile runtime'da config güncellenebilir
};
