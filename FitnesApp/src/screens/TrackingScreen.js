import React, { useState, useContext, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Header from '../components/Header';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';

// trackingService'i dene, yoksa devam et
let trackingService = null;
let motivationService = null;
try {
  trackingService = require('../services/trackingService').default;
} catch (error) {
  console.warn('Tracking service yüklenemedi:', error.message);
}

try {
  motivationService = require('../services/motivationService').default;
} catch (error) {
  console.warn('Motivation service yüklenemedi:', error.message);
}

// supabase'i import et
import { supabase } from '../config/supabase';

const screenWidth = Dimensions.get('window').width;

export default function TrackingScreen() {
  const { colors, isDarkMode } = useTheme();
  const { userData, isLoading: userLoading, updateUserData } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);
  const userUUID = userData?.id;

  // Chart config - dinamik renkler kullanıyor
  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.backgroundAlt,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 122, 0, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(26, 26, 26, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 0.5,
    },
  };

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedTracking, setSelectedTracking] = useState('weight');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [newWeight, setNewWeight] = useState('');
  const [newExercise, setNewExercise] = useState('');
  const [newReps, setNewReps] = useState('');

  // Hedef kiloya ulaşıldı mı kontrol et
  const checkTargetReached = (currentWeight, targetWeight) => {
    if (!currentWeight || !targetWeight || targetWeight <= 0) return false;
    const tolerance = 1.0; // 1kg tolerans
    return Math.abs(currentWeight - targetWeight) <= tolerance;
  };

  // Hedef kiloya ulaşıldığında yeni hedef belirleme modalı göster
  const showNewTargetModal = (currentWeight, oldTargetWeight) => {
    Alert.alert(
      t.target_reached_title || '🎉 Hedef Kiloya Ulaşıldı!',
      `${t.target_reached_message || 'Tebrikler! Hedef kilonuz'} ${oldTargetWeight}kg'ya ulaştınız.\n\n${t.current_weight || 'Mevcut kilonuz'}: ${currentWeight}kg\n\n${t.set_new_target || 'Yeni bir hedef kilo belirlemelisiniz.'}.`,
      [
        {
          text: t.set_target || 'Hedef Belirle',
          onPress: () => setShowGoalModal(true)
        },
        {
          text: t.later || 'Daha Sonra',
          style: 'cancel'
        }
      ]
    );
  };

  // Güvenli ilerleme hesaplama fonksiyonu
  const calculateProgress = (targetWeight, firstWeight, lastWeight) => {
    // Tüm değerlerin geçerli olduğunu kontrol et
    if (!targetWeight || !firstWeight || !lastWeight || 
        targetWeight <= 0 || firstWeight <= 0 || lastWeight <= 0 ||
        isNaN(targetWeight) || isNaN(firstWeight) || isNaN(lastWeight)) {
      return 0;
    }

    let progress = 0;
    
    if (targetWeight < firstWeight) {
      // Kilo verme hedefi
      const totalLossNeeded = firstWeight - targetWeight;
      const actualLoss = firstWeight - lastWeight;
      if (totalLossNeeded > 0) {
        progress = (actualLoss / totalLossNeeded) * 100;
      }
    } else {
      // Kilo alma hedefi
      const totalGainNeeded = targetWeight - firstWeight;
      const actualGain = lastWeight - firstWeight;
      if (totalGainNeeded > 0) {
        progress = (actualGain / totalGainNeeded) * 100;
      }
    }
    
    // 0-100 arasında sınırla ve NaN kontrolü yap
    progress = Math.max(0, Math.min(100, progress));
    return isNaN(progress) ? 0 : progress;
  };

  // Renk hesaplama fonksiyonları
  const getProgressColor = (progress, isWeightLoss = false) => {
    // progress: 0-100 arası yüzde değeri
    if (progress >= 80) return '#00D084'; // Çok iyi - yeşil
    if (progress >= 60) return '#7FD084'; // İyi - açık yeşil
    if (progress >= 40) return '#FFD700'; // Orta - sarı
    if (progress >= 20) return '#FFA500'; // Az - turuncu
    return '#FF7A00'; // Başlangıç - primary turuncu
  };

  const getWeightChangeColor = (change, targetWeight, currentWeight) => {
    // Kilo verme hedefi mi, alma hedefi mi?
    const isWeightLoss = targetWeight < currentWeight;
    
    if (isWeightLoss) {
      // Kilo verme hedefi - azalırsa yeşil, artarsa kırmızı
      if (change <= -2) return '#00D084'; // Çok iyi
      if (change <= -1) return '#7FD084'; // İyi
      if (change < 0) return '#FFD700'; // Biraz
      if (change === 0) return '#FFA500'; // Değişim yok
      return '#FF4757'; // Arttı - kötü
    } else {
      // Kilo alma hedefi - artarsa yeşil, azalırsa kırmızı
      if (change >= 2) return '#00D084'; // Çok iyi
      if (change >= 1) return '#7FD084'; // İyi
      if (change > 0) return '#FFD700'; // Biraz
      if (change === 0) return '#FFA500'; // Değişim yok
      return '#FF4757'; // Azaldı - kötü
    }
  };

  const getStrengthChangeColor = (change) => {
    // Ağırlık takibi - artarsa yeşil
    if (change >= 10) return '#00D084'; // Çok iyi artış
    if (change >= 5) return '#7FD084'; // İyi artış
    if (change > 0) return '#FFD700'; // Az artış
    if (change === 0) return '#FFA500'; // Değişim yok
    return '#FF4757'; // Azaldı - kötü
  };
  
  // Bilinen egzersizler listesi
  const knownExercises = [
    'Bench Press',
    'Squat', 
    'Deadlift',
    'Overhead Press',
    'Pull Up',
    'Push Up',
    'Barbell Row',
    'Dumbbell Press',
    'Lateral Raise',
    'Bicep Curl',
    'Tricep Extension',
    'Leg Press',
    'Calf Raise',
    'Plank',
    'Burpee'
  ];
  
  // Goal states
  const [weightGoal, setWeightGoal] = useState('');
  const [strengthGoal, setStrengthGoal] = useState('');
  const [selectedExerciseForGoal, setSelectedExerciseForGoal] = useState('');
  const [exerciseTargets, setExerciseTargets] = useState({});
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [weightData, setWeightData] = useState([]);
  const [strengthData, setStrengthData] = useState([]);

  const periodMapping = {
    'weekly': 'weekly',
    'monthly': 'monthly',
    'yearly': 'yearly'
  };

  // Ağırlık verilerini egzersiz ismine göre grupla ve her egzersiz için ayrı kart oluştur
  const getGroupedStrengthData = () => {
    if (!strengthData?.length) return [];
    
    const exerciseGroups = {};
    strengthData.forEach(item => {
      // Egzersiz ismini agresif şekilde normalize et
      let name = (item.exercise_name || item.name || '').trim();
      
      // Çok basit ve etkili normalizasyon
      name = name.toLowerCase()
        .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluğa çevir
        .replace(/[^\w\s]/g, '') // Özel karakterleri kaldır
        .replace(/\s+/g, ' ') // Tekrar boşlukları temizle
        .trim();
      
      // Ana egzersiz türlerini belirle (en yaygın kelimeyi al)
      const words = name.split(' ').filter(w => w.length > 0);
      
      if (words.includes('squat')) {
        name = 'squat';
      } else if (words.includes('bench') && words.includes('press')) {
        name = 'bench press';
      } else if (words.includes('deadlift')) {
        name = 'deadlift';
      } else if (words.includes('overhead') && words.includes('press')) {
        name = 'overhead press';
      } else if (words.includes('pullup') || words.includes('pull')) {
        name = 'pull up';
      } else if (words.includes('pushup') || words.includes('push')) {
        name = 'push up';
      } else {
        // İlk kelimeyi ana egzersiz olarak kullan
        name = words[0] || name;
      }
      
      // Eğer boş kaldıysa orijinal ismi kullan
      if (!name) {
        name = (item.exercise_name || item.name || 'bilinmeyen').toLowerCase().trim();
      }
      
      console.log('🔍 Egzersiz normalizasyonu:', {
        orijinal: item.exercise_name || item.name,
        normalize: name,
        words: words,
        weight: item.max_weight || item.weight || item.value
      });
      
      // Normalize edilmiş ismi key olarak kullan, orijinal ismi display için sakla
      const normalizedKey = name;
      const displayName = item.exercise_name || item.name || 'Bilinmeyen Egzersiz';
      
      const weight = parseFloat(item.max_weight || item.weight || item.value);
      const date = item.measurement_date || item.date;
      
      if (!exerciseGroups[normalizedKey]) {
        exerciseGroups[normalizedKey] = {
          name: displayName,
          normalizedKey: normalizedKey,
          maxWeight: weight,
          history: [{ weight, date }]
        };
        console.log('✅ Yeni egzersiz grubu oluşturuldu:', normalizedKey);
      } else {
        if (weight > exerciseGroups[normalizedKey].maxWeight) {
          exerciseGroups[normalizedKey].maxWeight = weight;
        }
        exerciseGroups[normalizedKey].history.push({ weight, date });
        console.log('➕ Mevcut gruba eklendi:', normalizedKey, 'Toplam kayıt:', exerciseGroups[normalizedKey].history.length);
      }
    });
    
    console.log('📊 Toplam egzersiz grupları:', Object.keys(exerciseGroups));
    
    // En yüksek değerlerine göre sırala ve history'yi tarihe göre sırala (YENİ → ESKİ)
    return Object.values(exerciseGroups)
      .map(exercise => ({
        ...exercise,
        history: exercise.history.sort((a, b) => new Date(b.date) - new Date(a.date)) // YENİ → ESKİ
      }))
      .sort((a, b) => b.maxWeight - a.maxWeight)
      .slice(0, 10); // Maksimum 10 egzersiz
  };

  // Kilo verilerini normalize et (tutarsızlıkları gider)
  const normalizeWeightData = (data) => {
    if (!data?.length) return [];
    
    const normalized = data.map(item => {
      let weight = item.weight || item.value;
      
      // String ise parseFloat ile sayıya çevir
      if (typeof weight === 'string') {
        weight = parseFloat(weight.replace(/[^\d.,]/g, '').replace(',', '.'));
      }
      
      // Mantıklı kilo aralığında kontrol et (20-300kg arası)
      if (weight < 20 || weight > 300 || isNaN(weight)) {
        console.warn('⚠️ Anormal kilo değeri:', weight, 'Kayıt atlandı');
        return null;
      }
      
      return {
        ...item,
        weight: weight,
        value: weight, // Tutarlılık için
        date: item.measurement_date || item.created_at || item.date
      };
    }).filter(item => item !== null); // null kayıtları filtrele
    
    // Tarih sırasına göre sırala (en eski önce, en yeni sonda)
    const sorted = normalized.sort((a, b) => {
      const dateA = new Date(a.measurement_date || a.date || a.created_at);
      const dateB = new Date(b.measurement_date || b.date || b.created_at);
      return dateA - dateB; // Eski tarihler önce (küçükten büyüğe)
    });
    
    console.log('📊 normalizeWeightData sonucu:', {
      inputCount: data.length,
      outputCount: sorted.length,
      firstEntry: sorted[0],
      lastEntry: sorted[sorted.length - 1],
      allEntries: sorted.map(item => ({
        weight: item.weight,
        date: item.measurement_date || item.date,
        created_at: item.created_at
      }))
    });
    
    return sorted;
  };

  // Seçilen egzersize göre o egzersizin verilerini getir
  const getExerciseSpecificData = (exerciseName) => {
    if (!strengthData?.length || !exerciseName) return [];
    
    // Egzersiz ismini normalize et
    const normalizedName = exerciseName.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const words = normalizedName.split(' ').filter(w => w.length > 0);
    let searchKey = normalizedName;
    
    if (words.includes('squat')) {
      searchKey = 'squat';
    } else if (words.includes('bench') && words.includes('press')) {
      searchKey = 'bench press';
    } else if (words.includes('deadlift')) {
      searchKey = 'deadlift';
    } else if (words.includes('overhead') && words.includes('press')) {
      searchKey = 'overhead press';
    }
    
    // Bu egzersize ait tüm kayıtları filtrele
    const exerciseData = strengthData.filter(item => {
      const itemName = (item.exercise_name || item.name || '').toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const itemWords = itemName.split(' ').filter(w => w.length > 0);
      
      let matches = false;
      
      if (searchKey === 'squat') {
        matches = itemWords.includes('squat');
      } else if (searchKey === 'bench press') {
        matches = itemWords.includes('bench') && itemWords.includes('press');
      } else if (searchKey === 'deadlift') {
        matches = itemWords.includes('deadlift');
      } else if (searchKey === 'overhead press') {
        matches = itemWords.includes('overhead') && itemWords.includes('press');
      } else {
        matches = itemName.includes(searchKey);
      }
      
      return matches;
    });
    
    return exerciseData;
  };

  // Load exercise targets from AsyncStorage
  useEffect(() => {
    const loadExerciseTargets = async () => {
      try {
        const targets = {};
        for (const exercise of knownExercises) {
          const key = `target_${exercise.toLowerCase().replace(/\s+/g, '_')}`;
          const value = await AsyncStorage.getItem(key);
          if (value) {
            targets[exercise] = parseFloat(value);
          }
        }
        setExerciseTargets(targets);
      } catch (error) {
        console.log('Hedef değerleri yüklenemedi:', error);
      }
    };
    
    loadExerciseTargets();
  }, []);

  // Load data when component mounts or dependencies change
  useEffect(() => {
    if (userUUID && trackingService && !userData?.isOffline) {
      loadData();
    }
  }, [userUUID, selectedPeriod, selectedTracking, userData?.current_weight, userData?.target_weight]);

  const loadData = async () => {
    if (!userUUID || !trackingService || userData?.isOffline) {
      console.log('⚠️ Veri yüklenemedi - User:', !!userUUID, 'Service:', !!trackingService, 'Offline:', userData?.isOffline);
      return;
    }
    
    setLoading(true);
    console.log('🔄 Veriler yükleniyor...', { userUUID, selectedPeriod, selectedTracking });
    
    try {
      const period = periodMapping[selectedPeriod];
      
      // Dashboard stats
      try {
        console.log('📊 Dashboard istatistikleri getiriliyor...');
        const stats = await trackingService.getTrackingDashboardStats(userUUID);
        console.log('📊 Dashboard stats sonucu:', stats);
        
        if (stats && (stats.success || stats.stats)) {
          setDashboardStats(stats.stats || stats);
        } else {
          setDashboardStats({
            total_weight_loss: 0,
            total_strength_gain: 0,
            active_days: 0,
            current_weight: userData?.current_weight || 70,
            target_weight: userData?.target_weight || 65,
            goal_progress: 0,
            recent_entries: []
          });
        }
      } catch (statsError) {
        console.log('⚠️ Dashboard stats hatası:', statsError.message);
        setDashboardStats({
          total_weight_loss: 0,
          total_strength_gain: 0,
          active_days: 0,
          current_weight: userData?.current_weight || 70,
          target_weight: userData?.target_weight || 65,
          goal_progress: 0,
          recent_entries: []
        });
      }

      // Load tracking data
      if (selectedTracking === 'weight') {
        try {
          console.log('⚖️ Kilo verileri getiriliyor...', { userUUID, period });
          const wData = await trackingService.getWeightData(userUUID, period);
          console.log('⚖️ Kilo verileri sonucu:', wData);
          
          if (wData && (wData.success || wData.data)) {
            setWeightData(wData.data || wData);
          } else {
            setWeightData([]);
          }
        } catch (weightError) {
          console.log('⚠️ Kilo verileri hatası:', weightError.message);
          setWeightData([]);
        }
      } else {
        try {
          console.log('🏋️ Ağırlık verileri getiriliyor...', { userUUID, period });
          const sData = await trackingService.getStrengthData(userUUID, period);
          console.log('🏋️ Ağırlık verileri sonucu:', sData);
          
          if (sData && (sData.success || sData.data)) {
            // Ağırlık verilerini tarihe göre sırala (YENİ → ESKİ)
            const rawData = sData.data || sData;
            const sortedData = [...rawData].sort((a, b) => {
              const dateA = new Date(a.measurement_date || a.date || a.created_at);
              const dateB = new Date(b.measurement_date || b.date || b.created_at);
              return dateB - dateA; // YENİ → ESKİ
            });
            console.log('🏋️ Ağırlık verileri sıralandı (YENİ → ESKİ):', {
              ilkVeri: sortedData[0],
              sonVeri: sortedData[sortedData.length - 1]
            });
            setStrengthData(sortedData);
          } else {
            setStrengthData([]);
          }
        } catch (strengthError) {
          console.log('⚠️ Ağırlık verileri hatası:', strengthError.message);
          setStrengthData([]);
        }
      }
    } catch (error) {
      console.log('❌ Genel veri yükleme hatası:', error.message);
    } finally {
      setLoading(false);
      console.log('🏁 Veri yükleme tamamlandı');
    }
  };

  const handleSaveData = async () => {
    if (!userUUID || userData?.isOffline) {
      Alert.alert(t.no_backend_connection || 'Backend Bağlantısı Yok', t.please_upload_sql || 'Lütfen SUPABASE_MASTER_SETUP.sql dosyasını Supabase\'e yükleyin.');
      return;
    }

    if (!trackingService) {
      Alert.alert(t.error || 'Hata', t.tracking_service_error || 'Tracking service yüklenemedi.');
      return;
    }
    
    // Validation
    if (selectedTracking === 'weight' && (!newWeight || newWeight.trim() === '')) {
      Alert.alert(t.warning || 'Uyarı', t.please_enter_weight || 'Lütfen kilo değeri girin');
      return;
    }

    // Hedef kilo kontrolü - kilo takibi için
    if (selectedTracking === 'weight') {
      const targetWeight = parseFloat(userData?.target_weight || 0);
      if (!targetWeight || targetWeight <= 0) {
        Alert.alert(
          t.target_weight_required || 'Hedef Kilo Gerekli',
          t.target_weight_required_message || 'Kilo verisi eklemek için önce bir hedef kilo belirlemeniz gerekiyor.',
          [
            {
              text: t.set_target || 'Hedef Belirle',
              onPress: () => setShowGoalModal(true)
            },
            {
              text: t.cancel || 'İptal',
              style: 'cancel'
            }
          ]
        );
        return;
      }
    }

    if (selectedTracking === 'strength' && (!newExercise || !newReps || newExercise.trim() === '' || newReps.trim() === '')) {
      Alert.alert(t.warning || 'Uyarı', t.please_enter_exercise_weight || 'Lütfen egzersiz adı ve ağırlık bilgisi girin');
      return;
    }

    setSaving(true);
    
    try {
      if (selectedTracking === 'weight') {
        const result = await trackingService.addWeightEntry(
          userUUID,
          parseFloat(newWeight),
          new Date().toISOString().split('T')[0],
          null
        );

        if (result?.success) {
          const newWeightValue = parseFloat(newWeight);
          const currentTargetWeight = parseFloat(userData?.target_weight || 0);
          
          // Profil ekranındaki mevcut kiloyu güncelle
          if (userData && updateUserData) {
            updateUserData({ current_weight: newWeightValue });
          }
          
          // Verileri yeniden yükle (Dashboard'ı güncellemek için)
          setTimeout(() => {
            loadData();
          }, 500);
          
          // Hedef kiloya ulaşıldı mı kontrol et
          if (checkTargetReached(newWeightValue, currentTargetWeight)) {
            // Hedef kiloya ulaşıldı, yeni hedef belirleme modalı göster
            setTimeout(() => {
              showNewTargetModal(newWeightValue, currentTargetWeight);
            }, 1000); // 1 saniye bekle ki başarı mesajı görünsün
          } else {
            Alert.alert(t.success || 'Başarılı', t.weight_data_saved || 'Kilo verisi kaydedildi!');
          }
          
          setShowAddModal(false);
          setNewWeight('');
          
          // Başarım kontrolü
          if (motivationService && userUUID) {
            setTimeout(async () => {
              try {
                console.log('🔍 Başarım kontrolü başlıyor...');
                console.log('userUUID:', userUUID);
                console.log('motivationService:', !!motivationService);
                
                // Gerçek verileri hesapla
                const currentWeight = parseFloat(newWeight);
                const targetWeight = parseFloat(userData?.target_weight || dashboardStats?.target_weight || 0);
                const normalizedWeightData = normalizeWeightData(weightData);
                const firstWeight = normalizedWeightData.length > 0 ? normalizedWeightData[0].weight : currentWeight; // En eski
                const weightLoss = firstWeight > currentWeight ? firstWeight - currentWeight : 0;
                const targetReached = targetWeight > 0 && Math.abs(currentWeight - targetWeight) <= 1; // 1kg tolerans
                
                const userStats = {
                  hasFirstEntry: true,
                  totalEntries: (weightData?.length || 0) + 1,
                  weightLoss: weightLoss,
                  strengthGain: 0,
                  targetReached: targetReached,
                  currentWeight: currentWeight,
                  targetWeight: targetWeight,
                  trackingType: 'weight' // Kilo takibi olduğunu belirt
                };
                
                console.log('📊 Başarım kontrolü için userStats:', userStats);
                console.log('🎯 Hedef kontrolü:', {
                  currentWeight,
                  targetWeight,
                  targetReached,
                  difference: Math.abs(currentWeight - targetWeight)
                });
                
                const result = await motivationService.checkAndAddAchievements(userUUID, userStats, language);
                console.log('🏆 Başarım kontrolü sonucu:', result);
                
                if (result.success && result.data.length > 0) {
                  console.log('🎉 Yeni başarım(lar) kazanıldı:', result.data.length);
                  // Başarım kazanıldığında kullanıcıya bildir
                  result.data.forEach((achievement, index) => {
                    setTimeout(() => {
                      Alert.alert(
                        '🎉 Yeni Başarım!', 
                        `${achievement.title}\n\n${achievement.description || ''}`,
                        [{ text: 'Harika!', style: 'default' }]
                      );
                    }, index * 500); // Her başarım için 500ms gecikme
                  });
                  
                  console.log('✅ Başarımlar başarıyla eklendi ve bildirim gösterildi');
                } else {
                  console.log('ℹ️ Bu kayıt için yeni başarım kazanılmadı');
                }
              } catch (error) {
                console.error('❌ Başarım kontrolü hatası:', error);
              }
            }, 1000);
          } else {
            console.log('❌ Başarım kontrolü yapılamadı:', {
              motivationService: !!motivationService,
              userUUID: !!userUUID
            });
          }
          
          // Verileri yeniden yükle
          setTimeout(() => {
            loadData();
          }, 500);
        } else {
          throw new Error(result?.message || 'Kaydetme başarısız');
        }
      } else {
        const { reps, weight } = trackingService.parseRepsAndWeight(newReps);
        
        if (!weight || weight === 0) {
          Alert.alert(t.error || 'Hata', t.invalid_weight_format || 'Geçersiz ağırlık formatı. Örnek: 8x65kg');
          setSaving(false);
          return;
        }

        const result = await trackingService.addStrengthEntry(
          userUUID,
          newExercise,
          weight,
          reps,
          new Date().toISOString().split('T')[0],
          null
        );

        if (result?.success) {
          if (result.is_new_record) {
            Alert.alert(
              t.new_record_title || '🎉 Yeni Rekor!',
              `${newExercise} ${t.exercise_new_record || 'egzersizinde yeni rekorunuz'}: ${weight}kg!\n${result.improvement}kg ${t.improvement || 'gelişim'}!`
            );
          } else {
            Alert.alert(t.success || 'Başarılı', t.strength_data_saved || 'Ağırlık verisi kaydedildi!');
          }
          setShowAddModal(false);
          setNewExercise('');
          setNewReps('');
          
          // Başarım kontrolü
          if (motivationService && userUUID) {
            setTimeout(async () => {
              try {
                console.log('🔍 Ağırlık başarım kontrolü başlıyor...');
                console.log('userUUID:', userUUID);
                console.log('motivationService:', !!motivationService);
                
                // Gerçek verileri hesapla
                const { reps, weight } = trackingService.parseRepsAndWeight(newReps);
                const totalEntries = (strengthData?.length || 0) + 1;
                const totalSets = totalEntries; // Her kayıt bir set sayılır
                
                // Bu egzersize ait önceki kayıtları bul
                const normalizeExerciseName = (name) => {
                  const normalized = name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');
                  if (normalized.includes('squat')) return 'squat';
                  if (normalized.includes('bench') && normalized.includes('press')) return 'bench press';
                  if (normalized.includes('deadlift')) return 'deadlift';
                  if (normalized.includes('overhead') && normalized.includes('press')) return 'overhead press';
                  if (normalized.includes('row')) return 'row';
                  return normalized;
                };
                
                const currentExerciseNormalized = normalizeExerciseName(newExercise);
                const exerciseHistory = strengthData?.filter(entry => {
                  const entryName = normalizeExerciseName(entry.exercise_name || '');
                  return entryName === currentExerciseNormalized;
                }) || [];
                
                // İlk ağırlık ve artış hesapla
                let firstWeight = weight || 0;
                let strengthGain = 0;
                
                if (exerciseHistory.length > 0) {
                  // Bu egzersiz için önceki kayıtlar var
                  const weights = exerciseHistory.map(e => {
                    const parsed = trackingService.parseRepsAndWeight(e.reps || e.weight || '0');
                    return parsed.weight || 0;
                  }).filter(w => w > 0);
                  
                  if (weights.length > 0) {
                    firstWeight = Math.min(...weights);
                    strengthGain = (weight || 0) - firstWeight;
                  }
                } else {
                  // İlk kayıt - artış 0
                  strengthGain = 0;
                }
                
                // Ağırlık takibi için özel veriler
                const userStats = {
                  hasFirstEntry: exerciseHistory.length === 0, // İlk kayıt mı?
                  totalEntries: totalEntries,
                  totalSets: totalSets,
                  strengthGain: Math.max(0, strengthGain), // Negatif olmasın
                  weightLoss: 0,
                  targetReached: false,
                  currentWeight: weight || 0,
                  targetWeight: 0, // Ağırlık takibi için hedef yok
                  exerciseName: newExercise,
                  reps: reps || 0,
                  weight: weight || 0,
                  firstWeight: firstWeight,
                  trackingType: 'strength' // Ağırlık takibi olduğunu belirt
                };
                
                console.log('🏋️ Ağırlık başarım kontrolü için userStats:', userStats);
                console.log('💪 Egzersiz detayları:', {
                  exerciseName: newExercise,
                  reps: reps,
                  weight: weight,
                  totalEntries: totalEntries
                });
                
                const result = await motivationService.checkAndAddAchievements(userUUID, userStats, language);
                console.log('🏆 Ağırlık başarım kontrolü sonucu:', result);
                
                if (result.success && result.data.length > 0) {
                  console.log('🎉 Yeni ağırlık başarım(lar)ı kazanıldı:', result.data.length);
                  // Başarım kazanıldığında kullanıcıya bildir
                  result.data.forEach((achievement, index) => {
                    setTimeout(() => {
                      Alert.alert(
                        '🎉 Yeni Başarım!', 
                        `${achievement.title}\n\n${achievement.description || ''}`,
                        [{ text: 'Harika!', style: 'default' }]
                      );
                    }, index * 500); // Her başarım için 500ms gecikme
                  });
                  
                  console.log('✅ Ağırlık başarımları başarıyla eklendi ve bildirim gösterildi');
                } else {
                  console.log('ℹ️ Bu ağırlık kaydı için yeni başarım kazanılmadı');
                }
              } catch (error) {
                console.error('❌ Ağırlık başarım kontrolü hatası:', error);
              }
            }, 1000);
          } else {
            console.log('❌ Ağırlık başarım kontrolü yapılamadı:', {
              motivationService: !!motivationService,
              userUUID: !!userUUID
            });
          }
          
          // Verileri yeniden yükle
          setTimeout(() => {
            loadData();
          }, 500);
        } else {
          throw new Error(result?.message || t.save_failed || 'Kaydetme başarısız');
        }
      }
    } catch (error) {
      Alert.alert(t.error || 'Hata', error.message || t.data_save_failed || 'Veri kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  // Silme fonksiyonu
  const handleDeleteEntry = async (entryId, type) => {
    if (!userUUID || userData?.isOffline) {
      Alert.alert(t.no_backend_connection || 'Backend Bağlantısı Yok', t.please_upload_sql || 'Lütfen SUPABASE_MASTER_SETUP.sql dosyasını Supabase\'e yükleyin.');
      return;
    }

    Alert.alert(
      t.delete_entry || 'Kaydı Sil',
      t.confirm_delete_entry || 'Bu kaydı silmek istediğinizden emin misiniz?',
      [
        { text: t.cancel || 'İptal', style: 'cancel' },
        { 
          text: t.delete || 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'weight') {
                const result = await trackingService.deleteWeightEntry(entryId, userUUID);
                if (result?.success) {
                  Alert.alert(t.success || 'Başarılı', t.weight_entry_deleted || 'Kilo kaydı silindi!');
                  loadData();
                } else {
                  Alert.alert(t.error || 'Hata', result?.message || t.entry_delete_failed || 'Kayıt silinemedi');
                }
              } else if (type === 'strength') {
                const result = await trackingService.deleteStrengthEntry(entryId, userUUID);
                if (result?.success) {
                  Alert.alert(t.success || 'Başarılı', t.strength_entry_deleted || 'Ağırlık kaydı silindi!');
                  loadData();
                } else {
                  Alert.alert(t.error || 'Hata', result?.message || t.entry_delete_failed || 'Kayıt silinemedi');
                }
              }
            } catch (error) {
              Alert.alert(t.error || 'Hata', error.message || t.entry_delete_failed || 'Kayıt silinemedi');
            }
          }
        }
      ]
    );
  };

  const handleSaveGoal = async () => {
    if (!userUUID || userData?.isOffline) {
      Alert.alert(t.no_backend_connection || 'Backend Bağlantısı Yok', t.please_upload_sql || 'Lütfen SUPABASE_MASTER_SETUP.sql dosyasını Supabase\'e yükleyin.');
      return;
    }

    if (!trackingService) {
      Alert.alert(t.error || 'Hata', t.tracking_service_error || 'Tracking service yüklenemedi.');
      return;
    }

    if (selectedTracking === 'weight' && !weightGoal) {
      Alert.alert(t.warning || 'Uyarı', t.please_enter_target_weight || 'Lütfen hedef kilo girin');
      return;
    }

    if (selectedTracking === 'strength' && (!strengthGoal || !selectedExerciseForGoal)) {
      Alert.alert(t.warning || 'Uyarı', t.please_select_exercise_target || 'Lütfen egzersiz seçin ve hedef ağırlık girin');
      return;
    }

    setSaving(true);
    
    try {
      // Kullanıcının hedef bilgilerini güncelle
      let updateData = { updated_at: new Date().toISOString() };

      if (selectedTracking === 'weight') {
        // 1) UserContext üzerinden güncelle ki UI hemen güncellensin
        await updateUserData({ target_weight: parseFloat(weightGoal) });
      } else {
        // Ağırlık takibi için egzersiz bazlı hedef kaydetme
        // target_strength kaldırıldı, egzersiz bazında hedefler kullanılıyor
        // Egzersiz bilgisini de kaydet (localStorage veya başka bir yöntemle)
        try {
          await AsyncStorage.setItem(`target_${selectedExerciseForGoal}`, strengthGoal);
          // Update exerciseTargets state
          setExerciseTargets(prev => ({
            ...prev,
            [selectedExerciseForGoal]: parseFloat(strengthGoal)
          }));
        } catch (error) {
          console.log('Egzersiz hedefi kaydedilemedi:', error);
        }
      }

      // Eğer kilo hedefi güncellendiyse progress baseline'ı sıfırla (mevcut kilodan başla)
      if (selectedTracking === 'weight') {
        try {
          const baselineWeight = userData?.current_weight != null ? Number(userData.current_weight) : Number(weightGoal);
          const now = new Date().toISOString();
          await AsyncStorage.multiSet([
            ['weight_goal_baseline_weight', String(baselineWeight)],
            ['weight_goal_baseline_date', now]
          ]);
          setGoalBaseline({ weight: baselineWeight, date: now });
          // Progress'i yeni baseline ile yeniden hesapla
          calculateWeightProgress();
        } catch (e) {}
      }

      Alert.alert(t.success || 'Başarılı', `${t.target || 'Hedef'} ${selectedTracking === 'weight' ? (t.weight || 'kilo') : (t.strength || 'ağırlık')} ${t.saved || 'kaydedildi'}!`);
      setShowGoalModal(false);
      setWeightGoal('');
      setStrengthGoal('');
      setSelectedExerciseForGoal('');
      
      // Verileri yenile
      loadData();
    } catch (error) {
      console.error('Hedef kaydetme hatası:', error);
      Alert.alert(t.error || 'Hata', error.message || t.something_went_wrong || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const renderPeriodButton = (periodKey) => {
    const periodTranslations = {
      'weekly': t.weekly || 'Haftalık',
      'monthly': t.monthly || 'Aylık',
      'yearly': t.yearly || 'Yıllık'
    };
    
    return (
      <TouchableOpacity
        key={periodKey}
        onPress={() => setSelectedPeriod(periodKey)}
        style={{
          backgroundColor: selectedPeriod === periodKey ? colors.primary : colors.background,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginRight: spacing.sm,
          borderWidth: 1,
          borderColor: colors.primary
        }}
      >
        <Text style={{
          color: selectedPeriod === periodKey ? colors.background : colors.primary,
          fontSize: 14,
          fontWeight: '600'
        }}>
          {periodTranslations[periodKey]}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTrackingButton = (type, title, icon) => (
    <TouchableOpacity
      onPress={() => setSelectedTracking(type)}
      style={{
        backgroundColor: selectedTracking === type ? colors.primary : colors.background,
        borderRadius: 12,
        padding: spacing.md,
        flex: 1,
        marginHorizontal: spacing.xs,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: spacing.xs }}>{icon}</Text>
      <Text style={{
        color: selectedTracking === type ? colors.background : colors.primary,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center'
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Loading durumu
  if (userLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, fontSize: 16, marginTop: spacing.md }}>
          {t.loading || 'Yükleniyor...'}
        </Text>
      </View>
    );
  }

  const rightComponent = (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <TouchableOpacity onPress={() => setShowGoalModal(true)}>
        <Ionicons name="flag" size={24} color={colors.warning} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowAddModal(true)}>
        <Ionicons name="add-circle" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <Header 
        title={t.tracking_analysis || "Takip ve Analiz"}
        subtitle={t.track_progress_with_charts || "İlerlemenizi grafiklerle takip edin"}
        rightComponent={rightComponent}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>

          {/* Takip Türü Seçimi */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
              {renderTrackingButton('weight', t.weight_tracking || 'Kilo Takibi', '📊')}
              {renderTrackingButton('strength', t.strength_tracking || 'Ağırlık Takibi', '🏋️')}
            </View>
          </View>

          {/* Zaman Periyodu */}
          <View style={{ flexDirection: 'row', marginBottom: spacing.lg, flexWrap: 'wrap' }}>
            {['weekly', 'monthly', 'yearly'].map(renderPeriodButton)}
          </View>

          {/* Dashboard İstatistikleri - Kart Kart */}
          {dashboardStats && (
            <Card style={{ marginBottom: spacing.lg, alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md, textAlign: 'center' }}>
                📈 {t.dashboard_statistics || 'Dashboard İstatistikleri'}
              </Text>
              
              {selectedTracking === 'weight' ? (
                // Kilo takibi için tek dashboard - düzenli grid yapısı
                <View style={{ width: '100%', alignItems: 'center' }}>
                  {/* İlk satır */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-around',
                    marginBottom: spacing.md,
                    width: '100%',
                    alignItems: 'center'
                  }}>
                    <View style={{ 
                      flex: 1, 
                      alignItems: 'center',
                      paddingHorizontal: spacing.xs
                    }}>
                      <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.target_weight || 'Hedef Kilo'}</Text>
                      <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
                        {userData?.target_weight ? `${userData.target_weight}kg` : '--'}
                      </Text>
                    </View>
                    <View style={{ 
                      flex: 1, 
                      alignItems: 'center',
                      paddingHorizontal: spacing.xs
                    }}>
                      <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.target_progress || 'Hedef İlerleme'}</Text>
                      <Text style={{ 
                        color: (() => {
                          const targetWeight = userData?.target_weight || 0;
                          const normalizedWeightData = normalizeWeightData(weightData);
                          
                          // Veri yoksa veya hedef yoksa gri göster
                          if (!targetWeight || !normalizedWeightData || normalizedWeightData.length === 0) {
                            return colors.textMuted;
                          }
                          
                          const firstWeight = normalizedWeightData[0]?.weight || 0; // En eski
                          const lastWeight = normalizedWeightData[normalizedWeightData.length - 1]?.weight || 0; // En yeni
                          
                          const progress = calculateProgress(targetWeight, firstWeight, lastWeight);
                          return getProgressColor(progress);
                        })(), 
                        fontSize: 20, 
                        fontWeight: '700',
                        textAlign: 'center'
                      }}>
                        {(() => {
                          const targetWeight = userData?.target_weight || 0;
                          const normalizedWeightData = normalizeWeightData(weightData);
                          
                          // Veri yoksa veya hedef yoksa 0% göster
                          if (!targetWeight || !normalizedWeightData || normalizedWeightData.length === 0) {
                            return '0%';
                          }
                          
                          const firstWeight = normalizedWeightData[0]?.weight || 0; // En eski
                          const lastWeight = normalizedWeightData[normalizedWeightData.length - 1]?.weight || 0; // En yeni
                          
                          const progress = calculateProgress(targetWeight, firstWeight, lastWeight);
                          return Math.round(progress) + '%';
                        })()}
                      </Text>
                    </View>
                  </View>
                  
                  {/* İkinci satır */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-around',
                    marginBottom: spacing.md,
                    width: '100%',
                    alignItems: 'center'
                  }}>
                    <View style={{ 
                      flex: 1, 
                      alignItems: 'center',
                      paddingHorizontal: spacing.xs
                    }}>
                      <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.weight_change || 'Kilo Değişimi'}</Text>
                      <Text style={{ 
                        color: (() => {
                          const normalizedWeightData = normalizeWeightData(weightData);
                          if (!normalizedWeightData || normalizedWeightData.length === 0) return colors.textMuted;
                          
                          const firstWeight = normalizedWeightData[0]?.weight || 0; // En eski
                          const lastWeight = normalizedWeightData[normalizedWeightData.length - 1]?.weight || 0; // En yeni
                          const change = lastWeight - firstWeight;
                          
                          const targetWeight = userData?.target_weight || 0;
                          const currentWeight = lastWeight;
                          return getWeightChangeColor(change, targetWeight, currentWeight);
                        })(), 
                        fontSize: 20, 
                        fontWeight: '700',
                        textAlign: 'center'
                      }}>
                        {(() => {
                          const normalizedWeightData = normalizeWeightData(weightData);
                          if (!normalizedWeightData || normalizedWeightData.length === 0) return '--';
                          
                          const firstWeight = normalizedWeightData[0]?.weight || 0; // En eski
                          const lastWeight = normalizedWeightData[normalizedWeightData.length - 1]?.weight || 0; // En yeni
                          const change = lastWeight - firstWeight;
                          
                          return change >= 0 ? `+${change.toFixed(1)}kg` : `${change.toFixed(1)}kg`;
                        })()}
                      </Text>
                    </View>
                    <View style={{ 
                      flex: 1, 
                      alignItems: 'center',
                      paddingHorizontal: spacing.xs
                    }}>
                      <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.current_weight || 'Mevcut Kilo'}</Text>
                      <Text style={{ 
                        color: colors.info,
                        fontSize: 20, 
                        fontWeight: '700',
                        textAlign: 'center'
                      }}>
                        {(() => {
                          // En son eklenen kilo kaydını göster
                          const normalizedWeightData = normalizeWeightData(weightData);
                          if (normalizedWeightData && normalizedWeightData.length > 0) {
                            const lastWeight = normalizedWeightData[normalizedWeightData.length - 1]?.weight || 0; // En yeni
                            return `${lastWeight}kg`;
                          }
                          // Kilo kaydı yoksa userData'dan göster
                          return `${userData?.current_weight || 0}kg`;
                        })()}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Üçüncü satır */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'center',
                    width: '100%',
                    alignItems: 'center'
                  }}>
                    <View style={{ 
                      flex: 1, 
                      alignItems: 'center',
                      paddingHorizontal: spacing.xs
                    }}>
                      <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.active_days || 'Aktif Günler'}</Text>
                      <Text style={{ 
                        color: colors.purple,
                        fontSize: 20, 
                        fontWeight: '700',
                        textAlign: 'center'
                      }}>
                        {(() => {
                          // Gerçek verilerden hesapla
                          const normalizedWeightData = normalizeWeightData(weightData);
                          if (!normalizedWeightData || normalizedWeightData.length === 0) return 0;
                          
                          // Benzersiz tarihleri say
                          const uniqueDates = new Set(
                            normalizedWeightData.map(item => item.measurement_date || item.date)
                          );
                          return uniqueDates.size;
                        })()}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                // Ağırlık takibi için egzersiz bazlı kartlar
                (() => {
                  const groupedExercises = getGroupedStrengthData();
                  
                  const renderExerciseDashboard = ({ item, index }) => {
                    const exerciseData = getExerciseSpecificData(item.name);
                    
                    // Veri alanlarını düzelt
                    const weights = exerciseData?.map(d => {
                      const weight = d.max_weight || d.weight || d.value;
                      return parseFloat(weight) || 0;
                    }).filter(w => w > 0) || [];
                    
                    // weights dizisi YENİ → ESKİ sıralı
                    const firstWeight = weights.length > 0 ? weights[weights.length - 1] : 0; // EN ESKİ
                    const lastWeight = weights.length > 0 ? weights[0] : 0; // EN YENİ
                    const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
                    const change = lastWeight - firstWeight;
                    
                    // İlerleme hesaplaması: İlk kiloya göre hedefe ilerleme
                    let progressPercent = 0;
                    if (firstWeight > 0) {
                      // Egzersiz bazlı hedef ağırlığı state'den al
                      const targetWeight = exerciseTargets[item.name] || 
                        100; // varsayılan 100kg
                      
                      const progress = ((lastWeight - firstWeight) / (targetWeight - firstWeight)) * 100;
                      progressPercent = Math.max(0, Math.min(100, progress)); // 0-100% arası
                    }
                    
                    // Debug log (geçici)
                    if (exerciseData?.length > 0) {
                      const targetWeight = exerciseTargets[item.name] || 100;
                      console.log('🔍 Dashboard Debug:', {
                        exerciseName: item.name,
                        exerciseDataCount: exerciseData.length,
                        weights: weights,
                        firstWeight,
                        lastWeight,
                        maxWeight,
                        change,
                        progressPercent,
                        targetWeight,
                        exerciseTargets
                      });
                    }
                    
                    return (
                      <View style={{ 
                        width: '100%',
                        paddingHorizontal: spacing.md,
                        alignItems: 'center'
                      }}>
                        {/* Egzersiz Başlığı */}
                        <Text style={{ 
                          color: colors.text, 
                          fontSize: 16, 
                          fontWeight: '600', 
                          marginBottom: spacing.md,
                          textAlign: 'center'
                        }}>
                          🏋️ {item.name}
                        </Text>
                        
                        {/* İstatistikler - Düzenli grid yapısı */}
                        <View style={{ width: '100%' }}>
                          {/* İlk satır */}
                          <View style={{ 
                            flexDirection: 'row', 
                            justifyContent: 'space-around',
                            marginBottom: spacing.md,
                            width: '100%',
                            alignItems: 'center'
                          }}>
                            <View style={{ 
                              flex: 1, 
                              alignItems: 'center',
                              paddingHorizontal: spacing.xs
                            }}>
                              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.highest || 'En Yüksek'}</Text>
                              <Text style={{ 
                                color: colors.primary,
                                fontSize: 18, 
                                fontWeight: '700',
                                textAlign: 'center'
                              }}>
                                {maxWeight > 0 ? `${maxWeight}kg` : '--'}
                              </Text>
                            </View>
                            
                            <View style={{ 
                              flex: 1, 
                              alignItems: 'center',
                              paddingHorizontal: spacing.xs
                            }}>
                              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.change || 'Değişim'}</Text>
                              <Text style={{ 
                                color: getStrengthChangeColor(change),
                                fontSize: 18, 
                                fontWeight: '700',
                                textAlign: 'center'
                              }}>
                                {firstWeight > 0 ? (change >= 0 ? '+' : '') + change.toFixed(1) + 'kg' : '--'}
                              </Text>
                            </View>
                          </View>
                          
                          {/* İkinci satır */}
                          <View style={{ 
                            flexDirection: 'row', 
                            justifyContent: 'space-around',
                            marginBottom: spacing.md,
                            width: '100%',
                            alignItems: 'center'
                          }}>
                            <View style={{ 
                              flex: 1, 
                              alignItems: 'center',
                              paddingHorizontal: spacing.xs
                            }}>
                              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.first_record || 'İlk Kayıt'}</Text>
                              <Text style={{ 
                                color: colors.info,
                                fontSize: 18, 
                                fontWeight: '700',
                                textAlign: 'center'
                              }}>
                                {firstWeight > 0 ? `${firstWeight}kg` : '--'}
                              </Text>
                            </View>
                            
                            <View style={{ 
                              flex: 1, 
                              alignItems: 'center',
                              paddingHorizontal: spacing.xs
                            }}>
                              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.last_weight || 'Son Ağırlık'}</Text>
                              <Text style={{ 
                                color: colors.warning,
                                fontSize: 18, 
                                fontWeight: '700',
                                textAlign: 'center'
                              }}>
                                {lastWeight > 0 ? `${lastWeight}kg` : '--'}
                              </Text>
                            </View>
                          </View>
                          
                          {/* Üçüncü satır */}
                          <View style={{ 
                            flexDirection: 'row', 
                            justifyContent: 'space-around',
                            width: '100%',
                            alignItems: 'center'
                          }}>
                            <View style={{ 
                              flex: 1, 
                              alignItems: 'center',
                              paddingHorizontal: spacing.xs
                            }}>
                              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.total_records || 'Toplam Kayıt'}</Text>
                              <Text style={{ 
                                color: colors.purple,
                                fontSize: 18, 
                                fontWeight: '700',
                                textAlign: 'center'
                              }}>
                                {exerciseData?.length || 0}
                              </Text>
                            </View>
                            
                            <View style={{ 
                              flex: 1, 
                              alignItems: 'center',
                              paddingHorizontal: spacing.xs
                            }}>
                              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{t.progress || 'İlerleme'}</Text>
                              <Text style={{ 
                                color: getProgressColor(progressPercent),
                                fontSize: 18, 
                                fontWeight: '700',
                                textAlign: 'center'
                              }}>
                                {firstWeight > 0 ? `${progressPercent.toFixed(1)}%` : '--'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  };
                  
                  return (
                    <FlatList
                      data={groupedExercises}
                      renderItem={renderExerciseDashboard}
                      keyExtractor={(item, index) => `dashboard-${index}`}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      snapToInterval={screenWidth - 60}
                      snapToAlignment="start"
                      decelerationRate="fast"
                      pagingEnabled={false}
                      contentContainerStyle={{ paddingHorizontal: 0 }}
                    />
                  );
                })()
              )}
            </Card>
          )}

          {/* Grafikler */}
          {loading ? (
            <Card style={{ alignItems: 'center', padding: spacing.xl }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.text, marginTop: spacing.md }}>Veriler yükleniyor...</Text>
            </Card>
          ) : selectedTracking === 'weight' ? (
            <Card style={{ marginBottom: spacing.lg }}>
              {(() => {
                const normalizedWeightData = normalizeWeightData(weightData);
                
                // Veri yoksa boş grafik göster
                if (!normalizedWeightData || normalizedWeightData.length === 0) {
                  return (
                    <>
                      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
                        📊 {t.weight_trend || 'Kilo Trendi'} (0 {t.records || 'kayıt'})
                      </Text>
                      <View style={{ 
                        height: 220, 
                        backgroundColor: colors.backgroundAlt, 
                        borderRadius: 16, 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        marginVertical: spacing.sm
                      }}>
                        <Text style={{ color: colors.textMuted, fontSize: 16, textAlign: 'center' }}>
                          {t.no_weight_records || 'Henüz kilo kaydı yok'}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: spacing.xs }}>
                          {t.add_first_record || 'İlk kaydını eklemek için + butonuna bas'}
                        </Text>
                      </View>
                      <View style={{ marginTop: spacing.sm, paddingHorizontal: spacing.sm }}>
                        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                          {t.last_weight || 'Son kilo'}: -- kg
                        </Text>
                      </View>
                    </>
                  );
                }
                
                // Grafik için tarih sırasına göre (en yeni sağda olacak şekilde)
                // normalizedWeightData zaten eski → yeni sıralı, direkt kullan
                const sortedForChart = [...normalizedWeightData];
                
                console.log('📊 Grafik verileri:', {
                  normalizedCount: normalizedWeightData.length,
                  sortedCount: sortedForChart.length,
                  firstEntry: sortedForChart[0],
                  lastEntry: sortedForChart[sortedForChart.length - 1],
                  chartData: sortedForChart.slice(-10) // Son 10 kayıt
                });
                
                return (
                  <>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
                      📊 {t.weight_trend || 'Kilo Trendi'} ({normalizedWeightData.length} {t.records || 'kayıt'})
                    </Text>
                    <View style={{ alignItems: 'center', width: '100%' }}>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ alignItems: 'center' }}
                      >
                        <LineChart
                          data={{
                            labels: sortedForChart.slice(-10).map((item, index) => {
                              const date = new Date(item.measurement_date || item.date);
                              return `${date.getDate()}/${date.getMonth() + 1}`;
                            }),
                            datasets: [{
                              data: sortedForChart.slice(-10).map(item => parseFloat(item.weight) || 0)
                            }]
                          }}
                          width={Math.max(screenWidth - 80, normalizedWeightData.length * 40)}
                          height={220}
                          chartConfig={chartConfig}
                          bezier
                          style={{ marginVertical: spacing.sm, borderRadius: 16 }}
                        />
                      </ScrollView>
                    </View>
                    <View style={{ marginTop: spacing.sm, paddingHorizontal: spacing.sm }}>
                      <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                        {t.last_weight || 'Son kilo'}: {sortedForChart[sortedForChart.length - 1]?.weight || 0}kg
                        {normalizedWeightData.length !== weightData.length && (
                          <Text style={{ color: colors.warning }}>
                            {' '}({weightData.length - normalizedWeightData.length} {t.abnormal_records_filtered || 'anormal kayıt filtrelendi'})
                          </Text>
                        )}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </Card>
          ) : selectedTracking === 'strength' && strengthData?.length > 0 ? (
            <Card style={{ marginBottom: spacing.lg }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
                🏋️ {t.strength_trend || 'Ağırlık Trendi'} ({(() => {
                  const groupedExercises = getGroupedStrengthData();
                  const totalRecords = groupedExercises.reduce((sum, exercise) => sum + exercise.history.length, 0);
                  return `${totalRecords} ${t.records || 'kayıt'}`;
                })()})
              </Text>
              
              {(() => {
                const groupedExercises = getGroupedStrengthData();
                
                const renderExerciseCard = ({ item, index }) => {
                  const isLineChart = item.history.length > 1;
                  
                  return (
                    <View style={{ 
                      width: '100%',
                      paddingHorizontal: spacing.md,
                      alignItems: 'center'
                    }}>
                      {/* Egzersiz Başlığı */}
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        width: '100%',
                        marginBottom: spacing.md,
                        paddingHorizontal: spacing.sm
                      }}>
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                          🏋️ {item.name}
                        </Text>
                        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>
                          Max: {item.maxWeight}kg
                        </Text>
                      </View>
                      
                      {/* Grafik - Her zaman LineChart */}
                      <View style={{ 
                        backgroundColor: colors.backgroundAlt, 
                        borderRadius: 12, 
                        padding: spacing.sm,
                        width: '100%'
                      }}>
                        <LineChart
                          data={{
                            labels: item.history.length > 1 
                              ? [...item.history].reverse().map((_, i) => (i + 1).toString())
                              : ['1', '2'], // Tek kayıt için 2 nokta
                            datasets: [{
                              data: item.history.length > 1
                                ? [...item.history].reverse().map(h => h.weight)
                                : [item.maxWeight, item.maxWeight], // Tek kayıt için aynı değer
                              color: (opacity = 1) => {
                                // İlk ve son değere göre renk belirle (history YENİ → ESKİ sıralı)
                                const firstWeight = item.history[item.history.length - 1].weight; // EN ESKİ
                                const lastWeight = item.history[0].weight; // EN YENİ
                                if (lastWeight > firstWeight) {
                                  return `rgba(76, 175, 80, ${opacity})`; // Yeşil - artış
                                } else if (lastWeight < firstWeight) {
                                  return `rgba(244, 67, 54, ${opacity})`; // Kırmızı - azalış
                                } else {
                                  return `rgba(255, 152, 0, ${opacity})`; // Turuncu - aynı
                                }
                              },
                              strokeWidth: 3
                            }]
                          }}
                          width={screenWidth - 100}
                          height={180}
                          chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => {
                              const firstWeight = item.history[item.history.length - 1].weight; // EN ESKİ
                              const lastWeight = item.history[0].weight; // EN YENİ
                              if (lastWeight > firstWeight) {
                                return `rgba(76, 175, 80, ${opacity})`; // Yeşil
                              } else if (lastWeight < firstWeight) {
                                return `rgba(244, 67, 54, ${opacity})`; // Kırmızı
                              } else {
                                return `rgba(255, 152, 0, ${opacity})`; // Turuncu
                              }
                            }
                          }}
                          bezier
                          style={{ marginVertical: spacing.xs }}
                          withDots={true}
                          withShadow={false}
                          withScrollableDot={false}
                          withVerticalLabels={true}
                          withHorizontalLabels={true}
                          segments={4}
                          fromZero={false}
                        />
                      </View>
                      
                      {/* Trend Bilgisi */}
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        marginTop: spacing.sm,
                        paddingHorizontal: spacing.sm
                      }}>
                        {(() => {
                          // history YENİ → ESKİ sıralı
                          const firstWeight = item.history[item.history.length - 1].weight; // EN ESKİ
                          const lastWeight = item.history[0].weight; // EN YENİ
                          const change = lastWeight - firstWeight;
                          const changePercent = ((change / firstWeight) * 100).toFixed(1);
                          
                          if (change > 0) {
                            return (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="trending-up" size={16} color={colors.success} />
                                <Text style={{ color: colors.success, fontSize: 12, fontWeight: '600', marginLeft: spacing.xs }}>
                                  +{change.toFixed(1)}kg (+{changePercent}%)
                                </Text>
                              </View>
                            );
                          } else if (change < 0) {
                            return (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="trending-down" size={16} color={colors.error} />
                                <Text style={{ color: colors.error, fontSize: 12, fontWeight: '600', marginLeft: spacing.xs }}>
                                  {change.toFixed(1)}kg ({changePercent}%)
                                </Text>
                              </View>
                            );
                          } else {
                            return (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="remove" size={16} color={colors.warning} />
                                <Text style={{ color: colors.warning, fontSize: 12, fontWeight: '600', marginLeft: spacing.xs }}>
                                  {t.no_change || 'Değişim yok'}
                                </Text>
                              </View>
                            );
                          }
                        })()}
                      </View>
                      
                      {/* İstatistikler */}
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-around', 
                        width: '100%',
                        marginTop: spacing.sm
                      }}>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.total || 'Toplam'}</Text>
                          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                            {item.history.length} {t.records || 'kayıt'}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.first || 'İlk'}</Text>
                          <Text style={{ color: colors.success, fontSize: 14, fontWeight: '600' }}>
                            {item.history[item.history.length - 1]?.weight}kg
                          </Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.last || 'Son'}</Text>
                          <Text style={{ color: colors.warning, fontSize: 14, fontWeight: '600' }}>
                            {item.history[0]?.weight}kg
                          </Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.increase || 'Artış'}</Text>
                          <Text style={{ 
                            color: (item.history[0]?.weight - item.history[item.history.length - 1]?.weight) >= 0 
                              ? colors.success : colors.error, 
                            fontSize: 14, 
                            fontWeight: '600' 
                          }}>
                            {((item.history[0]?.weight - item.history[item.history.length - 1]?.weight) >= 0 ? '+' : '')}
                            {(item.history[0]?.weight - item.history[item.history.length - 1]?.weight).toFixed(1)}kg
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                };
                
                return (
                  <FlatList
                    data={groupedExercises}
                    renderItem={renderExerciseCard}
                    keyExtractor={(item, index) => `exercise-${index}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={screenWidth - 60}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    pagingEnabled={false}
                    contentContainerStyle={{ paddingHorizontal: 0 }}
                  />
                );
              })()}
            </Card>
          ) : (
            <Card style={{ alignItems: 'center', padding: spacing.xl }}>
              <Text style={{ color: colors.textMuted, fontSize: 16, textAlign: 'center' }}>
                {selectedTracking === 'weight' 
                  ? (t.no_weight_data || 'Henüz kilo verisi yok. İlk kaydınızı ekleyin!')
                  : (t.no_strength_data || 'Henüz ağırlık verisi yok. İlk kaydınızı ekleyin!')
                }
              </Text>
              <TouchableOpacity 
                onPress={() => setShowAddModal(true)}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  marginTop: spacing.md
                }}
              >
                <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>
                  {t.add_first_record || 'İlk Kaydı Ekle'}
                </Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* Son Kayıtlar - Sekmeye göre filtrelenmiş */}
          {((selectedTracking === 'weight' && weightData?.length > 0) || 
            (selectedTracking === 'strength' && strengthData?.length > 0)) && (
            <Card>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
                📝 {t.recent_records || 'Son Kayıtlar'} - {selectedTracking === 'weight' ? (t.weight_tracking || 'Kilo Takibi') : (t.strength_tracking || 'Ağırlık Takibi')}
              </Text>
              

              {/* Weight data recent entries - sadece kilo takibi seçiliyken */}
              {selectedTracking === 'weight' && (() => {
                const normalizedWeightData = normalizeWeightData(weightData);
                // En son eklenen veriyi en üstte göster (son kayıt en üstte)
                const recentEntries = normalizedWeightData?.slice(-3);
                return recentEntries?.reverse().map((entry, index) => (
                  <View key={`weight-${index}`} style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingVertical: spacing.sm,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '600' }}>⚖️ {t.weight || 'Kilo'}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        {new Date(entry.measurement_date || entry.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}
                      </Text>
                    </View>
                    <Text style={{ color: colors.primary, fontWeight: '700', marginRight: spacing.sm }}>
                      {entry.weight}kg
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteEntry(entry.id, 'weight')}
                      style={{
                        backgroundColor: colors.error,
                        borderRadius: 20,
                        padding: spacing.sm,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Ionicons name="trash" size={16} color={colors.background} />
                    </TouchableOpacity>
                  </View>
                ));
              })()}

              {/* Strength data recent entries - sadece ağırlık takibi seçiliyken */}
              {selectedTracking === 'strength' && (() => {
                // En son eklenen veriyi en üstte göster (son kayıt en üstte)
                const recentEntries = strengthData?.slice(-3);
                return recentEntries?.reverse().map((entry, index) => (
                <View key={`strength-${index}`} style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingVertical: spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>
                      🏋️ {entry.exercise_name || entry.name}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {new Date(entry.measurement_date || entry.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}
                    </Text>
                  </View>
                  <Text style={{ color: colors.primary, fontWeight: '700', marginRight: spacing.sm }}>
                    {entry.max_weight || entry.weight || entry.value}kg
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteEntry(entry.id, 'strength')}
                    style={{
                      backgroundColor: colors.error,
                      borderRadius: 20,
                      padding: spacing.sm,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Ionicons name="trash" size={16} color={colors.background} />
                  </TouchableOpacity>
                </View>
                ));
              })()}
            </Card>
          )}
        </ScrollView>

        {/* Add Data Modal - ProgramScreen'deki gibi */}
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
                  {selectedTracking === 'weight' ? `📊 ${t.add_weight || 'Kilo Ekle'}` : `🏋️ ${t.add_strength || 'Ağırlık Ekle'}`}
                </Text>

                {/* Kilo Takibi */}
                {selectedTracking === 'weight' && (
                  <TextInput
                    value={newWeight}
                    onChangeText={setNewWeight}
                    placeholder={t.weight_placeholder || "Kilo (kg) - Örn: 73.2"}
                    placeholderTextColor={colors.textMuted}
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 16,
                      color: colors.text,
                      fontSize: 16,
                      marginBottom: spacing.md
                    }}
                    keyboardType="decimal-pad"
                    onSubmitEditing={handleSaveData}
                  />
                )}

                {/* Ağırlık Takibi */}
                {selectedTracking === 'strength' && (
                  <>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
                      {t.exercise_selection || 'Egzersiz Seçimi'}
                    </Text>
                    
                    {/* Bilinen Egzersizler */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        {knownExercises.map((exercise) => (
                          <TouchableOpacity
                            key={exercise}
                            onPress={() => setNewExercise(exercise)}
                            style={{
                              backgroundColor: newExercise === exercise ? colors.primary : colors.background,
                              borderRadius: 20,
                              paddingHorizontal: spacing.md,
                              paddingVertical: spacing.sm,
                              borderWidth: 1,
                              borderColor: colors.primary
                            }}
                          >
                            <Text style={{
                              color: newExercise === exercise ? colors.background : colors.primary,
                              fontSize: 14,
                              fontWeight: '600'
                            }}>
                              {exercise}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                    
                    {/* Özel Egzersiz Girişi */}
                    <TextInput
                      value={newExercise}
                      onChangeText={setNewExercise}
                      placeholder={t.custom_exercise_placeholder || "Özel egzersiz adı - Örn: Custom Exercise"}
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

                    <TextInput
                      value={newReps}
                      onChangeText={setNewReps}
                      placeholder={t.reps_weight_placeholder || "Tekrar x Ağırlık - Örn: 8x65kg"}
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
                      onSubmitEditing={handleSaveData}
                    />
                  </>
                )}

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TouchableOpacity
                    onPress={handleSaveData}
                    disabled={saving}
                    style={{
                      flex: 1,
                      backgroundColor: saving ? colors.textMuted : colors.primary,
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
                      {saving ? (t.saving || "⏳ Kaydediliyor...") : (t.save || "✅ Kaydet")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAddModal(false);
                      setNewWeight('');
                      setNewExercise('');
                      setNewReps('');
                    }}
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
                      ❌ {t.cancel || 'İptal'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Goal Setting Modal */}
        <Modal
          visible={showGoalModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGoalModal(false)}
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
                  {selectedTracking === 'weight' ? `🎯 ${t.set_target_weight || 'Hedef Kilo Belirle'}` : `🏋️ ${t.set_target_strength || 'Hedef Ağırlık Belirle'}`}
                </Text>

                {/* Kilo Hedefi */}
                {selectedTracking === 'weight' && (
                  <View style={{ marginBottom: spacing.md }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
                      {t.target_weight || 'Hedef Kilo'} (kg)
                    </Text>
                    <TextInput
                      value={weightGoal}
                      onChangeText={setWeightGoal}
                      placeholder={t.weight_example || "Örn: 65.0"}
                      placeholderTextColor={colors.textMuted}
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        padding: 16,
                        color: colors.text,
                        fontSize: 16,
                        borderWidth: 2,
                        borderColor: colors.primary
                      }}
                      keyboardType="decimal-pad"
                      onSubmitEditing={handleSaveGoal}
                    />
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: spacing.xs }}>
                      {t.current_target || 'Mevcut hedef'}: {userData?.target_weight || (t.not_specified || 'Belirtilmemiş')}kg
                      {userData?.target_weight && (
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>
                          {' '}({t.current_weight || 'Mevcut kilo'}: {userData?.current_weight || '--'}kg)
                        </Text>
                      )}
                    </Text>
                  </View>
                )}

                {/* Ağırlık Hedefi */}
                {selectedTracking === 'strength' && (
                  <>
                    <View style={{ marginBottom: spacing.md }}>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
                        {t.exercise_selection || 'Egzersiz Seçimi'}
                      </Text>
                      
                      {/* Egzersiz Seçimi */}
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                          {knownExercises.map((exercise) => (
                            <TouchableOpacity
                              key={exercise}
                              onPress={() => setSelectedExerciseForGoal(exercise)}
                              style={{
                                backgroundColor: selectedExerciseForGoal === exercise ? colors.primary : colors.background,
                                borderRadius: 20,
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                                borderWidth: 1,
                                borderColor: colors.primary
                              }}
                            >
                              <Text style={{
                                color: selectedExerciseForGoal === exercise ? colors.background : colors.primary,
                                fontSize: 14,
                                fontWeight: '600'
                              }}>
                                {exercise}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                      
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
                        {t.target_weight || 'Hedef Ağırlık'} (kg)
                      </Text>
                      <TextInput
                        value={strengthGoal}
                        onChangeText={setStrengthGoal}
                        placeholder={t.weight_example || "Örn: 100.0"}
                        placeholderTextColor={colors.textMuted}
                        style={{
                          backgroundColor: colors.background,
                          borderRadius: 12,
                          padding: 16,
                          color: colors.text,
                          fontSize: 16,
                          borderWidth: 2,
                          borderColor: colors.primary
                        }}
                        keyboardType="decimal-pad"
                        onSubmitEditing={handleSaveGoal}
                      />
                      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: spacing.xs }}>
                        {selectedExerciseForGoal ? 
                          `${t.current_target || 'Mevcut hedef'} (${selectedExerciseForGoal}): ${exerciseTargets[selectedExerciseForGoal] || (t.not_specified || 'Belirtilmemiş')}kg` :
                          (t.select_exercise_first || 'Önce egzersiz seçin')
                        }
                      </Text>
                    </View>
                  </>
                )}

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TouchableOpacity
                    onPress={handleSaveGoal}
                    disabled={saving}
                    style={{
                      flex: 1,
                      backgroundColor: saving ? colors.textMuted : colors.primary,
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
                      {saving ? (t.saving || "⏳ Kaydediliyor...") : `🎯 ${t.save_target || 'Hedef Kaydet'}`}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowGoalModal(false);
                      setWeightGoal('');
                      setStrengthGoal('');
                      setSelectedExerciseForGoal('');
                    }}
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
                      ❌ {t.cancel || 'İptal'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}