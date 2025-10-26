import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { spacing } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Paywall özellik listesi
const PAYWALL_FEATURES = {
  tr: [
    { icon: 'restaurant', title: 'Haftalık Kişisel Diyet Planı', description: 'Size özel hazırlanan günlük öğün planları' },
    { icon: 'fitness', title: 'Makro Hedef Takibi', description: 'Protein, karbonhidrat ve yağ otomatik hesaplama' },
    { icon: 'repeat', title: 'Akıllı Öğün Alternatifleri', description: 'Beğenmediğiniz yemekler için anında alternatifler' },
    { icon: 'flash', title: 'Reklamsız Deneyim', description: 'Kesintisiz, tam odaklanma modu' },
    { icon: 'trending-up', title: 'İleri Düzey İstatistikler', description: 'Detaylı ilerleme grafikleri ve analiz' },
    { icon: 'clipboard', title: 'Sınırsız Öğün Kaydı', description: 'Tüm öğünlerinizi takip edin' },
  ],
  en: [
    { icon: 'restaurant', title: 'Weekly Personal Diet Plan', description: 'Daily meal plans customized for you' },
    { icon: 'fitness', title: 'Macro Target Tracking', description: 'Automatic protein, carbs and fat calculation' },
    { icon: 'repeat', title: 'Smart Meal Alternatives', description: 'Instant alternatives for meals you don\'t like' },
    { icon: 'flash', title: 'Ad-Free Experience', description: 'Uninterrupted, full focus mode' },
    { icon: 'trending-up', title: 'Advanced Statistics', description: 'Detailed progress charts and analysis' },
    { icon: 'clipboard', title: 'Unlimited Meal Logging', description: 'Track all your meals' },
  ]
};

const PAYWALL_TEXT = {
  tr: {
    title: 'Fitly Pro\'ya Geç',
    subtitle: 'Diyetini akıllı yönet!',
    monthlyPrice: '₺99,99/ay',
    purchaseButton: 'Pro\'yu Aktif Et',
    restoreButton: 'Satın Almaları Geri Yükle',
    termsNote: 'Abonelik otomatik yenilenir. İstediğiniz an iptal edebilirsiniz.',
    loadingPurchase: 'Satın alma işleniyor...',
    loadingRestore: 'Geri yükleniyor...',
  },
  en: {
    title: 'Upgrade to Fitly Pro',
    subtitle: 'Manage your diet smartly!',
    monthlyPrice: '$9.99/mo',
    purchaseButton: 'Activate Pro',
    restoreButton: 'Restore Purchases',
    termsNote: 'Subscription auto-renews. Cancel anytime.',
    loadingPurchase: 'Processing purchase...',
    loadingRestore: 'Restoring...',
  }
};

export default function Paywall({ 
  onPurchase, 
  onRestore, 
  isLoading = false,
  loadingType = null, // 'purchase' | 'restore'
  style 
}) {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = PAYWALL_TEXT[language] || PAYWALL_TEXT.tr;
  const features = PAYWALL_FEATURES[language] || PAYWALL_FEATURES.tr;

  return (
    <ScrollView 
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8F50', '#FFB86C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: spacing.xl,
          paddingTop: spacing.xl * 2,
          paddingBottom: spacing.xl,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          marginBottom: spacing.xl,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}>
            <Ionicons name="star" size={40} color="#FFF" />
          </View>
          
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: '#FFF',
            marginBottom: spacing.xs,
            textAlign: 'center',
          }}>
            {t.title}
          </Text>
          
          <Text style={{
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
          }}>
            {t.subtitle}
          </Text>
        </View>
      </LinearGradient>

      {/* Features List */}
      <View style={{ paddingHorizontal: spacing.lg }}>
        {features.map((feature, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              backgroundColor: colors.card,
              padding: spacing.lg,
              borderRadius: 16,
              marginBottom: spacing.md,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 107, 53, 0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: spacing.md,
            }}>
              <Ionicons name={feature.icon} size={24} color="#FF6B35" />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 4,
              }}>
                {feature.title}
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textMuted,
                lineHeight: 20,
              }}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pricing */}
      <View style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: colors.card,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl * 2,
          borderRadius: 20,
          marginBottom: spacing.lg,
          borderWidth: 3,
          borderColor: '#FF6B35',
          shadowColor: '#FF6B35',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}>
          <Text style={{
            fontSize: 36,
            fontWeight: 'bold',
            color: '#FF6B35',
            textAlign: 'center',
          }}>
            {t.monthlyPrice}
          </Text>
        </View>

        {/* Purchase Button */}
        <TouchableOpacity
          onPress={onPurchase}
          disabled={isLoading}
          style={{
            width: '100%',
            marginBottom: spacing.md,
          }}
        >
          <LinearGradient
            colors={isLoading ? ['#CCC', '#AAA'] : ['#FF6B35', '#FF8F50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: spacing.lg,
              borderRadius: 16,
              shadowColor: '#FF6B35',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {isLoading && loadingType === 'purchase' ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#FFF" size="small" style={{ marginRight: 8 }} />
                <Text style={{
                  color: '#FFF',
                  fontSize: 18,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                  {t.loadingPurchase}
                </Text>
              </View>
            ) : (
              <Text style={{
                color: '#FFF',
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
                {t.purchaseButton}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity
          onPress={onRestore}
          disabled={isLoading}
          style={{
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
            marginBottom: spacing.md,
          }}
        >
          {isLoading && loadingType === 'restore' ? (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} size="small" style={{ marginRight: 8 }} />
              <Text style={{
                color: colors.primary,
                fontSize: 15,
                fontWeight: '600',
              }}>
                {t.loadingRestore}
              </Text>
            </View>
          ) : (
            <Text style={{
              color: colors.primary,
              fontSize: 15,
              fontWeight: '600',
              textAlign: 'center',
            }}>
              {t.restoreButton}
            </Text>
          )}
        </TouchableOpacity>

        {/* Terms Note */}
        <Text style={{
          fontSize: 12,
          color: colors.textMuted,
          textAlign: 'center',
          paddingHorizontal: spacing.lg,
          lineHeight: 18,
        }}>
          {t.termsNote}
        </Text>
      </View>
    </ScrollView>
  );
}

// Inline (küçük) Paywall versiyonu - DietScreen içinde kullanılacak
export function PaywallInline({ onOpenFull }) {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    }}>
      <LinearGradient
        colors={['#FF6B35', '#FF8F50', '#FFB86C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 24,
          padding: spacing.xl,
          alignItems: 'center',
          shadowColor: '#FF6B35',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}>
          <Ionicons name="lock-closed" size={50} color="#FFF" />
        </View>

        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#FFF',
          marginBottom: spacing.sm,
          textAlign: 'center',
        }}>
          {isEnglish ? 'Upgrade to Pro' : 'Pro\'ya Geç'}
        </Text>

        <Text style={{
          fontSize: 16,
          color: 'rgba(255, 255, 255, 0.95)',
          textAlign: 'center',
          marginBottom: spacing.xl,
          lineHeight: 24,
        }}>
          {isEnglish 
            ? 'Unlock personalized diet plans, macro tracking, and ad-free experience'
            : 'Kişisel diyet planları, makro takibi ve reklamsız deneyimin kilidini aç'}
        </Text>

        <TouchableOpacity
          onPress={onOpenFull}
          style={{
            backgroundColor: '#FFF',
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl * 2,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text style={{
            color: '#FF6B35',
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
            {isEnglish ? 'View Plans' : 'Planları Gör'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}



