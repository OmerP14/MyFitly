import React, { useState, useRef } from 'react';
import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';
import { supabase } from '../config/supabase';
import { spacing } from '../theme/colors';
import LanguageSelector from '../components/LanguageSelector';

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
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // TextInput refs
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert(t.error || 'Error', t.fill_all_fields || 'Please fill all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t.error || 'Error', t.password_mismatch || 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(t.error || 'Error', t.password_min_length || 'Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert(t.registration_error_title || 'Registration Error', error.message);
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
        // Devam edilebilir; profil aşamasında tekrar denenir
        console.warn('profile insert failed', insertError);
      }

      console.log('✅ Kayıt başarılı!');
      
      // UserContext'i yenile ki needsProfileCompletion true olsun
      console.log('🔄 UserContext yenileniyor...');
      await refreshUser();
      
      // Profil tamamlama ekranına yönlendir
      console.log('🔄 Profil tamamlama ekranına yönlendiriliyor...');
      Alert.alert(
        (t.registration_success_title || 'Registration Successful') + ' 🎉',
        t.registration_success_message || 'Your account has been created! Now complete your profile.',
        [
          {
            text: t.ok || 'OK',
            onPress: () => {
              console.log('✅ Alert kapatıldı, profil tamamlama ekranına yönlendiriliyor...');
            }
          }
        ]
      );

    } catch (error) {
      Alert.alert(t.error || 'Error', t.unexpected_error || 'An error occurred. Please try again.');
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1,
              justifyContent: 'center',
              padding: spacing.xl 
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
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

              <Image 
                source={require('../../assets/icon.png')}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 20,
                  marginBottom: spacing.lg,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
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
                {t.create_account_title || 'Create Account'}
              </Text>
              <Text style={{
                color: colors.textMuted,
                fontSize: 16,
                textAlign: 'center'
              }}>
                {t.create_account_subtitle || 'Start your fitness journey today'}
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
                {t.name_label || 'Full Name'}
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
                  ref={nameRef}
                  value={name}
                  onChangeText={setName}
                  placeholder={t.name_placeholder || 'Full name'}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect={false}
                  textContentType="name"
                  enablesReturnKeyAutomatically={false}
                  clearButtonMode="never"
                  spellCheck={false}
                  dataDetectorTypes="none"
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    setTimeout(() => emailRef.current?.focus(), 100);
                  }}
                  blurOnSubmit={false}
                  keyboardType="default"
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
                {t.email_label || 'Email'}
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
                  ref={emailRef}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t.email_placeholder || 'you@example.com'}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  enablesReturnKeyAutomatically={false}
                  clearButtonMode="never"
                  spellCheck={false}
                  dataDetectorTypes="none"
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    setTimeout(() => passwordRef.current?.focus(), 100);
                  }}
                  blurOnSubmit={false}
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
                {t.password_label || 'Password'}
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
                  ref={passwordRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t.password_placeholder || 'At least 6 characters'}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  autoCorrect={false}
                  textContentType="newPassword"
                  passwordRules="minlength: 6;"
                  keyboardType="default"
                  enablesReturnKeyAutomatically={false}
                  clearButtonMode="never"
                  spellCheck={false}
                  dataDetectorTypes="none"
                  multiline={false}
                  blurOnSubmit={false}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    setTimeout(() => confirmPasswordRef.current?.focus(), 100);
                  }}
                  editable={true}
                  selectTextOnFocus={false}
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
                {t.confirm_password_label || 'Confirm Password'}
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
                  ref={confirmPasswordRef}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t.confirm_password_placeholder || 'Re-enter your password'}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  autoCorrect={false}
                  textContentType="newPassword"
                  passwordRules="minlength: 6;"
                  keyboardType="default"
                  enablesReturnKeyAutomatically={false}
                  clearButtonMode="never"
                  spellCheck={false}
                  dataDetectorTypes="none"
                  multiline={false}
                  blurOnSubmit={false}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  editable={true}
                  selectTextOnFocus={false}
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
                {loading ? (t.loading || 'Loading...') : (t.register_button || 'Create Account')}
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
                {t.already_have_account || 'Already have an account?'}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: '700'
                }}>
                  {t.login_link || 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

