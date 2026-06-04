import React from "react";
import {
  Linking,
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
import { useColors } from "@/hooks/useColors";
import { NexusLogo } from "@/components/NexusLogo";

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "100";
const RELEASE_DATE = "June 2025";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={sectionStyles.wrapper}>
      <Text style={[sectionStyles.title, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[sectionStyles.body, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[sectionStyles.row, { borderBottomColor: colors.border }]}>
      <Text style={[sectionStyles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[sectionStyles.rowValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function LinkRow({ icon, label, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [sectionStyles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
        <Feather name={icon} size={16} color={colors.gold} />
        <Text style={[sectionStyles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      </View>
      <Feather name="external-link" size={14} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>About Nexus</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.logoCard, { backgroundColor: "#0D0D00", borderColor: "#2A2510" }]}>
          <View style={styles.logoRing} />
          <NexusLogo size="md" showWordmark />
          <Text style={styles.tagline}>Connected Finance. Simplified.</Text>
          <View style={[styles.versionChip, { backgroundColor: "#2A2510" }]}>
            <Feather name="zap" size={12} color="#D4AF37" />
            <Text style={styles.versionChipText}>v{APP_VERSION}</Text>
          </View>
        </View>

        <Section title="WHAT IS NEXUS?">
          <View style={{ padding: 16 }}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              Nexus is a financial control platform designed to help users connect accounts, manage finances, track activity, and move money from a single interface.
            </Text>
            <Text style={[styles.bodyText, { color: colors.mutedForeground, marginTop: 12 }]}>
              With Nexus, your bank accounts, cards, and phone numbers are unified under one secure ecosystem — giving you complete visibility and control over your financial life.
            </Text>
          </View>
        </Section>

        <Section title="MISSION & VISION">
          <View style={{ padding: 16, gap: 16 }}>
            <View style={styles.mvRow}>
              <View style={[styles.mvIcon, { backgroundColor: colors.goldLight }]}>
                <Feather name="target" size={18} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mvTitle, { color: colors.foreground }]}>Mission</Text>
                <Text style={[styles.mvSub, { color: colors.mutedForeground }]}>
                  To simplify financial management by bringing all financial sources into one place.
                </Text>
              </View>
            </View>
            <View style={styles.mvRow}>
              <View style={[styles.mvIcon, { backgroundColor: colors.goldLight }]}>
                <Feather name="eye" size={18} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mvTitle, { color: colors.foreground }]}>Vision</Text>
                <Text style={[styles.mvSub, { color: colors.mutedForeground }]}>
                  To become the leading unified finance platform that allows users to see, manage, and move all their money from one secure ecosystem.
                </Text>
              </View>
            </View>
          </View>
        </Section>

        <Section title="VERSION INFORMATION">
          <InfoRow label="Nexus Version" value={APP_VERSION} />
          <InfoRow label="Build Number" value={BUILD_NUMBER} />
          <InfoRow label="Release Date" value={RELEASE_DATE} />
          <InfoRow label="Platform" value={Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Web"} />
        </Section>

        <Section title="LEGAL">
          <LinkRow icon="file-text" label="Terms of Service" onPress={() => {}} />
          <LinkRow icon="lock" label="Privacy Policy" onPress={() => {}} />
          <LinkRow icon="book" label="Open Source Licenses" onPress={() => {}} />
        </Section>

        <View style={[styles.footerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            © {new Date().getFullYear()} Nexus Financial Technologies
          </Text>
          <Text style={[styles.footerSub, { color: colors.mutedForeground }]}>
            All rights reserved. Nexus is a demo application.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  title: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8 },
  body: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  rowLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  logoCard: {
    alignItems: "center", padding: 28, borderRadius: 20, borderWidth: 1,
    marginBottom: 24, overflow: "hidden", gap: 12,
  },
  logoRing: {
    position: "absolute", top: -40, right: -40, width: 160, height: 160,
    borderRadius: 80, borderWidth: 28, borderColor: "rgba(212,175,55,0.06)",
  },
  tagline: { color: "rgba(212,175,55,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
  versionChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  versionChipText: { color: "#D4AF37", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  bodyText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  mvRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  mvIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  mvTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  mvSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  footerCard: { borderRadius: 12, borderWidth: 1, padding: 16, alignItems: "center", gap: 4 },
  footerText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  footerSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
