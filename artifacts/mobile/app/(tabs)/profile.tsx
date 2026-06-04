import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useGetProfile } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { NexusLogo } from "@/components/NexusLogo";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

function SettingRow({
  icon,
  label,
  subtitle,
  onPress,
  danger,
  badge,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  badge?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: danger ? "#2D0F0F" : colors.secondary }]}>
        <Feather name={icon} size={18} color={danger ? colors.debitRed : colors.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: danger ? colors.debitRed : colors.foreground }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
        )}
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: colors.goldLight }]}>
          <Text style={[styles.badgeText, { color: colors.gold }]}>{badge}</Text>
        </View>
      )}
      {!danger && <Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user, logout, token } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: profile, isLoading } = useGetProfile();

  const { data: accounts = [] } = useQuery<unknown[]>({
    queryKey: ["accounts-count"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok ? res.json() : [];
    },
    enabled: !!token,
  });

  const { data: cards = [] } = useQuery<unknown[]>({
    queryKey: ["cards-count"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok ? res.json() : [];
    },
    enabled: !!token,
  });

  const { data: phoneNumbers = [] } = useQuery<unknown[]>({
    queryKey: ["phone-numbers"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/phone-numbers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok ? res.json() : [];
    },
    enabled: !!token,
  });

  const handleLogout = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await logout();
    router.replace("/(auth)/welcome");
  };

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user
    ? `${user.firstName} ${user.lastName}`
    : "User";
  const initials = fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const stats = [
    { label: "Accounts", value: accounts.length },
    { label: "Cards", value: cards.length },
    { label: "Numbers", value: phoneNumbers.length },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <NexusLogo size="xs" showWordmark />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
      </View>

      <View style={[styles.avatarCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20 }]}>
        <View style={[styles.avatar, { backgroundColor: colors.gold }]}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>{fullName}</Text>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
            {profile?.email ?? user?.email ?? ""}
          </Text>
          <Text style={[styles.profilePhone, { color: colors.mutedForeground }]}>
            {profile?.phone ?? user?.phone ?? ""}
          </Text>
        </View>
        {isLoading && <ActivityIndicator color={colors.gold} size="small" />}
      </View>

      <View style={[styles.statsRow, { marginHorizontal: 20 }]}>
        {stats.map((stat, i) => (
          <View key={stat.label} style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.gold }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Linked {stat.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 100 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SETTINGS</Text>
        <View style={styles.group}>
          <SettingRow
            icon="shield"
            label="Security"
            subtitle="PIN, biometrics & sessions"
            onPress={() => router.push("/profile/security")}
          />
          <SettingRow
            icon="phone"
            label="Linked Numbers"
            subtitle="Manage your phone numbers"
            badge={phoneNumbers.length > 0 ? String(phoneNumbers.length) : undefined}
            onPress={() => router.push("/(tabs)/numbers")}
          />
          <SettingRow
            icon="sun"
            label="Appearance"
            subtitle="Light, dark or system theme"
            onPress={() => router.push("/profile/security")}
          />
          <SettingRow
            icon="bell"
            label="Notifications"
            subtitle="Manage push notifications"
          />
          <SettingRow
            icon="help-circle"
            label="Help & Support"
            subtitle="FAQs, contact us"
            onPress={() => router.push("/profile/help")}
          />
          <SettingRow
            icon="info"
            label="About Nexus"
            subtitle="Version 1.0.0"
            onPress={() => router.push("/profile/about")}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT ACTIONS</Text>
        <View style={styles.group}>
          <SettingRow icon="log-out" label="Sign Out" onPress={handleLogout} danger />
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Nexus · Connected Finance. Simplified.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingBottom: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  avatarCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 18, borderRadius: 18, borderWidth: 1, marginBottom: 10,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },
  avatarInitials: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 2 },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  profilePhone: { fontSize: 13, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  statItem: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    padding: 12, alignItems: "center", gap: 2,
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  sectionTitle: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 1, marginBottom: 8, marginTop: 20,
  },
  group: { gap: 2 },
  settingRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 2,
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  settingLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  settingSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 4,
  },
  badgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  footer: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 32 },
});
