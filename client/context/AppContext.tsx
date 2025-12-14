import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, View, ActivityIndicator, StyleSheet } from 'react-native';

type Language = 'en' | 'ur' | 'hi' | 'ps' | 'sd';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;
  hasSelectedLanguage: boolean;
  setHasSelectedLanguage: (selected: boolean) => void;
  isRTL: boolean;
  translations: Record<string, string>;
  t: (key: string) => string;
  lastScanTime: Date | null;
  setLastScanTime: (time: Date | null) => void;
  threatCount: number;
  setThreatCount: (count: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const RTL_LANGUAGES: Language[] = ['ur', 'ps', 'sd'];

import en from '@/locales/en.json';
import ur from '@/locales/ur.json';
import hi from '@/locales/hi.json';
import ps from '@/locales/ps.json';
import sd from '@/locales/sd.json';

const translations: Record<Language, Record<string, string>> = {
  en,
  ur,
  hi,
  ps,
  sd,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isPremium, setIsPremiumState] = useState(false);
  const [hasSelectedLanguage, setHasSelectedLanguageState] = useState(false);
  const [lastScanTime, setLastScanTimeState] = useState<Date | null>(null);
  const [threatCount, setThreatCountState] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isRTL = RTL_LANGUAGES.includes(language);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedLang, storedPremium, storedHasSelected, storedLastScan, storedThreatCount] = await Promise.all([
        AsyncStorage.getItem('language'),
        AsyncStorage.getItem('isPremium'),
        AsyncStorage.getItem('hasSelectedLanguage'),
        AsyncStorage.getItem('lastScanTime'),
        AsyncStorage.getItem('threatCount'),
      ]);

      if (storedLang) {
        setLanguageState(storedLang as Language);
        const shouldBeRTL = RTL_LANGUAGES.includes(storedLang as Language);
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.forceRTL(shouldBeRTL);
        }
      }
      if (storedPremium) setIsPremiumState(storedPremium === 'true');
      if (storedHasSelected) setHasSelectedLanguageState(storedHasSelected === 'true');
      if (storedLastScan) setLastScanTimeState(new Date(storedLastScan));
      if (storedThreatCount) setThreatCountState(parseInt(storedThreatCount, 10));
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
    const shouldBeRTL = RTL_LANGUAGES.includes(lang);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
    }
  };

  const setIsPremium = async (premium: boolean) => {
    setIsPremiumState(premium);
    await AsyncStorage.setItem('isPremium', premium.toString());
  };

  const setHasSelectedLanguage = async (selected: boolean) => {
    setHasSelectedLanguageState(selected);
    await AsyncStorage.setItem('hasSelectedLanguage', selected.toString());
  };

  const setLastScanTime = async (time: Date | null) => {
    setLastScanTimeState(time);
    if (time) {
      await AsyncStorage.setItem('lastScanTime', time.toISOString());
    } else {
      await AsyncStorage.removeItem('lastScanTime');
    }
  };

  const setThreatCount = async (count: number) => {
    setThreatCountState(count);
    await AsyncStorage.setItem('threatCount', count.toString());
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  if (isLoading) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color="#00FF41" />
      </View>
    );
  }

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        isPremium,
        setIsPremium,
        hasSelectedLanguage,
        setHasSelectedLanguage,
        isRTL,
        translations: translations[language],
        t,
        lastScanTime,
        setLastScanTime,
        threatCount,
        setThreatCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
