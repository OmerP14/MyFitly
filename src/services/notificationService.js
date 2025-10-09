/**
 * NOTIFICATION SERVICE
 * Antrenman günlerinde bildirim gönderir
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Motivasyon sözleri listesi
const motivationQuotes = [
  { text: "Disiplin > Motivasyon", emoji: "💪" },
  { text: "Bugün yapmazsanız, yarın yapan birini izlersiniz", emoji: "🔥" },
  { text: "Başarı, günlük küçük çabaların toplamıdır", emoji: "🎯" },
  { text: "Ağrı geçicidir, başarı kalıcıdır", emoji: "⚡" },
  { text: "Hedefine odaklan, sürekli ilerle", emoji: "🚀" },
  { text: "Senin için mümkün olmayan bir şey yok", emoji: "💯" },
  { text: "Her gün kendini geliştirmeye devam et", emoji: "📈" },
  { text: "Zorluklarla büyürsün, rahatlıkla körleşirsin", emoji: "🏋️" },
  { text: "Başlamak, başarmanın yarısıdır", emoji: "✨" },
  { text: "İmkansız, denemeyenlerin sözlüğünde yazılı", emoji: "🌟" },
  { text: "Her tekrar seni hedefe bir adım daha yaklaştırır", emoji: "🎖️" },
  { text: "Kendinle yarışıyorsun, dünkü halinle", emoji: "⭐" },
  { text: "Acı geçicidir, vazgeçmek kalıcıdır", emoji: "💥" },
  { text: "Sınırlarını zorla, sınırların genişlesin", emoji: "🔝" },
  { text: "Bugün yapacağın antrenman, yarının gücü", emoji: "⚡" }
];

/**
 * Bildirim izinlerini al
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('⚠️ Bildirim izni verilmedi');
      return false;
    }
    
    console.log('✅ Bildirim izni alındı');
    
    // Android için bildirim kanalı oluştur
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('workout-reminders', {
        name: 'Antrenman Hatırlatıcıları',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF7A00',
        sound: 'default',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Bildirim izni alma hatası:', error);
    return false;
  }
};

/**
 * Tüm zamanlanmış bildirimleri iptal et
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Tüm bildirimler iptal edildi');
  } catch (error) {
    console.error('Bildirim iptal etme hatası:', error);
  }
};

/**
 * Rastgele motivasyon sözü getir
 */
const getRandomMotivationQuote = () => {
  const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
  return motivationQuotes[randomIndex];
};

/**
 * Antrenman bildirimleri zamanla
 * @param {Object} workoutDays - {0: true, 1: true, ...} formatında antrenman günleri
 * @param {string} notificationTime - Bildirim saati (HH:MM formatında)
 */
