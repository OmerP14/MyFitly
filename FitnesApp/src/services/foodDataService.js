// src/services/foodDataService.js
import { supabase } from '../config/supabase';

// İngilizce besin verileri
const englishFoods = [
  // Fruits
  ['Tomatoes, grape, raw', 'Domates, Üzüm, Çiğ', 'Tomatoes, grape, raw', 27.0, 0.8, 5.5, 0.6, 2.1, 'fruit'],
  ['Peaches, yellow, raw', 'Şeftali, Sarı, Çiğ', 'Peaches, yellow, raw', 42.0, 0.9, 10.1, 0.3, 1.5, 'fruit'],
  ['Kiwifruit, green, raw', 'Kivi, Yeşil, Çiğ', 'Kiwifruit, green, raw', 58.0, 1.1, 14.0, 0.4, 3.0, 'fruit'],
  ['Melons, cantaloupe, raw', 'Kavun, Cantaloupe, Çiğ', 'Melons, cantaloupe, raw', 34.0, 0.8, 8.2, 0.2, 0.8, 'fruit'],
  ['Nectarines, raw', 'Nektarin, Çiğ', 'Nectarines, raw', 39.0, 1.1, 9.2, 0.3, 1.5, 'fruit'],
  ['Oranges, raw, navels', 'Portakal, Çiğ, Navel', 'Oranges, raw, navels', 47.0, 0.9, 11.8, 0.1, 2.0, 'fruit'],
  ['Strawberries, raw', 'Çilek, Çiğ', 'Strawberries, raw', 31.0, 0.6, 7.6, 0.2, 1.8, 'fruit'],
  ['Apples, red, raw', 'Elma, Kırmızı, Çiğ', 'Apples, red, raw', 52.0, 0.3, 14.0, 0.2, 2.4, 'fruit'],
  ['Bananas, raw', 'Muz, Çiğ', 'Bananas, raw', 89.0, 1.1, 23.0, 0.3, 2.6, 'fruit'],
  ['Grapes, red or green, raw', 'Üzüm, Kırmızı veya Yeşil, Çiğ', 'Grapes, red or green, raw', 62.0, 0.6, 16.0, 0.2, 1.0, 'fruit'],
  
  // Vegetables
  ['Broccoli, raw', 'Brokoli, Çiğ', 'Broccoli, raw', 32.0, 2.6, 6.3, 0.3, 2.4, 'vegetable'],
  ['Kale, raw', 'Kara Lahana, Çiğ', 'Kale, raw', 35.0, 2.9, 4.4, 1.5, 4.1, 'vegetable'],
  ['Carrots, raw', 'Havuç, Çiğ', 'Carrots, raw', 41.0, 0.9, 9.6, 0.2, 2.8, 'vegetable'],
  ['Potatoes, raw', 'Patates, Çiğ', 'Potatoes, raw', 77.0, 2.0, 17.0, 0.1, 2.2, 'vegetable'],
  ['Cucumber, raw', 'Salatalık, Çiğ', 'Cucumber, raw', 16.0, 0.7, 4.0, 0.1, 0.5, 'vegetable'],
  ['Spinach, raw', 'Ispanak, Çiğ', 'Spinach, raw', 23.0, 2.9, 3.6, 0.4, 2.2, 'vegetable'],
  
  // Meat Types
  ['Beef Steak, raw', 'Biftek, Sığır, Çiğ', 'Beef Steak, raw', 250.0, 26.0, 0.0, 15.0, 0.0, 'protein'],
  ['Lamb Chops, raw', 'Pirzola, Kuzu, Çiğ', 'Lamb Chops, raw', 280.0, 25.0, 0.0, 18.0, 0.0, 'protein'],
  ['Chicken Breast, raw', 'Tavuk, Göğüs, Çiğ', 'Chicken Breast, raw', 165.0, 31.0, 0.0, 3.6, 0.0, 'protein'],
  ['Salmon, raw', 'Somon, Çiğ', 'Salmon, raw', 208.0, 22.0, 0.0, 12.0, 0.0, 'protein'],
  ['Tuna, raw', 'Ton Balığı, Çiğ', 'Tuna, raw', 109.0, 24.0, 0.0, 1.0, 0.0, 'protein'],
  
  // Dairy Products
  ['Whole Milk', 'Süt, Tam Yağlı', 'Whole Milk', 61.0, 3.2, 4.7, 3.3, 0.0, 'dairy'],
  ['White Cheese', 'Peynir, Beyaz', 'White Cheese', 264.0, 17.0, 4.0, 20.0, 0.0, 'dairy'],
  ['Plain Yogurt', 'Yoğurt, Sade', 'Plain Yogurt', 61.0, 3.5, 4.7, 3.3, 0.0, 'dairy'],
  ['Whole Egg', 'Yumurta, Tam', 'Whole Egg', 148.0, 12.4, 1.0, 10.0, 0.0, 'dairy'],
  
  // Grains and Breads
  ['White Bread', 'Ekmek, Beyaz', 'White Bread', 270.0, 9.4, 49.2, 3.6, 2.3, 'grain'],
  ['White Rice', 'Pirinç, Beyaz', 'White Rice', 365.0, 7.1, 80.0, 0.7, 1.3, 'grain'],
  ['Spaghetti Pasta', 'Makarna, Spaghetti', 'Spaghetti Pasta', 371.0, 13.0, 75.0, 1.5, 3.2, 'grain'],
  
  // Popular Foods
  ['Pizza, Margherita', 'Pizza, Margherita', 'Pizza, Margherita', 266.0, 11.0, 33.0, 10.0, 2.0, 'fast_food'],
  ['Hamburger, Large', 'Hamburger, Büyük', 'Hamburger, Large', 354.0, 16.0, 33.0, 17.0, 2.0, 'fast_food'],
  ['French Fries', 'Patates Kızartması', 'French Fries', 365.0, 4.0, 63.0, 11.0, 6.0, 'fast_food'],
  
  // Nuts and Seeds
  ['Almonds', 'Badem', 'Almonds', 579.0, 21.2, 21.6, 49.9, 12.5, 'protein'],
  ['Walnuts', 'Ceviz', 'Walnuts', 654.0, 15.2, 13.7, 65.2, 6.7, 'protein'],
  ['Peanuts', 'Fıstık', 'Peanuts', 567.0, 25.8, 16.1, 49.2, 8.5, 'protein'],
  
  // Beverages
  ['Black Tea', 'Çay, Siyah', 'Black Tea', 1.0, 0.0, 0.3, 0.0, 0.0, 'beverage'],
  ['Turkish Coffee', 'Kahve, Türk', 'Turkish Coffee', 2.0, 0.3, 0.0, 0.0, 0.0, 'beverage'],
  ['Wine, Red', 'Şarap, Kırmızı', 'Wine, Red', 85.0, 0.1, 2.6, 0.0, 0.0, 'beverage'],
  ['Wine, White', 'Şarap, Beyaz', 'Wine, White', 82.0, 0.1, 2.6, 0.0, 0.0, 'beverage'],
  ['Beer, Regular', 'Bira, Normal', 'Beer, Regular', 43.0, 0.5, 3.6, 0.0, 0.0, 'beverage'],
  ['Coffee, Latte', 'Kahve, Latte', 'Coffee, Latte', 43.0, 3.2, 4.2, 1.8, 0.0, 'beverage'],
  ['Energy Drink', 'Enerji İçeceği', 'Energy Drink', 46.0, 0.0, 11.0, 0.0, 0.0, 'beverage'],
  ['Cola', 'Kola', 'Cola', 42.0, 0.0, 10.6, 0.0, 0.0, 'beverage'],
  
  // Desserts
  ['Chocolate Cake', 'Çikolatalı Pasta', 'Chocolate Cake', 371.0, 4.3, 51.5, 16.4, 2.2, 'dessert'],
  ['Vanilla Ice Cream', 'Vanilyalı Dondurma', 'Vanilla Ice Cream', 207.0, 3.5, 24.0, 11.0, 0.7, 'dessert'],
  ['Chocolate Ice Cream', 'Çikolatalı Dondurma', 'Chocolate Ice Cream', 216.0, 3.8, 28.0, 11.0, 2.3, 'dessert'],
  
  // Breakfast Items
  ['Pancakes', 'Pankek', 'Pancakes', 227.0, 6.4, 28.0, 9.7, 1.2, 'grain'],
  ['Waffles', 'Waffle', 'Waffles', 291.0, 7.9, 37.0, 12.0, 2.0, 'grain'],
  ['Omelet', 'Omlet', 'Omelet', 154.0, 13.0, 1.0, 11.0, 0.0, 'protein'],
  ['Bacon', 'Pastırma', 'Bacon', 541.0, 37.0, 1.4, 42.0, 0.0, 'protein'],
  
  // Cereals
  ['Corn Flakes', 'Mısır Gevreci', 'Corn Flakes', 357.0, 7.5, 84.0, 0.9, 3.0, 'grain'],
  ['Oatmeal', 'Yulaf Ezmesi', 'Oatmeal', 389.0, 16.9, 66.3, 6.9, 10.6, 'grain'],
  
  // Snacks
  ['Potato Chips', 'Patates Cipsi', 'Potato Chips', 536.0, 7.0, 53.0, 34.0, 4.8, 'snack'],
  ['Popcorn', 'Patlamış Mısır', 'Popcorn', 387.0, 12.9, 77.8, 4.5, 14.5, 'snack'],
  
  // Condiments
  ['Ketchup', 'Ketçap', 'Ketchup', 112.0, 1.7, 27.4, 0.1, 0.3, 'seasoning'],
  ['Mayonnaise', 'Mayonez', 'Mayonnaise', 680.0, 1.0, 0.6, 75.0, 0.0, 'seasoning'],
  ['Mustard', 'Hardal', 'Mustard', 66.0, 4.0, 5.0, 3.7, 3.0, 'seasoning'],
  ['Olive Oil', 'Zeytinyağı', 'Olive Oil', 884.0, 0.0, 0.0, 100.0, 0.0, 'seasoning'],
  
  // Seafood
  ['Shrimp, raw', 'Karides, Çiğ', 'Shrimp, raw', 99.0, 24.0, 0.0, 0.3, 0.0, 'protein'],
  ['Crab, raw', 'Yengeç, Çiğ', 'Crab, raw', 97.0, 20.1, 0.0, 1.5, 0.0, 'protein'],
  ['Lobster, raw', 'Istakoz, Çiğ', 'Lobster, raw', 89.0, 18.8, 0.0, 0.9, 0.0, 'protein'],
  
  // Legumes
  ['Black Beans, cooked', 'Siyah Fasulye, Pişmiş', 'Black Beans, cooked', 132.0, 8.9, 23.7, 0.5, 8.7, 'protein'],
  ['Chickpeas, cooked', 'Nohut, Pişmiş', 'Chickpeas, cooked', 164.0, 8.9, 27.4, 2.6, 7.6, 'protein'],
  ['Lentils, cooked', 'Mercimek, Pişmiş', 'Lentils, cooked', 116.0, 9.0, 20.1, 0.4, 7.9, 'protein'],
  
  // Additional Vegetables
  ['Asparagus, raw', 'Kuşkonmaz, Çiğ', 'Asparagus, raw', 20.0, 2.2, 3.9, 0.1, 2.1, 'vegetable'],
  ['Bell Peppers, raw', 'Dolmalık Biber, Çiğ', 'Bell Peppers, raw', 31.0, 0.9, 7.3, 0.3, 2.5, 'vegetable'],
  ['Cauliflower, raw', 'Karnabahar, Çiğ', 'Cauliflower, raw', 25.0, 1.9, 5.0, 0.3, 2.0, 'vegetable'],
  ['Mushrooms, raw', 'Mantar, Çiğ', 'Mushrooms, raw', 22.0, 3.1, 3.3, 0.3, 1.0, 'vegetable'],
  
  // Additional Fruits
  ['Avocado, raw', 'Avokado, Çiğ', 'Avocado, raw', 160.0, 2.0, 8.5, 14.7, 6.7, 'fruit'],
  ['Blueberries, raw', 'Yaban Mersini, Çiğ', 'Blueberries, raw', 57.0, 0.7, 14.5, 0.3, 2.4, 'fruit'],
  ['Cherries, raw', 'Kiraz, Çiğ', 'Cherries, raw', 63.0, 1.1, 16.0, 0.2, 2.1, 'fruit'],
  ['Mango, raw', 'Mango, Çiğ', 'Mango, raw', 60.0, 0.8, 15.0, 0.4, 1.6, 'fruit'],
  ['Pineapple, raw', 'Ananas, Çiğ', 'Pineapple, raw', 50.0, 0.5, 13.1, 0.1, 1.4, 'fruit'],
  ['Watermelon, raw', 'Karpuz, Çiğ', 'Watermelon, raw', 30.0, 0.6, 7.6, 0.2, 0.4, 'fruit']
];

