import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useListAccounts, useGetDashboard } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { NexusLogo } from "@/components/NexusLogo";
import type { NexusCard, NexusWallet } from "@/lib/apiClient";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface PhoneNumber {
  id: number;
  number: string;
  label: string | null;
  isDefault: boolean;
  isVerified: boolean;
}

function formatBalance(n: number) {
  return n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPhone(n: string) {
  const c = n.replace(/\D/g, "");
  if (c.length === 11) return `${c.slice(0, 4)} ${c.slice(4, 7)} ${c.slice(7)}`;
  return n;
}

const QUICK_ACTIONS = [
  { label: "Transfer", icon: "send" as const, onPress: () => router.push("/(tabs)/send" as any) },
  { label: "Add Account", icon: "plus-circle" as const, onPress: () => router.push("/accounts/add") },
  { label: "Add Card", icon: "credit-card" as const, onPress: () => router.push("/cards/add") },
  { label: "Link Number", icon: "phone" as const, onPress: () => router.push("/numbers/add") },
];

/* ─── Section Header ─── */
function SectionHeader({ title, count, onSeeAll }: { title: string; count?: number; onSeeAll?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
        {count !== undefined && (
          <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.countText, { color: colors.mutedForeground }]}>{count}</Text>
          </View>
        )}
      </View>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: colors.gold }]}>See all</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ─── Account Card ─── */
function AccountCard({ bankName, bankColor, balance, currency, accountNumber }: {
  bankName: string; bankColor: string; balance: number; currency: string; accountNumber?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
      onPress={() => router.push("/(tabs)/accounts")}
    >
      <View style={[styles.cardIcon, { backgroundColor: bankColor }]}>
        <Text style={styles.cardIconText}>{bankName.slice(0, 2).toUpperCase()}</Text>
      </View>
      <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>{bankName}</Text>
      <Text style={[styles.cardBalance, { color: colors.foreground }]}>₦{formatBalance(balance)}</Text>
      <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{currency}</Text>
      {accountNumber && (
        <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>•••• {accountNumber.slice(-4)}</Text>
      )}
      <View style={[styles.cardFooter, { backgroundColor: colors.secondary }]}>
        <Feather name="arrow-right" size={12} color={colors.gold} />
        <Text style={[styles.cardFooterText, { color: colors.gold }]}>Details</Text>
      </View>
    </Pressable>
  );
}

