import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../config/supabase';
import { spacing } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
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
        Alert.alert('Giriş Hatası', error.message === 'Invalid login credentials' 
          ? 'E-posta veya şifre hatalı' 
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
        console.log('⚠️ Kullanıcı profili bulunamadı, yeni profil oluşturuluyor...');
        // Yeni kullanıcı profili oluştur
        const { error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name: data.user.email.split('@')[0],
              created_at: new Date().toISOString()
            }
          ]);

        if (createError) {
          console.error('❌ Profil oluşturma hatası:', createError);
        }
      }

      // Navigation otomatik olacak çünkü UserContext auth state'ini izliyor
      
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
                <Ionicons name="fitness" size={50} color={colors.background} />
              </View>
              <Text style={{
                color: colors.text,
                fontSize: 32,
                fontWeight: '900',
                marginBottom: spacing.xs
              }}>
                Hoş Geldin! 💪
              </Text>
              <Text style={{
                color: colors.textMuted,
                fontSize: 16,
                textAlign: 'center'
              }}>
                Fitness yolculuğuna devam et
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
            <View style={{ marginBottom: spacing.xl }}>
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
                  placeholder="••••••••"
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
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
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
                Hesabın yok mu?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: '700'
                }}>
                  Kayıt Ol
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

