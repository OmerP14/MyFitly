import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { spacing } from '../theme/colors';

export default function ProfileSetupScreen() {
  const { colors } = useTheme();
  const { userData, updateUserData, session, refreshUser } = useUser();
  
  const [name, setName] = useState(userData?.name || session?.user?.email?.split('@')[0] || '');
  const [age, setAge] = useState(userData?.age?.toString() || '');
  const [height, setHeight] = useState(userData?.height?.toString() || '');
  const [currentWeight, setCurrentWeight] = useState(userData?.current_weight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState(userData?.target_weight?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!name || !age || !height || !currentWeight || !targetWeight) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (parseInt(age) < 10 || parseInt(age) > 100) {
      Alert.alert('Hata', 'Lütfen geçerli bir yaş girin (10-100)');
      return;
    }

    if (parseInt(height) < 100 || parseInt(height) > 250) {
      Alert.alert('Hata', 'Lütfen geçerli bir boy girin (100-250 cm)');
      return;
    }

    if (parseFloat(currentWeight) < 30 || parseFloat(currentWeight) > 300) {
      Alert.alert('Hata', 'Lütfen geçerli bir kilo girin (30-300 kg)');
      return;
    }

    if (parseFloat(targetWeight) < 30 || parseFloat(targetWeight) > 300) {
      Alert.alert('Hata', 'Lütfen geçerli bir hedef kilo girin (30-300 kg)');
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Profil tamamlanıyor...');

      // Eğer userData yoksa (yeni kullanıcı), önce profil oluştur/güncelle
      if (!userData && session?.user) {
        const { supabase } = require('../config/supabase');
        
        // UPSERT kullan - eğer kullanıcı varsa güncelle, yoksa oluştur
        const { error: upsertError } = await supabase
          .from('users')
          .upsert([
            {
              id: session.user.id,
              email: session.user.email,
              name: name.trim(),
              age: parseInt(age),
              height: parseInt(height),
              current_weight: parseFloat(currentWeight),
              target_weight: parseFloat(targetWeight),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ], { 
            onConflict: 'id' // ID çakışması durumunda güncelle
          });

        if (upsertError) {
          console.error('❌ Profil oluşturma/güncelleme hatası:', upsertError);
          Alert.alert('Hata', 'Profil oluşturulurken bir hata oluştu');
          return;
        }
        console.log('✅ Profil başarıyla oluşturuldu/güncellendi');
      } else {
        // Mevcut profili güncelle
        await updateUserData({
          name: name.trim(),
          age: parseInt(age),
          height: parseInt(height),
          current_weight: parseFloat(currentWeight),
          target_weight: parseFloat(targetWeight)
        });
      }

      // Kullanıcı bağlamını yenile ki needsProfileCompletion false olsun
      await refreshUser();

      console.log('✅ Profil tamamlandı!');
      Alert.alert('Tebrikler! 🎉', 'Profilin tamamlandı! Artık fitness yolculuğuna başlayabilirsin.');

    } catch (error) {
      console.error('❌ Profil tamamlama hatası:', error);
      Alert.alert('Hata', 'Profil tamamlanırken bir hata oluştu');
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
              Profilini Tamamla 📝
            </Text>
            <Text style={{
              color: colors.textMuted,
              fontSize: 14,
              textAlign: 'center',
              paddingHorizontal: spacing.lg
            }}>
              Sana özel bir deneyim için birkaç bilgiye ihtiyacımız var
            </Text>
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
                Adın Soyadın
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
                  placeholder="Örn: Ahmet Yılmaz"
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
                Yaşın
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
                  placeholder="Örn: 25"
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
                <Text style={{ color: colors.textMuted }}>yaş</Text>
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
                Boyun
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
                  placeholder="Örn: 175"
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
                <Text style={{ color: colors.textMuted }}>cm</Text>
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
                Mevcut Kilom
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
                  placeholder="Örn: 75"
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
                <Text style={{ color: colors.textMuted }}>kg</Text>
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
                Hedef Kilom
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
                  placeholder="Örn: 70"
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
                <Text style={{ color: colors.textMuted }}>kg</Text>
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
              {loading ? 'Kaydediliyor...' : 'Başlayalım! 🚀'}
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

