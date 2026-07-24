import { useState, useEffect } from 'react';

// AdMob'u güvenli şekilde import et
let RewardedAd, RewardedAdEventType, TestIds, mobileAds;
try {
  const AdMob = require('react-native-google-mobile-ads');
  RewardedAd = AdMob.RewardedAd;
  RewardedAdEventType = AdMob.RewardedAdEventType;
  TestIds = AdMob.TestIds;
  mobileAds = AdMob.default;
} catch (error) {
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
        setAdInitialized(false);
        setLoading(false);
        setLoaded(false);
        return;
      }

      try {
        // mobileAds bir function değil, object olabilir
        if (typeof mobileAds?.initialize === 'function') {
          const result = await mobileAds.initialize();
        } else if (typeof mobileAds === 'function') {
          const result = await mobileAds().initialize();
        } else {
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
      return;
    }

    if (!RewardedAd || !RewardedAdEventType) {
      return;
    }

    try {
      const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });


      // Event listener'ları geçici olarak kaldır
      
      // Geçici olarak manuel olarak loaded durumunu ayarla
      setTimeout(() => {
        setLoaded(true);
        setLoading(false);
      }, 2000);

      setRewarded(rewardedAd);

      // Cleanup - event listener'lar yok
      return () => {
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
      return;
    }

    if (loaded) {
      return;
    }

    if (loading) {
      return;
    }

    if (!adInitialized) {
      return;
    }

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
    
    if (!rewarded) {
      throw new Error('Reklam instance yok');
    }
    
    if (!loaded) {
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
        if (unsubscribeEarned) {
          unsubscribeEarned();
        }
        setLoaded(false);
        loadAd();
        resolve({ amount: 1, type: 'timeout' });
      }, 30000);
      
      // Event listener geçici olarak devre dışı - manuel ödül ver
      
      // Manuel ödül simülasyonu
      setTimeout(() => {
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

      
      // Reklamı göster
      rewarded.show().then(() => {
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

