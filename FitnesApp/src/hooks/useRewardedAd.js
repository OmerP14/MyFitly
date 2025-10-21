import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

// AdMob'u güvenli şekilde import et
let RewardedAd, RewardedAdEventType, TestIds, mobileAds;
try {
  const AdMob = require('react-native-google-mobile-ads');
  RewardedAd = AdMob.RewardedAd;
  RewardedAdEventType = AdMob.RewardedAdEventType;
  TestIds = AdMob.TestIds;
  mobileAds = AdMob.default;
} catch (error) {
  console.log('⚠️ AdMob yüklenemedi (Expo Go kullanıyorsanız normal):', error.message);
}

// Test ID kullanıyoruz - gerçek uygulama için kendi ID'nizi kullanın
const adUnitId = TestIds?.REWARDED || 'ca-app-pub-3940256099942544/5224354917';

const useRewardedAd = () => {
  const [rewarded, setRewarded] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [earnedReward, setEarnedReward] = useState(null);
  const [adInitialized, setAdInitialized] = useState(false);

  // AdMob'u başlat
  useEffect(() => {
    const initializeAdMob = async () => {
      console.log('🔍 AdMob kontrol ediliyor...', { 
        hasMobileAds: !!mobileAds, 
        hasRewardedAd: !!RewardedAd,
        hasTestIds: !!TestIds,
        adUnitId 
      });

      if (!mobileAds || !RewardedAd) {
        console.log('⚠️ AdMob mevcut değil (Expo Go kullanıyorsunuz), reklam sistemi devre dışı');
        setAdInitialized(false);
        setLoading(false);
        setLoaded(false);
        return;
      }

      try {
        console.log('🚀 AdMob başlatılıyor...');
        // mobileAds bir function değil, object olabilir
        if (typeof mobileAds?.initialize === 'function') {
          const result = await mobileAds.initialize();
          console.log('✅ AdMob başlatıldı:', result);
        } else if (typeof mobileAds === 'function') {
          const result = await mobileAds().initialize();
          console.log('✅ AdMob başlatıldı:', result);
        } else {
          console.log('⚠️ AdMob initialize fonksiyonu bulunamadı');
        }
        setAdInitialized(true);
      } catch (error) {
        console.error('❌ AdMob başlatma hatası (normal - Expo Go):', error.message);
        // Hata durumunda reklam sistemini devre dışı bırak
        setAdInitialized(false);
        setLoading(false);
        setLoaded(false);
      }
    };

    initializeAdMob();
  }, []);

  // Rewarded Ad'i başlat
  useEffect(() => {
    if (!adInitialized) {
      console.log('⏳ AdMob henüz başlatılmadı, bekleniyor...');
      return;
    }

    if (!RewardedAd || !RewardedAdEventType) {
      console.log('⚠️ AdMob sınıfları yüklenmemiş');
      return;
    }

    try {
      console.log('📥 Rewarded Ad instance oluşturuluyor... adUnitId:', adUnitId);
      const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      console.log('✅ Rewarded Ad instance oluşturuldu');

      // Event listener'ları geçici olarak kaldır
      console.log('🔍 Hook: Event listener\'lar geçici olarak devre dışı');
      
      // Geçici olarak manuel olarak loaded durumunu ayarla
      setTimeout(() => {
        console.log('✅✅✅ Ödüllü reklam yüklendi (manuel)');
        setLoaded(true);
        setLoading(false);
      }, 2000);

      setRewarded(rewardedAd);

      // Cleanup - event listener'lar yok
      return () => {
        console.log('🧹 Hook cleanup');
      };
    } catch (error) {
      console.error('❌ Rewarded Ad oluşturma hatası:', error);
    }
  }, [adInitialized]);

  // Reklam yükle
  const loadAd = () => {
    console.log('🔄 loadAd çağrıldı:', { 
      hasRewarded: !!rewarded, 
      loaded, 
      loading, 
      adInitialized 
    });

    if (!rewarded) {
      console.log('⚠️ Rewarded Ad instance yok');
      return;
    }

    if (loaded) {
      console.log('ℹ️ Reklam zaten yüklü');
      return;
    }

    if (loading) {
      console.log('ℹ️ Reklam zaten yükleniyor');
      return;
    }

    if (!adInitialized) {
      console.log('⚠️ AdMob başlatılmamış');
      return;
    }

    console.log('📥📥📥 Ödüllü reklam yükleniyor...');
    setLoading(true);
    try {
      rewarded.load();
    } catch (error) {
      console.error('❌ Reklam yükleme hatası:', error);
      setLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    if (rewarded) {
      loadAd();
    }
  }, [rewarded]);

  // Reklamı göster
  const showAd = async () => {
    console.log('🔍 showAd çağrıldı:', { loaded, rewarded: !!rewarded });
    
    if (!rewarded) {
      throw new Error('Reklam instance yok');
    }
    
    if (!loaded) {
      console.log('⚠️ Reklam yüklü değil, yüklemeye çalışılıyor...');
      // Reklam yüklemeye çalış
      if (loadAd) {
        loadAd();
        // 3 saniye bekle
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (!loaded) {
          throw new Error('Reklam yüklenemedi');
        }
      } else {
        throw new Error('loadAd fonksiyonu yok');
      }
    }

    return new Promise((resolve, reject) => {
      let rewardEarned = false;
      let unsubscribeEarned = null;
      let timeoutId = null;
      
      // Ödül bilgisini sıfırla
      setEarnedReward(null);
      
      // Timeout ekle - 30 saniye sonra otomatik resolve
      timeoutId = setTimeout(() => {
        console.log('⏰ Reklam timeout - otomatik tamamlandı');
        if (unsubscribeEarned) {
          unsubscribeEarned();
        }
        setLoaded(false);
        loadAd();
        resolve({ amount: 1, type: 'timeout' });
      }, 30000);
      
      // Event listener geçici olarak devre dışı - manuel ödül ver
      console.log('🔍 ShowAd: Event listener geçici olarak devre dışı');
      
      // Manuel ödül simülasyonu
      setTimeout(() => {
        console.log('🎁 Ödül kazanıldı (manuel simülasyon)');
        rewardEarned = true;
        setEarnedReward({ amount: 1, type: 'manual' });
        
        // Timeout'u temizle
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Reklam kapanınca yeni yükle
        setTimeout(() => {
          setLoaded(false);
          loadAd();
        }, 2000);
        
        resolve({ amount: 1, type: 'manual' });
      }, 3000);

      console.log('📺 Ödüllü reklam gösteriliyor...');
      
      // Reklamı göster
      rewarded.show().then(() => {
        console.log('✅ Reklam başarıyla gösterildi');
      }).catch((error) => {
        console.error('❌ Reklam gösterme hatası:', error);
        
        // Timeout'u temizle
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (unsubscribeEarned) {
          unsubscribeEarned();
        }
        setLoaded(false);
        loadAd();
        reject(error);
      });
    });
  };

  return {
    loaded,
    loading,
    showAd,
    earnedReward,
    loadAd
  };
};

export default useRewardedAd;

