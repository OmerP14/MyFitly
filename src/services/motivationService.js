import { supabase } from '../config/supabase';

class MotivationService {
  // Motivasyon quotes'ları getir
  async getRandomQuote(category = 'general') {
    try {
      // RPC yerine direkt query kullan
      const { data, error } = await supabase
        .from('motivation_quotes')
        .select('*')
        .eq('is_active', true)
        .order('id')
        .limit(10);
      
      if (error) throw error;
      
      // Random bir tane seç
      const randomIndex = Math.floor(Math.random() * (data?.length || 1));
      const randomQuote = data?.[randomIndex] || null;
      
      return {
        success: true,
        data: randomQuote
      };
    } catch (error) {
      console.error('Motivasyon quotes getirme hatası:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Kullanıcının başarılarını getir
  async getUserAchievements(userId) {
    try {
      // RPC yerine direkt query kullan
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Kullanıcı başarıları getirme hatası:', error);
      return {
        success: true, // Hata olsa bile devam et
        data: []
      };
    }
  }

  // Kullanıcının streak'lerini getir
  async getUserStreaks(userId) {
    try {
      // RPC yerine direkt query kullan
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity_date', { ascending: false });
      
      if (error) throw error;
      
      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Kullanıcı streak\'leri getirme hatası:', error);
      return {
        success: true, // Hata olsa bile devam et
        data: []
      };
    }
  }

  // Başarı ekle
  async addAchievement(userId, achievementType, title, description = null, iconName = null, color = '#FF6B35') {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'Kullanıcı ID gerekli'
        };
      }

      // RPC yerine direkt insert kullan
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_type: achievementType,
          title: title,
          description: description,
          icon_name: iconName,
          color: color
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase başarı ekleme hatası:', error);
        throw error;
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Başarı ekleme hatası:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Streak güncelle
  async updateStreak(userId, streakType = 'workout', activityDate = new Date().toISOString().split('T')[0]) {
    try {
      // RPC yerine direkt upsert kullan
      const { data: existingStreak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', streakType)
        .single();

      let data, error;
      
      if (existingStreak) {
        // Streak var, güncelle
        const lastDate = new Date(existingStreak.last_activity_date);
        const currentDate = new Date(activityDate);
        const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

        let newStreak = existingStreak.current_streak;
        if (diffDays === 1) {
          // Bir sonraki gün
          newStreak += 1;
        } else if (diffDays > 1) {
          // Streak kırıldı
          newStreak = 1;
        }

        const result = await supabase
          .from('user_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, existingStreak.longest_streak || 0),
            last_activity_date: activityDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStreak.id)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } else {
        // Yeni streak oluştur
        const result = await supabase
          .from('user_streaks')
          .insert({
            user_id: userId,
            streak_type: streakType,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: activityDate
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Streak güncelleme hatası:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Favori quotes ekle
  async addFavoriteQuote(userId, quoteId) {
    try {
      const { data, error } = await supabase
        .from('user_favorite_quotes')
        .insert({
          user_id: userId,
          quote_id: quoteId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Favori quote ekleme hatası:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Favori quotes'ları getir
  async getFavoriteQuotes(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'Kullanıcı ID gerekli'
        };
      }

      const { data, error } = await supabase
        .from('user_favorite_quotes')
        .select(`
          *,
          motivation_quotes (
            id,
            quote_text,
            author,
            category
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Supabase favori quotes hatası:', error);
        throw error;
      }
      
      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Favori quotes getirme hatası:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  // Favori quote'u sil
  async removeFavoriteQuote(userId, quoteId) {
    try {
      const { error } = await supabase
        .from('user_favorite_quotes')
        .delete()
        .eq('user_id', userId)
        .eq('quote_id', quoteId);
      
      if (error) throw error;
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Favori quote silme hatası:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Motivasyon dashboard'u getir
  async getMotivationDashboard(userId) {
    try {
      // Paralel olarak tüm verileri getir
      const [quoteResult, achievementsResult, streaksResult, favoritesResult] = await Promise.all([
        this.getRandomQuote('general'),
        this.getUserAchievements(userId),
        this.getUserStreaks(userId),
        this.getFavoriteQuotes(userId)
      ]);

      // Hataları kontrol et ve logla
      if (!quoteResult.success) {
        console.error('Quote getirme hatası:', quoteResult.message);
      }
      if (!achievementsResult.success) {
        console.error('Başarımlar getirme hatası:', achievementsResult.message);
      }
      if (!streaksResult.success) {
        console.error('Streak\'ler getirme hatası:', streaksResult.message);
      }
      if (!favoritesResult.success) {
        console.error('Favori quotes getirme hatası:', favoritesResult.message);
      }

      return {
        success: true,
        data: {
          currentQuote: quoteResult.success ? quoteResult.data : null,
          achievements: achievementsResult.success ? (achievementsResult.data || []) : [],
          streaks: streaksResult.success ? (streaksResult.data || []) : [],
          favoriteQuotes: favoritesResult.success ? (favoritesResult.data || []) : []
        }
      };
    } catch (error) {
      console.error('Motivasyon dashboard getirme hatası:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Başarı kontrolü ve otomatik ekleme
  async checkAndAddAchievements(userId, userStats) {
    const achievements = [];
    
    try {
      console.log('🎯 checkAndAddAchievements başlıyor:', { userId, userStats });
      
      // Mevcut başarımları kontrol et
      const existingAchievementsResult = await this.getUserAchievements(userId);
      const existingAchievements = existingAchievementsResult.data || [];
      const existingTypes = existingAchievements.map(a => a.achievement_type);
      
      console.log('📋 Mevcut başarımlar:', existingTypes);

      // Streak başarıları
      const streaksResult = await this.getUserStreaks(userId);
      const workoutStreak = streaksResult.data?.find(s => s.streak_type === 'workout');
      
      console.log('🔥 Streak verileri:', { workoutStreak });
      
      // 3 gün streak
      if (workoutStreak && workoutStreak.current_streak >= 3 && !existingTypes.includes('three_day_streak')) {
        const result = await this.addAchievement(
          userId,
          'three_day_streak',
          '3 Gün Başlangıç',
          '3 gün üst üste spor yaptın!',
          'play-circle',
          '#00D084'
        );
        if (result.success) achievements.push(result.data);
      }

      // 7 gün streak
      if (workoutStreak && workoutStreak.current_streak >= 7 && !existingTypes.includes('week_streak')) {
        const result = await this.addAchievement(
          userId,
          'week_streak',
          '7 Gün Üst Üste',
          '7 gün üst üste spor yaptın!',
          'flame',
          '#FF6B35'
        );
        if (result.success) achievements.push(result.data);
      }

      // 15 gün streak
      if (workoutStreak && workoutStreak.current_streak >= 15 && !existingTypes.includes('fifteen_day_streak')) {
        const result = await this.addAchievement(
          userId,
          'fifteen_day_streak',
          '15 Gün Devam',
          '15 gün üst üste spor yaptın!',
          'flash',
          '#9C27B0'
        );
        if (result.success) achievements.push(result.data);
      }

      // 1 ay streak
      if (workoutStreak && workoutStreak.current_streak >= 30 && !existingTypes.includes('month_streak')) {
        const result = await this.addAchievement(
          userId,
          'month_streak',
          '1 Ay',
          '1 ay boyunca düzenli spor yaptın!',
          'star',
          '#FF1493'
        );
        if (result.success) achievements.push(result.data);
      }

      // Set başarıları
      if (userStats?.totalSets >= 25 && !existingTypes.includes('twenty_five_sets')) {
        const result = await this.addAchievement(
          userId,
          'twenty_five_sets',
          '25 Set',
          '25 set tamamladın!',
          'fitness',
          '#4CAF50'
        );
        if (result.success) achievements.push(result.data);
      }

      if (userStats?.totalSets >= 50 && !existingTypes.includes('fifty_sets')) {
        const result = await this.addAchievement(
          userId,
          'fifty_sets',
          '50 Set',
          '50 set tamamladın!',
          'medal',
          '#C0C0C0'
        );
        if (result.success) achievements.push(result.data);
      }

      if (userStats?.totalSets >= 100 && !existingTypes.includes('hundred_sets')) {
        const result = await this.addAchievement(
          userId,
          'hundred_sets',
          '100 Set',
          '100 set tamamladın!',
          'trophy',
          '#FFD700'
        );
        if (result.success) achievements.push(result.data);
      }

      if (userStats?.totalSets >= 250 && !existingTypes.includes('two_fifty_sets')) {
        const result = await this.addAchievement(
          userId,
          'two_fifty_sets',
          '250 Set',
          '250 set tamamladın!',
          'diamond',
          '#E91E63'
        );
        if (result.success) achievements.push(result.data);
      }

      // Kilo başarıları
      if (userStats?.weightLoss >= 5 && !existingTypes.includes('five_kg_loss')) {
        const result = await this.addAchievement(
          userId,
          'five_kg_loss',
          '5kg Kaybı',
          '5 kilo verdin!',
          'trending-down',
          '#4CAF50'
        );
        if (result.success) achievements.push(result.data);
      }

      if (userStats?.weightLoss >= 10 && !existingTypes.includes('ten_kg_loss')) {
        const result = await this.addAchievement(
          userId,
          'ten_kg_loss',
          '10kg Kaybı',
          '10 kilo verdin!',
          'trending-down',
          '#2E7D32'
        );
        if (result.success) achievements.push(result.data);
      }

      if (userStats?.weightLoss >= 15 && !existingTypes.includes('fifteen_kg_loss')) {
        const result = await this.addAchievement(
          userId,
          'fifteen_kg_loss',
          '15kg Kaybı',
          '15 kilo verdin!',
          'trending-down',
          '#1B5E20'
        );
        if (result.success) achievements.push(result.data);
      }

      // Güç artışı başarıları
      if (userStats?.strengthGain >= 5 && !existingTypes.includes('five_kg_strength')) {
        const result = await this.addAchievement(
          userId,
          'five_kg_strength',
          '5kg Güç Artışı',
          'Toplam 5kg güç kazandın!',
          'trending-up',
          '#FF9800'
        );
        if (result.success) achievements.push(result.data);
      }

      if (userStats?.strengthGain >= 10 && !existingTypes.includes('ten_kg_strength')) {
        const result = await this.addAchievement(
          userId,
          'ten_kg_strength',
          '10kg Güç Artışı',
          'Toplam 10kg güç kazandın!',
          'trending-up',
          '#FF5722'
        );
        if (result.success) achievements.push(result.data);
      }

      if (userStats?.strengthGain >= 25 && !existingTypes.includes('twenty_five_kg_strength')) {
        const result = await this.addAchievement(
          userId,
          'twenty_five_kg_strength',
          '25kg Güç Artışı',
          'Toplam 25kg güç kazandın!',
          'trending-up',
          '#D32F2F'
        );
        if (result.success) achievements.push(result.data);
      }

      if (userStats?.strengthGain >= 50 && !existingTypes.includes('fifty_kg_strength')) {
        const result = await this.addAchievement(
          userId,
          'fifty_kg_strength',
          '50kg Güç Artışı',
          'Toplam 50kg güç kazandın!',
          'trending-up',
          '#B71C1C'
        );
        if (result.success) achievements.push(result.data);
      }

      // Hedef kiloya ulaşma
      console.log('🎯 Hedef kiloya ulaşma kontrolü:', {
        targetReached: userStats?.targetReached,
        currentWeight: userStats?.currentWeight,
        targetWeight: userStats?.targetWeight,
        hasTargetReached: existingTypes.includes('target_reached')
      });
      
      if (userStats?.targetReached && !existingTypes.includes('target_reached')) {
        console.log('🏆 Hedef kiloya ulaşma başarımı ekleniyor...');
        const result = await this.addAchievement(
          userId,
          'target_reached',
          'Hedef Kilo',
          `Hedef kilona ulaştın! (${userStats.currentWeight}kg)`,
          'flag',
          '#4CAF50'
        );
        console.log('🏆 Hedef kiloya ulaşma başarımı sonucu:', result);
        if (result.success) achievements.push(result.data);
      }

      // Hedef kiloya yakın olma (1-2kg)
      if (userStats?.currentWeight && userStats?.targetWeight && 
          Math.abs(userStats.currentWeight - userStats.targetWeight) <= 2 && 
          Math.abs(userStats.currentWeight - userStats.targetWeight) > 1 &&
          !existingTypes.includes('close_to_target')) {
        const result = await this.addAchievement(
          userId,
          'close_to_target',
          'Hedefe Yakın',
          `Hedef kilona çok yakınsın! (${userStats.currentWeight}kg)`,
          'trending-up',
          '#FF9800'
        );
        if (result.success) achievements.push(result.data);
      }

      // İlk kayıt başarısı
      console.log('🚀 İlk kayıt kontrolü:', {
        hasFirstEntry: userStats?.hasFirstEntry,
        hasFirstEntryAchievement: existingTypes.includes('first_entry')
      });
      
      if (userStats?.hasFirstEntry && !existingTypes.includes('first_entry')) {
        console.log('🏆 İlk kayıt başarımı ekleniyor...');
        const result = await this.addAchievement(
          userId,
          'first_entry',
          'İlk Adım',
          'İlk kaydını ekledin!',
          'checkmark-circle',
          '#2196F3'
        );
        console.log('🏆 İlk kayıt başarımı sonucu:', result);
        if (result.success) achievements.push(result.data);
      }

      // 5 kayıt başarısı
      if (userStats?.totalEntries >= 5 && !existingTypes.includes('five_entries')) {
        const result = await this.addAchievement(
          userId,
          'five_entries',
          '5 Kayıt',
          '5 kayıt ekledin!',
          'list',
          '#9C27B0'
        );
        if (result.success) achievements.push(result.data);
      }

      // 10 kayıt başarısı
      if (userStats?.totalEntries >= 10 && !existingTypes.includes('ten_entries')) {
        const result = await this.addAchievement(
          userId,
          'ten_entries',
          '10 Kayıt',
          '10 kayıt ekledin!',
          'list',
          '#673AB7'
        );
        if (result.success) achievements.push(result.data);
      }

      // 25 kayıt başarısı
      if (userStats?.totalEntries >= 25 && !existingTypes.includes('twenty_five_entries')) {
        const result = await this.addAchievement(
          userId,
          'twenty_five_entries',
          '25 Kayıt',
          '25 kayıt ekledin!',
          'list',
          '#3F51B5'
        );
        if (result.success) achievements.push(result.data);
      }

      // 50 kayıt başarısı
      if (userStats?.totalEntries >= 50 && !existingTypes.includes('fifty_entries')) {
        const result = await this.addAchievement(
          userId,
          'fifty_entries',
          '50 Kayıt',
          '50 kayıt ekledin!',
          'list',
          '#9C27B0'
        );
        if (result.success) achievements.push(result.data);
      }

      // 100 kayıt başarısı
      if (userStats?.totalEntries >= 100 && !existingTypes.includes('hundred_entries')) {
        const result = await this.addAchievement(
          userId,
          'hundred_entries',
          '100 Kayıt',
          '100 kayıt ekledin!',
          'list',
          '#673AB7'
        );
        if (result.success) achievements.push(result.data);
      }

      // Kilo artışı başarıları (kas kazanımı için)
      if (userStats?.weightGain >= 2 && !existingTypes.includes('two_kg_gain')) {
        const result = await this.addAchievement(
          userId,
          'two_kg_gain',
          '2kg Artış',
          '2 kilo aldın!',
          'trending-up',
          '#FF9800'
        );
        if (result.success) achievements.push(result.data);
      }

      if (userStats?.weightGain >= 5 && !existingTypes.includes('five_kg_gain')) {
        const result = await this.addAchievement(
          userId,
          'five_kg_gain',
          '5kg Artış',
          '5 kilo aldın!',
          'trending-up',
          '#FF5722'
        );
        if (result.success) achievements.push(result.data);
      }

      // Süreklilik başarıları
      if (userStats?.totalEntries >= 7 && userStats?.totalEntries % 7 === 0 && !existingTypes.includes('weekly_consistency')) {
        const weeks = Math.floor(userStats.totalEntries / 7);
        const result = await this.addAchievement(
          userId,
          'weekly_consistency',
          `${weeks} Hafta`,
          `${weeks} hafta boyunca düzenli kayıt tuttun!`,
          'calendar',
          '#4CAF50'
        );
        if (result.success) achievements.push(result.data);
      }

      // Ağırlık takibi için özel başarımlar
      if (userStats?.trackingType === 'strength') {
        console.log('🏋️ Ağırlık takibi başarımları kontrol ediliyor...');
        
        // İlk egzersiz kaydı
        if (userStats?.hasFirstEntry && !existingTypes.includes('first_exercise')) {
          console.log('🏆 İlk egzersiz başarımı ekleniyor...');
          const result = await this.addAchievement(
            userId,
            'first_exercise',
            'İlk Egzersiz',
            'İlk egzersiz kaydını ekledin!',
            'fitness',
            '#4CAF50'
          );
          console.log('🏆 İlk egzersiz başarımı sonucu:', result);
          if (result.success) achievements.push(result.data);
        }

        // 5 egzersiz kaydı
        if (userStats?.totalEntries >= 5 && !existingTypes.includes('five_exercises')) {
          console.log('🏆 5 egzersiz başarımı ekleniyor...');
          const result = await this.addAchievement(
            userId,
            'five_exercises',
            '5 Egzersiz',
            '5 egzersiz kaydı ekledin!',
            'fitness',
            '#2196F3'
          );
          if (result.success) achievements.push(result.data);
        }

        // 10 egzersiz kaydı
        if (userStats?.totalEntries >= 10 && !existingTypes.includes('ten_exercises')) {
          console.log('🏆 10 egzersiz başarımı ekleniyor...');
          const result = await this.addAchievement(
            userId,
            'ten_exercises',
            '10 Egzersiz',
            '10 egzersiz kaydı ekledin!',
            'fitness',
            '#9C27B0'
          );
          if (result.success) achievements.push(result.data);
        }

        // 25 egzersiz kaydı
        if (userStats?.totalEntries >= 25 && !existingTypes.includes('twenty_five_exercises')) {
          console.log('🏆 25 egzersiz başarımı ekleniyor...');
          const result = await this.addAchievement(
            userId,
            'twenty_five_exercises',
            '25 Egzersiz',
            '25 egzersiz kaydı ekledin!',
            'fitness',
            '#673AB7'
          );
          if (result.success) achievements.push(result.data);
        }

        // Ağırlık bazlı başarımlar
        if (userStats?.weight >= 50 && !existingTypes.includes('fifty_kg_lift')) {
          console.log('🏆 50kg kaldırma başarımı ekleniyor...');
          const result = await this.addAchievement(
            userId,
            'fifty_kg_lift',
            '50kg Kaldırma',
            `${userStats.exerciseName || 'Egzersiz'} ile 50kg kaldırdın!`,
            'trophy',
            '#FFD700'
          );
          if (result.success) achievements.push(result.data);
        }

        if (userStats?.weight >= 100 && !existingTypes.includes('hundred_kg_lift')) {
          console.log('🏆 100kg kaldırma başarımı ekleniyor...');
          const result = await this.addAchievement(
            userId,
            'hundred_kg_lift',
            '100kg Kaldırma',
            `${userStats.exerciseName || 'Egzersiz'} ile 100kg kaldırdın!`,
            'trophy',
            '#FF6B35'
          );
          if (result.success) achievements.push(result.data);
        }

        if (userStats?.weight >= 150 && !existingTypes.includes('hundred_fifty_kg_lift')) {
          console.log('🏆 150kg kaldırma başarımı ekleniyor...');
          const result = await this.addAchievement(
            userId,
            'hundred_fifty_kg_lift',
            '150kg Kaldırma',
            `${userStats.exerciseName || 'Egzersiz'} ile 150kg kaldırdın!`,
            'trophy',
            '#E91E63'
          );
          if (result.success) achievements.push(result.data);
        }

        // Rep bazlı başarımlar
        if (userStats?.reps >= 20 && !existingTypes.includes('twenty_reps')) {
          console.log('🏆 20 tekrar başarımı ekleniyor...');
          const result = await this.addAchievement(
            userId,
            'twenty_reps',
            '20 Tekrar',
            `${userStats.exerciseName || 'Egzersiz'} ile 20 tekrar yaptın!`,
            'repeat',
            '#4CAF50'
          );
          if (result.success) achievements.push(result.data);
        }

        if (userStats?.reps >= 50 && !existingTypes.includes('fifty_reps')) {
          console.log('🏆 50 tekrar başarımı ekleniyor...');
          const result = await this.addAchievement(
            userId,
            'fifty_reps',
            '50 Tekrar',
            `${userStats.exerciseName || 'Egzersiz'} ile 50 tekrar yaptın!`,
            'repeat',
            '#2196F3'
          );
          if (result.success) achievements.push(result.data);
        }

        // Egzersiz çeşitliliği başarımları
        const exerciseTypes = ['squat', 'bench', 'deadlift', 'overhead', 'row'];
        const exerciseName = userStats?.exerciseName?.toLowerCase() || '';
        
        if (exerciseTypes.some(type => exerciseName.includes(type)) && !existingTypes.includes('compound_exercise')) {
          console.log('🏆 Temel egzersiz başarımı ekleniyor...');
          const result = await this.addAchievement(
            userId,
            'compound_exercise',
            'Temel Egzersiz',
            `${userStats.exerciseName} ile temel egzersiz yaptın!`,
            'dumbbell',
            '#FF9800'
          );
          if (result.success) achievements.push(result.data);
        }

        // BENCH PRESS ÖZEL BAŞARIMLAR 🏋️
        if (exerciseName.includes('bench')) {
          // Bench Press Başlangıç
          if (userStats?.weight >= 60 && !existingTypes.includes('bench_beginner')) {
            const result = await this.addAchievement(
              userId,
              'bench_beginner',
              'Bench Press Başlangıcı',
              '60kg Bench Press! Yolculuk başladı! 💪',
              'fitness',
              '#4CAF50'
            );
            if (result.success) achievements.push(result.data);
          }

          // Bench Press Orta Seviye
          if (userStats?.weight >= 80 && !existingTypes.includes('bench_intermediate')) {
            const result = await this.addAchievement(
              userId,
              'bench_intermediate',
              'Bench Press Ustası',
              '80kg Bench Press! Güçleniyorsun! 🔥',
              'trophy',
              '#FF9800'
            );
            if (result.success) achievements.push(result.data);
          }

          // Bench Press İleri Seviye
          if (userStats?.weight >= 100 && !existingTypes.includes('bench_advanced')) {
            const result = await this.addAchievement(
              userId,
              'bench_advanced',
              'Bench Press Kralı',
              '100kg Bench Press! Sen bir kralısın! 👑',
              'trophy',
              '#FFD700'
            );
            if (result.success) achievements.push(result.data);
          }

          // Bench Press Efsane
          if (userStats?.weight >= 140 && !existingTypes.includes('bench_legend')) {
            const result = await this.addAchievement(
              userId,
              'bench_legend',
              'Bench Press Efsanesi',
              '140kg Bench Press! İnanılmaz güçtesin! 🌟',
              'trophy',
              '#E91E63'
            );
            if (result.success) achievements.push(result.data);
          }

          // Bench Press Tanrı
          if (userStats?.weight >= 180 && !existingTypes.includes('bench_god')) {
            const result = await this.addAchievement(
              userId,
              'bench_god',
              'Bench Press Tanrısı',
              '180kg Bench Press! Sen bir tanrısın! ⚡',
              'trophy',
              '#B71C1C'
            );
            if (result.success) achievements.push(result.data);
          }
        }

        // SQUAT ÖZEL BAŞARIMLAR 🦵
        if (exerciseName.includes('squat')) {
          // Squat Başlangıç
          if (userStats?.weight >= 80 && !existingTypes.includes('squat_beginner')) {
            const result = await this.addAchievement(
              userId,
              'squat_beginner',
              'Squat Başlangıcı',
              '80kg Squat! Bacaklar güçleniyor! 🦵',
              'fitness',
              '#4CAF50'
            );
            if (result.success) achievements.push(result.data);
          }

          // Squat Orta Seviye
          if (userStats?.weight >= 100 && !existingTypes.includes('squat_intermediate')) {
            const result = await this.addAchievement(
              userId,
              'squat_intermediate',
              'Squat Ustası',
              '100kg Squat! Bacak gücü arttı! 💪',
              'trophy',
              '#FF9800'
            );
            if (result.success) achievements.push(result.data);
          }

          // Squat İleri Seviye
          if (userStats?.weight >= 140 && !existingTypes.includes('squat_advanced')) {
            const result = await this.addAchievement(
              userId,
              'squat_advanced',
              'Squat Kralı',
              '140kg Squat! Bacak kralısın! 👑',
              'trophy',
              '#FFD700'
            );
            if (result.success) achievements.push(result.data);
          }

          // Squat Efsane
          if (userStats?.weight >= 180 && !existingTypes.includes('squat_legend')) {
            const result = await this.addAchievement(
              userId,
              'squat_legend',
              'Squat Efsanesi',
              '180kg Squat! İnanılmaz bacak gücü! 🌟',
              'trophy',
              '#E91E63'
            );
            if (result.success) achievements.push(result.data);
          }

          // Squat Tanrı
          if (userStats?.weight >= 220 && !existingTypes.includes('squat_god')) {
            const result = await this.addAchievement(
              userId,
              'squat_god',
              'Squat Tanrısı',
              '220kg Squat! Bacak tanrısısın! ⚡',
              'trophy',
              '#B71C1C'
            );
            if (result.success) achievements.push(result.data);
          }
        }

        // DEADLIFT ÖZEL BAŞARIMLAR 💀
        if (exerciseName.includes('deadlift')) {
          // Deadlift Başlangıç
          if (userStats?.weight >= 100 && !existingTypes.includes('deadlift_beginner')) {
            const result = await this.addAchievement(
              userId,
              'deadlift_beginner',
              'Deadlift Başlangıcı',
              '100kg Deadlift! Sırt güçleniyor! 💪',
              'fitness',
              '#4CAF50'
            );
            if (result.success) achievements.push(result.data);
          }

          // Deadlift Orta Seviye
          if (userStats?.weight >= 140 && !existingTypes.includes('deadlift_intermediate')) {
            const result = await this.addAchievement(
              userId,
              'deadlift_intermediate',
              'Deadlift Ustası',
              '140kg Deadlift! Sırt gücü arttı! 🔥',
              'trophy',
              '#FF9800'
            );
            if (result.success) achievements.push(result.data);
          }

          // Deadlift İleri Seviye
          if (userStats?.weight >= 180 && !existingTypes.includes('deadlift_advanced')) {
            const result = await this.addAchievement(
              userId,
              'deadlift_advanced',
              'Deadlift Kralı',
              '180kg Deadlift! Sırt kralısın! 👑',
              'trophy',
              '#FFD700'
            );
            if (result.success) achievements.push(result.data);
          }

          // Deadlift Efsane
          if (userStats?.weight >= 220 && !existingTypes.includes('deadlift_legend')) {
            const result = await this.addAchievement(
              userId,
              'deadlift_legend',
              'Deadlift Efsanesi',
              '220kg Deadlift! İnanılmaz sırt gücü! 🌟',
              'trophy',
              '#E91E63'
            );
            if (result.success) achievements.push(result.data);
          }

          // Deadlift Tanrı
          if (userStats?.weight >= 260 && !existingTypes.includes('deadlift_god')) {
            const result = await this.addAchievement(
              userId,
              'deadlift_god',
              'Deadlift Tanrısı',
              '260kg Deadlift! Sırt tanrısısın! ⚡',
              'trophy',
              '#B71C1C'
            );
            if (result.success) achievements.push(result.data);
          }
        }

        // OVERHEAD PRESS ÖZEL BAŞARIMLAR 🏋️
        if (exerciseName.includes('overhead')) {
          // Overhead Press Başlangıç
          if (userStats?.weight >= 40 && !existingTypes.includes('overhead_beginner')) {
            const result = await this.addAchievement(
              userId,
              'overhead_beginner',
              'Overhead Press Başlangıcı',
              '40kg Overhead Press! Omuzlar güçleniyor! 💪',
              'fitness',
              '#4CAF50'
            );
            if (result.success) achievements.push(result.data);
          }

          // Overhead Press Orta Seviye
          if (userStats?.weight >= 60 && !existingTypes.includes('overhead_intermediate')) {
            const result = await this.addAchievement(
              userId,
              'overhead_intermediate',
              'Overhead Press Ustası',
              '60kg Overhead Press! Omuz gücü arttı! 🔥',
              'trophy',
              '#FF9800'
            );
            if (result.success) achievements.push(result.data);
          }

          // Overhead Press İleri Seviye
          if (userStats?.weight >= 80 && !existingTypes.includes('overhead_advanced')) {
            const result = await this.addAchievement(
              userId,
              'overhead_advanced',
              'Overhead Press Kralı',
              '80kg Overhead Press! Omuz kralısın! 👑',
              'trophy',
              '#FFD700'
            );
            if (result.success) achievements.push(result.data);
          }

          // Overhead Press Efsane
          if (userStats?.weight >= 100 && !existingTypes.includes('overhead_legend')) {
            const result = await this.addAchievement(
              userId,
              'overhead_legend',
              'Overhead Press Efsanesi',
              '100kg Overhead Press! İnanılmaz omuz gücü! 🌟',
              'trophy',
              '#E91E63'
            );
            if (result.success) achievements.push(result.data);
          }
        }

        // GÜÇLENME BAZLI BAŞARIMLAR 📈
        if (userStats?.strengthGain >= 5 && !existingTypes.includes('strength_gain_5kg')) {
          const result = await this.addAchievement(
            userId,
            'strength_gain_5kg',
            'Güçlenme Başlangıcı',
            `${userStats.exerciseName} ile 5kg güçlendin! 💪`,
            'trending-up',
            '#4CAF50'
          );
          if (result.success) achievements.push(result.data);
        }

        if (userStats?.strengthGain >= 10 && !existingTypes.includes('strength_gain_10kg')) {
          const result = await this.addAchievement(
            userId,
            'strength_gain_10kg',
            'Güçlenme Devam Ediyor',
            `${userStats.exerciseName} ile 10kg güçlendin! 🔥`,
            'trending-up',
            '#FF9800'
          );
          if (result.success) achievements.push(result.data);
        }

        if (userStats?.strengthGain >= 20 && !existingTypes.includes('strength_gain_20kg')) {
          const result = await this.addAchievement(
            userId,
            'strength_gain_20kg',
            'Güçlenme Ustası',
            `${userStats.exerciseName} ile 20kg güçlendin! 👑`,
            'trending-up',
            '#FFD700'
          );
          if (result.success) achievements.push(result.data);
        }

        if (userStats?.strengthGain >= 40 && !existingTypes.includes('strength_gain_40kg')) {
          const result = await this.addAchievement(
            userId,
            'strength_gain_40kg',
            'Güçlenme Efsanesi',
            `${userStats.exerciseName} ile 40kg güçlendin! 🌟`,
            'trending-up',
            '#E91E63'
          );
          if (result.success) achievements.push(result.data);
        }

        // TOPLAM AĞIRLIK BAŞARIMLARI (Tüm egzersizlerin toplamı)
        if (userStats?.totalEntries >= 50 && !existingTypes.includes('fifty_total_exercises')) {
          const result = await this.addAchievement(
            userId,
            'fifty_total_exercises',
            '50 Egzersiz Kaydı',
            '50 egzersiz kaydı ekledin! Disiplin! 🎯',
            'checkmark-circle',
            '#2196F3'
          );
          if (result.success) achievements.push(result.data);
        }

        if (userStats?.totalEntries >= 100 && !existingTypes.includes('hundred_total_exercises')) {
          const result = await this.addAchievement(
            userId,
            'hundred_total_exercises',
            '100 Egzersiz Kaydı',
            '100 egzersiz kaydı! İnanılmaz disiplin! 🏆',
            'checkmark-circle',
            '#9C27B0'
          );
          if (result.success) achievements.push(result.data);
        }

        if (userStats?.totalEntries >= 250 && !existingTypes.includes('two_fifty_total_exercises')) {
          const result = await this.addAchievement(
            userId,
            'two_fifty_total_exercises',
            '250 Egzersiz Kaydı',
            '250 egzersiz kaydı! Sen bir efsanesin! 👑',
            'checkmark-circle',
            '#FFD700'
          );
          if (result.success) achievements.push(result.data);
        }

        if (userStats?.totalEntries >= 500 && !existingTypes.includes('five_hundred_total_exercises')) {
          const result = await this.addAchievement(
            userId,
            'five_hundred_total_exercises',
            '500 Egzersiz Kaydı',
            '500 egzersiz kaydı! Sen bir tanrısın! ⚡',
            'checkmark-circle',
            '#B71C1C'
          );
          if (result.success) achievements.push(result.data);
        }
      }

      console.log('🏆 Toplam kazanılan başarım sayısı:', achievements.length);
      
      return {
        success: true,
        data: achievements
      };
    } catch (error) {
      console.error('❌ Başarı kontrolü hatası:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new MotivationService();
