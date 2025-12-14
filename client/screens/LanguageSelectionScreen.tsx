import React from 'react';
import { View, StyleSheet, Pressable, I18nManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Updates from 'expo-updates';
import { reloadAppAsync } from 'expo';

import { ThemedText } from '@/components/ThemedText';
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

export default function LanguageSelectionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { language, setLanguage, setHasSelectedLanguage, t, isRTL } = useApp();
  const [selectedLang, setSelectedLang] = React.useState<Language>(language);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    await setLanguage(selectedLang);
    await setHasSelectedLanguage(true);
    
    const selectedLanguage = languages.find(l => l.code === selectedLang);
    const needsRTLChange = selectedLanguage?.isRTL !== I18nManager.isRTL;
    
    if (needsRTLChange) {
      I18nManager.forceRTL(selectedLanguage?.isRTL || false);
      try {
        await reloadAppAsync();
      } catch (e) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          })
        );
      }
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        })
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText style={styles.title}>SpyGuard</ThemedText>
        <ThemedText style={styles.subtitle}>Select Your Language</ThemedText>
      </View>

      <View style={styles.languageList}>
        {languages.map((lang) => (
          <Pressable
            key={lang.code}
            style={({ pressed }) => [
              styles.languageCard,
              selectedLang === lang.code && styles.languageCardSelected,
              pressed && styles.languageCardPressed,
            ]}
            onPress={() => handleLanguageSelect(lang.code)}
          >
            <View style={styles.languageInfo}>
              <ThemedText style={styles.languageNative}>{lang.nativeName}</ThemedText>
              <ThemedText style={styles.languageName}>{lang.name}</ThemedText>
            </View>
            <View style={[styles.radio, selectedLang === lang.code && styles.radioSelected]}>
              {selectedLang === lang.code && (
                <View style={styles.radioInner} />
              )}
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.continueButton,
          pressed && styles.continueButtonPressed,
          isLoading && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={isLoading}
      >
        <ThemedText style={styles.continueButtonText}>
          {isLoading ? '...' : 'Continue'}
        </ThemedText>
        <Feather name="arrow-right" size={20} color="#0A0A0A" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.dark.safe,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  languageList: {
    flex: 1,
    gap: Spacing.md,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  languageCardSelected: {
    borderColor: Colors.dark.safe,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  languageCardPressed: {
    opacity: 0.7,
  },
  languageInfo: {
    gap: Spacing.xs,
  },
  languageNative: {
    ...Typography.h3,
    color: Colors.dark.text,
  },
  languageName: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.dark.safe,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.safe,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.safe,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  continueButtonPressed: {
    opacity: 0.7,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...Typography.h3,
    color: '#0A0A0A',
  },
});
