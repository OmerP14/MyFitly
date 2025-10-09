import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  // Kullanıcıyı başlat
  const initializeUser = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Kullanıcı başlatılıyor...');
      
      // Mevcut session'ı kontrol et
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        console.log('✅ Aktif session bulundu:', currentSession.user.id);
        setSession(currentSession);
        setUserId(currentSession.user.id);
        
        // Kullanıcı profil bilgilerini yükle
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();
        
        if (error || !userProfile) {
          console.warn('⚠️ Kullanıcı profili bulunamadı, yeni profil oluşturuluyor...');
          // Yeni profil oluştur
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([{
              id: currentSession.user.id,
              email: currentSession.user.email,
              name: currentSession.user.email?.split('@')[0] || 'Kullanıcı',
              created_at: new Date().toISOString()
            }])
            .select()
            .single();
          
          if (newProfile) {
            setUserData(newProfile);
            setNeedsProfileCompletion(true); // Profil doldurması gerekiyor
          }
        } else {
          setUserData(userProfile);
          // Profil eksik mi kontrol et
          if (!userProfile.age || !userProfile.height || !userProfile.current_weight || !userProfile.target_weight) {
            setNeedsProfileCompletion(true);
          }
        }
      } else {
        console.log('ℹ️ Aktif session yok, giriş ekranına yönlendirilecek');
        setSession(null);
        setUserId(null);
        setUserData(null);
      }
      
    } catch (error) {
      console.error('❌ Kullanıcı başlatma hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı bilgilerini güncelle
  const updateUserData = async (updates) => {
    try {
      if (!userId) return;
      
      // Önce local state'i güncelle (anında tepki için)
      setUserData(prev => ({ ...prev, ...updates }));
      
      // Supabase'e güncelleme gönder
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('❌ Kullanıcı güncelleme hatası:', error);
      } else {
        console.log('✅ Kullanıcı verileri güncellendi');
        
        // Profil tamamlama durumunu kontrol et
        const { data: updatedProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (updatedProfile) {
          setUserData(updatedProfile);
          // Profil tamamlandı mı kontrol et
          if (updatedProfile.age && updatedProfile.height && updatedProfile.current_weight && updatedProfile.target_weight) {
            setNeedsProfileCompletion(false);
          }
        }
      }
    } catch (error) {
      console.error('❌ Kullanıcı güncelleme hatası:', error);
    }
  };

  // Çıkış yap
  const logout = async () => {
    try {
      console.log('👋 Çıkış yapılıyor...');
      await supabase.auth.signOut();
      setSession(null);
      setUserId(null);
      setUserData(null);
      setNeedsProfileCompletion(false);
      console.log('✅ Çıkış başarılı');
    } catch (error) {
      console.error('❌ Çıkış hatası:', error);
    }
  };

  // Auth state değişikliklerini izle
  useEffect(() => {
    // İlk yükleme
    initializeUser();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔔 Auth state değişti:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
        if (currentSession?.user) {
          await initializeUser();
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUserId(null);
        setUserData(null);
        setNeedsProfileCompletion(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    userId,
    userData,
    isLoading,
    isOnline,
    needsProfileCompletion,
    updateUserData,
    refreshUser: initializeUser,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

