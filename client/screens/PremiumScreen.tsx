import React from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/navigation/RootStackNavigator';

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, setIsPremium } = useApp();

  const features = [
    { icon: 'eye' as const, text: t('seeAllThreats') },
    { icon: 'trash-2' as const, text: t('uninstallApps') },
    { icon: 'shield' as const, text: t('realTimeShield') },
  ];

  const handlePurchase = () => {
    Alert.alert(
      'Purchase Successful',
      'Thank you for purchasing SpyGuard Premium! All features are now unlocked.',
      [
        {
          text: 'OK',
          onPress: () => {
            setIsPremium(true);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      t('restore'),
      'Checking for previous purchases...',
      [
        {
          text: 'OK',
          onPress: () => {
            Alert.alert('No Purchase Found', 'No previous purchase was found for this account.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.closeButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.goBack()}
        >
          <Feather name="x" size={24} color={Colors.dark.text} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[Colors.dark.premiumGradientStart, Colors.dark.premiumGradientEnd]}
            style={styles.premiumIconBg}
          >
            <Feather name="shield" size={48} color="#0A0A0A" />
          </LinearGradient>
        </View>

        <ThemedText style={styles.title}>{t('upgradeToPremium')}</ThemedText>
        <ThemedText style={styles.subtitle}>{t('premiumFeatures')}</ThemedText>

        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Feather name={feature.icon} size={20} color={Colors.dark.premium} />
              </View>
              <ThemedText style={styles.featureText}>{feature.text}</ThemedText>
              <Feather name="check" size={20} color={Colors.dark.safe} />
            </View>
          ))}
        </View>

        <Card style={styles.priceCard}>
          <View style={styles.launchOfferBadge}>
            <ThemedText style={styles.launchOfferText}>{t('launchOffer')}</ThemedText>
          </View>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.originalPrice}>$9.99</ThemedText>
            <ThemedText style={styles.currentPrice}>$1.49</ThemedText>
          </View>
          <ThemedText style={styles.lifetimeText}>{t('lifetimeAccess')}</ThemedText>
        </Card>

        <Pressable
          style={({ pressed }) => [styles.buyButton, pressed && styles.buyButtonPressed]}
          onPress={handlePurchase}
        >
          <LinearGradient
            colors={[Colors.dark.premiumGradientStart, Colors.dark.premiumGradientEnd]}
            style={styles.buyButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="unlock" size={20} color="#0A0A0A" />
            <ThemedText style={styles.buyButtonText}>{t('buyNow')}</ThemedText>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.restoreButton, pressed && styles.buttonPressed]}
          onPress={handleRestore}
        >
          <ThemedText style={styles.restoreButtonText}>{t('restore')}</ThemedText>
        </Pressable>
      </ScrollView>
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
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeButton: {
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
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  premiumIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.dark.premium,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  featuresList: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.premium + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...Typography.body,
    color: Colors.dark.text,
    flex: 1,
  },
  priceCard: {
    width: '100%',
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.dark.premium,
  },
  launchOfferBadge: {
    backgroundColor: Colors.dark.danger,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.md,
  },
  launchOfferText: {
    ...Typography.small,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  originalPrice: {
    ...Typography.h2,
    color: Colors.dark.textSecondary,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    ...Typography.hero,
    color: Colors.dark.premium,
  },
  lifetimeText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  buyButton: {
    width: '100%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  buyButtonPressed: {
    opacity: 0.8,
  },
  buyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  buyButtonText: {
    ...Typography.h3,
    color: '#0A0A0A',
  },
  restoreButton: {
    paddingVertical: Spacing.md,
  },
  restoreButtonText: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textDecorationLine: 'underline',
  },
});
