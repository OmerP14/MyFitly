import { Platform } from 'react-native';

// AdMob'u güvenli şekilde import et
let BannerAd, BannerAdSize, InterstitialAd, RewardedAd, TestIds, mobileAds, AdEventType, RewardedAdEventType;

try {
  const AdMob = require('react-native-google-mobile-ads');
  BannerAd = AdMob.BannerAd;
  BannerAdSize = AdMob.BannerAdSize;
  InterstitialAd = AdMob.InterstitialAd;
  RewardedAd = AdMob.RewardedAd;
  TestIds = AdMob.TestIds;
  AdEventType = AdMob.AdEventType;
  RewardedAdEventType = AdMob.RewardedAdEventType;
  mobileAds = AdMob.default;
  
  console.log('🔍 AdMob Event Types:', {
    AdEventType: AdEventType ? Object.keys(AdEventType) : 'undefined',
    RewardedAdEventType: RewardedAdEventType ? Object.keys(RewardedAdEventType) : 'undefined',
    AdEventTypeValues: AdEventType ? Object.values(AdEventType) : 'undefined',
    RewardedAdEventTypeValues: RewardedAdEventType ? Object.values(RewardedAdEventType) : 'undefined'
  });
  
  // AdMob'u başlat
  if (mobileAds && mobileAds.initialize) {
    mobileAds.initialize()
      .then(() => console.log('✅ AdMob initialized'))
      .catch((error) => console.error('❌ AdMob initialization error:', error));
  }
} catch (error) {
  console.log('⚠️ AdMob yüklenemedi:', error.message);
}

// Ad Unit ID'leri - Test ID'leri kullanıyoruz, gerçek uygulama için değiştirin
const AD_UNIT_IDS = {
  // Test ID'leri
  BANNER: TestIds ? TestIds.BANNER : 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: TestIds ? TestIds.INTERSTITIAL : 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: TestIds ? TestIds.REWARDED : 'ca-app-pub-3940256099942544/5224354917',
  
  // Gerçek ID'ler (uygulama yayınlandığında buraya ekleyin)
  // BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  // INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  // REWARDED: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};

// Reklam durumları
let interstitialAd = null;
let rewardedAd = null;

// Interstitial Ad'ı yükle
export const loadInterstitialAd = () => {
  if (!InterstitialAd) return;
  
  try {
    interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('✅ Interstitial ad loaded');
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('❌ Interstitial ad error:', error);
    });

    interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
      console.log('📱 Interstitial ad opened');
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('❌ Interstitial ad closed');
      // Reklam kapandıktan sonra yeni bir tane yükle
      loadInterstitialAd();
    });

    interstitialAd.load();
  } catch (error) {
    console.log('❌ Interstitial ad load error:', error);
  }
};

// Rewarded Ad'ı yükle
export const loadRewardedAd = () => {
  if (!RewardedAd) return;
  
  try {
    rewardedAd = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Event listener'ları geçici olarak kaldır - sadece yükleme yap
    console.log('🔍 RewardedAd event listener\'lar geçici olarak devre dışı');

    rewardedAd.load();
  } catch (error) {
    console.log('❌ Rewarded ad load error:', error);
  }
};

// Interstitial Ad göster
export const showInterstitialAd = (onAdClosed = null) => {
  return new Promise((resolve, reject) => {
    if (!interstitialAd) {
      console.log('⚠️ Interstitial ad not loaded');
      if (onAdClosed) onAdClosed();
      resolve();
      return;
    }

    try {
      // Reklam kapandığında callback çalıştır
      const unsubscribe = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('❌ Interstitial ad closed - callback triggered');
        unsubscribe(); // Event listener'ı temizle
        if (onAdClosed) onAdClosed();
        resolve();
      });
      
      interstitialAd.show();
    } catch (error) {
      console.log('❌ Interstitial ad show error:', error);
      if (onAdClosed) onAdClosed();
      resolve();
    }
  });
};

// Rewarded Ad göster
export const showRewardedAd = () => {
  if (!rewardedAd) {
    console.log('⚠️ Rewarded ad not loaded');
    return;
  }

  try {
    rewardedAd.show();
  } catch (error) {
    console.log('❌ Rewarded ad show error:', error);
  }
};

// Banner Ad bileşeni
export const AdBanner = ({ style, onAdFailedToLoad }) => {
  if (!BannerAd || !BannerAdSize) {
    return null;
  }

  return (
    <BannerAd
      unitId={AD_UNIT_IDS.BANNER}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
      onAdFailedToLoad={(error) => {
        console.log('Banner reklam yüklenemedi:', error);
        if (onAdFailedToLoad) {
          onAdFailedToLoad(error);
        }
      }}
      style={style}
    />
  );
};

// Reklamları başlat
export const initializeAds = () => {
  loadInterstitialAd();
  loadRewardedAd();
};

// Export edilen değerler
export {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd,
  AD_UNIT_IDS,
  mobileAds
};
