import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NexusLogo } from "@/components/NexusLogo";

const { width } = Dimensions.get("window");

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#F2D16B";
const GOLD_DARK = "#9A7828";
const BG = "#050505";
const CARD_BG = "#111111";
const CARD_BORDER = "#222222";
const MUTED = "#777777";

function WalletIllustration() {
  return (
    <View style={illStyles.root}>
      {/* Glow ring */}
      <View style={illStyles.glowRing} />

      {/* Back bank card (rotated left) */}
      <View style={[illStyles.bankCard, illStyles.bankCardBack]}>
        <View style={illStyles.bankCardChip} />
        <View style={illStyles.bankCardStripe} />
      </View>

      {/* Middle bank card (rotated right) */}
      <View style={[illStyles.bankCard, illStyles.bankCardMid]}>
        <View style={illStyles.bankCardChip} />
        <View style={illStyles.bankCardStripe} />
      </View>

      {/* Wallet body */}
      <View style={illStyles.wallet}>
        {/* Wallet clasp */}
        <View style={illStyles.walletClasp} />

        {/* Nexus logo on wallet */}
        <View style={illStyles.walletLogo}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={illStyles.walletLogoImg}
            resizeMode="contain"
          />
        </View>

        {/* Wallet lines decoration */}
        <View style={illStyles.walletLine} />
        <View style={[illStyles.walletLine, { width: "50%", marginTop: 6 }]} />
      </View>

      {/* Gold orbit ring */}
      <View style={illStyles.orbitRing} />

      {/* Floating gold dot */}
      <View style={illStyles.floatDot1} />
      <View style={illStyles.floatDot2} />
    </View>
  );
}

const illStyles = StyleSheet.create({
  root: {
    width: 220,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  glowRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "transparent",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  bankCard: {
    position: "absolute",
    width: 110,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  bankCardBack: {
    top: 10,
    left: 8,
    transform: [{ rotate: "-14deg" }],
    backgroundColor: "#161616",
  },
  bankCardMid: {
    top: 10,
    right: 8,
    transform: [{ rotate: "14deg" }],
    backgroundColor: "#1C1C1C",
  },
  bankCardChip: {
    width: 24,
    height: 16,
    borderRadius: 3,
    backgroundColor: GOLD,
    opacity: 0.6,
    marginBottom: 8,
  },
  bankCardStripe: {
    width: "70%",
    height: 3,
    borderRadius: 2,
    backgroundColor: "#333",
  },
  wallet: {
    width: 130,
    height: 100,
    borderRadius: 16,
    backgroundColor: "#1A1600",
    borderWidth: 1.5,
    borderColor: GOLD_DARK,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 10,
    overflow: "hidden",
  },
  walletClasp: {
    position: "absolute",
    top: -1,
    right: 20,
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
    opacity: 0.8,
  },
  walletLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(201,168,76,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
  },
  walletLogoImg: { width: 28, height: 28, borderRadius: 6 },
  walletLine: {
    width: "70%",
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(201,168,76,0.2)",
    marginTop: 8,
  },
  orbitRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.15)",
    borderStyle: "dashed",
  },
  floatDot1: {
    position: "absolute",
    top: 20,
    right: 30,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
    opacity: 0.7,
  },
  floatDot2: {
    position: "absolute",
    bottom: 25,
    left: 25,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD_LIGHT,
    opacity: 0.5,
  },
});

const FEATURES = [
  {
    icon: "link" as const,
    title: "Connect",
    desc: "Link all your financial accounts securely.",
  },
  {
    icon: "paper-plane" as const,
    title: "Transfer",
    desc: "Move money across accounts and send payments easily.",
  },
  {
    icon: "bar-chart" as const,
    title: "Track",
    desc: "Monitor transactions and gain financial insights.",
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 54 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 20, paddingBottom: bottomPad + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header: logo row ── */}
        <View style={styles.logoRow}>
          <NexusLogo size="sm" showWordmark showTagline />
        </View>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.headline}>{"All Your Money\nOne Place."}</Text>
          <WalletIllustration />
          <Text style={styles.heroSub}>
            Connect your bank accounts, track transactions, and move money seamlessly from a single secure platform.
          </Text>
        </View>

        {/* ── Features ── */}
        <Text style={styles.sectionTitle}>What You Can Do</Text>
        <View style={styles.featuresRow}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={22} color={GOLD} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* ── Security card ── */}
        <View style={styles.secCard}>
          <View style={styles.secIconWrap}>
            <Ionicons name="shield-checkmark" size={24} color={GOLD} />
          </View>
          <View style={styles.secText}>
            <Text style={styles.secTitle}>Your Security Is Our Priority</Text>
            <Text style={styles.secDesc}>
              Bank-level security, encrypted connections, secure authentication, and privacy-first design.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={MUTED} />
        </View>

        {/* ── CTAs ── */}
        <View style={styles.ctaGroup}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.88 : 1 }]}
            onPress={() => router.push("/(auth)/signup")}
          >
            <LinearGradient
              colors={[GOLD_LIGHT, GOLD, GOLD_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtnGradient}
            >
              <Text style={styles.primaryBtnText}>Create Account</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </Pressable>
        </View>

        {/* ── Disclaimer ── */}
        <Text style={styles.disclaimer}>
          🔒  Bank-level security · Your data stays private
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    gap: 0,
  },

  // Logo row
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  logoIcon: { width: 44, height: 44, borderRadius: 10 },
  logoName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: 5,
  },
  logoTagline: {
    color: GOLD,
    fontSize: 8,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginTop: 1,
  },

  // Hero
  hero: {
    alignItems: "center",
    marginBottom: 36,
    gap: 16,
  },
  headline: {
    color: "#FFFFFF",
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    lineHeight: 44,
    letterSpacing: -0.8,
    textAlign: "center",
  },
  heroSub: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "center",
  },

  // Section title
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },

  // Feature cards
  featuresRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(201,168,76,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
  },
  featureTitle: {
    color: GOLD,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  featureDesc: {
    color: MUTED,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },

  // Security card
  secCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 28,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  secIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(201,168,76,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
  },
  secText: { flex: 1, gap: 4 },
  secTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  secDesc: {
    color: MUTED,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },

  // CTA
  ctaGroup: { gap: 12, marginBottom: 20 },
  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  primaryBtnGradient: {
    paddingVertical: 17,
    alignItems: "center",
    borderRadius: 14,
  },
  primaryBtnText: {
    color: "#0A0800",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
    backgroundColor: "#0F0F0F",
  },
  secondaryBtnText: {
    color: GOLD,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },

  // Disclaimer
  disclaimer: {
    color: MUTED,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
