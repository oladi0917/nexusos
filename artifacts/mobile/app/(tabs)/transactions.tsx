import React, { useState } from "react";
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
  useListTransactions,
  useListAccounts,
  getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { TransactionItem } from "@/components/TransactionItem";
import { NexusLogo } from "@/components/NexusLogo";

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const { data: accounts } = useListAccounts();
  const { data: transactions, isLoading, refetch } = useListTransactions(
    selectedAccountId ? { accountId: selectedAccountId } : undefined
  );

  const totalCount = transactions?.length ?? 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <NexusLogo size="xs" />
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Transactions</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Track and manage your money
          </Text>
        </View>
        <Pressable
          style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {}}
        >
          <Feather name="filter" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={async () => {
              await qc.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
              await refetch();
            }}
            tintColor={colors.gold}
          />
        }
      >
        {/* ── Filter chips (sticky) ── */}
        <View style={[styles.filterBar, { backgroundColor: colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            <Pressable
              onPress={() => setSelectedAccountId(null)}
              style={[
                styles.filterChip,
                !selectedAccountId
                  ? { backgroundColor: colors.gold, borderColor: colors.gold }
                  : { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: !selectedAccountId ? "#000" : colors.mutedForeground },
                ]}
              >
                All
              </Text>
            </Pressable>

            {accounts?.map((acc) => (
              <Pressable
                key={acc.id}
                onPress={() => setSelectedAccountId(acc.id)}
                style={[
                  styles.filterChip,
                  selectedAccountId === acc.id
                    ? { backgroundColor: colors.gold, borderColor: colors.gold }
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={[styles.filterDot, { backgroundColor: acc.bankColor }]} />
                <Text
                  style={[
                    styles.filterChipText,
                    { color: selectedAccountId === acc.id ? "#000" : colors.mutedForeground },
                  ]}
                >
                  {acc.bankName.split(" ")[0]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        {/* ── Stats card ── */}
        <View style={[styles.statsCard, { backgroundColor: "#161610", borderColor: "#2A2510" }]}>
          {/* Decorative wave rings */}
          <View style={styles.statsArc1} />
          <View style={styles.statsArc2} />

          <View style={styles.statsLeft}>
            <View style={[styles.statsIcon, { backgroundColor: "#1E1E1E", borderColor: "#2A2A2A" }]}>
              <Feather name="refresh-cw" size={20} color={colors.gold} />
            </View>
            <View>
              <Text style={[styles.statsLabel, { color: colors.mutedForeground }]}>
                Total Transactions
              </Text>
              {isLoading ? (
                <ActivityIndicator color={colors.gold} style={{ marginTop: 4 }} />
              ) : (
                <Text style={[styles.statsCount, { color: colors.foreground }]}>
                  {totalCount}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.statsRight}>
            <View style={[styles.periodPill, { backgroundColor: "#1E1A0E", borderColor: "#2A2510" }]}>
              <Text style={[styles.periodText, { color: colors.gold }]}>This Month</Text>
              <Feather name="chevron-down" size={12} color={colors.gold} />
            </View>
            <View style={styles.statsDelta}>
              <Feather name="trending-up" size={13} color={colors.creditGreen ?? "#10B981"} />
              <Text style={[styles.deltaText, { color: colors.creditGreen ?? "#10B981" }]}>
                {" "}18%
              </Text>
            </View>
            <Text style={[styles.deltaLabel, { color: colors.mutedForeground }]}>vs last month</Text>
          </View>
        </View>

        {/* ── Recent Transactions ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Transactions</Text>
          <Pressable onPress={() => {}}>
            <Text style={[styles.seeAll, { color: colors.gold }]}>See all</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 20 }} />
        ) : !transactions?.length ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No transactions</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Your transaction history will appear here
            </Text>
          </View>
        ) : (
          transactions.map((tx) => (
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
              showChevron
              onPress={() => router.push(`/transactions/${tx.id}`)}
            />
          ))
        )}

        {/* ── Tip card ── */}
        {!isLoading && (
          <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.tipIcon, { backgroundColor: "#1A1A0C", borderColor: "#2A2510" }]}>
              <Feather name="lock" size={20} color={colors.gold} />
            </View>
            <View style={styles.tipText}>
              <Text style={[styles.tipTitle, { color: colors.foreground }]}>
                Filters help you find exactly what you're looking for.
              </Text>
            </View>
            <Pressable
              style={[styles.manageBtn, { borderColor: colors.gold }]}
              onPress={() => {}}
            >
              <Text style={[styles.manageBtnText, { color: colors.gold }]}>Manage Filters</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 26 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Filter chips */
  filterBar: {
    marginHorizontal: -20,
    paddingVertical: 10,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 2,
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  filterChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "web" ? 110 : 110,
  },

  /* Stats card */
  statsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    overflow: "hidden",
  },
  statsArc1: {
    position: "absolute",
    right: 60,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 18,
    borderColor: "rgba(201,168,76,0.08)",
  },
  statsArc2: {
    position: "absolute",
    right: 20,
    top: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 22,
    borderColor: "rgba(201,168,76,0.05)",
  },
  statsLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 4 },
  statsCount: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  statsRight: { alignItems: "flex-end", gap: 4 },
  periodPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  periodText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  statsDelta: { flexDirection: "row", alignItems: "center" },
  deltaText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  deltaLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },

  /* Section header */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  /* Empty */
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    padding: 40,
    gap: 10,
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },

  /* Tip card */
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  tipIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipText: { flex: 1 },
  tipTitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  manageBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 0,
  },
  manageBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
