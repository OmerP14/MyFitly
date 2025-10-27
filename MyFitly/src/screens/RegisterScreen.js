import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';
import { supabase } from '../config/supabase';
import { spacing } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const { refreshUser } = useUser();
  const { language } = useLanguage();
  const t = getTranslations(language);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert('Kayıt Hatası', error.message);
        return;
      }

      // Users tablosuna kullanıcı bilgilerini ekle
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: email.trim(),
            name: name.trim(),
            display_name: name.trim(),
            preferred_language: language,
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        console.warn('profile insert failed', insertError);
      }

      console.log('✅ Kayıt başarılı!');
      await refreshUser();
      
      Alert.alert(
        'Kayıt Başarılı 🎉',
        'Hesabınız oluşturuldu! Şimdi profilinizi tamamlayın.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              console.log('✅ Alert kapatıldı');
            }
          }
        ]
      );

    } catch (error) {
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={{ flex: 1, padding: spacing.xl }}>
          
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <Image 
              source={require('../../assets/icon.png')}
              style={{
                width: 160,
                height: 160,
                borderRadius: 20,
                marginBottom: spacing.lg,
              }}
              resizeMode="cover"
            />
            <Text style={{
              color: colors.primary,
              fontSize: 28,
              fontWeight: '900',
              letterSpacing: 1,
              marginBottom: spacing.xs
            }}>
              MyFitly
            </Text>
            <Text style={{
              color: colors.text,
              fontSize: 32,
              fontWeight: '900',
              marginBottom: spacing.xs
            }}>
              Hesap Oluştur
            </Text>
            <Text style={{
              color: colors.textMuted,
              fontSize: 16,
              textAlign: 'center'
            }}>
              Fitness yolculuğunuza bugün başlayın
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
              Ad Soyad
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
                placeholder="Ad soyadınızı girin"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                autoComplete="off"
                textContentType="none"
                blurOnSubmit={false}
                editable={true}
                selectTextOnFocus={false}
                importantForAutofill="no"
                underlineColorAndroid="transparent"
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
                placeholder="E-posta adresinizi girin"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                blurOnSubmit={false}
                editable={true}
                selectTextOnFocus={false}
                importantForAutofill="no"
                underlineColorAndroid="transparent"
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
                placeholder="Şifrenizi girin"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                blurOnSubmit={false}
                editable={true}
                selectTextOnFocus={false}
                importantForAutofill="no"
                underlineColorAndroid="transparent"
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
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                blurOnSubmit={false}
                editable={true}
                selectTextOnFocus={false}
                importantForAutofill="no"
                underlineColorAndroid="transparent"
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
              opacity: loading ? 0.7 : 1
            }}
          >
            <Text style={{
              color: colors.background,
              fontSize: 18,
              fontWeight: '700'
            }}>
              {loading ? 'Yükleniyor...' : 'Hesap Oluştur'}
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
              Zaten hesabınız var mı?{' '}
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
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
