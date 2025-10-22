// src/screens/DietNotificationsScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Switch, Alert, FlatList, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import syncService from '../services/syncService';
// Card component - Fitly uygulamasına uygun koyu card
const Card = ({ children, style }) => (
  <View style={[{
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#30363D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5
  }, style]}>
    {children}
  </View>
);
// Context imports - Fitly uygulamasına uygun koyu tema
const useTheme = () => ({
  colors: {
    background: '#0D1117',
    text: '#F0F6FC',
    textSecondary: '#8B949E',
    primary: '#FF6B35',
    surface: '#161B22',
    border: '#30363D',
    accent: '#E94560'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  }
});

const useUser = () => ({
  userData: {
    id: '1',
    meal_reminders: true,
    water_reminders: true,
    vitamin_reminders: true,
    vitamin_reminder_time: '09:00',
    sleep_reminders: true,
    sleep_reminder_time: '22:00',
    water_reminder_interval: 2
  }
});

const useLanguage = () => ({
  t: (key) => {
    const translations = {
      'dietNotifications': 'Hatırlatıcı Ayarları',
      'mealReminders': 'Yemek Hatırlatıcıları',
      'mealRemindersDescription': 'Yemek saatlerinizde bildirim alın',
      'waterReminders': 'Su Hatırlatıcıları',
      'waterRemindersDescription': 'Düzenli su içmeyi unutmayın',
      'reminderInterval': 'Hatırlatma Aralığı',
      'vitaminReminders': 'Vitamin Hatırlatıcıları',
      'vitaminRemindersDescription': 'Vitamin almayı unutmayın',
      'reminderTime': 'Hatırlatma Saati',
      'sleepReminders': 'Uyku Hatırlatıcıları',
      'sleepRemindersDescription': 'Düzenli uyku saatlerinizi koruyun',
      'saveSettings': 'Ayarları Kaydet'
    };
    return translations[key] || key;
  }
});
// Mock services - gerçek servisler mevcut değilse
const supabase = {
  from: () => ({
    update: () => ({
      eq: () => Promise.resolve({ error: null })
    })
  })
};

const scheduleNotification = async (id, title, body, type, time, interval) => {
  console.log('📱 Bildirim planlandı:', { id, title, body, type, time, interval });
  return Promise.resolve();
};

const cancelNotification = async (id) => {
  console.log('❌ Bildirim iptal edildi:', id);
  return Promise.resolve();
};

