/**
 * Diet Service - BMR, TDEE ve Makro Hesaplama Fonksiyonları
 * Notepad'teki plana göre implement edildi
 */

// Aktivite Katsayıları
const ACTIVITY_FACTORS = {
  sedentary: 1.2,           // Sedanter
  lightly_active: 1.375,    // Hafif Aktif (1-3 gün/hafta)
  moderately_active: 1.55,  // Orta Aktif (3-5 gün/hafta)
  very_active: 1.725,       // Yüksek Aktif (6-7 gün/hafta)
  extremely_active: 1.9     // Son Derece Aktif (günlük ağır iş/çift idman)
};

// Diyet Türü Makro Dağılımları
const DIET_MACRO_DISTRIBUTIONS = {
  balanced: {
    protein_g_per_kg: 1.8,
    fat_percentage: 0.30,
    name: 'balanced'
  },
  low_carb: {
    protein_g_per_kg: 2.0,
    fat_percentage: 0.40,
    name: 'low_carb'
  },
  high_protein: {
    protein_g_per_kg: 2.2,
    fat_percentage: 0.25,
    name: 'high_protein'
  },
  mediterranean: {
    protein_g_per_kg: 1.7,
    fat_percentage: 0.35,
    name: 'mediterranean'
  },
  ketogenic: {
    protein_g_per_kg: 1.6,
    fat_percentage: 0.70,
    name: 'ketogenic'
  }
};

/**
 * Mifflin-St Jeor BMR Hesaplama Formülü
 * @param {string} gender - 'male' veya 'female'
 * @param {number} weight - Kilo (kg)
 * @param {number} height - Boy (cm)
 * @param {number} age - Yaş
 * @returns {number} BMR (kcal/gün)
 */
