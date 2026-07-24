import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// PORTFOLIO / DEMO NOTICE
// ---------------------------------------------------------------------------
// This subscription system is a local UI demo only. "Pro" status is just a
// flag in AsyncStorage - there is NO real payment provider, NO App Store /
// Play Store IAP integration, and NO server-side receipt validation wired
// up. Calling activateSubscription() below unlocks "Pro" for free on this
// device. This exists to showcase the paywall UI/UX, not a working billing
// system. A real implementation would use react-native-iap (or Expo's
// in-app-purchases equivalent) plus a backend endpoint that verifies the
// purchase receipt with Apple/Google before granting entitlements.
// ---------------------------------------------------------------------------

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const subscriptionStatus = await AsyncStorage.getItem('subscription_status');
      setIsSubscribed(subscriptionStatus === 'active');
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // DEMO ONLY: flips a local flag, no real purchase/payment occurs. See the
  // notice at the top of this file.
  const activateSubscription = async () => {
    try {
      await AsyncStorage.setItem('subscription_status', 'active');
      setIsSubscribed(true);
      // Show success message
      alert('MyFitly Pro aboneliğiniz başarıyla aktifleştirildi! (demo)');
    } catch (error) {
      console.error('Error activating subscription:', error);
      alert('Abonelik aktifleştirilirken bir hata oluştu.');
    }
  };

  const deactivateSubscription = async () => {
    try {
      await AsyncStorage.removeItem('subscription_status');
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error deactivating subscription:', error);
    }
  };

  const value = {
    isSubscribed,
    isLoading,
    activateSubscription,
    deactivateSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};