export default function DietNotificationsScreen({ navigation }) {
  const { colors, spacing } = useTheme();
  const { userData } = useUser();
  const { t } = useLanguage();

  const [settings, setSettings] = useState({
    mealReminders: userData?.meal_reminders || true,
    breakfastTime: userData?.breakfast_time || '08:00',
    lunchTime: userData?.lunch_time || '13:00',
    dinnerTime: userData?.dinner_time || '19:00',
    waterReminders: userData?.water_reminders || true,
    vitaminReminders: userData?.vitamin_reminders || true,
    vitaminReminderTime: userData?.vitamin_reminder_time || '09:00',
    sleepReminders: userData?.sleep_reminders || true,
    sleepReminderTime: userData?.sleep_reminder_time || '22:00',
    waterReminderInterval: userData?.water_reminder_interval || 2
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerType, setPickerType] = useState('vitamin'); // 'vitamin', 'sleep', 'breakfast', 'lunch', 'dinner'
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  // Time picker açıldığında mevcut saati pozisyonla
  useEffect(() => {
    if (showTimePicker) {
      setTimeout(() => {
        let currentTime;
        switch (pickerType) {
          case 'vitamin':
            currentTime = settings.vitaminReminderTime;
            break;
          case 'sleep':
            currentTime = settings.sleepReminderTime;
            break;
          case 'breakfast':
            currentTime = settings.breakfastTime;
            break;
          case 'lunch':
            currentTime = settings.lunchTime;
            break;
          case 'dinner':
            currentTime = settings.dinnerTime;
            break;
          default:
            currentTime = '09:00';
        }
        
        const [hour, minute] = currentTime.split(':');
        
        setSelectedHour(parseInt(hour));
        setSelectedMinute(parseInt(minute));
        
        // Scroll to current time
        if (hourScrollRef.current) {
          hourScrollRef.current.scrollTo({ 
            y: parseInt(hour) * 40, 
            animated: false 
          });
        }
        
        if (minuteScrollRef.current) {
          minuteScrollRef.current.scrollTo({ 
            y: parseInt(minute) * 40, 
            animated: false 
          });
        }
      }, 300);
    }
  }, [showTimePicker, pickerType]);

  const saveSettings = async () => {
    try {
      console.log('💾 Bildirim ayarları kaydediliyor...', settings);

      const { error } = await supabase
        .from('users')
        .update({
          meal_reminders: settings.mealReminders,
          breakfast_time: settings.breakfastTime,
          lunch_time: settings.lunchTime,
          dinner_time: settings.dinnerTime,
          water_reminders: settings.waterReminders,
          water_reminder_interval: settings.waterReminderInterval,
          vitamin_reminders: settings.vitaminReminders,
          vitamin_reminder_time: settings.vitaminReminderTime,
          sleep_reminders: settings.sleepReminders,
          sleep_reminder_time: settings.sleepReminderTime
        })
        .eq('id', userData.id);

      if (error) {
        console.error('❌ Bildirim ayarları kaydedilemedi:', error);
        Alert.alert('Hata', 'Bildirim ayarları kaydedilemedi');
        return;
      }

      console.log('✅ Bildirim ayarları başarıyla kaydedildi');

      // Bildirimleri güncelle
      await updateNotifications();

      // Real-time senkronizasyon tetikle
      if (userData?.id) {
        await syncService.fullSync(userData.id);
        console.log('🔄 Veriler real-time senkronize edildi');
      }

      Alert.alert('Başarılı', 'Bildirim ayarları kaydedildi ve senkronize edildi');
    } catch (error) {
      console.error('❌ Bildirim ayarları kaydetme hatası:', error);
      Alert.alert('Hata', 'Bildirim ayarları kaydedilemedi');
    }
  };

  const updateNotifications = async () => {
    try {
      // Gerçek bildirim servislerini import et
      const { 
        scheduleWaterReminder, 
        scheduleVitaminReminder, 
        scheduleSleepReminder,
        cancelAllNotifications 
      } = await import('../services/notificationService');

      // Mevcut bildirimleri iptal et
      await cancelAllNotifications();

      // Yeni bildirimleri planla
      if (settings.waterReminders) {
        await scheduleWaterReminder(settings.waterReminderInterval);
        console.log('💧 Su hatırlatıcısı ayarlandı:', settings.waterReminderInterval, 'saat');
      }

      if (settings.vitaminReminders) {
        await scheduleVitaminReminder(settings.vitaminReminderTime);
        console.log('💊 Vitamin hatırlatıcısı ayarlandı:', settings.vitaminReminderTime);
      }

      if (settings.sleepReminders) {
        await scheduleSleepReminder(settings.sleepReminderTime);
        console.log('🌙 Uyku hatırlatıcısı ayarlandı:', settings.sleepReminderTime);
      }

      // Yemek hatırlatıcıları için ayrı ayrı planla
      if (settings.mealReminders) {
        // Kahvaltı hatırlatıcısı
        const { scheduleMealReminder } = await import('../services/notificationService');
        const [breakfastHour, breakfastMinute] = settings.breakfastTime.split(':').map(Number);
        const [lunchHour, lunchMinute] = settings.lunchTime.split(':').map(Number);
        const [dinnerHour, dinnerMinute] = settings.dinnerTime.split(':').map(Number);
        
        await scheduleMealReminder('Kahvaltı', { hour: breakfastHour, minute: breakfastMinute });
        await scheduleMealReminder('Öğle Yemeği', { hour: lunchHour, minute: lunchMinute });
        await scheduleMealReminder('Akşam Yemeği', { hour: dinnerHour, minute: dinnerMinute });
        
        console.log('🍽️ Yemek hatırlatıcıları ayarlandı');
      }

      console.log('✅ Tüm bildirimler güncellendi');
    } catch (error) {
      console.error('❌ Bildirim güncelleme hatası:', error);
    }
  };

  // Real-time senkronizasyon başlat
  useEffect(() => {
    const startSync = async () => {
      if (userData?.id) {
        console.log('🔄 Real-time senkronizasyon başlatılıyor...');
        await syncService.startRealtimeSync(userData.id);
        
        // Tam senkronizasyon yap
        const syncData = await syncService.fullSync(userData.id);
        if (syncData) {
          console.log('✅ Veriler senkronize edildi:', syncData);
        }
      }
    };

    startSync();

    // Cleanup
    return () => {
      syncService.stopRealtimeSync();
    };
  }, [userData?.id]);

  const openTimePicker = (type) => {
    setPickerType(type);
    setShowTimePicker(true);
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
  };

  const handleTimeSave = () => {
    const newTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    
    switch (pickerType) {
      case 'vitamin':
        setSettings(prev => ({ ...prev, vitaminReminderTime: newTime }));
        break;
      case 'sleep':
        setSettings(prev => ({ ...prev, sleepReminderTime: newTime }));
        break;
      case 'breakfast':
        setSettings(prev => ({ ...prev, breakfastTime: newTime }));
        break;
      case 'lunch':
        setSettings(prev => ({ ...prev, lunchTime: newTime }));
        break;
      case 'dinner':
        setSettings(prev => ({ ...prev, dinnerTime: newTime }));
        break;
    }
    
    setShowTimePicker(false);
  };

  const adjustTime = (type, direction) => {
    const currentTime = type === 'vitamin' ? settings.vitaminReminderTime : settings.sleepReminderTime;
    const [hour, minute] = currentTime.split(':');
    let newHour = parseInt(hour);
    let newMinute = parseInt(minute);

    if (direction === 'up') {
      if (type === 'vitamin') {
        newHour = Math.min(21, newHour + 1);
      } else {
        newHour = newHour === 23 ? 20 : newHour + 1;
      }
    } else {
      if (type === 'vitamin') {
        newHour = Math.max(6, newHour - 1);
      } else {
        newHour = newHour === 20 ? 23 : newHour - 1;
      }
    }

    const newTime = `${String(newHour).padStart(2, '0')}:${minute}`;
    
    if (type === 'vitamin') {
      setSettings(prev => ({...prev, vitaminReminderTime: newTime}));
    } else {
      setSettings(prev => ({...prev, sleepReminderTime: newTime}));
    }
  };

  const adjustMinute = (type, direction) => {
    const currentTime = type === 'vitamin' ? settings.vitaminReminderTime : settings.sleepReminderTime;
    const [hour, minute] = currentTime.split(':');
    const minuteOptions = ['00', '15', '30', '45'];
    const currentIndex = minuteOptions.indexOf(minute);
    
    let newIndex;
    if (direction === 'up') {
      newIndex = (currentIndex + 1) % minuteOptions.length;
    } else {
      newIndex = currentIndex === 0 ? minuteOptions.length - 1 : currentIndex - 1;
    }
    
    const newTime = `${hour}:${minuteOptions[newIndex]}`;
    
    if (type === 'vitamin') {
      setSettings(prev => ({...prev, vitaminReminderTime: newTime}));
    } else {
      setSettings(prev => ({...prev, sleepReminderTime: newTime}));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            if (navigation && navigation.goBack) {
              navigation.goBack();
            } else {
              console.log('Navigation bulunamadı');
            }
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '600', 
            color: colors.text
          }}>
            {t('dietNotifications')}
          </Text>
          <Text style={{ 
            fontSize: 12, 
            color: colors.textSecondary,
            marginTop: 2
          }}>
            Bildirim ayarlarınızı yönetin
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>

        {/* Yemek Hatırlatıcıları */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: colors.primary + '20',
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md
              }}>
                <Ionicons name="restaurant" size={20} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, flex: 1 }}>
                {t('mealReminders')}
              </Text>
            </View>
            <Switch
              value={settings.mealReminders}
              onValueChange={(value) => setSettings(prev => ({...prev, mealReminders: value}))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.mealReminders ? colors.background : colors.text}
            />
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: spacing.md }}>
            {t('mealRemindersDescription')}
          </Text>

          {/* Kahvaltı Saati */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginBottom: spacing.sm }}>
              🌅 Kahvaltı
            </Text>
            <TouchableOpacity
              onPress={() => openTimePicker('breakfast')}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.surface,
                padding: spacing.md,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {t('reminderTime')}: {settings.breakfastTime}
              </Text>
              <Ionicons name="time-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Öğle Yemeği Saati */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginBottom: spacing.sm }}>
              ☀️ Öğle Yemeği
            </Text>
            <TouchableOpacity
              onPress={() => openTimePicker('lunch')}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.surface,
                padding: spacing.md,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {t('reminderTime')}: {settings.lunchTime}
              </Text>
              <Ionicons name="time-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Akşam Yemeği Saati */}
          <View style={{ marginBottom: spacing.sm }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginBottom: spacing.sm }}>
              🌙 Akşam Yemeği
            </Text>
            <TouchableOpacity
              onPress={() => openTimePicker('dinner')}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.surface,
                padding: spacing.md,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {t('reminderTime')}: {settings.dinnerTime}
              </Text>
              <Ionicons name="time-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Su Hatırlatıcıları */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: colors.primary + '20',
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md
              }}>
                <Ionicons name="water" size={20} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, flex: 1 }}>
                {t('waterReminders')}
              </Text>
            </View>
            <Switch
              value={settings.waterReminders}
              onValueChange={(value) => setSettings(prev => ({...prev, waterReminders: value}))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.waterReminders ? colors.background : colors.text}
            />
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: spacing.sm }}>
            {t('waterRemindersDescription')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text style={{ color: colors.text, fontSize: 16 }}>
              {t('reminderInterval')}:
            </Text>
            <TouchableOpacity
              onPress={() => setSettings(prev => ({...prev, waterReminderInterval: Math.max(1, prev.waterReminderInterval - 1)}))}
              style={{ backgroundColor: colors.primary, padding: spacing.sm, borderRadius: 6 }}
            >
              <Text style={{ color: colors.background, fontWeight: 'bold' }}>-</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontSize: 16, minWidth: 30, textAlign: 'center' }}>
              {settings.waterReminderInterval}h
            </Text>
            <TouchableOpacity
              onPress={() => setSettings(prev => ({...prev, waterReminderInterval: Math.min(6, prev.waterReminderInterval + 1)}))}
              style={{ backgroundColor: colors.primary, padding: spacing.sm, borderRadius: 6 }}
            >
              <Text style={{ color: colors.background, fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Vitamin Hatırlatıcıları */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: colors.primary + '20',
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md
              }}>
                <Ionicons name="medical" size={20} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, flex: 1 }}>
                {t('vitaminReminders')}
              </Text>
            </View>
            <Switch
              value={settings.vitaminReminders}
              onValueChange={(value) => setSettings(prev => ({...prev, vitaminReminders: value}))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.vitaminReminders ? colors.background : colors.text}
            />
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: spacing.sm }}>
            {t('vitaminRemindersDescription')}
          </Text>
          <TouchableOpacity
            onPress={() => openTimePicker('vitamin')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.surface,
              padding: spacing.md,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16 }}>
              {t('reminderTime')}: {settings.vitaminReminderTime}
            </Text>
            <Ionicons name="time-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </Card>

        {/* Uyku Hatırlatıcıları */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: colors.primary + '20',
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md
              }}>
                <Ionicons name="moon" size={20} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, flex: 1 }}>
                {t('sleepReminders')}
              </Text>
            </View>
            <Switch
              value={settings.sleepReminders}
              onValueChange={(value) => setSettings(prev => ({...prev, sleepReminders: value}))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.sleepReminders ? colors.background : colors.text}
            />
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: spacing.sm }}>
            {t('sleepRemindersDescription')}
          </Text>
          <TouchableOpacity
            onPress={() => openTimePicker('sleep')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.surface,
              padding: spacing.md,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16 }}>
              {t('reminderTime')}: {settings.sleepReminderTime}
            </Text>
            <Ionicons name="time-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </Card>

        {/* Test Butonları */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: colors.text, 
            marginBottom: spacing.md 
          }}>
            🧪 Test Bildirimleri
          </Text>
          
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <TouchableOpacity
              onPress={async () => {
                const { testAllNotifications, checkNotificationStatus } = await import('../services/notificationService');
                const result = await testAllNotifications();
                console.log('Test sonucu:', result);
                Alert.alert('Test', result.success ? 'Test bildirimi gönderildi!' : 'Test başarısız!');
              }}
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                padding: spacing.md,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: colors.background, fontWeight: '600' }}>
                Test Gönder
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={async () => {
                const { checkNotificationStatus } = await import('../services/notificationService');
                const status = await checkNotificationStatus();
                console.log('Bildirim durumu:', status);
                Alert.alert(
                  'Bildirim Durumu', 
                  `Toplam: ${status.totalNotifications}\n` +
                  `Su: ${status.notificationTypes.water}\n` +
                  `Yemek: ${status.notificationTypes.meal}\n` +
                  `Antrenman: ${status.notificationTypes.workout}\n` +
                  `Vitamin: ${status.notificationTypes.vitamin}\n` +
                  `Uyku: ${status.notificationTypes.sleep}`
                );
              }}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                padding: spacing.md,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                Durum Kontrol
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={async () => {
              const { cancelAllNotifications } = await import('../services/notificationService');
              const result = await cancelAllNotifications();
              Alert.alert('Temizlik', result ? 'Tüm bildirimler iptal edildi!' : 'İptal başarısız!');
            }}
            style={{
              backgroundColor: '#FF4444',
              padding: spacing.md,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              Tüm Bildirimleri İptal Et
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Kaydet Butonu */}
        <TouchableOpacity
          onPress={saveSettings}
          style={{
            backgroundColor: colors.primary,
            padding: spacing.lg,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: spacing.lg
          }}
        >
          <Text style={{ color: colors.background, fontSize: 18, fontWeight: '600' }}>
            {t('saveSettings')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Apple Style Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={closeTimePicker}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={closeTimePicker}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 0,
              width: '85%',
              maxWidth: 320,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <View style={{
              paddingHorizontal: 20,
              paddingVertical: 15,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                textAlign: 'center',
              }}>
                {pickerType === 'vitamin' ? 'Vitamin Saati' : 
                 pickerType === 'sleep' ? 'Uyku Saati' :
                 pickerType === 'breakfast' ? 'Kahvaltı Saati' :
                 pickerType === 'lunch' ? 'Öğle Yemeği Saati' :
                 pickerType === 'dinner' ? 'Akşam Yemeği Saati' : 'Saat Seç'}
              </Text>
            </View>

            {/* Time Picker Container */}
            <View style={{
              height: 200,
              flexDirection: 'row',
              position: 'relative',
            }}>
              {/* Gradient Overlays */}
              <LinearGradient
                colors={[colors.surface, 'transparent']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
              <LinearGradient
                colors={['transparent', colors.surface]}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />

              {/* Selection Line */}
              <View style={{
                position: 'absolute',
                top: 80,
                left: 0,
                right: 0,
                height: 40,
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: colors.primary,
                zIndex: 1,
                pointerEvents: 'none',
              }} />

              {/* Hours Column */}
              <View style={{ flex: 1, height: 200 }}>
                <ScrollView
                  ref={hourScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={40}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.y / 40);
                    const newHour = Math.max(0, Math.min(23, index));
                    setSelectedHour(newHour);
                  }}
                  scrollEnabled={true}
                  bounces={false}
                  overScrollMode="never"
                  removeClippedSubviews={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                  contentContainerStyle={{
                    paddingTop: 80,
                    paddingBottom: 80,
                  }}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const isSelected = i === selectedHour;
                    const distance = Math.abs(i - selectedHour);
                    const opacity = distance === 0 ? 1 : Math.max(0.3, 1 - distance * 0.3);
                    const scale = distance === 0 ? 1 : Math.max(0.7, 1 - distance * 0.1);
                    
                    return (
                      <TouchableOpacity
                        key={i}
                        style={{
                          height: 40,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onPress={() => {
                          const newHour = i;
                          setSelectedHour(newHour);
                          if (hourScrollRef.current) {
                            hourScrollRef.current.scrollTo({
                              y: newHour * 40,
                              animated: true
                            });
                          }
                        }}
                      >
                        <Text style={{
                          fontSize: isSelected ? 24 : 20,
                          fontWeight: isSelected ? '700' : '500',
                          color: isSelected ? colors.primary : colors.text,
                          opacity: opacity,
                          transform: [{ scale }],
                        }}>
                          {i.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Colon Separator */}
              <View style={{
                width: 20,
                height: 200,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: colors.primary,
                }}>
                  :
                </Text>
              </View>

              {/* Minutes Column */}
              <View style={{ flex: 1, height: 200 }}>
                <ScrollView
                  ref={minuteScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={40}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.y / 40);
                    const newMinute = Math.max(0, Math.min(59, index));
                    setSelectedMinute(newMinute);
                  }}
                  scrollEnabled={true}
                  bounces={false}
                  overScrollMode="never"
                  removeClippedSubviews={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                  contentContainerStyle={{
                    paddingTop: 80,
                    paddingBottom: 80,
                  }}
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const isSelected = i === selectedMinute;
                    const distance = Math.abs(i - selectedMinute);
                    const opacity = distance === 0 ? 1 : Math.max(0.3, 1 - distance * 0.3);
                    const scale = distance === 0 ? 1 : Math.max(0.7, 1 - distance * 0.1);
                    
                    return (
                      <TouchableOpacity
                        key={i}
                        style={{
                          height: 40,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onPress={() => {
                          const newMinute = i;
                          setSelectedMinute(newMinute);
                          if (minuteScrollRef.current) {
                            minuteScrollRef.current.scrollTo({
                              y: newMinute * 40,
                              animated: true
                            });
                          }
                        }}
                      >
                        <Text style={{
                          fontSize: isSelected ? 24 : 20,
                          fontWeight: isSelected ? '700' : '500',
                          color: isSelected ? colors.primary : colors.text,
                          opacity: opacity,
                          transform: [{ scale }],
                        }}>
                          {i.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              paddingHorizontal: 20,
              paddingVertical: 15,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={closeTimePicker}
              >
                <Text style={{
                  color: colors.text,
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  İptal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginLeft: 10,
                }}
                onPress={handleTimeSave}
              >
                <Text style={{
                  color: '#FFFFFF',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  Kaydet
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}