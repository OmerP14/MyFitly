import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

const LanguageContext = createContext();

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Load on mount
  useEffect(() => {
    const init = async () => {
      try {
        const saved = await AsyncStorage.getItem('app_language');
        if (saved) setLanguage(saved);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setUserId(session.user.id);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) setUserId(session.user.id);
      else setUserId(null);
    });
    return () => data?.subscription?.unsubscribe();
  }, []);

  const changeLanguage = async (newLang) => {
    try {
      setLanguage(newLang);
      await AsyncStorage.setItem('app_language', newLang);
      if (userId) {
        await supabase.from('users').update({ preferred_language: newLang, updated_at: new Date().toISOString() }).eq('id', userId);
      }
    } catch (e) {
      console.warn('language change failed', e);
    }
  };

  const value = { language, changeLanguage, isLoading };
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
