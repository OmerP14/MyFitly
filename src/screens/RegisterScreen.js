import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../config/supabase';
import { spacing } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Kayıt olunuyor...', email);

      // Supabase Auth ile kayıt
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('❌ Kayıt hatası:', error);
        Alert.alert('Kayıt Hatası', error.message);
        return;
      }

      console.log('✅ Auth kayıt başarılı:', data.user.id);

      // Users tablosuna kullanıcı bilgilerini ekle
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: email.trim(),
            name: name.trim(),
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        console.error('❌ Kullanıcı profili oluşturma hatası:', insertError);
        // Auth'da kayıt oldu ama users tablosuna eklenemedi
        // Yine de devam edebiliriz, profil doldururken tekrar deneyeceğiz
      }

      Alert.alert(
        'Kayıt Başarılı! 🎉',
        'Hesabın oluşturuldu! Şimdi profil bilgilerini tamamla.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              // Navigation otomatik olacak çünkü UserContext auth state'ini izliyor
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Beklenmeyen hata:', error);
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1,
              justifyContent: 'center',
              padding: spacing.xl 
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo ve Başlık */}
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  padding: spacing.sm
                }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
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
                <Ionicons name="person-add" size={50} color={colors.background} />
              </View>
              <Text style={{
                color: colors.text,
                fontSize: 32,
                fontWeight: '900',
                marginBottom: spacing.xs
              }}>
                Hesap Oluştur 🚀
              </Text>
              <Text style={{
                color: colors.textMuted,
                fontSize: 16,
                textAlign: 'center'
              }}>
                Fitness yolculuğuna bugün başla
              </Text>
            </View>

            {/* Name Input */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                Adın
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
                  placeholder="Adın Soyadın"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
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

            {/* Email Input */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                E-posta
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
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
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

            {/* Password Input */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                Şifre
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
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="En az 6 karakter"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 16,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={colors.textMuted} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: spacing.xl }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                Şifre Tekrar
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
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Şifreni tekrar gir"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
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

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center',
                marginBottom: spacing.md,
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
                {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{
                color: colors.textMuted,
                fontSize: 14
              }}>
                Zaten hesabın var mı?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: '700'
                }}>
                  Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

