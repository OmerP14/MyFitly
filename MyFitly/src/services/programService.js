import { supabase } from '../config/supabase';

// Egzersizleri getir
export const getExercises = async (userId, dayOfWeek = null) => {
  try {
    let query = supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false) // Deleted olmayan egzersizleri getir
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
    
    // Eğer dayOfWeek belirtilmişse array, değilse obje döndür
    if (dayOfWeek !== null) {
      return exercisesWithCompleted;
    } else {
      // Tüm egzersizleri günlere göre grupla
      const exercisesByDay = {};
      exercisesWithCompleted.forEach(ex => {
        const day = ex.day_of_week;
        if (!exercisesByDay[day]) {
          exercisesByDay[day] = [];
        }
        exercisesByDay[day].push(ex);
      });
      return exercisesByDay;
    }
  } catch (error) {
    console.error('Egzersizleri getirme hatası:', error);
    return dayOfWeek !== null ? [] : {};
  }
};

// Egzersiz ekle
export const addExercise = async (userId, exerciseData) => {
  try {
    
    // dayOfWeek kontrolü
    if (exerciseData.dayOfWeek === null || exerciseData.dayOfWeek === undefined) {
      console.error('❌ dayOfWeek değeri eksik:', exerciseData.dayOfWeek);
      throw new Error('dayOfWeek değeri gerekli');
    }
    
    const exercisePayload = {
      user_id: userId,
      name: exerciseData.name,
      sets: exerciseData.sets,
      reps: exerciseData.reps,
      weight: exerciseData.weight,
      category: exerciseData.category,
      day_of_week: exerciseData.dayOfWeek,
      is_completed: false, // Varsayılan olarak tamamlanmamış
      is_deleted: false
    };

    // program_id varsa ekle
    if (exerciseData.program_id) {
      exercisePayload.program_id = exerciseData.program_id;
    }


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
    
    // Önce egzersizin var olup olmadığını kontrol et
    const { data: existingExercise, error: checkError } = await supabase
      .from('exercises')
      .select('id, is_completed')
      .eq('id', exerciseId)
      .maybeSingle(); // maybeSingle() kullan - hata vermez, null döner

    if (checkError) {
      console.error('❌ Egzersiz kontrol hatası:', checkError);
      return { id: exerciseId, is_completed: completed, completed: completed };
    }

    if (!existingExercise) {
      console.warn('⚠️ Egzersiz bulunamadı, sadece local state güncelleniyor:', exerciseId);
      return { id: exerciseId, is_completed: completed, completed: completed };
    }
    
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
      .select();

    if (error) {
      console.error('❌ Supabase durum güncelleme hatası:', error);
      // Hata olsa bile local state için veri döndür
      return { id: exerciseId, is_completed: completed, completed: completed };
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ Güncelleme başarısız, local state güncelleniyor:', exerciseId);
      return { id: exerciseId, is_completed: completed, completed: completed };
    }
    
    return { ...data[0], completed: data[0].is_completed };
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
          is_deleted: false,
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
            is_completed: false,
            is_deleted: false
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
      .eq('is_deleted', false) // Deleted olmayan programları getir
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    
    // Çoğaltılmış programları temizle (aynı isimde olanları birleştir)
    const uniquePrograms = [];
    const seenNames = new Set();
    
    (data || []).forEach(program => {
      const normalizedName = program.name.toLowerCase().trim();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniquePrograms.push(program);
      } else {
      }
    });
    
    console.log('🧹 Kullanıcı programları temizlendi:', {
      önce: data ? data.length : 0,
      sonra: uniquePrograms.length,
      temizlenen: (data ? data.length : 0) - uniquePrograms.length
    });
    
    return uniquePrograms;
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
    
    const { data, error } = await supabase
      .from('workout_programs')
      .insert([
        {
          user_id: userId,
          name: 'Kişisel Antrenman Programı',
          description: 'Otomatik oluşturulan varsayılan program',
          is_active: true,
          is_custom: true,
          is_deleted: false,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Varsayılan program oluşturma hatası:', error);
      throw error;
    }
    
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
    
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase hata:', error);
      throw error;
    }
    
    
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
    
    // Önce tabloyu kontrol et
    const { data: tableCheck, error: tableError } = await supabase
      .from('template_programs')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ template_programs tablosu bulunamadı:', tableError);
      return [];
    }
    
    
    const { data, error } = await supabase
      .from('template_programs')
      .select(`
        *,
        template_program_days (
          id,
          day_name,
          day_number,
          template_exercises (id)
        )
      `)
      .eq('is_active', true);

    if (error) {
      console.error('❌ Hazır programlar hatası:', error);
      throw error;
    }
    
    
    // Çoğaltılmış programları temizle (aynı isimde olanları birleştir)
    const uniquePrograms = [];
    const seenNames = new Set();
    
    (data || []).forEach(program => {
      const normalizedName = program.name.toLowerCase().trim();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniquePrograms.push(program);
      } else {
      }
    });
    
    console.log('🧹 Çoğaltılmış programlar temizlendi:', {
      önce: data ? data.length : 0,
      sonra: uniquePrograms.length,
      temizlenen: (data ? data.length : 0) - uniquePrograms.length
    });
    
    // Her program için günlük egzersiz sayılarını hesapla
    const programsWithDayInfo = uniquePrograms.map(program => {
      const dayInfo = program.template_program_days?.map(day => ({
        day_name: day.day_name,
        day_number: day.day_number,
        exercise_count: day.template_exercises?.length || 0
      })) || [];
      
      return {
        ...program,
        day_info: dayInfo,
        total_exercises: dayInfo.reduce((sum, day) => sum + day.exercise_count, 0)
      };
    });
    
    // Seviyeleri doğru sırayla sırala: Başlangıç -> Orta -> İleri
    const levelOrder = {
      'Başlangıç': 1,
      'Beginner': 1,
      'Orta': 2,
      'Intermediate': 2,
      'İleri': 3,
      'Advanced': 3
    };
    
    const sortedData = programsWithDayInfo.sort((a, b) => {
      const orderA = levelOrder[a.level] || 999;
      const orderB = levelOrder[b.level] || 999;
      return orderA - orderB;
    });
    
    return sortedData;
  } catch (error) {
    console.error('❌ Hazır programlar getirme hatası:', error);
    return [];
  }
};

