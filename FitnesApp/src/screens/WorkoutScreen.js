import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations, translateExerciseName, translateProgramName, translateProgramDescription, translateDayDescription, translateDayName } from '../utils/translations';
import * as programService from '../services/programService';
import useRewardedAd from '../hooks/useRewardedAd';

export default function WorkoutScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { userData, userId } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  // Dil bazlı günler array'i
  const weekDays = [t.sunday_full, t.monday_full, t.tuesday_full, t.wednesday_full, t.thursday_full, t.friday_full, t.saturday_full];
  const [activeTab, setActiveTab] = useState('templates'); // Varsayılan olarak hazır programları göster
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false); // Antrenman başlamadan durur
  const [completedExercises, setCompletedExercises] = useState([]);
  const [templatePrograms, setTemplatePrograms] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);
  const [templateDetails, setTemplateDetails] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // Hafta kaydırma için

  // Rewarded Ad hook
  const { loaded: adLoaded, loading: adLoading, showAd } = useRewardedAd();

  // Haftanın tarihlerini hesapla (Pazartesi'den başlayarak)
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday + (weekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push({
        date: date.getDate(),
        month: date.getMonth() + 1,
        dayIndex: (i + 1) % 7,
        // Sadece bu haftadaysa (weekOffset === 0) bugünü vurgula
        isToday: weekOffset === 0 && date.toDateString() === today.toDateString()
      });
    }
    return weekDates;
  };

  // Bugünkü egzersizleri getir
  const [todayExercises, setTodayExercises] = useState([]);
  const [isLoadingToday, setIsLoadingToday] = useState(false);

  // Aktif programdan gelen egzersizler (route params varsa)
  const getRouteExercises = () => {
    return route.params?.exercises || [];
  };

  const getWorkoutName = () => {
    return route.params?.workoutName || t.today_workout;
  };

  // Bugünkü egzersizleri yükle
  const loadTodayExercises = async () => {
    try {
      setIsLoadingToday(true);
      const currentUserId = userData?.id || userId;
      
      if (!currentUserId) {
        setTodayExercises([]);
        return;
      }

      console.log('📅 Bugünkü egzersizler yükleniyor...');
      const today = new Date().getDay(); // 0=Pazar, 1=Pazartesi, etc.
      const todayStats = await programService.getDailyStats(currentUserId, today);
      
      console.log('📅 Bugünkü egzersizler:', todayStats.exercises);
      setTodayExercises(todayStats.exercises || []);
      
    } catch (error) {
      console.error('❌ Bugünkü egzersizler yüklenirken hata:', error);
      setTodayExercises([]);
    } finally {
      setIsLoadingToday(false);
    }
  };

  // Aktif sekme değiştiğinde bugünkü egzersizleri yükle
  useEffect(() => {
    if (activeTab === 'active') {
      loadTodayExercises();
    }
  }, [activeTab, userData?.id, userId]);

  const workoutData = {
    name: getWorkoutName(),
    exercises: getRouteExercises().length > 0 ? getRouteExercises() : todayExercises,
    estimatedCalories: route.params?.estimatedCalories || 0,
    estimatedDuration: route.params?.estimatedDuration || 0
  };

  useEffect(() => {
    let interval;
    if (isRunning && activeTab === 'active') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeTab]);

  // Hazır programları yükle
  useEffect(() => {
    if (activeTab === 'templates') {
      loadTemplatePrograms();
    }
  }, [activeTab]);

  const loadTemplatePrograms = async () => {
    try {
      setIsLoadingTemplates(true);
      const programs = await programService.getTemplatePrograms();
      console.log('📋 Yüklenen hazır programlar:', programs.length);
      
      if (programs.length === 0) {
        console.warn('⚠️ Hiç hazır program bulunamadı! SQL dosyasını çalıştırın.');
        Alert.alert(
          t.warning || 'Warning',
          language === 'en' 
            ? 'No template programs found in Supabase.\n\nRun 02_template_programs.sql in Supabase SQL Editor.'
            : 'Supabase\'de hazır program bulunamadı.\n\n02_template_programs.sql dosyasını Supabase SQL Editor\'da çalıştırın.',
          [{ text: 'Tamam' }]
        );
      }
      
      setTemplatePrograms(programs);
    } catch (error) {
      console.error('Hazır programlar yüklenemedi:', error);
      Alert.alert(t.error, language === 'en' ? 'An error occurred while loading template programs' : 'Hazır programlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const viewTemplateProgramDetails = async (program) => {
    try {
      setSelectedTemplate(program);
      const details = await programService.getTemplateProgramDetails(program.id);
      setTemplateDetails(details);
      setShowTemplateDetail(true);
    } catch (error) {
      console.error('Program detayları yüklenemedi:', error);
      Alert.alert('Hata', 'Program detayları yüklenirken bir hata oluştu');
    }
  };

  const applyTemplateProgram = async () => {
    try {
      const currentUserId = userData?.id || userId;
      console.log('🔍 User ID Kontrolü:');
      console.log('  - userData?.id:', userData?.id);
      console.log('  - userId:', userId);
      console.log('  - currentUserId:', currentUserId);
      
      if (!currentUserId) {
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
        return;
      }

      // Önce reklam göster
      // Expo Go kontrolü
      if (!adLoaded && !adLoading) {
        Alert.alert(
          '📱 Development Mod',
          'AdMob reklamları sadece production build\'de çalışır.\n\nBu butona tıklamaya devam edebilirsin - program direkt eklenecek! 🎁',
          [
            { text: t.cancel, style: 'cancel' },
            { 
              text: t.continue, 
              onPress: async () => {
                // Development modu - programı direkt ekle
                await applyProgramAfterAd(currentUserId);
              }
            }
          ]
        );
        return;
      }

      if (!adLoaded && adLoading) {
        Alert.alert(t.ad_loading, t.ad_not_ready);
        return;
      }

      // Reklam izlet
      try {
        console.log('🎬 Ödüllü reklam gösteriliyor...');
        const reward = await showAd();
        console.log('🎁 Ödül kazanıldı:', reward);

        // Reklam tamamlandı - programı ekle
        await applyProgramAfterAd(currentUserId);

      } catch (error) {
        console.error('❌ Reklam hatası:', error);
        
        if (error.message === 'Reklam tamamlanmadan kapatıldı') {
          Alert.alert(
            '❌ Reklam Kapatıldı', 
            'Program eklemek için reklamı sonuna kadar izlemelisin! 🎬\n\nTekrar denemek ister misin?',
            [
              { text: 'Hayır', style: 'cancel' },
              { text: 'Evet', onPress: () => applyTemplateProgram() }
            ]
          );
        } else {
          Alert.alert('❌ Hata', 'Reklam gösterilemedi. Lütfen daha sonra tekrar deneyin.');
        }
      }
    } catch (error) {
      console.error('❌ Program uygulama hatası:', error);
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  // Reklamdan sonra programı uygula
  const applyProgramAfterAd = async (currentUserId) => {
    try {
      console.log('🚀 Program uygulanıyor:', selectedTemplate.name);
      console.log('👤 User ID (FINAL):', currentUserId);
      console.log('📋 Template ID:', selectedTemplate.id);
      
      const newProgram = await programService.copyTemplateProgramToUser(currentUserId, selectedTemplate.id);
      console.log('✅ Program başarıyla uygulandı:', newProgram);
      
      // Modal'ı kapat
      setShowTemplateDetail(false);
      
      // Program sekmesine git ve refresh event'i tetikle
      navigation.navigate('Program', { refresh: true, timestamp: Date.now() });
      
      // Biraz bekle ki navigation tamamlansın
      setTimeout(() => {
        Alert.alert(
          t.success,
          `${translateProgramName(selectedTemplate.name, language)} ${t.program_added_and_loaded}`,
          [{ text: t.great, style: 'default' }]
        );
      }, 500);
    } catch (error) {
      console.error('❌ Program uygulama hatası:', error);
      console.error('❌ Hata detayı:', error.message);
      Alert.alert(t.error, `${t.program_error}: ${error.message || t.unknown_error}`);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExercise = (exerciseId) => {
    if (completedExercises.includes(exerciseId)) {
      setCompletedExercises(completedExercises.filter(id => id !== exerciseId));
    } else {
      setCompletedExercises([...completedExercises, exerciseId]);
    }
  };

  const calculateCalories = () => {
    if (workoutData.exercises.length === 0) return 0;
    const progress = completedExercises.length / workoutData.exercises.length;
    return Math.round(workoutData.estimatedCalories * progress);
  };

  const startWorkout = () => {
    if (workoutData.exercises.length === 0) {
      Alert.alert(t.warning, t.no_exercise_found_apply_program);
      return;
    }
    
    setIsRunning(true);
    setElapsedTime(0); // Süreyi sıfırla
    Alert.alert('Antrenman Başladı! 💪', 'İyi antrenmanlar! Egzersizleri tamamlayarak devam edin.');
  };

  const finishWorkout = () => {
    setIsRunning(false);
    Alert.alert(
      t.workout_completed,
      `${t.congratulations} ${completedExercises.length}/${workoutData.exercises.length} ${t.exercises_completed}.\n\n${t.calories_burned}: ${calculateCalories()} ${t.kcal}\n${t.duration}: ${formatTime(elapsedTime)}`,
      [
        {
          text: t.ok,
          onPress: () => navigation.navigate('Dashboard')
        }
      ]
    );
  };

  // Aktif Programlarım Sekmesi İçeriği
  const renderActiveWorkout = () => {
    const weekDates = getWeekDates();
    
    if (isLoadingToday) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
            Bugünkü egzersizler yükleniyor...
          </Text>
        </View>
      );
    }
    
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }}>
        {/* Stats Card */}
        <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.sm }}>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="time" size={32} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
              {formatTime(elapsedTime)}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.duration}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="flame" size={32} color="#FF4757" />
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
              {calculateCalories()}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.calories}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={32} color="#00D084" />
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
              {completedExercises.length}/{workoutData.exercises.length}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.exercise}</Text>
          </View>
        </View>
      </Card>

      {/* Progress Bar */}
      {workoutData.exercises.length > 0 && (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
{t.workout_progress}
          </Text>
          <View style={{ 
            height: 12, 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: 6,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              width: `${(completedExercises.length / workoutData.exercises.length) * 100}%`,
              backgroundColor: colors.primary
            }} />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
            %{Math.round((completedExercises.length / workoutData.exercises.length) * 100)} tamamlandı
          </Text>
        </Card>
      )}

      {/* Exercises List */}
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>
        Egzersizler
      </Text>
      {workoutData.exercises.length > 0 ? (
        workoutData.exercises.map((exercise, index) => {
          const isCompleted = completedExercises.includes(exercise.id);
          return (
            <Card key={exercise.id} style={{ marginBottom: spacing.sm, opacity: isCompleted ? 0.6 : 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isCompleted ? '#00D084' : colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md
                }}>
                  <Text style={{ color: colors.background, fontSize: 16, fontWeight: '800' }}>
                    {index + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginRight: 8 }}>
                      {translateExerciseName(exercise.name, language)}
                    </Text>
                    {isCompleted && (
                      <Ionicons name="checkmark-circle" size={18} color="#00D084" />
                    )}
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    {exercise.sets} set × {exercise.reps} tekrar • {exercise.weight}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleExercise(exercise.id)}
                  style={{
                    backgroundColor: isCompleted ? '#00D084' : colors.primary,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 12, fontWeight: '800' }}>
                    {isCompleted ? '✅' : '🚀'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })
      ) : (
        <Card style={{ alignItems: 'center', padding: spacing.xl, backgroundColor: 'rgba(255, 122, 0, 0.05)' }}>
          <Ionicons name="fitness" size={60} color={colors.primary} style={{ marginBottom: spacing.md }} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
{t.no_exercise_today}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
{t.select_from_ready_programs}
          </Text>
        </Card>
      )}

      {/* Start/Finish Buttons */}
      {workoutData.exercises.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          {!isRunning ? (
            <TouchableOpacity
              onPress={startWorkout}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
                elevation: 3,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3
              }}
            >
              <Text style={{ color: colors.background, fontSize: 16, fontWeight: '800' }}>
                ▶️ Antrenmanı Başlat
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={finishWorkout}
              style={{
                backgroundColor: '#00D084',
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3
              }}
            >
              <Text style={{ color: colors.background, fontSize: 16, fontWeight: '800' }}>
                🎉 Antrenmanı Bitir
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      </ScrollView>
    );
  };

  // Hazır Programlar Sekmesi İçeriği
  const renderTemplatePrograms = () => {
    const getLevelColor = (level) => {
      switch (level) {
        case 'Başlangıç':
        case 'Beginner': return '#00D084';
        case 'Orta':
        case 'Intermediate': return '#FF7A00';
        case 'İleri':
        case 'Advanced': return '#FF4757';
        default: return colors.primary;
      }
    };

    const getLevelBadgeStyle = (level) => {
      switch (level) {
        case 'Başlangıç':
        case 'Beginner': return { bg: 'rgba(0, 208, 132, 0.15)', text: '#00D084' };
        case 'Orta':
        case 'Intermediate': return { bg: 'rgba(255, 122, 0, 0.15)', text: '#FF7A00' };
        case 'İleri':
        case 'Advanced': return { bg: 'rgba(255, 71, 87, 0.15)', text: '#FF4757' };
        default: return { bg: 'rgba(255, 122, 0, 0.15)', text: colors.primary };
      }
    };

    const translateLevel = (level) => {
      if (!level) return level;
      
      // Normalize the level name
      const normalizedLevel = level.toLowerCase();
      
      // Return translated level based on current language
      if (normalizedLevel.includes('başlangıç') || normalizedLevel.includes('beginner')) {
        return t.beginner;
      } else if (normalizedLevel.includes('orta') || normalizedLevel.includes('intermediate')) {
        return t.intermediate;
      } else if (normalizedLevel.includes('ileri') || normalizedLevel.includes('advanced') || level.includes('İleri')) {
        return t.advanced;
      }
      
      return level;
    };


    const getProgramTypeIcon = (type) => {
      switch (type) {
        case 'Push Pull Legs': return '💪';
        case 'Full Body': return '🔥';
        case 'Upper Lower': return '🏋️';
        case 'Split': return '⚡';
        default: return '💪';
      }
    };

    if (isLoadingTemplates) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
            {language === 'en' ? 'Loading template programs...' : 'Hazır programlar yükleniyor...'}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.sm }}>
{t.ready_workout_programs}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg }}>
{t.professional_trainer_programs}
        </Text>

        {templatePrograms.length > 0 ? (
          templatePrograms.map((program) => (
            <TouchableOpacity
              key={program.id}
              onPress={() => viewTemplateProgramDetails(program)}
              style={{
                marginBottom: spacing.md
              }}
            >
              <Card style={{
                borderLeftWidth: 5,
                borderLeftColor: program.color_hex || colors.primary,
                backgroundColor: colors.card,
                elevation: 3,
                shadowColor: program.color_hex || colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <View style={{
                        backgroundColor: `${program.color_hex || colors.primary}20`,
                        borderRadius: 12,
                        width: 40,
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10
                      }}>
                        <Text style={{ fontSize: 22 }}>
                          {program.icon_emoji || getProgramTypeIcon(program.program_type)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>
                          {translateProgramName(program.name, language)}
                        </Text>
                        <View style={{
                          ...getLevelBadgeStyle(program.level),
                          backgroundColor: getLevelBadgeStyle(program.level).bg,
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          alignSelf: 'flex-start',
                          marginTop: 2
                        }}>
                          <Text style={{ 
                            color: getLevelBadgeStyle(program.level).text, 
                            fontSize: 10, 
                            fontWeight: '700' 
                          }}>
                            {translateLevel(program.level)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm, lineHeight: 18 }}>
                      {translateProgramDescription(program.description, language)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={program.color_hex || colors.primary} style={{ marginTop: 10 }} />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  <View style={{
                    backgroundColor: 'rgba(255, 122, 0, 0.1)',
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Ionicons name="calendar-outline" size={12} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600' }}>
{program.days_per_week} {t.days_per_week}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: 'rgba(255, 71, 87, 0.1)',
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Ionicons name="flame-outline" size={12} color="#FF4757" />
                    <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600' }}>
~{program.estimated_calories_per_session} {t.kcal}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: 'rgba(0, 208, 132, 0.1)',
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Ionicons name="time-outline" size={12} color="#00D084" />
                    <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600' }}>
{program.duration_weeks} {t.weeks}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={{ alignItems: 'center', padding: spacing.xl }}>
            <Ionicons name="document-text-outline" size={60} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              {language === 'en' ? 'No template programs yet' : 'Henüz hazır program yok'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
              {language === 'en' ? 'Run SQL file to create template programs in Supabase' : 'Supabase\'de hazır programları oluşturmak için SQL dosyasını çalıştırın'}
            </Text>
          </Card>
        )}
      </ScrollView>
    );
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        }}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Ionicons name="home" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
{activeTab === 'active' ? (workoutData.name || t.today_workout) : t.ready_programs}
          </Text>
          {activeTab === 'active' && workoutData.exercises.length > 0 && isRunning && (
            <TouchableOpacity onPress={() => setIsRunning(false)}>
              <Ionicons name="pause" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          {activeTab === 'templates' && (
            <View style={{ width: 24 }} />
          )}
        </View>

        {/* Tab Bar */}
        <View style={{ 
          flexDirection: 'row', 
          padding: spacing.sm,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        }}>
          <TouchableOpacity
            onPress={() => setActiveTab('active')}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderRadius: 12,
              backgroundColor: activeTab === 'active' ? colors.primary : 'transparent',
              marginRight: spacing.xs
            }}
          >
            <Text style={{
              color: activeTab === 'active' ? colors.background : colors.textMuted,
              fontSize: 14,
              fontWeight: '700'
            }}>
💪 {t.my_active_program}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('templates')}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderRadius: 12,
              backgroundColor: activeTab === 'templates' ? colors.primary : 'transparent',
              marginLeft: spacing.xs
            }}
          >
            <Text style={{
              color: activeTab === 'templates' ? colors.background : colors.textMuted,
              fontSize: 14,
              fontWeight: '700'
            }}>
📋 {t.ready_programs}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'active' ? renderActiveWorkout() : renderTemplatePrograms()}

        {/* Template Detail Modal */}
        <Modal
          visible={showTemplateDetail}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTemplateDetail(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end'
          }}>
            <View style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '85%'
            }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.border
              }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', flex: 1 }}>
                  {translateProgramName(selectedTemplate?.name, language)}
                </Text>
                <TouchableOpacity onPress={() => setShowTemplateDetail(false)}>
                  <Ionicons name="close" size={28} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: spacing.lg }}>
                {/* Program Açıklaması */}
                <Card style={{ marginBottom: spacing.md, backgroundColor: `${selectedTemplate?.color_hex || colors.primary}10` }}>
                  <Text style={{ color: colors.text, fontSize: 14, marginBottom: spacing.sm }}>
                    {translateProgramDescription(selectedTemplate?.description, language)}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                    <View style={{
                      backgroundColor: 'rgba(255, 122, 0, 0.2)',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 6
                    }}>
                      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
