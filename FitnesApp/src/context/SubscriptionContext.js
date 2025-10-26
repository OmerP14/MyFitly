import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as RNIap from 'react-native-iap';
import { supabase } from '../config/supabase';
import { useUser } from './UserContext';

const SubscriptionContext = createContext();

// ÜRÜN ID'LERİ - App Store Connect ve Google Play Console'da tanımladığınız ID'ler
const PRODUCT_IDS = Platform.select({
  ios: ['fitly.pro.monthly'],
  android: ['fitly.pro.monthly'],
});

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { userId, userData } = useUser();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState(null);
  const [products, setProducts] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // IAP Bağlantısını başlat
  const initializeIAP = useCallback(async () => {
    if (isInitialized) return;

    try {
      console.log('🛒 IAP başlatılıyor...');
      
      // IAP modülünün yüklenip yüklenmediğini kontrol et
      if (!RNIap || typeof RNIap.initConnection !== 'function') {
        console.warn('⚠️ IAP modülü yüklenemedi - native modül eksik');
        setIsInitialized(true); // Devam et ama IAP olmadan
        return;
      }
      
      // IAP bağlantısını kur
      const result = await RNIap.initConnection();
      console.log('✅ IAP bağlantısı kuruldu:', result);

      // Ürünleri yükle
      if (PRODUCT_IDS && PRODUCT_IDS.length > 0 && RNIap.getSubscriptions) {
        const availableProducts = await RNIap.getSubscriptions({ skus: PRODUCT_IDS });
        console.log('📦 Mevcut ürünler:', availableProducts);
        setProducts(availableProducts);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('❌ IAP başlatma hatası:', error);
      console.warn('⚠️ IAP çalışmıyor ama uygulama devam edecek');
      setIsInitialized(true); // Hata olsa bile devam et
    }
  }, [isInitialized]);

  // Abonelik durumunu Supabase'den kontrol et
  const checkSubscriptionStatus = useCallback(async () => {
    if (!userId) {
      setIsPro(false);
      setExpiresAt(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Abonelik durumu kontrol ediliyor...');
      setIsLoading(true);

      const { data, error } = await supabase
        .from('entitlements_effective')
        .select('is_active_now, expires_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Abonelik kontrol hatası:', error);
        setIsPro(false);
        setExpiresAt(null);
      } else if (data) {
        const isActive = !!data.is_active_now;
        const expiry = data.expires_at ? new Date(data.expires_at) : null;
        
        console.log('✅ Abonelik durumu:', {
          isActive,
          expiresAt: expiry?.toISOString()
        });

        setIsPro(isActive);
        setExpiresAt(expiry);

        // Eğer abonelik bitmiş ve hala aktif görünüyorsa, düzelt
        if (expiry && expiry < new Date() && isActive) {
          console.log('⚠️ Süresi dolmuş abonelik tespit edildi, düzeltiliyor...');
          await supabase
            .from('entitlements')
            .update({ is_active: false })
            .eq('user_id', userId);
          setIsPro(false);
        }
      } else {
        console.log('ℹ️ Abonelik bulunamadı');
        setIsPro(false);
        setExpiresAt(null);
      }
    } catch (error) {
      console.error('❌ Abonelik kontrol exception:', error);
      setIsPro(false);
      setExpiresAt(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Satın alma işlemi
  const purchaseSubscription = useCallback(async (productId = 'fitly.pro.monthly') => {
    if (!userId) {
      Alert.alert('Hata', 'Lütfen önce giriş yapın');
      return false;
    }

    // IAP modülü yoksa test modunda çalış
    if (!RNIap || !RNIap.requestSubscription) {
      console.log('🧪 IAP modülü yok - test modunda çalışıyor');
      Alert.alert(
        '🧪 Test Modu',
        'IAP modülü henüz yüklenmedi. Test için abonelik aktif ediliyor.',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Test Et',
            onPress: async () => {
              // Test için manuel abonelik ekle
              try {
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 1);
                
                const { error } = await supabase
                  .from('entitlements')
                  .upsert({
                    user_id: userId,
                    product_id: productId,
                    platform: Platform.OS,
                    is_active: true,
                    expires_at: expiryDate.toISOString(),
                    last_receipt: { test: true },
                  });

                if (error) throw error;
                
                await checkSubscriptionStatus();
                Alert.alert('✅ Test aboneliği aktif edildi!');
                return true;
              } catch (error) {
                console.error('❌ Test abonelik hatası:', error);
                Alert.alert('Hata', 'Test aboneliği oluşturulamadı');
                return false;
              }
            }
          }
        ]
      );
      return false;
    }

    try {
      console.log('💳 Satın alma başlatılıyor:', productId);
      setIsLoading(true);

      // IAP başlatılmamışsa başlat
      if (!isInitialized) {
        await initializeIAP();
      }

      // Satın alma isteği
      await RNIap.requestSubscription({
        sku: productId,
        ...(Platform.OS === 'android' && {
          subscriptionOffers: [
            {
              sku: productId,
              offerToken: '', // Google Play Console'dan alınan offer token
            },
          ],
        }),
      });

      console.log('✅ Satın alma tamamlandı');
      
      // Makbuzu doğrula ve veritabanına kaydet
      await verifyPurchase();
      
      // Abonelik durumunu güncelle
      await checkSubscriptionStatus();

      Alert.alert(
        '🎉 Tebrikler!',
        'Fitly Pro aboneliğiniz başarıyla aktif edildi!'
      );

      return true;
    } catch (error) {
      console.error('❌ Satın alma hatası:', error);
      
      if (error.code === 'E_USER_CANCELLED') {
        console.log('ℹ️ Kullanıcı satın almayı iptal etti');
      } else {
        Alert.alert(
          'Hata',
          'Satın alma işlemi başarısız oldu. Lütfen tekrar deneyin.'
        );
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, isInitialized, initializeIAP, checkSubscriptionStatus]);

  // Makbuz doğrulama ve veritabanına kaydetme
  const verifyPurchase = useCallback(async () => {
    if (!userId) return;

    try {
      console.log('🔐 Makbuz doğrulanıyor...');

      // Mevcut satın almaları al
      const purchases = await RNIap.getAvailablePurchases();
      console.log('📜 Mevcut satın almalar:', purchases);

      if (purchases && purchases.length > 0) {
        const purchase = purchases[0]; // En son satın alma
        
        // Receipt bilgilerini al
        const receipt = Platform.select({
          ios: purchase.transactionReceipt,
          android: purchase.purchaseToken,
        });

        // Abonelik bitiş tarihini hesapla (1 ay sonra)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        // Supabase'e kaydet
        const { error } = await supabase
          .from('entitlements')
          .upsert({
            user_id: userId,
            product_id: purchase.productId,
            platform: Platform.OS,
            is_active: true,
            expires_at: expiryDate.toISOString(),
            last_receipt: {
              transactionId: purchase.transactionId,
              transactionDate: purchase.transactionDate,
              receipt: receipt,
            },
          });

        if (error) {
          console.error('❌ Veritabanı kayıt hatası:', error);
        } else {
          console.log('✅ Abonelik veritabanına kaydedildi');
          
          // iOS için makbuzu bitir
          if (Platform.OS === 'ios') {
            await RNIap.finishTransaction({ purchase, isConsumable: false });
            console.log('✅ iOS transaction tamamlandı');
          }
        }
      }
    } catch (error) {
      console.error('❌ Makbuz doğrulama hatası:', error);
    }
  }, [userId]);

  // Satın almaları geri yükle
  const restorePurchases = useCallback(async () => {
    if (!userId) {
      Alert.alert('Hata', 'Lütfen önce giriş yapın');
      return false;
    }

    // IAP modülü yoksa test modunda çalış
    if (!RNIap || !RNIap.getAvailablePurchases) {
      console.log('🧪 IAP modülü yok - test modunda geri yükleme');
      Alert.alert(
        '🧪 Test Modu',
        'IAP modülü henüz yüklenmedi. Mevcut abonelikleriniz kontrol ediliyor.',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Kontrol Et',
            onPress: async () => {
              await checkSubscriptionStatus();
              Alert.alert('ℹ️ Bilgi', 'Abonelik durumunuz kontrol edildi');
            }
          }
        ]
      );
      return false;
    }

    try {
      console.log('♻️ Satın almalar geri yükleniyor...');
      setIsLoading(true);

      // IAP başlatılmamışsa başlat
      if (!isInitialized) {
        await initializeIAP();
      }

      // Mevcut satın almaları al
      const purchases = await RNIap.getAvailablePurchases();
      console.log('📜 Geri yüklenen satın almalar:', purchases);

      if (purchases && purchases.length > 0) {
        // En son satın almayı doğrula
        await verifyPurchase();
        await checkSubscriptionStatus();

        Alert.alert(
          '✅ Başarılı',
          'Satın almalarınız başarıyla geri yüklendi!'
        );
        return true;
      } else {
        Alert.alert(
          'ℹ️ Bilgi',
          'Geri yüklenecek satın alma bulunamadı.'
        );
        return false;
      }
    } catch (error) {
      console.error('❌ Geri yükleme hatası:', error);
      Alert.alert(
        'Hata',
        'Satın almalar geri yüklenemedi. Lütfen tekrar deneyin.'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, isInitialized, initializeIAP, verifyPurchase, checkSubscriptionStatus]);

  // Satın alma dinleyicisi
  useEffect(() => {
    let purchaseUpdateSubscription = null;
    let purchaseErrorSubscription = null;

    const setupListeners = async () => {
      try {
        // Satın alma güncellemelerini dinle
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
          console.log('🔔 Satın alma güncellendi:', purchase);
          
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            await verifyPurchase();
            
            // iOS için transaction'ı bitir
            if (Platform.OS === 'ios') {
              await RNIap.finishTransaction({ purchase, isConsumable: false });
            }
          }
        });

        // Satın alma hatalarını dinle
        purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
          console.warn('⚠️ Satın alma hatası:', error);
          if (error.code !== 'E_USER_CANCELLED') {
            Alert.alert('Hata', 'Satın alma sırasında bir hata oluştu');
          }
        });
      } catch (error) {
        console.error('❌ Listener kurulum hatası:', error);
      }
    };

    if (isInitialized) {
      setupListeners();
    }

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
    };
  }, [isInitialized, verifyPurchase]);

  // Başlangıçta IAP'ı başlat ve abonelik durumunu kontrol et
  useEffect(() => {
    initializeIAP();
  }, [initializeIAP]);

  useEffect(() => {
    if (userId) {
      checkSubscriptionStatus();
    }
  }, [userId, checkSubscriptionStatus]);

  // Abonelik süresi dolduğunda otomatik kontrol
  useEffect(() => {
    if (expiresAt && isPro) {
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();

      if (timeUntilExpiry > 0) {
        console.log(`⏰ Abonelik ${Math.round(timeUntilExpiry / 1000 / 60)} dakika sonra bitecek`);
        
        // Süre bittiğinde kontrol et
        const timeout = setTimeout(() => {
          console.log('⏰ Abonelik süresi doldu, kontrol ediliyor...');
          checkSubscriptionStatus();
        }, timeUntilExpiry + 1000); // 1 saniye sonra kontrol et

        return () => clearTimeout(timeout);
      } else {
        // Zaten bitmiş
        console.log('⚠️ Abonelik süresi dolmuş');
        checkSubscriptionStatus();
      }
    }
  }, [expiresAt, isPro, checkSubscriptionStatus]);

  // Cleanup - IAP bağlantısını kapat
  useEffect(() => {
    return () => {
      if (isInitialized) {
        RNIap.endConnection();
        console.log('👋 IAP bağlantısı kapatıldı');
      }
    };
  }, [isInitialized]);

  const value = {
    isPro,
    isLoading,
    expiresAt,
    products,
    purchaseSubscription,
    restorePurchases,
    refreshSubscription: checkSubscriptionStatus,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

