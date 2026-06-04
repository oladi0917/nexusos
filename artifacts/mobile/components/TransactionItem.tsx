import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface TransactionItemProps {
  type: "credit" | "debit";
  amount: number | string;
  description: string;
  bankName: string;
  bankColor: string;
  currency?: string;
  date: string;
  category?: string | null;
  showChevron?: boolean;
  onPress?: () => void;
}

function formatAmount(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function TransactionItem({
  type,
  amount,
  description,
  bankName,
  bankColor,
  currency = "NGN",
  date,
  category,
  showChevron = false,
  onPress,
}: TransactionItemProps) {
  const colors = useColors();
  const isCredit = type === "credit";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: isCredit ? colors.successLight : "#2D0F0F" },
        ]}
      >
        <Feather
          name={isCredit ? "arrow-down-left" : "arrow-up-right"}
          size={18}
          color={isCredit ? colors.creditGreen : colors.debitRed}
        />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={[styles.desc, { color: colors.foreground }]} numberOfLines={1}>
          {description}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{bankName}</Text>
          {category ? (
            <>
              <View style={[styles.metaDot, { backgroundColor: bankColor }]} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{category}</Text>
            </>
          ) : null}
        </View>
      </View>

      {/* Amount + Date */}
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            { color: isCredit ? colors.creditGreen : colors.debitRed },
          ]}
        >
          {isCredit ? "+" : "-"}₦{formatAmount(amount)}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(date)}</Text>
      </View>

      {/* Chevron */}
      {showChevron && (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={styles.chevron} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  details: { flex: 1, minWidth: 0 },
  desc: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaDot: { width: 7, height: 7, borderRadius: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  right: { alignItems: "flex-end", gap: 3 },
  amount: { fontSize: 13, fontFamily: "Inter_700Bold" },
  date: { fontSize: 11, fontFamily: "Inter_400Regular" },
  chevron: { flexShrink: 0, marginLeft: -4 },
});
