import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Header from '../components/Header';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';
import motivationService from '../services/motivationService';
import useRewardedAd from '../hooks/useRewardedAd';

export default function MotivationScreen() {
  const { colors } = useTheme();
  const { userData } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [watchedAdsCount, setWatchedAdsCount] = useState(0);
  
  // Rewarded Ad hook
  const { loaded: adLoaded, loading: adLoading, showAd } = useRewardedAd();

  const loadMotivationData = useCallback(async () => {
    if (!userData?.id) {
      setLoading(false);
      return;
    }

    try {
      const result = await motivationService.getMotivationDashboard(userData.id, language);
      
      if (result.success) {
        const { currentQuote, achievements, streaks } = result.data;
        
        // Eğer quote yoksa default quote ekle
        if (!currentQuote) {
        setCurrentQuote({
          id: 'default',
          quote: language === 'en' ? 'Discipline > Motivation' : 'Disiplin > Motivasyon',
          author: 'Jim Rohn',
          category: 'general'
        });
        } else {
          setCurrentQuote(currentQuote);
        }
        
        setAchievements(achievements || []);
        setStreaks(streaks || []);
      } else {
        console.error(t.motivation_data_load_error || 'Motivasyon verileri yüklenemedi:', result.message);
        // Fallback quote
        setCurrentQuote({
          id: 'fallback',
          text: 'Disiplin > Motivasyon',
          author: 'Jim Rohn',
          category: 'general'
        });
      }
    } catch (error) {
      console.error(t.motivation_data_load_error || 'Motivasyon verileri yükleme hatası:', error);
      // Fallback quote
      setCurrentQuote({
        id: 'fallback',
        quote: 'Disiplin > Motivasyon',
        author: 'Jim Rohn',
        category: 'general'
      });
    } finally {
      setLoading(false);
    }
  }, [userData?.id, language]);

  useEffect(() => {
    loadMotivationData();
  }, [loadMotivationData]);

  // Başarımları yeniden yükle (TrackingScreen'den çağrılabilir)
  useEffect(() => {
    const interval = setInterval(() => {
      if (userData?.id) {
        // Sessizce başarımları yeniden yükle
        motivationService.getUserAchievements(userData.id).then(result => {
          if (result.success) {
            setAchievements(result.data || []);
            console.log('🔄 Başarımlar yenilendi:', result.data?.length || 0);
          }
        });
      }
    }, 5000); // Her 5 saniyede bir kontrol et

    return () => clearInterval(interval);
  }, [userData?.id]);


  const watchRewardedAd = async () => {
    if (!userData?.id) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    // Expo Go kontrolü - AdMob çalışmıyor
    if (!adLoaded && !adLoading) {
      Alert.alert(
        '📱 Development Mod',
        (t.admob_dev_message || 'AdMob reklamları sadece production build\'de çalışır.\n\nTest için bu butona tıklamaya devam edebilirsin - ödül direkt verilecek! 🎁'),
        [
          { text: t.cancel || 'İptal', style: 'cancel' },
          { 
            text: t.test || 'Test Et', 
            onPress: () => {
              // Test modu - ödül direkt ver
              Alert.alert(t.test_reward_title || '🎉 Test Ödülü!', t.test_reward_message || 'Development modunda test ödülü kazandın! 🎁');
            }
          }
        ]
      );
      return;
    }

    if (!adLoaded && adLoading) {
      Alert.alert(t.ad_loading || 'Reklam Yükleniyor', t.ad_not_ready || 'Reklam henüz hazır değil. Lütfen birkaç saniye bekleyin ve tekrar deneyin! 🎬');
      return;
    }

    try {
      console.log('🎬 Ödüllü reklam gösteriliyor...');
      const reward = await showAd();
      console.log('🎁 Ödül kazanıldı:', reward);

      // Reklam izleme sayısını artır
      const newCount = watchedAdsCount + 1;
      setWatchedAdsCount(newCount);

      // Özel başarı rozetleri ver
      const rewardMessages = [];

      // İlk reklam izleme başarısı
      if (newCount === 1) {
        const result = await motivationService.addAchievement(
          userData.id,
          'first_ad_watch',
          t.first_ad_title || '🎬 İlk Reklam',
          t.first_ad_message || 'İlk ödüllü reklamını izledin! Motivasyon puanı +10',
          'play-circle',
          '#FF6B35'
        );
        if (result.success) {
          rewardMessages.push(t.first_ad_achievement || '🏆 İlk Reklam başarısı kazandın!');
        }
      }

      // 5 reklam izleme başarısı
      if (newCount === 5) {
        const result = await motivationService.addAchievement(
          userData.id,
          'five_ads_watched',
          t.ad_master_title || '🎥 Reklam Ustası',
          t.ad_master_message || '5 ödüllü reklam izledin! Motivasyon puanı +50',
          'star',
          '#FFD700'
        );
        if (result.success) {
          rewardMessages.push(t.ad_master_achievement || '🏆 Reklam Ustası başarısı kazandın!');
        }
      }

      // 10 reklam izleme başarısı
      if (newCount === 10) {
        const result = await motivationService.addAchievement(
          userData.id,
          'ten_ads_watched',
          '🌟 Reklam Efsanesi',
          t.ad_legend_message || '10 ödüllü reklam izledin! Özel rozet +100 puan',
          'trophy',
          '#E91E63'
        );
        if (result.success) {
          rewardMessages.push(t.ad_legend_achievement || '🏆 Reklam Efsanesi başarısı kazandın!');
        }
      }

      // Başarımları yenile
      const achievementsResult = await motivationService.getUserAchievements(userData.id);
      if (achievementsResult.success) {
        setAchievements(achievementsResult.data || []);
      }

      // Ödül mesajını göster
      const message = rewardMessages.length > 0 
        ? `${rewardMessages.join('\n\n')}\n\n💎 Toplam ${newCount} reklam izledin!`
        : `🎁 Tebrikler! Ödül kazandın!\n\n💎 Toplam ${newCount} reklam izledin!`;

      Alert.alert(
        t.reward_earned_title || '🎉 Ödül Kazandın!',
        message,
        [{ text: t.great || 'Harika!', style: 'default' }]
      );

    } catch (error) {
      console.error('❌ Ödüllü reklam hatası:', error);
      
      if (error.message === 'Reklam tamamlanmadan kapatıldı') {
        Alert.alert(t.ad_closed_early_title || '❌ Reklam Kapatıldı', t.ad_closed_early_message || 'Ödül kazanmak için reklamı sonuna kadar izlemelisin! 🎬');
      } else if (error.message === 'Reklam henüz hazır değil') {
        Alert.alert(t.ad_loading || '⏳ Reklam Yükleniyor', t.ad_not_ready || 'Reklam henüz hazır değil. Lütfen birkaç saniye bekleyip tekrar deneyin!');
      } else if (error.message?.includes('not loaded')) {
        Alert.alert(t.ad_load_failed_title || '⏳ Reklam Yüklenemedi', t.ad_load_failed_message || 'Reklam yüklenemedi. İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      } else {
        Alert.alert(t.error || '❌ Hata', t.ad_show_failed || 'Reklam gösterilemedi. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  const getWorkoutStreak = () => {
    const workoutStreak = streaks.find(s => s.streak_type === 'workout');
    return workoutStreak?.current_streak || 0;
  };

  const getLongestStreak = () => {
    const workoutStreak = streaks.find(s => s.streak_type === 'workout');
    return workoutStreak?.longest_streak || 0;
  };

  // Başarım çeviri fonksiyonları
  const translateAchievementTitle = (title) => {
    if (!title) return '';
    
    const achievementTranslations = {
      // Türkçe -> İngilizce
      '🎬 İlk Reklam': '🎬 First Ad',
      '🎥 Reklam Ustası': '🎥 Ad Master',
      '🌟 Reklam Efsanesi': '🌟 Ad Legend',
      '🏃 İlk Koşu': '🏃 First Run',
      '💪 İlk Antrenman': '💪 First Workout',
      '🎯 İlk Hedef': '🎯 First Goal',
      '🔥 Streak Başlangıcı': '🔥 Streak Start',
      '⭐ Haftalık Hedef': '⭐ Weekly Goal',
      '🏆 Aylık Başarı': '🏆 Monthly Success',
      '💎 Yılın Kahramanı': '💎 Year Hero'
    };

    if (language === 'en') {
      return achievementTranslations[title] || title;
    }
    return title;
  };

  const translateAchievementDescription = (description) => {
    if (!description) return '';
    
    const descriptionTranslations = {
      // Türkçe -> İngilizce
      'İlk ödüllü reklamını izledin! Motivasyon puanı +10': 'You watched your first rewarded ad! Motivation points +10',
      '5 ödüllü reklam izledin! Motivasyon puanı +50': 'You watched 5 rewarded ads! Motivation points +50',
      '10 ödüllü reklam izledin! Özel rozet +100 puan': 'You watched 10 rewarded ads! Special badge +100 points',
      'İlk koşunu tamamladın!': 'You completed your first run!',
      'İlk antrenmanını bitirdin!': 'You finished your first workout!',
      'İlk hedefini başardın!': 'You achieved your first goal!',
      'İlk streak\'ini başlattın!': 'You started your first streak!',
      'Haftalık hedefini tamamladın!': 'You completed your weekly goal!',
      'Aylık başarını elde ettin!': 'You achieved your monthly success!',
      'Yılın kahramanı oldun!': 'You became the hero of the year!'
    };

    if (language === 'en') {
      return descriptionTranslations[description] || description;
    }
    return description;
  };

  const renderAchievement = (achievement) => (
    <Card key={achievement.id} style={{
      marginBottom: spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: achievement.color || '#FF6B35'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: achievement.color || '#FF6B35',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing.md
        }}>
          <Ionicons 
            name={achievement.icon_name || 'star'} 
            size={24} 
            color={colors.background} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 2
          }}>
            {translateAchievementTitle(achievement.title)}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            {translateAchievementDescription(achievement.description) || (t.congratulations || 'Tebrikler!')}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
            {new Date(achievement.unlocked_at).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}
          </Text>
        </View>
        <Ionicons name="checkmark-circle" size={24} color="#00D084" />
      </View>
    </Card>
  );

  if (loading) {
    return (
      <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: spacing.md }}>{t.loading_motivation_data || 'Motivasyon verileri yükleniyor...'}</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <Header 
        title={t.motivation || "Motivasyon"}
        subtitle={t.motivation_subtitle || "Hedefine odaklan, sürekli ilerle"}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }}>

          {/* Daily Quote */}
          <Card style={{ marginBottom: spacing.md, minHeight: 200 }}>
            <LinearGradient
              colors={[colors.primary, '#FF9A3D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 180
              }}
            >
              <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                <Ionicons name="quote" size={32} color={colors.background} style={{ marginBottom: spacing.md }} />
                <Text style={{
                  color: colors.background,
                  fontSize: 20,
                  fontWeight: '700',
                  textAlign: 'center',
                  lineHeight: 28,
                  marginBottom: spacing.md
                }}>
                  "{currentQuote?.quote_text || 'Disiplin > Motivasyon'}"
                </Text>
                <Text style={{
                  color: colors.background,
                  fontSize: 14,
                  opacity: 0.8,
                  fontStyle: 'italic'
                }}>
                  - {currentQuote?.author || 'Jim Rohn'}
                </Text>
              </Animated.View>
            </LinearGradient>
          </Card>

          {/* Streak Counter */}
          <Card style={{ marginBottom: spacing.md }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255, 107, 53, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.md
              }}>
                <Ionicons name="flame" size={40} color="#FF6B35" />
              </View>
              <Text style={{ color: colors.text, fontSize: 32, fontWeight: '800', marginBottom: 4 }}>
                {getWorkoutStreak()}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>
                {t.days_streak_exercise || 'Gün üst üste spor yaptın!'}
              </Text>
              {getLongestStreak() > getWorkoutStreak() && (
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                  {t.longest_streak || 'En uzun streak'}: {getLongestStreak()} {t.days || 'gün'} 🔥
                </Text>
              )}
            </View>
          </Card>

          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            {/* Favorilere ekle butonu kaldırıldı */}
            <TouchableOpacity 
              onPress={() => {
                Alert.alert(t.info || 'Bilgi', t.reminder_feature_coming || 'Hatırlatıcı özelliği yakında eklenecek!');
              }}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: spacing.md,
                alignItems: 'center'
              }}
            >
              <Ionicons name="notifications" size={32} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 8 }}>
                {t.reminder || 'Hatırlatıcı'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rewarded Ad Card */}
          <Card style={{ marginBottom: spacing.md }}>
            <LinearGradient
              colors={['#FF6B35', '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center'
              }}
            >
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.md
              }}>
                <Ionicons name="gift" size={32} color={colors.background} />
              </View>
              <Text style={{
                color: colors.background,
                fontSize: 20,
                fontWeight: '800',
                marginBottom: spacing.xs,
                textAlign: 'center'
              }}>
                🎁 Ödül Kazan!
              </Text>
              <Text style={{
                color: colors.background,
                fontSize: 14,
                opacity: 0.9,
                textAlign: 'center',
                marginBottom: spacing.md
              }}>
                Reklam izle ve özel ödüller kazan!
              </Text>
              {watchedAdsCount > 0 && (
                <Text style={{
                  color: colors.background,
                  fontSize: 12,
                  opacity: 0.8,
                  marginBottom: spacing.md
                }}>
                  💎 {watchedAdsCount} reklam izledin
                </Text>
              )}
              <TouchableOpacity 
                onPress={watchRewardedAd}
                style={{
                  backgroundColor: adLoaded ? colors.background : 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 12,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.xl,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm
                }}
              >
                {adLoading ? (
                  <>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{
                      color: colors.primary,
                      fontSize: 16,
                      fontWeight: '700'
                    }}>
                      Yükleniyor...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons 
                      name={adLoaded ? "play-circle" : "information-circle"} 
                      size={24} 
                      color={adLoaded ? colors.primary : colors.textMuted} 
                    />
                    <Text style={{
                      color: adLoaded ? colors.primary : colors.textMuted,
                      fontSize: 16,
                      fontWeight: '700'
                    }}>
                      {adLoaded ? (t.watch_ad || 'Reklamı İzle') : (t.test_mode || 'Test Modu (Expo Go)')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </Card>

          {/* Achievements */}
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
              {t.achievements || 'Başarımlar'} ({achievements.length})
            </Text>
            {achievements.length > 0 ? (
              <View style={{ gap: spacing.sm }}>
                {achievements.map(renderAchievement)}
              </View>
            ) : (
              <View style={{ alignItems: 'center', padding: spacing.lg }}>
                <Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, fontSize: 16, marginTop: spacing.sm, textAlign: 'center' }}>
                  {t.no_achievements_yet || 'Henüz başarım kazanmadın'}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                  {t.keep_exercising_achievements || 'Spor yapmaya devam et, başarımlar gelecek!'}
                </Text>
              </View>
            )}
          </Card>

          {/* Weekly Progress */}
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
              {t.this_week || 'Bu Hafta'}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <View>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                  {t.workout_goal}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                  {getWorkoutStreak() >= 7 ? '7/7' : `${getWorkoutStreak()}/7`} {t.completed}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '800' }}>
                  {Math.round((getWorkoutStreak() / 7) * 100)}%
                </Text>
              </View>
            </View>
            <View style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <View style={{
                height: '100%',
                width: `${Math.min((getWorkoutStreak() / 7) * 100, 100)}%`,
                backgroundColor: colors.primary,
                borderRadius: 4
              }} />
            </View>
          </Card>

          {/* Favorite Quotes */}
          {/* Favori liste bölümü kaldırıldı */}

          {/* Motivation Tips */}
          <Card>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
              {t.motivation_tips || 'Motivasyon İpuçları'}
            </Text>
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.sm,
                  marginTop: 2
                }}>
                  <Text style={{ color: colors.background, fontSize: 12, fontWeight: '700' }}>1</Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>
                  {t.set_small_goals || 'Küçük hedefler koy ve her gün bir adım at'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.sm,
                  marginTop: 2
                }}>
                  <Text style={{ color: colors.background, fontSize: 12, fontWeight: '700' }}>2</Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>
                  {t.track_and_celebrate || 'İlerlemeni kaydet ve kutla'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.sm,
                  marginTop: 2
                }}>
                  <Text style={{ color: colors.background, fontSize: 12, fontWeight: '700' }}>3</Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>
                  {t.be_consistent_not_perfect || 'Mükemmel olmak zorunda değilsin, tutarlı ol'}
                </Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}