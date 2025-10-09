import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

// Device ID'yi al veya oluştur
export const getOrCreateDeviceId = async () => {
  try {
    // Önce local storage'dan device ID'yi kontrol et
    let deviceId = await AsyncStorage.getItem('device_id');
    
    if (!deviceId) {
      // Device ID yoksa yeni bir tane oluştur
      deviceId = generateUUID();
      await AsyncStorage.setItem('device_id', deviceId);
      
      console.log('Yeni device ID oluşturuldu:', deviceId);
      
      // Supabase'de kullanıcı oluştur (eğer bağlantı varsa)
      try {
        console.log('Supabase kullanıcı oluşturma deneniyor...');
        await createUserInSupabase(deviceId);
        console.log('✅ Supabase kullanıcı başarıyla oluşturuldu');
      } catch (error) {
        console.warn('⚠️ Supabase kullanıcı oluşturulamadı, offline mod:', error);
        // Offline mod için devam et
      }
    } else {
      console.log('Mevcut device ID bulundu:', deviceId);
      
      // Supabase'de kullanıcı var mı kontrol et
      try {
        console.log('Supabase kullanıcı kontrolü yapılıyor...');
        await ensureUserExistsInSupabase(deviceId);
        console.log('✅ Supabase kullanıcı kontrolü başarılı');
      } catch (error) {
        console.warn('⚠️ Supabase kullanıcı kontrolü başarısız, offline mod:', error);
        // Offline mod için devam et
      }
    }
    
    return deviceId;
  } catch (error) {
    console.error('Device ID oluşturma hatası:', error);
    // Hata durumunda fallback UUID döndür
    const fallbackId = generateUUID();
    await AsyncStorage.setItem('device_id', fallbackId);
    return fallbackId;
  }
};

// UUID oluştur
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Supabase'de kullanıcı oluştur
export const createUserInSupabase = async (deviceId) => {
  try {
    // Önce kullanıcının var olup olmadığını kontrol et
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (existingUser) {
      return existingUser;
    }

    // RPC fonksiyonunu kullan
    const { data: rpcUserId, error: rpcError } = await supabase.rpc('create_user_if_not_exists', {
      device_id_param: deviceId
    });

    if (rpcError) {
      // RPC başarısızsa, direkt insert dene
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            device_id: deviceId,
            name: 'Kullanıcı',
            current_weight: 70.0,
            target_weight: 65.0,
            age: 25,
            height: 180,
            is_dark_mode: true,
            notifications_enabled: true
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      return insertData;
    }

    // RPC başarılı, user'ı çek
    const { data: createdUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', rpcUserId)
      .single();

    if (fetchError) {
      return { id: rpcUserId, device_id: deviceId };
    }

    return createdUser;
  } catch (error) {
    console.error('createUserInSupabase hatası:', error.message);
    throw error;
  }
};

// Supabase'de kullanıcının var olduğundan emin ol
const ensureUserExistsInSupabase = async (deviceId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Kullanıcı bulunamadı, oluştur
      await createUserInSupabase(deviceId);
    } else if (error) {
      throw error;
    } else {
      console.log('Supabase kullanıcı mevcut:', data);
    }
  } catch (error) {
    console.log('⚠️ Supabase kullanıcı kontrolü hatası (normal):', error.message);
    throw error;
  }
};

// Device ID'yi temizle (geliştirme için)
export const clearDeviceId = async () => {
  try {
    await AsyncStorage.removeItem('device_id');
    console.log('Device ID temizlendi');
  } catch (error) {
    console.error('Device ID temizleme hatası:', error);
  }
};

// Device ID'yi al (oluşturmadan)
export const getDeviceId = async () => {
  try {
    return await AsyncStorage.getItem('device_id');
  } catch (error) {
    console.error('Device ID alma hatası:', error);
    return null;
  }
};

// Kullanıcı bilgilerini Supabase'den al
export const getUserFromSupabase = async (deviceId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle(); // .single() yerine .maybeSingle() kullan

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Kullanıcı bilgileri alma hatası:', error);
    return null;
  }
};

// Kullanıcı bilgilerini Supabase'e güncelle
export const updateUserInSupabase = async (deviceId, updates) => {
  try {
    // Önce kullanıcının var olduğundan emin ol
    const userExists = await getUserFromSupabase(deviceId);
    if (!userExists) {
      // Kullanıcı yoksa oluştur
      await createUserInSupabase(deviceId);
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('device_id', deviceId)
      .select();

    if (error) {
      throw error;
    }

    console.log('Kullanıcı bilgileri güncellendi:', data);
    return data;
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    throw error;
  }
};
