/**
 * TRACKING SERVICE
 * TrackingScreen için Supabase CRUD işlemleri
 */

import { supabase } from '../config/supabase';

// ================================================
// KİLO TAKİBİ (WEIGHT TRACKING)
// ================================================

/**
 * Yeni kilo verisi ekler
 * @param {string} userId - Kullanıcı ID
 * @param {number} weight - Kilo (kg)
 * @param {string} measurementDate - Ölçüm tarihi (YYYY-MM-DD)
 * @param {string} notes - Notlar (opsiyonel)
 */
export const addWeightEntry = async (userId, weight, measurementDate = null, notes = null) => {
  try {
    const insertPayload = {
      user_id: userId,
      weight: parseFloat(weight),
      measurement_date: (measurementDate || new Date().toISOString().split('T')[0]),
      notes: notes || null
    };

    const { data, error } = await supabase
      .from('weight_tracking')
      .insert([insertPayload])
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Kilo ekleme hatası:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Kilo verilerini getirir (period bazlı)
 * @param {string} userId - Kullanıcı ID
 * @param {string} periodType - 'weekly', 'monthly', 'yearly'
 */
export const getWeightData = async (userId, periodType = 'monthly') => {
  try {
    // Doğrudan Supabase sorgusu kullan (RPC yerine)
    const { data, error } = await supabase
      .from('weight_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: true }) // Tarih sırasına göre sırala (eski → yeni)
      .order('created_at', { ascending: true }); // Aynı tarihte birden fazla kayıt varsa oluşturulma sırasına göre

    if (error) throw error;
    
    console.log('📊 Kilo verileri getirildi:', { userId, periodType, count: data?.length || 0 });
    
    return {
      success: true,
      data: data || [],
      stats: {
        totalEntries: data?.length || 0,
        periodType: periodType
      }
    };
  } catch (error) {
    console.error('Kilo verileri getirme hatası:', error);
    return {
      success: false,
      message: error.message,
      data: [],
      stats: {}
    };
  }
};

/**
 * Kilo verisini günceller
 * @param {string} entryId - Kayıt ID
 * @param {string} userId - Kullanıcı ID
 * @param {number} weight - Yeni kilo
 * @param {string} measurementDate - Yeni ölçüm tarihi
 * @param {string} notes - Yeni notlar
 */
export const updateWeightEntry = async (entryId, userId, weight = null, measurementDate = null, notes = null) => {
  try {
    const updates = {};
    if (weight !== null && weight !== undefined) updates.weight = parseFloat(weight);
    if (measurementDate) updates.measurement_date = measurementDate;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('weight_tracking')
      .update(updates)
      .eq('id', entryId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Kilo güncelleme hatası:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Kilo verisini siler
 * @param {string} entryId - Kayıt ID
 * @param {string} userId - Kullanıcı ID
 */
export const deleteWeightEntry = async (entryId, userId) => {
  try {
    const { error } = await supabase
      .from('weight_tracking')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Kilo silme hatası:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// ================================================
// AĞIRLIK/GÜÇ TAKİBİ (STRENGTH TRACKING)
// ================================================

/**
 * Yeni ağırlık verisi ekler
 * @param {string} userId - Kullanıcı ID
 * @param {string} exerciseName - Egzersiz adı
 * @param {number} maxWeight - Maksimum ağırlık (kg)
 * @param {number} maxReps - Tekrar sayısı
 * @param {string} measurementDate - Ölçüm tarihi (YYYY-MM-DD)
 * @param {string} notes - Notlar (opsiyonel)
 */
export const addStrengthEntry = async (
  userId, 
  exerciseName, 
  maxWeight, 
  maxReps = 1, 
  measurementDate = null, 
  notes = null
) => {
  try {
    const insertPayload = {
      user_id: userId,
      exercise_name: exerciseName,
      max_weight: parseFloat(maxWeight),
      max_reps: parseInt(maxReps),
      measurement_date: (measurementDate || new Date().toISOString().split('T')[0]),
      notes: notes || null
    };

    const { data, error } = await supabase
      .from('strength_tracking')
      .insert([insertPayload])
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Ağırlık ekleme hatası:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Ağırlık verilerini getirir (period bazlı)
 * @param {string} userId - Kullanıcı ID
 * @param {string} periodType - 'weekly', 'monthly', 'yearly'
 * @param {string} exerciseName - Belirli bir egzersiz (opsiyonel)
 */
export const getStrengthData = async (userId, periodType = 'monthly', exerciseName = null) => {
  try {
    let query = supabase
      .from('strength_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (exerciseName) {
      query = query.eq('exercise_name', exerciseName);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    console.log('📊 Ağırlık verileri getirildi:', { userId, periodType, exerciseName, count: data?.length || 0 });
    
    return {
      success: true,
      data: data || [],
      stats: {
        totalEntries: data?.length || 0,
        periodType: periodType
      }
    };
  } catch (error) {
    console.error('Ağırlık verileri getirme hatası:', error);
    return {
      success: false,
      message: error.message,
      data: [],
      stats: {}
    };
  }
};

/**
 * Egzersiz bazlı maksimum ağırlıkları getirir
 * @param {string} userId - Kullanıcı ID
 */
export const getExerciseMaxWeights = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('strength_tracking')
      .select('exercise_name, max_weight, measurement_date')
      .eq('user_id', userId)
      .order('exercise_name', { ascending: true })
      .order('max_weight', { ascending: false });

    if (error) throw error;

    // Egzersiz bazında grupla ve maksimum değerleri al
    const groupedData = {};
    (data || []).forEach(item => {
      if (!groupedData[item.exercise_name] || item.max_weight > groupedData[item.exercise_name].max_weight) {
        groupedData[item.exercise_name] = {
          exercise_name: item.exercise_name,
          max_weight: item.max_weight,
          last_measurement_date: item.measurement_date
        };
      }
    });

    const result = Object.values(groupedData);
    
    return {
      success: true,
      data: result,
      count: result.length
    };
  } catch (error) {
    console.error('Max ağırlıklar getirme hatası:', error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
};

/**
 * Ağırlık verisini günceller
 * @param {string} entryId - Kayıt ID
 * @param {string} userId - Kullanıcı ID
 * @param {string} exerciseName - Yeni egzersiz adı
 * @param {number} maxWeight - Yeni maksimum ağırlık
 * @param {number} maxReps - Yeni tekrar sayısı
 * @param {string} measurementDate - Yeni ölçüm tarihi
 * @param {string} notes - Yeni notlar
 */
export const updateStrengthEntry = async (
  entryId, 
  userId, 
  exerciseName = null,
  maxWeight = null,
  maxReps = null,
  measurementDate = null,
  notes = null
) => {
  try {
    const updates = {};
    if (exerciseName) updates.exercise_name = exerciseName;
    if (maxWeight !== null && maxWeight !== undefined) updates.max_weight = parseFloat(maxWeight);
    if (maxReps !== null && maxReps !== undefined) updates.max_reps = parseInt(maxReps);
    if (measurementDate) updates.measurement_date = measurementDate;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('strength_tracking')
      .update(updates)
      .eq('id', entryId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Ağırlık güncelleme hatası:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Ağırlık verisini siler
 * @param {string} entryId - Kayıt ID
 * @param {string} userId - Kullanıcı ID
 */
export const deleteStrengthEntry = async (entryId, userId) => {
  try {
    const { error } = await supabase
      .from('strength_tracking')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Ağırlık silme hatası:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// ================================================
// KOMBİNE İSTATİSTİKLER
// ================================================

/**
 * Tracking dashboard için tüm istatistikleri getirir
 * @param {string} userId - Kullanıcı ID
 */
export const getTrackingDashboardStats = async (userId) => {
  try {
    // Direkt tablolardan veri çek (RPC yerine)
    const { data: weightData, error: weightError } = await supabase
      .from('weight_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .limit(5);

    const { data: strengthData, error: strengthError } = await supabase
      .from('strength_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .limit(5);

    if (weightError || strengthError) {
      throw weightError || strengthError;
    }

    return {
      success: true,
      stats: {
        totalWeightEntries: weightData?.length || 0,
        totalStrengthEntries: strengthData?.length || 0
      },
      recent_entries: {
        weight: weightData || [],
        strength: strengthData || []
      }
    };
  } catch (error) {
    console.error('Dashboard istatistikleri getirme hatası:', error);
    return {
      success: false,
      message: error.message,
      stats: {},
      recent_entries: []
    };
  }
};

// ================================================
// TOPLU İŞLEMLER
// ================================================

/**
 * Birden fazla kilo verisi ekler
 * @param {string} userId - Kullanıcı ID
 * @param {Array} entries - Kilo verileri dizisi
 * Örnek: [{ weight: 73.2, measurement_date: '2025-10-08', notes: 'Sabah' }]
 */
export const bulkAddWeightEntries = async (userId, entries) => {
  try {
    const prepared = (entries || []).map(e => ({
      user_id: userId,
      weight: parseFloat(e.weight),
      measurement_date: e.measurement_date || new Date().toISOString().split('T')[0],
      notes: e.notes || null
    }));

    const { error } = await supabase
      .from('weight_tracking')
      .insert(prepared);

    if (error) throw error;
    return { success: true, added_count: prepared.length };
  } catch (error) {
    console.error('Toplu kilo ekleme hatası:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Birden fazla ağırlık verisi ekler
 * @param {string} userId - Kullanıcı ID
 * @param {Array} entries - Ağırlık verileri dizisi
 * Örnek: [{ exercise_name: 'Bench Press', max_weight: 65, max_reps: 8, measurement_date: '2025-10-08' }]
 */
export const bulkAddStrengthEntries = async (userId, entries) => {
  try {
    const prepared = (entries || []).map(e => ({
      user_id: userId,
      exercise_name: e.exercise_name,
      max_weight: parseFloat(e.max_weight),
      max_reps: parseInt(e.max_reps || 1),
      measurement_date: e.measurement_date || new Date().toISOString().split('T')[0],
      notes: e.notes || null
    }));

    const { error } = await supabase
      .from('strength_tracking')
      .insert(prepared);

    if (error) throw error;
    return { success: true, added_count: prepared.length };
  } catch (error) {
    console.error('Toplu ağırlık ekleme hatası:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Grafik için formatlı veri döndürür
 * @param {Array} rawData - Ham veri dizisi
 * @param {string} dataType - 'weight' veya 'strength'
 */
export const formatDataForChart = (rawData, dataType = 'weight') => {
  if (!rawData || rawData.length === 0) {
    return {
      labels: [],
      datasets: [{ data: [0] }]
    };
  }

  if (dataType === 'weight') {
    return {
      labels: rawData.map(item => {
        const date = new Date(item.measurement_date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [{
        data: rawData.map(item => parseFloat(item.weight))
      }]
    };
  } else {
    // Strength data için egzersiz isimlerine göre gruplama
    const groupedData = {};
    rawData.forEach(item => {
      if (!groupedData[item.exercise_name]) {
        groupedData[item.exercise_name] = [];
      }
      groupedData[item.exercise_name].push(item.max_weight);
    });

    return {
      labels: Object.keys(groupedData),
      datasets: [{
        data: Object.values(groupedData).map(weights => 
          Math.max(...weights) // Her egzersiz için maksimum değeri al
        )
      }]
    };
  }
};

/**
 * Period türüne göre tarih aralığı döndürür
 * @param {string} periodType - 'weekly', 'monthly', 'yearly'
 */
export const getDateRangeByPeriod = (periodType) => {
  const today = new Date();
  const startDate = new Date();

  switch (periodType) {
    case 'weekly':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'monthly':
      startDate.setDate(today.getDate() - 30);
      break;
    case 'yearly':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    default:
      startDate.setDate(today.getDate() - 30);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
  };
};

/**
 * Egzersiz adından tekrar/ağırlık bilgisini parse eder
 * Örnek: "8x65kg" -> { reps: 8, weight: 65 }
 * @param {string} repsWeightString - Tekrar/ağırlık string'i
 */
export const parseRepsAndWeight = (repsWeightString) => {
  if (!repsWeightString) return { reps: 0, weight: 0 };

  const match = repsWeightString.match(/(\d+)x(\d+(?:\.\d+)?)kg/i);
  
  if (match) {
    return {
      reps: parseInt(match[1]),
      weight: parseFloat(match[2])
    };
  }

  return { reps: 0, weight: 0 };
};

/**
 * Hedef ilerleme yüzdesini hesaplar
 * @param {number} currentWeight - Mevcut kilo
 * @param {number} targetWeight - Hedef kilo
 * @param {number} startWeight - Başlangıç kilosu (opsiyonel)
 */
export const calculateGoalProgress = (currentWeight, targetWeight, startWeight = null) => {
  if (!currentWeight || !targetWeight) return 0;

  if (startWeight) {
    const totalProgress = startWeight - targetWeight;
    const currentProgress = startWeight - currentWeight;
    return Math.min(100, Math.max(0, (currentProgress / totalProgress) * 100));
  } else {
    // Başlangıç kilosu yoksa basit hesaplama
    return Math.min(100, Math.max(0, 
      100 - ((currentWeight - targetWeight) * 100 / currentWeight)
    ));
  }
};

export default {
  // Weight tracking
  addWeightEntry,
  getWeightData,
  updateWeightEntry,
  deleteWeightEntry,
  
  // Strength tracking
  addStrengthEntry,
  getStrengthData,
  getExerciseMaxWeights,
  updateStrengthEntry,
  deleteStrengthEntry,
  
  // Combined stats
  getTrackingDashboardStats,
  
  // Bulk operations
  bulkAddWeightEntries,
  bulkAddStrengthEntries,
  
  // Helpers
  formatDataForChart,
  getDateRangeByPeriod,
  parseRepsAndWeight,
  calculateGoalProgress
};