// Belirli bir programın günlerini ve egzersizlerini getir
export const getTemplateProgramDetails = async (programId) => {
  try {
    
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

    if (!days || days.length === 0) {
      console.error('⚠️ Program günü bulunamadı! Template program doğru kurulmamış olabilir.');
      return [];
    }

    // Her gün için egzersizleri getir
    const daysWithExercises = await Promise.all(
      (days || []).map(async (day) => {
        
        const { data: exercises, error: exercisesError } = await supabase
          .from('template_exercises')
          .select('*')
          .eq('template_program_day_id', day.id)
          .order('order_index', { ascending: true });

        if (exercisesError) {
          console.error('❌ Egzersizler getirme hatası:', exercisesError);
          return { ...day, exercises: [] };
        }

        return { ...day, exercises: exercises || [] };
      })
    );

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
    
    // Önce programın detaylarını al
    const { data: templateProgram, error: programError } = await supabase
      .from('template_programs')
      .select('*')
      .eq('id', templateProgramId)
      .single();

    if (programError) throw programError;

    // Aynı template program zaten eklenmiş mi kontrol et (çok daha kapsamlı)
    
    const { data: existingPrograms, error: checkError } = await supabase
      .from('workout_programs')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .eq('is_custom', false)
      .eq('is_deleted', false) // Deleted olmayan programları kontrol et
      .order('created_at', { ascending: false });

    if (checkError) {
      console.warn('⚠️ Mevcut program kontrol hatası:', checkError);
    } else if (existingPrograms && existingPrograms.length > 0) {
      
      // Tam isim eşleşmesi var mı kontrol et
      const exactMatch = existingPrograms.find(p => 
        p.name.toLowerCase().trim() === templateProgram.name.toLowerCase().trim()
      );
      
      if (exactMatch) {
        throw new Error('Bu program zaten listenizde mevcut!');
      }
      
      // Çok benzer isimli programlar var mı kontrol et
      const similarPrograms = existingPrograms.filter(p => {
        const existingName = p.name.toLowerCase().trim();
        const newName = templateProgram.name.toLowerCase().trim();
        
        // Tam eşleşme
        if (existingName === newName) return true;
        
        // Kısmi eşleşme (anahtar kelimeler)
        const existingWords = existingName.split(/[\s\-_]+/);
        const newWords = newName.split(/[\s\-_]+/);
        
        // Anahtar kelimelerin %70'i eşleşiyorsa benzer say
        const commonWords = existingWords.filter(word => 
          newWords.some(newWord => 
            word.includes(newWord) || newWord.includes(word) || 
            word === newWord
          )
        );
        
        const similarity = commonWords.length / Math.max(existingWords.length, newWords.length);
        return similarity > 0.7;
      });
      
      if (similarPrograms.length > 0) {
        throw new Error(`Benzer bir program zaten listenizde mevcut: "${similarPrograms[0].name}"`);
      }
      
    }

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
          is_deleted: false,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (newProgramError) throw newProgramError;

    // Program günlerini ve egzersizlerini kopyala
    
    const programDays = await getTemplateProgramDetails(templateProgramId);
    
    const exercisesToInsert = [];
    programDays.forEach((day) => {
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
            is_completed: false,
            is_deleted: false
          };
          exercisesToInsert.push(exerciseData);
        });
      }
    });

    console.log('📦 Exercises to insert:', JSON.stringify(exercisesToInsert.slice(0, 2), null, 2)); // İlk 2 egzersizi göster

    if (exercisesToInsert.length > 0) {
      const { data: insertedExercises, error: exerciseError } = await supabase
        .from('exercises')
        .insert(exercisesToInsert)
        .select();

      if (exerciseError) {
        console.error('❌ Egzersiz ekleme hatası:', exerciseError);
        console.error('❌ Hata detayı:', JSON.stringify(exerciseError, null, 2));
        throw exerciseError;
      }
      
    } else {
      console.warn('⚠️ Eklenecek egzersiz bulunamadı!');
      console.warn('⚠️ Program Days:', programDays);
    }

    
    // SON KONTROL: Gerçekten eklendi mi?
    const { data: verifyData, error: verifyError } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', newProgram.id);
    
    if (verifyError) {
      console.error('❌ Doğrulama hatası:', verifyError);
    } else {
      if (verifyData && verifyData.length > 0) {
        verifyData.slice(0, 3).forEach((ex, idx) => {
        });
      }
    }
    
    return newProgram;
  } catch (error) {
    console.error('❌ Hazır program kopyalama hatası:', error);
    throw error;
  }
};

// Hazır programı kullanıcıya ekle (alias fonksiyon)
export const addTemplateProgramToUser = async (userId, templateProgramId) => {
  return await copyTemplateProgramToUser(userId, templateProgramId);
};

// Kullanıcı programını kaldır (soft delete - deleted olarak işaretle)
export const removeUserProgram = async (programId) => {
  try {
    
    // Önce programın egzersizlerini deleted olarak işaretle
    const { error: exercisesError } = await supabase
      .from('exercises')
      .update({ is_deleted: true })
      .eq('program_id', programId);
    
    if (exercisesError) {
      console.error('❌ Egzersizler kaldırılırken hata:', exercisesError);
      throw exercisesError;
    }
    
    
    // Sonra programı deleted olarak işaretle
    const { error: programError } = await supabase
      .from('workout_programs')
      .update({ is_deleted: true })
      .eq('id', programId);
    
    if (programError) {
      console.error('❌ Program kaldırılırken hata:', programError);
      throw programError;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Program kaldırma hatası:', error);
    throw error;
  }
};
