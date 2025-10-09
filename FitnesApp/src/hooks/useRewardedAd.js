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
        console.log('⚠️ AdMob mevcut değil, reklam sistemi devre dışı');
        setAdInitialized(false);
        return;
      }

      try {
        console.log('🚀 AdMob başlatılıyor...');
        const result = await mobileAds.initialize();
        console.log('✅ AdMob başlatıldı:', result);
        setAdInitialized(true);
      } catch (error) {
        console.error('❌ AdMob başlatma hatası:', error);
        // Hata olsa bile devam et
        setAdInitialized(true);
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

      // Event listener'ları ayarla
      const unsubscribeLoaded = rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          console.log('✅✅✅ Ödüllü reklam yüklendi ve hazır!');
          setLoaded(true);
          setLoading(false);
        }
      );

      const unsubscribeEarned = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('🎁 Ödül kazanıldı:', reward);
          setEarnedReward(reward);
        }
      );

      const unsubscribeFailed = rewardedAd.addAdEventListener(
        'adFailedToLoad',
        (error) => {
          console.error('❌ Reklam yükleme başarısız:', error);
          setLoading(false);
          setLoaded(false);
        }
      );

      setRewarded(rewardedAd);

      // Cleanup
      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeFailed();
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
    if (!loaded || !rewarded) {
      throw new Error('Reklam henüz hazır değil');
    }

    return new Promise((resolve, reject) => {
      let rewardEarned = false;
      let unsubscribeEarned = null;
      
      // Ödül bilgisini sıfırla
      setEarnedReward(null);
      
      // Tek seferlik ödül listener'ı
      unsubscribeEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('🎁 Ödül kazanıldı (Promise):', reward);
          rewardEarned = true;
          setEarnedReward(reward);
          
          if (unsubscribeEarned) {
            unsubscribeEarned();
          }
          
          // Reklam kapanınca yeni yükle
          setTimeout(() => {
            setLoaded(false);
            loadAd();
          }, 1000);
          
          resolve(reward);
        }
      );

      console.log('📺 Ödüllü reklam gösteriliyor...');
      
      // Reklamı göster
      rewarded.show().then(() => {
        console.log('✅ Reklam başarıyla gösterildi');
      }).catch((error) => {
        console.error('❌ Reklam gösterme hatası:', error);
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

