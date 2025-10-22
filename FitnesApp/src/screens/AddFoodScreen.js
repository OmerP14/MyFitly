// src/screens/AddFoodScreen.js
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Card from '../components/Card';
import Header from '../components/Header';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';
import { supabase } from '../config/supabase';

export default function AddFoodScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { userData } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(route?.params?.mealType || 'breakfast');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Bildirim state'leri
  const [waterReminder, setWaterReminder] = useState(true);
  const [mealReminder, setMealReminder] = useState(true);
  const [exerciseReminder, setExerciseReminder] = useState(false);
  const [sleepReminder, setSleepReminder] = useState(true);
  const [vitaminReminder, setVitaminReminder] = useState(false);
  
  // Bildirim test ve ayar state'leri
  const [waterInterval, setWaterInterval] = useState(2);
  const [exerciseSchedule, setExerciseSchedule] = useState({
    monday: true,
    tuesday: false,
    wednesday: true,
    thursday: false,
    friday: true,
    saturday: false,
    sunday: false
  });

  // Time picker state'leri
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeType, setSelectedTimeType] = useState(null); // 'breakfast', 'lunch', 'dinner', 'exercise', 'sleep', 'vitamin'
  const [breakfastTime, setBreakfastTime] = useState(new Date(2024, 0, 1, 8, 0)); // 08:00
  const [lunchTime, setLunchTime] = useState(new Date(2024, 0, 1, 13, 0)); // 13:00
  const [dinnerTime, setDinnerTime] = useState(new Date(2024, 0, 1, 19, 0)); // 19:00
  const [exerciseTime, setExerciseTime] = useState(new Date(2024, 0, 1, 18, 0)); // 18:00
  const [sleepTime, setSleepTime] = useState(new Date(2024, 0, 1, 23, 0)); // 23:00
  const [vitaminTime, setVitaminTime] = useState(new Date(2024, 0, 1, 9, 0)); // 09:00

  const mealTypes = [
    { id: 'breakfast', icon: '🌅', label: t.breakfast || 'Kahvaltı' },
    { id: 'morning_snack', icon: '☕', label: t.morning_snack || 'Kuşluk' },
    { id: 'lunch', icon: '🍽️', label: t.lunch || 'Öğle' },
    { id: 'afternoon_snack', icon: '🍎', label: t.afternoon_snack || 'İkindi' },
    { id: 'dinner', icon: '🌙', label: t.dinner || 'Akşam' },
    { id: 'evening_snack', icon: '🌃', label: t.evening_snack || 'Gece' }
  ];

  const categories = [
    { id: 'all', icon: '🍽️', label: language === 'tr' ? 'Tümü' : 'All' },
    { id: 'fruit', icon: '🍎', label: language === 'tr' ? 'Meyveler' : 'Fruits' },
    { id: 'vegetable', icon: '🥕', label: language === 'tr' ? 'Sebzeler' : 'Vegetables' },
    { id: 'protein', icon: '🥩', label: language === 'tr' ? 'Protein' : 'Protein' },
    { id: 'dairy', icon: '🥛', label: language === 'tr' ? 'Süt Ürünleri' : 'Dairy' },
    { id: 'grain', icon: '🌾', label: language === 'tr' ? 'Tahıllar' : 'Grains' },
    { id: 'fast_food', icon: '🍔', label: language === 'tr' ? 'Fast Food' : 'Fast Food' },
    { id: 'alcohol', icon: '🍺', label: language === 'tr' ? 'Alkol' : 'Alcohol' },
    { id: 'beverage', icon: '☕', label: language === 'tr' ? 'İçecekler' : 'Beverages' },
    { id: 'snack', icon: '🍿', label: language === 'tr' ? 'Atıştırmalık' : 'Snacks' },
    { id: 'dessert', icon: '🍰', label: language === 'tr' ? 'Tatlılar' : 'Desserts' },
    { id: 'seasoning', icon: '🧂', label: language === 'tr' ? 'Baharatlar' : 'Seasonings' }
  ];

  useEffect(() => {
    searchFoods();
  }, []);

  // Time picker fonksiyonları
  const openTimePicker = (timeType) => {
    setSelectedTimeType(timeType);
    setShowTimePicker(true);
  };

  const onTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      switch (selectedTimeType) {
        case 'breakfast':
          setBreakfastTime(selectedTime);
          break;
        case 'lunch':
          setLunchTime(selectedTime);
          break;
        case 'dinner':
          setDinnerTime(selectedTime);
          break;
        case 'exercise':
          setExerciseTime(selectedTime);
          break;
        case 'sleep':
          setSleepTime(selectedTime);
          break;
        case 'vitamin':
          setVitaminTime(selectedTime);
          break;
      }
    }
    setShowTimePicker(false);
    setSelectedTimeType(null);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Bildirim fonksiyonları
  const testNotifications = () => {
    Alert.alert(
      language === 'tr' ? 'Bildirim Testi' : 'Notification Test',
      language === 'tr' ? 
        'Test bildirimi gönderildi! Bildirimlerinizin açık olduğundan emin olun.' : 
        'Test notification sent! Make sure your notifications are enabled.',
      [{ text: language === 'tr' ? 'Tamam' : 'OK' }]
    );
  };

  // Bugün egzersiz var mı kontrol et
  const hasExerciseToday = () => {
    const today = new Date().getDay(); // 0=Pazar, 1=Pazartesi, ...
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return exerciseSchedule[dayNames[today]];
  };

  // Egzersiz hatırlatıcısını güncelle
  const updateExerciseReminder = () => {
    const todayHasExercise = hasExerciseToday();
    if (todayHasExercise) {
      Alert.alert(
        language === 'tr' ? 'Egzersiz Hatırlatması' : 'Exercise Reminder',
        language === 'tr' ? 
          'Bugün egzersiz gününüz! 🏃‍♂️' : 
          'Today is your exercise day! 🏃‍♂️',
        [{ text: language === 'tr' ? 'Tamam' : 'OK' }]
      );
    } else {
      Alert.alert(
        language === 'tr' ? 'Egzersiz Günü Değil' : 'Not Exercise Day',
        language === 'tr' ? 
          'Bugün egzersiz gününüz değil. Dinlenme gününüz! 😴' : 
          'Today is not your exercise day. It\'s your rest day! 😴',
        [{ text: language === 'tr' ? 'Tamam' : 'OK' }]
      );
    }
  };



  // Dil değiştiğinde besin listesini yeniden yükle
  useEffect(() => {
    setSelectedCategory('all'); // Kategoriyi sıfırla
    searchFoods();
  }, [language]);

  // Arama sorgusu değiştiğinde otomatik arama yap
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2 || searchQuery.trim().length === 0) {
        searchFoods();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  const searchFoods = async () => {
    setLoading(true);
    try {
      // Dil bazlı sıralama ve arama
      const nameField = language === 'tr' ? 'name_tr' : 'name_en';
      
      let query = supabase
        .from('foods')
        .select('*')
        .eq('is_active', true)
        .order(nameField, { ascending: true })
        .limit(50);

      // Kategori filtresi
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        // Dil bazlı arama
        if (language === 'tr') {
          // Türkçe karakterleri normalize et
          const normalizedQuery = searchQuery.toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
          
          query = query.or(`name_tr.ilike.%${searchQuery}%,name_tr.ilike.%${normalizedQuery}%`);
        } else {
          // İngilizce arama
          query = query.or(`name_en.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      console.error('🔴 Besin arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFoodToLog = async (food, portionSize = 100) => {
    try {
      const calories = Math.round((food.calories_per_100g * portionSize) / 100);
      const protein = Math.round((food.protein_g_per_100g * portionSize) / 100);
      const carbs = Math.round((food.carb_g_per_100g * portionSize) / 100);
      const fat = Math.round((food.fat_g_per_100g * portionSize) / 100);
      const fiber = Math.round((food.fiber_g_per_100g * portionSize) / 100);

      const { error } = await supabase
        .from('food_logs')
        .insert({
          user_id: userData.id,
          log_date: new Date().toISOString().split('T')[0],
          meal_type: selectedMealType,
          log_time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          food_id: food.id,
          food_name: language === 'tr' ? (food.name_tr || food.name) : (food.name_en || food.name),
          portion_size_g: portionSize,
          calories,
          protein_g: protein,
          carb_g: carbs,
          fat_g: fat,
          fiber_g: fiber
        });

      if (error) throw error;

      alert(`✅ ${language === 'tr' ? (food.name_tr || food.name) : (food.name_en || food.name)} eklendi!`);
      
      // Geri dön - DietScreen otomatik olarak yenilenecek
      navigation.goBack();
    } catch (error) {
      console.error('🔴 Besin ekleme hatası:', error);
      alert('❌ Besin eklenirken hata oluştu');
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
           <Header
             title={language === 'tr' ? 'Hatırlatıcılar' : 'Reminders'}
             subtitle={language === 'tr' ? 'Su ve öğün hatırlatıcılarını yönetin' : 'Manage water and meal reminders'}
             showBackButton
             onBackPress={() => navigation.goBack()}
           />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        
        {/* Bildirim Merkezi İçeriği */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
          
          
          {/* Su Hatırlatıcısı */}
          <Card style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>💧</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', flex: 1 }}>
                {language === 'tr' ? 'Su Hatırlatıcısı' : 'Water Reminder'}
              </Text>
              <TouchableOpacity
                onPress={() => setWaterReminder(!waterReminder)}
                style={{
                  backgroundColor: waterReminder ? colors.primary : colors.card,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderWidth: 1,
                  borderColor: waterReminder ? colors.primary : colors.border
                }}
              >
                <Text style={{ 
                  color: waterReminder ? colors.background : colors.text, 
                  fontWeight: '600', 
                  fontSize: 12 
                }}>
                  {waterReminder ? (language === 'tr' ? 'Açık' : 'ON') : (language === 'tr' ? 'Kapalı' : 'OFF')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.md }}>
              {language === 'tr' ? 
                'Her 2 saatte bir su içmeyi hatırlatır' : 
                'Reminds you to drink water every 2 hours'
              }
            </Text>
            <View style={{ marginTop: spacing.sm }}>
              <Text style={{ color: colors.text, fontSize: 14, marginBottom: spacing.sm }}>
                {language === 'tr' ? 'Hatırlatma Sıklığı:' : 'Reminder Frequency:'}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {[1, 2, 3, 4].map(interval => (
                  <TouchableOpacity
                    key={interval}
                    style={{
                      backgroundColor: interval === 2 ? colors.primary : colors.card,
                      borderRadius: 15,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderWidth: 1,
                      borderColor: interval === 2 ? colors.primary : colors.border
                    }}
                  >
                    <Text style={{
                      color: interval === 2 ? colors.background : colors.text,
                      fontWeight: '600',
                      fontSize: 12
                    }}>
                      {interval}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          {/* Öğün Hatırlatıcısı */}
          <Card style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>🍽️</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', flex: 1 }}>
                {language === 'tr' ? 'Öğün Hatırlatıcısı' : 'Meal Reminder'}
              </Text>
              <TouchableOpacity
                onPress={() => setMealReminder(!mealReminder)}
                style={{
                  backgroundColor: mealReminder ? colors.primary : colors.card,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderWidth: 1,
                  borderColor: mealReminder ? colors.primary : colors.border
                }}
              >
                <Text style={{ 
                  color: mealReminder ? colors.background : colors.text, 
                  fontWeight: '600', 
                  fontSize: 12 
                }}>
                  {mealReminder ? (language === 'tr' ? 'Açık' : 'ON') : (language === 'tr' ? 'Kapalı' : 'OFF')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.md }}>
              {language === 'tr' ? 
                'Öğün saatlerinde yemek yemeyi hatırlatır' : 
                'Reminds you to eat at meal times'
              }
            </Text>
            
            {/* Öğün Saatleri */}
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: spacing.sm }}>🌅</Text>
                  <Text style={{ color: colors.text, fontSize: 14 }}>
                    {language === 'tr' ? 'Kahvaltı:' : 'Breakfast:'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => openTimePicker('breakfast')}
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 8
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                    {formatTime(breakfastTime)}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: spacing.sm }}>🍽️</Text>
                  <Text style={{ color: colors.text, fontSize: 14 }}>
                    {language === 'tr' ? 'Öğle:' : 'Lunch:'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => openTimePicker('lunch')}
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 8
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                    {formatTime(lunchTime)}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: spacing.sm }}>🌙</Text>
                  <Text style={{ color: colors.text, fontSize: 14 }}>
                    {language === 'tr' ? 'Akşam:' : 'Dinner:'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => openTimePicker('dinner')}
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 8
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                    {formatTime(dinnerTime)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>


          {/* Egzersiz Hatırlatıcısı */}
          <Card style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>💪</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', flex: 1 }}>
                {language === 'tr' ? 'Egzersiz Hatırlatıcısı' : 'Exercise Reminder'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setExerciseReminder(!exerciseReminder);
                  if (!exerciseReminder) {
                    updateExerciseReminder();
                  }
                }}
                style={{
                  backgroundColor: exerciseReminder ? colors.primary : colors.card,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderWidth: 1,
                  borderColor: exerciseReminder ? colors.primary : colors.border
                }}
              >
                <Text style={{ 
                  color: exerciseReminder ? colors.background : colors.text, 
                  fontWeight: '600', 
                  fontSize: 12 
                }}>
                  {exerciseReminder ? (language === 'tr' ? 'Açık' : 'ON') : (language === 'tr' ? 'Kapalı' : 'OFF')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.md }}>
              {language === 'tr' ? 
                (hasExerciseToday() ? 'Bugün egzersiz gününüz! 🏃‍♂️' : 'Bugün dinlenme gününüz 😴') : 
                (hasExerciseToday() ? 'Today is your exercise day! 🏃‍♂️' : 'Today is your rest day 😴')
              }
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {language === 'tr' ? 'Hatırlatma Saati:' : 'Reminder Time:'}
              </Text>
              <TouchableOpacity
                onPress={() => openTimePicker('exercise')}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 8
                }}
              >
                <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                  {formatTime(exerciseTime)}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {language === 'tr' ? 'Egzersiz Günleri:' : 'Exercise Days:'}
              </Text>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                {language === 'tr' ? 'Pzt, Çar, Cum' : 'Mon, Wed, Fri'}
              </Text>
            </View>
          </Card>

          {/* Uyku Hatırlatıcısı */}
          <Card style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>😴</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', flex: 1 }}>
                {language === 'tr' ? 'Uyku Hatırlatıcısı' : 'Sleep Reminder'}
              </Text>
              <TouchableOpacity
                onPress={() => setSleepReminder(!sleepReminder)}
                style={{
                  backgroundColor: sleepReminder ? colors.primary : colors.card,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderWidth: 1,
                  borderColor: sleepReminder ? colors.primary : colors.border
                }}
              >
                <Text style={{ 
                  color: sleepReminder ? colors.background : colors.text, 
                  fontWeight: '600', 
                  fontSize: 12 
                }}>
                  {sleepReminder ? (language === 'tr' ? 'Açık' : 'ON') : (language === 'tr' ? 'Kapalı' : 'OFF')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.md }}>
              {language === 'tr' ? 
                'Yatmadan önce uyku saatini hatırlatır' : 
                'Reminds you to sleep before bedtime'
              }
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {language === 'tr' ? 'Yatma Saati:' : 'Bedtime:'}
              </Text>
              <TouchableOpacity
                onPress={() => openTimePicker('sleep')}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 8
                }}
              >
                <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                  {formatTime(sleepTime)}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Vitamin Hatırlatıcısı */}
          <Card style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>💊</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', flex: 1 }}>
                {language === 'tr' ? 'Vitamin Hatırlatıcısı' : 'Vitamin Reminder'}
              </Text>
              <TouchableOpacity
                onPress={() => setVitaminReminder(!vitaminReminder)}
                style={{
                  backgroundColor: vitaminReminder ? colors.primary : colors.card,
                  borderRadius: 20,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderWidth: 1,
                  borderColor: vitaminReminder ? colors.primary : colors.border
                }}
              >
                <Text style={{ 
                  color: vitaminReminder ? colors.background : colors.text, 
                  fontWeight: '600', 
                  fontSize: 12 
                }}>
                  {vitaminReminder ? (language === 'tr' ? 'Açık' : 'ON') : (language === 'tr' ? 'Kapalı' : 'OFF')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.md }}>
              {language === 'tr' ? 
                'Vitamin almayı hatırlatır' : 
                'Reminds you to take vitamins'
              }
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {language === 'tr' ? 'Hatırlatma Saati:' : 'Reminder Time:'}
              </Text>
              <TouchableOpacity
                onPress={() => openTimePicker('vitamin')}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 8
                }}
              >
                <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                  {formatTime(vitaminTime)}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Bildirim Ayarları */}
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>⚙️</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>
                {language === 'tr' ? 'Bildirim Ayarları' : 'Notification Settings'}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={testNotifications}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: spacing.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>
                {language === 'tr' ? 'Bildirimleri Test Et' : 'Test Notifications'}
              </Text>
            </TouchableOpacity>
          </Card>
          
        </ScrollView>

        {/* Time Picker Modal */}
        {showTimePicker && (
          <Modal
            transparent={true}
            visible={showTimePicker}
            animationType="slide"
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 20,
                padding: spacing.xl,
                margin: spacing.lg,
                alignItems: 'center',
                minWidth: 300
              }}>
                <Text style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: '600',
                  marginBottom: spacing.lg
                }}>
                  {language === 'tr' ? 'Saat Seçin' : 'Select Time'}
                </Text>
                
                <DateTimePicker
                  value={
                    selectedTimeType === 'breakfast' ? breakfastTime :
                    selectedTimeType === 'lunch' ? lunchTime :
                    selectedTimeType === 'dinner' ? dinnerTime :
                    selectedTimeType === 'exercise' ? exerciseTime :
                    selectedTimeType === 'sleep' ? sleepTime :
                    vitaminTime
                  }
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onChange={onTimeChange}
                  style={{ height: 200 }}
                />
                
                <TouchableOpacity
                  onPress={() => {
                    setShowTimePicker(false);
                    setSelectedTimeType(null);
                  }}
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.md,
                    borderRadius: 12,
                    marginTop: spacing.lg
                  }}
                >
                  <Text style={{
                    color: colors.background,
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    {language === 'tr' ? 'Tamam' : 'OK'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

      </SafeAreaView>
    </LinearGradient>
  );
}

