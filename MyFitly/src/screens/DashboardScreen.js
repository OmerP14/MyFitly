import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import Header from '../components/Header';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getTranslations } from '../utils/translations';
import { supabase } from '../config/supabase';
import * as programService from '../services/programService';
import * as trackingService from '../services/trackingService';

import { AdBanner, showInterstitialAd } from '../services/adService';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const { userData } = useUser();
  const { language } = useLanguage();
  const { isPro } = useSubscription();
  const t = getTranslations(language);
  
  // State variables
  const [weightData, setWeightData] = useState([]);
  const [weightProgress, setWeightProgress] = useState(0);
  const [goalBaseline, setGoalBaseline] = useState({ weight: null, date: null });
  const [todayWorkout, setTodayWorkout] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({ workoutDays: 0, totalSets: 0 });
  const [strengthData, setStrengthData] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);

  // Güç takibi verilerini yükle
  const loadStrengthData = async () => {
    if (!userData?.id) return;
    
    try {
      const result = await trackingService.getStrengthData(userData.id);
      if (result?.success) {
        setStrengthData(result.data || []);
      }
    } catch (error) {
      console.error('❌ Güç takibi verileri yüklenemedi:', error);
    }
  };

  // Bugünkü yemekleri yükle
  const loadTodayMeals = async () => {
    if (!userData?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Bugünkü food logs'ları al
      const { data: foodLogs, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userData.id)
        .eq('log_date', today)
        .order('meal_type', { ascending: true });

      if (error) throw error;

      // Yemekleri öğün türüne göre grupla
      const groupedMeals = {};
      if (foodLogs && foodLogs.length > 0) {
        foodLogs.forEach(log => {
          const mealType = log.meal_type || 'other';
          if (!groupedMeals[mealType]) {
            groupedMeals[mealType] = [];
          }
          groupedMeals[mealType].push(log);
        });
      }

      setTodayMeals(groupedMeals);
    } catch (error) {
      console.error('❌ Bugünkü yemekler yüklenemedi:', error);
    }
  };

  // Güç takibi verilerini egzersiz bazında grupla
  const getGroupedStrengthData = () => {
    if (!strengthData?.length) return [];
    
    const grouped = {};
    strengthData.forEach(entry => {
      const exerciseName = entry.exercise_name || entry.exercise;
      if (!grouped[exerciseName]) {
        grouped[exerciseName] = {
          name: exerciseName,
          history: [],
          maxWeight: 0
        };
      }
      
      const weight = parseFloat(entry.weight) || 0;
      grouped[exerciseName].history.push({
        weight: weight,
        date: entry.date || entry.created_at
      });
      
      if (weight > grouped[exerciseName].maxWeight) {
        grouped[exerciseName].maxWeight = weight;
      }
    });
    
    // Her egzersiz için history'yi tarihe göre sırala (eski → yeni)
    Object.values(grouped).forEach(exercise => {
      exercise.history.sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    return Object.values(grouped);
  };

  // Kilo verilerini normalize et
  const normalizeWeightData = (data) => {
    if (!data?.length) return [];
    
    const normalized = data.map(item => {
      let weight = item.weight || item.value;
      
      if (typeof weight === 'string') {
        weight = parseFloat(weight.replace(/[^\d.,]/g, '').replace(',', '.'));
      }
      
      if (weight < 20 || weight > 300 || isNaN(weight)) {
        return null;
      }
      
      return {
        ...item,
        weight: weight,
        value: weight,
        date: item.measurement_date || item.created_at || item.date
      };
    }).filter(item => item !== null);
    
    // Tarih sırasına göre sırala (en eski önce, en yeni sonda)
    const sorted = normalized.sort((a, b) => {
      const dateA = new Date(a.measurement_date || a.date || a.created_at);
      const dateB = new Date(b.measurement_date || b.date || b.created_at);
      return dateA - dateB;
    });
    
    return sorted;
  };

  // Hedef kilo ilerlemesini hesapla
  const calculateWeightProgress = () => {
    if (!userData || !userData.target_weight) {
      setWeightProgress(0);
      return;
    }

    const normalizedWeightData = normalizeWeightData(weightData);
    
    // Kilo girişi yoksa progress 0
    if (!normalizedWeightData || normalizedWeightData.length === 0) {
      setWeightProgress(0);
      return;
    }

    // Başlangıç: baseline varsa onu kullan, yoksa ilk kayıt
    const startWeight = goalBaseline.weight != null
      ? goalBaseline.weight
      : (normalizedWeightData[0]?.weight || userData.current_weight);
    const currentWeight = userData.current_weight; // Profil bilgisinden al
    const targetWeight = userData.target_weight;

    // Kilo verme durumu
    if (startWeight > targetWeight) {
      const totalWeightToLose = startWeight - targetWeight;
      const weightLost = startWeight - currentWeight;
      const progress = Math.max(0, Math.min(100, (weightLost / totalWeightToLose) * 100));
      setWeightProgress(progress);
    } 
    // Kilo alma durumu
    else if (startWeight < targetWeight) {
      const totalWeightToGain = targetWeight - startWeight;
      const weightGained = currentWeight - startWeight;
      const progress = Math.max(0, Math.min(100, (weightGained / totalWeightToGain) * 100));
      setWeightProgress(progress);
    } 
    // Zaten hedefte
    else {
      setWeightProgress(100);
    }
  };

  // Kilo verilerini yükle
  const loadWeightData = async () => {
    try {
      if (!userData?.id) return;

      const { data, error } = await supabase
        .from('weight_tracking')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const normalizedData = normalizeWeightData(data);
        setWeightData(normalizedData);
      } else {
        setWeightData([]);
      }
    } catch (error) {
      console.error('Kilo verileri yüklenemedi:', error);
    }
  };

  // Gün değişikliği takibi
  const checkDayChange = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedLastDate = await AsyncStorage.getItem('last_dashboard_date');
      
      if (savedLastDate !== today) {
        await AsyncStorage.setItem('last_dashboard_date', today);
        // Bugünkü antrenmanı yeniden yükle
        loadTodayWorkout();
      }
    } catch (error) {
      console.error('❌ Dashboard gün kontrolü hatası:', error);
    }
  };

  // Bugünkü antrenmanı yükle - TrainingScreen ile TAM AYNI mantık
  const loadTodayWorkout = async () => {
    try {
      if (!userData?.id) return;

      const today = new Date().getDay();
      
      // TrainingScreen ile TAM AYNI veri kaynağını kullan
      const exercises = await programService.getExercises(userData.id);
      
      // TrainingScreen'deki getTodayExercises() ile TAM AYNI mantık
      const todayExercises = (exercises && exercises[today]) ? exercises[today] : [];
      
      setTodayWorkout(todayExercises);
      
      // Haftalık antrenman günlerini say
      let weeklyCount = 0;
      for (let day = 0; day < 7; day++) {
        const dayExercises = exercises[day];
        if (dayExercises && dayExercises.length > 0) {
          weeklyCount++;
        }
      }
      
      // Sadece bugünün toplam setlerini hesapla
      const todayTotalSets = todayExercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
      
      setWeeklyStats({ workoutDays: weeklyCount, totalSets: todayTotalSets });
      
    } catch (error) {
      console.error('Antrenman verileri yüklenemedi:', error);
      setTodayWorkout([]);
      setWeeklyStats({ workoutDays: 0, totalSets: 0 });
    }
  };

  // Verileri yükle
  const loadAllData = async () => {
    await Promise.all([
      loadWeightData(),
      loadTodayWorkout(),
      loadStrengthData()
    ]);
  };

  useEffect(() => {
    if (userData?.id) {
      loadAllData();
      loadTodayMeals();
      // Gün değişikliği kontrolü
      checkDayChange();
    }
  }, [userData?.id, userData?.target_weight, userData?.current_weight]);

  // Ekran focus olduğunda verileri yenile (hazır program eklendikten sonra)
  useFocusEffect(
    React.useCallback(() => {
      if (userData?.id) {
        loadTodayWorkout();
        loadTodayMeals();
      }
    }, [userData?.id])
  );

  // Load baseline saved by TrackingScreen so dashboard matches
  useEffect(() => {
    const loadBaseline = async () => {
      try {
        const [w, d] = await Promise.all([
          AsyncStorage.getItem('weight_goal_baseline_weight'),
          AsyncStorage.getItem('weight_goal_baseline_date')
        ]);
        setGoalBaseline({ weight: w ? parseFloat(w) : null, date: d || null });
      } catch {}
    };
    loadBaseline();
  }, [userData?.id, userData?.target_weight]);

  // When target changes, reset baseline to current weight immediately
  useEffect(() => {
    const resetBaselineOnTargetChange = async () => {
      if (userData?.current_weight != null && userData?.target_weight != null) {
        const now = new Date().toISOString();
        await AsyncStorage.multiSet([
          ['weight_goal_baseline_weight', String(userData.current_weight)],
          ['weight_goal_baseline_date', now]
        ]);
        setGoalBaseline({ weight: Number(userData.current_weight), date: now });
        setWeightProgress(0);
      }
    };
    // Trigger only when target_weight changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.target_weight]);

  // Ekran her açıldığında verileri yenile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userData?.id) {
        loadAllData();
      }
    });

    return unsubscribe;
  }, [navigation, userData?.id]);

  useEffect(() => {
    calculateWeightProgress();
  }, [userData, weightData, goalBaseline]);

  // Mevcut kilo bilgisi - Profil bilgisinden al
  const getCurrentWeight = () => {
    // Profildeki current_weight bilgisini kullan (weight tracking'den değil)
    return userData?.current_weight || 0;
  };

  const getWeightChange = () => {
    const normalizedData = normalizeWeightData(weightData);
    if (!normalizedData || normalizedData.length < 2) return 0;
    
    const firstWeight = normalizedData[0].weight;
    const lastWeight = normalizedData[normalizedData.length - 1].weight;
    
    return lastWeight - firstWeight;
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <Header 
        isDashboard={true}
        userName={userData?.name}
        profilePhoto={userData?.profile_photo_url}
        showProfile={true}
        onProfilePress={() => navigation.navigate('Profile')}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView 
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >

          {/* Hedef Kilo İlerlemesi - Büyük Kart */}

          {/* Bugünkü Antrenman */}
          <Card variant="highlighted" style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md
            }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 20, 
                fontWeight: '700' 
              }}>
                🔥 {t.today_workout}
              </Text>
              {todayWorkout.length > 0 && (
                <View style={{
                  backgroundColor: colors.success,
                  borderRadius: 20,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs
                }}>
                  <Text style={{ 
                    color: colors.background, 
                    fontSize: 12, 
                    fontWeight: '700' 
                  }}>
                    {todayWorkout.length} {t.exercises}
                  </Text>
                </View>
              )}
            </View>

            {todayWorkout.length > 0 ? (
              <View>
                {todayWorkout.map((exercise, index) => (
                  <View key={index} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: spacing.sm,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary
                  }}>
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing.sm
                    }}>
                      <Text style={{ 
                        color: colors.background, 
                        fontSize: 14, 
                        fontWeight: '700' 
                      }}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: colors.text, 
                        fontSize: 16, 
                        fontWeight: '600' 
                      }}>
                        {exercise.name}
                      </Text>
                      <Text style={{ 
                        color: colors.textMuted, 
                        fontSize: 12 
                      }}>
                        {exercise.sets} {t.set} × {exercise.reps} {t.reps_unit}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => {
                    // Tam ekran reklam göster (Pro kullanıcılara gösterilmez)
                    showInterstitialAd(() => {
                      // Reklam kapandığında Training ekranına git ve Workout tab'ını aç
                      navigation.navigate('Training', { 
                        autoStartWorkout: true
                      });
                    }, isPro);
                  }}
                  style={{
                    backgroundColor: colors.success,
                    borderRadius: 16,
                    padding: spacing.md,
                    alignItems: 'center',
                    marginTop: spacing.md,
                    flexDirection: 'row',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name="play-circle" size={24} color={colors.background} />
                  <Text style={{ 
                    color: colors.background, 
                    fontSize: 16, 
                    fontWeight: '700',
                    marginLeft: spacing.sm
                  }}>
                    {t.start_workout}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: 'center', padding: spacing.xl }}>
                <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                <Text style={{ 
                  color: colors.textMuted, 
                  textAlign: 'center',
                  marginTop: spacing.md,
                  fontSize: 14
                }}>
                  {t.no_exercises}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Training')}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm,
                    marginTop: spacing.md
                  }}
                >
                  <Text style={{ 
                    color: colors.background, 
                    fontSize: 14, 
                    fontWeight: '600' 
                  }}>
                    {t.create_program}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Haftalık İstatistikler */}
          <View style={{ 
            flexDirection: 'row', 
            gap: spacing.md,
            marginBottom: spacing.lg 
          }}>
            <Card variant="secondary" style={{ 
              flex: 1, 
              padding: spacing.lg,
              alignItems: 'center'
            }}>
              <Ionicons name="calendar" size={32} color={colors.primary} />
              <Text style={{ 
                color: colors.text, 
                fontSize: 28, 
                fontWeight: '900',
                marginTop: spacing.sm
              }}>
                {weeklyStats.workoutDays}
              </Text>
              <Text style={{ 
                color: colors.textMuted, 
                fontSize: 12,
                textAlign: 'center'
              }}>
                {t.weekly_progress}
              </Text>
            </Card>

            <Card variant="secondary" style={{ 
              flex: 1, 
              padding: spacing.lg,
              alignItems: 'center'
            }}>
              <Ionicons name="barbell" size={32} color={colors.success} />
              <Text style={{ 
                color: colors.text, 
                fontSize: 28, 
                fontWeight: '900',
                marginTop: spacing.sm
              }}>
                {weeklyStats.totalSets}
              </Text>
              <Text style={{ 
                color: colors.textMuted, 
                fontSize: 12,
                textAlign: 'center'
              }}>
                {t.today_total_sets}
              </Text>
            </Card>
          </View>


          {/* Kilo Hedef İlerlemesi */}
          {weightData.length > 0 && goalBaseline.weight && (
            <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 18, 
                fontWeight: '700',
                marginBottom: spacing.md,
                textAlign: 'center'
              }}>
                🎯 {t.weight_goal_progress}
              </Text>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  width: 120, 
                  height: 120, 
                  marginBottom: spacing.md,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <ProgressRing 
                    size={120} 
                    stroke={12} 
                    progress={weightProgress / 100} 
                    color={weightProgress >= 100 ? colors.success : colors.primary}
                  />
                  <View style={{
                    position: 'absolute',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Text style={{ 
                      color: weightProgress >= 100 ? colors.success : colors.primary, 
                      fontSize: 24, 
                      fontWeight: '900'
                    }}>
                      {Math.round(weightProgress)}%
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>
                    {t.current_weight}: {weightData[weightData.length - 1]?.weight}kg
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>
                    {t.target_weight}: {goalBaseline.weight}kg
                  </Text>
                  <Text style={{ 
                    color: weightProgress >= 100 ? colors.success : colors.primary, 
                    fontSize: 16, 
                    fontWeight: '700' 
                  }}>
                    {weightProgress >= 100 ? t.goal_achieved : t.goal_remaining}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Bugünkü Yemek Listesi */}
          {Object.keys(todayMeals).length > 0 && (
            <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 18, 
                fontWeight: '700',
                marginBottom: spacing.md,
                textAlign: 'center'
              }}>
                🍽️ {t.today_meals}
              </Text>
              
              <View style={{ gap: spacing.md }}>
                {Object.entries(todayMeals).map(([mealType, meals]) => (
                  <View key={mealType} style={{ marginBottom: spacing.sm }}>
                    <Text style={{ 
                      color: colors.primary, 
                      fontSize: 16, 
                      fontWeight: '600',
                      marginBottom: spacing.xs
                    }}>
                      {mealType === 'breakfast' ? '🌅 Kahvaltı' :
                       mealType === 'morning_snack' ? '☕ Kuşluk' :
                       mealType === 'lunch' ? '🍽️ Öğle' :
                       mealType === 'afternoon_snack' ? '🍎 İkindi' :
                       mealType === 'dinner' ? '🌙 Akşam' :
                       mealType === 'evening_snack' ? '🌃 Gece' :
                       '🍽️ ' + mealType}
                    </Text>
                    {meals.map((meal, index) => (
                      <View key={index} style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        marginLeft: spacing.md,
                        marginBottom: spacing.xs
                      }}>
                        <Text style={{ color: colors.textMuted, marginRight: spacing.sm }}>•</Text>
                        <Text style={{ 
                          color: colors.text, 
                          fontSize: 14,
                          flex: 1
                        }}>
                          {meal.food_name} ({meal.calories} kcal)
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Banner Reklam */}
          <View style={{ 
            marginTop: spacing.lg,
            marginBottom: spacing.lg,
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: colors.background === '#FFFFFF' ? 0.1 : 0,
            shadowRadius: 4,
            elevation: colors.background === '#FFFFFF' ? 2 : 0
          }}>
            <AdBanner isPro={isPro} />
          </View>


        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
