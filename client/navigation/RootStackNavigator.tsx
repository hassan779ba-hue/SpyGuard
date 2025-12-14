import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useApp } from "@/context/AppContext";
import { AppInfo } from "@/data/threatDatabase";

import LanguageSelectionScreen from "@/screens/LanguageSelectionScreen";
import DashboardScreen from "@/screens/DashboardScreen";
import ScanResultsScreen from "@/screens/ScanResultsScreen";
import ThreatDetailsScreen from "@/screens/ThreatDetailsScreen";
import PremiumScreen from "@/screens/PremiumScreen";
import SettingsScreen from "@/screens/SettingsScreen";

export type RootStackParamList = {
  LanguageSelection: undefined;
  Dashboard: undefined;
  ScanResults: { threats: AppInfo[] };
  ThreatDetails: { threat: AppInfo };
  Premium: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { hasSelectedLanguage } = useApp();

  return (
    <Stack.Navigator 
      screenOptions={{
        ...screenOptions,
        headerStyle: {
          backgroundColor: '#0A0A0A',
        },
        headerTintColor: '#FFFFFF',
        contentStyle: {
          backgroundColor: '#0A0A0A',
        },
      }}
      initialRouteName={hasSelectedLanguage ? "Dashboard" : "LanguageSelection"}
    >
      <Stack.Screen
        name="LanguageSelection"
        component={LanguageSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ScanResults"
        component={ScanResultsScreen}
        options={{ 
          headerTitle: '',
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="ThreatDetails"
        component={ThreatDetailsScreen}
        options={{ 
          headerTitle: '',
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: 'modal',
          headerTitle: '',
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
}
