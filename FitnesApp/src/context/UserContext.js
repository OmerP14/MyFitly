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
    let timeoutId = null;
    try {
      setIsLoading(true);
      console.log('🔄 Kullanıcı başlatılıyor...');
      
      // Timeout koruma - maksimum 10 saniye
      timeoutId = setTimeout(() => {
        console.warn('⏰ Initialize timeout - loading false yapılıyor');
        setIsLoading(false);
      }, 10000);
      
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
          console.warn('⚠️ Kullanıcı profili bulunamadı');
          // Profil yoksa sadece bilgilendir, otomatik oluşturma
          setUserData(null);
          setNeedsProfileCompletion(true); // Profil oluşturması gerekiyor
        } else {
          setUserData(userProfile);
          // Profil eksik mi kontrol et
          if (!userProfile.age || !userProfile.height || !userProfile.current_weight || !userProfile.target_weight) {
            console.log('⚠️ Profil eksik bilgiler var, tamamlanması gerekiyor');
            setNeedsProfileCompletion(true);
          } else {
            console.log('✅ Profil tamamlanmış');
            setNeedsProfileCompletion(false);
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
      if (timeoutId) clearTimeout(timeoutId);
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
            console.log('✅ Profil güncelleme sonrası tamamlanmış');
            setNeedsProfileCompletion(false);
          } else {
            console.log('⚠️ Profil güncelleme sonrası hala eksik bilgiler var');
            setNeedsProfileCompletion(true);
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
      
      if (event === 'SIGNED_IN') {
        // Sadece yeni giriş yapıldığında kullanıcı verilerini yükle
        setSession(currentSession);
        if (currentSession?.user) {
          await initializeUser();
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Token yenilendiğinde sadece session'ı güncelle, tekrar initialize etme
        console.log('🔄 Token yenilendi, session güncelleniyor...');
        setSession(currentSession);
        if (currentSession?.user) {
          setUserId(currentSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUserId(null);
        setUserData(null);
        setNeedsProfileCompletion(false);
        setIsLoading(false);
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

