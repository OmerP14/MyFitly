import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, Modal, TextInput, Switch, Alert, Share, Platform, Linking, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { supabase } from '../config/supabase';
import * as notificationService from '../services/notificationService';

const ProfileMenuItem = ({ icon, title, subtitle, onPress, showArrow = true, colors }) => (
  <TouchableOpacity onPress={onPress} style={{
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  }}>
    <View style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 122, 0, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md
    }}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
          {subtitle}
        </Text>
      )}
    </View>
    {showArrow && (
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { userId, userData, updateUserData, refreshUser, logout, isLoading } = useUser();
  
  // Local state for form editing
  const [localUserData, setLocalUserData] = useState({
    name: 'Yükleniyor...',
    email: '',
    weight: 0,
    targetWeight: 0,
    age: 0,
    height: 0,
    profilePhoto: null
  });

  // UserContext'ten gelen verileri local state'e aktar (sadece modal kapalıyken)
  useEffect(() => {
    if (userData && !showEditModal) {
      setLocalUserData({
        name: userData.name || 'Kullanıcı',
        email: userData.email || '',
        weight: userData.current_weight || 0,
        targetWeight: userData.target_weight || 0,
        age: userData.age || 0,
        height: userData.height || 0,
        profilePhoto: userData.profile_photo_url || null
      });
      setNotificationsEnabled(userData.notifications_enabled ?? true);
    }
  }, [userData, showEditModal]);

  // Galeriden fotoğraf seç
  const pickImageFromGallery = async () => {
    try {
      // İzin iste
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
        return;
      }

      // Galeriden fotoğraf seç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        
        // Local state'i güncelle
        setLocalUserData({...localUserData, profilePhoto: photoUri});
        
        // Supabase'e kaydet
        await updateUserData({
          profile_photo_url: photoUri
        });
        
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi!');
        setShowPhotoModal(false);
      }
    } catch (error) {
      console.error('Galeri hatası:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  // Kameradan fotoğraf çek
  const takePhotoFromCamera = async () => {
    try {
      // İzin iste
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Kamera erişimi için izin vermeniz gerekiyor.');
        return;
      }

      // Kameradan fotoğraf çek
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        
        // Local state'i güncelle
        setLocalUserData({...localUserData, profilePhoto: photoUri});
        
        // Supabase'e kaydet
        await updateUserData({
          profile_photo_url: photoUri
        });
        
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi!');
        setShowPhotoModal(false);
      }
    } catch (error) {
      console.error('Kamera hatası:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
    }
  };

  // Profil fotoğrafını kaldır
  const removeProfilePhoto = async () => {
    try {
      // Local state'i güncelle
      setLocalUserData({...localUserData, profilePhoto: null});
      
      // Supabase'e kaydet
      await updateUserData({
        profile_photo_url: null
      });
      
      Alert.alert('Başarılı', 'Profil fotoğrafınız kaldırıldı!');
      setShowPhotoModal(false);
    } catch (error) {
      console.error('Fotoğraf kaldırma hatası:', error);
      Alert.alert('Hata', 'Fotoğraf kaldırılırken bir hata oluştu.');
    }
  };

  const PhotoSelectionModal = () => (
    <Modal
      visible={showPhotoModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPhotoModal(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg
      }}>
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: spacing.lg,
          width: '100%',
          maxWidth: 400
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
              Profil Fotoğrafı
            </Text>
            <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg }}>
            Galeri veya kameradan fotoğraf seçin
          </Text>

          {/* Galeri Butonu */}
          <TouchableOpacity
            onPress={pickImageFromGallery}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: spacing.lg,
              alignItems: 'center',
              marginBottom: spacing.md,
              flexDirection: 'row',
              justifyContent: 'center',
              elevation: 3,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4
            }}
          >
            <Ionicons name="images" size={24} color={colors.background} style={{ marginRight: spacing.sm }} />
            <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700' }}>
              📱 Galeriden Seç
            </Text>
          </TouchableOpacity>

          {/* Kamera Butonu */}
          <TouchableOpacity
            onPress={takePhotoFromCamera}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: spacing.lg,
              alignItems: 'center',
              marginBottom: spacing.md,
              flexDirection: 'row',
              justifyContent: 'center',
              elevation: 3,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4
            }}
          >
            <Ionicons name="camera" size={24} color={colors.background} style={{ marginRight: spacing.sm }} />
            <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700' }}>
              📷 Kameradan Çek
            </Text>
          </TouchableOpacity>

          {/* Fotoğrafı Kaldır Butonu */}
          {localUserData.profilePhoto && (
            <TouchableOpacity
              onPress={removeProfilePhoto}
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: spacing.md,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: colors.error
              }}
            >
              <Text style={{ color: colors.error, fontSize: 14, fontWeight: '600' }}>
                🗑️ Fotoğrafı Kaldır
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }}>
          {/* Header */}
          <SectionHeader 
            title="Profil" 
            subtitle="Hesap ayarları ve kişisel bilgiler"
          />

          {/* Profile Card */}
          <Card style={{ marginBottom: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
            <View style={{ position: 'relative', marginBottom: spacing.md }}>
              {localUserData.profilePhoto ? (
                <Image
                  source={{ uri: localUserData.profilePhoto }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    borderWidth: 4,
                    borderColor: colors.primary
                  }}
                />
              ) : (
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 4,
                  borderColor: colors.primary
                }}>
                  <Text style={{ color: colors.background, fontSize: 36, fontWeight: '800' }}>
                    {localUserData.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => setShowPhotoModal(true)}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: colors.primary,
                  borderRadius: 16,
                  width: 32,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: colors.card,
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3
                }}
              >
                <Ionicons name="camera" size={16} color={colors.background} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
              {localUserData.name}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.md }}>
              {localUserData.email || 'Email girilmedi'}
            </Text>
            <TouchableOpacity onPress={() => setShowEditModal(true)} style={{
              backgroundColor: colors.primary,
              borderRadius: 20,
              paddingHorizontal: 20,
              paddingVertical: 8,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2
            }}>
              <Text style={{ color: colors.background, fontSize: 14, fontWeight: '800' }}>
                ✏️ Profili Düzenle
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Stats */}
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
              Kişisel Bilgiler
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{localUserData.weight || 0}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Mevcut Kilo</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{localUserData.targetWeight || 0}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Hedef Kilo</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{localUserData.age || 0}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Yaş</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{localUserData.height || 0}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Boy (cm)</Text>
              </View>
            </View>
          </Card>

          {/* Settings */}
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
              Ayarlar
            </Text>
            
            {/* Bildirimler */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 122, 0, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md
              }}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                  Bildirimler
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
                  Antrenman hatırlatıcıları
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={async (value) => {
                  setNotificationsEnabled(value);
                  try {
                    // Database'e kaydet
                    await updateUserData({ notifications_enabled: value });
                    
                    if (value) {
                      // Bildirimleri aç
                      const hasPermission = await notificationService.requestNotificationPermissions();
                      
                      if (hasPermission) {
                        // Egzersiz verilerini al
                        try {
                          const programService = require('../services/programService');
                          const weeklyStats = await programService.getWeeklyStats(contextUserData?.id);
                          
                          // Egzersiz günlerini organize et
                          const exercises = {};
                          for (let day = 0; day < 7; day++) {
                            exercises[day] = weeklyStats[day]?.exercises || [];
                          }
                          
                          // Bildirimleri zamanla
                          const result = await notificationService.updateWorkoutNotifications(exercises, true);
                          
                          if (result.success) {
                            Alert.alert(
                              '🔔 Bildirimler Açıldı!',
                              `📅 Antrenman Hatırlatıcıları:\nHer antrenman günü saat 09:00'da\n\n${result.scheduledDays.join(', ')}\n\n✨ Motivasyon Bildirimleri:\nHaftada 2-3 kez rastgele saatlerde\n\nHedefine ulaşmak için seni motive edeceğiz! 💪`,
                              [{ text: 'Harika!' }]
                            );
                          }
                        } catch (error) {
                          console.error('Antrenman verileri alınamadı:', error);
                          Alert.alert(
                            '✅ Bildirimler Açıldı',
                            'Antrenman eklediğinizde otomatik olarak bildirimler zamanlanacak.'
                          );
                        }
                      } else {
                        Alert.alert(
                          'İzin Gerekli',
                          'Bildirim göndermek için uygulama ayarlarından bildirim izni vermeniz gerekiyor.',
                          [{ text: 'Tamam' }]
                        );
                        setNotificationsEnabled(false);
                      }
                    } else {
                      // Bildirimleri kapat
                      await notificationService.cancelAllNotifications();
                      Alert.alert(
                        '🔕 Bildirimler Kapatıldı',
                        'Artık antrenman hatırlatıcıları almayacaksınız.',
                        [{ text: 'Tamam' }]
                      );
                    }
                  } catch (error) {
                    console.error('Bildirim ayarı güncelleme hatası:', error);
                    Alert.alert('Hata', 'Bildirim ayarı güncellenirken bir hata oluştu.');
                  }
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {/* Karanlık Tema */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 122, 0, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md
              }}>
                <Ionicons name="moon" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                  Karanlık Tema
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
                  Görünüm ayarları
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={async (value) => {
                  toggleTheme();
                  try {
                    await updateUserData({ is_dark_mode: value });
                  } catch (error) {
                    console.error('Tema ayarı güncelleme hatası:', error);
                  }
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </Card>

          {/* Data & Export */}
          <Card style={{ marginBottom: spacing.md }}>
            <ProfileMenuItem
              colors={colors}
              icon="download"
              title="Verileri Dışa Aktar"
              subtitle="Tüm verilerini yedekle"
              onPress={async () => {
                try {
                  Alert.alert(
                    'Veri Dışa Aktarma',
                    'Tüm verileriniz JSON formatında dışa aktarılacak. Devam edilsin mi?',
                    [
                      { text: 'İptal', style: 'cancel' },
                      {
                        text: 'Dışa Aktar',
                        onPress: async () => {
                          try {
                            // Kullanıcı verilerini Supabase'den çek
                            const { data: workoutSessions } = await supabase
                              .from('workout_sessions')
                              .select('*')
                              .eq('user_id', contextUserData?.id);

                            const { data: weightTracking } = await supabase
                              .from('weight_tracking')
                              .select('*')
                              .eq('user_id', contextUserData?.id);

                            const { data: strengthTracking } = await supabase
                              .from('strength_tracking')
                              .select('*')
                              .eq('user_id', contextUserData?.id);

                            const exportData = {
                              user: contextUserData,
                              workoutSessions: workoutSessions || [],
                              weightTracking: weightTracking || [],
                              strengthTracking: strengthTracking || [],
                              exportDate: new Date().toISOString()
                            };

                            const jsonString = JSON.stringify(exportData, null, 2);
                            
                            // Dosyayı paylaş
                            await Share.share({
                              message: jsonString,
                              title: 'FitnesApp Veri Yedekleme'
                            });

                            Alert.alert('Başarılı', 'Verileriniz başarıyla dışa aktarıldı!');
                          } catch (error) {
                            console.error('Veri dışa aktarma hatası:', error);
                            Alert.alert('Hata', 'Veriler dışa aktarılırken bir hata oluştu.');
                          }
                        }
                      }
                    ]
                  );
                } catch (error) {
                  console.error('Dışa aktarma hatası:', error);
                  Alert.alert('Hata', 'Bir hata oluştu.');
                }
              }}
            />
            <ProfileMenuItem
              colors={colors}
              icon="cloud-upload"
              title="Buluta Yedekle"
              subtitle="Supabase'e otomatik yedeklenmiş"
              onPress={() => {
                Alert.alert(
                  'Bulut Yedekleme',
                  'Verileriniz otomatik olarak Supabase bulut veritabanına kaydediliyor. Ek bir işlem yapmanıza gerek yok!',
                  [{ text: 'Tamam' }]
                );
              }}
            />
            <ProfileMenuItem
              colors={colors}
              icon="share"
              title="Verileri Paylaş"
              subtitle="Antrenör veya arkadaşlarla"
              onPress={async () => {
                try {
                  const shareMessage = `
🏋️ FitnesApp İlerleme Raporu

👤 Ad: ${localUserData.name}
⚖️ Mevcut Kilo: ${localUserData.weight} kg
🎯 Hedef Kilo: ${localUserData.targetWeight} kg
📏 Boy: ${localUserData.height} cm
🎂 Yaş: ${localUserData.age}

📊 Bu rapor ${new Date().toLocaleDateString('tr-TR')} tarihinde oluşturuldu.
                  `.trim();

                  await Share.share({
                    message: shareMessage,
                    title: 'FitnesApp İlerleme Raporu'
                  });
                } catch (error) {
                  console.error('Paylaşma hatası:', error);
                  Alert.alert('Hata', 'Paylaşma sırasında bir hata oluştu.');
                }
              }}
            />
          </Card>

          {/* Support */}
          <Card style={{ marginBottom: spacing.md }}>
            <ProfileMenuItem
              colors={colors}
              icon="help-circle"
              title="Yardım & Destek"
              subtitle="SSS ve iletişim"
              onPress={() => {
                Alert.alert(
                  'Yardım & Destek',
                  '📧 Email: omerpehriz4@gmail.com\n\n💬 Sıkça Sorulan Sorular:\n\n1. Nasıl egzersiz eklerim?\n2. Nasıl ilerleme takibi yaparım?\n3. Verilerim güvende mi?\n\nDaha fazla bilgi için bana email atabilirsiniz.',
                  [
                    { text: 'Kapat', style: 'cancel' },
                    {
                      text: 'E-posta Gönder',
                      onPress: () => Linking.openURL('mailto:omerpehriz4@gmail.com')
                    }
                  ]
                );
              }}
            />
            <ProfileMenuItem
              colors={colors}
              icon="star"
              title="Uygulamayı Değerlendir"
              subtitle="App Store'da puanla"
              onPress={() => {
                Alert.alert(
                  'Uygulamayı Beğendiniz mi?',
                  'Görüşleriniz bizim için çok değerli! App Store\'da 5 yıldız vererek bizi destekleyebilirsiniz.',
                  [
                    { text: 'Belki Sonra', style: 'cancel' },
                    {
                      text: 'App Store\'a Git',
                      onPress: () => {
                        // iOS için App Store linki
                        const storeUrl = Platform.OS === 'ios' 
                          ? 'https://apps.apple.com/app/id123456789'
                          : 'https://play.google.com/store/apps/details?id=com.fitnesapp';
                        Linking.openURL(storeUrl);
                      }
                    }
                  ]
                );
              }}
            />
            <ProfileMenuItem
              colors={colors}
              icon="information-circle"
              title="Hakkında"
              subtitle="Versiyon 1.0.0"
              onPress={() => {
                Alert.alert(
                  'FitnesApp v1.0.0',
                  '🏋️ Modern fitness tracking uygulaması\n\n👨‍💻 Geliştirici: Ömer Pehriz\n\n📱 React Native ile geliştirildi\n🔐 Supabase ile güvenli veri depolama\n\n© 2024 FitnesApp. Tüm hakları saklıdır.',
                  [
                    { text: 'Tamam' },
                    {
                      text: 'Gizlilik Politikası',
                      onPress: () => Linking.openURL('https://fitnesapp.com/privacy')
                    }
                  ]
                );
              }}
            />
          </Card>

          {/* Logout */}
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                'Çıkış Yap',
                'Çıkış yapmak istediğinizden emin misiniz? Verileriniz güvenle saklanıyor ve tekrar giriş yaptığınızda geri yüklenecek.',
                [
                  { text: 'İptal', style: 'cancel' },
                  {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await logout();
                        // Navigation otomatik olacak çünkü UserContext session'ı izliyor
                      } catch (error) {
                        console.error('❌ Çıkış hatası:', error);
                        Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
                      }
                    }
                  }
                ]
              );
            }}
            style={{
              backgroundColor: 'rgba(255, 71, 87, 0.2)',
              borderRadius: 16,
              padding: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="log-out" size={20} color="#FF4757" style={{ marginRight: 8 }} />
            <Text style={{ color: '#FF4757', fontSize: 16, fontWeight: '600' }}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Photo Selection Modal */}
        <PhotoSelectionModal />

        {/* Edit Profile Modal - ProgramScreen gibi direkt JSX */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEditModal(false)}
        >
          <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'flex-end'
            }}>
              <View style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: spacing.lg,
                maxHeight: '80%'
              }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg }}>
                Profili Düzenle
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ gap: spacing.md }}>
                  <View>
                    <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>Ad Soyad</Text>
                    <TextInput
                      value={localUserData.name}
                      onChangeText={(text) => setLocalUserData({...localUserData, name: text})}
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        padding: 12,
                        color: colors.text,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: colors.border
                      }}
                      autoCorrect={false}
                      autoCapitalize="words"
                    />
                  </View>

                  <View>
                    <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>Email</Text>
                    <TextInput
                      value={localUserData.email}
                      onChangeText={(text) => setLocalUserData({...localUserData, email: text})}
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        padding: 12,
                        color: colors.text,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: colors.border
                      }}
                      keyboardType="email-address"
                      autoCorrect={false}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>Kilo (kg)</Text>
                      <TextInput
                        value={localUserData.weight.toString()}
                        onChangeText={(text) => setLocalUserData({...localUserData, weight: parseFloat(text) || 0})}
                        style={{
                          backgroundColor: colors.background,
                          borderRadius: 12,
                          padding: 12,
                          color: colors.text,
                          fontSize: 16
                        }}
                        keyboardType="decimal-pad"
                        autoCorrect={false}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>Hedef (kg)</Text>
                      <TextInput
                        value={localUserData.targetWeight.toString()}
                        onChangeText={(text) => setLocalUserData({...localUserData, targetWeight: parseFloat(text) || 0})}
                        style={{
                          backgroundColor: colors.background,
                          borderRadius: 12,
                          padding: 12,
                          color: colors.text,
                          fontSize: 16
                        }}
                        keyboardType="decimal-pad"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>Yaş</Text>
                      <TextInput
                        value={localUserData.age.toString()}
                        onChangeText={(text) => setLocalUserData({...localUserData, age: parseInt(text) || 0})}
                        style={{
                          backgroundColor: colors.background,
                          borderRadius: 12,
                          padding: 12,
                          color: colors.text,
                          fontSize: 16
                        }}
                        keyboardType="number-pad"
                        autoCorrect={false}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>Boy (cm)</Text>
                      <TextInput
                        value={localUserData.height.toString()}
                        onChangeText={(text) => setLocalUserData({...localUserData, height: parseInt(text) || 0})}
                        style={{
                          backgroundColor: colors.background,
                          borderRadius: 12,
                          padding: 12,
                          color: colors.text,
                          fontSize: 16
                        }}
                        keyboardType="number-pad"
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <TouchableOpacity
                  onPress={async () => {
                    if (!localUserData.name || !localUserData.email) {
                      Alert.alert('Uyarı', 'Ad ve email alanları zorunludur');
                      return;
                    }

                    try {
                      // Supabase'e güncelleme gönder
                      await updateUserData({
                        name: localUserData.name,
                        email: localUserData.email,
                        current_weight: localUserData.weight,
                        target_weight: localUserData.targetWeight,
                        age: localUserData.age,
                        height: localUserData.height
                      });

                      Alert.alert('Başarılı', 'Profil başarıyla güncellendi!');
                      setShowEditModal(false);
                    } catch (error) {
                      console.error('Profil güncelleme hatası:', error);
                      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
                    }
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    elevation: 3,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700' }}>
                    ✅ Kaydet
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: colors.primary
                  }}
                >
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>
                    ❌ İptal
                  </Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
