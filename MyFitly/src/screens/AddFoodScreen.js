import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
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
    { id: 'beverage', icon: '☕', label: language === 'tr' ? 'İçecekler' : 'Beverages' },
    { id: 'snack', icon: '🍿', label: language === 'tr' ? 'Atıştırmalık' : 'Snacks' },
    { id: 'dessert', icon: '🍰', label: language === 'tr' ? 'Tatlılar' : 'Desserts' }
  ];

  useEffect(() => {
    searchFoods();
  }, []);

  // Dil değiştiğinde besin listesini yeniden yükle
  useEffect(() => {
    setSelectedCategory('all');
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

      Alert.alert(
        '✅ Başarılı',
        `${language === 'tr' ? (food.name_tr || food.name) : (food.name_en || food.name)} eklendi!`
      );
      
      // Geri dön - DietScreen otomatik olarak yenilenecek
      navigation.goBack();
    } catch (error) {
      console.error('🔴 Besin ekleme hatası:', error);
      Alert.alert('❌ Hata', 'Besin eklenirken hata oluştu');
    }
  };

  const renderFoodItem = ({ item }) => {
    const foodName = language === 'tr' ? (item.name_tr || item.name) : (item.name_en || item.name);
    
    return (
      <TouchableOpacity
        onPress={() => addFoodToLog(item)}
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: colors.text, 
              fontSize: 16, 
              fontWeight: '600',
              marginBottom: 4
            }}>
              {foodName}
            </Text>
            <Text style={{ 
              color: colors.textMuted, 
              fontSize: 12 
            }}>
              {item.calories_per_100g} kcal/100g • {item.protein_g_per_100g}g protein
            </Text>
          </View>
          <Ionicons name="add-circle" size={24} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <Header
        title={language === 'tr' ? 'Besin Ekle' : 'Add Food'}
        subtitle={language === 'tr' ? 'Besin arayın ve ekleyin' : 'Search and add food'}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
          
          {/* Öğün Türü Seçimi */}
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={{ 
              color: colors.text, 
              fontSize: 16, 
              fontWeight: '600',
              marginBottom: spacing.md 
            }}>
              {language === 'tr' ? 'Öğün Türü:' : 'Meal Type:'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {mealTypes.map((meal) => (
                  <TouchableOpacity
                    key={meal.id}
                    onPress={() => setSelectedMealType(meal.id)}
                    style={{
                      backgroundColor: selectedMealType === meal.id ? colors.primary : colors.card,
                      borderRadius: 12,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderWidth: 1,
                      borderColor: selectedMealType === meal.id ? colors.primary : colors.border,
                      alignItems: 'center',
                      minWidth: 80
                    }}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>{meal.icon}</Text>
                    <Text style={{ 
                      color: selectedMealType === meal.id ? colors.background : colors.text,
                      fontSize: 12,
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      {meal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Card>

          {/* Kategori Seçimi */}
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={{ 
              color: colors.text, 
              fontSize: 16, 
              fontWeight: '600',
              marginBottom: spacing.md 
            }}>
              {language === 'tr' ? 'Kategori:' : 'Category:'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    style={{
                      backgroundColor: selectedCategory === category.id ? colors.primary : colors.card,
                      borderRadius: 12,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderWidth: 1,
                      borderColor: selectedCategory === category.id ? colors.primary : colors.border,
                      alignItems: 'center',
                      minWidth: 80
                    }}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>{category.icon}</Text>
                    <Text style={{ 
                      color: selectedCategory === category.id ? colors.background : colors.text,
                      fontSize: 12,
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Card>

          {/* Arama Çubuğu */}
          <Card style={{ marginBottom: spacing.lg }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing.md
            }}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={language === 'tr' ? 'Besin ara...' : 'Search food...'}
                placeholderTextColor={colors.textMuted}
                style={{
                  flex: 1,
                  color: colors.text,
                  fontSize: 16,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </Card>

          {/* Besin Listesi */}
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 16, 
                fontWeight: '600' 
              }}>
                {language === 'tr' ? 'Besinler:' : 'Foods:'}
              </Text>
              {loading && <ActivityIndicator size="small" color={colors.primary} />}
            </View>

            {foods.length === 0 && !loading ? (
              <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
                <Ionicons name="restaurant-outline" size={48} color={colors.textMuted} />
                <Text style={{ 
                  color: colors.textMuted, 
                  fontSize: 16, 
                  marginTop: spacing.md,
                  textAlign: 'center'
                }}>
                  {language === 'tr' ? 'Besin bulunamadı' : 'No food found'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={foods}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </Card>
          
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}