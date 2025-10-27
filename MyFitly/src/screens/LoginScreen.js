import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';
import { supabase } from '../config/supabase';
import { spacing } from '../theme/colors';
import LanguageSelector from '../components/LanguageSelector';

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = getTranslations(language);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Kaydedilmiş bilgileri yükle
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('remembered_email');
      const savedPassword = await AsyncStorage.getItem('remembered_password');
      const rememberMeStatus = await AsyncStorage.getItem('remember_me');
      
      if (savedEmail && savedPassword && rememberMeStatus === 'true') {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('❌ Kaydedilmiş bilgiler yüklenemedi:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('remembered_email', email);
        await AsyncStorage.setItem('remembered_password', password);
        await AsyncStorage.setItem('remember_me', 'true');
      } else {
        await AsyncStorage.removeItem('remembered_email');
        await AsyncStorage.removeItem('remembered_password');
        await AsyncStorage.removeItem('remember_me');
      }
    } catch (error) {
      console.error('❌ Bilgiler kaydedilemedi:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t.error, t.fill_all_fields);
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Giriş yapılıyor...', { email: email.trim(), passwordLength: password.length });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('🔐 Supabase auth response:', { data: !!data, error: error?.message });

      if (error) {
        console.error('❌ Giriş hatası:', error);
        Alert.alert(t.error, error.message === 'Invalid login credentials' 
          ? t.invalid_credentials 
          : error.message);
        return;
      }

      console.log('✅ Giriş başarılı:', data.user.id);
      
      // Beni hatırla seçeneği aktifse bilgileri kaydet
      await saveCredentials();
      
      // Session'ı manuel olarak kontrol et
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('🔍 Manuel session kontrolü:', { hasSession: !!sessionData.session });
      
      // Kullanıcının profil bilgilerini kontrol et
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('👤 Profil kontrolü:', { userData: !!userData, userError: userError?.message });

      if (userError || !userData) {
        console.log('⚠️ Kullanıcı profili bulunamadı, profil kurulum ekranına yönlendirilecek...');
        // Profil yoksa ProfileSetup ekranına yönlendirilecek
      }

      // Navigation otomatik olacak çünkü UserContext auth state'ini izliyor
      
    } catch (error) {
      console.error('❌ Beklenmeyen hata:', error);
      Alert.alert(t.error, t.something_went_wrong);
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
            <View style={{ alignItems: 'center', marginBottom: spacing.xl * 2 }}>
              <Image 
                source={require('../../assets/icon.png')}
                style={{
                  width: 140,
                  height: 140,
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
                color: colors.text,
                fontSize: 32,
                fontWeight: '900',
                marginBottom: spacing.xs
              }}>
                {t.login_title || 'Sign In'} 💪
              </Text>
              <Text style={{
                color: colors.textMuted,
                fontSize: 16,
                textAlign: 'center'
              }}>
                {t.login_subtitle || 'Sign in to your account'}
              </Text>
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                {t.email}
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
                  placeholder={t.email}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
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
            <View style={{ marginBottom: spacing.xl }}>
              <Text style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: spacing.sm
              }}>
                {t.password}
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
                  placeholder={t.password}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  textContentType="none"
                  passwordRules=""
                  keyboardType="default"
                  importantForAutofill="no"
                  clearButtonMode="never"
                  spellCheck={false}
                  dataDetectorTypes="none"
                  multiline={false}
                  blurOnSubmit={false}
                  returnKeyType="done"
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

            {/* Beni Hatırla Checkbox */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: spacing.lg,
              justifyContent: 'center'
            }}>
              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderWidth: 1,
                  borderColor: rememberMe ? colors.primary : colors.border
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: rememberMe ? colors.primary : colors.border,
                  backgroundColor: rememberMe ? colors.primary : 'transparent',
                  marginRight: spacing.sm,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={14} color={colors.background} />
                  )}
                </View>
                <Text style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: '500'
                }}>
                  {t.remember_me || (language === 'tr' ? 'Beni Hatırla' : 'Remember Me')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
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
                {loading ? t.loading : t.login}
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{
                color: colors.textMuted,
                fontSize: 14
              }}>
                {t.dont_have_account}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: '700'
                }}>
                  {t.sign_up_here}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Language Selector */}
            <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: colors.card,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Ionicons name="language" size={16} color={colors.textMuted} />
                <Text style={{
                  color: colors.textMuted,
                  fontSize: 14,
                  marginLeft: 6
                }}>
                  {t.language}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textMuted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Language Selection Modal */}
        <LanguageSelector
          visible={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          showInModal={true}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}