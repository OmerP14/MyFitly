import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Bildirim ayarları
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async (silent = false) => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    console.log('🔔 Mevcut bildirim izin durumu:', existingStatus);
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('🔔 Yeni bildirim izin durumu:', status);
    }
    
    if (finalStatus !== 'granted') {
      if (!silent) {
        alert('Bildirim izni verilmedi!');
      }
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Bildirim izni hatası:', error);
    return false;
  }
};

// Alias for compatibility with ProfileScreen
export const requestNotificationPermissions = requestPermissions;

// İzin durumunu kontrol et (sormadan)
export const checkPermissionStatus = async () => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('❌ İzin durumu kontrol hatası:', error);
    return false;
  }
};

// Çeşitli su içme mesajları
const waterReminderMessages = [
  "💧 Su içme zamanı! Vücudunuzun %60'ı sudan oluşuyor. Hidrasyonunuzu koruyun!",
  "🌊 Su içmeyi unutmayın! Enerjinizi artırın ve konsantrasyonunuzu güçlendirin.",
  "💙 Su içme vakti! Cildiniz ve sağlığınız için su çok önemli.",
  "🚰 Su içme hatırlatması! Metabolizmanızı hızlandırın ve toksinleri atın.",
  "💧 Su içme zamanı! Kaslarınızın %75'i sudan oluşuyor. Performansınızı artırın!",
  "🌊 Su içmeyi unutmayın! Beyninizin %85'i sudan oluşuyor. Zihinsel performansınızı koruyun.",
  "💙 Su içme vakti! Eklemlerinizi koruyun ve esnekliğinizi artırın.",
  "🚰 Su içme hatırlatması! Sindirim sisteminizi destekleyin ve sağlıklı kalın.",
  "💧 Su içme zamanı! Bağışıklık sisteminizi güçlendirin ve hastalıklardan korunun.",
  "🌊 Su içmeyi unutmayın! Kan dolaşımınızı iyileştirin ve enerjinizi artırın."
];

export const scheduleWaterReminder = async (intervalHours = 2) => {
  try {
    console.log('🔔 Su hatırlatıcısı ayarlanıyor:', intervalHours, 'saat');
    
    // Önce izin iste
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('❌ Bildirim izni yok!');
      return { success: false, error: 'no_permission' };
    }

    // Mevcut su hatırlatıcılarını iptal et
    await cancelWaterReminders();

    // intervalHours çok küçükse minimum 0.5 saat (30 dakika) yap
    const finalInterval = Math.max(0.5, intervalHours);
    
    // Rastgele mesaj seç
    const randomMessage = waterReminderMessages[Math.floor(Math.random() * waterReminderMessages.length)];
    
    // Yeni hatırlatıcı oluştur
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Su İçme Zamanı!',
        body: randomMessage,
        sound: 'default',
        data: {
          type: 'water_reminder',
          interval: finalInterval
        }
      },
      trigger: {
        seconds: finalInterval * 3600, // Saatleri saniyeye çevir
        repeats: true,
      },
    });

    console.log(`✅ Su hatırlatıcısı ${finalInterval} saatte bir ayarlandı, ID:`, notificationId);
    return { success: true, notificationId, interval: finalInterval };
  } catch (error) {
    console.error('❌ Su hatırlatıcısı hatası:', error);
    return { success: false, error: error.message };
  }
};

