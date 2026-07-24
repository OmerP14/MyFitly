// Web build of useRewardedAd: react-native-google-mobile-ads is native-only
// and can't be bundled for web (see src/services/adService.web.js). Rewarded
// ads are a no-op on web; native behavior is unaffected.

const useRewardedAd = () => {
  const showAd = async () => {
    throw new Error('Rewarded ads are not available on web');
  };

  return {
    loaded: false,
    loading: false,
    showAd,
    earnedReward: null,
    loadAd: () => {},
  };
};

export default useRewardedAd;
