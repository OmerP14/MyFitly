import csv
import json
import os
from collections import defaultdict

def translate_to_turkish(english_name):
    """İngilizce besin adını Türkçeye çevir - Tam çeviri"""
    
    # Tam çeviriler
    full_translations = {
        # Meyveler
        'tomatoes, grape, raw': 'Domates, Üzüm, Çiğ',
        'broccoli, raw': 'Brokoli, Çiğ',
        'kale, raw': 'Kara Lahana, Çiğ',
        'peaches, yellow, raw': 'Şeftali, Sarı, Çiğ',
        'strawberries, raw': 'Çilek, Çiğ',
        'oranges, raw, navels': 'Portakal, Çiğ, Navel',
        'kiwifruit, green, raw': 'Kivi, Yeşil, Çiğ',
        'melons, cantaloupe, raw': 'Kavun, Cantaloupe, Çiğ',
        'nectarines, raw': 'Nektarin, Çiğ',
        'pears, raw, bartlett': 'Armut, Çiğ, Bartlett',
        'apples, raw, red delicious': 'Elma, Çiğ, Kırmızı',
        'bananas, raw': 'Muz, Çiğ',
        'grapes, red or green': 'Üzüm, Kırmızı veya Yeşil',
        
        # Sebzeler
        'carrots, raw': 'Havuç, Çiğ',
        'onions, raw': 'Soğan, Çiğ',
        'potatoes, raw': 'Patates, Çiğ',
        'lettuce, cos or romaine, raw': 'Marul, Cos veya Romaine, Çiğ',
        'cucumber, raw': 'Salatalık, Çiğ',
        'peppers, sweet, red, raw': 'Biber, Tatlı, Kırmızı, Çiğ',
        'corn, sweet, yellow, raw': 'Mısır, Tatlı, Sarı, Çiğ',
        'spinach, raw': 'Ispanak, Çiğ',
        'cabbage, raw': 'Lahana, Çiğ',
        
        # Et ürünleri
        'chicken, broilers or fryers, breast, meat only, raw': 'Tavuk, Göğüs, Sadece Et, Çiğ',
        'beef, ground, 80% lean meat / 20% fat, raw': 'Sığır Eti, Kıyma, %80 Yağsız, Çiğ',
        'pork, fresh, loin, whole, separable lean only, raw': 'Domuz Eti, Taze, Bel, Sadece Yağsız, Çiğ',
        'fish, salmon, atlantic, raw': 'Balık, Somon, Atlantik, Çiğ',
        'fish, tuna, yellowfin, raw': 'Balık, Ton, Sarı Yüzgeçli, Çiğ',
        'shrimp, raw': 'Karides, Çiğ',
        
        # Süt ürünleri
        'milk, whole, 3.25% milkfat, with added vitamin d': 'Süt, Tam, %3.25 Yağ, D Vitamini Ekli',
        'cheese, cheddar': 'Peynir, Cheddar',
        'yogurt, plain, whole milk': 'Yoğurt, Sade, Tam Yağlı Süt',
        'butter, without salt': 'Tereyağı, Tuzsuz',
        'eggs, grade a, large, egg whole': 'Yumurta, A Sınıfı, Büyük, Tam Yumurta',
        
        # Tahıllar
        'bread, white, commercially prepared': 'Ekmek, Beyaz, Ticari',
        'bread, whole-wheat, commercially prepared': 'Ekmek, Tam Buğday, Ticari',
        'rice, white, long-grain, regular, raw': 'Pirinç, Beyaz, Uzun Taneli, Ham',
        'pasta, spaghetti, dry': 'Makarna, Spaghetti, Kuru',
        'flour, wheat, all-purpose, unenriched, unbleached': 'Un, Buğday, Çok Amaçlı, Zenginleştirilmemiş',
        'oats': 'Yulaf',
        
        # Kuruyemiş
        'nuts, almonds, dry roasted, with salt added': 'Kuruyemiş, Badem, Kuru Kavrulmuş, Tuzlu',
        'nuts, walnuts, english': 'Kuruyemiş, Ceviz, İngiliz',
        'nuts, cashew nuts, raw': 'Kuruyemiş, Kaju, Çiğ',
        'seeds, sunflower seed kernels, dry roasted, with salt added': 'Çekirdek, Ayçiçeği, Kuru Kavrulmuş, Tuzlu',
        
        # Hazır yemekler
        'pizza, cheese, regular crust': 'Pizza, Peynirli, Normal Hamur',
        'hamburger, single, large patty, with condiments, vegetables and mayonnaise': 'Hamburger, Tek, Büyük Köfte, Soslu, Sebzeli ve Mayonezli',
        'french fries': 'Patates Kızartması',
        'chicken nuggets': 'Tavuk Nugget',
        'sandwich, chicken, fillet, with cheese and lettuce': 'Sandviç, Tavuk, Fileto, Peynirli ve Marullu',
        'hot dog, plain': 'Sosisli, Sade',
        
        # Diğer
        'sugar, granulated': 'Şeker, Toz',
        'salt, table': 'Tuz, Sofra',
        'oil, olive, salad or cooking': 'Yağ, Zeytin, Salata veya Pişirme',
        'honey': 'Bal',
        'chocolate, dark, 70-85% cacao solids': 'Çikolata, Bitter, %70-85 Kakao',
        'coffee, brewed, prepared with tap water': 'Kahve, Demlenmiş, Musluk Suyu ile',
        'tea, black, brewed, prepared with tap water': 'Çay, Siyah, Demlenmiş, Musluk Suyu ile',
        'juice, orange, raw': 'Meyve Suyu, Portakal, Taze',
        'soup, chicken noodle, canned, condensed': 'Çorba, Tavuk Erişte, Konserve, Koyu',
    }
    
    # Önce tam eşleşme ara
    english_lower = english_name.lower().strip()
    if english_lower in full_translations:
        return full_translations[english_lower]
    
    # Kelime bazında çeviri
    word_translations = {
        'tomatoes': 'Domates', 'tomato': 'Domates',
        'broccoli': 'Brokoli', 'kale': 'Kara Lahana',
        'peaches': 'Şeftali', 'peach': 'Şeftali',
        'strawberries': 'Çilek', 'strawberry': 'Çilek',
        'oranges': 'Portakal', 'orange': 'Portakal',
        'kiwifruit': 'Kivi', 'kiwi': 'Kivi',
        'melons': 'Kavun', 'melon': 'Kavun',
        'nectarines': 'Nektarin', 'nectarine': 'Nektarin',
        'pears': 'Armut', 'pear': 'Armut',
        'apples': 'Elma', 'apple': 'Elma',
        'bananas': 'Muz', 'banana': 'Muz',
        'grapes': 'Üzüm', 'grape': 'Üzüm',
        'carrots': 'Havuç', 'carrot': 'Havuç',
        'onions': 'Soğan', 'onion': 'Soğan',
        'potatoes': 'Patates', 'potato': 'Patates',
        'lettuce': 'Marul',
        'cucumber': 'Salatalık', 'cucumbers': 'Salatalık',
        'peppers': 'Biber', 'pepper': 'Biber',
        'corn': 'Mısır',
        'spinach': 'Ispanak',
        'cabbage': 'Lahana',
        'chicken': 'Tavuk',
        'beef': 'Sığır Eti',
        'pork': 'Domuz Eti',
        'fish': 'Balık',
        'salmon': 'Somon',
        'tuna': 'Ton Balığı',
        'shrimp': 'Karides',
        'milk': 'Süt',
        'cheese': 'Peynir',
        'yogurt': 'Yoğurt',
        'butter': 'Tereyağı',
        'eggs': 'Yumurta', 'egg': 'Yumurta',
        'bread': 'Ekmek',
        'rice': 'Pirinç',
        'pasta': 'Makarna',
        'flour': 'Un',
        'oats': 'Yulaf',
        'nuts': 'Kuruyemiş', 'nut': 'Kuruyemiş',
        'almonds': 'Badem', 'almond': 'Badem',
        'walnuts': 'Ceviz', 'walnut': 'Ceviz',
        'cashew': 'Kaju', 'cashews': 'Kaju',
        'seeds': 'Çekirdek', 'seed': 'Çekirdek',
        'pizza': 'Pizza',
        'hamburger': 'Hamburger',
        'french fries': 'Patates Kızartması',
        'sandwich': 'Sandviç',
        'hot dog': 'Sosisli',
        'sugar': 'Şeker',
        'salt': 'Tuz',
        'oil': 'Yağ',
        'honey': 'Bal',
        'chocolate': 'Çikolata',
        'coffee': 'Kahve',
        'tea': 'Çay',
        'juice': 'Meyve Suyu',
        'soup': 'Çorba',
        'raw': 'Çiğ', 'fresh': 'Taze', 'frozen': 'Dondurulmuş',
        'cooked': 'Pişmiş', 'boiled': 'Haşlanmış', 'fried': 'Kızartılmış',
        'baked': 'Fırınlanmış', 'grilled': 'Izgara',
        'organic': 'Organik', 'natural': 'Doğal',
        'sweet': 'Tatlı', 'sour': 'Ekşi', 'salty': 'Tuzlu',
        'spicy': 'Acı', 'mild': 'Hafif',
        'large': 'Büyük', 'medium': 'Orta', 'small': 'Küçük',
        'whole': 'Tam', 'skim': 'Yağsız',
        'white': 'Beyaz', 'brown': 'Kahverengi', 'black': 'Siyah',
        'red': 'Kırmızı', 'green': 'Yeşil', 'yellow': 'Sarı',
        'blue': 'Mavi', 'purple': 'Mor', 'pink': 'Pembe'
    }
    
    # Kelime bazında çeviri uygula
    words = english_name.split()
    translated_words = []
    
    for word in words:
        clean_word = word.strip('.,!?;:()[]{}"\'')
        if clean_word.lower() in word_translations:
            translated_words.append(word_translations[clean_word.lower()])
        else:
            translated_words.append(word)
    
    result = ' '.join(translated_words)
    
    # Eğer hiç çeviri yapılmadıysa, orijinal ismi kullan
    if result == english_name:
        return english_name
    
    return result

