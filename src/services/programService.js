import { supabase } from '../config/supabase';

// Egzersizleri getir
export const getExercises = async (userId, dayOfWeek = null) => {
  try {
    let query = supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (dayOfWeek !== null) {
      query = query.eq('day_of_week', dayOfWeek);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // is_completed'ı completed'a da map et (uyumluluk için)
    const exercisesWithCompleted = (data || []).map(ex => ({
      ...ex,
      completed: ex.is_completed
    }));
    
    return exercisesWithCompleted;
  } catch (error) {
    console.error('Egzersizleri getirme hatası:', error);
    return [];
  }
};

// Egzersiz ekle
export const addExercise = async (userId, exerciseData) => {
  try {
    console.log('➕ Egzersiz ekleniyor:', exerciseData);
    
    const exercisePayload = {
      user_id: userId,
      name: exerciseData.name,
      sets: exerciseData.sets,
      reps: exerciseData.reps,
      weight: exerciseData.weight,
      category: exerciseData.category,
      day_of_week: exerciseData.dayOfWeek,
      is_completed: false // Varsayılan olarak tamamlanmamış
    };

    // program_id varsa ekle
    if (exerciseData.program_id) {
      exercisePayload.program_id = exerciseData.program_id;
    }

    console.log('📤 Supabase\'e gönderilen veri:', exercisePayload);
    console.log('📤 Program ID kontrolü:', exercisePayload.program_id);

    const { data, error } = await supabase
      .from('exercises')
      .insert([exercisePayload])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase hata:', error);
      console.error('❌ Hata detayı:', error.message, error.code);
      throw error;
    }
    
    console.log('✅ Egzersiz başarıyla eklendi:', data);
    console.log('✅ Eklenen program_id:', data.program_id);
    
    // completed property'si ekle (uyumluluk için)
    return { ...data, completed: data.is_completed };
  } catch (error) {
    console.error('❌ Egzersiz ekleme hatası:', error);
    throw error;
  }
};

// Egzersiz güncelle
export const updateExercise = async (exerciseId, exerciseData) => {
  try {
    console.log('✏️ Egzersiz güncelleniyor:', exerciseId, exerciseData);
    
    const updatePayload = {
      name: exerciseData.name,
      sets: exerciseData.sets,
      reps: exerciseData.reps,
      weight: exerciseData.weight,
      category: exerciseData.category,
      updated_at: new Date().toISOString()
    };

    // program_id varsa ekle
    if (exerciseData.program_id) {
      updatePayload.program_id = exerciseData.program_id;
    }

    // is_completed kolonu varsa ekle
    if (exerciseData.completed !== undefined) {
      updatePayload.is_completed = exerciseData.completed;
    }

    const { data, error } = await supabase
      .from('exercises')
      .update(updatePayload)
      .eq('id', exerciseId)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase güncelleme hatası:', error);
      throw error;
    }
    
    console.log('✅ Egzersiz başarıyla güncellendi:', data);
    // completed property'si ekle (uyumluluk için)
    return { ...data, completed: data.is_completed };
  } catch (error) {
    console.error('❌ Egzersiz güncelleme hatası:', error);
    throw error;
  }
};

// Egzersiz sil
export const deleteExercise = async (exerciseId) => {
  try {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Egzersiz silme hatası:', error);
    throw error;
  }
};

// Egzersiz tamamlama durumunu değiştir
export const toggleExerciseCompletion = async (exerciseId, completed) => {
  try {
    console.log('🔄 Egzersiz durumu değiştiriliyor:', exerciseId, completed);
    
    // is_completed kolonu kullan
    const updatePayload = {
      is_completed: completed,
      updated_at: new Date().toISOString()
    };

    if (completed) {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('exercises')
      .update(updatePayload)
      .eq('id', exerciseId)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase durum güncelleme hatası:', error);
      // Hata olsa bile local state için veri döndür
      return { id: exerciseId, is_completed: completed, completed: completed };
    }
    
    console.log('✅ Egzersiz durumu başarıyla güncellendi:', data);
    return { ...data, completed: data.is_completed };
  } catch (error) {
    console.error('❌ Egzersiz durumu güncelleme hatası:', error);
    
    // Hata durumunda da local state için veri döndür
    return { id: exerciseId, completed: completed };
  }
};

