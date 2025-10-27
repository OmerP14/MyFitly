import { supabase } from '../config/supabase';

class SyncService {
  constructor() {
    this.subscriptions = new Map();
    this.isOnline = true;
    this.syncQueue = [];
    this.lastSyncTime = null;
  }

  // Real-time subscription başlat
  async startRealtimeSync(userId) {
    try {
      console.log('🔄 Real-time senkronizasyon başlatılıyor...', userId);

      // Users tablosu için subscription
      const userSubscription = supabase
        .channel('user_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'users',
            filter: `id=eq.${userId}`
          }, 
          (payload) => {
            console.log('👤 Kullanıcı verisi değişti:', payload);
            this.handleUserDataChange(payload);
          }
        )
        .subscribe();

      // Food logs için subscription
      const foodLogsSubscription = supabase
        .channel('food_logs_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'food_logs',
            filter: `user_id=eq.${userId}`
          }, 
          (payload) => {
            console.log('🍎 Yemek kaydı değişti:', payload);
            this.handleFoodLogChange(payload);
          }
        )
        .subscribe();

      // Water logs için subscription
      const waterLogsSubscription = supabase
        .channel('water_logs_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'water_logs',
            filter: `user_id=eq.${userId}`
          }, 
          (payload) => {
            console.log('💧 Su kaydı değişti:', payload);
            this.handleWaterLogChange(payload);
          }
        )
        .subscribe();

      // Diet goals için subscription
      const dietGoalsSubscription = supabase
        .channel('diet_goals_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'diet_goals',
            filter: `user_id=eq.${userId}`
          }, 
          (payload) => {
            console.log('🎯 Diyet hedefi değişti:', payload);
            this.handleDietGoalChange(payload);
          }
        )
        .subscribe();

      // Weekly meal plans için subscription
      const mealPlansSubscription = supabase
        .channel('meal_plans_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'weekly_meal_plans',
            filter: `user_id=eq.${userId}`
          }, 
          (payload) => {
            console.log('📅 Haftalık plan değişti:', payload);
            this.handleMealPlanChange(payload);
          }
        )
        .subscribe();

      // Planned meals için subscription
      const plannedMealsSubscription = supabase
        .channel('planned_meals_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'planned_meals'
          }, 
          (payload) => {
            console.log('🍽️ Planlı öğün değişti:', payload);
            this.handlePlannedMealChange(payload);
          }
        )
        .subscribe();

      // Subscription'ları kaydet
      this.subscriptions.set('user', userSubscription);
      this.subscriptions.set('food_logs', foodLogsSubscription);
      this.subscriptions.set('water_logs', waterLogsSubscription);
      this.subscriptions.set('diet_goals', dietGoalsSubscription);
      this.subscriptions.set('meal_plans', mealPlansSubscription);
      this.subscriptions.set('planned_meals', plannedMealsSubscription);

      console.log('✅ Real-time senkronizasyon başlatıldı');
      return true;
    } catch (error) {
      console.error('❌ Real-time senkronizasyon hatası:', error);
      return false;
    }
  }

  // Real-time subscription'ları durdur
  async stopRealtimeSync() {
    try {
      console.log('🛑 Real-time senkronizasyon durduruluyor...');
      
      for (const [key, subscription] of this.subscriptions) {
        await supabase.removeChannel(subscription);
        console.log(`✅ ${key} subscription durduruldu`);
      }
      
      this.subscriptions.clear();
      console.log('✅ Tüm real-time subscription\'lar durduruldu');
      return true;
    } catch (error) {
      console.error('❌ Real-time senkronizasyon durdurma hatası:', error);
      return false;
    }
  }

  // Kullanıcı verilerini tam senkronize et
  async fullSync(userId) {
    try {
      console.log('🔄 Tam senkronizasyon başlatılıyor...', userId);

      const { data, error } = await supabase
        .rpc('sync_user_data', { user_uuid: userId });

      if (error) {
        console.error('❌ Tam senkronizasyon hatası:', error);
        return null;
      }

      this.lastSyncTime = new Date();
      console.log('✅ Tam senkronizasyon tamamlandı:', data);
      return data;
    } catch (error) {
      console.error('❌ Tam senkronizasyon hatası:', error);
      return null;
    }
  }

  // Offline değişiklikleri senkronize et
  async syncOfflineChanges() {
    try {
      console.log('🔄 Offline değişiklikler senkronize ediliyor...');

      if (this.syncQueue.length === 0) {
        console.log('ℹ️ Senkronize edilecek değişiklik yok');
        return true;
      }

      for (const change of this.syncQueue) {
        try {
          await this.applyChange(change);
          console.log('✅ Değişiklik senkronize edildi:', change);
        } catch (error) {
          console.error('❌ Değişiklik senkronize edilemedi:', change, error);
        }
      }

      this.syncQueue = [];
      console.log('✅ Tüm offline değişiklikler senkronize edildi');
      return true;
    } catch (error) {
      console.error('❌ Offline senkronizasyon hatası:', error);
      return false;
    }
  }

  // Değişiklikleri işle
  handleUserDataChange(payload) {
    console.log('👤 Kullanıcı verisi güncellendi:', payload);
    // Bildirim ayarları değişti, uygulamayı güncelle
    this.notifyDataChange('user', payload);
  }

  handleFoodLogChange(payload) {
    console.log('🍎 Yemek kaydı güncellendi:', payload);
    this.notifyDataChange('food_logs', payload);
  }

  handleWaterLogChange(payload) {
    console.log('💧 Su kaydı güncellendi:', payload);
    this.notifyDataChange('water_logs', payload);
  }

  handleDietGoalChange(payload) {
    console.log('🎯 Diyet hedefi güncellendi:', payload);
    this.notifyDataChange('diet_goals', payload);
  }

  handleMealPlanChange(payload) {
    console.log('📅 Haftalık plan güncellendi:', payload);
    this.notifyDataChange('meal_plans', payload);
  }

  handlePlannedMealChange(payload) {
    console.log('🍽️ Planlı öğün güncellendi:', payload);
    this.notifyDataChange('planned_meals', payload);
  }

  // Veri değişikliğini bildir
  notifyDataChange(type, payload) {
    // Event emitter veya callback ile uygulamayı bilgilendir
    console.log(`📢 ${type} verisi değişti:`, payload);
    
    // Burada uygulamanın state'ini güncelleyebilirsiniz
    // Örneğin: Context API, Redux, veya local state güncellemesi
  }

  // Değişikliği uygula
  async applyChange(change) {
    const { table, operation, data } = change;
    
    switch (operation) {
      case 'INSERT':
        return await supabase.from(table).insert(data);
      case 'UPDATE':
        return await supabase.from(table).update(data).eq('id', data.id);
      case 'DELETE':
        return await supabase.from(table).delete().eq('id', data.id);
      default:
        throw new Error(`Bilinmeyen operasyon: ${operation}`);
    }
  }

  // Offline değişiklik ekle
  addOfflineChange(table, operation, data) {
    const change = {
      table,
      operation,
      data,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.syncQueue.push(change);
    console.log('📝 Offline değişiklik eklendi:', change);
  }

  // Bağlantı durumunu kontrol et
  checkConnection() {
    // Bu fonksiyon uygulamanın bağlantı durumunu kontrol eder
    // Örneğin: NetInfo kullanarak
    return this.isOnline;
  }

  // Senkronizasyon durumunu al
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      pendingChanges: this.syncQueue.length,
      activeSubscriptions: this.subscriptions.size
    };
  }
}

// Singleton instance
const syncService = new SyncService();
export default syncService;
