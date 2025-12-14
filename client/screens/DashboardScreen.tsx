import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAudioPlayer } from 'expo-audio';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { scanForThreats, AppInfo } from '@/data/threatDatabase';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const alarmSource = require('../../assets/sounds/alarm.mp3');

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, isPremium, lastScanTime, threatCount, setLastScanTime, setThreatCount } = useApp();
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasAutoScanned, setHasAutoScanned] = useState(false);
  const alarmPlayer = useAudioPlayer(alarmSource);
  
  const pulseScale = useSharedValue(1);
  const rotateValue = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  const playAlarmSound = useCallback(() => {
    try {
      alarmPlayer.seekTo(0);
      alarmPlayer.play();
    } catch (error) {
      console.log('Could not play alarm sound:', error);
    }
  }, [alarmPlayer]);

  const startIdleAnimation = useCallback(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  React.useEffect(() => {
    startIdleAnimation();
    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(glowOpacity);
      cancelAnimation(rotateValue);
    };
  }, [startIdleAnimation]);

  const handleScanComplete = useCallback((threats: AppInfo[]) => {
    setIsScanning(false);
    setLastScanTime(new Date());
    setThreatCount(threats.length);
    startIdleAnimation();
    if (threats.length > 0) {
      playAlarmSound();
    }
    navigation.navigate('ScanResults', { threats });
  }, [navigation, setLastScanTime, setThreatCount, startIdleAnimation, playAlarmSound]);

  const startScan = useCallback(async () => {
    setIsScanning(true);
    cancelAnimation(pulseScale);
    cancelAnimation(glowOpacity);
    
    rotateValue.value = 0;
    rotateValue.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    // Perform async scan with database fetch (online/offline)
    const threats = await scanForThreats();
    
    // Ensure minimum 3 second scan animation
    setTimeout(() => {
      cancelAnimation(rotateValue);
      runOnJS(handleScanComplete)(threats);
    }, 3000);
  }, [handleScanComplete]);

  useEffect(() => {
    if (!hasAutoScanned && !isScanning) {
      const timer = setTimeout(() => {
        setHasAutoScanned(true);
        startScan();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasAutoScanned, isScanning, startScan]);

  const scanButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isScanning ? 1 : pulseScale.value }],
  }));

  const radarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const formatLastScan = () => {
    if (!lastScanTime) return t('never');
    const now = new Date();
    const diff = now.getTime() - lastScanTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return `${minutes} ${t('minutesAgo')}`;
    if (hours < 24) return `${hours} ${t('hoursAgo')}`;
    return `${days} ${t('daysAgo')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
          <ThemedText style={styles.headerTitle}>{t('appName')}</ThemedText>
        </View>
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Feather name="settings" size={24} color={Colors.dark.text} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + (isPremium ? Spacing.xl : 100) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scanSection}>
          <AnimatedPressable
            style={[styles.scanButton, scanButtonStyle]}
            onPress={startScan}
            disabled={isScanning}
          >
            <Animated.View style={[styles.scanGlow, glowStyle]} />
            <View style={styles.scanButtonInner}>
              {isScanning ? (
                <Animated.View style={[styles.radarSweep, radarStyle]}>
                  <View style={styles.radarLine} />
                </Animated.View>
              ) : null}
              <View style={styles.scanCenter}>
                <Feather 
                  name={isScanning ? "activity" : "shield"} 
                  size={48} 
                  color={Colors.dark.safe} 
                />
              </View>
            </View>
          </AnimatedPressable>
          
          <ThemedText style={styles.scanText}>
            {isScanning ? t('scanning') : t('scan')}
          </ThemedText>
        </View>

        <View style={styles.statsSection}>
          <Card style={styles.statCard}>
            <Feather name="clock" size={24} color={Colors.dark.info} />
            <ThemedText style={styles.statLabel}>{t('lastScan')}</ThemedText>
            <ThemedText style={styles.statValue}>{formatLastScan()}</ThemedText>
          </Card>

          <Card style={styles.statCard}>
            <Feather 
              name="alert-triangle" 
              size={24} 
              color={threatCount > 0 ? Colors.dark.danger : Colors.dark.safe} 
            />
            <ThemedText style={styles.statLabel}>{t('threatsFound')}</ThemedText>
            <ThemedText style={[styles.statValue, threatCount > 0 && styles.dangerText]}>
              {threatCount}
            </ThemedText>
          </Card>

          <Card style={styles.statCard}>
            <Feather 
              name="shield" 
              size={24} 
              color={threatCount === 0 ? Colors.dark.safe : Colors.dark.warning} 
            />
            <ThemedText style={styles.statLabel}>{t('protectionStatus')}</ThemedText>
            <ThemedText 
              style={[
                styles.statValue, 
                threatCount === 0 ? styles.safeText : styles.warningText
              ]}
            >
              {threatCount === 0 ? t('protected') : t('atRisk')}
            </ThemedText>
          </Card>
        </View>
      </ScrollView>

      {!isPremium && (
        <Pressable
          style={({ pressed }) => [styles.premiumBanner, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate('Premium')}
        >
          <View style={styles.premiumBannerContent}>
            <Feather name="lock" size={20} color="#0A0A0A" />
            <ThemedText style={styles.premiumBannerText}>{t('unlockPremium')}</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color="#0A0A0A" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.dark.safe,
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  scanSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  scanButton: {
    width: Spacing.scanButtonSize,
    height: Spacing.scanButtonSize,
    borderRadius: Spacing.scanButtonSize / 2,
    backgroundColor: Colors.dark.backgroundDefault,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.safe,
  },
  scanGlow: {
    position: 'absolute',
    width: Spacing.scanButtonSize + 40,
    height: Spacing.scanButtonSize + 40,
    borderRadius: (Spacing.scanButtonSize + 40) / 2,
    backgroundColor: Colors.dark.safe,
  },
  scanButtonInner: {
    width: Spacing.scanButtonSize - 20,
    height: Spacing.scanButtonSize - 20,
    borderRadius: (Spacing.scanButtonSize - 20) / 2,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  radarSweep: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  radarLine: {
    width: 2,
    height: '50%',
    backgroundColor: Colors.dark.safe,
    opacity: 0.8,
  },
  scanCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    ...Typography.h2,
    color: Colors.dark.text,
    marginTop: Spacing.lg,
  },
  statsSection: {
    gap: Spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.dark.text,
  },
  safeText: {
    color: Colors.dark.safe,
  },
  warningText: {
    color: Colors.dark.warning,
  },
  dangerText: {
    color: Colors.dark.danger,
  },
  premiumBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.dark.premium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.lg + 20,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  premiumBannerText: {
    ...Typography.h3,
    color: '#0A0A0A',
  },
});