// Türkçe besin verileri (İngilizce verilerle aynı, sadece sıralama farklı)
const turkishFoods = englishFoods.map(food => [food[1], food[1], food[2], food[3], food[4], food[5], food[6], food[7], food[8]]);

export const loadFoodData = async (language = 'en') => {
  try {
    console.log(`🔄 ${language} besin verileri yükleniyor...`);
    
    // Mevcut verileri temizle
    const { error: deleteError } = await supabase
      .from('foods')
      .delete()
      .neq('id', 0); // Tüm verileri sil
    
    if (deleteError) {
      console.error('❌ Veri silme hatası:', deleteError);
    }
    
    // Dil bazlı verileri seç
    const foodsData = language === 'tr' ? turkishFoods : englishFoods;
    
    // Verileri ekle
    const { data, error } = await supabase
      .from('foods')
      .insert(
        foodsData.map(food => ({
          name: food[0],
          name_tr: food[1],
          name_en: food[2],
          calories_per_100g: food[3],
          protein_g_per_100g: food[4],
          carb_g_per_100g: food[5],
          fat_g_per_100g: food[6],
          fiber_g_per_100g: food[7],
          category: food[8],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      );
    
    if (error) {
      console.error('❌ Besin verileri ekleme hatası:', error);
      throw error;
    }
    
    console.log(`✅ ${foodsData.length} besin verisi yüklendi (${language})`);
    return { success: true, count: foodsData.length };
    
  } catch (error) {
    console.error('❌ Besin verileri yükleme hatası:', error);
    return { success: false, error: error.message };
  }
};

export const checkFoodDataExists = async () => {
  try {
    const { data, error } = await supabase
      .from('foods')
      .select('count')
      .eq('is_active', true);
    
    if (error) throw error;
    
    const count = data?.[0]?.count || 0;
    console.log(`📊 Veritabanında ${count} aktif besin var`);
    return count > 0;
    
  } catch (error) {
    console.error('❌ Besin verisi kontrol hatası:', error);
    return false;
  }
};






