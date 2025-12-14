import React from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { getLayerDescription } from '@/data/threatDatabase';

type FeatherIconName = 'users' | 'camera' | 'mic' | 'mail' | 'hard-drive' | 'map-pin' | 'image' | 'phone' | 'file';

const permissionIcons: Record<string, FeatherIconName> = {
  READ_CONTACTS: 'users',
  CAMERA: 'camera',
  RECORD_AUDIO: 'mic',
  READ_SMS: 'mail',
  READ_EXTERNAL_STORAGE: 'hard-drive',
  ACCESS_FINE_LOCATION: 'map-pin',
  READ_CALL_LOG: 'phone',
};

const permissionLabels: Record<string, string> = {
  READ_CONTACTS: 'contacts',
  CAMERA: 'camera',
  RECORD_AUDIO: 'microphone',
  READ_SMS: 'sms',
  READ_EXTERNAL_STORAGE: 'storage',
  ACCESS_FINE_LOCATION: 'location',
  READ_CALL_LOG: 'Call Log',
};

export default function ThreatDetailsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const route = useRoute<RouteProp<RootStackParamList, 'ThreatDetails'>>();
  const { t, isPremium } = useApp();
  
  const { threat } = route.params;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return Colors.dark.danger;
      case 'medium': return Colors.dark.warning;
      case 'low': return Colors.dark.info;
      default: return Colors.dark.safe;
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

  const handleUninstall = () => {
    Alert.alert(
      t('uninstall'),
      `Are you sure you want to uninstall ${threat.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: t('uninstall'), 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', `${threat.name} has been marked for removal. On a real device, this would open the uninstall dialog.`);
          }
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      t('report'),
      `${threat.name} has been reported. Thank you for helping keep others safe.`,
      [{ text: 'OK' }]
    );
  };

  const dangerousPermissions = [
    'READ_CONTACTS',
    'READ_SMS',
    'CAMERA',
    'RECORD_AUDIO',
    'ACCESS_FINE_LOCATION',
    'READ_EXTERNAL_STORAGE',
    'READ_CALL_LOG',
  ];

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
          <View style={styles.appIconLarge}>
            <Feather name="box" size={40} color={Colors.dark.textSecondary} />
          </View>
          <ThemedText style={styles.appName}>{threat.name}</ThemedText>
          <ThemedText style={styles.packageName}>{threat.packageName}</ThemedText>
          <View style={[styles.riskBadgeLarge, { backgroundColor: getRiskColor(threat.riskLevel) }]}>
            <ThemedText style={styles.riskBadgeText}>{getRiskLabel(threat.riskLevel)}</ThemedText>
          </View>
        </View>

        <Card style={styles.descriptionCard}>
          <ThemedText style={styles.description}>{threat.description}</ThemedText>
        </Card>

        {threat.detectionLayer && (
          <Card style={styles.detectionLayerCard}>
            <View style={styles.detectionLayerHeader}>
              <Feather name="layers" size={20} color={Colors.dark.info} />
              <ThemedText style={styles.detectionLayerTitle}>{t('detectionMethod')}</ThemedText>
            </View>
            <ThemedText style={styles.detectionLayerValue}>
              Layer {threat.detectionLayer}: {getLayerDescription(threat.detectionLayer)}
            </ThemedText>
          </Card>
        )}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('permissionsRequested')}</ThemedText>
          <View style={styles.permissionsList}>
            {threat.permissions.map((permission, index) => {
              const isDangerous = dangerousPermissions.includes(permission);
              return (
                <View key={index} style={styles.permissionItem}>
                  <View style={[
                    styles.permissionIcon, 
                    { backgroundColor: isDangerous ? Colors.dark.danger + '20' : Colors.dark.backgroundSecondary }
                  ]}>
                    <Feather 
                      name={permissionIcons[permission] || 'file'} 
                      size={20} 
                      color={isDangerous ? Colors.dark.danger : Colors.dark.textSecondary} 
                    />
                  </View>
                  <View style={styles.permissionInfo}>
                    <ThemedText style={styles.permissionName}>
                      {permissionLabels[permission] ? t(permissionLabels[permission]) : permission}
                    </ThemedText>
                    {isDangerous && (
                      <ThemedText style={styles.dangerousLabel}>{t('dangerousPermission')}</ThemedText>
                    )}
                  </View>
                  {isDangerous && (
                    <Feather name="alert-triangle" size={16} color={Colors.dark.danger} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('dataUsage')}</ThemedText>
          <Card style={styles.dataUsageCard}>
            <View style={styles.dataUsageHeader}>
              <Feather name="database" size={24} color={Colors.dark.info} />
              <ThemedText style={styles.dataUsageValue}>{threat.dataUsageMB} MB</ThemedText>
            </View>
            <View style={styles.dataUsageBar}>
              <View 
                style={[
                  styles.dataUsageFill, 
                  { 
                    width: `${Math.min(threat.dataUsageMB, 100)}%`,
                    backgroundColor: threat.dataUsageMB > 50 ? Colors.dark.danger : 
                                    threat.dataUsageMB > 20 ? Colors.dark.warning : Colors.dark.safe
                  }
                ]} 
              />
            </View>
            {threat.dataUsageMB > 10 && !threat.hasLauncherIcon && (
              <ThemedText style={styles.dataUsageWarning}>
                {t('suspiciousDataUsage')}
              </ThemedText>
            )}
          </Card>
        </View>

        {!threat.hasLauncherIcon && (
          <Card style={styles.hiddenAppWarning}>
            <Feather name="eye-off" size={24} color={Colors.dark.warning} />
            <View style={styles.hiddenAppInfo}>
              <ThemedText style={styles.hiddenAppTitle}>{t('hiddenApp')}</ThemedText>
              <ThemedText style={styles.hiddenAppText}>{t('noLauncherIcon')}</ThemedText>
            </View>
          </Card>
        )}

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.reportButton, pressed && styles.buttonPressed]}
            onPress={handleReport}
          >
            <Feather name="flag" size={20} color={Colors.dark.safe} />
            <ThemedText style={styles.reportButtonText}>{t('report')}</ThemedText>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [
              styles.uninstallButton, 
              pressed && styles.buttonPressed,
              !isPremium && styles.buttonDisabled
            ]}
            onPress={isPremium ? handleUninstall : undefined}
            disabled={!isPremium}
          >
            {!isPremium && <Feather name="lock" size={16} color="#FFFFFF" />}
            <Feather name="trash-2" size={20} color="#FFFFFF" />
            <ThemedText style={styles.uninstallButtonText}>{t('uninstall')}</ThemedText>
          </Pressable>
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
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appIconLarge: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    ...Typography.h2,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  packageName: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
  },
  riskBadgeLarge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  riskBadgeText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  descriptionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  detectionLayerCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.info,
  },
  detectionLayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  detectionLayerTitle: {
    ...Typography.caption,
    color: Colors.dark.info,
    textTransform: 'uppercase',
  },
  detectionLayerValue: {
    ...Typography.body,
    color: Colors.dark.text,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  permissionsList: {
    gap: Spacing.sm,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  permissionName: {
    ...Typography.body,
    color: Colors.dark.text,
    textTransform: 'capitalize',
  },
  dangerousLabel: {
    ...Typography.small,
    color: Colors.dark.danger,
  },
  dataUsageCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  dataUsageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dataUsageValue: {
    ...Typography.h2,
    color: Colors.dark.text,
  },
  dataUsageBar: {
    height: 8,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dataUsageFill: {
    height: '100%',
    borderRadius: 4,
  },
  dataUsageWarning: {
    ...Typography.caption,
    color: Colors.dark.warning,
  },
  hiddenAppWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.warning,
  },
  hiddenAppInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  hiddenAppTitle: {
    ...Typography.h3,
    color: Colors.dark.warning,
  },
  hiddenAppText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.safe,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  reportButtonText: {
    ...Typography.h3,
    color: Colors.dark.safe,
  },
  uninstallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  uninstallButtonText: {
    ...Typography.h3,
    color: '#FFFFFF',
  },
});
