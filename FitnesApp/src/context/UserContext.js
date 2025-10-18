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
      
      // Timeout koruma - maksimum 5 saniye (daha hızlı)
      timeoutId = setTimeout(() => {
        console.warn('⏰ Initialize timeout - loading false yapılıyor');
        setIsLoading(false);
      }, 5000);
      
      // Mevcut session'ı kontrol et (daha hızlı)
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('⚠️ Session hatası, temizleniyor:', sessionError.message);
        await supabase.auth.signOut();
        setSession(null);
        setUserId(null);
        setUserData(null);
        setNeedsProfileCompletion(false);
        setIsLoading(false);
        return;
      }
      
      if (currentSession) {
        console.log('✅ Aktif session bulundu:', currentSession.user.id);
        setSession(currentSession);
        setUserId(currentSession.user.id);
        
        // Kullanıcı profil bilgilerini yükle (sadece gerekli alanlar)
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('id, name, email, age, height, current_weight, target_weight, preferred_language, created_at, updated_at')
          .eq('id', currentSession.user.id)
          .single();
        
        if (error || !userProfile) {
          console.warn('⚠️ Kullanıcı profili bulunamadı:', error);
          
          // Auth kullanıcısı var ama users tablosunda yok - otomatik profil oluştur
          if (error?.code === 'PGRST116' || !userProfile) {
            console.log('🔄 Auth kullanıcısı için otomatik profil oluşturuluyor...');
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert({
                  id: currentSession.user.id,
                  email: currentSession.user.email,
                  name: currentSession.user.email?.split('@')[0] || 'Kullanıcı',
                  display_name: currentSession.user.email?.split('@')[0] || 'Kullanıcı'
                })
                .select()
                .single();
                
              if (createError) {
                console.error('❌ Otomatik profil oluşturma hatası:', createError);
                setUserData(null);
                setNeedsProfileCompletion(true);
              } else {
                console.log('✅ Otomatik profil oluşturuldu');
                setUserData(newProfile);
                setNeedsProfileCompletion(true); // Hala tamamlanması gerekiyor
              }
            } catch (createErr) {
              console.error('❌ Profil oluşturma exception:', createErr);
              setUserData(null);
              setNeedsProfileCompletion(true);
            }
          } else {
            setUserData(null);
            setNeedsProfileCompletion(true);
          }
          console.log('🔄 needsProfileCompletion = true (profil bulunamadı)');
        } else {
          setUserData(userProfile);
          console.log('📊 Kullanıcı profili yüklendi:', {
            hasAge: !!userProfile.age,
            hasHeight: !!userProfile.height,
            hasCurrentWeight: !!userProfile.current_weight,
            hasTargetWeight: !!userProfile.target_weight
          });
          // Profil eksik mi kontrol et
          if (!userProfile.age || !userProfile.height || !userProfile.current_weight || !userProfile.target_weight) {
            console.log('⚠️ Profil eksik bilgiler var, tamamlanması gerekiyor');
            setNeedsProfileCompletion(true);
            console.log('🔄 needsProfileCompletion = true (eksik bilgiler)');
          } else {
            console.log('✅ Profil tamamlanmış');
            setNeedsProfileCompletion(false);
            console.log('🔄 needsProfileCompletion = false (profil tamamlanmış)');
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

  // Hızlı profil yükleme (auth state change için)
  const loadUserProfileOnly = async (userId) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('id, name, email, age, height, current_weight, target_weight, preferred_language')
        .eq('id', userId)
        .single();
      
      if (error || !userProfile) {
        console.warn('⚠️ Hızlı yüklemede profil bulunamadı:', error);
        // Auth kullanıcısı için otomatik profil oluştur
        if (error?.code === 'PGRST116' || !userProfile) {
          console.log('🔄 Hızlı yüklemede otomatik profil oluşturuluyor...');
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: userId,
                email: session?.user?.email || '',
                name: session?.user?.email?.split('@')[0] || 'Kullanıcı',
                display_name: session?.user?.email?.split('@')[0] || 'Kullanıcı'
              })
              .select()
              .single();
              
            if (createError) {
              console.error('❌ Hızlı profil oluşturma hatası:', createError);
              setUserData(null);
              setNeedsProfileCompletion(true);
            } else {
              console.log('✅ Hızlı profil oluşturuldu');
              setUserData(newProfile);
              setNeedsProfileCompletion(true);
            }
          } catch (createErr) {
            console.error('❌ Hızlı profil oluşturma exception:', createErr);
            setUserData(null);
            setNeedsProfileCompletion(true);
          }
        } else {
          setUserData(null);
          setNeedsProfileCompletion(true);
        }
        setIsLoading(false);
        return;
      }
      
      setUserData(userProfile);
      // Profil eksik mi kontrol et
      if (!userProfile.age || !userProfile.height || !userProfile.current_weight || !userProfile.target_weight) {
        setNeedsProfileCompletion(true);
      } else {
        setNeedsProfileCompletion(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Hızlı profil yükleme hatası:', error);
      setUserData(null);
      setNeedsProfileCompletion(true);
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

  // Tüm session'ları temizle (kullanıcı silme sonrası)
  const clearAllSessions = async () => {
    try {
      console.log('🧹 Tüm sessionlar temizleniyor...');
      await supabase.auth.signOut();
      // Local storage'ı da temizle
      await supabase.auth.admin.deleteUser(session?.user?.id);
      setSession(null);
      setUserId(null);
      setUserData(null);
      setNeedsProfileCompletion(false);
      console.log('✅ Tüm sessionlar temizlendi');
    } catch (error) {
      console.error('❌ Session temizleme hatası:', error);
    }
  };

  // Auth state değişikliklerini izle
  useEffect(() => {
    // İlk yükleme (timeout ile)
    const initTimeout = setTimeout(() => {
      initializeUser();
    }, 100); // 100ms gecikme ile başlat
    
    return () => clearTimeout(initTimeout);

    // Auth state listener (optimize edilmiş)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔔 Auth state değişti:', event);
      
      if (event === 'SIGNED_IN') {
        // Sadece yeni giriş yapıldığında kullanıcı verilerini yükle
        console.log('🔔 SIGNED_IN event - kullanıcı giriş yaptı');
        setSession(currentSession);
        if (currentSession?.user) {
          console.log('🔄 Yeni giriş yapan kullanıcı için profil kontrol ediliyor...');
          // Yeni giriş yapan kullanıcı için tam initialize yap
          await initializeUser();
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Token yenilendiğinde sadece session'ı güncelle
        console.log('🔄 Token yenilendi, session güncelleniyor...');
        setSession(currentSession);
        if (currentSession?.user) {
          setUserId(currentSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        // Çıkış yapıldığında tüm state'i temizle
        console.log('👋 Kullanıcı çıkış yaptı');
        setSession(null);
        setUserId(null);
        setUserData(null);
        setNeedsProfileCompletion(false);
        setIsLoading(false);
      } else if (event === 'PASSWORD_RECOVERY') {
        // Şifre kurtarma durumu
        console.log('🔑 Şifre kurtarma işlemi');
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
    logout,
    clearAllSessions
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

