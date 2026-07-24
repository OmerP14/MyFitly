import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getTranslations } from '../utils/translations';

// PORTFOLIO / DEMO NOTICE: this paywall is a UI demo. Pressing "Subscribe"
// does not charge a card, contact an app store, or validate a receipt - it
// just sets a local flag via SubscriptionContext. See the notice at the top
// of src/context/SubscriptionContext.js for details.
const Paywall = ({ onClose }) => {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = getTranslations(language);
  const { activateSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Simulate subscription processing delay (demo only - no real purchase)
      await new Promise(resolve => setTimeout(resolve, 2000));
      await activateSubscription();
      onClose();
    } catch (error) {
      Alert.alert('Hata', 'Abonelik işlemi sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t.paywall?.title || 'MyFitly Pro'}
        </Text>
        
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t.paywall?.description || 'Tüm premium özelliklerin kilidini açın!'}
        </Text>

        <View style={styles.features}>
          <Text style={[styles.feature, { color: colors.text }]}>
            ✓ {t.paywall?.feature1 || 'Sınırsız egzersiz programları'}
          </Text>
          <Text style={[styles.feature, { color: colors.text }]}>
            ✓ {t.paywall?.feature2 || 'Detaylı diyet takibi ve raporları'}
          </Text>
          <Text style={[styles.feature, { color: colors.text }]}>
            ✓ {t.paywall?.feature3 || 'Reklamsız deneyim'}
          </Text>
          <Text style={[styles.feature, { color: colors.text }]}>
            ✓ {t.paywall?.feature4 || 'Su, uyku ve egzersiz hatırlatıcıları'}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {t.paywall?.monthlyPrice || '₺120/ay'}
          </Text>
          <Text style={[styles.priceNote, { color: colors.textSecondary }]}>
            {t.paywall?.priceNote || 'İstediğiniz zaman iptal edebilirsiniz'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: colors.primary }]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          <Text style={styles.subscribeButtonText}>
            {isLoading ? (t.paywall?.loading || 'Yükleniyor...') : (t.paywall?.subscribe || 'Pro\'ya Geç')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>
            {t.paywall?.close || 'Daha Sonra'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  features: {
    marginBottom: 30,
  },
  feature: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  priceNote: {
    fontSize: 14,
    marginTop: 5,
  },
  subscribeButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
  },
});

export default Paywall;