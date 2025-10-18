import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator, Dimensions, FlatList, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import Card from '../components/Card';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations, translateExerciseName, translateProgramName, translateProgramDescription, translateDayName, translateDayDescription } from '../utils/translations';
import * as programService from '../services/programService';
import useRewardedAd from '../hooks/useRewardedAd';

const { width } = Dimensions.get('window');

export default function TrainingScreen({ navigation }) {
  const { colors } = useTheme();
  const { userData, userId } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);

  // State management
  const [activeTab, setActiveTab] = useState('program'); // 'program' or 'workout'
  const [exercises, setExercises] = useState({});
  const [workoutData, setWorkoutData] = useState({ name: '', exercises: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  // Program states
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [weekOffset, setWeekOffset] = useState(0);
  const [filter, setFilter] = useState('all');
  const [exerciseCategories, setExerciseCategories] = useState(['upper_body', 'lower_body', 'other']);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
    category: 'upper_body'
  });
  const [customProgram, setCustomProgram] = useState({
    name: '',
    description: '',
    selectedDays: [],
    dayExercises: {}
  });

  // Workout states
  const [workoutActiveTab, setWorkoutActiveTab] = useState('active');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [templatePrograms, setTemplatePrograms] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);
  const [templateDetails, setTemplateDetails] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Rewarded Ad hook
  const { loaded: adLoaded, loading: adLoading, showAd } = useRewardedAd();
  
  // Reklam durumunu logla
  useEffect(() => {
    console.log('📺 Reklam durumu değişti:', { adLoaded, adLoading });
  }, [adLoaded, adLoading]);

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadTrainingData();
    }, [])
  );

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(time => time + 1);
      }, 1000);
    } else if (!isRunning && elapsedTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, elapsedTime]);

  const loadTrainingData = async () => {
    try {
      setIsLoading(true);
      const today = new Date().getDay();
      
      // Load program exercises
      const programData = await programService.getExercises(userId);
      setExercises(programData || {});
      
      // Load today's workout (get today's exercises)
      const todayExercises = await programService.getExercises(userId, today);
      setWorkoutData({ 
        name: 'Today\'s Workout', 
        exercises: todayExercises || [] 
      });
      
      // Load template programs
      await loadTemplatePrograms();
      
    } catch (error) {
      console.error('Training data load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load template programs
  const loadTemplatePrograms = async () => {
    try {
      setIsLoadingTemplates(true);
      console.log('🔄 Template programs loading...');
      const programs = await programService.getTemplatePrograms();
      console.log('📋 Template programs loaded:', programs);
      setTemplatePrograms(programs || []);
    } catch (error) {
      console.error('❌ Template programs load error:', error);
      setTemplatePrograms([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // View template program details
  const viewTemplateProgramDetails = async (program) => {
    try {
      setSelectedTemplate(program);
      setIsLoadingTemplates(true);
      
      const details = await programService.getTemplateProgramDetails(program.id);
      setTemplateDetails(details || []);
      setShowTemplateDetail(true);
    } catch (error) {
      console.error('Template program details error:', error);
      Alert.alert(t.error || 'Error', t.program_details_error || 'Failed to load program details');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Add template program to user's program
  const addTemplateProgram = async (program) => {
    try {
      console.log('🔄 Program ekleme başlatıldı:', {
        programId: program.id,
        programName: program.name,
        userId,
        adLoaded,
        adLoading
      });

      // Önce reklam göster
      if (adLoaded) {
        console.log('📺 Reklam gösteriliyor...');
        try {
          await showAd();
          console.log('✅ Reklam izlendi, program ekleniyor...');
        } catch (adError) {
          console.warn('⚠️ Reklam gösterilemedi:', adError);
          // Reklam gösterilemezse de devam et
        }
      } else {
        console.log('⚠️ Reklam durumu:', { adLoaded, adLoading });
        console.log('⚠️ Reklam hazır değil, program direkt ekleniyor...');
      }

      console.log('🔄 ProgramService.addTemplateProgramToUser çağrılıyor...');
      await programService.addTemplateProgramToUser(userId, program.id);
      console.log('✅ Program başarıyla eklendi, veriler yenileniyor...');
      
      await loadTrainingData();
      setShowTemplateDetail(false);
      Alert.alert(t.successful || 'Success', t.program_added_successfully || 'Program added successfully');
    } catch (error) {
      console.error('❌ Add template program error:', error);
      
      // Özel hata mesajları
      let errorMessage = t.program_add_error || 'Failed to add program';
      if (error.message === 'Bu program zaten listenizde mevcut!') {
        errorMessage = 'Bu program zaten listenizde mevcut!';
      } else if (error.message.includes('Benzer bir program')) {
        errorMessage = error.message;
      } else if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        errorMessage = 'Bu program zaten eklenmiş!';
      }
      
      console.log('🚨 Kullanıcıya gösterilecek hata:', errorMessage);
      Alert.alert(t.error || 'Error', errorMessage);
    }
  };

  // Format time helper
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate calories helper
  const calculateCalories = () => {
    // Simple calorie calculation based on completed exercises
    return completedExercises.length * 15; // 15 calories per exercise
  };

  // Finish workout
  const finishWorkout = () => {
    setIsRunning(false);
    Alert.alert(
      t.workout_completed || 'Workout Completed',
      `${t.congratulations || 'Congratulations'} ${completedExercises.length}/${workoutData.exercises.length} ${t.exercises_completed || 'exercises completed'}.\n\n${t.calories_burned || 'Calories burned'}: ${calculateCalories()} ${t.kcal || 'kcal'}\n${t.duration || 'Duration'}: ${formatTime(elapsedTime)}`,
      [
        {
          text: t.ok || 'OK',
          onPress: () => {
            setCompletedExercises([]);
            setElapsedTime(0);
            setIsRunning(false);
          }
        }
      ]
    );
  };

  // Get week dates
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
        isToday: weekOffset === 0 && date.toDateString() === today.toDateString()
      });
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const weekDays = [
    language === 'en' ? 'Sun' : 'Paz',
    language === 'en' ? 'Mon' : 'Pzt', 
    language === 'en' ? 'Tue' : 'Sal',
    language === 'en' ? 'Wed' : 'Çar',
    language === 'en' ? 'Thu' : 'Per',
    language === 'en' ? 'Fri' : 'Cum',
    language === 'en' ? 'Sat' : 'Cmt'
  ];

  // Update exercise function
  const updateExercise = async (exerciseId, updatedData) => {
    try {
      await programService.updateExercise(exerciseId, updatedData);
      await loadTrainingData();
      setEditingExercise(null);
      Alert.alert(t.successful || 'Success', t.exercise_updated || 'Exercise updated successfully');
    } catch (error) {
      console.error('Update exercise error:', error);
      Alert.alert(t.error || 'Error', t.exercise_update_error || 'Failed to update exercise');
    }
  };

  // Delete exercise function
  const deleteExercise = async (exerciseId) => {
    Alert.alert(
      t.confirm || 'Confirm',
      t.delete_exercise_confirm || 'Are you sure you want to delete this exercise?',
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        {
          text: t.delete || 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await programService.deleteExercise(exerciseId);
              await loadTrainingData();
              setEditingExercise(null);
              Alert.alert(t.successful || 'Success', t.exercise_deleted || 'Exercise deleted successfully');
            } catch (error) {
              console.error('Delete exercise error:', error);
              Alert.alert(t.error || 'Error', t.exercise_delete_error || 'Failed to delete exercise');
            }
          }
        }
      ]
    );
  };

  // Add exercise function
  const addExercise = async () => {
    if (!newExercise.name.trim()) {
      Alert.alert(t.error || 'Error', t.exercise_name_required || 'Exercise name is required');
      return;
    }

    try {
      const exerciseData = {
        ...newExercise,
        dayOfWeek: selectedDay, // day yerine dayOfWeek kullan
        completed: false,
        sets: parseInt(newExercise.sets) || 0,
        reps: parseInt(newExercise.reps) || 0,
        weight: parseFloat(newExercise.weight) || 0
      };

      await programService.addExercise(userId, exerciseData);
      await loadTrainingData();
      
      setNewExercise({
        name: '',
        sets: '',
        reps: '',
        weight: '',
        category: 'upper_body'
      });
      setShowAddModal(false);
      
      Alert.alert(t.successful || 'Success', t.exercise_added || 'Exercise added successfully');
    } catch (error) {
      console.error('Add exercise error:', error);
      Alert.alert(t.error || 'Error', t.exercise_add_error || 'Failed to add exercise');
    }
  };

  // Get today's exercises
  const getTodayExercises = () => {
    const today = new Date().getDay();
    return (exercises && exercises[today]) ? exercises[today] : [];
  };

  // Get exercise count for today
  const getTodayStats = () => {
    const todayExercises = getTodayExercises();
    if (!todayExercises || !Array.isArray(todayExercises)) {
      return { total: 0, completed: 0 };
    }
    const completed = todayExercises.filter(ex => ex.completed).length;
    return { total: todayExercises.length, completed };
  };

  // Quick start workout
  const startQuickWorkout = () => {
    const todayExercises = getTodayExercises();
    if (!todayExercises || !Array.isArray(todayExercises) || todayExercises.length === 0) {
      Alert.alert(
        t.no_exercises || 'No Exercises',
        t.add_exercises_first || 'Add exercises to your program first',
        [{ text: t.ok || 'OK' }]
      );
      return;
    }
    // Set today's exercises as workout data and switch to active tab
    setWorkoutData({
      name: t.today_workout || 'Today\'s Workout',
      exercises: todayExercises
    });
    setActiveTab('workout');
    setWorkoutActiveTab('active');
  };

  // Render program section
  const renderProgramSection = () => {
    const todayStats = getTodayStats();
    const todayExercises = getTodayExercises();
    const selectedDayExercises = (exercises && exercises[selectedDay]) ? exercises[selectedDay] : [];

    return (
      <View>
        {/* Weekly Calendar */}
        <Card style={{ marginBottom: spacing.lg, backgroundColor: 'rgba(255, 122, 0, 0.05)' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <TouchableOpacity 
              onPress={() => setWeekOffset(prev => prev - 1)}
              style={{
                backgroundColor: colors.background,
                borderRadius: 8,
                padding: 8
              }}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                  {weekOffset === 0 ? t.this_week : weekOffset === -1 ? t.previous_week : weekOffset === 1 ? t.next_week : `${weekOffset > 0 ? '+' : ''}${weekOffset} ${t.week}`}
                </Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                {weekDates[0].date}-{weekDates[6].date} {new Date().toLocaleDateString('tr-TR', { month: 'short' })}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => setWeekOffset(prev => prev + 1)}
              style={{
                backgroundColor: colors.background,
                borderRadius: 8,
                padding: 8
              }}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Week Days */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {weekDates.map((dayData, index) => {
              const dayExercises = (exercises && exercises[dayData.dayIndex]) ? exercises[dayData.dayIndex] : [];
              const completedCount = dayExercises.filter(ex => ex.completed).length;
              const totalCount = dayExercises.length;
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDay(dayData.dayIndex)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingHorizontal: 4,
                    paddingVertical: spacing.sm,
                    borderRadius: 8,
                    backgroundColor: selectedDay === dayData.dayIndex ? colors.primary : 'transparent',
                    marginHorizontal: 1,
                    minWidth: 45
                  }}
                >
                  <Text style={{ 
                    color: selectedDay === dayData.dayIndex ? colors.background : colors.textMuted,
                    fontSize: 9,
                    fontWeight: '600',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    {weekDays[dayData.dayIndex]}
                  </Text>
                  <Text style={{ 
                    color: selectedDay === dayData.dayIndex ? colors.background : colors.text,
                    fontSize: 16,
                    fontWeight: '700',
                    marginTop: 2,
                    textAlign: 'center'
                  }}>
                    {dayData.date}
                  </Text>
                  <View style={{ 
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    backgroundColor: selectedDay === dayData.dayIndex ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: selectedDay === dayData.dayIndex ? colors.background : colors.border,
                    minWidth: 35
                  }}>
                    <Text style={{ 
                      color: selectedDay === dayData.dayIndex ? colors.background : colors.textMuted,
                      fontSize: 9,
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      {completedCount}/{totalCount}
                    </Text>
                  </View>
                  
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Selected Day Exercises */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: spacing.md }}>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 20,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name="add" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>

          {selectedDayExercises.length > 0 ? (
            <View>
              {selectedDayExercises.map((exercise, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    backgroundColor: exercise.completed ? 'rgba(34, 197, 94, 0.1)' : colors.card,
                    borderRadius: 8,
                    marginBottom: spacing.sm,
                    borderLeftWidth: 4,
                    borderLeftColor: exercise.completed ? colors.success : colors.primary
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      color: colors.text, 
                      fontSize: 16, 
                      fontWeight: '600',
                      textDecorationLine: exercise.completed ? 'line-through' : 'none'
                    }}>
                      {translateExerciseName(exercise.name, language)}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
                      {exercise.sets} {t.sets || 'sets'} × {exercise.reps} {t.reps || 'reps'} {exercise.weight > 0 && `@ ${exercise.weight}kg`}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {/* Tamamlama Butonu */}
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          console.log('🔄 Egzersiz durumu değiştiriliyor:', exercise.name, !exercise.completed);
                          
                          const result = await programService.toggleExerciseCompletion(exercise.id, !exercise.completed);
                          console.log('✅ Egzersiz durumu güncellendi:', result);
                          
                          await loadTrainingData();
                        } catch (error) {
                          console.error('❌ Toggle completion error:', error);
                          Alert.alert(
                            t.error || 'Error',
                            t.exercise_toggle_error || 'Failed to update exercise status'
                          );
                        }
                      }}
                      style={{
                        backgroundColor: exercise.completed ? colors.success : 'transparent',
                        borderRadius: 20,
                        width: 24,
                        height: 24,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1.5,
                        borderColor: exercise.completed ? colors.success : colors.textMuted
                      }}
                    >
                      {exercise.completed && (
                        <Ionicons name="checkmark" size={14} color={colors.background} />
                      )}
                    </TouchableOpacity>

                    {/* Düzenle Butonu */}
                    <TouchableOpacity
                      onPress={() => setEditingExercise(exercise)}
                      style={{
                        backgroundColor: 'transparent',
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: colors.border
                      }}
                    >
                      <Ionicons name="create-outline" size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: spacing.xl }}>
              <Ionicons name="barbell-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 16, marginTop: spacing.md, textAlign: 'center' }}>
                {t.no_exercises || 'No exercises for this day'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  marginTop: spacing.md
                }}
              >
                <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                  {t.add_exercise || 'Add Exercise'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </View>
    );
  };

  // Render workout section
  const renderWorkoutSection = () => {
    return (
      <View>
        {/* Workout Tab Bar */}
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: colors.card,
          borderRadius: 12,
          marginBottom: spacing.lg,
          padding: 4
        }}>
          <TouchableOpacity
            onPress={() => setWorkoutActiveTab('active')}
            style={{
              flex: 1,
              padding: spacing.sm,
              borderRadius: 8,
              backgroundColor: workoutActiveTab === 'active' ? colors.success : 'transparent',
              alignItems: 'center'
            }}
          >
            <Text style={{ 
              color: workoutActiveTab === 'active' ? colors.background : colors.textMuted,
              fontSize: 14,
              fontWeight: '600'
            }}>
              {t.active_workout || 'Active'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setWorkoutActiveTab('templates')}
            style={{
              flex: 1,
              padding: spacing.sm,
              borderRadius: 8,
              backgroundColor: workoutActiveTab === 'templates' ? colors.primary : 'transparent',
              alignItems: 'center'
            }}
          >
            <Text style={{ 
              color: workoutActiveTab === 'templates' ? colors.background : colors.textMuted,
              fontSize: 14,
              fontWeight: '600'
            }}>
              {t.ready_programs || 'Programs'}
            </Text>
          </TouchableOpacity>
        </View>

        {workoutActiveTab === 'active' ? (
          /* Active Programs */
          <View>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.sm, paddingHorizontal: spacing.md }}>
              {t.active_programs || 'Active Programs'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg, paddingHorizontal: spacing.md }}>
              {t.your_current_programs || 'Your current workout programs'}
            </Text>

            {/* Stats Card */}
            <Card style={{ marginBottom: spacing.lg, backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.sm }}>
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="time" size={32} color={colors.primary} />
                  <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
                    {formatTime(elapsedTime)}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.duration || 'Duration'}</Text>
                </View>
                <View style={{ width: 1, backgroundColor: colors.border }} />
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="flame" size={32} color="#FF4757" />
                  <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
                    {calculateCalories()}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.calories || 'Calories'}</Text>
                </View>
                <View style={{ width: 1, backgroundColor: colors.border }} />
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={32} color="#00D084" />
                  <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
                    {completedExercises.length}/{workoutData.exercises.length}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.exercises || 'Exercises'}</Text>
                </View>
              </View>
            </Card>

            {/* Progress Bar */}
            {workoutData.exercises.length > 0 && (
              <Card style={{ marginBottom: spacing.lg }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  {t.workout_progress || 'Workout Progress'}
                </Text>
                <View style={{ 
                  height: 12, 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 6,
                  overflow: 'hidden'
                }}>
                  <View style={{
                    height: '100%',
                    width: `${(completedExercises.length / Math.max(workoutData.exercises.length, 1)) * 100}%`,
                    backgroundColor: colors.primary
                  }} />
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                  %{Math.round((completedExercises.length / Math.max(workoutData.exercises.length, 1)) * 100)} {t.completed || 'completed'}
                </Text>
              </Card>
            )}

            {/* Exercises List */}
            <Card style={{ marginBottom: spacing.lg }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>
                {t.exercises || 'Exercises'}
              </Text>
              {workoutData.exercises.length > 0 ? (
                workoutData.exercises.map((exercise, index) => {
                  const isCompleted = completedExercises.includes(exercise.id);
                  return (
                    <View key={exercise.id} style={{ 
                      marginBottom: spacing.sm, 
                      opacity: isCompleted ? 0.6 : 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: spacing.md,
                      backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.1)' : colors.card,
                      borderRadius: 8,
                      borderLeftWidth: 4,
                      borderLeftColor: isCompleted ? colors.success : colors.primary
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isCompleted ? colors.success : colors.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: spacing.md
                      }}>
                        <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700' }}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          color: colors.text, 
                          fontSize: 16, 
                          fontWeight: '600',
                          textDecorationLine: isCompleted ? 'line-through' : 'none'
                        }}>
                          {translateExerciseName(exercise.name, language)}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
                          {exercise.sets} {t.sets || 'sets'} × {exercise.reps} {t.reps || 'reps'} {exercise.weight > 0 && `@ ${exercise.weight}kg`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          if (isCompleted) {
                            setCompletedExercises(prev => prev.filter(id => id !== exercise.id));
                          } else {
                            setCompletedExercises(prev => [...prev, exercise.id]);
                          }
                        }}
                        style={{
                          backgroundColor: isCompleted ? colors.success : colors.background,
                          borderRadius: 20,
                          width: 32,
                          height: 32,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 2,
                          borderColor: isCompleted ? colors.success : colors.primary
                        }}
                      >
                        {isCompleted && (
                          <Ionicons name="checkmark" size={16} color={colors.background} />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })
              ) : (
                <View style={{ alignItems: 'center', padding: spacing.xl }}>
                  <Ionicons name="fitness-outline" size={48} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, fontSize: 16, marginTop: spacing.md, textAlign: 'center' }}>
                    {t.no_active_workout || 'No active workout'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setWorkoutActiveTab('templates')}
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 12,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.sm,
                      marginTop: spacing.md
                    }}
                  >
                    <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                      {t.choose_program || 'Choose a Program'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>

            {/* Workout Controls */}
            {workoutData.exercises.length > 0 && (
              <Card style={{ marginBottom: spacing.lg }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <TouchableOpacity
                    onPress={() => setIsRunning(!isRunning)}
                    style={{
                      backgroundColor: isRunning ? colors.warning : colors.success,
                      borderRadius: 12,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      alignItems: 'center',
                      flexDirection: 'row'
                    }}
                  >
                    <Ionicons name={isRunning ? "pause" : "play"} size={20} color={colors.background} />
                    <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600', marginLeft: spacing.sm }}>
                      {isRunning ? t.pause : t.start}
                    </Text>
                  </TouchableOpacity>
                  
                  {completedExercises.length === workoutData.exercises.length && (
                    <TouchableOpacity
                      onPress={finishWorkout}
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        alignItems: 'center',
                        flexDirection: 'row'
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={colors.background} />
                      <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600', marginLeft: spacing.sm }}>
                        {t.finish || 'Finish'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            )}
          </View>
        ) : (
          /* Ready Programs */
          <View>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.sm, paddingHorizontal: spacing.md }}>
              {t.ready_workout_programs || 'Ready Workout Programs'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg, paddingHorizontal: spacing.md }}>
              {t.professional_trainer_programs || 'Professional trainer programs'}
            </Text>

            {isLoadingTemplates ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: spacing.md }}>
                  {language === 'en' ? 'Loading template programs...' : 'Hazır programlar yükleniyor...'}
                </Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }}>
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
                                backgroundColor: 'rgba(255, 122, 0, 0.15)',
                                borderRadius: 6,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                marginRight: spacing.sm
                              }}>
                                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                                  {program.icon_emoji || '💪'}
                                </Text>
                              </View>
                              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>
                                {translateProgramName(program.name, language)}
                              </Text>
                            </View>
                            <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: spacing.sm }}>
                              {translateProgramDescription(program.description, language)}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                              <View style={{
                                backgroundColor: program.level === 'Başlangıç' || program.level === 'Beginner' ? 'rgba(0, 208, 132, 0.15)' : 
                                               program.level === 'Orta' || program.level === 'Intermediate' ? 'rgba(255, 122, 0, 0.15)' : 
                                               'rgba(255, 71, 87, 0.15)',
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                marginRight: spacing.sm
                              }}>
                                <Text style={{ 
                                  color: program.level === 'Başlangıç' || program.level === 'Beginner' ? '#00D084' : 
                                         program.level === 'Orta' || program.level === 'Intermediate' ? '#FF7A00' : '#FF4757',
                                  fontSize: 12, 
                                  fontWeight: '600' 
                                }}>
                                  {program.level === 'Başlangıç' || program.level === 'Beginner' ? t.beginner :
                                   program.level === 'Orta' || program.level === 'Intermediate' ? t.intermediate :
                                   program.level === 'İleri' || program.level === 'Advanced' ? t.advanced : program.level}
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                                <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 4 }}>
                                  {program.days_per_week} {t.days_per_week || 'days/week'}
                                </Text>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                              <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 4 }}>
                                {program.duration_weeks} {t.weeks || 'weeks'}
                              </Text>
                              <View style={{ width: 1, height: 12, backgroundColor: colors.border, marginHorizontal: spacing.sm }} />
                              <Ionicons name="flame-outline" size={14} color={colors.textMuted} />
                              <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 4 }}>
                                {program.estimated_calories_per_session} {t.kcal || 'kcal'}
                              </Text>
                            </View>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ alignItems: 'center', padding: spacing.xl }}>
                    <Ionicons name="library-outline" size={48} color={colors.textMuted} />
                    <Text style={{ color: colors.textMuted, fontSize: 16, marginTop: spacing.md, textAlign: 'center' }}>
                      {t.no_template_programs || 'No template programs available'}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: spacing.sm, textAlign: 'center' }}>
                      {t.run_sql_setup || 'Please run SQL setup files to load template programs'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
        <Header title={t.training || 'Training'} />
        <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textMuted, marginTop: spacing.md }}>
              {t.loading || 'Loading...'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <Header title={t.training || 'Training'} />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        {/* Tab Bar */}
        <View style={{ 
          flexDirection: 'row', 
          padding: spacing.sm,
          backgroundColor: colors.card,
          margin: spacing.md,
          borderRadius: 12
        }}>
          <TouchableOpacity
            onPress={() => setActiveTab('program')}
            style={{
              flex: 1,
              padding: spacing.md,
              borderRadius: 8,
              backgroundColor: activeTab === 'program' ? colors.primary : 'transparent',
              alignItems: 'center'
            }}
          >
            <Ionicons 
              name="barbell" 
              size={20} 
              color={activeTab === 'program' ? colors.background : colors.textMuted} 
            />
            <Text style={{ 
              color: activeTab === 'program' ? colors.background : colors.textMuted,
              fontSize: 12,
              fontWeight: '600',
              marginTop: 4
            }}>
              {t.program_tab}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('workout')}
            style={{
              flex: 1,
              padding: spacing.md,
              borderRadius: 8,
              backgroundColor: activeTab === 'workout' ? colors.success : 'transparent',
              alignItems: 'center'
            }}
          >
            <Ionicons 
              name="fitness" 
              size={20} 
              color={activeTab === 'workout' ? colors.background : colors.textMuted} 
            />
            <Text style={{ 
              color: activeTab === 'workout' ? colors.background : colors.textMuted,
              fontSize: 12,
              fontWeight: '600',
              marginTop: 4
            }}>
              {t.workout_tab}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}>
          {activeTab === 'program' ? renderProgramSection() : renderWorkoutSection()}
        </ScrollView>
      </SafeAreaView>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
            <Header 
              title={t.add_exercise || 'Add Exercise'}
              showBackButton={true}
              onBackPress={() => setShowAddModal(false)}
            />
            <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
              <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}>
                <Card style={{ padding: spacing.lg }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg }}>
                    {t.exercise_details || 'Exercise Details'}
                  </Text>

                  <View style={{ marginBottom: spacing.md }}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                      {t.exercise_name || 'Exercise Name'} *
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        padding: spacing.md,
                        color: colors.text,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: colors.border
                      }}
                      placeholder={t.exercise_name_placeholder || 'Enter exercise name'}
                      placeholderTextColor={colors.textMuted}
                      value={newExercise.name}
                      onChangeText={(text) => setNewExercise(prev => ({ ...prev, name: text }))}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                        {t.sets || 'Sets'}
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: colors.card,
                          borderRadius: 12,
                          padding: spacing.md,
                          color: colors.text,
                          fontSize: 16,
                          borderWidth: 1,
                          borderColor: colors.border
                        }}
                        placeholder="3"
                        placeholderTextColor={colors.textMuted}
                        value={newExercise.sets}
                        onChangeText={(text) => setNewExercise(prev => ({ ...prev, sets: text }))}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                        {t.reps || 'Reps'}
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: colors.card,
                          borderRadius: 12,
                          padding: spacing.md,
                          color: colors.text,
                          fontSize: 16,
                          borderWidth: 1,
                          borderColor: colors.border
                        }}
                        placeholder="12"
                        placeholderTextColor={colors.textMuted}
                        value={newExercise.reps}
                        onChangeText={(text) => setNewExercise(prev => ({ ...prev, reps: text }))}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={{ marginBottom: spacing.lg }}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                      {t.weight || 'Weight'} (kg)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        padding: spacing.md,
                        color: colors.text,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: colors.border
                      }}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      value={newExercise.weight}
                      onChangeText={(text) => setNewExercise(prev => ({ ...prev, weight: text }))}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <TouchableOpacity
                      onPress={() => setShowAddModal(false)}
                      style={{
                        flex: 1,
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        padding: spacing.md,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: colors.border
                      }}
                    >
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                        {t.cancel || 'Cancel'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={addExercise}
                      style={{
                        flex: 1,
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        padding: spacing.md,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600' }}>
                        {t.add || 'Add'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </KeyboardAvoidingView>
      </Modal>

      {/* Template Program Details Modal */}
      <Modal
        visible={showTemplateDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
          <Header 
            title={selectedTemplate ? translateProgramName(selectedTemplate.name, language) : t.program_details}
            showBackButton={true}
            onBackPress={() => setShowTemplateDetail(false)}
          />
          <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
            <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}>
              {selectedTemplate && (
                <Card style={{ padding: spacing.lg, marginBottom: spacing.lg }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                    <View style={{
                      backgroundColor: 'rgba(255, 122, 0, 0.15)',
                      borderRadius: 8,
                      padding: spacing.sm,
                      marginRight: spacing.md
                    }}>
                      <Text style={{ color: colors.primary, fontSize: 24 }}>
                        {selectedTemplate.icon_emoji || '💪'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
                        {translateProgramName(selectedTemplate.name, language)}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                        {translateProgramDescription(selectedTemplate.description, language)}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>
                        {selectedTemplate.days_per_week}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        {t.days_per_week || 'Days/Week'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: colors.success, fontSize: 20, fontWeight: '800' }}>
                        {selectedTemplate.duration_weeks}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        {t.weeks || 'Weeks'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: colors.warning, fontSize: 20, fontWeight: '800' }}>
                        {selectedTemplate.estimated_calories_per_session}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        {t.kcal || 'kcal'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => addTemplateProgram(selectedTemplate)}
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 12,
                      padding: spacing.md,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center'
                    }}
                  >
                    <Ionicons name="add" size={20} color={colors.background} />
                    <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600', marginLeft: spacing.sm }}>
                      {t.add_to_my_programs || 'Add to My Programs'}
                    </Text>
                  </TouchableOpacity>
                </Card>
              )}

              {isLoadingTemplates ? (
                <View style={{ alignItems: 'center', padding: spacing.xl }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ color: colors.textMuted, marginTop: spacing.md }}>
                    {t.loading_program_details || 'Loading program details...'}
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
                    {t.program_schedule || 'Program Schedule'}
                  </Text>
                  {templateDetails.map((day, index) => (
                    <Card key={index} style={{ padding: spacing.md, marginBottom: spacing.sm }}>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
                        {translateDayName(day.day_name, language)}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>
                        {translateDayDescription(day.description, language)}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="fitness" size={16} color={colors.primary} />
                        <Text style={{ color: colors.text, fontSize: 14, marginLeft: spacing.sm }}>
                          {day.exercises?.length || 0} {t.exercises || 'exercises'}
                        </Text>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>

      {/* Edit Exercise Modal */}
      <Modal
        visible={editingExercise !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
            <Header 
              title={t.edit_exercise || 'Edit Exercise'}
              showBackButton={true}
              onBackPress={() => setEditingExercise(null)}
            />
            <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
              <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}>
                {editingExercise && (
                  <Card style={{ padding: spacing.lg }}>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg }}>
                      {t.exercise_details || 'Exercise Details'}
                    </Text>

                    <View style={{ marginBottom: spacing.md }}>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                        {t.exercise_name || 'Exercise Name'}
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: colors.card,
                          borderRadius: 12,
                          padding: spacing.md,
                          color: colors.text,
                          borderWidth: 1,
                          borderColor: colors.border
                        }}
                        value={editingExercise.name}
                        onChangeText={(text) => setEditingExercise({...editingExercise, name: text})}
                        placeholder={t.exercise_name_placeholder || 'Enter exercise name'}
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                          {t.sets || 'Sets'}
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: colors.card,
                            borderRadius: 12,
                            padding: spacing.md,
                            color: colors.text,
                            borderWidth: 1,
                            borderColor: colors.border
                          }}
                          value={editingExercise.sets?.toString() || ''}
                          onChangeText={(text) => setEditingExercise({...editingExercise, sets: parseInt(text) || 0})}
                          placeholder="0"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                          {t.reps || 'Reps'}
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: colors.card,
                            borderRadius: 12,
                            padding: spacing.md,
                            color: colors.text,
                            borderWidth: 1,
                            borderColor: colors.border
                          }}
                          value={editingExercise.reps?.toString() || ''}
                          onChangeText={(text) => setEditingExercise({...editingExercise, reps: parseInt(text) || 0})}
                          placeholder="0"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    <View style={{ marginBottom: spacing.md }}>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                        {t.weight || 'Weight (kg)'}
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: colors.card,
                          borderRadius: 12,
                          padding: spacing.md,
                          color: colors.text,
                          borderWidth: 1,
                          borderColor: colors.border
                        }}
                        value={editingExercise.weight?.toString() || ''}
                        onChangeText={(text) => setEditingExercise({...editingExercise, weight: parseFloat(text) || 0})}
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={{ marginBottom: spacing.lg }}>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm }}>
                        {t.category || 'Category'}
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                        {exerciseCategories.map((category) => (
                          <TouchableOpacity
                            key={category}
                            onPress={() => setEditingExercise({...editingExercise, category})}
                            style={{
                              backgroundColor: editingExercise.category === category ? colors.primary : colors.card,
                              borderRadius: 8,
                              paddingHorizontal: spacing.md,
                              paddingVertical: spacing.sm,
                              borderWidth: 1,
                              borderColor: editingExercise.category === category ? colors.primary : colors.border
                            }}
                          >
                            <Text style={{
                              color: editingExercise.category === category ? colors.background : colors.text,
                              fontSize: 12,
                              fontWeight: '600'
                            }}>
                              {t[category] || category}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
                      <TouchableOpacity
                        onPress={() => setEditingExercise(null)}
                        style={{
                          flex: 1,
                          backgroundColor: 'transparent',
                          borderRadius: 8,
                          paddingVertical: spacing.md,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: colors.border
                        }}
                      >
                        <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '500' }}>
                          {t.cancel || 'Cancel'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteExercise(editingExercise.id)}
                        style={{
                          flex: 1,
                          backgroundColor: 'transparent',
                          borderRadius: 8,
                          paddingVertical: spacing.md,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: colors.error || '#FF4444'
                        }}
                      >
                        <Text style={{ color: colors.error || '#FF4444', fontSize: 16, fontWeight: '500' }}>
                          {t.delete || 'Delete'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => updateExercise(editingExercise.id, editingExercise)}
                        style={{
                          flex: 1,
                          backgroundColor: colors.primary,
                          borderRadius: 8,
                          paddingVertical: spacing.md,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600' }}>
                          {t.save || 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                )}
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}
