import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import * as programService from '../services/programService';
import * as notificationService from '../services/notificationService';

const weekDays = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const currentDay = new Date().getDay(); // JavaScript standardı: 0=Pazar, 1=Pazartesi...

const ProgramScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData, userId, isLoading: userLoading } = useUser();
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [filter, setFilter] = useState('Tüm');
  const [exerciseCategories] = useState(['Üst Vücut', 'Alt Vücut', 'Diğer']);
  const [exercises, setExercises] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showInlineExerciseForm, setShowInlineExerciseForm] = useState({});
  const [editingExercise, setEditingExercise] = useState(null);
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
    category: 'Üst Vücut'
  });
  // Her gün için ayrı egzersiz inputları
  const [dayExerciseInputs, setDayExerciseInputs] = useState({});
  const [weeklyProgram, setWeeklyProgram] = useState(null);
  const [weeklyRepeatEnabled, setWeeklyRepeatEnabled] = useState(false); // Haftalık tekrar özelliği
  const [customProgram, setCustomProgram] = useState({
    name: '',
    description: '',
    selectedDays: [],
    dayExercises: {}
  });

  // Verileri yükle
  useEffect(() => {
    if (!userLoading && (userData?.id || userId)) {
      loadExercises();
    } else if (!userLoading) {
      // User loading tamamlandı ama user bulunamadı
      setIsLoading(false);
    }
  }, [userData, userId, userLoading]);

  // Timeout ile loading'i sınırla
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('⏰ Loading timeout - zorla kapatılıyor');
        setIsLoading(false);
      }
    }, 5000); // 5 saniye timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Egzersizler yükleniyor...');
      console.log('👤 UserData:', userData);
      console.log('📱 UserId:', userId);
      
      const currentUserId = userData?.id || userId;
      
      if (!currentUserId) {
        console.log('⚠️ UserId bulunamadı, boş verilerle devam ediliyor');
        setExercises({});
        setIsLoading(false);
        return;
      }
      
      // Haftalık istatistikleri getir
      console.log('📊 Haftalık istatistikler getiriliyor...');
      const weeklyStats = await programService.getWeeklyStats(currentUserId);
      
      // Egzersizleri gün bazında organize et
      const organizedExercises = {};
      for (let day = 0; day < 7; day++) {
        organizedExercises[day] = weeklyStats[day]?.exercises || [];
      }
      
      console.log('✅ Egzersizler organize edildi:', organizedExercises);
      setExercises(organizedExercises);
    } catch (error) {
      console.error('❌ Egzersizler yüklenirken hata:', error);
      // Hata durumunda boş egzersizlerle devam et
      setExercises({});
    } finally {
      setIsLoading(false);
      console.log('🏁 Loading tamamlandı');
    }
  };

  const addExercise = async () => {
    if (!newExercise.name || !newExercise.sets || !newExercise.reps || !newExercise.weight) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const currentUserId = userData?.id || userId;
      
      // Program ID'yi null olarak bırak (şimdilik)
      let activeProgramId = null;
      console.log('ℹ️ Program ID şimdilik null olarak ayarlanıyor');

      const exerciseData = {
        name: newExercise.name,
        sets: parseInt(newExercise.sets),
        reps: newExercise.reps,
        weight: newExercise.weight,
        category: newExercise.category,
        dayOfWeek: selectedDay,
        completed: false,
        program_id: activeProgramId // Aktif program ID'sini ekle
      };

      console.log('➕ Egzersiz ekleniyor, program_id:', activeProgramId);
      console.log('📤 Exercise data:', exerciseData);
      const newExerciseData = await programService.addExercise(currentUserId, exerciseData);
      console.log('📥 Eklenen egzersiz:', newExerciseData);
      
      // Local state'i güncelle
      const updatedExercises = {
        ...exercises,
        [selectedDay]: [...(exercises[selectedDay] || []), newExerciseData]
      };
      setExercises(updatedExercises);

      setNewExercise({ name: '', sets: '', reps: '', weight: '', category: 'Üst Vücut' });
      setShowAddModal(false);
      
      // Bildirimleri güncelle (eğer açıksa)
      if (userData?.notifications_enabled) {
        try {
          await notificationService.updateWorkoutNotifications(updatedExercises, true);
          console.log('✅ Bildirimler güncellendi');
        } catch (error) {
          console.log('⚠️ Bildirim güncelleme başarısız:', error);
        }
      }
      
      Alert.alert('Başarılı', 'Egzersiz başarıyla eklendi!');
    } catch (error) {
      console.error('Egzersiz ekleme hatası:', error);
      Alert.alert('Hata', 'Egzersiz eklenirken bir hata oluştu');
    }
  };

  const editExercise = (exercise) => {
    setEditingExercise(exercise);
    setNewExercise({
      name: exercise.name,
      sets: exercise.sets.toString(),
      reps: exercise.reps,
      weight: exercise.weight,
      category: exercise.category
    });
    
    // Egzersizin haftalık tekrar durumunu set et (şimdilik false)
    setWeeklyRepeatEnabled(exercise.weeklyRepeat || false);
    
    setShowEditModal(true);
  };

  const saveEditedExercise = async () => {
    if (!newExercise.name || !newExercise.sets || !newExercise.reps || !newExercise.weight) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const exerciseData = {
        name: newExercise.name,
        sets: parseInt(newExercise.sets),
        reps: newExercise.reps,
        weight: newExercise.weight,
        category: newExercise.category,
        completed: editingExercise.completed,
        program_id: editingExercise.program_id // Mevcut program_id'yi koru
      };

      // Önce local state'i güncelle (anında tepki için)
      const updatedExerciseLocal = {
        ...editingExercise,
        name: newExercise.name,
        sets: parseInt(newExercise.sets),
        reps: newExercise.reps,
        weight: newExercise.weight,
        category: newExercise.category
      };

      setExercises(prev => ({
        ...prev,
        [selectedDay]: prev[selectedDay].map(ex => 
          ex.id === editingExercise.id ? updatedExerciseLocal : ex
        )
      }));

      setNewExercise({ name: '', sets: '', reps: '', weight: '', category: 'Üst Vücut' });
      setEditingExercise(null);
      setShowEditModal(false);
      
      // Supabase'e güncelleme gönder
      try {
        await programService.updateExercise(editingExercise.id, exerciseData);
        console.log('✅ Egzersiz başarıyla güncellendi');
        Alert.alert('Başarılı', 'Egzersiz başarıyla güncellendi!');
      } catch (error) {
        console.log('⚠️ Supabase güncelleme başarısız ama local state güncellendi');
        Alert.alert('Başarılı', 'Egzersiz güncellendi! (Offline mod)');
      }
      
    } catch (error) {
      console.error('❌ Egzersiz güncelleme hatası:', error);
      Alert.alert('Hata', 'Egzersiz güncellenirken bir hata oluştu');
    }
  };

  const deleteExercise = (exerciseId) => {
    Alert.alert(
      'Egzersizi Sil',
      'Bu egzersizi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await programService.deleteExercise(exerciseId);
              
              // Local state'i güncelle
              const updatedExercises = {
                ...exercises,
                [selectedDay]: exercises[selectedDay].filter(ex => ex.id !== exerciseId)
              };
              setExercises(updatedExercises);
              
              // Bildirimleri güncelle (eğer açıksa)
              if (userData?.notifications_enabled) {
                try {
                  await notificationService.updateWorkoutNotifications(updatedExercises, true);
                  console.log('✅ Bildirimler güncellendi');
                } catch (error) {
                  console.log('⚠️ Bildirim güncelleme başarısız:', error);
                }
              }
              
              Alert.alert('Başarılı', 'Egzersiz başarıyla silindi!');
            } catch (error) {
              console.error('Egzersiz silme hatası:', error);
              Alert.alert('Hata', 'Egzersiz silinirken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const toggleExercise = async (exerciseId) => {
    try {
      const exercise = exercises[selectedDay].find(ex => ex.id === exerciseId);
      if (!exercise) return;
      
      const newCompletedStatus = !exercise.completed;
      
      // Önce local state'i güncelle (anında tepki için)
      setExercises(prev => ({
        ...prev,
        [selectedDay]: prev[selectedDay].map(ex => 
          ex.id === exerciseId ? { ...ex, completed: newCompletedStatus } : ex
        )
      }));
      
      // Supabase'e güncelleme gönder
      try {
        await programService.toggleExerciseCompletion(exerciseId, newCompletedStatus);
        console.log('✅ Egzersiz durumu başarıyla güncellendi');
      } catch (error) {
        console.log('⚠️ Supabase güncelleme başarısız ama local state güncellendi');
      }
      
    } catch (error) {
      console.error('❌ Egzersiz durumu güncelleme hatası:', error);
      // Hata durumunda kullanıcıya bilgi verme, çünkü local state zaten güncellenmiş
    }
  };

  const applyWeeklyProgram = (program) => {
    const programData = {
      name: program.name,
      days: program.days
    };

    setWeeklyProgram(programData);
    Alert.alert('Başarılı', `${program.name} programı uygulandı!`);
    setShowWeeklyModal(false);
  };

  const createCustomProgram = async () => {
    if (!customProgram.name || customProgram.selectedDays.length === 0) {
      Alert.alert('Hata', 'Lütfen program adı girin ve en az bir gün seçin');
      return;
    }

    try {
      const currentUserId = userData?.id || userId;
      const programData = {
        name: customProgram.name,
        description: customProgram.description,
        dayExercises: Object.values(customProgram.dayExercises)
      };

      await programService.createWeeklyProgram(currentUserId, programData);
      
      // Verileri yeniden yükle
      await loadExercises();

      Alert.alert(
        'Program Oluşturuldu! 🎉',
        `${customProgram.name} programı 1 aylık takvim için oluşturuldu!\n\nSeçili günler: ${customProgram.selectedDays.join(', ')}\nToplam egzersiz: ${Object.values(customProgram.dayExercises).flat().length}`
      );

      setCustomProgram({ name: '', description: '', selectedDays: [], dayExercises: {} });
      setShowCustomModal(false);
    } catch (error) {
      console.error('Program oluşturma hatası:', error);
      Alert.alert('Hata', 'Program oluşturulurken bir hata oluştu');
    }
  };

  const toggleInlineExerciseForm = (day) => {
    setShowInlineExerciseForm(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const updateDayExerciseInput = (day, field, value) => {
    setDayExerciseInputs(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || { name: '', sets: '', reps: '', weight: '' }),
        [field]: value
      }
    }));
  };

  const addInlineExercise = (day) => {
    const dayInput = dayExerciseInputs[day] || {};
    
    if (!dayInput.name || !dayInput.sets || !dayInput.reps || !dayInput.weight) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    // JavaScript gün standardına göre: Pazartesi=1, Salı=2, Çarşamba=3, Perşembe=4, Cuma=5
    const dayMapping = {
      'Pazartesi': 1,
      'Salı': 2,
      'Çarşamba': 3,
      'Perşembe': 4,
      'Cuma': 5
    };
    const dayIndex = dayMapping[day];
    
    const exercise = {
      id: Date.now(),
      name: dayInput.name,
      sets: parseInt(dayInput.sets),
      reps: dayInput.reps,
      weight: dayInput.weight,
      completed: false
    };

    setCustomProgram(prev => ({
      ...prev,
      dayExercises: {
        ...prev.dayExercises,
        [dayIndex]: [...(prev.dayExercises[dayIndex] || []), exercise]
      }
    }));

    // Sadece o günün form'unu temizle
    setDayExerciseInputs(prev => ({
      ...prev,
      [day]: { name: '', sets: '', reps: '', weight: '' }
    }));
  };

  const todayExercises = exercises[selectedDay] || [];
  const filteredExercises = filter === 'Tüm' 
    ? todayExercises 
    : todayExercises.filter(ex => ex.category === filter);
  const completedCount = filteredExercises.filter(ex => ex.completed).length;
  const totalCount = filteredExercises.length;

  if (isLoading) {
    return (
      <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
              Egzersizler yükleniyor...
            </Text>
            <View style={{
              backgroundColor: colors.primary,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8
            }}>
              <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                📊 Veriler hazırlanıyor
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>
          {/* Header */}
          <View style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Antrenman Programı</Text>
              <TouchableOpacity 
                onPress={() => setShowWeeklyModal(true)}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2
                }}
              >
                <Text style={{ color: colors.background, fontSize: 12, fontWeight: '700' }}>📅 Aylık</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              {completedCount}/{totalCount} egzersiz tamamlandı
            </Text>
          </View>

          {/* Haftalık Takvim */}
          <Card style={{ marginBottom: spacing.lg, backgroundColor: 'rgba(255, 122, 0, 0.05)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                  Bu Hafta
                </Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {weekDays.map((day, index) => {
                const hasExercises = exercises[index] && exercises[index].length > 0;
                const completedCount = hasExercises ? exercises[index].filter(ex => ex.completed).length : 0;
                const totalCount = hasExercises ? exercises[index].length : 0;
                const isToday = index === currentDay;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedDay(index)}
                    style={{
                      backgroundColor: selectedDay === index ? colors.primary : colors.background,
                      borderRadius: 16,
                      padding: 10,
                      alignItems: 'center',
                      minWidth: 44,
                      elevation: selectedDay === index ? 4 : 0,
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedDay === index ? 0.3 : 0,
                      shadowRadius: 4,
                      borderWidth: isToday && selectedDay !== index ? 2 : 0,
                      borderColor: colors.primary
                    }}
                  >
                    <Text style={{ 
                      color: selectedDay === index ? colors.background : colors.textMuted,
                      fontSize: 11,
                      fontWeight: '600',
                      marginBottom: 2
                    }}>
                      {day}
                    </Text>
                    <Text style={{ 
                      color: selectedDay === index ? colors.background : colors.text,
                      fontSize: 18,
                      fontWeight: '800',
                      marginBottom: 4
                    }}>
                      {index + 1}
                    </Text>
                    {hasExercises && (
                      <View style={{
                        backgroundColor: selectedDay === index ? colors.background : (completedCount === totalCount ? '#00D084' : 'rgba(255, 122, 0, 0.3)'),
                        borderRadius: 10,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        minWidth: 20,
                        alignItems: 'center'
                      }}>
                        <Text style={{
                          color: selectedDay === index ? colors.primary : (completedCount === totalCount ? colors.background : colors.text),
                          fontSize: 9,
                          fontWeight: '700'
                        }}>
                          {completedCount}/{totalCount}
                        </Text>
                      </View>
                    )}
                    {!hasExercises && (
                      <View style={{ height: 14 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Filtre Butonları */}
          <View style={{ flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm }}>
            {['Tüm', ...exerciseCategories].map((filterOption) => (
              <TouchableOpacity
                key={filterOption}
                onPress={() => setFilter(filterOption)}
                style={{
                  backgroundColor: filter === filterOption ? colors.primary : colors.background,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: colors.primary
                }}
              >
                <Text style={{
                  color: filter === filterOption ? colors.background : colors.primary,
                  fontSize: 14,
                  fontWeight: '600'
                }}>
                  {filterOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Egzersizler */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
              💪 Bugünkü Egzersizler
            </Text>
            {todayExercises.length > 0 && (
              <View style={{
                backgroundColor: weeklyRepeatEnabled ? 'rgba(0, 208, 132, 0.2)' : 'rgba(255, 122, 0, 0.2)',
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4
              }}>
                <Ionicons 
                  name={weeklyRepeatEnabled ? "repeat" : "calendar"} 
                  size={14} 
                  color={weeklyRepeatEnabled ? '#00D084' : colors.primary} 
                />
                <Text style={{ 
                  color: weeklyRepeatEnabled ? '#00D084' : colors.primary, 
                  fontSize: 12, 
                  fontWeight: '600' 
                }}>
                  {weeklyRepeatEnabled ? 'Haftalık' : 'Tek Seferlik'}
                </Text>
              </View>
            )}
          </View>
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise, index) => (
              <Card key={exercise.id} style={{ 
                marginBottom: spacing.sm,
                backgroundColor: exercise.completed ? 'rgba(0, 208, 132, 0.05)' : colors.card,
                borderLeftWidth: 4,
                borderLeftColor: exercise.completed ? '#00D084' : colors.primary
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <View style={{
                        backgroundColor: exercise.completed ? 'rgba(0, 208, 132, 0.2)' : 'rgba(255, 122, 0, 0.2)',
                        borderRadius: 20,
                        width: 28,
                        height: 28,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 8
                      }}>
                        <Text style={{ 
                          color: exercise.completed ? '#00D084' : colors.primary, 
                          fontSize: 12, 
                          fontWeight: '700' 
                        }}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={{ 
                        color: exercise.completed ? colors.textMuted : colors.text, 
                        fontSize: 16, 
                        fontWeight: '700',
                        textDecorationLine: exercise.completed ? 'line-through' : 'none',
                        flex: 1
                      }}>
                        {exercise.name}
                      </Text>
                      <View style={{
                        backgroundColor: exercise.category === 'Üst Vücut' ? 'rgba(255, 122, 0, 0.2)' : 
                                        exercise.category === 'Alt Vücut' ? 'rgba(0, 208, 132, 0.2)' : 'rgba(123, 104, 238, 0.2)',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        marginLeft: 8
                      }}>
                        <Text style={{ 
                          color: exercise.category === 'Üst Vücut' ? '#FF7A00' : 
                                 exercise.category === 'Alt Vücut' ? '#00D084' : '#7B68EE', 
                          fontSize: 10, 
                          fontWeight: '700' 
                        }}>
                          {exercise.category === 'Üst Vücut' ? '💪' : 
                           exercise.category === 'Alt Vücut' ? '🦵' : '🏃'}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 36 }}>
                      <Ionicons name="barbell" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                        {exercise.sets} set • {exercise.reps} tekrar • {exercise.weight}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                    <TouchableOpacity 
                      onPress={() => editExercise(exercise)}
                      style={{
                        backgroundColor: 'rgba(255, 122, 0, 0.1)',
                        borderRadius: 8,
                        padding: 8
                      }}
                    >
                      <Ionicons name="pencil" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => deleteExercise(exercise.id)}
                      style={{
                        backgroundColor: 'rgba(255, 71, 87, 0.1)',
                        borderRadius: 8,
                        padding: 8
                      }}
                    >
                      <Ionicons name="trash" size={18} color="#FF4757" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleExercise(exercise.id)}
                      style={{
                        backgroundColor: exercise.completed ? '#00D084' : colors.background,
                        borderRadius: 12,
                        padding: 10,
                        borderWidth: 2,
                        borderColor: exercise.completed ? '#00D084' : colors.primary,
                        elevation: exercise.completed ? 2 : 0,
                        shadowColor: '#00D084',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: exercise.completed ? 0.3 : 0,
                        shadowRadius: 4
                      }}
                    >
                      <Ionicons 
                        name={exercise.completed ? "checkmark-circle" : "play-circle"} 
                        size={22} 
                        color={exercise.completed ? colors.background : colors.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card style={{ alignItems: 'center', padding: spacing.xl, backgroundColor: 'rgba(255, 122, 0, 0.05)' }}>
              <View style={{
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                borderRadius: 40,
                width: 80,
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md
              }}>
                <Ionicons name="fitness" size={40} color={colors.primary} />
              </View>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
                Henüz Egzersiz Yok
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                Bugün için egzersiz ekleyerek başlayın!
              </Text>
            </Card>
          )}

          {/* Egzersiz Ekle Butonu */}
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: spacing.md,
              alignItems: 'center',
              marginTop: spacing.md,
              elevation: 4,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8
            }}
          >
            <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700' }}>
              ➕ Egzersiz Ekle
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Egzersiz Ekleme Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                padding: spacing.lg,
                maxHeight: '80%'
              }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg }}>
                Yeni Egzersiz Ekle
              </Text>

              <TextInput
                value={newExercise.name}
                onChangeText={(text) => setNewExercise({...newExercise, name: text})}
                placeholder="Egzersiz adı"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  marginBottom: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              />

              {/* Kategori Seçimi */}
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
                Kategori
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
                {exerciseCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setNewExercise({...newExercise, category})}
                    style={{
                      flex: 1,
                      backgroundColor: newExercise.category === category ? colors.primary : colors.background,
                      borderRadius: 12,
                      padding: spacing.md,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: newExercise.category === category ? colors.primary : colors.border
                    }}
                  >
                    <Text style={{
                      color: newExercise.category === category ? colors.background : colors.text,
                      fontSize: 14,
                      fontWeight: '600'
                    }}>
                      {category === 'Üst Vücut' ? '💪 Üst' :
                       category === 'Alt Vücut' ? '🦵 Alt' : '🏃 Diğer'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
                <TextInput
                  value={newExercise.sets}
                  onChangeText={(text) => setNewExercise({...newExercise, sets: text})}
                  placeholder="Set"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 16,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                />
                <TextInput
                  value={newExercise.reps}
                  onChangeText={(text) => setNewExercise({...newExercise, reps: text})}
                  placeholder="Tekrar"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 16,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                />
                <TextInput
                  value={newExercise.weight}
                  onChangeText={(text) => setNewExercise({...newExercise, weight: text})}
                  placeholder="Ağırlık"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 16,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                />
              </View>

              {/* Her Hafta Tekrarla Switch */}
              <View style={{
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                borderRadius: 12,
                padding: spacing.md,
                marginBottom: spacing.md,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: weeklyRepeatEnabled ? colors.primary : 'transparent'
              }}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="repeat" size={20} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                      Her Hafta Tekrarla
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    Bu program her hafta otomatik tekrarlanacak
                  </Text>
                </View>
                <Switch
                  value={weeklyRepeatEnabled}
                  onValueChange={setWeeklyRepeatEnabled}
                  trackColor={{ false: colors.textMuted, true: colors.primary }}
                  thumbColor={weeklyRepeatEnabled ? '#00D084' : colors.background}
                  ios_backgroundColor={colors.textMuted}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TouchableOpacity
                  onPress={addExercise}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    elevation: 3,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700' }}>
                    ✅ Ekle
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: colors.primary
                  }}
                >
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>
                    ❌ İptal
                  </Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Egzersiz Düzenleme Modal */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEditModal(false)}
        >
          <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                padding: spacing.lg,
                maxHeight: '80%'
              }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg }}>
                Egzersizi Düzenle
              </Text>

              <TextInput
                value={newExercise.name}
                onChangeText={(text) => setNewExercise({...newExercise, name: text})}
                placeholder="Egzersiz adı"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  marginBottom: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              />

              {/* Kategori Seçimi */}
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
                Kategori
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
                {exerciseCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setNewExercise({...newExercise, category})}
                    style={{
                      flex: 1,
                      backgroundColor: newExercise.category === category ? colors.primary : colors.background,
                      borderRadius: 12,
                      padding: spacing.md,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: newExercise.category === category ? colors.primary : colors.border
                    }}
                  >
                    <Text style={{
                      color: newExercise.category === category ? colors.background : colors.text,
                      fontSize: 14,
                      fontWeight: '600'
                    }}>
                      {category === 'Üst Vücut' ? '💪 Üst' :
                       category === 'Alt Vücut' ? '🦵 Alt' : '🏃 Diğer'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
                <TextInput
                  value={newExercise.sets}
                  onChangeText={(text) => setNewExercise({...newExercise, sets: text})}
                  placeholder="Set"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 16,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                />
                <TextInput
                  value={newExercise.reps}
                  onChangeText={(text) => setNewExercise({...newExercise, reps: text})}
                  placeholder="Tekrar"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 16,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                />
                <TextInput
                  value={newExercise.weight}
                  onChangeText={(text) => setNewExercise({...newExercise, weight: text})}
                  placeholder="Ağırlık"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 16,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                />
              </View>

              {/* Her Hafta Tekrarla Switch - Düzenleme Modalında */}
              <View style={{
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                borderRadius: 12,
                padding: spacing.md,
                marginBottom: spacing.md,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: weeklyRepeatEnabled ? colors.primary : 'transparent'
              }}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="repeat" size={20} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                      Her Hafta Tekrarla
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    Bu egzersiz her hafta otomatik tekrarlanacak
                  </Text>
                </View>
                <Switch
                  value={weeklyRepeatEnabled}
                  onValueChange={setWeeklyRepeatEnabled}
                  trackColor={{ false: colors.textMuted, true: colors.primary }}
                  thumbColor={weeklyRepeatEnabled ? '#00D084' : colors.background}
                  ios_backgroundColor={colors.textMuted}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TouchableOpacity
                  onPress={saveEditedExercise}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700' }}>
                    Kaydet
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.primary
                  }}
                >
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>
                    İptal
                  </Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Aylık Program Modal */}
        <Modal
          visible={showWeeklyModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowWeeklyModal(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.md
          }}>
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: spacing.lg,
              width: '90%',
              maxHeight: '80%'
            }}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.sm }}>
                📅 Aylık Program Ekle
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg }}>
                Hazır programları seçin veya kendi programınızı oluşturun
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Push-Pull-Legs Program */}
                <TouchableOpacity
                  onPress={() => applyWeeklyProgram({
                    name: 'Push-Pull-Legs',
                    days: ['Pazartesi', 'Çarşamba', 'Cuma']
                  })}
                  style={{
                    backgroundColor: 'rgba(255, 122, 0, 0.1)',
                    borderRadius: 12,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                    borderWidth: 1,
                    borderColor: colors.primary
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
                    💪 Push-Pull-Legs
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                    Pazartesi, Çarşamba, Cuma
                  </Text>
                </TouchableOpacity>

                {/* Upper-Lower Split */}
                <TouchableOpacity
                  onPress={() => applyWeeklyProgram({
                    name: 'Upper-Lower Split',
                    days: ['Pazartesi', 'Salı', 'Perşembe', 'Cuma']
                  })}
                  style={{
                    backgroundColor: 'rgba(0, 208, 132, 0.1)',
                    borderRadius: 12,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                    borderWidth: 1,
                    borderColor: '#00D084'
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
                    🏋️ Upper-Lower Split
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                    Pazartesi, Salı, Perşembe, Cuma
                  </Text>
                </TouchableOpacity>

                {/* Full Body */}
                <TouchableOpacity
                  onPress={() => applyWeeklyProgram({
                    name: 'Full Body',
                    days: ['Pazartesi', 'Çarşamba', 'Cuma']
                  })}
                  style={{
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                    borderRadius: 12,
                    padding: spacing.md,
                    marginBottom: spacing.lg,
                    borderWidth: 1,
                    borderColor: '#8A2BE2'
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
                    🔥 Full Body
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                    Pazartesi, Çarşamba, Cuma
                  </Text>
                </TouchableOpacity>

                {/* Özel Program Oluştur */}
                <TouchableOpacity
                  onPress={() => {
                    setShowWeeklyModal(false);
                    setTimeout(() => setShowCustomModal(true), 100);
                  }}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 16,
                    padding: spacing.lg,
                    alignItems: 'center',
                    elevation: 4,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 18, fontWeight: '700' }}>
                    ✨ Özel Program Oluştur
                  </Text>
                  <Text style={{ color: colors.background, fontSize: 14, opacity: 0.9, marginTop: 4 }}>
                    Kendi antrenman programınızı tasarlayın
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowWeeklyModal(false)}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  marginTop: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.primary
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>
                  Kapat
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Özel Program Modal */}
        <Modal
          visible={showCustomModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCustomModal(false)}
        >
          <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: spacing.md
            }}>
              <View style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: spacing.lg,
                width: '95%',
                maxHeight: '90%'
              }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                  ✨ Özel Program Oluştur
                </Text>
                <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Program Adı */}
                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>
                    Program Adı
                  </Text>
                  <TextInput
                    value={customProgram.name}
                    onChangeText={(text) => setCustomProgram({...customProgram, name: text})}
                    placeholder="Örn: Kişisel Antrenman Programı"
                    placeholderTextColor={colors.textMuted}
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 16,
                      color: colors.text,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: colors.primary
                    }}
                  />
                </View>

                {/* Antrenman Günleri */}
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>
                  Antrenman Günleri
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
                  {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'].map((day) => {
                    const isSelected = customProgram.selectedDays.includes(day);
                    // JavaScript gün standardına göre mapping
                    const dayMapping = {
                      'Pazartesi': 1,
                      'Salı': 2,
                      'Çarşamba': 3,
                      'Perşembe': 4,
                      'Cuma': 5
                    };
                    const dayIndex = dayMapping[day];
                    
                    return (
                      <TouchableOpacity
                        key={day}
                        onPress={() => {
                          if (isSelected) {
                            // Günü kaldır
                            setCustomProgram({
                              ...customProgram,
                              selectedDays: customProgram.selectedDays.filter(d => d !== day),
                              dayExercises: {
                                ...customProgram.dayExercises,
                                [dayIndex]: [] // O günün egzersizlerini de temizle
                              }
                            });
                          } else {
                            // Günü seç
                            setCustomProgram({
                              ...customProgram,
                              selectedDays: [...customProgram.selectedDays, day]
                            });
                          }
                        }}
                        style={{
                          backgroundColor: isSelected ? colors.primary : colors.background,
                          borderRadius: 20,
                          paddingHorizontal: 20,
                          paddingVertical: 12,
                          borderWidth: 2,
                          borderColor: colors.primary
                        }}
                      >
                        <Text style={{
                          color: isSelected ? colors.background : colors.primary,
                          fontSize: 14,
                          fontWeight: '700'
                        }}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Seçili günlerin egzersiz özeti */}
                {customProgram.selectedDays.length > 0 && (
                  <Card style={{ backgroundColor: 'rgba(255, 122, 0, 0.1)' }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>
                      📋 Program Özeti
                    </Text>
                    {customProgram.selectedDays.map(day => {
                      // JavaScript gün standardına göre mapping
                      const dayMapping = {
                        'Pazartesi': 1,
                        'Salı': 2,
                        'Çarşamba': 3,
                        'Perşembe': 4,
                        'Cuma': 5
                      };
                      const dayIndex = dayMapping[day];
                      const dayExercises = customProgram.dayExercises && customProgram.dayExercises[dayIndex] || [];
                      const isInlineEditing = showInlineExerciseForm[day];
                      const dayInput = dayExerciseInputs[day] || { name: '', sets: '', reps: '', weight: '' };
                      
                      return (
                        <View key={day} style={{ marginBottom: spacing.md }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                              {day}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={{ color: colors.textMuted, fontSize: 12, marginRight: 8 }}>
                                {dayExercises.length} egzersiz
                              </Text>
                              <TouchableOpacity onPress={() => toggleInlineExerciseForm(day)}>
                                <Ionicons name={isInlineEditing ? "close-circle" : "add-circle"} size={20} color={colors.primary} />
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          {/* Inline Egzersiz Ekleme Formu */}
                          {isInlineEditing && (
                            <Card style={{ backgroundColor: 'rgba(255, 122, 0, 0.15)', borderWidth: 2, borderColor: colors.primary, marginBottom: spacing.sm }}>
                              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' }}>
                                💪 {day} - Yeni Egzersiz Ekle
                              </Text>
                              
                              <View style={{ marginBottom: spacing.sm }}>
                                <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 6, fontWeight: '600' }}>Egzersiz Adı</Text>
                                <TextInput
                                  value={dayInput.name}
                                  onChangeText={(text) => updateDayExerciseInput(day, 'name', text)}
                                  placeholder="Örn: Dumbbell Bicep"
                                  placeholderTextColor={colors.textMuted}
                                  style={{
                                    backgroundColor: colors.background,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: colors.text,
                                    fontSize: 14,
                                    borderWidth: 1,
                                    borderColor: colors.primary
                                  }}
                                />
                              </View>

                              <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm }}>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4, fontWeight: '600' }}>Set</Text>
                                  <TextInput
                                    value={dayInput.sets}
                                    onChangeText={(text) => updateDayExerciseInput(day, 'sets', text)}
                                    placeholder="2"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    style={{
                                      backgroundColor: colors.background,
                                      borderRadius: 8,
                                      padding: 10,
                                      color: colors.text,
                                      fontSize: 14,
                                      textAlign: 'center',
                                      borderWidth: 1,
                                      borderColor: colors.primary
                                    }}
                                  />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4, fontWeight: '600' }}>Tekrar</Text>
                                  <TextInput
                                    value={dayInput.reps}
                                    onChangeText={(text) => updateDayExerciseInput(day, 'reps', text)}
                                    placeholder="10-12"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    style={{
                                      backgroundColor: colors.background,
                                      borderRadius: 8,
                                      padding: 10,
                                      color: colors.text,
                                      fontSize: 14,
                                      textAlign: 'center',
                                      borderWidth: 1,
                                      borderColor: colors.primary
                                    }}
                                  />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4, fontWeight: '600' }}>Ağırlık</Text>
                                  <TextInput
                                    value={dayInput.weight}
                                    onChangeText={(text) => updateDayExerciseInput(day, 'weight', text)}
                                    placeholder="15kg"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    style={{
                                      backgroundColor: colors.background,
                                      borderRadius: 8,
                                      padding: 10,
                                      color: colors.text,
                                      fontSize: 14,
                                      textAlign: 'center',
                                      borderWidth: 1,
                                      borderColor: colors.primary
                                    }}
                                  />
                                </View>
                              </View>

                              <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                                <TouchableOpacity
                                  onPress={() => addInlineExercise(day)}
                                  style={{
                                    flex: 1,
                                    backgroundColor: '#00D084',
                                    borderRadius: 8,
                                    padding: 10,
                                    alignItems: 'center'
                                  }}
                                >
                                  <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                                    ✅ Ekle
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => toggleInlineExerciseForm(day)}
                                  style={{
                                    flex: 1,
                                    backgroundColor: colors.background,
                                    borderRadius: 8,
                                    padding: 10,
                                    alignItems: 'center'
                                  }}
                                >
                                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                                    ❌ İptal
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </Card>
                          )}
                          
                          {dayExercises.length > 0 && (
                            <View style={{ paddingLeft: spacing.sm }}>
                              {dayExercises.slice(0, 2).map((exercise, index) => (
                                <Text key={exercise.id} style={{ color: colors.textMuted, fontSize: 12 }}>
                                  • {exercise.name} - {exercise.sets} set
                                </Text>
                              ))}
                              {dayExercises.length > 2 && (
                                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                                  • +{dayExercises.length - 2} egzersiz daha...
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </Card>
                )}

                {/* Kaydet Butonu */}
                <TouchableOpacity
                  onPress={createCustomProgram}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 16,
                    padding: spacing.lg,
                    alignItems: 'center',
                    marginTop: spacing.lg,
                    elevation: 4,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8
                  }}
                >
                  <Text style={{ color: colors.background, fontSize: 18, fontWeight: '700' }}>
                    💾 Programı Kaydet
                  </Text>
                </TouchableOpacity>
              </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ProgramScreen;