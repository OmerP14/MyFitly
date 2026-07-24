// src/screens/DietPlanScreen.js
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Header from '../components/Header';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';
import { supabase } from '../config/supabase';

export default function DietPlanScreen({ navigation }) {
  const { colors } = useTheme();
  const { userData } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);

  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState(null);
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1); // Pazartesi
  const [foodsMap, setFoodsMap] = useState({}); // Besin isimleri için map
  const [showAddCustomFoodModal, setShowAddCustomFoodModal] = useState(false);
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState(null);
  const [customFood, setCustomFood] = useState({
    name: '',
    name_tr: '',
    name_en: '',
    calories_per_100g: '',
    protein_g_per_100g: '',
    carb_g_per_100g: '',
    fat_g_per_100g: '',
    fiber_g_per_100g: '',
    category: 'custom'
  });
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customFoodMealType, setCustomFoodMealType] = useState('breakfast');
  const [selectedCustomDay, setSelectedCustomDay] = useState(1); // Pazartesi
  const [showFoodInput, setShowFoodInput] = useState(false);
  const [addedFoods, setAddedFoods] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    waterReminder: false,
    mealReminder: false,
    waterInterval: 2, // saat
    mealTimes: {
      breakfast: '08:00',
      lunch: '13:00',
      dinner: '19:00'
    }
  });

  const daysOfWeek = language === 'tr' ? [
    { id: 1, name: t.monday || 'Pazartesi', shortName: 'Pzt' },
    { id: 2, name: t.tuesday || 'Salı', shortName: 'Sal' },
    { id: 3, name: t.wednesday || 'Çarşamba', shortName: 'Çar' },
    { id: 4, name: t.thursday || 'Perşembe', shortName: 'Per' },
    { id: 5, name: t.friday || 'Cuma', shortName: 'Cum' },
    { id: 6, name: t.saturday || 'Cumartesi', shortName: 'Cmt' },
    { id: 0, name: t.sunday || 'Pazar', shortName: 'Paz' }
  ] : [
    { id: 1, name: 'Monday', shortName: 'Mon' },
    { id: 2, name: 'Tuesday', shortName: 'Tue' },
    { id: 3, name: 'Wednesday', shortName: 'Wed' },
    { id: 4, name: 'Thursday', shortName: 'Thu' },
    { id: 5, name: 'Friday', shortName: 'Fri' },
    { id: 6, name: 'Saturday', shortName: 'Sat' },
    { id: 0, name: 'Sunday', shortName: 'Sun' }
  ];

  const mealTypes = [
    { id: 'breakfast', icon: '🌅', label: t.breakfast || 'Kahvaltı' },
    { id: 'morning_snack', icon: '☕', label: t.morning_snack || 'Kuşluk' },
    { id: 'lunch', icon: '🍽️', label: t.lunch || 'Öğle' },
    { id: 'afternoon_snack', icon: '🍎', label: t.afternoon_snack || 'İkindi' },
    { id: 'dinner', icon: '🌙', label: t.dinner || 'Akşam' },
    { id: 'evening_snack', icon: '🌃', label: t.evening_snack || 'Gece' }
  ];

  // Gün adını getir
  const getDayName = (dayIndex) => {
    const dayNames = {
      0: language === 'tr' ? 'Pazar' : 'Sunday',
      1: language === 'tr' ? 'Pazartesi' : 'Monday',
      2: language === 'tr' ? 'Salı' : 'Tuesday',
      3: language === 'tr' ? 'Çarşamba' : 'Wednesday',
      4: language === 'tr' ? 'Perşembe' : 'Thursday',
      5: language === 'tr' ? 'Cuma' : 'Friday',
      6: language === 'tr' ? 'Cumartesi' : 'Saturday'
    };
    return dayNames[dayIndex] || dayNames[1];
  };

  useEffect(() => {
    loadMealPlan();
  }, [userData]);

  // selectedDay değiştiğinde meal plan'ı yeniden yükle
  useEffect(() => {
    if (mealPlan) {
      loadMealPlan();
    }
  }, [selectedDay]);

  // Dil değiştiğinde besin isimlerini yeniden yükle
  useEffect(() => {
    if (plannedMeals.length > 0) {
      loadFoodNames();
    }
  }, [language, plannedMeals]);

  const loadFoodNames = async () => {
    if (plannedMeals.length === 0) return;
    
    const foodIds = [...new Set(plannedMeals.map(meal => meal.food_id).filter(id => id))];
    if (foodIds.length === 0) return;

    try {
      const { data: foodsData, error: foodsError } = await supabase
        .from('foods')
        .select('id, name_tr, name_en')
        .in('id', foodIds);

      if (!foodsError && foodsData) {
        const foodsMapData = {};
        foodsData.forEach(food => {
          foodsMapData[food.id] = {
            name_tr: food.name_tr,
            name_en: food.name_en
          };
        });
        setFoodsMap(foodsMapData);
      }
    } catch (error) {
      console.error('🔴 Besin isimleri yükleme hatası:', error);
    }
  };

  // Besin önerilerini arama fonksiyonu
  const searchFoodSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setFoodSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const nameField = language === 'tr' ? 'name_tr' : 'name_en';
      const searchField = language === 'tr' ? 'name_tr' : 'name_en';
      
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('is_active', true)
        .ilike(searchField, `%${query}%`)
        .order(nameField, { ascending: true })
        .limit(10);

      if (error) throw error;
      
      setFoodSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('🔴 Besin önerileri arama hatası:', error);
      setFoodSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Besin seçme fonksiyonu
  const selectFoodSuggestion = (food) => {
    setCustomFood({
      name: language === 'tr' ? (food.name_tr || food.name) : (food.name_en || food.name),
      name_tr: food.name_tr || food.name,
      name_en: food.name_en || food.name,
      calories_per_100g: food.calories_per_100g.toString(),
      protein_g_per_100g: food.protein_g_per_100g.toString(),
      carb_g_per_100g: food.carb_g_per_100g.toString(),
      fat_g_per_100g: food.fat_g_per_100g.toString(),
      fiber_g_per_100g: food.fiber_g_per_100g.toString(),
      category: food.category || 'custom'
    });
    setShowSuggestions(false);
    setFoodSuggestions([]);
  };

  // Hatırlatıcı ayarlarını kaydetme fonksiyonu
  const saveReminderSettings = async () => {
    try {
      const { error } = await supabase
        .from('user_reminders')
        .upsert([{
          user_id: userData.id,
          water_reminder_enabled: reminderSettings.waterReminder,
          meal_reminder_enabled: reminderSettings.mealReminder,
          water_interval_hours: reminderSettings.waterInterval,
          breakfast_time: reminderSettings.mealTimes.breakfast,
          lunch_time: reminderSettings.mealTimes.lunch,
          dinner_time: reminderSettings.mealTimes.dinner,
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      Alert.alert(
        language === 'tr' ? 'Başarılı' : 'Success',
        language === 'tr' ? 'Hatırlatıcı ayarları kaydedildi!' : 'Reminder settings saved!'
      );

      setShowReminderModal(false);
    } catch (error) {
      console.error('🔴 Hatırlatıcı ayarları kaydetme hatası:', error);
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' ? 'Ayarlar kaydedilirken hata oluştu' : 'Error saving settings'
      );
    }
  };

  // Özel besin ekleme fonksiyonu - Artık sadece listeye ekler
  const addCustomFood = () => {
    if (!customFood.name || !customFood.calories_per_100g) {
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' ? 'Besin adı ve kalori bilgisi gereklidir' : 'Food name and calories are required'
      );
      return;
    }

    // Besini listeye ekle
    const newFood = {
      id: Date.now(), // Geçici ID
      name: customFood.name,
      calories: parseFloat(customFood.calories_per_100g),
      protein: parseFloat(customFood.protein_g_per_100g) || 0,
      carbs: parseFloat(customFood.carb_g_per_100g) || 0,
      fat: parseFloat(customFood.fat_g_per_100g) || 0,
      fiber: parseFloat(customFood.fiber_g_per_100g) || 0,
      portion: 100, // Varsayılan 100g
      day: selectedCustomDay,
      mealType: customFoodMealType
    };

    setAddedFoods(prev => [...prev, newFood]);

    // Formu temizle
    setCustomFood({
      name: '',
      name_tr: '',
      name_en: '',
      calories_per_100g: '',
      protein_g_per_100g: '',
      carb_g_per_100g: '',
      fat_g_per_100g: '',
      fiber_g_per_100g: '',
      category: 'custom'
    });

    Alert.alert(
      language === 'tr' ? 'Başarılı' : 'Success',
      language === 'tr' ? 'Besin listeye eklendi!' : 'Food added to list!'
    );
  };

  // Meal plan oluştur veya bul
  const getOrCreateMealPlan = async () => {
    try {
      // Önce mevcut meal plan'ı kontrol et
      const { data: existingPlans, error: checkError } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', userData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const existingPlan = existingPlans && existingPlans.length > 0 ? existingPlans[0] : null;

      if (existingPlan && !checkError) {
        return existingPlan.id;
      }

      // Meal plan yoksa oluştur
      const { data: newPlan, error: createError } = await supabase
        .from('meal_plans')
        .insert([{
          user_id: userData.id,
          plan_name: language === 'tr' ? 'Haftalık Diyet Planım' : 'My Weekly Diet Plan',
          description: language === 'tr' ? 'Kişisel haftalık diyet planım' : 'Personal weekly diet plan',
          start_date: new Date().toISOString().split('T')[0], // Bugünün tarihi
          is_active: true
        }])
        .select()
        .single();

      if (createError) {
        // Raised key constraint hatası ise mevcut planı bul
        if (createError.code === '23505') {
          const { data: existingPlans, error: findError } = await supabase
            .from('meal_plans')
            .select('id')
            .eq('user_id', userData.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (findError) throw findError;
          const existingPlan = existingPlans && existingPlans.length > 0 ? existingPlans[0] : null;
          if (!existingPlan) throw new Error('Mevcut meal plan bulunamadı');
          return existingPlan.id;
        }
        throw createError;
      }

      return newPlan.id;
    } catch (error) {
      console.error('🔴 Meal plan oluşturma hatası:', error);
      throw error;
    }
  };

  // Mevcut besini haftalık plana ekleme fonksiyonu
  const addExistingFoodToPlan = async (existingFood) => {
    try {
      // Meal plan'ı oluştur veya bul
      const mealPlanId = await getOrCreateMealPlan();

      // Seçili güne ve öğüne besini ekle
      const dayOfWeek = selectedDay; // Haftalık planda seçili gün
      
      const mealData = {
        meal_plan_id: mealPlan.id,
        food_id: existingFood.id,
        food_name: existingFood.name,
        meal_type: customFoodMealType,
        day_of_week: dayOfWeek,
        portion_size_g: 100, // Varsayılan 100g
        calories: parseFloat(customFood.calories_per_100g) || 0,
        protein_g: parseFloat(customFood.protein_g_per_100g) || 0,
        carb_g: parseFloat(customFood.carb_g_per_100g) || 0,
        fat_g: parseFloat(customFood.fat_g_per_100g) || 0,
        fiber_g: parseFloat(customFood.fiber_g_per_100g) || 0,
        created_at: new Date().toISOString()
      };

      const { error: mealError } = await supabase
        .from('planned_meals')
        .insert([mealData]);

      if (mealError) throw mealError;

      Alert.alert(
        language === 'tr' ? 'Başarılı' : 'Success',
        language === 'tr' ? 'Mevcut besin haftalık plana eklendi!' : 'Existing food added to weekly plan!'
      );

      setShowAddCustomFoodModal(false);
      setShowSuggestions(false);
      setFoodSuggestions([]);
      setCustomFood({
        name: '',
        name_tr: '',
        name_en: '',
        calories_per_100g: '',
        protein_g_per_100g: '',
        carb_g_per_100g: '',
        fat_g_per_100g: '',
        fiber_g_per_100g: '',
        category: 'custom'
      });
      setCustomFoodMealType('breakfast');

      // Planı yeniden yükle
      loadMealPlan();

    } catch (error) {
      console.error('🔴 Mevcut besin ekleme hatası:', error);
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' ? 'Besin eklenirken hata oluştu' : 'Error adding food'
      );
    }
  };

  // Öğünden besin kaldırma fonksiyonu
  const removeMealFromPlan = async (mealId) => {
    try {
      const { error } = await supabase
        .from('planned_meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;

      // State'i hemen güncelle (UI'nin anında yenilenmesi için)
      setPlannedMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));

      Alert.alert(
        language === 'tr' ? 'Başarılı' : 'Success',
        language === 'tr' ? 'Öğün plandan kaldırıldı!' : 'Meal removed from plan!'
      );

      // Planı da yeniden yükle (veri tutarlılığı için)
      loadMealPlan();

      // Ana ekrana geri dön ve refresh parametresi gönder
      navigation.navigate('Diet', { refresh: Date.now() });
    } catch (error) {
      console.error('🔴 Öğün kaldırma hatası:', error);
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' ? 'Öğün kaldırılırken hata oluştu' : 'Error removing meal'
      );
    }
  };

  // Öğüne besin ekleme fonksiyonu
  const addFoodToMealPlan = async (food, dayOfWeek, mealType, portionSize = 100) => {
    try {
      if (!mealPlan) {
        // Meal plan yoksa oluştur
        const { data: newPlan, error: planError } = await supabase
          .from('meal_plans')
          .insert([{
            user_id: userData.id,
            plan_name: language === 'tr' ? 'Haftalık Diyet' : 'Weekly Diet',
            plan_type: 'weekly',
            start_date: new Date().toISOString().split('T')[0],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (planError) throw planError;
        setMealPlan(newPlan);
      }

      const calories = Math.round((food.calories_per_100g * portionSize) / 100);
      const protein = Math.round((food.protein_g_per_100g * portionSize) / 100);
      const carbs = Math.round((food.carb_g_per_100g * portionSize) / 100);
      const fat = Math.round((food.fat_g_per_100g * portionSize) / 100);
      const fiber = Math.round((food.fiber_g_per_100g * portionSize) / 100);

      const { error } = await supabase
        .from('planned_meals')
        .insert([{
          meal_plan_id: mealPlan?.id,
          day_of_week: dayOfWeek,
          meal_type: mealType,
          food_id: food.id,
          food_name: language === 'tr' ? (food.name_tr || food.name) : (food.name_en || food.name),
          portion_size_g: portionSize,
          calories,
          protein_g: protein,
          carb_g: carbs,
          fat_g: fat,
          fiber_g: fiber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      Alert.alert(
        language === 'tr' ? 'Başarılı' : 'Success',
        language === 'tr' ? 'Besin plana eklendi!' : 'Food added to plan!'
      );

      setShowAddToPlanModal(false);
      loadMealPlan(); // Planı yeniden yükle
    } catch (error) {
      console.error('🔴 Besin plana ekleme hatası:', error);
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' ? 'Besin plana eklenirken hata oluştu' : 'Error adding food to plan'
      );
    }
  };

  const loadMealPlan = async () => {
    if (!userData?.id) return;

    setLoading(true);
    try {
      // Kullanıcının aktif meal plan'ını getir veya oluştur
      let planData;
      const { data: existingPlans, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const existingPlan = existingPlans && existingPlans.length > 0 ? existingPlans[0] : null;

      if (planError || !existingPlan) {
        
        // Meal plan oluştur
        const { data: newPlan, error: createError } = await supabase
          .from('meal_plans')
          .insert([{
            user_id: userData.id,
            plan_name: language === 'tr' ? 'Haftalık Diyet Planım' : 'My Weekly Diet Plan',
            description: language === 'tr' ? 'Kişisel haftalık diyet planım' : 'Personal weekly diet plan',
            start_date: new Date().toISOString().split('T')[0], // Bugünün tarihi
            is_active: true
          }])
          .select()
          .single();

        if (createError) {
          // Raised key constraint hatası ise mevcut planı bul
          if (createError.code === '23505') {
            const { data: existingPlans, error: findError } = await supabase
              .from('meal_plans')
              .select('*')
              .eq('user_id', userData.id)
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (findError) throw findError;
            const existingPlan = existingPlans && existingPlans.length > 0 ? existingPlans[0] : null;
            if (!existingPlan) throw new Error('Mevcut meal plan bulunamadı');
            planData = existingPlan;
          } else {
            throw createError;
          }
        } else {
          planData = newPlan;
        }
      } else {
        planData = existingPlan;
      }

      setMealPlan(planData);

      // Planlanmış öğünleri getir
      const { data: mealsData, error: mealsError } = await supabase
        .from('planned_meals')
        .select('*')
        .eq('meal_plan_id', planData.id)
        .order('day_of_week', { ascending: true })
        .order('meal_order', { ascending: true });

      if (mealsError) throw mealsError;

      setPlannedMeals(mealsData || []);
    } catch (error) {
      console.error('🔴 Meal plan yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMealsForDay = (dayId) => {
    const meals = plannedMeals.filter(meal => meal.day_of_week === dayId);
    return meals;
  };

  const getMealsByType = (dayMeals, mealType) => {
    return dayMeals.filter(meal => meal.meal_type === mealType);
  };

  const renderMeal = (meal) => {
    // Besin ismini dil bazlı olarak getir
    let displayName = meal.food_name;
    
    if (meal.food_id && foodsMap[meal.food_id]) {
      const foodData = foodsMap[meal.food_id];
      displayName = language === 'tr' ? (foodData.name_tr || meal.food_name) : (foodData.name_en || meal.food_name);
    }

    return (
      <View 
        key={meal.id}
        style={{
          backgroundColor: colors.backgroundAlt,
          borderRadius: 8,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderLeftWidth: 3,
          borderLeftColor: colors.primary,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>
            {displayName}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: spacing.xs }}>
            {meal.portion_size_g}g • {Math.round(meal.calories)} kcal
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>
            P: {Math.round(meal.protein_g)}g • C: {Math.round(meal.carb_g)}g • F: {Math.round(meal.fat_g)}g
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              language === 'tr' ? 'Öğünü Kaldır' : 'Remove Meal',
              language === 'tr' ? 'Bu öğünü plandan kaldırmak istediğinizden emin misiniz?' : 'Are you sure you want to remove this meal from the plan?',
              [
                {
                  text: language === 'tr' ? 'İptal' : 'Cancel',
                  style: 'cancel'
                },
                {
                  text: language === 'tr' ? 'Kaldır' : 'Remove',
                  style: 'destructive',
                  onPress: () => removeMealFromPlan(meal.id)
                }
              ]
            );
          }}
          style={{
            backgroundColor: colors.error,
            borderRadius: 15,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            marginLeft: spacing.sm
          }}
        >
          <Ionicons name="trash-outline" size={16} color={colors.background} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
        <Header
          title={t.diet_plan || 'Diyet Planı'}
          subtitle={t.weekly_meal_plan || 'Haftalık öğün planınız'}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} edges={["left", "right"]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textMuted, marginTop: spacing.md }}>
            {t.loading_plan || 'Plan yükleniyor...'}
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!mealPlan) {
    return (
      <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
        <Header
          title={t.diet_plan || 'Diyet Planı'}
          subtitle={t.weekly_meal_plan || 'Haftalık öğün planınız'}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }} edges={["left", "right"]}>
          <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.lg, textAlign: 'center' }}>
            {t.no_meal_plan || 'Henüz diyet planınız yok'}
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' }}>
            {t.create_meal_plan_desc || 'Kişiselleştirilmiş diyet planı oluşturmak için ayarlardan başlayın'}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('DietSettings')}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              marginTop: spacing.xl
            }}
          >
            <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700' }}>
              {t.go_to_settings || 'Ayarlara Git'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const todayMeals = getMealsForDay(selectedDay);

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
           <Header
             title={t.diet_plan || 'Diyet Planı'}
             showBackButton
             onBackPress={() => navigation.goBack()}
             centerComponent={
               <TouchableOpacity
                 onPress={() => setShowReminderModal(true)}
                 style={{
                   backgroundColor: colors.card,
                   borderRadius: 20,
                   paddingHorizontal: spacing.md,
                   paddingVertical: spacing.sm,
                   flexDirection: 'row',
                   alignItems: 'center',
                   borderWidth: 1,
                   borderColor: colors.border
                 }}
               >
                 <Ionicons name="notifications" size={16} color={colors.primary} />
                 <Text style={{ 
                   color: colors.text, 
                   fontSize: 12, 
                   fontWeight: '600',
                   marginLeft: spacing.xs 
                 }}>
                   {language === 'tr' ? 'Hatırlatıcı' : 'Reminder'}
                 </Text>
               </TouchableOpacity>
             }
             rightComponent={
               <TouchableOpacity
                 onPress={() => setShowAddCustomFoodModal(true)}
                 style={{
                   backgroundColor: colors.primary,
                   borderRadius: 20,
                   paddingHorizontal: spacing.sm,
                   paddingVertical: spacing.sm,
                   flexDirection: 'row',
                   alignItems: 'center',
                   minWidth: 60
                 }}
               >
                 <Ionicons name="add" size={16} color={colors.background} />
                 <Text style={{ 
                   color: colors.background, 
                   fontSize: 11, 
                   fontWeight: '600',
                   marginLeft: spacing.xs 
                 }}>
                   {language === 'tr' ? 'Özel' : 'Custom'}
                 </Text>
               </TouchableOpacity>
             }
           />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        
        {/* Gün Seçimi */}
        <View style={{ paddingVertical: spacing.md }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg }}
          >
            {daysOfWeek.map(day => (
              <TouchableOpacity
                key={day.id}
                onPress={() => setSelectedDay(day.id)}
                style={{
                  backgroundColor: selectedDay === day.id ? colors.primary : colors.card,
                  borderRadius: 20,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  marginRight: spacing.sm,
                  borderWidth: 1,
                  borderColor: selectedDay === day.id ? colors.primary : colors.border,
                  minWidth: 80,
                  alignItems: 'center'
                }}
              >
                <Text style={{ 
                  color: selectedDay === day.id ? colors.background : colors.text,
                  fontWeight: '700',
                  fontSize: 14
                }}>
                  {day.shortName}
                </Text>
                <Text style={{ 
                  color: selectedDay === day.id ? colors.background : colors.textMuted,
                  fontSize: 11,
                  marginTop: 2
                }}>
                  {getMealsForDay(day.id).length} öğün
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Öğünler */}
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}>
          {todayMeals.length === 0 ? (
            <Card style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }}>
                {t.no_meals_planned || 'Bu gün için planlanmış öğün yok'}
              </Text>
            </Card>
          ) : (
            mealTypes.map(mealType => {
              const meals = getMealsByType(todayMeals, mealType.id);
              if (meals.length === 0) return null;

              const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

              return (
                <Card key={mealType.id} style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, marginRight: spacing.sm }}>
                        {mealType.icon}
                      </Text>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                        {mealType.label}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600', marginRight: spacing.sm }}>
                        {Math.round(totalCalories)} kcal
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedMealSlot({ day: selectedDay, mealType: mealType.id });
                          navigation.navigate('AddFood', { 
                            mealType: mealType.id,
                            dayOfWeek: selectedDay,
                            fromPlan: true 
                          });
                        }}
                        style={{
                          backgroundColor: colors.primary,
                          borderRadius: 15,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs
                        }}
                      >
                        <Ionicons name="add" size={16} color={colors.background} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {meals.map(renderMeal)}
                </Card>
              );
            })
          )}

          {/* Plan Özeti */}
          {todayMeals.length > 0 && (
            <Card style={{ padding: spacing.lg }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
                📊 {t.daily_summary || 'Günlük Özet'}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.total_calories || 'Toplam Kalori'}</Text>
                  <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>
                    {Math.round(todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0))}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.protein || 'Protein'}</Text>
                  <Text style={{ color: colors.info, fontSize: 20, fontWeight: '700' }}>
                    {Math.round(todayMeals.reduce((sum, meal) => sum + (meal.protein_g || 0), 0))}g
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.carbs || 'Karb'}</Text>
                  <Text style={{ color: colors.warning, fontSize: 20, fontWeight: '700' }}>
                    {Math.round(todayMeals.reduce((sum, meal) => sum + (meal.carb_g || 0), 0))}g
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.fat || 'Yağ'}</Text>
                  <Text style={{ color: colors.error, fontSize: 20, fontWeight: '700' }}>
                    {Math.round(todayMeals.reduce((sum, meal) => sum + (meal.fat_g || 0), 0))}g
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </ScrollView>

      </SafeAreaView>

      {/* Hatırlatıcı Modalı */}
      <Modal
        visible={showReminderModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
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
                onPress={() => setShowReminderModal(false)}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {language === 'tr' ? 'İptal' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                {language === 'tr' ? 'Hatırlatıcı Ayarları' : 'Reminder Settings'}
              </Text>
              
              <TouchableOpacity
                onPress={saveReminderSettings}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm
                }}
              >
                <Text style={{ color: colors.background, fontWeight: '600' }}>
                  {language === 'tr' ? 'Kaydet' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }}>
              <View style={{ marginTop: spacing.lg }}>
                
                {/* Su İçme Hatırlatıcısı */}
                <View style={{ marginBottom: spacing.xl }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: spacing.md
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, marginRight: spacing.sm }}>💧</Text>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                        {language === 'tr' ? 'Su İçme Hatırlatıcısı' : 'Water Reminder'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setReminderSettings(prev => ({ 
                        ...prev, 
                        waterReminder: !prev.waterReminder 
                      }))}
                      style={{
                        backgroundColor: reminderSettings.waterReminder ? colors.primary : colors.card,
                        borderRadius: 20,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderWidth: 1,
                        borderColor: reminderSettings.waterReminder ? colors.primary : colors.border
                      }}
                    >
                      <Text style={{ 
                        color: reminderSettings.waterReminder ? colors.background : colors.text,
                        fontWeight: '600',
                        fontSize: 12
                      }}>
                        {reminderSettings.waterReminder ? 
                          (language === 'tr' ? 'Açık' : 'ON') : 
                          (language === 'tr' ? 'Kapalı' : 'OFF')
                        }
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {reminderSettings.waterReminder && (
                    <View style={{ marginLeft: spacing.lg }}>
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>
                        {language === 'tr' ? 'Hatırlatma Sıklığı' : 'Reminder Frequency'}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        {[1, 2, 3, 4].map(interval => (
                          <TouchableOpacity
                            key={interval}
                            onPress={() => setReminderSettings(prev => ({ 
                              ...prev, 
                              waterInterval: interval 
                            }))}
                            style={{
                              backgroundColor: reminderSettings.waterInterval === interval ? colors.primary : colors.card,
                              borderRadius: 15,
                              paddingHorizontal: spacing.md,
                              paddingVertical: spacing.sm,
                              borderWidth: 1,
                              borderColor: reminderSettings.waterInterval === interval ? colors.primary : colors.border
                            }}
                          >
                            <Text style={{ 
                              color: reminderSettings.waterInterval === interval ? colors.background : colors.text,
                              fontWeight: '600',
                              fontSize: 12
                            }}>
                              {interval}h
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* Öğün Hatırlatıcısı */}
                <View style={{ marginBottom: spacing.xl }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: spacing.md
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, marginRight: spacing.sm }}>🍽️</Text>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                        {language === 'tr' ? 'Öğün Hatırlatıcısı' : 'Meal Reminder'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setReminderSettings(prev => ({ 
                        ...prev, 
                        mealReminder: !prev.mealReminder 
                      }))}
                      style={{
                        backgroundColor: reminderSettings.mealReminder ? colors.primary : colors.card,
                        borderRadius: 20,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderWidth: 1,
                        borderColor: reminderSettings.mealReminder ? colors.primary : colors.border
                      }}
                    >
                      <Text style={{ 
                        color: reminderSettings.mealReminder ? colors.background : colors.text,
                        fontWeight: '600',
                        fontSize: 12
                      }}>
                        {reminderSettings.mealReminder ? 
                          (language === 'tr' ? 'Açık' : 'ON') : 
                          (language === 'tr' ? 'Kapalı' : 'OFF')
                        }
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {reminderSettings.mealReminder && (
                    <View style={{ marginLeft: spacing.lg }}>
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.md }}>
                        {language === 'tr' ? 'Öğün Saatleri' : 'Meal Times'}
                      </Text>
                      
                      {/* Kahvaltı */}
                      <View style={{ marginBottom: spacing.md }}>
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                          🌅 {language === 'tr' ? 'Kahvaltı' : 'Breakfast'}
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: colors.card,
                            borderRadius: 8,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            color: colors.text,
                            fontSize: 14,
                            borderWidth: 1,
                            borderColor: colors.border,
                            width: 80
                          }}
                          value={reminderSettings.mealTimes.breakfast}
                          onChangeText={(text) => setReminderSettings(prev => ({
                            ...prev,
                            mealTimes: { ...prev.mealTimes, breakfast: text }
                          }))}
                          placeholder="08:00"
                          placeholderTextColor={colors.textMuted}
                        />
                      </View>

                      {/* Öğle Yemeği */}
                      <View style={{ marginBottom: spacing.md }}>
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                          🍽️ {language === 'tr' ? 'Öğle Yemeği' : 'Lunch'}
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: colors.card,
                            borderRadius: 8,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            color: colors.text,
                            fontSize: 14,
                            borderWidth: 1,
                            borderColor: colors.border,
                            width: 80
                          }}
                          value={reminderSettings.mealTimes.lunch}
                          onChangeText={(text) => setReminderSettings(prev => ({
                            ...prev,
                            mealTimes: { ...prev.mealTimes, lunch: text }
                          }))}
                          placeholder="13:00"
                          placeholderTextColor={colors.textMuted}
                        />
                      </View>

                      {/* Akşam Yemeği */}
                      <View style={{ marginBottom: spacing.md }}>
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                          🌙 {language === 'tr' ? 'Akşam Yemeği' : 'Dinner'}
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: colors.card,
                            borderRadius: 8,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            color: colors.text,
                            fontSize: 14,
                            borderWidth: 1,
                            borderColor: colors.border,
                            width: 80
                          }}
                          value={reminderSettings.mealTimes.dinner}
                          onChangeText={(text) => setReminderSettings(prev => ({
                            ...prev,
                            mealTimes: { ...prev.mealTimes, dinner: text }
                          }))}
                          placeholder="19:00"
                          placeholderTextColor={colors.textMuted}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Bildirim Önerileri */}
                <View style={{ 
                  backgroundColor: colors.card, 
                  borderRadius: 12, 
                  padding: spacing.lg,
                  borderWidth: 1,
                  borderColor: colors.border
                }}>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.md }}>
                    💡 {language === 'tr' ? 'Bildirim Önerileri' : 'Notification Tips'}
                  </Text>
                  
                  <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: spacing.sm }}>
                    {language === 'tr' ? 
                      '• Günde 8-10 bardak su içmeyi hedefleyin' :
                      '• Aim to drink 8-10 glasses of water daily'
                    }
                  </Text>
                  
                  <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: spacing.sm }}>
                    {language === 'tr' ? 
                      '• Düzenli öğün saatleri metabolizmanızı hızlandırır' :
                      '• Regular meal times boost your metabolism'
                    }
                  </Text>
                  
                  <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
                    {language === 'tr' ? 
                      '• Bildirimler sağlıklı alışkanlıklar oluşturmanıza yardımcı olur' :
                      '• Notifications help build healthy habits'
                    }
                  </Text>
                </View>

              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>

      {/* Özel Besin Ekleme Modalı */}
      <Modal
        visible={showAddCustomFoodModal}
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
                onPress={() => {
                  setShowAddCustomFoodModal(false);
                  setShowFoodInput(false);
                  setAddedFoods([]);
                  setCustomFood({
                    name: '',
                    name_tr: '',
                    name_en: '',
                    calories_per_100g: '',
                    protein_g_per_100g: '',
                    carb_g_per_100g: '',
                    fat_g_per_100g: '',
                    fiber_g_per_100g: '',
                    category: 'custom'
                  });
                }}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {language === 'tr' ? 'İptal' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                {language === 'tr' ? 'Besin Ekle' : 'Add Food'}
              </Text>
              
              <View style={{ width: 80 }} />
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }}>
              
              {/* Gün Seçimi - Haftalık Plan Tasarımı */}
              <View style={{ marginTop: spacing.lg }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
                  {language === 'tr' ? 'Gün Seçin' : 'Select Day'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                      <TouchableOpacity
                        key={dayIndex}
                        onPress={() => setSelectedCustomDay(dayIndex)}
                        style={{
                          backgroundColor: selectedCustomDay === dayIndex ? colors.primary : colors.card,
                          borderRadius: 16,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.md,
                          minWidth: 80,
                          alignItems: 'center',
                          borderWidth: 2,
                          borderColor: selectedCustomDay === dayIndex ? colors.primary : colors.border
                        }}
                      >
                        <Text style={{
                          color: selectedCustomDay === dayIndex ? colors.background : colors.text,
                          fontSize: 14,
                          fontWeight: '700'
                        }}>
                          {language === 'tr' ? 
                            ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][dayIndex] :
                            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]
                          }
                        </Text>
                        <Text style={{
                          color: selectedCustomDay === dayIndex ? colors.background : colors.textMuted,
                          fontSize: 12,
                          marginTop: 4
                        }}>
                          {addedFoods.filter(food => food.day === dayIndex).length} {language === 'tr' ? 'besin' : 'foods'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Öğün Tipi Seçimi */}
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
                  {language === 'tr' ? 'Öğün Tipi' : 'Meal Type'}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {mealTypes.map((meal) => (
                    <TouchableOpacity
                      key={meal.id}
                      onPress={() => {
                        setCustomFoodMealType(meal.id);
                        setShowFoodInput(true);
                      }}
                      style={{
                        backgroundColor: customFoodMealType === meal.id ? colors.primary : colors.card,
                        borderRadius: 20,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.md,
                        borderWidth: 2,
                        borderColor: customFoodMealType === meal.id ? colors.primary : colors.border,
                        minWidth: 100,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{
                        color: customFoodMealType === meal.id ? colors.background : colors.text,
                        fontSize: 14,
                        fontWeight: '600'
                      }}>
                        {meal.icon} {meal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Besin Girişi - Sadece öğün seçildikten sonra göster */}
              {showFoodInput && (
                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
                    {language === 'tr' ? 'Besin Bilgileri' : 'Food Information'}
                  </Text>
                  
                  {/* Besin Adı */}
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
                    {language === 'tr' ? 'Besin Adı' : 'Food Name'}
                  </Text>
                  <View style={{ position: 'relative' }}>
                  <TextInput
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.md,
                      color: colors.text,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                    placeholder={language === 'tr' ? 'Örn: Bezelye veya Ev Yapımı Pasta' : 'E.g: Peas or Homemade Cake'}
                    placeholderTextColor={colors.textMuted}
                    value={customFood.name}
                    onChangeText={(text) => {
                      setCustomFood(prev => ({ ...prev, name: text, name_tr: text, name_en: text }));
                      searchFoodSuggestions(text);
                    }}
                    onFocus={() => {
                      if (foodSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Biraz gecikme ile kapat (kullanıcı öneriye tıklayabilsin)
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                  
                  {/* Besin Önerileri */}
                  {showSuggestions && foodSuggestions.length > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: 50,
                      left: 0,
                      right: 0,
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      maxHeight: 200,
                      zIndex: 1000,
                      elevation: 5,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                    }}>
                      <ScrollView style={{ maxHeight: 200 }}>
                        {foodSuggestions.map((food, index) => (
                          <TouchableOpacity
                            key={food.id}
                            onPress={() => selectFoodSuggestion(food)}
                            style={{
                              paddingHorizontal: spacing.md,
                              paddingVertical: spacing.sm,
                              borderBottomWidth: index < foodSuggestions.length - 1 ? 1 : 0,
                              borderBottomColor: colors.border,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={{ 
                                color: colors.text, 
                                fontSize: 14, 
                                fontWeight: '600' 
                              }}>
                                {language === 'tr' ? (food.name_tr || food.name) : (food.name_en || food.name)}
                              </Text>
                              <Text style={{ 
                                color: colors.textMuted, 
                                fontSize: 12,
                                marginTop: 2
                              }}>
                                🔥 {food.calories_per_100g} kcal • 🥩 {food.protein_g_per_100g}g • 🍞 {food.carb_g_per_100g}g • 🧈 {food.fat_g_per_100g}g
                              </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Kalori */}
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm }}>
                  {language === 'tr' ? 'Kalori (100g başına)' : 'Calories (per 100g)'}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  placeholder="300"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={customFood.calories_per_100g}
                  onChangeText={(text) => setCustomFood(prev => ({ ...prev, calories_per_100g: text }))}
                />

                {/* Protein */}
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm }}>
                  {language === 'tr' ? 'Protein (100g başına)' : 'Protein (per 100g)'}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  placeholder="10"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={customFood.protein_g_per_100g}
                  onChangeText={(text) => setCustomFood(prev => ({ ...prev, protein_g_per_100g: text }))}
                />

                {/* Karbonhidrat */}
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm }}>
                  {language === 'tr' ? 'Karbonhidrat (100g başına)' : 'Carbs (per 100g)'}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  placeholder="50"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={customFood.carb_g_per_100g}
                  onChangeText={(text) => setCustomFood(prev => ({ ...prev, carb_g_per_100g: text }))}
                />

                {/* Yağ */}
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm }}>
                  {language === 'tr' ? 'Yağ (100g başına)' : 'Fat (per 100g)'}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  placeholder="15"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={customFood.fat_g_per_100g}
                  onChangeText={(text) => setCustomFood(prev => ({ ...prev, fat_g_per_100g: text }))}
                />

                {/* Lif */}
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm }}>
                  {language === 'tr' ? 'Lif (100g başına)' : 'Fiber (per 100g)'}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  placeholder="5"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={customFood.fiber_g_per_100g}
                  onChangeText={(text) => setCustomFood(prev => ({ ...prev, fiber_g_per_100g: text }))}
                />

                  {/* Besin Ekle Butonu */}
                  <TouchableOpacity
                    onPress={addCustomFood}
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 12,
                      padding: spacing.md,
                      alignItems: 'center',
                      marginTop: spacing.lg,
                      marginBottom: spacing.lg
                    }}
                  >
                    <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600' }}>
                      {language === 'tr' ? 'Besin Ekle' : 'Add Food'}
                    </Text>
                  </TouchableOpacity>

                  {/* Eklenen Besinler */}
                  {addedFoods.length > 0 && (
                    <View style={{ marginBottom: spacing.lg }}>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
                        {language === 'tr' ? 'Eklenen Besinler' : 'Added Foods'}
                      </Text>
                      {addedFoods.map((food, index) => (
                        <View key={index} style={{
                          backgroundColor: colors.card,
                          borderRadius: 12,
                          padding: spacing.md,
                          marginBottom: spacing.sm,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <View>
                            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                              {food.name}
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                              {food.calories} kcal • {food.portion}g
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setAddedFoods(prev => prev.filter((_, i) => i !== index));
                            }}
                            style={{
                              backgroundColor: colors.error,
                              borderRadius: 20,
                              paddingHorizontal: spacing.sm,
                              paddingVertical: spacing.xs
                            }}
                          >
                            <Text style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                              {language === 'tr' ? 'Sil' : 'Remove'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Tüm Besinleri Kaydet Butonu */}
                  {addedFoods.length > 0 && (
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          // Meal plan'ı oluştur veya bul
                          const mealPlanId = await getOrCreateMealPlan();
                          
                          // Tüm besinleri veritabanına kaydet
                          for (const food of addedFoods) {
                            // Önce besin var mı kontrol et
                            const { data: existingFood, error: checkError } = await supabase
                              .from('foods')
                              .select('id')
                              .eq('name', food.name)
                              .single();

                            let foodId;
                            if (existingFood) {
                              foodId = existingFood.id;
                            } else {
                              // Yeni besin oluştur
                              const { data: newFood, error: foodError } = await supabase
                                .from('foods')
                                .insert([{
                                  name: food.name,
                                  name_tr: food.name,
                                  name_en: food.name,
                                  calories_per_100g: food.calories,
                                  protein_g_per_100g: food.protein,
                                  carb_g_per_100g: food.carbs,
                                  fat_g_per_100g: food.fat,
                                  fiber_g_per_100g: food.fiber,
                                  category: 'custom',
                                  is_active: true
                                }])
                                .select()
                                .single();

                              if (foodError) throw foodError;
                              foodId = newFood.id;
                            }

                            // Öğünü plana ekle
                            const { error: mealError } = await supabase
                              .from('planned_meals')
                              .insert([{
                                meal_plan_id: mealPlanId,
                                food_id: foodId,
                                food_name: food.name,
                                meal_type: food.mealType,
                                day_of_week: food.day,
                                portion_size_g: food.portion,
                                calories: food.calories,
                                protein_g: food.protein,
                                carb_g: food.carbs,
                                fat_g: food.fat,
                                fiber_g: food.fiber
                              }]);

                            if (mealError) throw mealError;
                          }

                          Alert.alert(
                            language === 'tr' ? 'Başarılı' : 'Success',
                            language === 'tr' ? `${addedFoods.length} besin başarıyla kaydedildi!` : `${addedFoods.length} foods saved successfully!`
                          );

                          // Modal'ı kapat ve state'leri temizle
                          setShowAddCustomFoodModal(false);
                          setShowFoodInput(false);
                          setAddedFoods([]);
                          setCustomFood({
                            name: '',
                            name_tr: '',
                            name_en: '',
                            calories_per_100g: '',
                            protein_g_per_100g: '',
                            carb_g_per_100g: '',
                            fat_g_per_100g: '',
                            fiber_g_per_100g: '',
                            category: 'custom'
                          });

                          // Planı yeniden yükle
                          loadMealPlan();

                        } catch (error) {
                          console.error('🔴 Besinleri kaydetme hatası:', error);
                          Alert.alert(
                            language === 'tr' ? 'Hata' : 'Error',
                            language === 'tr' ? 'Besinleri kaydederken hata oluştu' : 'Error saving foods'
                          );
                        }
                      }}
                      style={{
                        backgroundColor: colors.success,
                        borderRadius: 12,
                        padding: spacing.md,
                        alignItems: 'center',
                        marginBottom: spacing.lg
                      }}
                    >
                      <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600' }}>
                        {language === 'tr' ? `${addedFoods.length} Besini Kaydet` : `Save ${addedFoods.length} Foods`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>

    </LinearGradient>
  );
}

