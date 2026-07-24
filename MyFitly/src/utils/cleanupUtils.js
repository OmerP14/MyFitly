// ============================================
// ÇEREZ VE CACHE TEMİZLEME UTİLİTY'Sİ
// Bu dosya test verilerini ve çerezleri temizler
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

export const cleanupTestData = async () => {
  try {

    // 1) AsyncStorage'daki tüm verileri temizle
    await AsyncStorage.clear();

    // 2) Supabase session'ını temizle
    await supabase.auth.signOut();

    // 3) Cache'i temizle (eğer varsa)
    if (global.clearCache) {
      global.clearCache();
    }

    // 4) Local storage'ı temizle
    if (global.localStorage) {
      global.localStorage.clear();
    }

    return true;

  } catch (error) {
    console.error('❌ Temizlik hatası:', error);
    return false;
  }
};

// Sadece belirli verileri temizle
export const cleanupSpecificData = async (keys) => {
  try {

    for (const key of keys) {
      await AsyncStorage.removeItem(key);
    }

    return true;

  } catch (error) {
    console.error('❌ Temizlik hatası:', error);
    return false;
  }
};

// Kullanıcı çıkışı yaparken temizlik
export const cleanupOnLogout = async () => {
  try {

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

    return true;

  } catch (error) {
    console.error('❌ Çıkış temizlik hatası:', error);
    return false;
  }
};

// Test modunda çalıştır
export const runTestCleanup = async () => {
  if (__DEV__) {
    return await cleanupTestData();
  } else {
    return false;
  }
};

// Belirli kullanıcıyı koruyarak temizlik
export const cleanupKeepSpecificUser = async (userId) => {
  try {

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
    
    return true;

  } catch (error) {
    console.error('❌ Kullanıcı koruma temizlik hatası:', error);
    return false;
  }
};

// Production'da sadece gerekli temizlik
export const runProductionCleanup = async () => {
  
  // Sadece eski cache'leri temizle
  const oldCacheKeys = [
    'oldWorkoutData',
    'oldDietData',
    'oldTrackingData'
  ];

  return await cleanupSpecificData(oldCacheKeys);
};
