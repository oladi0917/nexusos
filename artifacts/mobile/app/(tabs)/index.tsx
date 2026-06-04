import React from "react";
import {
  ActivityIndicator,
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
import {
  useGetDashboard,
  useListAccounts,
  getGetDashboardQueryKey,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { TransactionItem } from "@/components/TransactionItem";
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

function formatBalance(n: number): string {
  return n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const QUICK_ACTIONS = [
  { label: "Send", icon: "send" as const, route: "/(tabs)/send" },
  { label: "Cards", icon: "layers" as const, route: "/(tabs)/cards" },
  { label: "Numbers", icon: "phone" as const, route: "/(tabs)/numbers" },
  { label: "History", icon: "list" as const, route: "/(tabs)/transactions" },
];

function AccountSourceItem({ bankName, bankColor, balance, currency, onPress }: {
  bankName: string; bankColor: string; balance: number; currency: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [carouselStyles.item, { opacity: pressed ? 0.8 : 1 }]}>
      <View style={[carouselStyles.iconCircle, { backgroundColor: bankColor }]}>
        <Text style={carouselStyles.iconText}>{bankName.slice(0, 2).toUpperCase()}</Text>
      </View>
      <Text style={carouselStyles.itemLabel} numberOfLines={1}>{bankName}</Text>
      <Text style={carouselStyles.itemBalance}>₦{formatBalance(balance)}</Text>
      <Text style={carouselStyles.itemCurrency}>{currency}</Text>
    </Pressable>
  );
}

function WalletSourceItem({ balance, onPress }: { balance: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [carouselStyles.item, carouselStyles.walletItem, { opacity: pressed ? 0.8 : 1 }]}>
      <View style={carouselStyles.walletRing} />
      <View style={[carouselStyles.iconCircle, { backgroundColor: "#2A2510" }]}>
        <Feather name="zap" size={16} color="#D4AF37" />
      </View>
      <Text style={[carouselStyles.itemLabel, { color: "#D4AF37" }]}>Nexus Wallet</Text>
      <Text style={[carouselStyles.itemBalance, { color: "#D4AF37" }]}>₦{formatBalance(balance)}</Text>
      <Text style={carouselStyles.itemCurrency}>NGN</Text>
    </Pressable>
  );
}

function CardSourceItem({ card, onPress }: { card: NexusCard; onPress: () => void }) {
  const bg = card.brand === "VISA" ? "#1A1F6E" : card.brand === "MASTERCARD" ? "#6E1A1A" : "#1A4E1A";
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [carouselStyles.item, { opacity: pressed ? 0.8 : 1, backgroundColor: bg }]}>
      <View style={[carouselStyles.iconCircle, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
        <Feather name="credit-card" size={16} color="#FFF" />
      </View>
      <Text style={[carouselStyles.itemLabel, { color: "#FFF" }]}>{card.brand}</Text>
      <Text style={[carouselStyles.itemBalance, { color: "#FFF", fontSize: 15 }]}>•••• {card.last4}</Text>
      <Text style={[carouselStyles.itemCurrency, { color: "rgba(255,255,255,0.5)" }]}>
        {card.expiresMonth}/{card.expiresYear}
      </Text>
    </Pressable>
  );
}

function PhoneSourceItem({ number, isDefault, onPress }: { number: string; isDefault: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [carouselStyles.item, carouselStyles.phoneItem, { opacity: pressed ? 0.8 : 1 }]}>
      <View style={carouselStyles.phoneRing} />
      <View style={[carouselStyles.iconCircle, { backgroundColor: "#1A0A2E" }]}>
        <Feather name="phone" size={16} color="#A78BFA" />
      </View>
      <Text style={[carouselStyles.itemLabel, { color: "#A78BFA" }]} numberOfLines={1}>
        {isDefault ? "Primary" : "Linked"}
      </Text>
      <Text style={[carouselStyles.itemBalance, { color: "#FFF", fontSize: 12, letterSpacing: 0 }]} numberOfLines={1}>
        {number}
      </Text>
      {isDefault && (
        <Text style={[carouselStyles.itemCurrency, { color: "#A78BFA" }]}>Default</Text>
      )}
    </Pressable>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user, token } = useAuth();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: dashboard, isLoading, refetch } = useGetDashboard();
  const { data: accounts = [] } = useListAccounts();

  const { data: cards = [] } = useQuery<NexusCard[]>({
    queryKey: ["cards"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok ? res.json() : [];
    },
    enabled: !!token,
  });

  const { data: wallet } = useQuery<NexusWallet>({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok ? res.json() : null;
    },
    enabled: !!token,
  });

  const { data: phoneNumbers = [] } = useQuery<PhoneNumber[]>({
    queryKey: ["phone-numbers"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/phone-numbers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok ? res.json() : [];
    },
    enabled: !!token,
  });

  const totalSources = accounts.length + cards.length + phoneNumbers.length + 1;

  const initials = user
    ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
    : "U";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <NexusLogo size="xs" showWordmark />
        <Pressable
          style={[styles.avatarBtn, { backgroundColor: colors.gold }]}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Text style={styles.avatarBtnText}>{initials}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={async () => {
              await qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
              await qc.invalidateQueries({ queryKey: ["cards"] });
              await qc.invalidateQueries({ queryKey: ["wallet"] });
              await qc.invalidateQueries({ queryKey: ["phone-numbers"] });
              await refetch();
            }}
            tintColor={colors.gold}
          />
        }
      >
        <View style={styles.greeting}>
          <Text style={[styles.greetSub, { color: colors.mutedForeground }]}>Good day,</Text>
          <Text style={[styles.greetName, { color: colors.foreground }]}>
            {user?.firstName ?? "User"} 👋
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/finances")}
          style={({ pressed }) => [styles.balanceCard, { backgroundColor: "#0D0D00", borderColor: "#2A2510", opacity: pressed ? 0.92 : 1 }]}
        >
          <View style={styles.waveRing1} />
          <View style={styles.waveRing2} />
          <View style={styles.waveRing3} />
          <View style={styles.balanceTapHint}>
            <Feather name="chevrons-right" size={12} color="rgba(212,175,55,0.5)" />
            <Text style={styles.balanceTapText}>Tap to view all sources</Text>
          </View>
          <Text style={styles.balanceLabel}>NEXUS BALANCE</Text>
          {isLoading ? (
            <ActivityIndicator color="#D4AF37" style={{ marginVertical: 12 }} />
          ) : (
            <Text style={styles.balanceAmount}>
              ₦{formatBalance((dashboard?.totalBalance ?? 0) + (wallet?.balance ?? 0))}
            </Text>
          )}
          <View style={styles.balanceBreakdown}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: "#10B981" }]} />
              <Text style={[styles.breakdownLabel, { color: "rgba(255,255,255,0.5)" }]}>Banks</Text>
              <Text style={[styles.breakdownValue, { color: "rgba(255,255,255,0.85)" }]}>
                ₦{formatBalance(dashboard?.totalBalance ?? 0)}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: "#D4AF37" }]} />
              <Text style={[styles.breakdownLabel, { color: "rgba(255,255,255,0.5)" }]}>Wallet</Text>
              <Text style={[styles.breakdownValue, { color: "#D4AF37" }]}>
                ₦{formatBalance(wallet?.balance ?? 0)}
              </Text>
            </View>
          </View>
          <View style={styles.balanceFooter}>
            <Text style={[styles.balanceAccounts, { color: "rgba(255,255,255,0.45)" }]}>
              {totalSources} financial source{totalSources !== 1 ? "s" : ""}
            </Text>
            <View style={styles.ngn}>
              <Text style={styles.ngnText}>NGN</Text>
            </View>
          </View>
          <View style={styles.balanceGlow} />
        </Pressable>

        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                styles.quickBtn,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
              ]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: colors.goldLight }]}>
                <Feather name={action.icon} size={20} color={colors.gold} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Financial Sources</Text>
            <Pressable onPress={() => router.push("/(tabs)/accounts")}>
              <Text style={[styles.seeAll, { color: colors.gold }]}>Manage</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[carouselStyles.carouselContent, { paddingHorizontal: 0 }]}
            style={carouselStyles.carousel}
          >
            {accounts.map((account) => (
              <AccountSourceItem
                key={account.id}
                bankName={account.bankName}
                bankColor={account.bankColor}
                balance={account.balance}
                currency={account.currency}
                onPress={() => router.push("/(tabs)/accounts")}
              />
            ))}
            <WalletSourceItem balance={wallet?.balance ?? 0} onPress={() => {}} />
            {cards.map((card) => (
              <CardSourceItem
                key={card.id}
                card={card}
                onPress={() => router.push("/(tabs)/cards" as any)}
              />
            ))}
            {phoneNumbers.map((phone) => (
              <PhoneSourceItem
                key={phone.id}
                number={phone.number}
                isDefault={phone.isDefault}
                onPress={() => router.push("/(tabs)/numbers")}
              />
            ))}
            <Pressable
              style={({ pressed }) => [carouselStyles.addItem, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push("/accounts/add")}
            >
              <Feather name="plus" size={22} color={colors.mutedForeground} />
              <Text style={[carouselStyles.addItemText, { color: colors.mutedForeground }]}>Add</Text>
            </Pressable>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
            <Pressable onPress={() => router.push("/(tabs)/transactions")}>
              <Text style={[styles.seeAll, { color: colors.gold }]}>See all</Text>
            </Pressable>
          </View>
          {isLoading ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: 24 }} />
          ) : !dashboard?.recentTransactions?.length ? (
            <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="inbox" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No transactions yet</Text>
            </View>
          ) : (
            dashboard.recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                type={tx.type as "credit" | "debit"}
                amount={tx.amount}
                description={tx.description}
                bankName={tx.bankName}
                bankColor={tx.bankColor}
                currency={tx.currency}
                date={tx.createdAt}
                category={tx.category}
                onPress={() => router.push(`/transactions/${tx.id}`)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Pressable
            style={[styles.securityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/profile/security")}
          >
            <View style={[styles.securityIcon, { backgroundColor: colors.goldLight }]}>
              <Feather name="shield" size={22} color={colors.gold} />
            </View>
            <View style={styles.securityText}>
              <Text style={[styles.securityTitle, { color: colors.foreground }]}>
                Your security is our priority
              </Text>
              <Text style={[styles.securitySub, { color: colors.mutedForeground }]}>
                We use bank-level security to keep your data and money safe.
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const carouselStyles = StyleSheet.create({
  carousel: { marginLeft: -4 },
  carouselContent: { gap: 10, paddingRight: 20 },
  item: {
    width: 120,
    borderRadius: 18,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#222222",
    padding: 14,
    gap: 6,
    overflow: "hidden",
  },
  walletItem: { backgroundColor: "#0E0E00", borderColor: "#2A2510" },
  phoneItem: { backgroundColor: "#0D0A1E", borderColor: "#2A1A4E" },
  walletRing: {
    position: "absolute", top: -20, right: -20,
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 16, borderColor: "rgba(212,175,55,0.1)",
  },
  phoneRing: {
    position: "absolute", top: -20, right: -20,
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 16, borderColor: "rgba(167,139,250,0.1)",
  },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  iconText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_700Bold" },
  itemLabel: { color: "#888888", fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
  itemBalance: { color: "#FFFFFF", fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  itemCurrency: { color: "#555555", fontSize: 10, fontFamily: "Inter_400Regular" },
  addItem: {
    width: 90, borderRadius: 18, borderWidth: 1.5, borderStyle: "dashed",
    padding: 14, alignItems: "center", justifyContent: "center", gap: 6,
  },
  addItemText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 20,
  },
  avatarBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  avatarBtnText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 110 },
  greeting: { paddingHorizontal: 20, marginBottom: 20 },
  greetSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 3 },
  greetName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  balanceCard: {
    marginHorizontal: 20, borderRadius: 20, borderWidth: 1,
    padding: 22, paddingBottom: 20, overflow: "hidden", marginBottom: 20,
  },
  waveRing1: {
    position: "absolute", top: "20%", right: -70,
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 28, borderColor: "rgba(212,175,55,0.07)",
  },
  waveRing2: {
    position: "absolute", top: "5%", right: -30,
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 18, borderColor: "rgba(212,175,55,0.05)",
  },
  waveRing3: {
    position: "absolute", top: "35%", right: -100,
    width: 240, height: 240, borderRadius: 120,
    borderWidth: 32, borderColor: "rgba(212,175,55,0.04)",
  },
  balanceLabel: { color: "#D4AF37", fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.4, marginBottom: 10 },
  balanceAmount: { color: "#FFFFFF", fontSize: 36, fontFamily: "Inter_700Bold", letterSpacing: -1.5, marginBottom: 14 },
  balanceBreakdown: {
    flexDirection: "row", alignItems: "center", marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 10,
  },
  breakdownItem: { flex: 1, gap: 3 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  breakdownValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  breakdownDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 12 },
  balanceFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  balanceAccounts: { fontSize: 13, fontFamily: "Inter_400Regular" },
  ngn: { backgroundColor: "#2A2510", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  ngnText: { color: "#D4AF37", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  balanceTapHint: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  balanceTapText: { color: "rgba(212,175,55,0.5)", fontSize: 10, fontFamily: "Inter_400Regular" },
  balanceGlow: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#D4AF37", opacity: 0.45 },
  quickRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 28 },
  quickBtn: { flex: 1, borderRadius: 16, borderWidth: 1, alignItems: "center", paddingVertical: 16, gap: 10 },
  quickIconWrap: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  empty: { borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", padding: 36, gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  securityCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  securityIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  securityText: { flex: 1 },
  securityTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  securitySub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
});
