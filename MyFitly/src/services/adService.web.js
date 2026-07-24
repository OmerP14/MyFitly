// Web build of adService: react-native-google-mobile-ads is a native-only
// module (imports RN internals Metro can't bundle for web), so this file
// stands in for adService.js on web via Metro's platform extension
// resolution. Ads are a no-op here; native behavior is unaffected.

export const loadInterstitialAd = () => {};

export const loadRewardedAd = () => {};

export const showInterstitialAd = (onAdClosed = null) => {
  if (onAdClosed) onAdClosed();
  return Promise.resolve();
};

export const showRewardedAd = () => {};

export const AdBanner = () => null;

export const initializeAds = () => {};

export const BannerAd = null;
export const BannerAdSize = null;
export const InterstitialAd = null;
export const RewardedAd = null;
export const AD_UNIT_IDS = {};
export const mobileAds = null;