export const scheduleMealReminder = async (mealType, time) => {
  try {
    // Önce izin iste
    const hasPermission = await requestPermissions();
    if (!hasPermission) return false;

    // Öğün hatırlatıcısı oluştur
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🍽️ ${mealType} Zamanı!`,
        body: `${mealType} öğününüz için hatırlatma.`,
        sound: 'default',
      },
      trigger: {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      },
    });

    console.log(`✅ ${mealType} hatırlatıcısı ayarlandı`);
    return true;
  } catch (error) {
    console.error('❌ Öğün hatırlatıcısı hatası:', error);
    return false;
  }
};

export const cancelWaterReminders = async () => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Su hatırlatıcılarını bul ve iptal et
    const waterReminders = scheduledNotifications.filter(
      notification => notification.content.title?.includes('💧')
    );
    
    for (const reminder of waterReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }
    
    console.log('✅ Su hatırlatıcıları iptal edildi');
    return true;
  } catch (error) {
    console.error('❌ Su hatırlatıcıları iptal hatası:', error);
    return false;
  }
};

export const cancelMealReminders = async () => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Öğün hatırlatıcılarını bul ve iptal et
    const mealReminders = scheduledNotifications.filter(
      notification => notification.content.title?.includes('🍽️')
    );
    
    for (const reminder of mealReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }
    
    console.log('✅ Öğün hatırlatıcıları iptal edildi');
    return true;
  } catch (error) {
    console.error('❌ Öğün hatırlatıcıları iptal hatası:', error);
    return false;
  }
};

export const getAllScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('❌ Bildirimler alınamadı:', error);
    return [];
  }
};

// Tüm bildirimleri iptal et
export const cancelAllNotifications = async () => {
  try {
    console.log('🔔 Tüm bildirimler iptal ediliyor...');
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Tüm bildirimler iptal edildi');
    return true;
  } catch (error) {
    console.error('❌ Tüm bildirimler iptal hatası:', error);
    return false;
  }
};

// Antrenman bildirimlerini güncelle
export const updateWorkoutNotifications = async (workoutDays, reminderTime = '09:00') => {
  try {
    console.log('🔔 Antrenman bildirimleri güncelleniyor...', workoutDays, reminderTime);
    
    // Önce izin iste
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('❌ Bildirim izni yok!');
      return { success: false, error: 'no_permission' };
    }

    // Mevcut antrenman bildirimlerini iptal et
    await cancelWorkoutReminders();

    // reminderTime kontrolü ve varsayılan değer
    const timeString = reminderTime || '09:00';
    console.log('⏰ Hatırlatma saati:', timeString);
    
    // Yeni antrenman hatırlatıcıları oluştur
    const [hour, minute] = timeString.split(':').map(Number);
    
    for (const day of workoutDays) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏋️ Antrenman Zamanı!',
          body: `Bugün antrenman gününüz! Hedeflerinize ulaşmak için çalışmaya başlayın.`,
          sound: 'default',
          data: {
            type: 'workout_reminder',
            day: day
          }
        },
        trigger: {
          weekday: day, // 1=Pazartesi, 2=Salı, ..., 7=Pazar
          hour: hour,
          minute: minute,
          repeats: true,
        },
      });
    }

    console.log(`✅ Antrenman bildirimleri ayarlandı: ${workoutDays.length} gün`);
    return { success: true, days: workoutDays.length };
  } catch (error) {
    console.error('❌ Antrenman bildirimleri güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Antrenman hatırlatıcılarını iptal et
export const cancelWorkoutReminders = async () => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Antrenman hatırlatıcılarını bul ve iptal et
    const workoutReminders = scheduledNotifications.filter(
      notification => notification.content.title?.includes('🏋️')
    );
    
    for (const reminder of workoutReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }
    
    console.log('✅ Antrenman hatırlatıcıları iptal edildi');
    return true;
  } catch (error) {
    console.error('❌ Antrenman hatırlatıcıları iptal hatası:', error);
    return false;
  }
};

// Vitamin hatırlatıcısı
export const scheduleVitaminReminder = async (time) => {
  try {
    console.log('🔔 Vitamin hatırlatıcısı ayarlanıyor:', time);
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) return { success: false, error: 'no_permission' };

    const [hour, minute] = time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Vitamin Zamanı!',
        body: 'Vitamin almanız için hatırlatma.',
        sound: 'default',
        data: { type: 'vitamin_reminder' }
      },
      trigger: {
        hour: hour,
        minute: minute,
        repeats: true,
      },
    });

    console.log('✅ Vitamin hatırlatıcısı ayarlandı');
    return { success: true };
  } catch (error) {
    console.error('❌ Vitamin hatırlatıcısı hatası:', error);
    return { success: false, error: error.message };
  }
};

// Uyku hatırlatıcısı
export const scheduleSleepReminder = async (time) => {
  try {
    console.log('🔔 Uyku hatırlatıcısı ayarlanıyor:', time);
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) return { success: false, error: 'no_permission' };

    const [hour, minute] = time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Uyku Zamanı!',
        body: 'Sağlıklı uyku için yatmaya hazırlanın.',
        sound: 'default',
        data: { type: 'sleep_reminder' }
      },
      trigger: {
        hour: hour,
        minute: minute,
        repeats: true,
      },
    });

    console.log('✅ Uyku hatırlatıcısı ayarlandı');
    return { success: true };
  } catch (error) {
    console.error('❌ Uyku hatırlatıcısı hatası:', error);
    return { success: false, error: error.message };
  }
};

// Test fonksiyonları
export const testAllNotifications = async () => {
  try {
    console.log('🧪 Tüm bildirimler test ediliyor...');
    
    // İzin kontrolü
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('❌ Bildirim izni yok!');
      return { success: false, error: 'no_permission' };
    }

    // Mevcut bildirimleri listele
    const scheduledNotifications = await getAllScheduledNotifications();
    console.log('📋 Mevcut bildirimler:', scheduledNotifications.length);
    
    scheduledNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.content.title} - ${notification.content.body}`);
    });

    // Test bildirimleri oluştur (5 saniye sonra)
    const testNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Bildirimi',
        body: 'Bu bir test bildirimidir. Bildirimler çalışıyor!',
        sound: 'default',
        data: { type: 'test' }
      },
      trigger: {
        seconds: 5,
      },
    });

    console.log('✅ Test bildirimi ayarlandı, ID:', testNotificationId);
    return { 
      success: true, 
      testId: testNotificationId,
      scheduledCount: scheduledNotifications.length 
    };
  } catch (error) {
    console.error('❌ Test hatası:', error);
    return { success: false, error: error.message };
  }
};

