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
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg }}>
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
              </View>
              <View style={styles.glassInfo}>
                <Text style={{ color: colors.primary, fontSize: 36, fontWeight: '900' }}>
                  {Math.round(waterPercentage)}%
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: spacing.xs }}>
                  {consumedWater} / {waterGoal} ml
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: spacing.lg }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.consumed || 'Tüketilen'}</Text>
                <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>
                  {consumedWater} ml
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.remaining || 'Kalan'}</Text>
                <Text style={{ color: colors.success, fontSize: 20, fontWeight: '700' }}>
                  {Math.max(0, waterGoal - consumedWater)} ml
                </Text>
              </View>
            </View>
          </Card>

          {/* Hızlı Ekle Butonları */}
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
              {t.quick_add || 'Hızlı Ekle'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {glassAmounts.map(amount => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => addWater(amount)}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    padding: spacing.md,
                    alignItems: 'center',
                    minWidth: 100
                  }}
                >
                  <Ionicons name="water" size={24} color={colors.background} />
                  <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700', marginTop: spacing.xs }}>
                    {amount} ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Su Geçmişi */}
          <Card style={{ padding: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                📝 {t.water_history || 'Su Geçmişi'}
              </Text>
              {waterLog.length > 0 && (
                <TouchableOpacity onPress={() => { setWaterLog([]); setConsumedWater(0); }}>
                  <Text style={{ color: colors.error, fontWeight: '600' }}>
                    {t.clear_all || 'Tümünü Temizle'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {waterLog.length === 0 ? (
              <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                <Ionicons name="water-outline" size={48} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }}>
                  {t.no_water_logged || 'Henüz su kaydı yok. Yukarıdaki butonlardan su ekleyin.'}
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
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.md,
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: 12,
                    marginBottom: spacing.sm,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="water" size={20} color={colors.primary} />
                    <View style={{ marginLeft: spacing.md }}>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                        {log.amount} ml
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        {log.time}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => removeWater(log.id, log.amount)}
                    style={{ padding: spacing.sm }}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
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
    marginVertical: 20
  },
  glass: {
    width: 120,
    height: 180,
    borderWidth: 3,
    borderRadius: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end'
  },
  waterFill: {
    width: '100%',
    opacity: 0.7,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  },
  glassInfo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

