import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const activateSubscription = async () => {
    try {
      await AsyncStorage.setItem('subscription_status', 'active');
      setIsSubscribed(true);
      // Show success message
      alert('MyFitly Pro aboneliğiniz başarıyla aktifleştirildi!');
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