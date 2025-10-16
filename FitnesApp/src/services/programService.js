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

// Haftalık istatistikleri getir (sadece BU HAFTA için tamamlanma durumu)
export const getWeeklyStats = async (userId, weekOffset = 0) => {
  try {
    console.log('📊 Haftalık istatistikler getiriliyor, userId:', userId, 'weekOffset:', weekOffset);
    
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase hata:', error);
      throw error;
    }
    
    console.log('📊 Supabase\'den gelen veri:', data);
    
    // Bu haftanın başlangıç ve bitiş tarihlerini hesapla
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + diffToMonday + (weekOffset * 7));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    console.log('📅 Hafta aralığı:', weekStart.toDateString(), '-', weekEnd.toDateString());
    
    const weeklyStats = {};
    
    // Her gün için istatistikleri hesapla
    for (let day = 0; day < 7; day++) {
      const dayExercises = (data || []).filter(ex => ex.day_of_week === day);
      
      // Egzersizlere completed property'si ekle - SADECE bu hafta tamamlanmışsa
      const exercisesWithCompleted = dayExercises.map(ex => {
        let isCompletedThisWeek = false;
        
        // Eğer tamamlanmışsa ve tamamlanma tarihi bu hafta içindeyse
        if (ex.is_completed && ex.completed_at) {
          const completedDate = new Date(ex.completed_at);
          isCompletedThisWeek = completedDate >= weekStart && completedDate <= weekEnd;
        }
        
        return {
          ...ex,
          completed: isCompletedThisWeek // Sadece bu hafta tamamlanmışsa true
        };
      });
      
      weeklyStats[day] = {
        total: dayExercises.length,
        completed: exercisesWithCompleted.filter(ex => ex.completed).length,
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

// ========================================
// HAZIR PROGRAMLAR FONKSİYONLARI
// ========================================

// Tüm hazır programları getir
export const getTemplatePrograms = async () => {
  try {
    console.log('📋 Hazır programlar getiriliyor...');
    
    const { data, error } = await supabase
      .from('template_programs')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Hazır programlar hatası:', error);
      throw error;
    }
    
    // Seviyeleri doğru sırayla sırala: Başlangıç -> Orta -> İleri
    const levelOrder = {
      'Başlangıç': 1,
      'Beginner': 1,
      'Orta': 2,
      'Intermediate': 2,
      'İleri': 3,
      'Advanced': 3
    };
    
    const sortedData = (data || []).sort((a, b) => {
      const orderA = levelOrder[a.level] || 999;
      const orderB = levelOrder[b.level] || 999;
      return orderA - orderB;
    });
    
    console.log('✅ Hazır programlar getirildi ve sıralandı:', sortedData);
    return sortedData;
  } catch (error) {
    console.error('❌ Hazır programlar getirme hatası:', error);
    return [];
  }
};

// Belirli bir programın günlerini ve egzersizlerini getir
export const getTemplateProgramDetails = async (programId) => {
  try {
    console.log('📋 Program detayları getiriliyor, programId:', programId);
    
    // Program günlerini getir
    const { data: days, error: daysError } = await supabase
      .from('template_program_days')
      .select('*')
      .eq('template_program_id', programId)
      .order('day_number', { ascending: true });

    if (daysError) {
      console.error('❌ Program günleri getirme hatası:', daysError);
      throw daysError;
    }

    console.log('📅 Program günleri sayısı:', days?.length || 0);
    if (!days || days.length === 0) {
      console.error('⚠️ Program günü bulunamadı! Template program doğru kurulmamış olabilir.');
      return [];
    }

    // Her gün için egzersizleri getir
    const daysWithExercises = await Promise.all(
      (days || []).map(async (day) => {
        console.log(`  📅 ${day.day_name} (Gün ${day.day_number}) için egzersizler getiriliyor...`);
        
        const { data: exercises, error: exercisesError } = await supabase
          .from('template_exercises')
          .select('*')
          .eq('template_program_day_id', day.id)
          .order('order_index', { ascending: true });

        if (exercisesError) {
          console.error('❌ Egzersizler getirme hatası:', exercisesError);
          return { ...day, exercises: [] };
        }

        console.log(`    ✅ ${exercises?.length || 0} egzersiz bulundu`);
        return { ...day, exercises: exercises || [] };
      })
    );

    console.log('✅ Program detayları getirildi. Toplam gün:', daysWithExercises.length);
    return daysWithExercises;
  } catch (error) {
    console.error('❌ Program detayları getirme hatası:', error);
    console.error('❌ Hata detayı:', error.message);
    return [];
  }
};

// Hazır programı kullanıcıya kopyala (aktif programa dönüştür)
export const copyTemplateProgramToUser = async (userId, templateProgramId) => {
  try {
    console.log('📋 Hazır program kullanıcıya kopyalanıyor...');
    
    // Önce programın detaylarını al
    const { data: templateProgram, error: programError } = await supabase
      .from('template_programs')
      .select('*')
      .eq('id', templateProgramId)
      .single();

    if (programError) throw programError;

    // Kullanıcının eski aktif programlarını pasif yap
    await supabase
      .from('workout_programs')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Yeni program oluştur
    const { data: newProgram, error: newProgramError } = await supabase
      .from('workout_programs')
      .insert([
        {
          user_id: userId,
          name: templateProgram.name,
          description: templateProgram.description,
          is_active: true,
          is_custom: false,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (newProgramError) throw newProgramError;

    // Program günlerini ve egzersizlerini kopyala
    console.log('📥 Program detayları getiriliyor...');
    console.log('🔑 User ID:', userId);
    console.log('📋 Template Program ID:', templateProgramId);
    
    const programDays = await getTemplateProgramDetails(templateProgramId);
    console.log('📋 Program günleri:', programDays.length, 'gün');
    console.log('📋 Program Days Data:', JSON.stringify(programDays, null, 2));
    
    const exercisesToInsert = [];
    programDays.forEach((day) => {
      console.log(`  📅 ${day.day_name} (Gün ${day.day_number}): ${day.exercises?.length || 0} egzersiz`);
      if (day.exercises && day.exercises.length > 0) {
        day.exercises.forEach((exercise, idx) => {
          const exerciseData = {
            user_id: userId,
            program_id: newProgram.id,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight || '0kg',
            category: exercise.category || 'Üst Vücut',
            day_of_week: day.day_number,
            is_completed: false
          };
          console.log(`    ${idx + 1}. ${exercise.name} - Gün: ${day.day_number}`);
          exercisesToInsert.push(exerciseData);
        });
      }
    });

    console.log('💾 Toplam eklenecek egzersiz sayısı:', exercisesToInsert.length);
    console.log('📦 Exercises to insert:', JSON.stringify(exercisesToInsert.slice(0, 2), null, 2)); // İlk 2 egzersizi göster

    if (exercisesToInsert.length > 0) {
      console.log('⏳ Egzersizler Supabase\'e ekleniyor...');
      const { data: insertedExercises, error: exerciseError } = await supabase
        .from('exercises')
        .insert(exercisesToInsert)
        .select();

      if (exerciseError) {
        console.error('❌ Egzersiz ekleme hatası:', exerciseError);
        console.error('❌ Hata detayı:', JSON.stringify(exerciseError, null, 2));
        throw exerciseError;
      }
      
      console.log('✅ Eklenen egzersiz sayısı:', insertedExercises?.length || 0);
      console.log('✅ İlk eklenen egzersiz:', insertedExercises?.[0]);
    } else {
      console.warn('⚠️ Eklenecek egzersiz bulunamadı!');
      console.warn('⚠️ Program Days:', programDays);
    }

    console.log('✅ Hazır program başarıyla kopyalandı:', newProgram);
    
    // SON KONTROL: Gerçekten eklendi mi?
    console.log('🔍 Son kontrol: Eklenen egzersizleri doğrulama...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', newProgram.id);
    
    if (verifyError) {
      console.error('❌ Doğrulama hatası:', verifyError);
    } else {
      console.log('✅ Doğrulama: Veritabanında', verifyData?.length || 0, 'egzersiz bulundu');
      if (verifyData && verifyData.length > 0) {
        console.log('📋 İlk 3 egzersiz:');
        verifyData.slice(0, 3).forEach((ex, idx) => {
          console.log(`  ${idx + 1}. ${ex.name} - Gün ${ex.day_of_week}`);
        });
      }
    }
    
    return newProgram;
  } catch (error) {
    console.error('❌ Hazır program kopyalama hatası:', error);
    throw error;
  }
};
