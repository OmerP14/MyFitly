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
    const { data, error } = await supabase.rpc('add_weight_entry', {
      user_id_param: userId,
      weight_param: weight,
      measurement_date_param: measurementDate || new Date().toISOString().split('T')[0],
      notes_param: notes
    });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.rpc('update_weight_entry', {
      entry_id_param: entryId,
      user_id_param: userId,
      weight_param: weight,
      measurement_date_param: measurementDate,
      notes_param: notes
    });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.rpc('delete_weight_entry', {
      entry_id_param: entryId,
      user_id_param: userId
    });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.rpc('add_strength_entry', {
      user_id_param: userId,
      exercise_name_param: exerciseName,
      max_weight_param: maxWeight,
      max_reps_param: maxReps,
      measurement_date_param: measurementDate || new Date().toISOString().split('T')[0],
      notes_param: notes
    });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.rpc('get_strength_data', {
      user_id_param: userId,
      period_type: periodType,
      exercise_name_param: exerciseName
    });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.rpc('get_exercise_max_weights', {
      user_id_param: userId
    });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.rpc('update_strength_entry', {
      entry_id_param: entryId,
      user_id_param: userId,
      exercise_name_param: exerciseName,
      max_weight_param: maxWeight,
      max_reps_param: maxReps,
      measurement_date_param: measurementDate,
      notes_param: notes
    });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.rpc('delete_strength_entry', {
      entry_id_param: entryId,
      user_id_param: userId
    });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.rpc('bulk_add_weight_entries', {
      user_id_param: userId,
      entries: JSON.stringify(entries)
    });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.rpc('bulk_add_strength_entries', {
      user_id_param: userId,
      entries: JSON.stringify(entries)
    });

    if (error) throw error;
    return data;
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