export function calculateBMR_Mifflin(gender, weight, height, age) {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Katch-McArdle BMR Hesaplama Formülü (Yağsız Kütle Gerekli)
 * @param {number} fatFreeMass - Yağsız kütle (kg)
 * @returns {number} BMR (kcal/gün)
 */
export function calculateBMR_Katch(fatFreeMass) {
  return 370 + (21.6 * fatFreeMass);
}

/**
 * TDEE Hesaplama (BMR * Aktivite Katsayısı)
 * @param {number} bmr - BMR değeri
 * @param {string} activityLevel - Aktivite seviyesi
 * @returns {number} TDEE (kcal/gün)
 */
export function calculateTDEE(bmr, activityLevel) {
  const factor = ACTIVITY_FACTORS[activityLevel] || ACTIVITY_FACTORS.sedentary;
  return bmr * factor;
}

/**
 * Hedef Kalori Hesaplama (TDEE * Hedef Yüzdesi)
 * @param {number} tdee - TDEE değeri
 * @param {string} goalType - Hedef türü
 * @param {number} goalPercentage - Hedef yüzdesi (-25 ile +20 arası)
 * @returns {number} Hedef Kalori (kcal/gün)
 */
export function calculateTargetCalories(tdee, goalType, goalPercentage = 0) {
  let multiplier = 1;
  
  switch (goalType) {
    case 'lose_weight':
      multiplier = 1 + (goalPercentage / 100); // goalPercentage negatif olacak
      break;
    case 'maintain_weight':
      multiplier = 1;
      break;
    case 'gain_weight':
      multiplier = 1 + (goalPercentage / 100); // goalPercentage pozitif olacak
      break;
    default:
      multiplier = 1;
  }
  
  return Math.round(tdee * multiplier);
}

/**
 * Makro Dağılımı Hesaplama
 * @param {number} targetCalories - Hedef kalori
 * @param {number} weight - Kilo (kg)
 * @param {string} dietType - Diyet türü
 * @returns {Object} Makro dağılımı {protein_g, fat_g, carb_g, fiber_g}
 */
export function calculateMacros(targetCalories, weight, dietType = 'balanced') {
  const diet = DIET_MACRO_DISTRIBUTIONS[dietType] || DIET_MACRO_DISTRIBUTIONS.balanced;
  
  // Protein hesaplama (g/kg * kilo)
  const protein_g = Math.round(diet.protein_g_per_kg * weight);
  const protein_calories = protein_g * 4; // 4 kcal/g protein
  
  // Yağ hesaplama (toplam kalorinin yüzdesi)
  const fat_calories = targetCalories * diet.fat_percentage;
  const fat_g = Math.round(fat_calories / 9); // 9 kcal/g yağ
  
  // Karbonhidrat hesaplama (kalan kalori)
  const carb_calories = targetCalories - protein_calories - fat_calories;
  const carb_g = Math.round(carb_calories / 4); // 4 kcal/g karbonhidrat
  
  // Lif hedefi (14g / 1000 kcal)
  const fiber_g = Math.round(14 * (targetCalories / 1000));
  
  return {
    protein_g,
    fat_g,
    carb_g,
    fiber_g,
    protein_calories: Math.round(protein_calories),
    fat_calories: Math.round(fat_calories),
    carb_calories: Math.round(carb_calories),
    total_calories: Math.round(protein_calories + fat_calories + carb_calories)
  };
}

/**
 * Kapsamlı Diyet Hesaplama (Tüm parametreleri bir arada)
 * @param {Object} userData - Kullanıcı verileri
 * @returns {Object} Tam diyet hesaplaması
 */
export function calculateDietPlan(userData) {
  const {
    gender,
    weight,
    height,
    age,
    activityLevel,
    goalType,
    goalPercentage,
    dietType,
    bodyFatPercentage = null
  } = userData;
  
  // BMR hesaplama
  let bmr;
  if (bodyFatPercentage && bodyFatPercentage > 0) {
    // Yağsız kütle hesaplama
    const fatFreeMass = weight * (1 - bodyFatPercentage / 100);
    bmr = calculateBMR_Katch(fatFreeMass);
  } else {
    // Mifflin formülü kullan
    bmr = calculateBMR_Mifflin(gender, weight, height, age);
  }
  
  // TDEE hesaplama
  const tdee = calculateTDEE(bmr, activityLevel);
  
  // Hedef kalori hesaplama
  const targetCalories = calculateTargetCalories(tdee, goalType, goalPercentage);
  
  // Makro dağılımı hesaplama
  const macros = calculateMacros(targetCalories, weight, dietType);
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    macros,
    goalType,
    dietType,
    activityLevel,
    calculated_at: new Date().toISOString()
  };
}

/**
 * Hedef Yüzdesi Önerileri
 * @param {string} goalType - Hedef türü
 * @returns {Array} Önerilen yüzde seçenekleri
 */
export function getGoalPercentageOptions(goalType) {
  switch (goalType) {
    case 'lose_weight':
      return [
        { label: 'Hafif Kesim (-10%)', value: -10 },
        { label: 'Orta Kesim (-15%)', value: -15 },
        { label: 'Agresif Kesim (-25%)', value: -25 }
      ];
    case 'maintain_weight':
      return [
        { label: 'Koruma (0%)', value: 0 }
      ];
    case 'gain_weight':
      return [
        { label: 'Hafif Artış (+5%)', value: 5 },
        { label: 'Orta Artış (+10%)', value: 10 },
        { label: 'Agresif Artış (+20%)', value: 20 }
      ];
    default:
      return [{ label: 'Koruma (0%)', value: 0 }];
  }
}

/**
 * Aktivite Seviyesi Açıklamaları
 * @param {string} activityLevel - Aktivite seviyesi
 * @returns {string} Açıklama
 */
export function getActivityLevelDescription(activityLevel) {
  const descriptions = {
    sedentary: 'Günlük aktivite yok, masa başı iş',
    lightly_active: 'Hafif egzersiz 1-3 gün/hafta',
    moderately_active: 'Orta egzersiz 3-5 gün/hafta',
    very_active: 'Yoğun egzersiz 6-7 gün/hafta',
    extremely_active: 'Günlük ağır iş veya çift idman'
  };
  
  return descriptions[activityLevel] || descriptions.sedentary;
}

