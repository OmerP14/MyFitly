// src/screens/DietSettingsScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
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
import { supabase } from '../config/supabase';

export default function DietSettingsScreen({ navigation }) {
  const { colors } = useTheme();
  const { userData, updateUserData } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);

  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    gender: userData?.gender || 'male',
    age: userData?.age || 25,
    height: userData?.height || 170,
    weight: userData?.current_weight || 70,
    activityLevel: 'moderately_active', // Bu diet profile'dan gelecek
    goalType: 'maintain_weight', // Bu diet profile'dan gelecek
    goalPercentage: 0, // Bu diet profile'dan gelecek
    dietType: 'balanced', // Bu diet profile'dan gelecek
    waterGoal: userData?.water_goal_ml || 2500,
  });
  const [dietProfile, setDietProfile] = useState(null);

  const activityLevels = [
    { id: 'sedentary', label: t.sedentary || 'Hareketsiz', desc: 'Masabaşı iş' },
    { id: 'lightly_active', label: t.lightly_active || 'Hafif Aktif', desc: 'Haftada 1-3 gün' },
    { id: 'moderately_active', label: t.moderately_active || 'Orta Aktif', desc: 'Haftada 3-5 gün' },
    { id: 'very_active', label: t.very_active || 'Çok Aktif', desc: 'Haftada 6-7 gün' },
    { id: 'extremely_active', label: t.extremely_active || 'Aşırı Aktif', desc: 'Günde 2 kez' }
  ];

  const goalTypes = [
    { id: 'lose_weight', label: t.lose_weight || 'Kilo Ver', icon: '📉', percentage: -15 },
    { id: 'maintain_weight', label: t.maintain_weight || 'Kilo Koru', icon: '➡️', percentage: 0 },
    { id: 'gain_weight', label: t.gain_weight || 'Kilo Al', icon: '📈', percentage: 15 }
  ];

  const dietTypes = [
    { id: 'balanced', label: t.balanced || 'Dengeli', icon: '⚖️' },
    { id: 'low_carb', label: t.low_carb || 'Düşük Karb', icon: '🥩' },
    { id: 'high_protein', label: t.high_protein || 'Yüksek Protein', icon: '💪' },
    { id: 'mediterranean', label: t.mediterranean || 'Akdeniz', icon: '🫒' },
    { id: 'ketogenic', label: t.ketogenic || 'Ketojenik', icon: '🥑' }
  ];


  // userData değiştiğinde settings'i güncelle (sadece ilk yüklemede)
  useEffect(() => {
    if (userData) {
      console.log('👤 UserData ilk yükleme, settings senkronize ediliyor...', {
        waterReminders: userData.water_reminders_enabled
      });
      
      setSettings(prev => ({
        ...prev,
        gender: userData.gender || prev.gender,
        age: userData.age || prev.age,
        height: userData.height || prev.height,
        weight: userData.current_weight || prev.weight,
        waterGoal: userData.water_goal_ml || prev.waterGoal,
      }));
    }
  }, [userData]);

  // Diet profile'ı yükle
  useEffect(() => {
    const loadDietProfile = async () => {
      if (!userData?.id) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('diet_profiles')
          .select('*')
          .eq('user_id', userData.id)
          .eq('is_active', true)
          .single();

        if (profile && !error) {
          setDietProfile(profile);
          setSettings(prev => ({
            ...prev,
            activityLevel: profile.activity_level || 'moderately_active',
            goalType: profile.goal_type || 'maintain_weight',
            goalPercentage: profile.goal_percentage || 0,
            dietType: profile.diet_type || 'balanced'
          }));
        }
        
      } catch (error) {
        console.error('❌ Diet profile yükleme hatası:', error);
      }
    };

    loadDietProfile();
  }, [userData?.id]);

  const saveSettings = async () => {
    setLoading(true);
    try {
      console.log('💾 Ayarlar kaydediliyor...', settings);

      // Users tablosunu güncelle (sadece temel bilgiler)
      const { error: userError } = await supabase
        .from('users')
        .update({
          age: settings.age,
          height: settings.height,
          current_weight: settings.weight,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);

      if (userError) throw userError;

      // Diet profile oluştur veya güncelle
      const { error: profileError } = await supabase
        .from('diet_profiles')
        .upsert({
          user_id: userData.id,
          gender: settings.gender,
          age: settings.age,
          height_cm: settings.height,
          weight_kg: settings.weight,
          activity_level: settings.activityLevel,
          goal_type: settings.goalType,
          goal_percentage: settings.goalPercentage,
          diet_type: settings.dietType,
          water_goal_ml: settings.waterGoal,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // UserContext'i güncelle (sadece users tablosundaki alanlar)
      await updateUserData({
        age: settings.age,
        height: settings.height,
        current_weight: settings.weight,
      });

      alert('✅ ' + (language === 'tr' ? 'Ayarlar kaydedildi!' : 'Settings saved!'));
      navigation.goBack();
    } catch (error) {
      console.error('🔴 Ayarları kaydetme hatası:', error);
      alert('❌ ' + (language === 'tr' ? 'Ayarlar kaydedilemedi' : 'Failed to save settings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <Header
        title={t.diet_settings || 'Diyet Ayarları'}
        subtitle={t.customize_your_diet || 'Diyet planınızı özelleştirin'}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>

          {/* Temel Bilgiler */}
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
              👤 {t.basic_info || 'Temel Bilgiler'}
            </Text>

            {/* Cinsiyet */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>
                {t.gender || 'Cinsiyet'}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TouchableOpacity
                  onPress={() => setSettings({...settings, gender: 'male'})}
                  style={{
                    flex: 1,
                    backgroundColor: settings.gender === 'male' ? colors.primary : colors.card,
                    borderRadius: 12,
                    padding: spacing.md,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: settings.gender === 'male' ? colors.primary : colors.border
                  }}
                >
                  <Text style={{ fontSize: 24 }}>👨</Text>
                  <Text style={{ 
                    color: settings.gender === 'male' ? colors.background : colors.text,
                    fontWeight: '600',
                    marginTop: spacing.xs
                  }}>
                    {t.male || 'Erkek'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSettings({...settings, gender: 'female'})}
                  style={{
                    flex: 1,
                    backgroundColor: settings.gender === 'female' ? colors.primary : colors.card,
                    borderRadius: 12,
                    padding: spacing.md,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: settings.gender === 'female' ? colors.primary : colors.border
                  }}
                >
                  <Text style={{ fontSize: 24 }}>👩</Text>
                  <Text style={{ 
                    color: settings.gender === 'female' ? colors.background : colors.text,
                    fontWeight: '600',
                    marginTop: spacing.xs
                  }}>
                    {t.female || 'Kadın'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Yaş, Boy, Kilo */}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs }}>
                  {t.age || 'Yaş'}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 8,
                    padding: spacing.md,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  value={String(settings.age)}
                  onChangeText={(text) => setSettings({...settings, age: parseInt(text) || 0})}
                  keyboardType="numeric"
                  placeholder="25"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs }}>
                  {t.height || 'Boy'} (cm)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 8,
                    padding: spacing.md,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  value={String(settings.height)}
                  onChangeText={(text) => setSettings({...settings, height: parseInt(text) || 0})}
                  keyboardType="numeric"
                  placeholder="170"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs }}>
                  {t.weight || 'Kilo'} (kg)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 8,
                    padding: spacing.md,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  value={String(settings.weight)}
                  onChangeText={(text) => setSettings({...settings, weight: parseFloat(text) || 0})}
                  keyboardType="numeric"
                  placeholder="70"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </Card>

          {/* Aktivite Seviyesi */}
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
              🏃 {t.activity_level || 'Aktivite Seviyesi'}
            </Text>
            {activityLevels.map(level => (
              <TouchableOpacity
                key={level.id}
                onPress={() => setSettings({...settings, activityLevel: level.id})}
                style={{
                  backgroundColor: settings.activityLevel === level.id ? colors.primary + '20' : colors.card,
                  borderRadius: 12,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  borderWidth: 2,
                  borderColor: settings.activityLevel === level.id ? colors.primary : colors.border
                }}
              >
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>
                  {level.label}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  {level.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Hedef */}
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
              🎯 {t.goal || 'Hedef'}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {goalTypes.map(goal => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => setSettings({...settings, goalType: goal.id, goalPercentage: goal.percentage})}
                  style={{
                    flex: 1,
                    backgroundColor: settings.goalType === goal.id ? colors.primary : colors.card,
                    borderRadius: 12,
                    padding: spacing.md,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: settings.goalType === goal.id ? colors.primary : colors.border
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{goal.icon}</Text>
                  <Text style={{ 
                    color: settings.goalType === goal.id ? colors.background : colors.text,
                    fontWeight: '600',
                    fontSize: 13,
                    marginTop: spacing.xs,
                    textAlign: 'center'
                  }}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Diyet Tipi */}
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
              🥗 {t.diet_type || 'Diyet Tipi'}
            </Text>
            {dietTypes.map(diet => (
              <TouchableOpacity
                key={diet.id}
                onPress={() => setSettings({...settings, dietType: diet.id})}
                style={{
                  backgroundColor: settings.dietType === diet.id ? colors.primary + '20' : colors.card,
                  borderRadius: 12,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: settings.dietType === diet.id ? colors.primary : colors.border
                }}
              >
                <Text style={{ fontSize: 24, marginRight: spacing.md }}>{diet.icon}</Text>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>
                  {diet.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>


        </ScrollView>

        {/* Kaydet Butonu */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: spacing.lg,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border
        }}>
          <TouchableOpacity
            onPress={saveSettings}
            disabled={loading}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: spacing.lg,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700' }}>
              {loading ? (t.saving || 'Kaydediliyor...') : (t.save_settings || 'Ayarları Kaydet')}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

