// ============================================
// ÇEREZ VE CACHE TEMİZLEME UTİLİTY'Sİ
// Bu dosya test verilerini ve çerezleri temizler
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

export const cleanupTestData = async () => {
  try {
    console.log('🧹 Test verileri temizleniyor...');

    // 1) AsyncStorage'daki tüm verileri temizle
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage temizlendi');

    // 2) Supabase session'ını temizle
    await supabase.auth.signOut();
    console.log('✅ Supabase session temizlendi');

    // 3) Cache'i temizle (eğer varsa)
    if (global.clearCache) {
      global.clearCache();
      console.log('✅ Cache temizlendi');
    }

    // 4) Local storage'ı temizle
    if (global.localStorage) {
      global.localStorage.clear();
      console.log('✅ Local storage temizlendi');
    }

    console.log('🎉 Tüm test verileri temizlendi!');
    return true;

  } catch (error) {
    console.error('❌ Temizlik hatası:', error);
    return false;
  }
};

// Sadece belirli verileri temizle
export const cleanupSpecificData = async (keys) => {
  try {
    console.log('🧹 Belirli veriler temizleniyor...');

    for (const key of keys) {
      await AsyncStorage.removeItem(key);
      console.log(`✅ ${key} temizlendi`);
    }

    console.log('🎉 Belirli veriler temizlendi!');
    return true;

  } catch (error) {
    console.error('❌ Temizlik hatası:', error);
    return false;
  }
};

// Kullanıcı çıkışı yaparken temizlik
export const cleanupOnLogout = async () => {
  try {
    console.log('🚪 Çıkış yapılırken temizlik...');

    // Sadece kullanıcı verilerini temizle, ayarları koru
    const keysToRemove = [
      'userToken',
      'userData',
      'userProfile',
      'workoutData',
      'dietData',
      'trackingData',
      'subscriptionData'
    ];

    await cleanupSpecificData(keysToRemove);
    await supabase.auth.signOut();

    console.log('✅ Çıkış temizliği tamamlandı');
    return true;

  } catch (error) {
    console.error('❌ Çıkış temizlik hatası:', error);
    return false;
  }
};

// Test modunda çalıştır
export const runTestCleanup = async () => {
  if (__DEV__) {
    console.log('🧪 Test modunda temizlik çalıştırılıyor...');
    return await cleanupTestData();
  } else {
    console.log('⚠️ Test temizliği sadece development modunda çalışır');
    return false;
  }
};

// Belirli kullanıcıyı koruyarak temizlik
export const cleanupKeepSpecificUser = async (userId) => {
  try {
    console.log(`🧹 Kullanıcı ${userId} korunarak temizlik yapılıyor...`);

    // Sadece belirli kullanıcıya ait olmayan verileri temizle
    const keysToRemove = [
      'tempWorkoutData',
      'tempDietData', 
      'tempTrackingData',
      'cachedUserData'
    ];

    await cleanupSpecificData(keysToRemove);
    
    // Supabase'den çıkış yap ama kullanıcı verilerini koru
    await supabase.auth.signOut();
    
    console.log(`✅ Kullanıcı ${userId} korunarak temizlik tamamlandı`);
    return true;

  } catch (error) {
    console.error('❌ Kullanıcı koruma temizlik hatası:', error);
    return false;
  }
};

// Production'da sadece gerekli temizlik
export const runProductionCleanup = async () => {
  console.log('🏭 Production temizliği çalıştırılıyor...');
  
  // Sadece eski cache'leri temizle
  const oldCacheKeys = [
    'oldWorkoutData',
    'oldDietData',
    'oldTrackingData'
  ];

  return await cleanupSpecificData(oldCacheKeys);
};
