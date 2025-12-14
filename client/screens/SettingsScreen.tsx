import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, I18nManager, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';
import { reloadAppAsync } from 'expo';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/navigation/RootStackNavigator';

type Language = 'en' | 'ur' | 'hi' | 'ps' | 'sd';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRTL: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', isRTL: false },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', isRTL: true },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', isRTL: true },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, language, setLanguage, isPremium, setIsPremium } = useApp();
  const [showLanguages, setShowLanguages] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const currentLanguage = languages.find(l => l.code === language);

  const handleLanguageChange = async (lang: Language) => {
    if (lang === language) {
      setShowLanguages(false);
      return;
    }

    setIsChangingLanguage(true);
    await setLanguage(lang);
    
    const selectedLanguage = languages.find(l => l.code === lang);
    const needsRTLChange = selectedLanguage?.isRTL !== I18nManager.isRTL;
    
    if (needsRTLChange) {
      I18nManager.forceRTL(selectedLanguage?.isRTL || false);
      try {
        await reloadAppAsync();
      } catch (e) {
        setShowLanguages(false);
        setIsChangingLanguage(false);
      }
    } else {
      setShowLanguages(false);
      setIsChangingLanguage(false);
    }
  };

  const handleResetPremium = () => {
    setIsPremium(false);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:Spyguardhelp@gmail.com?subject=SpyGuard%20Support%20Request');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { 
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl 
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.title}>{t('settings')}</ThemedText>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('language')}</ThemedText>
          <Pressable
            style={({ pressed }) => [styles.settingItem, pressed && styles.itemPressed]}
            onPress={() => setShowLanguages(!showLanguages)}
          >
            <View style={styles.settingLeft}>
              <Feather name="globe" size={20} color={Colors.dark.info} />
              <ThemedText style={styles.settingText}>{currentLanguage?.nativeName}</ThemedText>
            </View>
            <Feather 
              name={showLanguages ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={Colors.dark.textSecondary} 
            />
          </Pressable>

          {showLanguages && (
            <View style={styles.languageList}>
              {languages.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={({ pressed }) => [
                    styles.languageItem,
                    language === lang.code && styles.languageItemSelected,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                  disabled={isChangingLanguage}
                >
                  <View style={styles.languageInfo}>
                    <ThemedText style={styles.languageNative}>{lang.nativeName}</ThemedText>
                    <ThemedText style={styles.languageName}>{lang.name}</ThemedText>
                  </View>
                  {language === lang.code && (
                    <Feather name="check" size={20} color={Colors.dark.safe} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {isPremium && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('premium')}</ThemedText>
            <Card style={styles.premiumCard}>
              <View style={styles.premiumStatus}>
                <Feather name="shield" size={24} color={Colors.dark.premium} />
                <ThemedText style={styles.premiumText}>{t('premium')} Active</ThemedText>
              </View>
              <Pressable
                style={({ pressed }) => [styles.resetButton, pressed && styles.itemPressed]}
                onPress={handleResetPremium}
              >
                <ThemedText style={styles.resetButtonText}>Reset for Testing</ThemedText>
              </Pressable>
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Support</ThemedText>
          <Pressable
            style={({ pressed }) => [styles.settingItem, pressed && styles.itemPressed]}
            onPress={handleContactSupport}
          >
            <View style={styles.settingLeft}>
              <Feather name="mail" size={20} color={Colors.dark.info} />
              <ThemedText style={styles.settingText}>Contact Support</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.dark.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('about')}</ThemedText>
          <Card style={styles.aboutCard}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.aboutLogo}
              contentFit="contain"
            />
            <ThemedText style={styles.aboutName}>{t('appName')}</ThemedText>
            <ThemedText style={styles.aboutTagline}>{t('tagline')}</ThemedText>
            <ThemedText style={styles.aboutVersion}>{t('version')} 1.0.0</ThemedText>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.dark.text,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  itemPressed: {
    opacity: 0.7,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingText: {
    ...Typography.body,
    color: Colors.dark.text,
  },
  languageList: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  languageItemSelected: {
    borderWidth: 1,
    borderColor: Colors.dark.safe,
  },
  languageInfo: {
    gap: Spacing.xs,
  },
  languageNative: {
    ...Typography.body,
    color: Colors.dark.text,
  },
  languageName: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  premiumCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  premiumStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  premiumText: {
    ...Typography.h3,
    color: Colors.dark.premium,
  },
  resetButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.sm,
  },
  resetButtonText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  aboutCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  aboutLogo: {
    width: 60,
    height: 60,
    marginBottom: Spacing.md,
  },
  aboutName: {
    ...Typography.h2,
    color: Colors.dark.safe,
    marginBottom: Spacing.xs,
  },
  aboutTagline: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  aboutVersion: {
    ...Typography.caption,
    color: Colors.dark.textDisabled,
  },
});
