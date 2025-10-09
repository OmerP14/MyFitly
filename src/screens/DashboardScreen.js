import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { supabase } from '../config/supabase';
import * as programService from '../services/programService';

const screenWidth = Dimensions.get('window').width;

// AdMob Banner ID (Test ID kullanıyoruz - gerçek uygulama için değiştirin)
const adUnitId = __DEV__ ? TestIds.BANNER : Platform.select({
  ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy', // iOS Banner ID buraya gelecek
  android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy', // Android Banner ID buraya gelecek
});

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const { userData } = useUser();
  
  // State variables
  const [weightData, setWeightData] = useState([]);
  const [weightProgress, setWeightProgress] = useState(0);
  const [todayWorkout, setTodayWorkout] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({ workoutDays: 0, totalSets: 0 });

  // Kilo verilerini normalize et
  const normalizeWeightData = (data) => {
    if (!data?.length) return [];
    
    const normalized = data.map(item => {
      let weight = item.weight || item.value;
      
      if (typeof weight === 'string') {
        weight = parseFloat(weight.replace(/[^\d.,]/g, '').replace(',', '.'));
      }
      
      if (weight < 20 || weight > 300 || isNaN(weight)) {
        return null;
      }
      
      return {
        ...item,
        weight: weight,
        value: weight,
        date: item.measurement_date || item.created_at || item.date
      };
    }).filter(item => item !== null);
    
    // Tarih sırasına göre sırala (en eski önce, en yeni sonda)
    const sorted = normalized.sort((a, b) => {
      const dateA = new Date(a.measurement_date || a.date || a.created_at);
      const dateB = new Date(b.measurement_date || b.date || b.created_at);
      return dateA - dateB;
    });
    
    return sorted;
  };

  // Hedef kilo ilerlemesini hesapla
  const calculateWeightProgress = () => {
    if (!userData || !userData.target_weight) {
      setWeightProgress(0);
      return;
    }

    const normalizedWeightData = normalizeWeightData(weightData);
    
    // Kilo girişi yoksa progress 0
    if (!normalizedWeightData || normalizedWeightData.length === 0) {
      setWeightProgress(0);
      return;
    }

    // İlk kilo girişi = Başlangıç
    // Son kilo girişi = Mevcut
    const startWeight = normalizedWeightData[0].weight;
    const currentWeight = normalizedWeightData[normalizedWeightData.length - 1].weight;
    const targetWeight = userData.target_weight;

    // Kilo verme durumu
    if (startWeight > targetWeight) {
      const totalWeightToLose = startWeight - targetWeight;
      const weightLost = startWeight - currentWeight;
      const progress = Math.max(0, Math.min(100, (weightLost / totalWeightToLose) * 100));
      setWeightProgress(progress);
    } 
    // Kilo alma durumu
    else if (startWeight < targetWeight) {
      const totalWeightToGain = targetWeight - startWeight;
      const weightGained = currentWeight - startWeight;
      const progress = Math.max(0, Math.min(100, (weightGained / totalWeightToGain) * 100));
      setWeightProgress(progress);
    } 
    // Zaten hedefte
    else {
      setWeightProgress(100);
    }
  };

  // Kilo verilerini yükle
  const loadWeightData = async () => {
    try {
      if (!userData?.id) return;

      const { data, error } = await supabase
        .from('weight_tracking')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const normalizedData = normalizeWeightData(data);
        setWeightData(normalizedData);
      } else {
        setWeightData([]);
      }
    } catch (error) {
      console.error('Kilo verileri yüklenemedi:', error);
    }
  };

  // Bugünkü antrenmanı yükle
  const loadTodayWorkout = async () => {
    try {
      if (!userData?.id) return;

      const today = new Date().getDay();
      const weeklyStats = await programService.getWeeklyStats(userData.id);
      
      if (weeklyStats && weeklyStats[today]) {
        const todayExercises = weeklyStats[today].exercises || [];
        setTodayWorkout(todayExercises);
        
        // Haftalık antrenman günlerini say
        let weeklyCount = 0;
        for (let day = 0; day < 7; day++) {
          const dayStats = weeklyStats[day];
          if (dayStats && dayStats.total > 0) {
            weeklyCount++;
          }
        }
        
        // Sadece bugünün toplam setlerini hesapla
        const todayTotalSets = todayExercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
        
        setWeeklyStats({ workoutDays: weeklyCount, totalSets: todayTotalSets });
      } else {
        setTodayWorkout([]);
        setWeeklyStats({ workoutDays: 0, totalSets: 0 });
      }
    } catch (error) {
      console.error('Antrenman verileri yüklenemedi:', error);
      setTodayWorkout([]);
      setWeeklyStats({ workoutDays: 0, totalSets: 0 });
    }
  };

  // Verileri yükle
  const loadAllData = async () => {
    await Promise.all([
      loadWeightData(),
      loadTodayWorkout()
    ]);
  };

  useEffect(() => {
    if (userData?.id) {
      loadAllData();
    }
  }, [userData?.id, userData?.target_weight, userData?.current_weight]);

  // Ekran her açıldığında verileri yenile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userData?.id) {
        console.log('🔄 Ana ekran açıldı, veriler yenileniyor...');
        loadAllData();
      }
    });

    return unsubscribe;
  }, [navigation, userData?.id]);

  useEffect(() => {
    calculateWeightProgress();
  }, [userData, weightData]);

  // Mevcut kilo bilgisi
  const getCurrentWeight = () => {
    const normalizedData = normalizeWeightData(weightData);
    if (normalizedData && normalizedData.length > 0) {
      return normalizedData[normalizedData.length - 1].weight;
    }
    // Kilo girişi yoksa profildeki hedef kiloyu göster
    return userData?.target_weight || 0;
  };

  const getWeightChange = () => {
    const normalizedData = normalizeWeightData(weightData);
    if (!normalizedData || normalizedData.length < 2) return 0;
    
    const firstWeight = normalizedData[0].weight;
    const lastWeight = normalizedData[normalizedData.length - 1].weight;
    
    return lastWeight - firstWeight;
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}>
          {/* Header */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={{ 
              color: colors.text, 
              fontSize: 32, 
              fontWeight: '900', 
              marginBottom: spacing.xs 
            }}>
              Merhaba, {userData?.name || 'Sporcu'}! 👋
            </Text>
            <Text style={{ 
              color: colors.textMuted, 
              fontSize: 16, 
              fontWeight: '500' 
            }}>
              Bugün harika bir gün! 💪
            </Text>
          </View>

          {/* Hedef Kilo İlerlemesi - Büyük Kart */}
          <Card style={{ 
            marginBottom: spacing.lg, 
            padding: spacing.xl,
            alignItems: 'center'
          }}>
            <Text style={{ 
              color: colors.text, 
              fontSize: 18, 
              fontWeight: '700',
              marginBottom: spacing.lg
            }}>
              🎯 Hedef İlerlemen
            </Text>
            
            <View style={{ 
              width: 160, 
              height: 160, 
              marginBottom: spacing.lg,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <ProgressRing 
                size={160} 
                stroke={16} 
                progress={weightProgress / 100} 
                color={weightProgress > 0 ? colors.success : colors.primary}
              />
              <View style={{
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ 
                  color: weightProgress > 0 ? colors.success : colors.primary, 
                  fontSize: 42, 
                  fontWeight: '900'
                }}>
                  %{Math.round(weightProgress)}
                </Text>
              </View>
            </View>

            {userData?.current_weight && userData?.target_weight ? (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <Text style={{ 
                  color: colors.textMuted, 
                  fontSize: 14,
                  marginBottom: spacing.md
                }}>
                  Hedefe ulaştın
                </Text>

                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-around',
                  width: '100%',
                  marginTop: spacing.md,
                  paddingTop: spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: colors.border
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>Mevcut Kilo</Text>
                    <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '700' }}>
                      {getCurrentWeight()}kg
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>Hedef Kilo</Text>
                    <Text style={{ color: colors.success, fontSize: 24, fontWeight: '700' }}>
                      {userData.target_weight}kg
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={{ color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.lg }}>
                Takip ekranından kilo girişi yaparak ilerlemeyi takip et
              </Text>
            )}
          </Card>

          {/* Bugünkü Antrenman */}
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md
            }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 20, 
                fontWeight: '700' 
              }}>
                🔥 Bugünkü Antrenman
              </Text>
              {todayWorkout.length > 0 && (
                <View style={{
                  backgroundColor: colors.success,
                  borderRadius: 20,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs
                }}>
                  <Text style={{ 
                    color: colors.background, 
                    fontSize: 12, 
                    fontWeight: '700' 
                  }}>
                    {todayWorkout.length} egzersiz
                  </Text>
                </View>
              )}
            </View>

            {todayWorkout.length > 0 ? (
              <View>
                {todayWorkout.map((exercise, index) => (
                  <View key={index} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: spacing.sm,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary
                  }}>
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing.sm
                    }}>
                      <Text style={{ 
                        color: colors.background, 
                        fontSize: 14, 
                        fontWeight: '700' 
                      }}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: colors.text, 
                        fontSize: 16, 
                        fontWeight: '600' 
                      }}>
                        {exercise.name}
                      </Text>
                      <Text style={{ 
                        color: colors.textMuted, 
                        fontSize: 12 
                      }}>
                        {exercise.sets} set × {exercise.reps} tekrar
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => navigation.navigate('Workout')}
                  style={{
                    backgroundColor: colors.success,
                    borderRadius: 16,
                    padding: spacing.md,
                    alignItems: 'center',
                    marginTop: spacing.md,
                    flexDirection: 'row',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name="play-circle" size={24} color={colors.background} />
                  <Text style={{ 
                    color: colors.background, 
                    fontSize: 16, 
                    fontWeight: '700',
                    marginLeft: spacing.sm
                  }}>
                    Antrenmanı Başlat
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: 'center', padding: spacing.xl }}>
                <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                <Text style={{ 
                  color: colors.textMuted, 
                  textAlign: 'center',
                  marginTop: spacing.md,
                  fontSize: 14
                }}>
                  Bugün için antrenman planlanmamış
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Program')}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm,
                    marginTop: spacing.md
                  }}
                >
                  <Text style={{ 
                    color: colors.background, 
                    fontSize: 14, 
                    fontWeight: '600' 
                  }}>
                    Program Oluştur
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Haftalık İstatistikler */}
          <View style={{ 
            flexDirection: 'row', 
            gap: spacing.md,
            marginBottom: spacing.lg 
          }}>
            <Card style={{ 
              flex: 1, 
              padding: spacing.lg,
              alignItems: 'center'
            }}>
              <Ionicons name="calendar" size={32} color={colors.primary} />
              <Text style={{ 
                color: colors.text, 
                fontSize: 28, 
                fontWeight: '900',
                marginTop: spacing.sm
              }}>
                {weeklyStats.workoutDays}
              </Text>
              <Text style={{ 
                color: colors.textMuted, 
                fontSize: 12,
                textAlign: 'center'
              }}>
                Bu hafta{'\n'}antrenman
              </Text>
            </Card>

            <Card style={{ 
              flex: 1, 
              padding: spacing.lg,
              alignItems: 'center'
            }}>
              <Ionicons name="barbell" size={32} color={colors.success} />
              <Text style={{ 
                color: colors.text, 
                fontSize: 28, 
                fontWeight: '900',
                marginTop: spacing.sm
              }}>
                {weeklyStats.totalSets}
              </Text>
              <Text style={{ 
                color: colors.textMuted, 
                fontSize: 12,
                textAlign: 'center'
              }}>
                Bugün{'\n'}toplam set
              </Text>
            </Card>
          </View>

          {/* Kilo Değişimi */}
          {weightData.length > 1 && (
            <Card style={{ 
              padding: spacing.lg,
              marginBottom: spacing.lg
            }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View>
                  <Text style={{ 
                    color: colors.textMuted, 
                    fontSize: 14,
                    marginBottom: spacing.xs
                  }}>
                    Kilo Değişimi
                  </Text>
                  <Text style={{ 
                    color: getWeightChange() >= 0 ? colors.success : colors.error, 
                    fontSize: 32, 
                    fontWeight: '900' 
                  }}>
                    {getWeightChange() >= 0 ? '+' : ''}{getWeightChange().toFixed(1)}kg
                  </Text>
                </View>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: getWeightChange() >= 0 
                    ? 'rgba(0, 208, 132, 0.1)' 
                    : 'rgba(255, 71, 87, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Ionicons 
                    name={getWeightChange() >= 0 ? "trending-up" : "trending-down"} 
                    size={40} 
                    color={getWeightChange() >= 0 ? colors.success : colors.error} 
                  />
                </View>
              </View>
            </Card>
          )}

          {/* Hızlı Erişim */}
          <View style={{ 
            flexDirection: 'row', 
            gap: spacing.md 
          }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Takip')}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: colors.background === '#FFFFFF' ? 0.1 : 0,
                shadowRadius: 4,
                elevation: colors.background === '#FFFFFF' ? 2 : 0
              }}
            >
              <Ionicons name="analytics" size={32} color={colors.info} />
              <Text style={{ 
                color: colors.text, 
                fontSize: 14, 
                fontWeight: '600',
                marginTop: spacing.sm,
                textAlign: 'center'
              }}>
                Takip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Program')}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: colors.background === '#FFFFFF' ? 0.1 : 0,
                shadowRadius: 4,
                elevation: colors.background === '#FFFFFF' ? 2 : 0
              }}
            >
              <Ionicons name="list" size={32} color={colors.warning} />
              <Text style={{ 
                color: colors.text, 
                fontSize: 14, 
                fontWeight: '600',
                marginTop: spacing.sm,
                textAlign: 'center'
              }}>
                Program
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Profil')}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: colors.background === '#FFFFFF' ? 0.1 : 0,
                shadowRadius: 4,
                elevation: colors.background === '#FFFFFF' ? 2 : 0
              }}
            >
              <Ionicons name="person" size={32} color={colors.purple} />
              <Text style={{ 
                color: colors.text, 
                fontSize: 14, 
                fontWeight: '600',
                marginTop: spacing.sm,
                textAlign: 'center'
              }}>
                Profil
              </Text>
            </TouchableOpacity>
          </View>

          {/* Motivasyon Sözü */}
          <Card style={{ 
            marginTop: spacing.lg,
            padding: spacing.xl,
            backgroundColor: colors.primary,
            alignItems: 'center'
          }}>
            <Text style={{ 
              color: colors.background, 
              fontSize: 18, 
              fontWeight: '700',
              textAlign: 'center',
              lineHeight: 28
            }}>
              "Disiplin > Motivasyon"
            </Text>
            <Text style={{ 
              color: colors.background, 
              fontSize: 14,
              textAlign: 'center',
              marginTop: spacing.sm,
              opacity: 0.9
            }}>
              Hedefine odaklan, sürekli ilerle 💪
            </Text>
          </Card>

          {/* AdMob Banner Reklam */}
          <View style={{ 
            marginTop: spacing.lg,
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: colors.background === '#FFFFFF' ? 0.1 : 0,
            shadowRadius: 4,
            elevation: colors.background === '#FFFFFF' ? 2 : 0
          }}>
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
              onAdFailedToLoad={(error) => {
                console.log('Banner reklam yüklenemedi:', error);
              }}
            />
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
