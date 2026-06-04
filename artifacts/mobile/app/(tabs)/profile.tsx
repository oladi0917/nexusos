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
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { NexusLogo } from "@/components/NexusLogo";

function SettingRow({
  icon,
  label,
  subtitle,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
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
      {!danger && <Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user, logout } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: profile, isLoading } = useGetProfile();

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <NexusLogo size="xs" showWordmark />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
      </View>

      {/* Avatar card */}
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

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 100 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SETTINGS</Text>
        <View style={styles.group}>
          <SettingRow icon="shield" label="Security" subtitle="PIN, biometrics & 2FA" />
          <SettingRow icon="bell" label="Notifications" subtitle="Manage push notifications" />
          <SettingRow icon="help-circle" label="Help & Support" subtitle="FAQs, contact us" />
          <SettingRow icon="info" label="About Nexus" subtitle="Version 1.0.0" />
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
  header: { paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  avatarCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 2 },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  profilePhone: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
  },
  group: { gap: 2 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 2,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  settingSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  footer: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 32 },
});