/**
 * Diyet Türü Açıklamaları
 * @param {string} dietType - Diyet türü
 * @returns {string} Açıklama
 */
export function getDietTypeDescription(dietType) {
  const descriptions = {
    balanced: 'Dengeli makro dağılımı, sürdürülebilir',
    low_carb: 'Düşük karbonhidrat, yüksek yağ',
    high_protein: 'Yüksek protein, kas gelişimi odaklı',
    mediterranean: 'Akdeniz diyeti, zeytinyağı ağırlıklı',
    ketogenic: 'Çok düşük karbonhidrat, ketozis'
  };
  
  return descriptions[dietType] || descriptions.balanced;
}

/**
 * Makro Durumu Değerlendirme
 * @param {Object} consumed - Tüketilen makrolar
 * @param {Object} targets - Hedef makrolar
 * @returns {Object} Durum değerlendirmesi
 */
export function evaluateMacroStatus(consumed, targets) {
  const proteinStatus = evaluateMacroItem(consumed.protein_g, targets.protein_g);
  const fatStatus = evaluateMacroItem(consumed.fat_g, targets.fat_g);
  const carbStatus = evaluateMacroItem(consumed.carb_g, targets.carb_g);
  const calorieStatus = evaluateMacroItem(consumed.calories, targets.calories);
  
  return {
    protein: proteinStatus,
    fat: fatStatus,
    carbs: carbStatus,
    calories: calorieStatus,
    overall: calculateOverallStatus([proteinStatus, fatStatus, carbStatus, calorieStatus])
  };
}

/**
 * Tek Makro İtem Durumu
 * @param {number} consumed - Tüketilen miktar
 * @param {number} target - Hedef miktar
 * @returns {Object} Durum bilgisi
 */
function evaluateMacroItem(consumed, target) {
  const percentage = target > 0 ? (consumed / target) * 100 : 0;
  let status = 'under';
  let color = 'warning';
  
  if (percentage >= 90 && percentage <= 110) {
    status = 'on_target';
    color = 'success';
  } else if (percentage > 110) {
    status = 'over';
    color = 'error';
  } else if (percentage < 70) {
    status = 'under';
    color = 'warning';
  }
  
  return {
    consumed,
    target,
    percentage: Math.round(percentage),
    status,
    color,
    remaining: target - consumed
  };
}

/**
 * Genel Durum Hesaplama
 * @param {Array} statuses - Tüm makro durumları
 * @returns {string} Genel durum
 */
function calculateOverallStatus(statuses) {
  const onTargetCount = statuses.filter(s => s.status === 'on_target').length;
  const totalCount = statuses.length;
  
  if (onTargetCount === totalCount) return 'excellent';
  if (onTargetCount >= totalCount * 0.75) return 'good';
  if (onTargetCount >= totalCount * 0.5) return 'fair';
  return 'needs_improvement';
}

/**
 * Örnek Kullanıcı Verisi ile Test
 */
export function getExampleCalculation() {
  const exampleUser = {
    gender: 'male',
    weight: 75,
    height: 178,
    age: 24,
    activityLevel: 'moderately_active',
    goalType: 'lose_weight',
    goalPercentage: -15,
    dietType: 'balanced'
  };
  
  return calculateDietPlan(exampleUser);
}

// Test fonksiyonu
export function testDietCalculations() {
  
  const result = getExampleCalculation();
  
  const bmr = calculateBMR_Mifflin('male', 75, 178, 24);
  
  const tdee = calculateTDEE(bmr, 'moderately_active');
  
  const targetCal = calculateTargetCalories(tdee, 'lose_weight', -15);
  
  const macros = calculateMacros(targetCal, 75, 'balanced');
  
  return result;
}







