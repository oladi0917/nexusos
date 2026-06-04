import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface AccountCardProps {
  bankName: string;
  bankColor: string;
  accountNumber: string;
  accountName: string;
  balance: number | string;
  currency?: string;
  isPrimary?: boolean;
  compact?: boolean;
  selected?: boolean;
  onPress?: () => void;
}

function formatBalance(bal: number | string): string {
  const n = typeof bal === "string" ? parseFloat(bal) : bal;
  return n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function maskAccount(num: string): string {
  if (num.length <= 4) return `•••• ${num}`;
  return `•••• ${num.slice(-4)}`;
}

export function AccountCard({
  bankName,
  bankColor,
  accountNumber,
  accountName,
  balance,
  currency = "NGN",
  isPrimary = false,
  compact = false,
  selected = false,
  onPress,
}: AccountCardProps) {
  const colors = useColors();
  const initials = bankName.slice(0, 2).toUpperCase();

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.compact,
          {
            backgroundColor: colors.card,
            borderColor: selected ? bankColor : colors.border,
            borderWidth: selected ? 2 : 1.5,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={[styles.compactDot, { backgroundColor: bankColor }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.compactBank, { color: colors.foreground }]} numberOfLines={1}>
            {bankName}
          </Text>
          <Text style={[styles.compactAcct, { color: colors.mutedForeground }]}>
            {maskAccount(accountNumber)}
          </Text>
        </View>
        <Text style={[styles.compactBal, { color: colors.foreground }]}>
          ₦{formatBalance(balance)}
        </Text>
        {selected && (
          <View style={[styles.checkCircle, { backgroundColor: bankColor }]}>
            <Feather name="check" size={12} color="#FFF" />
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cardWrap, { opacity: pressed ? 0.93 : 1 }]}
    >
      {/* Dark card body */}
      <View style={[styles.card, { backgroundColor: "#181818", borderColor: "#272727" }]}>

        {/* Decorative watermark arcs (right side) */}
        <View style={[styles.arc1, { borderColor: `${bankColor}18` }]} />
        <View style={[styles.arc2, { borderColor: `${bankColor}10` }]} />
        <View style={[styles.arc3, { borderColor: `${bankColor}08` }]} />

        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.bankRow}>
            <View style={[styles.bankBadge, { backgroundColor: bankColor }]}>
              <Text style={styles.bankInitials}>{initials}</Text>
            </View>
            <Text style={[styles.bankName, { color: "rgba(255,255,255,0.85)" }]}>
              {bankName}
            </Text>
          </View>
          {isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>Primary </Text>
              <Text style={styles.primaryStar}>★</Text>
            </View>
          )}
        </View>

        {/* Balance */}
        <Text style={styles.balanceAmount}>₦{formatBalance(balance)}</Text>
        <Text style={[styles.currency, { color: "rgba(255,255,255,0.45)" }]}>{currency}</Text>

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          <Text style={[styles.acctName, { color: "rgba(255,255,255,0.7)" }]}>{accountName}</Text>
          <Text style={[styles.acctNum, { color: "rgba(255,255,255,0.55)" }]}>
            {maskAccount(accountNumber)}
          </Text>
        </View>

        {/* Colored bottom glow strip */}
        <View style={[styles.glowStrip, { backgroundColor: bankColor }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    paddingBottom: 0,
    minHeight: 172,
    overflow: "hidden",
  },

  /* Decorative watermark arcs */
  arc1: {
    position: "absolute",
    right: -55,
    top: "10%",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 22,
  },
  arc2: {
    position: "absolute",
    right: -90,
    top: "-10%",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 26,
  },
  arc3: {
    position: "absolute",
    right: -120,
    top: "25%",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 30,
  },

  /* Top row */
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  bankRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  bankInitials: { color: "#FFF", fontSize: 13, fontFamily: "Inter_700Bold" },
  bankName: { fontSize: 14, fontFamily: "Inter_500Medium" },

  /* Primary badge */
  primaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2010",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#C9A84C44",
  },
  primaryText: { color: "#C9A84C", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  primaryStar: { color: "#C9A84C", fontSize: 10 },

  /* Balance */
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    marginBottom: 4,
  },
  currency: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 18 },

  /* Bottom row */
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 18,
  },
  acctName: { fontSize: 13, fontFamily: "Inter_500Medium" },
  acctNum: { fontSize: 13, fontFamily: "Inter_400Regular", letterSpacing: 1.5 },

  /* Glow strip */
  glowStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.7,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  /* Compact variant */
  compact: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  compactDot: { width: 12, height: 12, borderRadius: 6 },
  compactBank: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  compactAcct: { fontSize: 12, fontFamily: "Inter_400Regular" },
  compactBal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
