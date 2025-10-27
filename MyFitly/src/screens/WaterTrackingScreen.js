// src/screens/WaterTrackingScreen.js
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Header from '../components/Header';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';

export default function WaterTrackingScreen({ navigation }) {
  const { colors } = useTheme();
  const { userData } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);

  const [waterGoal] = useState(userData?.water_goal_ml || 2500); // ml
  const [consumedWater, setConsumedWater] = useState(0);
  const [waterLog, setWaterLog] = useState([]);

  const glassAmounts = [150, 200, 250, 300, 500];

  const addWater = (amount) => {
    const newTotal = consumedWater + amount;
    setConsumedWater(newTotal);
    
    const newLog = {
      id: Date.now(),
      amount,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    setWaterLog([newLog, ...waterLog]);
  };

  const removeWater = (id, amount) => {
    setConsumedWater(consumedWater - amount);
    setWaterLog(waterLog.filter(log => log.id !== id));
  };

  const waterPercentage = Math.min((consumedWater / waterGoal) * 100, 100);

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <Header
        title={t.water_tracking || 'Su Takibi'}
        subtitle={t.water_tracking_subtitle || 'Günlük su tüketimini takip et'}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}>

          {/* Su İlerleme Kartı */}
          <Card style={{ marginBottom: spacing.lg, padding: spacing.xl, alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: spacing.lg }}>
              💧 {t.daily_water_goal || 'Günlük Su Hedefi'}
            </Text>

            {/* Su Bardağı Görseli */}
            <View style={styles.glassContainer}>
              <View style={[styles.glass, { borderColor: colors.primary }]}>
                <View 
                  style={[
                    styles.waterFill, 
                    { 
                      backgroundColor: colors.primary,
                      height: `${waterPercentage}%`
                    }
                  ]} 
                />
                {/* Su dalgaları efekti */}
                <View style={[styles.wave, { backgroundColor: colors.primary, opacity: 0.3 }]} />
                <View style={[styles.wave2, { backgroundColor: colors.primary, opacity: 0.2 }]} />
              </View>
              <View style={styles.glassInfo}>
                <Text style={{ color: colors.primary, fontSize: 42, fontWeight: '900' }}>
                  {Math.round(waterPercentage)}%
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 16, marginTop: spacing.xs, fontWeight: '600' }}>
                  {consumedWater} / {waterGoal} ml
                </Text>
              </View>
            </View>

            {/* Motivasyon mesajı */}
            <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
              {waterPercentage >= 100 ? (
                <Text style={{ color: colors.success, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                  🎉 Tebrikler! Günlük hedefinizi tamamladınız!
                </Text>
              ) : waterPercentage >= 75 ? (
                <Text style={{ color: colors.success, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                  🔥 Harika! Hedefinize çok yakınsınız!
                </Text>
              ) : waterPercentage >= 50 ? (
                <Text style={{ color: colors.warning, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                  💪 İyi gidiyorsunuz! Devam edin!
                </Text>
              ) : (
                <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                  🌊 Su içmeye başlayın ve sağlıklı kalın!
                </Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: spacing.lg }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>{t.consumed || 'Tüketilen'}</Text>
                <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '800' }}>
                  {consumedWater} ml
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>{t.remaining || 'Kalan'}</Text>
                <Text style={{ color: colors.success, fontSize: 24, fontWeight: '800' }}>
                  {Math.max(0, waterGoal - consumedWater)} ml
                </Text>
              </View>
            </View>
          </Card>

          {/* Hızlı Ekle Butonları */}
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: spacing.md }}>
              ⚡ {t.quick_add || 'Hızlı Ekle'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg, textAlign: 'center' }}>
              Su miktarınızı hızlıca ekleyin
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {glassAmounts.map(amount => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => addWater(amount)}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 16,
                    padding: spacing.lg,
                    alignItems: 'center',
                    minWidth: 110,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Ionicons name="water" size={28} color={colors.background} />
                  <Text style={{ color: colors.background, fontSize: 18, fontWeight: '800', marginTop: spacing.xs }}>
                    {amount} ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Su Geçmişi */}
          <Card style={{ padding: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>
                📝 {t.water_history || 'Su Geçmişi'}
              </Text>
              {waterLog.length > 0 && (
                <TouchableOpacity 
                  onPress={() => { setWaterLog([]); setConsumedWater(0); }}
                  style={{
                    backgroundColor: colors.error,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: colors.background, fontWeight: '700', fontSize: 12 }}>
                    {t.clear_all || 'Tümünü Temizle'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {waterLog.length === 0 ? (
              <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                <Ionicons name="water-outline" size={64} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: spacing.md, textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
                  {t.no_water_logged || 'Henüz su kaydı yok'}
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center', fontSize: 14 }}>
                  Yukarıdaki butonlardan su ekleyin
                </Text>
              </View>
            ) : (
              waterLog.map(log => (
                <View 
                  key={log.id} 
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: spacing.lg,
                    paddingHorizontal: spacing.lg,
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: 16,
                    marginBottom: spacing.sm,
                    borderLeftWidth: 6,
                    borderLeftColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{
                      backgroundColor: colors.primary,
                      borderRadius: 20,
                      padding: spacing.sm,
                      marginRight: spacing.md,
                    }}>
                      <Ionicons name="water" size={20} color={colors.background} />
                    </View>
                    <View>
                      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                        {log.amount} ml
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '500' }}>
                        {log.time}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => removeWater(log.id, log.amount)}
                    style={{ 
                      padding: spacing.sm,
                      backgroundColor: colors.error,
                      borderRadius: 8,
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.background} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </Card>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    alignItems: 'center',
    marginVertical: 24
  },
  glass: {
    width: 140,
    height: 200,
    borderWidth: 4,
    borderRadius: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  waterFill: {
    width: '100%',
    opacity: 0.8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    borderRadius: 50,
    transform: [{ scaleX: 1.2 }],
  },
  wave2: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    height: 15,
    borderRadius: 50,
    transform: [{ scaleX: 1.1 }],
  },
  glassInfo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  }
});

