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
import { useListAccounts, getListAccountsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { AccountCard } from "@/components/AccountCard";
import { NexusLogo } from "@/components/NexusLogo";

function formatBalance(n: number | string): string {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return v.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: accounts, isLoading, refetch } = useListAccounts();

  const totalBalance = (accounts ?? []).reduce(
    (sum, a) => sum + (typeof a.balance === "string" ? parseFloat(a.balance) : a.balance),
    0
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerLeft}>
          <NexusLogo size="xs" />
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Accounts</Text>
            {!isLoading && (accounts ?? []).length > 0 && (
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                Combined: ₦{formatBalance(totalBalance)}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { borderColor: colors.gold, opacity: pressed ? 0.75 : 1 },
          ]}
          onPress={() => router.push("/accounts/add")}
        >
          <Feather name="plus" size={15} color={colors.gold} />
          <Text style={[styles.addBtnText, { color: colors.gold }]}>Add</Text>
        </Pressable>
      </View>

      {/* ── Content ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={async () => {
              await qc.invalidateQueries({ queryKey: getListAccountsQueryKey() });
              await refetch();
            }}
            tintColor={colors.gold}
          />
        }
      >
        {isLoading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 60 }} />
        ) : !accounts?.length ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="credit-card" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No accounts yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Connect your bank accounts to get started
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.connectBtn,
                { borderColor: colors.gold, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => router.push("/accounts/add")}
            >
              <Feather name="plus" size={16} color={colors.gold} />
              <Text style={[styles.connectBtnText, { color: colors.gold }]}>Connect Account</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cardList}>
            {accounts.map((account, index) => (
              <AccountCard
                key={account.id}
                bankName={account.bankName}
                bankColor={account.bankColor}
                accountNumber={account.accountNumber}
                accountName={account.accountName}
                balance={account.balance}
                currency={account.currency}
                isPrimary={index === 0}
              />
            ))}

            {/* Add another account */}
            <Pressable
              style={({ pressed }) => [
                styles.addMoreBtn,
                { borderColor: colors.gold, opacity: pressed ? 0.75 : 1 },
              ]}
              onPress={() => router.push("/accounts/add")}
            >
              <View style={[styles.addMoreIcon, { borderColor: colors.gold }]}>
                <Feather name="plus" size={16} color={colors.gold} />
              </View>
              <Text style={[styles.addMoreText, { color: colors.gold }]}>Add another account</Text>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", lineHeight: 24 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  addBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "web" ? 110 : 110,
    paddingTop: 4,
  },

  /* Card list */
  cardList: { gap: 16 },

  /* Add more button */
  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 18,
    marginTop: 4,
  },
  addMoreIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  /* Empty state */
  empty: {
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    padding: 40,
    marginTop: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  connectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 11,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  connectBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
