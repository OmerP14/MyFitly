import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, Modal, TextInput, Switch, Alert, Share, Platform, Linking, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Card from '../components/Card';
import Header from '../components/Header';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';
import { supabase } from '../config/supabase';
import * as notificationService from '../services/notificationService';
import { scheduleWaterReminder } from '../services/notificationService';
import LanguageSelector from '../components/LanguageSelector';

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
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { userId, userData, updateUserData, refreshUser, logout, isLoading } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  // Local state for form editing
  const [localUserData, setLocalUserData] = useState({
    name: t?.loading || 'Loading...',
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
        name: userData.name || t.name || 'User',
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
        Alert.alert(t.permission_required, t.gallery_permission_required);
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
        
        Alert.alert(t.successful, t.photo_selected_success);
        setShowPhotoModal(false);
      }
    } catch (error) {
      console.error('Galeri hatası:', error);
      Alert.alert(t.error, t.photo_selection_error);
    }
  };

  // Kameradan fotoğraf çek
  const takePhotoFromCamera = async () => {
    try {
      // İzin iste
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(t.permission_required, t.camera_permission_required);
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
        
        Alert.alert(t.successful, t.photo_selected_success);
        setShowPhotoModal(false);
      }
    } catch (error) {
      console.error('Kamera hatası:', error);
      Alert.alert(t.error, t.photo_capture_error);
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
      
      Alert.alert(t.successful, t.photo_removed_success);
      setShowPhotoModal(false);
    } catch (error) {
      console.error('Fotoğraf kaldırma hatası:', error);
      Alert.alert(t.error, t.photo_remove_error);
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
              {t.profile_photo_title}
            </Text>
            <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg }}>
            {t.profile_photo_desc}
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
              📱 {t.choose_from_gallery}
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
              📷 {t.take_photo}
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
                🗑️ {t.remove_photo}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <Header 
        title={t.profile}
        subtitle={t.account_settings}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }}>

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
              {localUserData.email || t.email_not_entered}
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
                ✏️ {t.edit_profile}
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Stats */}
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
              {t.personal_information}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{localUserData.weight || 0}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.current_weight_label}</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{localUserData.targetWeight || 0}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.target_weight_label}</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{localUserData.age || 0}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.age}</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{localUserData.height || 0}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.height}</Text>
              </View>
            </View>
          </Card>

          {/* Settings */}
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
              {t.settings}
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
                  {t.notifications}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
                  {t.workout_reminders}
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
                          const weeklyStats = await programService.getWeeklyStats(userData?.id);
                          
                          // Egzersiz günlerini organize et
                          const exercises = {};
                          for (let day = 0; day < 7; day++) {
                            exercises[day] = weeklyStats[day]?.exercises || [];
                          }
                          
                          // Antrenman bildirimlerini zamanla
                          const workoutDays = Object.keys(exercises).filter(day => exercises[day].length > 0).map(Number);
                          const result = await notificationService.updateWorkoutNotifications(workoutDays, '09:00');
                          
                          // Su hatırlatıcısını da ayarla (eğer diyet ayarlarında aktifse)
                          if (userData?.water_reminders_enabled !== false) {
                            const waterInterval = userData?.reminder_frequency_hours || 2;
                            await scheduleWaterReminder(waterInterval);
                          }
                          
                          if (result.success) {
                            const daysString = Array.isArray(result.scheduledDays) && result.scheduledDays.length > 0 
                              ? result.scheduledDays.join(', ')
                              : (language === 'en' 
                                  ? 'Every workout day at 09:00'
                                  : "Her antrenman günü saat 09:00'da");
                            Alert.alert(
                              t.notifications_enabled,
                              (language === 'tr' 
                                ? `Bildirimler etkinleştirildi!\n\nAntrenman: ${daysString}\nSu Hatırlatıcısı: ${userData?.water_reminders_enabled !== false ? 'Aktif' : 'Kapalı'}`
                                : `Notifications enabled!\n\nWorkout: ${daysString}\nWater Reminder: ${userData?.water_reminders_enabled !== false ? 'Active' : 'Off'}`),
                              [{ text: t.great }]
                            );
                          }
                        } catch (error) {
                          console.error('Antrenman verileri alınamadı:', error);
                          Alert.alert(
                            t.notifications_enabled_simple,
                            t.notifications_auto_schedule
                          );
                        }
                      } else {
                        Alert.alert(
                          t.permission_required,
                          t.notification_permission_required,
                          [{ text: t.ok }]
                        );
                        setNotificationsEnabled(false);
                      }
                    } else {
                      // Bildirimleri kapat
                      await notificationService.cancelAllNotifications();
                      Alert.alert(
                        t.notifications_disabled,
                        t.notifications_disabled_desc,
                        [{ text: t.ok }]
                      );
                    }
                  } catch (error) {
                    console.error('Bildirim ayarı güncelleme hatası:', error);
                    Alert.alert(t.error, t.notification_settings_error);
                  }
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>


            {/* Dark Theme */}
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
                  {t.dark_theme}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
                  {t.appearance_settings}
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
              title={t.data_export}
              subtitle={t.export_all_data}
              onPress={async () => {
                try {
                  Alert.alert(
                    t.data_export_title,
                    t.data_export_confirm,
                    [
                      { text: t.cancel, style: 'cancel' },
                      {
                        text: t.export_data,
                        onPress: async () => {
                          try {
                            // Kullanıcı verilerini Supabase'den çek
                            const { data: workoutSessions } = await supabase
                              .from('workout_sessions')
                              .select('*')
                              .eq('user_id', userData?.id);

                            const { data: weightTracking } = await supabase
                              .from('weight_tracking')
                              .select('*')
                              .eq('user_id', userData?.id);

                            const { data: strengthTracking } = await supabase
                              .from('strength_tracking')
                              .select('*')
                              .eq('user_id', userData?.id);

                            const exportData = {
                              user: userData,
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

                            Alert.alert(t.successful, t.data_exported_success);
                          } catch (error) {
                            console.error('Veri dışa aktarma hatası:', error);
                            Alert.alert(t.error, t.data_export_error);
                          }
                        }
                      }
                    ]
                  );
                } catch (error) {
                  console.error('Dışa aktarma hatası:', error);
                  Alert.alert(t.error, t.export_error_general);
                }
              }}
            />
            <ProfileMenuItem
              colors={colors}
              icon="cloud-upload"
              title={t.cloud_backup}
              subtitle={t.auto_backup_info}
              onPress={() => {
                Alert.alert(
                  t.cloud_backup_title,
                  t.cloud_backup_message,
                  [{ text: t.ok }]
                );
              }}
            />
            <ProfileMenuItem
              colors={colors}
              icon="share"
              title={t.share_data}
              subtitle={t.share_with_trainer}
              onPress={async () => {
                try {
                  const dateStr = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR');
                  const shareMessage = `
${t.progress_report_header}

👤 ${t.share_name_label}: ${localUserData.name}
⚖️ ${t.share_current_weight_label}: ${localUserData.weight} kg
🎯 ${t.share_target_weight_label}: ${localUserData.targetWeight} kg
📏 ${t.share_height_label}: ${localUserData.height} cm
🎂 ${t.share_age_label}: ${localUserData.age}

📊 ${t.share_report_created.replace('{date}', dateStr)}
                  `.trim();

                  await Share.share({
                    message: shareMessage,
                    title: t.progress_report_title
                  });
                } catch (error) {
                  console.error('Paylaşma hatası:', error);
                  Alert.alert(t.error, t.share_error);
                }
              }}
            />
          </Card>

          {/* Language & Theme */}
          <Card style={{ marginBottom: spacing.md }}>
            <TouchableOpacity
              onPress={() => setShowLanguageModal(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 122, 0, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md
              }}>
                <Ionicons name="language" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                  {t.language}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
                  {language === 'tr' ? 'Türkçe' : 'English'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            <ProfileMenuItem
              colors={colors}
              icon="moon"
              title={isDarkMode ? t.light_mode : t.dark_mode}
              subtitle={isDarkMode ? t.switch_to_light : t.switch_to_dark}
              onPress={toggleTheme}
              showArrow={false}
            />
          </Card>

          {/* Support */}
          <Card style={{ marginBottom: spacing.md }}>
            <ProfileMenuItem
              colors={colors}
              icon="help-circle"
              title={t.help_support}
              subtitle={t.faq_contact}
              onPress={() => {
                Alert.alert(
                  t.help_support_title,
                  t.help_support_message,
                  [
                    { text: t.close_button, style: 'cancel' },
                    {
                      text: t.send_email_button,
                      onPress: () => Linking.openURL('mailto:omerpehriz4@gmail.com')
                    }
                  ]
                );
              }}
            />
            <ProfileMenuItem
              colors={colors}
              icon="star"
              title={t.rate_app}
              subtitle={t.rate_app_subtitle}
              onPress={() => {
                Alert.alert(
                  t.rate_app_confirm_title,
                  t.rate_app_confirm_message,
                  [
                    { text: t.maybe_later, style: 'cancel' },
                    {
                      text: t.go_to_app_store,
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
              title={t.about}
              subtitle={t.version}
              onPress={() => {
                Alert.alert(
                  t.about_app_title,
                  t.about_app_message,
                  [
                    { text: t.ok },
                    {
                      text: t.privacy_policy,
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
                t.logout_title,
                t.logout_confirm_message,
                [
                  { text: t.cancel, style: 'cancel' },
                  {
                    text: t.logout_button,
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await logout();
                        // Navigation otomatik olacak çünkü UserContext session'ı izliyor
                      } catch (error) {
                        console.error('❌ Çıkış hatası:', error);
                        Alert.alert(t.error, t.logout_error);
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
              {t.logout}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Photo Selection Modal */}
        <PhotoSelectionModal />

        {/* Edit Profile Modal - TrainingScreen gibi direkt JSX */}
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
                {t.edit_profile}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ gap: spacing.md }}>
                  <View>
                    <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>{t.full_name_label}</Text>
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
                    <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>{t.email}</Text>
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
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>{t.weight_kg}</Text>
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
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>{t.target_kg}</Text>
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
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>{t.age}</Text>
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
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>{t.height}</Text>
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
                      Alert.alert(t.warning, t.name_email_required);
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

                      Alert.alert(t.successful, t.profile_updated_success);
                      setShowEditModal(false);
                    } catch (error) {
                      console.error('Profil güncelleme hatası:', error);
                      Alert.alert(t.error, t.profile_update_error);
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
                    ✅ {t.save}
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
                    ❌ {t.cancel}
                  </Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Language Selection Modal */}
        <LanguageSelector
          visible={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          showInModal={true}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