📅 {selectedTemplate?.days_per_week} {t.days_per_week}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(0, 208, 132, 0.2)',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 6
                    }}>
                      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
⏱️ {selectedTemplate?.duration_weeks} {t.weeks}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(255, 71, 87, 0.2)',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 6
                    }}>
                      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
🔥 ~{selectedTemplate?.estimated_calories_per_session} {t.kcal}
                      </Text>
                    </View>
                  </View>
                </Card>

                {/* Günlük Detaylar */}
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>
{t.program_details}
                </Text>
                {templateDetails.map((day, dayIndex) => (
                  <Card key={day.id} style={{ marginBottom: spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: spacing.sm
                      }}>
                        <Text style={{ color: colors.background, fontSize: 14, fontWeight: '800' }}>
                          {dayIndex + 1}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                          {translateDayName(day.day_name, language)}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
{day.estimated_duration_minutes} {t.minutes} • {day.estimated_calories} {t.kcal}
                        </Text>
                      </View>
                    </View>
                    
                    {day.description && (
                      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm, fontStyle: 'italic' }}>
                        {translateDayDescription(day.description, language)}
                      </Text>
                    )}

                    {/* Egzersizler */}
                    {day.exercises && day.exercises.length > 0 && (
                      <View style={{ 
                        backgroundColor: 'rgba(255, 122, 0, 0.05)', 
                        borderRadius: 12, 
                        padding: spacing.sm,
                        marginTop: spacing.xs
                      }}>
                        {day.exercises.map((exercise, exIndex) => (
                          <View 
                            key={exercise.id} 
                            style={{ 
                              flexDirection: 'row', 
                              alignItems: 'center',
                              paddingVertical: 6,
                              borderBottomWidth: exIndex < day.exercises.length - 1 ? 1 : 0,
                              borderBottomColor: colors.border
                            }}
                          >
                            <View style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: 'rgba(255, 122, 0, 0.2)',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: spacing.sm
                            }}>
                              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>
                                {exIndex + 1}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                                {translateExerciseName(exercise.name, language)}
                              </Text>
                              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
{exercise.sets} {t.set} × {exercise.reps.includes('sn') ? exercise.reps.replace('sn', t.seconds) : exercise.reps} {t.reps}
                                {exercise.weight && ` • ${exercise.weight === 'Vücut Ağırlığı' ? t.body_weight : exercise.weight}`}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </Card>
                ))}

                {/* Uygula Butonu */}
                <TouchableOpacity
                  onPress={applyTemplateProgram}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 16,
                    padding: spacing.lg,
                    alignItems: 'center',
                    marginBottom: spacing.lg,
                    elevation: 4,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 18, fontWeight: '800' }}>
✨ {t.apply_this_program}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
