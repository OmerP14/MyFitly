import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t.error, t.fill_all_fields);
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Giriş yapılıyor...', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('❌ Giriş hatası:', error);
        Alert.alert(t.error, error.message === 'Invalid login credentials' 
          ? t.invalid_credentials 
          : error.message);
        return;
      }

      console.log('✅ Giriş başarılı:', data.user.id);
      
      // Kullanıcının profil bilgilerini kontrol et
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

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
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.lg
              }}>
                <Text style={{
                  color: colors.background,
                  fontSize: 36,
                  fontWeight: '900'
                }}>
                  Fitly
                </Text>
              </View>
              <Text style={{
                color: colors.text,
                fontSize: 32,
                fontWeight: '900',
                marginBottom: spacing.xs
              }}>
                {t.welcome} 💪
              </Text>
              <Text style={{
                color: colors.textMuted,
                fontSize: 16,
                textAlign: 'center'
              }}>
                {t.complete_profile_message}
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