/* ─── Card (payment card) ─── */
function PaymentCard({ card }: { card: NexusCard }) {
  const colors = useColors();
  const bg = card.brand === "VISA" ? "#1A1F6E" : card.brand === "MASTERCARD" ? "#6E1A1A" : "#1A4E1A";
  return (
    <Pressable
      style={({ pressed }) => [styles.card, styles.paymentCard, { backgroundColor: bg, borderColor: "transparent", opacity: pressed ? 0.85 : 1 }]}
      onPress={() => router.push("/(tabs)/cards")}
    >
      <View style={styles.paymentCardBrand}>
        <Feather name="credit-card" size={18} color="rgba(255,255,255,0.7)" />
        <Text style={styles.paymentCardBrandText}>{card.brand}</Text>
      </View>
      <Text style={styles.paymentCardNumber}>•••• •••• •••• {card.last4}</Text>
      <View style={styles.paymentCardFooter}>
        <View>
          <Text style={styles.paymentCardLabel}>Expires</Text>
          <Text style={styles.paymentCardValue}>{card.expiresMonth}/{card.expiresYear}</Text>
        </View>
        <View style={[styles.paymentCardStatus, { backgroundColor: card.isActive ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)" }]}>
          <View style={[styles.statusDot, { backgroundColor: card.isActive ? "#10B981" : "#EF4444" }]} />
          <Text style={[styles.statusText, { color: card.isActive ? "#10B981" : "#EF4444" }]}>
            {card.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ─── Number Card ─── */
function NumberCard({ phone }: { phone: PhoneNumber }) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, styles.numberCard, { backgroundColor: "#0D0A1E", borderColor: "#2A1A4E", opacity: pressed ? 0.85 : 1 }]}
      onPress={() => router.push("/(tabs)/numbers")}
    >
      <View style={[styles.cardIcon, { backgroundColor: "#1A0A2E" }]}>
        <Feather name="phone" size={18} color="#A78BFA" />
      </View>
      <Text style={[styles.cardName, { color: "#A78BFA" }]}>{phone.isDefault ? "Primary" : "Linked"}</Text>
      <Text style={[styles.cardBalance, { color: "#FFFFFF", fontSize: 14, letterSpacing: 0 }]}>{formatPhone(phone.number)}</Text>
      {phone.label && <Text style={[styles.cardSub, { color: "rgba(167,139,250,0.6)" }]}>{phone.label}</Text>}
      <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
        {phone.isDefault && (
          <View style={styles.phoneBadge}>
            <Text style={styles.phoneBadgeText}>Default</Text>
          </View>
        )}
        {phone.isVerified && (
          <View style={[styles.phoneBadge, { backgroundColor: "rgba(16,185,129,0.15)" }]}>
            <Feather name="check-circle" size={8} color="#10B981" />
            <Text style={[styles.phoneBadgeText, { color: "#10B981" }]}>Verified</Text>
          </View>
        )}
      </View>
      <View style={[styles.cardFooter, { backgroundColor: "rgba(167,139,250,0.1)" }]}>
        <Feather name="arrow-right" size={12} color="#A78BFA" />
        <Text style={[styles.cardFooterText, { color: "#A78BFA" }]}>Manage</Text>
      </View>
    </Pressable>
  );
}

/* ─── Wallet Card ─── */
function WalletSection({ wallet, colors }: { wallet: NexusWallet | undefined; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.walletCard, { backgroundColor: "#0E0E00", borderColor: "#2A2510" }]}>
      <View style={styles.walletRing} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <View style={[styles.walletIcon, { backgroundColor: "#2A2510" }]}>
          <Feather name="zap" size={22} color="#D4AF37" />
        </View>
        <View>
          <Text style={styles.walletLabel}>NEXUS WALLET</Text>
          <Text style={styles.walletBalance}>₦{formatBalance(wallet?.balance ?? 0)}</Text>
        </View>
        <View style={[styles.walletBadge, { marginLeft: "auto" }]}>
          <Text style={styles.walletBadgeText}>Active</Text>
        </View>
      </View>
      <View style={styles.walletActions}>
        {[
          { icon: "arrow-up-right" as const, label: "Send" },
          { icon: "arrow-down-left" as const, label: "Receive" },
          { icon: "plus" as const, label: "Fund" },
          { icon: "clock" as const, label: "History" },
        ].map((a) => (
          <Pressable
            key={a.label}
            style={({ pressed }) => [styles.walletAction, { backgroundColor: "#2A2510", opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name={a.icon} size={16} color="#D4AF37" />
            <Text style={styles.walletActionLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* ─── Add Source Card ─── */
function AddCard({ label, icon, onPress, colors }: { label: string; icon: keyof typeof Feather.glyphMap; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, styles.addCard, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
    >
      <Feather name={icon} size={22} color={colors.mutedForeground} />
      <Text style={[styles.addCardText, { color: colors.mutedForeground }]}>{label}</Text>
    </Pressable>
  );
}

/* ─── Main Screen ─── */
export default function FinancesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { token } = useAuth();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: dashboard, refetch: refetchDash } = useGetDashboard();
  const { data: accounts = [] } = useListAccounts();

  const { data: cards = [], refetch: refetchCards } = useQuery<NexusCard[]>({
    queryKey: ["cards"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/cards`, { headers: { Authorization: `Bearer ${token}` } });
      return res.ok ? res.json() : [];
    },
    enabled: !!token,
  });

  const { data: wallet, refetch: refetchWallet } = useQuery<NexusWallet>({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/wallet`, { headers: { Authorization: `Bearer ${token}` } });
      return res.ok ? res.json() : null;
    },
    enabled: !!token,
  });

  const { data: phoneNumbers = [], refetch: refetchNumbers } = useQuery<PhoneNumber[]>({
    queryKey: ["phone-numbers"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/phone-numbers`, { headers: { Authorization: `Bearer ${token}` } });
      return res.ok ? res.json() : [];
    },
    enabled: !!token,
  });

  const totalBalance = (dashboard?.totalBalance ?? 0) + (wallet?.balance ?? 0);

  const handleRefresh = async () => {
    await Promise.all([
      refetchDash(),
      refetchCards(),
      refetchWallet(),
      refetchNumbers(),
      qc.invalidateQueries({ queryKey: ["accounts-count"] }),
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <NexusLogo size="xs" showWordmark />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Finances</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={colors.gold} />}
      >
        {/* Total Balance */}
        <View style={[styles.totalCard, { backgroundColor: "#0D0D00", borderColor: "#2A2510" }]}>
          <View style={styles.totalRing1} />
          <View style={styles.totalRing2} />
          <Text style={styles.totalLabel}>TOTAL NEXUS BALANCE</Text>
          <Text style={styles.totalBalance}>₦{formatBalance(totalBalance)}</Text>
          <View style={styles.totalBreakdown}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: "#10B981" }]} />
              <Text style={styles.breakdownLabel}>Banks</Text>
              <Text style={styles.breakdownValue}>₦{formatBalance(dashboard?.totalBalance ?? 0)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: "#D4AF37" }]} />
              <Text style={styles.breakdownLabel}>Wallet</Text>
              <Text style={[styles.breakdownValue, { color: "#D4AF37" }]}>₦{formatBalance(wallet?.balance ?? 0)}</Text>
            </View>
          </View>
          <View style={styles.totalGlow} />
        </View>

        {/* Quick Actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll} contentContainerStyle={styles.quickContent}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
              onPress={action.onPress}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.goldLight }]}>
                <Feather name={action.icon} size={18} color={colors.gold} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>{action.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Accounts Section */}
        <View style={styles.section}>
          <SectionHeader title="Accounts" count={accounts.length} onSeeAll={() => router.push("/(tabs)/accounts")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                bankName={account.bankName}
                bankColor={account.bankColor}
                balance={account.balance}
                currency={account.currency}
                accountNumber={account.accountNumber}
              />
            ))}
            <AddCard label="Add Account" icon="plus" onPress={() => router.push("/accounts/add")} colors={colors} />
          </ScrollView>
          {accounts.length === 0 && (
            <View style={[styles.emptyRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="link" size={20} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No accounts linked yet</Text>
              <Pressable onPress={() => router.push("/accounts/add")} style={[styles.emptyBtn, { backgroundColor: colors.gold }]}>
                <Text style={styles.emptyBtnText}>Link Account</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Cards Section */}
        <View style={styles.section}>
          <SectionHeader title="Cards" count={cards.length} onSeeAll={() => router.push("/(tabs)/cards")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {cards.map((card) => (
              <PaymentCard key={card.id} card={card} />
            ))}
            <AddCard label="Add Card" icon="plus" onPress={() => router.push("/cards/add")} colors={colors} />
          </ScrollView>
          {cards.length === 0 && (
            <View style={[styles.emptyRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="credit-card" size={20} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No cards added yet</Text>
              <Pressable onPress={() => router.push("/cards/add")} style={[styles.emptyBtn, { backgroundColor: colors.gold }]}>
                <Text style={styles.emptyBtnText}>Add Card</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Linked Numbers Section */}
        <View style={styles.section}>
          <SectionHeader title="Linked Numbers" count={phoneNumbers.length} onSeeAll={() => router.push("/(tabs)/numbers")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {phoneNumbers.map((phone) => (
              <NumberCard key={phone.id} phone={phone} />
            ))}
            <AddCard label="Link Number" icon="plus" onPress={() => router.push("/numbers/add")} colors={colors} />
          </ScrollView>
          {phoneNumbers.length === 0 && (
            <View style={[styles.emptyRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="phone" size={20} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No numbers linked yet</Text>
              <Pressable onPress={() => router.push("/numbers/add")} style={[styles.emptyBtn, { backgroundColor: colors.gold }]}>
                <Text style={styles.emptyBtnText}>Link Number</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Nexus Wallet Section */}
        <View style={styles.section}>
          <SectionHeader title="Nexus Wallet" />
          <WalletSection wallet={wallet} colors={colors} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  content: { padding: 20, paddingBottom: 110 },
  totalCard: {
    borderRadius: 20, borderWidth: 1, padding: 22, marginBottom: 20, overflow: "hidden",
  },
  totalRing1: {
    position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: 65,
    borderWidth: 22, borderColor: "rgba(212,175,55,0.07)",
  },
  totalRing2: {
    position: "absolute", top: "30%", right: -80, width: 200, height: 200, borderRadius: 100,
    borderWidth: 30, borderColor: "rgba(212,175,55,0.04)",
  },
  totalLabel: {
    color: "#D4AF37", fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4, marginBottom: 8,
  },
  totalBalance: {
    color: "#FFFFFF", fontSize: 34, fontFamily: "Inter_700Bold",
    letterSpacing: -1.5, marginBottom: 14,
  },
  totalBreakdown: {
    flexDirection: "row", backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10, padding: 10,
  },
  breakdownItem: { flex: 1, gap: 3 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "Inter_400Regular" },
  breakdownValue: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  breakdownDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 12 },
  totalGlow: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#D4AF37", opacity: 0.4 },
  quickScroll: { marginBottom: 24, marginHorizontal: -20 },
  quickContent: { paddingHorizontal: 20, gap: 10 },
  quickBtn: { borderRadius: 14, borderWidth: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 18, gap: 8 },
  quickIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  countText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hScroll: { gap: 12, paddingRight: 4 },
  card: {
    width: 150, borderRadius: 16, borderWidth: 1, padding: 16, gap: 6,
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  cardIconText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_700Bold" },
  cardName: { fontSize: 12, fontFamily: "Inter_500Medium" },
  cardBalance: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  cardSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  cardFooter: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginTop: 4, alignSelf: "flex-start",
  },
  cardFooterText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  paymentCard: { width: 170 },
  paymentCardBrand: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  paymentCardBrandText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  paymentCardNumber: { color: "#FFF", fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: 1, marginBottom: 16 },
  paymentCardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  paymentCardLabel: { color: "rgba(255,255,255,0.5)", fontSize: 9, fontFamily: "Inter_400Regular" },
  paymentCardValue: { color: "#FFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  paymentCardStatus: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  numberCard: { width: 160 },
  phoneBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(167,139,250,0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  phoneBadgeText: { color: "#A78BFA", fontSize: 9, fontFamily: "Inter_600SemiBold" },
  addCard: {
    width: 120, borderStyle: "dashed", alignItems: "center",
    justifyContent: "center", gap: 8,
  },
  addCardText: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  emptyRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  emptyText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  emptyBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  emptyBtnText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  walletCard: {
    borderRadius: 18, borderWidth: 1, padding: 20, overflow: "hidden",
  },
  walletRing: {
    position: "absolute", top: -20, right: -20, width: 120, height: 120,
    borderRadius: 60, borderWidth: 22, borderColor: "rgba(212,175,55,0.08)",
  },
  walletIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  walletLabel: { color: "#D4AF37", fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2 },
  walletBalance: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.8, marginTop: 2 },
  walletBadge: { backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  walletBadgeText: { color: "#10B981", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  walletActions: { flexDirection: "row", gap: 8 },
  walletAction: { flex: 1, borderRadius: 12, alignItems: "center", paddingVertical: 12, gap: 6 },
  walletActionLabel: { color: "#D4AF37", fontSize: 11, fontFamily: "Inter_500Medium" },
});
