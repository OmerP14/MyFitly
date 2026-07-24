import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Card from '../components/Card';
import Header from '../components/Header';
import ProgressRing from '../components/ProgressRing';
import Paywall from '../components/Paywall';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getTranslations } from '../utils/translations';
import { calculateDietPlan, testDietCalculations } from '../services/dietService';
import { supabase } from '../config/supabase';

const screenWidth = Dimensions.get('window').width;

export default function DietScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { userData } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  // ABONELİK KONTROLÜ - DİYET EKRANI SADECE PRO KULLANICILARA AÇIK
  const { isPro, isLoading: subscriptionLoading, purchaseSubscription, restorePurchases } = useSubscription();
  const [showFullPaywall, setShowFullPaywall] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  
  // State variables
  const [dietPlan, setDietPlan] = useState(null);
  const [dailyIntake, setDailyIntake] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0
  });
  const [waterGoal, setWaterGoal] = useState(2500); // ml
  const [loading, setLoading] = useState(false);
  const [hasSetup, setHasSetup] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [todayMeals, setTodayMeals] = useState([]);
  const [completedMeals, setCompletedMeals] = useState(new Set());
  const [lastResetDate, setLastResetDate] = useState(null);

  // Gün değişikliği takibi - zamanlayıcı yerine gün kontrolü
  const checkDayChange = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedLastResetDate = await AsyncStorage.getItem('last_reset_date');
      
      // Eğer bugünün tarihi son sıfırlama tarihinden farklıysa, yeni gün demektir
      if (savedLastResetDate !== today) {
        await resetDailyData();
        
        // Son sıfırlama tarihini güncelle
        await AsyncStorage.setItem('last_reset_date', today);
        setLastResetDate(today);
      }
    } catch (error) {
      console.error('❌ Gün değişikliği kontrolü hatası:', error);
    }
  };

  // Günlük verileri sıfırla
  const resetDailyData = async () => {
    try {
      
      // Günlük intake'i tamamen sıfırla
      setDailyIntake({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        water: 0
      });
      
      // Tamamlanan öğünleri sıfırla
      setCompletedMeals(new Set());
      
      // Bugünün yemeklerini sıfırla
      setTodayMeals([]);
      
      // AsyncStorage'dan eski verileri temizle
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.removeItem(`completed_meals_${today}`);
      await AsyncStorage.removeItem(`daily_intake_${today}`);
      await AsyncStorage.removeItem(`today_meals_${today}`);
      
    } catch (error) {
      console.error('❌ Günlük sıfırlama hatası:', error);
    }
  };


  // Diyet hesaplama fonksiyonu
  const calculateDiet = async () => {
    if (!userData?.id) return;
    
    try {
      setLoading(true);
      
      // Diet profile'ı getir
      const { data: dietProfile, error } = await supabase
        .from('diet_profiles')
        .select('*')
        .eq('user_id', userData.id)
        .eq('is_active', true)
        .single();

      // Kullanıcı verilerini al
      const userProfile = {
        gender: userData.gender || 'male',
        weight: userData.current_weight || 70,
        height: userData.height || 175,
        age: userData.age || 25,
        activityLevel: dietProfile?.activity_level || 'moderately_active',
        goalType: dietProfile?.goal_type || 'maintain_weight',
        goalPercentage: dietProfile?.goal_percentage || 0,
        dietType: dietProfile?.diet_type || 'balanced'
      };
      
      // Diyet planını hesapla
      const plan = calculateDietPlan(userProfile);
      setDietPlan(plan);
      
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('diet_plan', JSON.stringify(plan));
      
    } catch (error) {
      console.error('❌ Diet calculation error:', error);
      Alert.alert(t.error, t.bmr_calculation_error);
    } finally {
      setLoading(false);
    }
  };

  // Günlük alımı yükle
  const loadDailyIntake = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Supabase'den bugünkü food logs'ları al
      const { data: foodLogs, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userData.id)
        .eq('log_date', today);

      if (error) throw error;

      // Kalori ve makroları hesapla
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalFiber = 0;

      if (foodLogs && foodLogs.length > 0) {
        foodLogs.forEach(log => {
          totalCalories += log.calories || 0;
          totalProtein += log.protein_g || 0;
          totalCarbs += log.carb_g || 0;
          totalFat += log.fat_g || 0;
          totalFiber += log.fiber_g || 0;
        });
      }

      // NOT: Haftalık plandan bugünkü öğünleri otomatik ekleme - bu kaldırıldı
      // Çünkü sadece kullanıcının aktif olarak eklediği/tamamladığı öğünler sayılmalı

      // Water logs'ları al
      const { data: waterLogs, waterError } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', userData.id)
        .eq('log_date', today);

      let totalWater = 0;
      if (waterLogs && waterLogs.length > 0) {
        waterLogs.forEach(log => {
          totalWater += log.amount_ml || 0;
        });
      }

      const newIntake = {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        fiber: totalFiber,
        water: totalWater
      };

      setDailyIntake(newIntake);

      // AsyncStorage'a da kaydet (sadece bugünkü tarih için)
      await AsyncStorage.setItem(`daily_intake_${today}`, JSON.stringify(newIntake));
      
    } catch (error) {
      console.error('❌ Daily intake load error:', error);
    }
  };

  // Diyet planını yükle
  const loadDietPlan = async () => {
    try {
      const savedPlan = await AsyncStorage.getItem('diet_plan');
      if (savedPlan) {
        setDietPlan(JSON.parse(savedPlan));
        setHasSetup(true);
      }
    } catch (error) {
      console.error('❌ Diet plan load error:', error);
    }
  };

  // Su hedefini yükle
  const loadWaterGoal = async () => {
    try {
      const savedGoal = await AsyncStorage.getItem('water_goal');
      if (savedGoal) {
        setWaterGoal(parseInt(savedGoal));
      }
    } catch (error) {
      console.error('❌ Water goal load error:', error);
    }
  };

  // Su alımını veritabanına kaydet
  const saveWaterIntake = async (amount) => {
    if (!userData?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Mevcut water log'u kontrol et
      const { data: existingLog, error: checkError } = await supabase
        .from('water_logs')
        .select('id')
        .eq('user_id', userData.id)
        .eq('log_date', today)
        .single();

      if (existingLog) {
        // Güncelle
        const { error: updateError } = await supabase
          .from('water_logs')
          .update({ 
            amount_ml: amount
          })
          .eq('id', existingLog.id);

        if (updateError) throw updateError;
      } else {
        // Yeni kayıt oluştur
        const { error: insertError } = await supabase
          .from('water_logs')
          .insert([{
            user_id: userData.id,
            log_date: today,
            amount_ml: amount,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      // AsyncStorage'a da kaydet
      await AsyncStorage.setItem(`daily_intake_${today}`, JSON.stringify({
        ...dailyIntake,
        water: amount
      }));

    } catch (error) {
      console.error('❌ Su alımı kaydetme hatası:', error);
    }
  };

  // Bugünün öğünlerini yükle
  const loadTodayMeals = async (mealType) => {
    if (!userData?.id) return;
    
    try {
      const today = new Date().getDay(); // 0=Pazar, 1=Pazartesi, ...
      
      // Haftalık plandan bugünkü öğünleri al
      const { data: plannedMeals, error } = await supabase
        .from('planned_meals')
        .select('*')
        .eq('day_of_week', today)
        .eq('meal_type', mealType);

      if (error) throw error;

      setTodayMeals(plannedMeals || []);
      setSelectedMealType(mealType);
      setShowMealModal(true);

    } catch (error) {
      console.error('❌ Öğün yükleme hatası:', error);
    }
  };

  // Öğünü tamamlandı olarak işaretle
  const toggleMealCompletion = async (mealId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const isCompleted = completedMeals.has(mealId);
      
      if (isCompleted) {
        // Tamamlandı işaretini kaldır
        const newSet = new Set(completedMeals);
        newSet.delete(mealId);
        setCompletedMeals(newSet);
        
        // AsyncStorage'a kaydet
        await AsyncStorage.setItem(`completed_meals_${today}`, JSON.stringify([...newSet]));
      } else {
        // Tamamlandı olarak işaretle
        const newSet = new Set([...completedMeals, mealId]);
        setCompletedMeals(newSet);
        
        // AsyncStorage'a kaydet
        await AsyncStorage.setItem(`completed_meals_${today}`, JSON.stringify([...newSet]));
        
        // Tamamlanan öğünün kalorilerini daily intake'e ekle
        const completedMeal = todayMeals.find(meal => meal.id === mealId);
        if (completedMeal) {
          const newCalories = dailyIntake.calories + (completedMeal.calories || 0);
          const newProtein = dailyIntake.protein + (completedMeal.protein_g || 0);
          const newCarbs = dailyIntake.carbs + (completedMeal.carb_g || 0);
          const newFat = dailyIntake.fat + (completedMeal.fat_g || 0);
          const newFiber = dailyIntake.fiber + (completedMeal.fiber_g || 0);
          
          setDailyIntake(prev => ({
            ...prev,
            calories: newCalories,
            protein: newProtein,
            carbs: newCarbs,
            fat: newFat,
            fiber: newFiber
          }));

          // Veritabanına da kaydet
          await saveCompletedMeal(completedMeal);
        }
      }
    } catch (error) {
      console.error('❌ Öğün tamamlama hatası:', error);
    }
  };

  // Tamamlanan öğünü veritabanına kaydet
  const saveCompletedMeal = async (meal) => {
    if (!userData?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Food log'a ekle
      const { error } = await supabase
        .from('food_logs')
        .insert([{
          user_id: userData.id,
          food_id: meal.food_id,
          food_name: meal.food_name,
          log_date: today,
          meal_type: meal.meal_type,
          portion_size_g: meal.portion_size_g,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carb_g: meal.carb_g,
          fat_g: meal.fat_g,
          fiber_g: meal.fiber_g,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

    } catch (error) {
      console.error('❌ Tamamlanan öğün kaydetme hatası:', error);
    }
  };

  useEffect(() => {
    const initializeScreen = async () => {
      await checkDayChange(); // İlk önce gün değişikliği kontrolü yap
      loadDietPlan();
      loadDailyIntake();
      loadWaterGoal();
    };
    
    initializeScreen();
  }, []);

  // Kullanıcı verileri değiştiğinde diyet planını yeniden hesapla
  useEffect(() => {
    if (userData?.id && userData?.current_weight && userData?.height && userData?.age) {
      calculateDiet();
    }
  }, [userData?.current_weight, userData?.height, userData?.age]);

  useEffect(() => {
    if (userData?.id && !hasSetup) {
      calculateDiet();
    }
  }, [userData?.id]);

  // Ekran focus olduğunda yeniden hesapla (ayarlar değiştiğinde)
  useFocusEffect(
    React.useCallback(() => {
      if (userData?.id) {
        
        // Önce gün değişikliği kontrolü yap
        checkDayChange().then(() => {
          calculateDiet();
          loadDailyIntake(); // Günlük alımı da yenile
        });
      }
    }, [userData?.id])
  );

  // Route parametresi değiştiğinde verileri yenile
  useEffect(() => {
    if (route.params?.refresh && userData?.id) {
      loadDailyIntake();
    }
  }, [route.params?.refresh, userData?.id]);

  // Kalori ilerlemesi hesaplama
  const getCalorieProgress = () => {
    if (!dietPlan) return 0;
    return Math.min(100, (dailyIntake.calories / dietPlan.targetCalories) * 100);
  };

  // Su ilerlemesi hesaplama
  const getWaterProgress = () => {
    return Math.min(100, (dailyIntake.water / waterGoal) * 100);
  };

  // Makro ilerlemesi hesaplama
  const getMacroProgress = (consumed, target) => {
    if (target === 0) return 0;
    return Math.min(100, (consumed / target) * 100);
  };

  // Renk hesaplama
  const getProgressColor = (progress) => {
    if (progress >= 90) return colors.success;
    if (progress >= 70) return colors.warning;
    return colors.error;
  };

  // Öğün kartları
  const mealSlots = [
    { key: 'breakfast', icon: '🌅', name: t.breakfast },
    { key: 'morning_snack', icon: '🍎', name: t.morning_snack },
    { key: 'lunch', icon: '🍽️', name: t.lunch },
    { key: 'afternoon_snack', icon: '🥜', name: t.afternoon_snack },
    { key: 'dinner', icon: '🍜', name: t.dinner },
    { key: 'evening_snack', icon: '🥛', name: t.evening_snack }
  ];

  // Satın alma fonksiyonu
  const handlePurchase = async () => {
    setPurchaseLoading(true);
    setLoadingType('purchase');
    const success = await purchaseSubscription();
    setPurchaseLoading(false);
    setLoadingType(null);
    
    if (success) {
      setShowFullPaywall(false);
    }
  };

  // Geri yükleme fonksiyonu
  const handleRestore = async () => {
    setPurchaseLoading(true);
    setLoadingType('restore');
    await restorePurchases();
    setPurchaseLoading(false);
    setLoadingType(null);
  };

  // ABONELİK KONTROLÜ: Eğer kullanıcı Pro değilse Paywall göster
  if (subscriptionLoading) {
    // Abonelik durumu yüklenirken loading göster
    return (
      <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
        <Header 
          title={t.diet_dashboard}
          subtitle={t.diet_subtitle}
          showProfile={false}
        />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textMuted, marginTop: spacing.md }}>
            {language === 'tr' ? 'Abonelik kontrol ediliyor...' : 'Checking subscription...'}
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!isPro) {
    // Kullanıcı Pro değil - Paywall göster
    return (
      <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
        <Header 
          title={t.diet_dashboard}
          subtitle={language === 'tr' ? 'Pro Özellik 🌟' : 'Pro Feature 🌟'}
          showProfile={false}
        />
        <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
          {showFullPaywall ? (
            <>
              {/* Full Paywall Modal */}
              <ScrollView>
                <Paywall 
                  onPurchase={handlePurchase}
                  onRestore={handleRestore}
                  isLoading={purchaseLoading}
                  loadingType={loadingType}
                />
              </ScrollView>
              {/* Geri butonu */}
              <TouchableOpacity
                onPress={() => setShowFullPaywall(false)}
                style={{
                  position: 'absolute',
                  top: spacing.md,
                  left: spacing.md,
                  backgroundColor: colors.card,
                  borderRadius: 20,
                  padding: spacing.sm,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </>
          ) : (
            /* Inline Paywall - Kilitleme ekranı */
            <Paywall onClose={() => setShowFullPaywall(false)} />
          )}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // KULLANICI PRO - DİYET İÇERİĞİNİ GÖSTER
  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <Header 
        title={t.diet_dashboard}
        subtitle={t.diet_subtitle}
        showProfile={false}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView 
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          
          {/* Kalori İlerlemesi - Büyük Kart */}
          {dietPlan && (
            <Card style={{ 
              marginBottom: spacing.lg, 
              padding: spacing.xl,
              alignItems: 'center'
            }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 18, 
                fontWeight: '700',
                marginBottom: spacing.lg
              }}>
                🎯 {t.daily_calories}
              </Text>
              
              <View style={{ 
                width: 160, 
                height: 160, 
                marginBottom: spacing.lg,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <ProgressRing 
                  size={160} 
                  stroke={16} 
                  progress={getCalorieProgress() / 100} 
                  color={getProgressColor(getCalorieProgress())}
                />
                <View style={{
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ 
                    color: getProgressColor(getCalorieProgress()), 
                    fontSize: 42, 
                    fontWeight: '900'
                  }}>
                    {Math.round(getCalorieProgress())}%
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'center', width: '100%' }}>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-around',
                  width: '100%',
                  marginTop: spacing.md,
                  paddingTop: spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: colors.border
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.consumed_calories}</Text>
                    <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '700' }}>
                      {dailyIntake.calories}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.target_calories}</Text>
                    <Text style={{ color: colors.success, fontSize: 24, fontWeight: '700' }}>
                      {dietPlan.targetCalories}
                    </Text>
                  </View>
                </View>
                
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'center',
                  width: '100%',
                  marginTop: spacing.sm
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.rounding_calories}</Text>
                    <Text style={{ 
                      color: (dietPlan.targetCalories - dailyIntake.calories) >= 0 
                        ? colors.success : colors.error, 
                      fontSize: 18, 
                      fontWeight: '700' 
                    }}>
                      {(dietPlan.targetCalories - dailyIntake.calories) >= 0 ? '+' : ''}
                      {dietPlan.targetCalories - dailyIntake.calories}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Makro İlerlemesi */}
          {dietPlan && (
            <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 18, 
                fontWeight: '700',
                marginBottom: spacing.md,
                textAlign: 'center'
              }}>
                🥗 {t.macros}
              </Text>
              
              <View style={{ gap: spacing.md }}>
                {/* Protein */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600', marginRight: spacing.sm }}>
                      🥩 {t.protein}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {dailyIntake.protein}g / {dietPlan.macros.protein_g}g
                    </Text>
                  </View>
                  <View style={{ 
                    width: 60, 
                    height: 8, 
                    backgroundColor: colors.backgroundAlt, 
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      width: `${getMacroProgress(dailyIntake.protein, dietPlan.macros.protein_g)}%`,
                      height: '100%',
                      backgroundColor: colors.primary,
                      borderRadius: 4
                    }} />
                  </View>
                </View>

                {/* Karbonhidrat */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: colors.warning, fontSize: 16, fontWeight: '600', marginRight: spacing.sm }}>
                      🍞 {t.carbs}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {dailyIntake.carbs}g / {dietPlan.macros.carb_g}g
                    </Text>
                  </View>
                  <View style={{ 
                    width: 60, 
                    height: 8, 
                    backgroundColor: colors.backgroundAlt, 
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      width: `${getMacroProgress(dailyIntake.carbs, dietPlan.macros.carb_g)}%`,
                      height: '100%',
                      backgroundColor: colors.warning,
                      borderRadius: 4
                    }} />
                  </View>
                </View>

                {/* Yağ */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: colors.error, fontSize: 16, fontWeight: '600', marginRight: spacing.sm }}>
                      🥑 {t.fat}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {dailyIntake.fat}g / {dietPlan.macros.fat_g}g
                    </Text>
                  </View>
                  <View style={{ 
                    width: 60, 
                    height: 8, 
                    backgroundColor: colors.backgroundAlt, 
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      width: `${getMacroProgress(dailyIntake.fat, dietPlan.macros.fat_g)}%`,
                      height: '100%',
                      backgroundColor: colors.error,
                      borderRadius: 4
                    }} />
                  </View>
                </View>

                {/* Lif */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: colors.success, fontSize: 16, fontWeight: '600', marginRight: spacing.sm }}>
                      🌾 {t.fiber}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {dailyIntake.fiber}g / {dietPlan.macros.fiber_g}g
                    </Text>
                  </View>
                  <View style={{ 
                    width: 60, 
                    height: 8, 
                    backgroundColor: colors.backgroundAlt, 
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      width: `${getMacroProgress(dailyIntake.fiber, dietPlan.macros.fiber_g)}%`,
                      height: '100%',
                      backgroundColor: colors.success,
                      borderRadius: 4
                    }} />
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Su Takibi */}
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md
            }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 18, 
                fontWeight: '700' 
              }}>
                💧 {t.water_tracking}
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  // Su azaltma fonksiyonu
                  const newWater = Math.max(dailyIntake.water - 250, 0);
                  setDailyIntake(prev => ({ ...prev, water: newWater }));
                  
                  // Veritabanına kaydet
                  await saveWaterIntake(newWater);
                }}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  marginRight: spacing.sm,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Ionicons name="arrow-undo-outline" size={16} color={colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={async () => {
                  // Su ekleme fonksiyonu
                  const newWater = dailyIntake.water + 250;
                  setDailyIntake(prev => ({ ...prev, water: newWater }));
                  
                  // Veritabanına kaydet
                  await saveWaterIntake(newWater);
                }}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm
                }}
              >
                <Text style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                  +250ml
                </Text>
              </TouchableOpacity>
            </View>

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
                  progress={getWaterProgress() / 100} 
                  color={colors.info}
                />
                <View style={{
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ 
                    color: colors.info, 
                    fontSize: 24, 
                    fontWeight: '900'
                  }}>
                    {Math.round(getWaterProgress())}%
                  </Text>
                </View>
              </View>

              <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                {dailyIntake.water}ml / {waterGoal}ml
              </Text>
            </View>
          </Card>


          {/* Bugünkü Öğünler */}
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
            <Text style={{ 
              color: colors.text, 
              fontSize: 18, 
              fontWeight: '700',
              marginBottom: spacing.md
            }}>
              🍽️ {t.meals}
            </Text>
            
            <View style={{ gap: spacing.sm }}>
              {mealSlots.map((meal, index) => (
                <TouchableOpacity
                  key={meal.key}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary
                  }}
                  onPress={() => {
                    // Bugünün o öğününü göster
                    loadTodayMeals(meal.key);
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: spacing.md }}>
                    {meal.icon}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      color: colors.text, 
                      fontSize: 16, 
                      fontWeight: '600' 
                    }}>
                      {meal.name}
                    </Text>
                    <Text style={{ 
                      color: colors.textMuted, 
                      fontSize: 12 
                    }}>
                      {t.tap_to_add_meal || 'Öğün eklemek için dokunun'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Hızlı Erişim */}
          <View style={{ 
            flexDirection: 'row', 
            gap: spacing.md,
            marginBottom: spacing.lg
          }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('DietPlan')}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: colors.background === '#FFFFFF' ? 0.1 : 0,
                shadowRadius: 4,
                elevation: colors.background === '#FFFFFF' ? 2 : 0
              }}
            >
              <Ionicons name="calendar" size={32} color={colors.primary} />
              <Text style={{ 
                color: colors.text, 
                fontSize: 14, 
                fontWeight: '600',
                marginTop: spacing.sm,
                textAlign: 'center'
              }}>
                {t.weekly_plan}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('DietNotifications')}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: colors.background === '#FFFFFF' ? 0.1 : 0,
                shadowRadius: 4,
                elevation: colors.background === '#FFFFFF' ? 2 : 0
              }}
            >
              <Ionicons name="notifications" size={32} color={colors.info} />
              <Text style={{ 
                color: colors.text, 
                fontSize: 14, 
                fontWeight: '600',
                marginTop: spacing.sm,
                textAlign: 'center'
              }}>
                {language === 'tr' ? 'Hatırlatıcı' : 'Reminder'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('DietSettings')}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: colors.background === '#FFFFFF' ? 0.1 : 0,
                shadowRadius: 4,
                elevation: colors.background === '#FFFFFF' ? 2 : 0
              }}
            >
              <Ionicons name="settings" size={32} color={colors.warning} />
              <Text style={{ 
                color: colors.text, 
                fontSize: 14, 
                fontWeight: '600',
                marginTop: spacing.sm,
                textAlign: 'center'
              }}>
                {t.diet_settings}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loading State */}
          {loading && (
            <Card style={{ alignItems: 'center', padding: spacing.xl }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.text, marginTop: spacing.md }}>
                {t.calculating_diet || 'Diyet hesaplanıyor...'}
              </Text>
            </Card>
          )}

          {/* Setup Required */}
          {!hasSetup && !loading && (
            <Card style={{ alignItems: 'center', padding: spacing.xl }}>
              <Ionicons name="restaurant" size={48} color={colors.textMuted} />
              <Text style={{ 
                color: colors.textMuted, 
                textAlign: 'center',
                marginTop: spacing.md,
                fontSize: 14
              }}>
                {t.diet_setup_required || 'Diyet ayarlarını yapmak için profilinizi tamamlayın'}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
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
                  {t.complete_profile}
                </Text>
              </TouchableOpacity>
            </Card>
          )}

        </ScrollView>
      </SafeAreaView>

      {/* Meal Modal */}
      <Modal
        visible={showMealModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border
            }}>
              <TouchableOpacity
                onPress={() => setShowMealModal(false)}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {language === 'tr' ? 'Kapat' : 'Close'}
                </Text>
              </TouchableOpacity>
              
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                {language === 'tr' ? 'Bugünün Öğünleri' : 'Today\'s Meals'}
              </Text>
              
              <View style={{ width: 80 }} />
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }}>
              <View style={{ marginTop: spacing.lg }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
                  {language === 'tr' ? 
                    (selectedMealType === 'breakfast' ? '🌅 Kahvaltı' :
                     selectedMealType === 'morning_snack' ? '☕ Kuşluk' :
                     selectedMealType === 'lunch' ? '🍽️ Öğle' :
                     selectedMealType === 'afternoon_snack' ? '🍎 İkindi' :
                     selectedMealType === 'dinner' ? '🌙 Akşam' :
                     '🌃 Gece') :
                    (selectedMealType === 'breakfast' ? '🌅 Breakfast' :
                     selectedMealType === 'morning_snack' ? '☕ Morning Snack' :
                     selectedMealType === 'lunch' ? '🍽️ Lunch' :
                     selectedMealType === 'afternoon_snack' ? '🍎 Afternoon Snack' :
                     selectedMealType === 'dinner' ? '🌙 Dinner' :
                     '🌃 Evening Snack')
                  }
                </Text>

                {todayMeals.length === 0 ? (
                  <Card style={{ padding: spacing.xl, alignItems: 'center' }}>
                    <Ionicons name="restaurant-outline" size={48} color={colors.textMuted} />
                    <Text style={{ color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }}>
                      {language === 'tr' ? 'Bu öğün için planlanmış besin yok' : 'No planned foods for this meal'}
                    </Text>
                  </Card>
                ) : (
                  <View style={{ gap: spacing.sm }}>
                    {todayMeals.map((meal) => (
                      <TouchableOpacity
                        key={meal.id}
                        onPress={() => toggleMealCompletion(meal.id)}
                        style={{
                          backgroundColor: completedMeals.has(meal.id) ? colors.success : colors.card,
                          borderRadius: 12,
                          padding: spacing.md,
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderWidth: 2,
                          borderColor: completedMeals.has(meal.id) ? colors.success : colors.border
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ 
                            color: completedMeals.has(meal.id) ? colors.background : colors.text, 
                            fontSize: 16, 
                            fontWeight: '600' 
                          }}>
                            {meal.food_name}
                          </Text>
                          <Text style={{ 
                            color: completedMeals.has(meal.id) ? colors.background : colors.textMuted, 
                            fontSize: 14,
                            marginTop: 4
                          }}>
                            {meal.calories} kcal • {meal.portion_size_g}g
                          </Text>
                        </View>
                        
                        <View style={{ alignItems: 'center' }}>
                          {completedMeals.has(meal.id) ? (
                            <Ionicons name="checkmark-circle" size={24} color={colors.background} />
                          ) : (
                            <Ionicons name="ellipse-outline" size={24} color={colors.textMuted} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Özet */}
                {todayMeals.length > 0 && (
                  <Card style={{ marginTop: spacing.lg, padding: spacing.md }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>
                      📊 {language === 'tr' ? 'Öğün Özeti' : 'Meal Summary'}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                          {language === 'tr' ? 'Toplam Kalori' : 'Total Calories'}
                        </Text>
                        <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>
                          {Math.round(todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0))}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                          {language === 'tr' ? 'Tamamlanan' : 'Completed'}
                        </Text>
                        <Text style={{ color: colors.success, fontSize: 18, fontWeight: '700' }}>
                          {completedMeals.size}/{todayMeals.length}
                        </Text>
                      </View>
                    </View>
                  </Card>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}