export const scheduleWorkoutNotifications = async (workoutDays = {}, notificationTime = '09:00') => {
  try {
    console.log('📅 Antrenman bildirimleri zamanlanıyor...', workoutDays);
    
    // Önce tüm eski bildirimleri iptal et
    await cancelAllNotifications();
    
    // Bildirim zamanını parse et
    const [hour, minute] = notificationTime.split(':').map(Number);
    
    // Antrenman günlerini kontrol et
    const hasWorkoutDays = Object.values(workoutDays).some(hasWorkout => hasWorkout);
    
    if (!hasWorkoutDays) {
      console.log('⚠️ Antrenman günü yok, bildirim zamanlanmıyor');
      return {
        success: true,
        message: 'Antrenman günü yok',
        scheduledCount: 0
      };
    }
    
    // GÜNLÜK MAKSİMUM 1 BİLDİRİM - Sadece bugünkü spor zamanı + mini motivasyon sözü
    const trigger = {
      hour: hour,
      minute: minute,
      repeats: true
    };
    
    // Rastgele motivasyon sözü seç (kısa ve öz)
    const quote = getRandomMotivationQuote();
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏋️ Bugünkü Antrenman',
        body: `${quote.emoji} ${quote.text}`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
        data: { 
          type: 'workout-reminder',
          daily: true
        },
      },
      trigger,
    });
    
    console.log(`✅ Günlük antrenman bildirimi zamanlandı (ID: ${notificationId}) - Saat: ${notificationTime}`);
    console.log('✅ Günde maksimum 1 bildirim zamanlandı');
    return {
      success: true,
      message: 'Günlük antrenman bildirimi zamanlandı',
      scheduledCount: 1
    };
  } catch (error) {
    console.error('Bildirim zamanlama hatası:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Motivasyon bildirimleri zamanla (haftada 2-3 tane)
 */
export const scheduleMotivationNotifications = async () => {
  try {
    console.log('✨ Motivasyon bildirimleri zamanlanıyor...');
    
    // Haftada 2-3 motivasyon bildirimi (rastgele günler)
    const motivationDays = [2, 4, 6]; // Salı, Perşembe, Cumartesi
    const motivationHours = [11, 15, 20]; // 11:00, 15:00, 20:00
    
    for (let i = 0; i < motivationDays.length; i++) {
      const day = motivationDays[i];
      const hour = motivationHours[i];
      const quote = getRandomMotivationQuote();
      
      const trigger = {
        weekday: day + 1,
        hour: hour,
        minute: 0,
        repeats: true
      };
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${quote.emoji} Motivasyon`,
          body: quote.text,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          vibrate: [0, 250, 250, 250],
          data: { 
            type: 'motivation-quote',
            quote: quote.text
          },
        },
        trigger,
      });
      
      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      console.log(`✨ ${dayNames[day]} ${hour}:00 için motivasyon bildirimi zamanlandı (ID: ${notificationId})`);
    }
    
    console.log('✅ Motivasyon bildirimleri başarıyla eklendi');
    return true;
  } catch (error) {
    console.error('Motivasyon bildirimi zamanlama hatası:', error);
    return false;
  }
};

/**
 * Antrenman günlerini ProgramScreen'den al ve bildirimleri ayarla
 * @param {Object} exercises - Günlük egzersiz listesi
 * @param {boolean} enabled - Bildirimler açık mı?
 */
export const updateWorkoutNotifications = async (exercises, enabled = true) => {
  try {
    if (!enabled) {
      // Bildirimler kapalıysa tüm bildirimleri iptal et
      await cancelAllNotifications();
      console.log('✅ Bildirimler kapatıldı');
      return { success: true, message: 'Bildirimler kapatıldı' };
    }
    
    // Bildirim izni kontrolü
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return { 
        success: false, 
        message: 'Bildirim izni verilmedi' 
      };
    }
    
    // ÖNEMLİ: Önce tüm mevcut bildirimleri iptal et
    await cancelAllNotifications();
    console.log('🗑️ Mevcut bildirimler iptal edildi');
    
    // Antrenman günlerini belirle
    const workoutDays = {};
    for (let day = 0; day < 7; day++) {
      // Bu günde egzersiz varsa true
      workoutDays[day] = exercises[day] && exercises[day].length > 0;
    }
    
    console.log('📊 Antrenman günleri:', workoutDays);
    
    // Bildirim zamanını al (varsayılan: 09:00)
    let notificationTime = await AsyncStorage.getItem('notification_time');
    if (!notificationTime) {
      notificationTime = '09:00';
      await AsyncStorage.setItem('notification_time', notificationTime);
    }
    
    // Sadece antrenman günleri için bildirimleri zamanla
    const result = await scheduleWorkoutNotifications(workoutDays, notificationTime);
    
    return result;
  } catch (error) {
    console.error('Bildirim güncelleme hatası:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Bildirim zamanını değiştir
 * @param {string} time - HH:MM formatında saat
 */
export const setNotificationTime = async (time) => {
  try {
    await AsyncStorage.setItem('notification_time', time);
    console.log('✅ Bildirim zamanı güncellendi:', time);
    return true;
  } catch (error) {
    console.error('Bildirim zamanı kaydetme hatası:', error);
    return false;
  }
};

/**
 * Bildirim zamanını al
 */
export const getNotificationTime = async () => {
  try {
    const time = await AsyncStorage.getItem('notification_time');
    return time || '09:00';
  } catch (error) {
    console.error('Bildirim zamanı okuma hatası:', error);
    return '09:00';
  }
};

/**
 * Zamanlanmış bildirimleri göster
 */
export const getScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Zamanlanmış bildirimler:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('Zamanlanmış bildirimleri okuma hatası:', error);
    return [];
  }
};

/**
 * Test bildirimi gönder (hemen)
 */
export const sendTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏋️ Test Bildirimi',
        body: 'Bildirimler başarıyla çalışıyor! 💪',
        sound: 'default',
        data: { type: 'test' },
      },
      trigger: {
        seconds: 2, // 2 saniye sonra gönder
      },
    });
    
    console.log('✅ Test bildirimi gönderildi');
    return true;
  } catch (error) {
    console.error('Test bildirimi hatası:', error);
    return false;
  }
};

export default {
  requestNotificationPermissions,
  cancelAllNotifications,
  scheduleWorkoutNotifications,
  scheduleMotivationNotifications,
  updateWorkoutNotifications,
  setNotificationTime,
  getNotificationTime,
  getScheduledNotifications,
  sendTestNotification,
};