// Haftalık program oluştur
export const createWeeklyProgram = async (userId, programData) => {
  try {
    const { data, error } = await supabase
      .from('workout_programs')
      .insert([
        {
          user_id: userId,
          name: programData.name,
          description: programData.description,
          is_active: true,
          is_custom: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    // Programın egzersizlerini ekle
    const exercisesToInsert = [];
    programData.dayExercises.forEach((dayExercises, dayIndex) => {
      if (dayExercises && dayExercises.length > 0) {
        dayExercises.forEach(exercise => {
          exercisesToInsert.push({
            user_id: userId,
            program_id: data.id,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            category: exercise.category || 'Genel',
            day_of_week: dayIndex,
            is_completed: false
          });
        });
      }
    });

    if (exercisesToInsert.length > 0) {
      const { error: exerciseError } = await supabase
        .from('exercises')
        .insert(exercisesToInsert);

      if (exerciseError) throw exerciseError;
    }
    
    return data;
  } catch (error) {
    console.error('Haftalık program oluşturma hatası:', error);
    throw error;
  }
};

// Kullanıcının programlarını getir
export const getUserPrograms = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('workout_programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Programları getirme hatası:', error);
    return [];
  }
};

// Kullanıcının aktif programını getir
export const getActiveProgram = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('workout_programs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Hiç aktif program yok
        console.log('⚠️ Kullanıcının aktif programı yok');
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Aktif program getirme hatası:', error);
    return null;
  }
};

// Varsayılan program oluştur
export const createDefaultProgram = async (userId) => {
  try {
    console.log('🆕 Varsayılan program oluşturuluyor, userId:', userId);
    
    const { data, error } = await supabase
      .from('workout_programs')
      .insert([
        {
          user_id: userId,
          name: 'Kişisel Antrenman Programı',
          description: 'Otomatik oluşturulan varsayılan program',
          is_active: true,
          is_custom: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Varsayılan program oluşturma hatası:', error);
      throw error;
    }
    
    console.log('✅ Varsayılan program oluşturuldu:', data);
    return data;
  } catch (error) {
    console.error('❌ Varsayılan program oluşturma hatası:', error);
    throw error;
  }
};

// Günlük istatistikleri getir
export const getDailyStats = async (userId, dayOfWeek) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek);

    if (error) throw error;
    
    const totalExercises = data.length;
    const completedExercises = data.filter(ex => ex.is_completed).length;
    
    // Egzersizlere completed property'si ekle (uyumluluk için)
    const exercisesWithCompleted = data.map(ex => ({
      ...ex,
      completed: ex.is_completed
    }));
    
    return {
      total: totalExercises,
      completed: completedExercises,
      exercises: exercisesWithCompleted
    };
  } catch (error) {
    console.error('Günlük istatistik hatası:', error);
    return { total: 0, completed: 0, exercises: [] };
  }
};

// Haftalık istatistikleri getir
export const getWeeklyStats = async (userId) => {
  try {
    console.log('📊 Haftalık istatistikler getiriliyor, userId:', userId);
    
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase hata:', error);
      throw error;
    }
    
    console.log('📊 Supabase\'den gelen veri:', data);
    
    const weeklyStats = {};
    
    // Her gün için istatistikleri hesapla
    for (let day = 0; day < 7; day++) {
      const dayExercises = (data || []).filter(ex => ex.day_of_week === day);
      // Egzersizlere completed property'si ekle (uyumluluk için)
      const exercisesWithCompleted = dayExercises.map(ex => ({
        ...ex,
        completed: ex.is_completed
      }));
      
      weeklyStats[day] = {
        total: dayExercises.length,
        completed: dayExercises.filter(ex => ex.is_completed).length,
        exercises: exercisesWithCompleted
      };
    }
    
    console.log('📊 Haftalık istatistikler hazırlandı:', weeklyStats);
    return weeklyStats;
  } catch (error) {
    console.error('Haftalık istatistik hatası:', error);
    // Hata durumunda boş istatistikler döndür
    const emptyStats = {};
    for (let day = 0; day < 7; day++) {
      emptyStats[day] = { total: 0, completed: 0, exercises: [] };
    }
    return emptyStats;
  }
};
