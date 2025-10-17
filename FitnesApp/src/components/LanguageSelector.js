import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../utils/translations';

export default function LanguageSelector({ visible, onClose, showInModal = false }) {
  const { colors } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const t = getTranslations(language);

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const handleLanguageChange = async (langCode) => {
    await changeLanguage(langCode);
    if (onClose) onClose();
  };

  const renderLanguageOption = (lang) => (
    <TouchableOpacity
      key={lang.code}
      onPress={() => handleLanguageChange(lang.code)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: language === lang.code ? colors.primary + '20' : 'transparent'
      }}
    >
      <Text style={{ fontSize: 24, marginRight: 12 }}>{lang.flag}</Text>
      <Text style={{
        color: colors.text,
        fontSize: 16,
        fontWeight: language === lang.code ? '600' : '400',
        flex: 1
      }}>
        {lang.name}
      </Text>
      {language === lang.code && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  if (showInModal) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            maxHeight: '50%'
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border
            }}>
              <Text style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: '600'
              }}>
                {t.select_language}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Language Options */}
            <View style={{ paddingBottom: 20 }}>
              {languages.map(renderLanguageOption)}
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Inline selector for profile screen
  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="language" size={20} color={colors.primary} />
          <Text style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
            marginLeft: 8
          }}>
            {t.language}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{
            color: colors.textMuted,
            fontSize: 14,
            marginRight: 8
          }}>
            {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </View>
    </View>
  );
}







