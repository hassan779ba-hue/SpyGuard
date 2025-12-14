import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { AppInfo, groupThreatsByCategory, getLayerDescription } from '@/data/threatDatabase';

type CategoryIconName = 'eye-off' | 'credit-card' | 'eye' | 'database' | 'alert-circle';

const categoryIcons: Record<string, CategoryIconName> = {
  spyware: 'eye',
  loanApp: 'credit-card',
  hiddenTracker: 'eye-off',
  dataLeak: 'database',
  unknownThreat: 'alert-circle',
};

const categoryColors: Record<string, string> = {
  spyware: Colors.dark.danger,
  loanApp: Colors.dark.danger,
  hiddenTracker: Colors.dark.warning,
  dataLeak: Colors.dark.warning,
  unknownThreat: Colors.dark.danger,
};

export default function ScanResultsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScanResults'>>();
  const { t, isPremium } = useApp();
  
  const { threats } = route.params;
  const groupedThreats = groupThreatsByCategory(threats);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'spyware': return t('spyware');
      case 'loanApp': return t('loanApps');
      case 'hiddenTracker': return t('hiddenTrackers');
      case 'dataLeak': return t('dataLeaks');
      case 'unknownThreat': return t('unknownThreats');
      default: return category;
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high': return t('highRisk');
      case 'medium': return t('mediumRisk');
      case 'low': return t('lowRisk');
      default: return t('safe');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return Colors.dark.danger;
      case 'medium': return Colors.dark.warning;
      case 'low': return Colors.dark.info;
      default: return Colors.dark.safe;
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleThreatPress = (threat: AppInfo) => {
    if (isPremium) {
      navigation.navigate('ThreatDetails', { threat });
    } else {
      navigation.navigate('Premium');
    }
  };

  if (threats.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: headerHeight + Spacing.xl }]}>
        <View style={styles.emptyState}>
          <View style={styles.safeIcon}>
            <Feather name="check-circle" size={80} color={Colors.dark.safe} />
          </View>
          <ThemedText style={styles.emptyTitle}>{t('noThreatsFound')}</ThemedText>
          <ThemedText style={styles.emptySubtitle}>{t('deviceSecure')}</ThemedText>
        </View>
      </View>
    );
  }

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
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t('scanResults')}</ThemedText>
          <View style={styles.threatCount}>
            <Feather name="alert-triangle" size={20} color={Colors.dark.danger} />
            <ThemedText style={styles.threatCountText}>
              {threats.length} {t('threatsFound')}
            </ThemedText>
          </View>
        </View>

        {!isPremium && (
          <Pressable
            style={({ pressed }) => [styles.premiumCard, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate('Premium')}
          >
            <View style={styles.premiumCardContent}>
              <Feather name="lock" size={24} color={Colors.dark.premium} />
              <View style={styles.premiumCardText}>
                <ThemedText style={styles.premiumCardTitle}>{t('unlockPremium')}</ThemedText>
                <ThemedText style={styles.premiumCardSubtitle}>{t('seeAllThreats')}</ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.dark.premium} />
          </Pressable>
        )}

        <View style={styles.categories}>
          {Object.entries(groupedThreats).map(([category, categoryThreats]) => (
            <View key={category} style={styles.categorySection}>
              <Pressable
                style={({ pressed }) => [styles.categoryHeader, pressed && styles.cardPressed]}
                onPress={() => toggleCategory(category)}
              >
                <View style={styles.categoryHeaderLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: categoryColors[category] + '20' }]}>
                    <Feather 
                      name={categoryIcons[category] || 'alert-circle'} 
                      size={20} 
                      color={categoryColors[category]} 
                    />
                  </View>
                  <View>
                    <ThemedText style={styles.categoryTitle}>{getCategoryLabel(category)}</ThemedText>
                    <ThemedText style={styles.categoryCount}>
                      {categoryThreats.length} {categoryThreats.length === 1 ? 'threat' : 'threats'}
                    </ThemedText>
                  </View>
                </View>
                <Feather 
                  name={expandedCategory === category ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={Colors.dark.textSecondary} 
                />
              </Pressable>

              {expandedCategory === category && (
                <View style={styles.threatList}>
                  {categoryThreats.map((threat) => (
                    <Pressable
                      key={threat.id}
                      style={({ pressed }) => [styles.threatItem, pressed && styles.cardPressed]}
                      onPress={() => handleThreatPress(threat)}
                    >
                      <View style={styles.threatItemLeft}>
                        {isPremium ? (
                          <View style={styles.appIconPlaceholder}>
                            <Feather name="box" size={20} color={Colors.dark.textSecondary} />
                          </View>
                        ) : (
                          <BlurView intensity={20} style={styles.appIconBlurred}>
                            <Feather name="box" size={20} color={Colors.dark.textSecondary} />
                          </BlurView>
                        )}
                        <View style={styles.threatInfo}>
                          <ThemedText style={styles.threatName}>
                            {isPremium ? threat.name : '?????'}
                          </ThemedText>
                          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(threat.riskLevel) + '20' }]}>
                            <ThemedText style={[styles.riskBadgeText, { color: getRiskColor(threat.riskLevel) }]}>
                              {getRiskLabel(threat.riskLevel)}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                      {!isPremium && (
                        <Feather name="lock" size={16} color={Colors.dark.premium} />
                      )}
                      <Feather name="chevron-right" size={20} color={Colors.dark.textSecondary} />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ))}
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
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  threatCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  threatCountText: {
    ...Typography.body,
    color: Colors.dark.danger,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.premium,
  },
  cardPressed: {
    opacity: 0.7,
  },
  premiumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  premiumCardText: {
    gap: Spacing.xs,
  },
  premiumCardTitle: {
    ...Typography.h3,
    color: Colors.dark.premium,
  },
  premiumCardSubtitle: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  categories: {
    gap: Spacing.md,
  },
  categorySection: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    ...Typography.h3,
    color: Colors.dark.text,
  },
  categoryCount: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  threatList: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  threatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  threatItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  appIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconBlurred: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  threatInfo: {
    gap: Spacing.xs,
    flex: 1,
  },
  threatName: {
    ...Typography.body,
    color: Colors.dark.text,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  riskBadgeText: {
    ...Typography.small,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  safeIcon: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.dark.safe,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
});
