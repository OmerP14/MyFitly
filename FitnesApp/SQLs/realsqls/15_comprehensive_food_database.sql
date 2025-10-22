-- Turkish Food Database - Complete Turkish Food Database
-- This file contains only Turkish food names for Turkish language users

-- Clear existing data first
DELETE FROM foods WHERE created_at > NOW() - INTERVAL '1 day';

-- Insert Turkish food data
INSERT INTO foods (name, name_tr, name_en, calories_per_100g, protein_g_per_100g, carb_g_per_100g, fat_g_per_100g, fiber_g_per_100g, category, is_active, created_at, updated_at)
VALUES
  -- FRUITS
('Domates, Üzüm, Çiğ'', ''Domates, Üzüm, Çiğ'', ''Tomatoes, grape, raw'', 'Tomatoes, grape, raw', 27.0, 0.8, 5.5, 0.6, 2.1, 'fruit', true, NOW(), NOW()),
('Şeftali, Sarı, Çiğ'', ''Şeftali, Sarı, Çiğ'', ''Peaches, yellow, raw'', 'Peaches, yellow, raw', 42.0, 0.9, 10.1, 0.3, 1.5, 'fruit', true, NOW(), NOW()),
('Kivi, Yeşil, Çiğ'', ''Kivi, Yeşil, Çiğ'', ''Kiwifruit, green, raw'', 'Kiwifruit, green, raw', 58.0, 1.1, 14.0, 0.4, 3.0, 'fruit', true, NOW(), NOW()),
('Kavun, Cantaloupe, Çiğ'', ''Kavun, Cantaloupe, Çiğ'', ''Melons, cantaloupe, raw'', 'Melons, cantaloupe, raw', 34.0, 0.8, 8.2, 0.2, 0.8, 'fruit', true, NOW(), NOW()),
('Nektarin, Çiğ'', ''Nektarin, Çiğ'', ''Nectarines, raw'', 'Nectarines, raw', 39.0, 1.1, 9.2, 0.3, 1.5, 'fruit', true, NOW(), NOW()),
('Portakal, Çiğ, Navel'', ''Portakal, Çiğ, Navel'', ''Oranges, raw, navels'', 'Oranges, raw, navels', 47.0, 0.9, 11.8, 0.1, 2.0, 'fruit', true, NOW(), NOW()),
('Çilek, Çiğ'', ''Çilek, Çiğ'', ''Strawberries, raw'', 'Strawberries, raw', 31.0, 0.6, 7.6, 0.2, 1.8, 'fruit', true, NOW(), NOW()),
('Elma, Kırmızı, Çiğ'', ''Elma, Kırmızı, Çiğ'', ''Apples, red, raw'', 'Apples, red, raw', 52.0, 0.3, 14.0, 0.2, 2.4, 'fruit', true, NOW(), NOW()),
('Muz, Çiğ'', ''Muz, Çiğ'', ''Bananas, raw'', 'Bananas, raw', 89.0, 1.1, 23.0, 0.3, 2.6, 'fruit', true, NOW(), NOW()),
('Üzüm, Kırmızı veya Yeşil, Çiğ'', ''Üzüm, Kırmızı veya Yeşil, Çiğ'', ''Grapes, red or green, raw'', 'Grapes, red or green, raw', 62.0, 0.6, 16.0, 0.2, 1.0, 'fruit', true, NOW(), NOW()),
('İncir, Kurutulmuş, Ham'', ''İncir, Kurutulmuş, Ham'', ''Figs, dried, uncooked'', 'Figs, dried, uncooked', 249.0, 3.3, 63.9, 0.9, 9.8, 'fruit', true, NOW(), NOW()),
('Greyfurt Suyu, Beyaz, Şekersiz'', ''Greyfurt Suyu, Beyaz, Şekersiz'', ''Grapefruit juice, white, unsweetened'', 'Grapefruit juice, white, unsweetened', 37.0, 0.6, 7.6, 0.7, 0.2, 'fruit', true, NOW(), NOW()),
('Meyve Suyu, Portakal, Taze'', ''Meyve Suyu, Portakal, Taze'', ''Juice, orange, raw'', 'Juice, orange, raw', 45.0, 0.7, 10.4, 0.2, 0.2, 'fruit', true, NOW(), NOW()),

  -- VEGETABLES
('Brokoli, Çiğ'', ''Brokoli, Çiğ'', ''Broccoli, raw'', 'Broccoli, raw', 32.0, 2.6, 6.3, 0.3, 2.4, 'vegetable', true, NOW(), NOW()),
('Kara Lahana, Çiğ'', ''Kara Lahana, Çiğ'', ''Kale, raw'', 'Kale, raw', 35.0, 2.9, 4.4, 1.5, 4.1, 'vegetable', true, NOW(), NOW()),
('Havuç, Dondurulmuş, Ham'', ''Havuç, Dondurulmuş, Ham'', ''Carrots, frozen, unprepared'', 'Carrots, frozen, unprepared', 37.0, 0.8, 7.9, 0.5, 3.2, 'vegetable', true, NOW(), NOW()),
('Marul, Cos veya Romaine, Çiğ'', ''Marul, Cos veya Romaine, Çiğ'', ''Lettuce, cos or romaine, raw'', 'Lettuce, cos or romaine, raw', 17.0, 1.2, 3.2, 0.3, 1.8, 'vegetable', true, NOW(), NOW()),
('Havuç, Çiğ'', ''Havuç, Çiğ'', ''Carrots, raw'', 'Carrots, raw', 41.0, 0.9, 9.6, 0.2, 2.8, 'vegetable', true, NOW(), NOW()),
('Patates, Çiğ'', ''Patates, Çiğ'', ''Potatoes, raw'', 'Potatoes, raw', 77.0, 2.0, 17.0, 0.1, 2.2, 'vegetable', true, NOW(), NOW()),
('Salatalık, Çiğ'', ''Salatalık, Çiğ'', ''Cucumber, raw'', 'Cucumber, raw', 16.0, 0.7, 4.0, 0.1, 0.5, 'vegetable', true, NOW(), NOW()),
('Biber, Tatlı, Kırmızı, Çiğ'', ''Biber, Tatlı, Kırmızı, Çiğ'', ''Peppers, sweet, red, raw'', 'Peppers, sweet, red, raw', 31.0, 1.0, 7.3, 0.3, 2.5, 'vegetable', true, NOW(), NOW()),
('Mısır, Tatlı, Sarı, Çiğ'', ''Mısır, Tatlı, Sarı, Çiğ'', ''Corn, sweet, yellow, raw'', 'Corn, sweet, yellow, raw', 86.0, 3.3, 19.0, 1.2, 2.7, 'vegetable', true, NOW(), NOW()),
('Ispanak, Çiğ'', ''Ispanak, Çiğ'', ''Spinach, raw'', 'Spinach, raw', 23.0, 2.9, 3.6, 0.4, 2.2, 'vegetable', true, NOW(), NOW()),
('Lahana, Çiğ'', ''Lahana, Çiğ'', ''Cabbage, raw'', 'Cabbage, raw', 25.0, 1.3, 5.8, 0.1, 2.5, 'vegetable', true, NOW(), NOW()),
('Soğan, Kırmızı, Çiğ'', ''Soğan, Kırmızı, Çiğ'', ''Onions, red, raw'', 'Onions, red, raw', 44.0, 0.9, 9.9, 0.1, 2.2, 'vegetable', true, NOW(), NOW()),
('Soğan, Sarı, Çiğ'', ''Soğan, Sarı, Çiğ'', ''Onions, yellow, raw'', 'Onions, yellow, raw', 38.0, 0.8, 8.6, 0.1, 1.9, 'vegetable', true, NOW(), NOW()),
('Turşu, Salatalık, Dereotu'', ''Turşu, Salatalık, Dereotu'', ''Pickles, cucumber, dill'', 'Pickles, cucumber, dill', 12.0, 0.5, 2.0, 0.4, 1.0, 'vegetable', true, NOW(), NOW()),
('Zeytin, Yeşil'', ''Zeytin, Yeşil'', ''Green Olives'', 'Green Olives', 145.0, 1.0, 4.0, 15.0, 3.0, 'vegetable', true, NOW(), NOW()),
('Zeytin, Siyah'', ''Zeytin, Siyah'', ''Black Olives'', 'Black Olives', 160.0, 1.0, 4.0, 16.0, 3.0, 'vegetable', true, NOW(), NOW()),

  -- MEAT TYPES (No Pork)
('Biftek, Sığır, Çiğ'', ''Biftek, Sığır, Çiğ'', ''Beef Steak, raw'', 'Beef Steak, raw', 250.0, 26.0, 0.0, 15.0, 0.0, 'protein', true, NOW(), NOW()),
('Pirzola, Kuzu, Çiğ'', ''Pirzola, Kuzu, Çiğ'', ''Lamb Chops, raw'', 'Lamb Chops, raw', 280.0, 25.0, 0.0, 18.0, 0.0, 'protein', true, NOW(), NOW()),
('Köfte, Sığır Eti'', ''Köfte, Sığır Eti'', ''Beef Meatballs'', 'Beef Meatballs', 250.0, 20.0, 10.0, 15.0, 1.0, 'protein', true, NOW(), NOW()),
('Kuzu Kebabı'', ''Kuzu Kebabı'', ''Lamb Kebab'', 'Lamb Kebab', 290.0, 28.0, 5.0, 16.0, 1.0, 'protein', true, NOW(), NOW()),
('Sucuk'', ''Sucuk'', ''Turkish Sausage'', 'Turkish Sausage', 350.0, 20.0, 2.0, 28.0, 0.0, 'protein', true, NOW(), NOW()),
('Sosis'', ''Sosis'', ''Sausage'', 'Sausage', 280.0, 15.0, 3.0, 22.0, 0.0, 'protein', true, NOW(), NOW()),
('Pastırma'', ''Pastırma'', ''Turkish Pastrami'', 'Turkish Pastrami', 320.0, 25.0, 1.0, 23.0, 0.0, 'protein', true, NOW(), NOW()),
('Jambon'', ''Jambon'', ''Ham'', 'Ham', 250.0, 18.0, 2.0, 18.0, 0.0, 'protein', true, NOW(), NOW()),
('Salam'', ''Salam'', ''Salami'', 'Salami', 400.0, 20.0, 2.0, 32.0, 0.0, 'protein', true, NOW(), NOW()),
('Hindi Füme'', ''Hindi Füme'', ''Smoked Turkey'', 'Smoked Turkey', 220.0, 25.0, 1.0, 12.0, 0.0, 'protein', true, NOW(), NOW()),
('Tavuk Füme'', ''Tavuk Füme'', ''Smoked Chicken'', 'Smoked Chicken', 180.0, 28.0, 1.0, 6.0, 0.0, 'protein', true, NOW(), NOW()),
('Sığır Füme'', ''Sığır Füme'', ''Smoked Beef'', 'Smoked Beef', 250.0, 30.0, 1.0, 12.0, 0.0, 'protein', true, NOW(), NOW()),
('Kuzu Füme'', ''Kuzu Füme'', ''Smoked Lamb'', 'Smoked Lamb', 280.0, 26.0, 1.0, 18.0, 0.0, 'protein', true, NOW(), NOW()),
('Balık Füme, Somon'', ''Balık Füme, Somon'', ''Smoked Salmon'', 'Smoked Salmon', 208.0, 22.0, 0.0, 12.0, 0.0, 'protein', true, NOW(), NOW()),
('Balık Füme, Ton'', ''Balık Füme, Ton'', ''Smoked Tuna'', 'Smoked Tuna', 109.0, 24.0, 0.0, 1.0, 0.0, 'protein', true, NOW(), NOW()),
('Pastırma, Sığır'', ''Pastırma, Sığır'', ''Beef Pastrami'', 'Beef Pastrami', 320.0, 25.0, 1.0, 23.0, 0.0, 'protein', true, NOW(), NOW()),
('Pastırma, Kuzu'', ''Pastırma, Kuzu'', ''Lamb Pastrami'', 'Lamb Pastrami', 340.0, 27.0, 1.0, 24.0, 0.0, 'protein', true, NOW(), NOW()),
('Çiğ Köfte'', ''Çiğ Köfte'', ''Raw Meatballs'', 'Raw Meatball', 150.0, 12.0, 15.0, 6.0, 2.0, 'protein', true, NOW(), NOW()),
('İçli Köfte'', ''İçli Köfte'', ''Stuffed Meatballs'', 'Stuffed Meatball', 180.0, 15.0, 20.0, 8.0, 2.0, 'protein', true, NOW(), NOW()),
('Mantı'', ''Mantı'', ''Turkish Dumplings'', 'Turkish Dumplings', 180.0, 8.0, 25.0, 5.0, 2.0, 'protein', true, NOW(), NOW()),

  -- CHICKEN TYPES
('Tavuk, Göğüs, Çiğ'', ''Tavuk, Göğüs, Çiğ'', ''Chicken Breast, raw'', 'Chicken Breast, raw', 165.0, 31.0, 0.0, 3.6, 0.0, 'protein', true, NOW(), NOW()),
('Tavuk, But, Çiğ'', ''Tavuk, But, Çiğ'', ''Chicken Thigh, raw'', 'Chicken Thigh, raw', 209.0, 18.0, 0.0, 15.0, 0.0, 'protein', true, NOW(), NOW()),
('Tavuk Kanadı, Çiğ'', ''Tavuk Kanadı, Çiğ'', ''Chicken Wing, raw'', 'Chicken Wing, raw', 203.0, 18.0, 0.0, 14.0, 0.0, 'protein', true, NOW(), NOW()),
('Tavuk Nugget'', ''Tavuk Nugget'', ''Chicken Nuggets'', 'Chicken Nuggets', 296.0, 16.0, 16.0, 18.0, 1.0, 'protein', true, NOW(), NOW()),
('Tavuk Şinitzel'', ''Tavuk Şinitzel'', ''Chicken Schnitzel'', 'Chicken Schnitzel', 280.0, 22.0, 15.0, 16.0, 1.0, 'protein', true, NOW(), NOW()),
('Tavuk Döner'', ''Tavuk Döner'', ''Chicken Doner'', 'Chicken Doner', 260.0, 24.0, 8.0, 14.0, 1.0, 'protein', true, NOW(), NOW()),
('Tavuk Izgara'', ''Tavuk Izgara'', ''Grilled Chicken'', 'Grilled Chicken', 165.0, 31.0, 0.0, 3.6, 0.0, 'protein', true, NOW(), NOW()),
('Tavuk Kızartma'', ''Tavuk Kızartma'', ''Fried Chicken'', 'Fried Chicken', 300.0, 25.0, 5.0, 18.0, 0.0, 'protein', true, NOW(), NOW()),

  -- FISH TYPES
('Somon, Çiğ'', ''Somon, Çiğ'', ''Salmon, raw'', 'Salmon, raw', 208.0, 22.0, 0.0, 12.0, 0.0, 'protein', true, NOW(), NOW()),
('Ton Balığı, Çiğ'', ''Ton Balığı, Çiğ'', ''Tuna, raw'', 'Tuna, raw', 109.0, 24.0, 0.0, 1.0, 0.0, 'protein', true, NOW(), NOW()),
('Levrek, Çiğ'', ''Levrek, Çiğ'', ''Sea Bass, raw'', 'Sea Bass, raw', 97.0, 18.0, 0.0, 2.0, 0.0, 'protein', true, NOW(), NOW()),
('Çupra, Çiğ'', ''Çupra, Çiğ'', ''Sea Bream, raw'', 'Sea Bream, raw', 96.0, 17.0, 0.0, 2.5, 0.0, 'protein', true, NOW(), NOW()),
('Hamsi, Çiğ'', ''Hamsi, Çiğ'', ''Anchovy, raw'', 'Anchovy, raw', 131.0, 20.0, 0.0, 5.0, 0.0, 'protein', true, NOW(), NOW()),
('İstavrit, Çiğ'', ''İstavrit, Çiğ'', ''Horse Mackerel, raw'', 'Horse Mackerel, raw', 105.0, 18.0, 0.0, 3.0, 0.0, 'protein', true, NOW(), NOW()),
('Palamut, Çiğ'', ''Palamut, Çiğ'', ''Bonito, raw'', 'Bonito, raw', 109.0, 22.0, 0.0, 1.0, 0.0, 'protein', true, NOW(), NOW()),
('Balık Ekmek'', ''Balık Ekmek'', ''Fish Sandwich'', 'Fish Sandwich', 320.0, 18.0, 25.0, 15.0, 2.0, 'protein', true, NOW(), NOW()),

  -- DAIRY PRODUCTS
('Süt, Tam Yağlı'', ''Süt, Tam Yağlı'', ''Whole Milk'', 'Whole Milk', 61.0, 3.2, 4.7, 3.3, 0.0, 'dairy', true, NOW(), NOW()),
('Peynir, Beyaz'', ''Peynir, Beyaz'', ''White Cheese'', 'White Cheese', 264.0, 17.0, 4.0, 20.0, 0.0, 'dairy', true, NOW(), NOW()),
('Peynir, Kaşar'', ''Peynir, Kaşar'', ''Kashar Cheese'', 'Kashar Cheese', 403.0, 25.0, 1.3, 33.0, 0.0, 'dairy', true, NOW(), NOW()),
('Peynir, Tulum'', ''Peynir, Tulum'', ''Tulum Cheese'', 'Tulum Cheese', 320.0, 22.0, 2.0, 25.0, 0.0, 'dairy', true, NOW(), NOW()),
('Yoğurt, Sade'', ''Yoğurt, Sade'', ''Plain Yogurt'', 'Plain Yogurt', 61.0, 3.5, 4.7, 3.3, 0.0, 'dairy', true, NOW(), NOW()),
('Yoğurt, Yunan'', ''Yoğurt, Yunan'', ''Greek Yogurt'', 'Greek Yogurt', 83.0, 8.1, 12.2, 0.1, 0.6, 'dairy', true, NOW(), NOW()),
('Tereyağı'', ''Tereyağı'', ''Butter'', 'Butter', 717.0, 0.9, 0.1, 81.0, 0.0, 'dairy', true, NOW(), NOW()),
('Yumurta, Tam'', ''Yumurta, Tam'', ''Whole Egg'', 'Whole Egg', 148.0, 12.4, 1.0, 10.0, 0.0, 'dairy', true, NOW(), NOW()),
('Ayran'', ''Ayran'', ''Ayran'', 'Ayran', 35.0, 2.0, 4.0, 1.0, 0.0, 'dairy', true, NOW(), NOW()),
('Kefir'', ''Kefir'', ''Kefir'', 'Kefir', 41.0, 3.3, 4.5, 1.0, 0.0, 'dairy', true, NOW(), NOW()),

  -- GRAINS AND BREADS
('Ekmek, Beyaz'', ''Ekmek, Beyaz'', ''White Bread'', 'White Bread', 270.0, 9.4, 49.2, 3.6, 2.3, 'grain', true, NOW(), NOW()),
('Ekmek, Tam Buğday'', ''Ekmek, Tam Buğday'', ''Whole Wheat Bread'', 'Whole Wheat Bread', 254.0, 12.3, 43.1, 3.5, 6.0, 'grain', true, NOW(), NOW()),
('Ekmek, Kepekli'', ''Ekmek, Kepekli'', ''Bran Bread'', 'Bran Bread', 248.0, 10.0, 45.0, 3.5, 7.0, 'grain', true, NOW(), NOW()),
('Simit'', ''Simit'', ''Simit'', 'Simit', 320.0, 12.0, 55.0, 8.0, 3.0, 'grain', true, NOW(), NOW()),
('Poğaça'', ''Poğaça'', ''Poğaça'', 'Poğaça', 350.0, 8.0, 45.0, 16.0, 2.0, 'grain', true, NOW(), NOW()),
('Açma'', ''Açma'', ''Açma'', 'Açma', 330.0, 7.0, 48.0, 12.0, 2.0, 'grain', true, NOW(), NOW()),
('Pirinç, Beyaz'', ''Pirinç, Beyaz'', ''White Rice'', 'White Rice', 365.0, 7.1, 80.0, 0.7, 1.3, 'grain', true, NOW(), NOW()),
('Pirinç, Esmer'', ''Pirinç, Esmer'', ''Brown Rice'', 'Brown Rice', 370.0, 7.9, 77.0, 2.9, 3.5, 'grain', true, NOW(), NOW()),
('Bulgur'', ''Bulgur'', ''Bulgur'', 'Bulgur', 342.0, 12.3, 75.9, 1.3, 12.5, 'grain', true, NOW(), NOW()),
('Makarna, Spaghetti'', ''Makarna, Spaghetti'', ''Spaghetti Pasta'', 'Spaghetti Pasta', 371.0, 13.0, 75.0, 1.5, 3.2, 'grain', true, NOW(), NOW()),
('Makarna, Fettuccine'', ''Makarna, Fettuccine'', ''Fettuccine Pasta'', 'Fettuccine Pasta', 371.0, 13.0, 75.0, 1.5, 3.2, 'grain', true, NOW(), NOW()),
('Makarna, Penne'', ''Makarna, Penne'', ''Penne Pasta'', 'Penne Pasta', 371.0, 13.0, 75.0, 1.5, 3.2, 'grain', true, NOW(), NOW()),
('Makarna, Ravioli'', ''Makarna, Ravioli'', ''Ravioli Pasta'', 'Ravioli Pasta', 250.0, 10.0, 40.0, 6.0, 2.0, 'grain', true, NOW(), NOW()),
('Yulaf'', ''Yulaf'', ''Oats'', 'Oats', 389.0, 16.9, 66.3, 6.9, 10.6, 'grain', true, NOW(), NOW()),
('Arpa'', ''Arpa'', ''Barley'', 'Barley', 352.0, 12.5, 73.5, 2.3, 17.3, 'grain', true, NOW(), NOW()),

  -- BREAKFAST AND PASTRIES
('Börek, Peynirli'', ''Börek, Peynirli'', ''Cheese Börek'', 'Cheese Börek', 320.0, 12.0, 35.0, 15.0, 2.0, 'grain', true, NOW(), NOW()),
('Börek, Etli'', ''Börek, Etli'', ''Meat Börek'', 'Meat Börek', 380.0, 18.0, 32.0, 22.0, 2.0, 'grain', true, NOW(), NOW()),
('Börek, Ispanaklı'', ''Börek, Ispanaklı'', ''Spinach Börek'', 'Spinach Börek', 280.0, 10.0, 35.0, 12.0, 3.0, 'grain', true, NOW(), NOW()),
('Börek, Patatesli'', ''Börek, Patatesli'', ''Potato Börek'', 'Potato Börek', 300.0, 8.0, 40.0, 14.0, 2.0, 'grain', true, NOW(), NOW()),
('Su Böreği'', ''Su Böreği'', ''Water Börek'', 'Water Börek', 250.0, 8.0, 35.0, 8.0, 2.0, 'grain', true, NOW(), NOW()),
('Sigara Böreği'', ''Sigara Böreği'', ''Cigarette Börek'', 'Cigarette Börek', 420.0, 15.0, 45.0, 20.0, 2.0, 'grain', true, NOW(), NOW()),
('Kol Böreği'', ''Kol Böreği'', ''Arm Börek'', 'Arm Börek', 350.0, 12.0, 38.0, 18.0, 2.0, 'grain', true, NOW(), NOW()),
('Çiğ Börek'', ''Çiğ Börek'', ''Raw Börek'', 'Raw Börek', 380.0, 15.0, 35.0, 22.0, 2.0, 'grain', true, NOW(), NOW()),
('Pide, Peynirli'', ''Pide, Peynirli'', ''Cheese Pide'', 'Cheese Pide', 280.0, 14.0, 30.0, 12.0, 2.0, 'grain', true, NOW(), NOW()),
('Pide, Etli'', ''Pide, Etli'', ''Meat Pide'', 'Meat Pide', 320.0, 18.0, 28.0, 16.0, 2.0, 'grain', true, NOW(), NOW()),
('Pide, Kaşarlı'', ''Pide, Kaşarlı'', ''Kashar Pide'', 'Kashar Pide', 300.0, 16.0, 32.0, 14.0, 2.0, 'grain', true, NOW(), NOW()),
('Lahmacun'', ''Lahmacun'', ''Turkish Pizza'', 'Turkish Pizza', 220.0, 12.0, 25.0, 8.0, 2.0, 'grain', true, NOW(), NOW()),
('Menemen'', ''Menemen'', ''Menemen'', 'Menemen', 120.0, 8.0, 5.0, 7.0, 1.0, 'protein', true, NOW(), NOW()),
('Omlet'', ''Omlet'', ''Omelet'', 'Omelet', 154.0, 13.0, 1.0, 11.0, 0.0, 'protein', true, NOW(), NOW()),
('Sucuklu Yumurta'', ''Sucuklu Yumurta'', ''Sausage with Egg'', 'Sausage with Egg', 280.0, 18.0, 3.0, 22.0, 0.0, 'protein', true, NOW(), NOW()),
('Pastırmalı Yumurta'', ''Pastırmalı Yumurta'', ''Pastrami with Egg'', 'Pastrami with Egg', 290.0, 22.0, 2.0, 21.0, 0.0, 'protein', true, NOW(), NOW()),
('Kaymak'', ''Kaymak'', ''Clotted Cream'', 'Clotted Cream', 540.0, 3.0, 4.0, 58.0, 0.0, 'dairy', true, NOW(), NOW()),
('Reçel, Çilek'', ''Reçel, Çilek'', ''Strawberry Jam'', 'Strawberry Jam', 278.0, 0.4, 69.0, 0.1, 1.0, 'other', true, NOW(), NOW()),
('Reçel, Kayısı'', ''Reçel, Kayısı'', ''Apricot Jam'', 'Apricot Jam', 278.0, 0.4, 69.0, 0.1, 1.0, 'other', true, NOW(), NOW()),
('Bal'', ''Bal'', ''Honey'', 'Honey', 304.0, 0.3, 82.4, 0.0, 0.2, 'other', true, NOW(), NOW()),
('Tahin'', ''Tahin'', ''Tahini'', 'Tahini', 595.0, 17.0, 21.0, 54.0, 9.0, 'other', true, NOW(), NOW()),
('Pekmez'', ''Pekmez'', ''Molasses'', 'Molasses', 290.0, 0.0, 75.0, 0.0, 0.0, 'other', true, NOW(), NOW()),

  -- FRIED FOODS
('Patates Kızartması'', ''Patates Kızartması'', ''French Fries'', 'French Fries', 365.0, 4.0, 63.0, 11.0, 6.0, 'fast_food', true, NOW(), NOW()),
('Soğan Halkaları'', ''Soğan Halkaları'', ''Onion Rings'', 'Onion Rings', 288.0, 4.5, 36.3, 14.4, 2.4, 'fast_food', true, NOW(), NOW()),
('Mozzarella Sticks'', ''Mozzarella Sticks'', ''Mozzarella Sticks'', 'Mozzarella Sticks', 320.0, 18.0, 25.0, 16.0, 1.0, 'fast_food', true, NOW(), NOW()),
('Nugget, Tavuk'', ''Nugget, Tavuk'', ''Chicken Nuggets'', 'Chicken Nuggets', 296.0, 16.0, 16.0, 18.0, 1.0, 'fast_food', true, NOW(), NOW()),
('Tavuk Kanadı, Kızartma'', ''Tavuk Kanadı, Kızartma'', ''Fried Chicken Wings'', 'Fried Chicken Wings', 320.0, 25.0, 3.0, 22.0, 0.0, 'fast_food', true, NOW(), NOW()),
('Hamsi, Kızartma'', ''Hamsi, Kızartma'', ''Fried Anchovy'', 'Fried Anchovy', 280.0, 25.0, 8.0, 18.0, 0.0, 'fast_food', true, NOW(), NOW()),
('Patlıcan Kızartması'', ''Patlıcan Kızartması'', ''Fried Eggplant'', 'Fried Eggplant', 180.0, 2.0, 15.0, 12.0, 3.0, 'fast_food', true, NOW(), NOW()),
('Kabak Kızartması'', ''Kabak Kızartması'', ''Fried Zucchini'', 'Fried Zucchini', 120.0, 2.0, 8.0, 8.0, 2.0, 'fast_food', true, NOW(), NOW()),

  -- DONER VARIETIES
('Döner, Et'', ''Döner, Et'', ''Meat Doner'', 'Meat Doner', 280.0, 25.0, 15.0, 12.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Döner, Tavuk'', ''Döner, Tavuk'', ''Chicken Doner'', 'Chicken Doner', 260.0, 24.0, 8.0, 14.0, 1.0, 'fast_food', true, NOW(), NOW()),
('Döner, Karışık'', ''Döner, Karışık'', ''Mixed Doner'', 'Mixed Doner', 270.0, 24.0, 12.0, 13.0, 1.5, 'fast_food', true, NOW(), NOW()),
('Döner, Porsiyon'', ''Döner, Porsiyon'', ''Doner Portion'', 'Doner Portion', 320.0, 28.0, 10.0, 18.0, 1.0, 'fast_food', true, NOW(), NOW()),
('Döner, Ekmek Arası'', ''Döner, Ekmek Arası'', ''Doner Sandwich'', 'Doner Sandwich', 380.0, 22.0, 35.0, 16.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Döner, Dürüm'', ''Döner, Dürüm'', ''Doner Wrap'', 'Doner Wrap', 420.0, 26.0, 40.0, 18.0, 2.0, 'fast_food', true, NOW(), NOW()),

  -- PIZZA VARIETIES
('Pizza, Margherita'', ''Pizza, Margherita'', ''Pizza, Margherita'', 'Pizza, Margherita', 266.0, 11.0, 33.0, 10.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Pizza, Pepperoni'', ''Pizza, Pepperoni'', ''Pizza, Pepperoni'', 'Pizza, Pepperoni', 290.0, 14.0, 32.0, 12.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Pizza, Sucuklu'', ''Pizza, Sucuklu'', ''Pizza, Sausage'', 'Pizza, Sausage', 320.0, 16.0, 30.0, 15.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Pizza, Karışık'', ''Pizza, Karışık'', ''Pizza, Mixed'', 'Pizza, Mixed', 300.0, 15.0, 32.0, 13.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Pizza, Sebzeli'', ''Pizza, Sebzeli'', ''Pizza, Vegetable'', 'Pizza, Vegetable', 250.0, 12.0, 35.0, 8.0, 3.0, 'fast_food', true, NOW(), NOW()),
('Pizza, Mantarlı'', ''Pizza, Mantarlı'', ''Pizza, Mushroom'', 'Pizza, Mushroom', 270.0, 13.0, 33.0, 9.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Pizza, Ananaslı'', ''Pizza, Ananaslı'', ''Pizza, Pineapple'', 'Pizza, Pineapple', 280.0, 12.0, 38.0, 8.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Pizza, Deniz Ürünleri'', ''Pizza, Deniz Ürünleri'', ''Pizza, Seafood'', 'Pizza, Seafood', 290.0, 18.0, 30.0, 12.0, 2.0, 'fast_food', true, NOW(), NOW()),

  -- BURGER VARIETIES
('Hamburger, Büyük'', ''Hamburger, Büyük'', ''Hamburger, Large'', 'Hamburger, Large', 354.0, 16.0, 33.0, 17.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Cheeseburger'', ''Cheeseburger'', ''Cheeseburger'', 'Cheeseburger', 380.0, 18.0, 32.0, 20.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Chicken Burger'', ''Chicken Burger'', ''Chicken Burger'', 'Chicken Burger', 320.0, 20.0, 30.0, 12.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Fish Burger'', ''Fish Burger'', ''Fish Burger'', 'Fish Burger', 340.0, 22.0, 28.0, 16.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Veggie Burger'', ''Veggie Burger'', ''Veggie Burger'', 'Veggie Burger', 280.0, 12.0, 35.0, 10.0, 4.0, 'fast_food', true, NOW(), NOW()),
('Double Burger'', ''Double Burger'', ''Double Burger'', 'Double Burger', 480.0, 28.0, 35.0, 28.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Bacon Burger'', ''Bacon Burger'', ''Bacon Burger'', 'Bacon Burger', 420.0, 22.0, 30.0, 25.0, 2.0, 'fast_food', true, NOW(), NOW()),

  -- KEBAB VARIETIES
('Adana Kebap'', ''Adana Kebap'', ''Adana Kebab'', 'Adana Kebab', 320.0, 28.0, 5.0, 20.0, 1.0, 'fast_food', true, NOW(), NOW()),
('Urfa Kebap'', ''Urfa Kebap'', ''Urfa Kebab'', 'Urfa Kebab', 300.0, 26.0, 5.0, 18.0, 1.0, 'fast_food', true, NOW(), NOW()),
('İskender'', ''İskender'', ''Iskender Kebab'', 'Iskender Kebab', 450.0, 35.0, 25.0, 25.0, 3.0, 'fast_food', true, NOW(), NOW()),
('Şiş Kebap'', ''Şiş Kebap'', ''Shish Kebab'', 'Shish Kebab', 280.0, 30.0, 2.0, 16.0, 0.0, 'fast_food', true, NOW(), NOW()),
('Tavuk Şiş'', ''Tavuk Şiş'', ''Chicken Shish'', 'Chicken Shish', 220.0, 28.0, 2.0, 10.0, 0.0, 'fast_food', true, NOW(), NOW()),
('Kuzu Şiş'', ''Kuzu Şiş'', ''Lamb Shish'', 'Lamb Shish', 290.0, 32.0, 2.0, 16.0, 0.0, 'fast_food', true, NOW(), NOW()),
('Karışık Şiş'', ''Karışık Şiş'', ''Mixed Shish'', 'Mixed Shish', 260.0, 30.0, 2.0, 14.0, 0.0, 'fast_food', true, NOW(), NOW()),
('Beyti Kebap'', ''Beyti Kebap'', ''Beyti Kebab'', 'Beyti Kebab', 380.0, 25.0, 20.0, 22.0, 2.0, 'fast_food', true, NOW(), NOW()),

  -- TANTUNI VARIETIES
('Tantuni, Et'', ''Tantuni, Et'', ''Tantuni, Meat'', 'Tantuni, Meat', 350.0, 28.0, 15.0, 20.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Tantuni, Tavuk'', ''Tantuni, Tavuk'', ''Tantuni, Chicken'', 'Tantuni, Chicken', 320.0, 26.0, 12.0, 18.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Tantuni, Dürüm'', ''Tantuni, Dürüm'', ''Tantuni Wrap'', 'Tantuni Wrap', 380.0, 24.0, 25.0, 22.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Tantuni, Porsiyon'', ''Tantuni, Porsiyon'', ''Tantuni Portion'', 'Tantuni Portion', 420.0, 32.0, 8.0, 28.0, 1.0, 'fast_food', true, NOW(), NOW()),

  -- WAFFLE VARIETIES
('Waffle, Sade'', ''Waffle, Sade'', ''Plain Waffle'', 'Plain Waffle', 310.0, 8.0, 47.0, 11.0, 2.0, 'grain', true, NOW(), NOW()),
('Waffle, Çikolatalı'', ''Waffle, Çikolatalı'', ''Chocolate Waffle'', 'Chocolate Waffle', 380.0, 8.0, 55.0, 18.0, 3.0, 'grain', true, NOW(), NOW()),
('Waffle, Meyveli'', ''Waffle, Meyveli'', ''Fruit Waffle'', 'Fruit Waffle', 320.0, 8.0, 50.0, 12.0, 3.0, 'grain', true, NOW(), NOW()),
('Waffle, Nutella'', ''Waffle, Nutella'', ''Nutella Waffle'', 'Nutella Waffle', 420.0, 8.0, 52.0, 22.0, 3.0, 'grain', true, NOW(), NOW()),
('Waffle, Dondurmalı'', ''Waffle, Dondurmalı'', ''Ice Cream Waffle'', 'Ice Cream Waffle', 450.0, 10.0, 55.0, 25.0, 2.0, 'grain', true, NOW(), NOW()),

  -- KOKOREC VARIETIES
('Kokoreç, Sade'', ''Kokoreç, Sade'', ''Plain Kokoreç'', 'Plain Kokoreç', 280.0, 22.0, 8.0, 18.0, 0.0, 'fast_food', true, NOW(), NOW()),
('Kokoreç, Ekmek Arası'', ''Kokoreç, Ekmek Arası'', ''Kokoreç Sandwich'', 'Kokoreç Sandwich', 380.0, 20.0, 30.0, 22.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Kokoreç, Dürüm'', ''Kokoreç, Dürüm'', ''Kokoreç Wrap'', 'Kokoreç Wrap', 420.0, 24.0, 35.0, 24.0, 2.0, 'fast_food', true, NOW(), NOW()),
('Kokoreç, Porsiyon'', ''Kokoreç, Porsiyon'', ''Kokoreç Portion'', 'Kokoreç Portion', 320.0, 25.0, 5.0, 22.0, 0.0, 'fast_food', true, NOW(), NOW()),

  -- RICE VARIETIES
('Pilav, Sade'', ''Pilav, Sade'', ''Plain Rice'', 'Plain Rice', 130.0, 2.7, 28.0, 0.3, 0.4, 'grain', true, NOW(), NOW()),
('Pilav, Tavuklu'', ''Pilav, Tavuklu'', ''Chicken Rice'', 'Chicken Rice', 180.0, 12.0, 25.0, 4.0, 1.0, 'grain', true, NOW(), NOW()),
('Pilav, Etli'', ''Pilav, Etli'', ''Meat Rice'', 'Meat Rice', 200.0, 14.0, 23.0, 6.0, 1.0, 'grain', true, NOW(), NOW()),
('Pilav, Sebzeli'', ''Pilav, Sebzeli'', ''Vegetable Rice'', 'Vegetable Rice', 150.0, 4.0, 28.0, 2.0, 2.0, 'grain', true, NOW(), NOW()),
('Pilav, Mantarlı'', ''Pilav, Mantarlı'', ''Mushroom Rice'', 'Mushroom Rice', 160.0, 5.0, 27.0, 3.0, 2.0, 'grain', true, NOW(), NOW()),
('Pilav, Karışık'', ''Pilav, Karışık'', ''Mixed Rice'', 'Mixed Rice', 190.0, 10.0, 25.0, 5.0, 1.5, 'grain', true, NOW(), NOW()),
('Bulgur Pilavı'', ''Bulgur Pilavı'', ''Bulgur Pilaf'', 'Bulgur Pilaf', 140.0, 4.0, 25.0, 2.0, 4.0, 'grain', true, NOW(), NOW()),
('Arpa Şehriye'', ''Arpa Şehriye'', ''Pearl Barley'', 'Pearl Barley', 130.0, 3.0, 26.0, 1.0, 6.0, 'grain', true, NOW(), NOW()),

  -- PASTA VARIETIES
('Makarna, Bolonez'', ''Makarna, Bolonez'', ''Spaghetti Bolognese'', 'Spaghetti Bolognese', 180.0, 8.0, 25.0, 6.0, 2.0, 'grain', true, NOW(), NOW()),
('Makarna, Carbonara'', ''Makarna, Carbonara'', ''Spaghetti Carbonara'', 'Spaghetti Carbonara', 220.0, 12.0, 28.0, 8.0, 2.0, 'grain', true, NOW(), NOW()),
('Makarna, Napolitana'', ''Makarna, Napolitana'', ''Spaghetti Napoletana'', 'Spaghetti Napoletana', 160.0, 6.0, 30.0, 3.0, 2.0, 'grain', true, NOW(), NOW()),
('Makarna, Alfredo'', ''Makarna, Alfredo'', ''Fettuccine Alfredo'', 'Fettuccine Alfredo', 280.0, 12.0, 32.0, 12.0, 2.0, 'grain', true, NOW(), NOW()),
('Makarna, Pesto'', ''Makarna, Pesto'', ''Pasta Pesto'', 'Pasta Pesto', 200.0, 8.0, 28.0, 8.0, 3.0, 'grain', true, NOW(), NOW()),
('Makarna, Sebzeli'', ''Makarna, Sebzeli'', ''Vegetable Pasta'', 'Vegetable Pasta', 150.0, 6.0, 28.0, 3.0, 3.0, 'grain', true, NOW(), NOW()),
('Makarna, Tavuklu'', ''Makarna, Tavuklu'', ''Chicken Pasta'', 'Chicken Pasta', 190.0, 14.0, 25.0, 5.0, 2.0, 'grain', true, NOW(), NOW()),
('Makarna, Mantarlı'', ''Makarna, Mantarlı'', ''Mushroom Pasta'', 'Mushroom Pasta', 170.0, 7.0, 27.0, 4.0, 3.0, 'grain', true, NOW(), NOW()),

  -- MEATBALLS AND DISHES
('Köfte, Sığır'', ''Köfte, Sığır'', ''Beef Meatballs'', 'Beef Meatballs', 250.0, 20.0, 10.0, 15.0, 1.0, 'protein', true, NOW(), NOW()),
('Köfte, Tavuk'', ''Köfte, Tavuk'', ''Chicken Meatballs'', 'Chicken Meatballs', 220.0, 22.0, 8.0, 10.0, 1.0, 'protein', true, NOW(), NOW()),
('Köfte, Kuzu'', ''Köfte, Kuzu'', ''Lamb Meatballs'', 'Lamb Meatballs', 270.0, 18.0, 12.0, 18.0, 1.0, 'protein', true, NOW(), NOW()),
('İçli Köfte'', ''İçli Köfte'', ''Stuffed Meatballs'', 'Stuffed Meatballs', 180.0, 15.0, 20.0, 8.0, 2.0, 'protein', true, NOW(), NOW()),
('Çiğ Köfte'', ''Çiğ Köfte'', ''Raw Meatballs'', 'Raw Meatballs', 150.0, 12.0, 15.0, 6.0, 2.0, 'protein', true, NOW(), NOW()),
('Mantı'', ''Mantı'', ''Turkish Dumplings'', 'Turkish Dumplings', 180.0, 8.0, 25.0, 5.0, 2.0, 'protein', true, NOW(), NOW()),
('Hünkar Beğendi'', ''Hünkar Beğendi'', ''Sultan Delight'', 'Sultan Delight', 220.0, 18.0, 15.0, 10.0, 2.0, 'protein', true, NOW(), NOW()),
('İmam Bayıldı'', ''İmam Bayıldı'', ''Imam Bayildi'', 'Imam Bayildi', 120.0, 4.0, 12.0, 6.0, 3.0, 'vegetable', true, NOW(), NOW()),
('Karnıyarık'', ''Karnıyarık'', ''Stuffed Eggplant'', 'Stuffed Eggplant', 140.0, 6.0, 10.0, 8.0, 3.0, 'vegetable', true, NOW(), NOW()),
('Mücver'', ''Mücver'', ''Zucchini Fritters'', 'Zucchini Fritters', 180.0, 8.0, 15.0, 10.0, 2.0, 'vegetable', true, NOW(), NOW()),
('Dolma'', ''Dolma'', ''Stuffed Vegetables'', 'Stuffed Vegetables', 130.0, 6.0, 18.0, 4.0, 3.0, 'vegetable', true, NOW(), NOW()),
('Sarma'', ''Sarma'', ''Stuffed Grape Leaves'', 'Stuffed Grape Leaves', 120.0, 5.0, 15.0, 4.0, 3.0, 'vegetable', true, NOW(), NOW()),

  -- DESSERTS
('Baklava'', ''Baklava'', ''Baklava'', 'Baklava', 480.0, 8.0, 65.0, 22.0, 2.0, 'dessert', true, NOW(), NOW()),
('Künefe'', ''Künefe'', ''Künefe'', 'Künefe', 420.0, 10.0, 55.0, 18.0, 2.0, 'dessert', true, NOW(), NOW()),
('Revani'', ''Revani'', ''Revani'', 'Revani', 380.0, 6.0, 75.0, 12.0, 1.0, 'dessert', true, NOW(), NOW()),
('Şekerpare'', ''Şekerpare'', ''Şekerpare'', 'Şekerpare', 450.0, 8.0, 60.0, 20.0, 2.0, 'dessert', true, NOW(), NOW()),
('Tulumba'', ''Tulumba'', ''Tulumba'', 'Tulumba', 520.0, 6.0, 70.0, 25.0, 1.0, 'dessert', true, NOW(), NOW()),
('Lokma'', ''Lokma'', ''Lokma'', 'Lokma', 480.0, 5.0, 68.0, 22.0, 1.0, 'dessert', true, NOW(), NOW()),
('Kazandibi'', ''Kazandibi'', ''Kazandibi'', 'Kazandibi', 320.0, 8.0, 45.0, 12.0, 0.0, 'dessert', true, NOW(), NOW()),
('Muhallebi'', ''Muhallebi'', ''Muhallebi'', 'Muhallebi', 280.0, 6.0, 40.0, 10.0, 0.0, 'dessert', true, NOW(), NOW()),
('Sütlaç'', ''Sütlaç'', ''Rice Pudding'', 'Rice Pudding', 180.0, 4.0, 28.0, 5.0, 0.0, 'dessert', true, NOW(), NOW()),
('Tavuk Göğsü'', ''Tavuk Göğsü'', ''Chicken Breast Dessert'', 'Chicken Breast Dessert', 250.0, 6.0, 35.0, 8.0, 0.0, 'dessert', true, NOW(), NOW()),
('Dondurma, Vanilyalı'', ''Dondurma, Vanilyalı'', ''Vanilla Ice Cream'', 'Vanilla Ice Cream', 207.0, 3.5, 24.0, 11.0, 0.7, 'dessert', true, NOW(), NOW()),
('Dondurma, Çikolatalı'', ''Dondurma, Çikolatalı'', ''Chocolate Ice Cream'', 'Chocolate Ice Cream', 216.0, 3.8, 28.0, 11.0, 2.3, 'dessert', true, NOW(), NOW()),
('Dondurma, Çilekli'', ''Dondurma, Çilekli'', ''Strawberry Ice Cream'', 'Strawberry Ice Cream', 192.0, 3.2, 23.0, 10.0, 1.0, 'dessert', true, NOW(), NOW()),
('Dondurma, Fıstıklı'', ''Dondurma, Fıstıklı'', ''Pistachio Ice Cream'', 'Pistachio Ice Cream', 230.0, 4.5, 22.0, 13.0, 2.0, 'dessert', true, NOW(), NOW()),
('Dondurma, Karışık'', ''Dondurma, Karışık'', ''Mixed Ice Cream'', 'Mixed Ice Cream', 210.0, 3.8, 25.0, 11.0, 1.2, 'dessert', true, NOW(), NOW()),

  -- NUTS AND SEEDS
('Badem'', ''Badem'', ''Almonds'', 'Almonds', 579.0, 21.2, 21.6, 49.9, 12.5, 'protein', true, NOW(), NOW()),
('Ceviz'', ''Ceviz'', ''Walnuts'', 'Walnuts', 654.0, 15.2, 13.7, 65.2, 6.7, 'protein', true, NOW(), NOW()),
('Fıstık'', ''Fıstık'', ''Peanuts'', 'Peanuts', 567.0, 25.8, 16.1, 49.2, 8.5, 'protein', true, NOW(), NOW()),
('Kaju'', ''Kaju'', ''Cashews'', 'Cashews', 553.0, 18.2, 30.2, 43.8, 3.3, 'protein', true, NOW(), NOW()),
('Antep Fıstığı'', ''Antep Fıstığı'', ''Pistachios'', 'Pistachios', 562.0, 20.2, 27.2, 45.3, 10.6, 'protein', true, NOW(), NOW()),
('Fındık'', ''Fındık'', ''Hazelnuts'', 'Hazelnuts', 628.0, 15.0, 16.7, 60.8, 9.7, 'protein', true, NOW(), NOW()),
('Ayçiçeği Çekirdeği'', ''Ayçiçeği Çekirdeği'', ''Sunflower Seeds'', 'Sunflower Seeds', 584.0, 20.8, 20.0, 51.5, 8.6, 'protein', true, NOW(), NOW()),
('Kabak Çekirdeği'', ''Kabak Çekirdeği'', ''Pumpkin Seeds'', 'Pumpkin Seeds', 559.0, 30.2, 10.7, 49.0, 6.0, 'protein', true, NOW(), NOW()),

  -- SAUCES AND SPICES
('Ketçap'', ''Ketçap'', ''Ketchup'', 'Ketchup', 112.0, 1.7, 27.4, 0.1, 0.3, 'seasoning', true, NOW(), NOW()),
('Mayonez'', ''Mayonez'', ''Mayonnaise'', 'Mayonnaise', 680.0, 1.0, 0.6, 75.0, 0.0, 'seasoning', true, NOW(), NOW()),
('Hardal'', ''Hardal'', ''Mustard'', 'Mustard', 66.0, 4.0, 5.0, 3.7, 3.0, 'seasoning', true, NOW(), NOW()),
('Sos, Barbekü'', ''Sos, Barbekü'', ''Barbecue Sauce'', 'Barbecue Sauce', 172.0, 1.3, 41.8, 0.6, 1.0, 'seasoning', true, NOW(), NOW()),
('Sos, Acı'', ''Sos, Acı'', ''Hot Sauce'', 'Hot Sauce', 20.0, 1.0, 4.0, 0.2, 0.8, 'seasoning', true, NOW(), NOW()),
('Sos, Soğan'', ''Sos, Soğan'', ''Onion Sauce'', 'Onion Sauce', 80.0, 2.0, 15.0, 2.0, 1.0, 'seasoning', true, NOW(), NOW()),
('Tuz'', ''Tuz'', ''Salt'', 'Salt', 0.0, 0.0, 0.0, 0.0, 0.0, 'seasoning', true, NOW(), NOW()),
('Karabiber'', ''Karabiber'', ''Black Pepper'', 'Black Pepper', 251.0, 10.4, 63.9, 3.3, 25.3, 'seasoning', true, NOW(), NOW()),
('Kırmızı Biber'', ''Kırmızı Biber'', ''Red Pepper'', 'Red Pepper', 282.0, 12.0, 56.6, 12.4, 27.2, 'seasoning', true, NOW(), NOW()),
('Kimyon'', ''Kimyon'', ''Cumin'', 'Cumin', 375.0, 17.8, 44.2, 22.3, 10.5, 'seasoning', true, NOW(), NOW()),
('Kekik'', ''Kekik'', ''Thyme'', 'Thyme', 276.0, 9.1, 63.9, 7.4, 37.0, 'seasoning', true, NOW(), NOW()),
('Defne Yaprağı'', ''Defne Yaprağı'', ''Bay Leaf'', 'Bay Leaf', 313.0, 7.6, 74.9, 8.4, 26.3, 'seasoning', true, NOW(), NOW()),

  -- BEVERAGES
('Çay, Siyah'', ''Çay, Siyah'', ''Black Tea'', 'Black Tea', 1.0, 0.0, 0.3, 0.0, 0.0, 'beverage', true, NOW(), NOW()),
('Kahve, Türk'', ''Kahve, Türk'', ''Turkish Coffee'', 'Turkish Coffee', 2.0, 0.3, 0.0, 0.0, 0.0, 'beverage', true, NOW(), NOW()),
('Kahve, Filtre'', ''Kahve, Filtre'', ''Filter Coffee'', 'Filter Coffee', 2.0, 0.3, 0.0, 0.0, 0.0, 'beverage', true, NOW(), NOW()),
('Kahve, Espresso'', ''Kahve, Espresso'', ''Espresso'', 'Espresso', 2.0, 0.3, 0.0, 0.0, 0.0, 'beverage', true, NOW(), NOW()),
('Çay, Yeşil'', ''Çay, Yeşil'', ''Green Tea'', 'Green Tea', 1.0, 0.0, 0.0, 0.0, 0.0, 'beverage', true, NOW(), NOW()),
('Çay, Adaçayı'', ''Çay, Adaçayı'', ''Sage Tea'', 'Sage Tea', 1.0, 0.0, 0.0, 0.0, 0.0, 'beverage', true, NOW(), NOW()),
('Çay, Ihlamur'', ''Çay, Ihlamur'', ''Linden Tea'', 'Linden Tea', 1.0, 0.0, 0.0, 0.0, 0.0, 'beverage', true, NOW(), NOW()),
('Ayran'', ''Ayran'', ''Ayran'', 'Ayran', 35.0, 2.0, 4.0, 1.0, 0.0, 'beverage', true, NOW(), NOW()),
('Kefir'', ''Kefir'', ''Kefir'', 'Kefir', 41.0, 3.3, 4.5, 1.0, 0.0, 'beverage', true, NOW(), NOW()),
('Meyve Suyu, Elma'', ''Meyve Suyu, Elma'', ''Apple Juice'', 'Apple Juice', 46.0, 0.1, 11.3, 0.1, 0.2, 'beverage', true, NOW(), NOW()),
('Meyve Suyu, Üzüm'', ''Meyve Suyu, Üzüm'', ''Grape Juice'', 'Grape Juice', 60.0, 0.4, 14.8, 0.1, 0.2, 'beverage', true, NOW(), NOW()),
('Meyve Suyu, Şeftali'', ''Meyve Suyu, Şeftali'', ''Peach Juice'', 'Peach Juice', 54.0, 0.5, 13.2, 0.1, 0.2, 'beverage', true, NOW(), NOW()),
('Gazoz'', ''Gazoz'', ''Soda'', 'Soda', 42.0, 0.0, 10.4, 0.0, 0.0, 'beverage', true, NOW(), NOW()),
('Kola'', ''Kola'', ''Cola'', 'Cola', 42.0, 0.0, 10.6, 0.0, 0.0, 'beverage', true, NOW(), NOW()),
  ('Limonata', 'Limonata', 'Lemonade', 40.0, 0.0, 10.0, 0.0, 0.0, 'beverage', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Statistics
SELECT COUNT(*) as total_foods FROM foods WHERE is_active = true;