// Bildirim durumunu kontrol et
export const checkNotificationStatus = async () => {
  try {
    console.log('🔍 Bildirim durumu kontrol ediliyor...');
    
    // İzin durumu
    const hasPermission = await checkPermissionStatus();
    console.log('🔔 İzin durumu:', hasPermission ? 'Verildi' : 'Verilmedi');
    
    // Planlanmış bildirimler
    const scheduledNotifications = await getAllScheduledNotifications();
    console.log('📅 Planlanmış bildirim sayısı:', scheduledNotifications.length);
    
    // Bildirim türlerine göre grupla
    const notificationTypes = {
      water: 0,
      meal: 0,
      workout: 0,
      vitamin: 0,
      sleep: 0,
      other: 0
    };
    
    scheduledNotifications.forEach(notification => {
      const title = notification.content.title || '';
      if (title.includes('💧')) notificationTypes.water++;
      else if (title.includes('🍽️')) notificationTypes.meal++;
      else if (title.includes('🏋️')) notificationTypes.workout++;
      else if (title.includes('💊')) notificationTypes.vitamin++;
      else if (title.includes('🌙')) notificationTypes.sleep++;
      else notificationTypes.other++;
    });
    
    console.log('📊 Bildirim türleri:', notificationTypes);
    
    return {
      success: true,
      hasPermission,
      totalNotifications: scheduledNotifications.length,
      notificationTypes,
      notifications: scheduledNotifications
    };
  } catch (error) {
    console.error('❌ Durum kontrol hatası:', error);
    return { success: false, error: error.message };
  }
};

// Test bildirimini iptal et
export const cancelTestNotification = async (testId) => {
  try {
    if (testId) {
      await Notifications.cancelScheduledNotificationAsync(testId);
      console.log('✅ Test bildirimi iptal edildi');
    }
    return true;
  } catch (error) {
    console.error('❌ Test bildirimi iptal hatası:', error);
    return false;
  }
};