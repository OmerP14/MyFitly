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

      return true;
    } catch (error) {
      console.error('❌ Real-time senkronizasyon hatası:', error);
      return false;
    }
  }

  // Real-time subscription'ları durdur
  async stopRealtimeSync() {
    try {
      
      for (const [key, subscription] of this.subscriptions) {
        await supabase.removeChannel(subscription);
      }
      
      this.subscriptions.clear();
      return true;
    } catch (error) {
      console.error('❌ Real-time senkronizasyon durdurma hatası:', error);
      return false;
    }
  }

  // Kullanıcı verilerini tam senkronize et
  async fullSync(userId) {
    try {

      const { data, error } = await supabase
        .rpc('sync_user_data', { user_uuid: userId });

      if (error) {
        console.error('❌ Tam senkronizasyon hatası:', error);
        return null;
      }

      this.lastSyncTime = new Date();
      return data;
    } catch (error) {
      console.error('❌ Tam senkronizasyon hatası:', error);
      return null;
    }
  }

  // Offline değişiklikleri senkronize et
  async syncOfflineChanges() {
    try {

      if (this.syncQueue.length === 0) {
        return true;
      }

      for (const change of this.syncQueue) {
        try {
          await this.applyChange(change);
        } catch (error) {
          console.error('❌ Değişiklik senkronize edilemedi:', change, error);
        }
      }

      this.syncQueue = [];
      return true;
    } catch (error) {
      console.error('❌ Offline senkronizasyon hatası:', error);
      return false;
    }
  }

  // Değişiklikleri işle
  handleUserDataChange(payload) {
    // Bildirim ayarları değişti, uygulamayı güncelle
    this.notifyDataChange('user', payload);
  }

  handleFoodLogChange(payload) {
    this.notifyDataChange('food_logs', payload);
  }

  handleWaterLogChange(payload) {
    this.notifyDataChange('water_logs', payload);
  }

  handleDietGoalChange(payload) {
    this.notifyDataChange('diet_goals', payload);
  }

  handleMealPlanChange(payload) {
    this.notifyDataChange('meal_plans', payload);
  }

  handlePlannedMealChange(payload) {
    this.notifyDataChange('planned_meals', payload);
  }

  // Veri değişikliğini bildir
  notifyDataChange(type, payload) {
    // Event emitter veya callback ile uygulamayı bilgilendir
    
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