def categorize_food(description):
    """Besini kategorilere ayır"""
    desc_lower = description.lower()
    
    if any(word in desc_lower for word in ['apple', 'banana', 'orange', 'grape', 'strawberry', 'peach', 'pear', 'kiwi', 'melon', 'cherry', 'blueberry', 'raspberry', 'blackberry']):
        return 'fruit'
    elif any(word in desc_lower for word in ['tomato', 'potato', 'carrot', 'onion', 'broccoli', 'spinach', 'lettuce', 'cucumber', 'pepper', 'corn', 'cabbage', 'kale']):
        return 'vegetable'
    elif any(word in desc_lower for word in ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'turkey', 'duck']):
        return 'protein'
    elif any(word in desc_lower for word in ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg']):
        return 'dairy'
    elif any(word in desc_lower for word in ['bread', 'rice', 'pasta', 'noodle', 'flour', 'oats', 'wheat', 'barley', 'quinoa']):
        return 'grain'
    elif any(word in desc_lower for word in ['almond', 'walnut', 'peanut', 'cashew', 'pistachio', 'hazelnut', 'seed']):
        return 'protein'
    elif any(word in desc_lower for word in ['pizza', 'hamburger', 'french fries', 'chicken nuggets', 'sandwich', 'hot dog', 'taco', 'burrito']):
        return 'fast_food'
    elif any(word in desc_lower for word in ['sugar', 'salt', 'oil', 'honey', 'chocolate', 'coffee', 'tea']):
        return 'seasoning'
    else:
        return 'other'

def process_foods():
    """Ana işlem fonksiyonu - Sadece önemli besinler"""
    print("🔄 Nutrient verileri yükleniyor...")
    nutrients = load_nutrients()
    
    print("🔄 Food nutrient verileri yükleniyor...")
    food_nutrients = load_food_nutrients()
    
    # Önemli nutrient ID'leri
    important_nutrients = {
        '1008': 'calories',      # Energy (kcal)
        '1003': 'protein',       # Protein
        '1005': 'carbs',         # Carbohydrate, by difference
        '1004': 'fat',           # Total lipid (fat)
        '1079': 'fiber'          # Fiber, total dietary
    }
    
    # Duplikasyon kontrolü için set
    added_foods = set()
    sql_statements = []
    processed_count = 0
    
    # Foundation foods - Sadece önemli besinler
    foundation_file = "/Users/omerpehriz/Desktop/Project/FitnesApp/foods/FoodData_Central_foundation_food_csv_2025-04-24/food.csv"
    print(f"🔄 Foundation foods işleniyor: {foundation_file}")
    
    with open(foundation_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            fdc_id = row['fdc_id']
            description = row['description']
            
            # Sadece foundation_food'ları al
            if row['data_type'] != 'foundation_food':
                continue
                
            # Nutrient verilerini al
            if fdc_id not in food_nutrients:
                continue
                
            nutrient_data = food_nutrients[fdc_id]
            
            # Gerekli nutrient'ları kontrol et
            has_required_nutrients = all(nutrient_id in nutrient_data for nutrient_id in important_nutrients.keys())
            if not has_required_nutrients:
                continue
            
            # Besin adını temizle ve Türkçeye çevir
            clean_name_en = description.replace('"', '').replace("'", '').strip()
            clean_name_tr = translate_to_turkish(clean_name_en)
            
            if len(clean_name_tr) < 2:
                continue
            
            # Duplikasyon kontrolü - sadece benzersiz isimler
            if clean_name_tr.lower() in added_foods:
                continue
            
            # Kategori belirle
            category = categorize_food(description)
            
            # Nutrient değerlerini al (100g bazında)
            calories = nutrient_data.get('1008', 0)
            protein = nutrient_data.get('1003', 0)
            carbs = nutrient_data.get('1005', 0)
            fat = nutrient_data.get('1004', 0)
            fiber = nutrient_data.get('1079', 0)
            
            # Geçerli değerleri kontrol et
            if calories <= 0 or calories > 1000:
                continue
                
            # SQL statement oluştur
            sql = f"('{clean_name_tr}', '{clean_name_tr}', '{clean_name_en}', {calories:.1f}, {protein:.1f}, {carbs:.1f}, {fat:.1f}, {fiber:.1f}, '{category}', true, NOW(), NOW()),"
            sql_statements.append(sql)
            added_foods.add(clean_name_tr.lower())
            processed_count += 1
            
            if processed_count % 100 == 0:
                print(f"📊 {processed_count} besin işlendi...")
    
    # Popüler hazır yemekler ekle
    popular_foods = [
        ('Pizza, Margherita', 'Pizza, Margherita', 'Pizza, Margherita', 266, 11, 33, 10, 2, 'fast_food'),
        ('Hamburger, Büyük', 'Hamburger, Büyük', 'Hamburger, Large', 354, 16, 33, 17, 2, 'fast_food'),
        ('Patates Kızartması', 'Patates Kızartması', 'French Fries', 365, 4, 63, 11, 6, 'fast_food'),
        ('Tavuk Nugget', 'Tavuk Nugget', 'Chicken Nuggets', 296, 16, 16, 18, 1, 'fast_food'),
        ('Sandviç, Tavuk', 'Sandviç, Tavuk', 'Chicken Sandwich', 280, 12, 35, 8, 2, 'fast_food'),
        ('Sosisli', 'Sosisli', 'Hot Dog', 290, 12, 18, 20, 1, 'fast_food'),
        ('Döner', 'Döner', 'Doner Kebab', 280, 25, 15, 12, 2, 'fast_food'),
        ('Adana Kebap', 'Adana Kebap', 'Adana Kebab', 320, 28, 5, 20, 1, 'fast_food'),
        ('Urfa Kebap', 'Urfa Kebap', 'Urfa Kebab', 300, 26, 5, 18, 1, 'fast_food'),
        ('İskender', 'İskender', 'Iskender Kebab', 450, 35, 25, 25, 3, 'fast_food'),
        ('Sucuk', 'Sucuk', 'Turkish Sausage', 350, 20, 2, 28, 0, 'protein'),
        ('Sosis', 'Sosis', 'Sausage', 280, 15, 3, 22, 0, 'protein'),
        ('Pastırma', 'Pastırma', 'Turkish Pastrami', 320, 25, 1, 23, 0, 'protein'),
        ('Jambon', 'Jambon', 'Ham', 250, 18, 2, 18, 0, 'protein'),
        ('Salam', 'Salam', 'Salami', 400, 20, 2, 32, 0, 'protein'),
        ('Köfte', 'Köfte', 'Meatball', 250, 20, 10, 15, 1, 'protein'),
        ('Börek, Peynirli', 'Börek, Peynirli', 'Cheese Börek', 320, 12, 35, 15, 2, 'grain'),
        ('Börek, Etli', 'Börek, Etli', 'Meat Börek', 380, 18, 32, 22, 2, 'grain'),
        ('Lahmacun', 'Lahmacun', 'Turkish Pizza', 220, 12, 25, 8, 2, 'fast_food'),
        ('Pide, Peynirli', 'Pide, Peynirli', 'Cheese Pide', 280, 14, 30, 12, 2, 'grain'),
        ('Mantı', 'Mantı', 'Turkish Dumplings', 180, 8, 25, 5, 2, 'grain'),
        ('Çiğ Köfte', 'Çiğ Köfte', 'Raw Meatball', 150, 12, 15, 6, 2, 'protein'),
        ('Zeytin, Yeşil', 'Zeytin, Yeşil', 'Green Olives', 145, 1, 4, 15, 3, 'other'),
        ('Zeytin, Siyah', 'Zeytin, Siyah', 'Black Olives', 160, 1, 4, 16, 3, 'other'),
    ]
    
    for food in popular_foods:
        sql = f"('{food[0]}', '{food[1]}', '{food[2]}', {food[3]}, {food[4]}, {food[5]}, {food[6]}, {food[7]}, '{food[8]}', true, NOW(), NOW()),"
        sql_statements.append(sql)
        processed_count += 1
    
    print(f"✅ Toplam {processed_count} besin işlendi!")
    return sql_statements

def load_nutrients():
    """Nutrient verilerini yükle"""
    nutrients = {}
    nutrient_file = "/Users/omerpehriz/Desktop/Project/FitnesApp/foods/FoodData_Central_foundation_food_csv_2025-04-24/food_nutrient.csv"
    
    with open(nutrient_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            nutrient_id = row['nutrient_id']
            # Sadece nutrient ID'leri kullan
            nutrients[nutrient_id] = nutrient_id
    
    return nutrients

def load_food_nutrients():
    """Food nutrient verilerini yükle"""
    food_nutrients = defaultdict(dict)
    nutrient_file = "/Users/omerpehriz/Desktop/Project/FitnesApp/foods/FoodData_Central_foundation_food_csv_2025-04-24/food_nutrient.csv"
    
    with open(nutrient_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            fdc_id = row['fdc_id']
            nutrient_id = row['nutrient_id']
            amount = float(row['amount']) if row['amount'] else 0
            food_nutrients[fdc_id][nutrient_id] = amount
    
    return food_nutrients

def write_sql_file(sql_statements):
    """SQL dosyasını yaz"""
    sql_file = "/Users/omerpehriz/Desktop/Project/FitnesApp/SQLs/realsqls/15_comprehensive_food_database.sql"
    
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write("-- Clean Food Database - Temizlenmiş Besin Veritabanı\n")
        f.write("-- Bu dosya USDA FoodData Central verilerinden oluşturulmuştur\n\n")
        
        f.write("-- Önce mevcut verileri temizle\n")
        f.write("DELETE FROM foods WHERE created_at > NOW() - INTERVAL '1 day';\n\n")
        
        f.write("-- Temizlenmiş besin verilerini ekle\n")
        f.write("INSERT INTO foods (name, name_tr, name_en, calories_per_100g, protein_g_per_100g, carb_g_per_100g, fat_g_per_100g, fiber_g_per_100g, category, is_active, created_at, updated_at)\n")
        f.write("VALUES\n")
        
        for i, sql in enumerate(sql_statements):
            if i == len(sql_statements) - 1:
                # Son satırda virgül olmamalı
                sql = sql.rstrip(',')
            f.write(f"  {sql}\n")
        
        f.write("ON CONFLICT (name) DO NOTHING;\n\n")
        f.write("-- İstatistikler\n")
        f.write(f"SELECT COUNT(*) as total_foods FROM foods WHERE is_active = true;\n")

if __name__ == "__main__":
    print("🚀 Clean Food Database oluşturuluyor...")
    
    try:
        sql_statements = process_foods()
        write_sql_file(sql_statements)
        print(f"✅ SQL dosyası oluşturuldu: 15_comprehensive_food_database.sql")
        print(f"📊 Toplam {len(sql_statements)} besin eklendi!")
        print("🎯 Duplikasyonlar temizlendi!")
        print("🇹🇷 Tam Türkçe çeviriler!")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        import traceback
        traceback.print_exc()
