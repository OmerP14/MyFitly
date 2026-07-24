import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { spacing } from '../theme/colors';
import { getTranslations } from '../utils/translations';

export default function ProfileSetupScreen() {
  const { colors } = useTheme();
  const { userData, updateUserData, session, refreshUser, logout } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  const [name, setName] = useState(userData?.name || session?.user?.email?.split('@')[0] || '');
  const [age, setAge] = useState(userData?.age?.toString() || '');
  const [height, setHeight] = useState(userData?.height?.toString() || '');
  const [currentWeight, setCurrentWeight] = useState(userData?.current_weight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState(userData?.target_weight?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Profil oluşturmadan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Çıkış hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const handleComplete = async () => {
    if (!name || !age || !height || !currentWeight || !targetWeight) {
      Alert.alert(t.error, t.fill_all_fields);
      return;
    }

    if (parseInt(age) < 10 || parseInt(age) > 100) {
      Alert.alert(t.error, t.valid_age);
      return;
    }

    if (parseInt(height) < 100 || parseInt(height) > 250) {
      Alert.alert(t.error, t.valid_height);
      return;
    }

    if (parseFloat(currentWeight) < 30 || parseFloat(currentWeight) > 300) {
      Alert.alert(t.error, t.valid_weight);
      return;
    }

    if (parseFloat(targetWeight) < 30 || parseFloat(targetWeight) > 300) {
      Alert.alert(t.error, t.valid_target_weight);
      return;
    }

    try {
      setLoading(true);

      // Eğer userData yoksa veya eksikse, profil oluştur/güncelle
      if ((!userData || !userData.age || !userData.height || !userData.current_weight || !userData.target_weight) && session?.user) {
        const { supabase } = require('../config/supabase');
        
        
        // Önce auth.users tablosunda kullanıcının varlığını kontrol et
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser?.user) {
          console.error('❌ Auth kullanıcısı bulunamadı:', authError);
          Alert.alert('Hata', 'Kullanıcı kimlik doğrulaması başarısız. Lütfen tekrar giriş yapın.');
          return;
        }
        
        // Önce kullanıcının var olup olmadığını kontrol et
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        let insertData;
        let insertError = null;

        if (existingUser) {
          // Kullanıcı zaten varsa UPDATE yap
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
              name: name.trim(),
              display_name: name.trim(),
              age: parseInt(age),
              height: parseInt(height),
              current_weight: parseFloat(currentWeight),
              target_weight: parseFloat(targetWeight),
              preferred_language: language,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.user.id)
            .select()
            .single();
          
          insertData = updatedUser;
          insertError = updateError;
        } else {
          // Kullanıcı yoksa INSERT yap
          const { data: newUser, error: newUserError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              name: name.trim(),
              display_name: name.trim(),
              age: parseInt(age),
              height: parseInt(height),
              current_weight: parseFloat(currentWeight),
              target_weight: parseFloat(targetWeight),
              preferred_language: language
            })
            .select()
            .single();
          
          insertData = newUser;
          insertError = newUserError;
        }

        if (insertError) {
          console.error('❌ Profil işlemi hatası:', insertError);
          Alert.alert('Hata', 'Profil işlemi sırasında bir hata oluştu');
          return;
        }
      } else {
        // Mevcut profili güncelle
        await updateUserData({
          name: name.trim(),
          display_name: name.trim(),
          age: parseInt(age),
          height: parseInt(height),
          current_weight: parseFloat(currentWeight),
          target_weight: parseFloat(targetWeight),
          preferred_language: language
        });
      }

      // Kullanıcı bağlamını yenile ki needsProfileCompletion false olsun
      await refreshUser();

      Alert.alert(`${t.congratulations} 🎉`, t.profile_completed);

    } catch (error) {
      console.error('❌ Profil tamamlama hatası:', error);
      Alert.alert(t.error, t.profile_completion_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
          <ScrollView 
            contentContainerStyle={{ 
              padding: spacing.xl,
              paddingBottom: spacing.xl * 4
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.xl }}>
            {/* Çıkış butonu */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                alignSelf: 'flex-end',
                padding: spacing.sm,
                marginBottom: spacing.md,
                borderRadius: 8,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.lg
            }}>
              <Ionicons name="person" size={50} color={colors.background} />
            </View>
            <Text style={{
              color: colors.text,
              fontSize: 28,
              fontWeight: '900',
              marginBottom: spacing.xs,
              textAlign: 'center'
            }}>
              {t.complete_profile} 📝
            </Text>
            <Text style={{
              color: colors.textMuted,
              fontSize: 14,
              textAlign: 'center',
              paddingHorizontal: spacing.lg
            }}>
              {t.profile_setup_subtitle}
            </Text>
            
            {/* Debug bilgisi */}
            {!userData && (
              <Text style={{
                color: colors.textMuted,
                fontSize: 12,
                textAlign: 'center',
                paddingHorizontal: spacing.lg,
                marginTop: spacing.sm,
                fontStyle: 'italic'
              }}>
                Profil oluşturuluyor... Eğer takılırsa sağ üstteki çıkış butonunu kullanın.
              </Text>
            )}
          </View>

          {/* Form */}
          <View style={{ marginBottom: spacing.lg }}>
            {/* Name */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                {t.your_name}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors.border,
                paddingHorizontal: spacing.md
              }}>
                <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t.name_placeholder}
                  placeholderTextColor={colors.textMuted}
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 16,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm
                  }}
                />
              </View>
            </View>

            {/* Age */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                {t.your_age}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors.border,
                paddingHorizontal: spacing.md
              }}>
                <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder={t.age_placeholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 16,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm
                  }}
                />
                <Text style={{ color: colors.textMuted }}>{t.years_old}</Text>
              </View>
            </View>

            {/* Height */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                {t.your_height}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors.border,
                paddingHorizontal: spacing.md
              }}>
                <Ionicons name="resize-outline" size={20} color={colors.textMuted} />
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  placeholder={t.height_placeholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 16,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm
                  }}
                />
                <Text style={{ color: colors.textMuted }}>{t.cm_unit}</Text>
              </View>
            </View>

            {/* Current Weight */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                {t.your_current_weight}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors.border,
                paddingHorizontal: spacing.md
              }}>
                <Ionicons name="scale-outline" size={20} color={colors.textMuted} />
                <TextInput
                  value={currentWeight}
                  onChangeText={setCurrentWeight}
                  placeholder={t.weight_placeholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 16,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm
                  }}
                />
                <Text style={{ color: colors.textMuted }}>{t.kg_unit}</Text>
              </View>
            </View>

            {/* Target Weight */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                {t.your_target_weight}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors.border,
                paddingHorizontal: spacing.md
              }}>
                <Ionicons name="flag-outline" size={20} color={colors.textMuted} />
                <TextInput
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  placeholder={t.target_weight_placeholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 16,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm
                  }}
                />
                <Text style={{ color: colors.textMuted }}>{t.kg_unit}</Text>
              </View>
            </View>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            onPress={handleComplete}
            disabled={loading}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: spacing.lg,
              alignItems: 'center',
              marginTop: spacing.xl,
              marginBottom: spacing.lg,
              elevation: 4,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              opacity: loading ? 0.7 : 1
            }}
          >
            <Text style={{
              color: colors.background,
              fontSize: 18,
              fontWeight: '700'
            }}>
              {loading ? t.loading : `${t.lets_start} 🚀`}
            </Text>
          </TouchableOpacity>

          <Text style={{
            color: colors.textMuted,
            fontSize: 12,
            textAlign: 'center',
            paddingHorizontal: spacing.xl
          }}>
            Bu bilgileri istediğin zaman profil ayarlarından değiştirebilirsin
          </Text>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

