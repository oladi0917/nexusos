import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  useGetTransaction,
  useUpdateTransaction,
  getGetTransactionQueryKey,
  getListTransactionsQueryKey,
  getGetDashboardQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["Salary", "Business Income", "Refund", "Gift", "Investment", "Other"];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatAmount(n: number | string): string {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return v.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Colors = ReturnType<typeof import("@/hooks/useColors").useColors>;

function DetailRow({ label, value, colors, dot }: { label: string; value: string; colors: Colors; dot?: string }) {
  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.detailValueRow}>
        {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
        <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const txId = parseInt(id ?? "0", 10);
  const { data: tx, isLoading } = useGetTransaction(txId, {
    query: { enabled: !!txId, queryKey: getGetTransactionQueryKey(txId) },
  });
  const updateTx = useUpdateTransaction();

  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tx) { setCategory(tx.category ?? ""); setTag(tx.tag ?? ""); setNote(tx.note ?? ""); }
  }, [tx?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTx.mutateAsync({ id: txId, data: { category: category || null, tag: tag || null, note: note || null } });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: getGetTransactionQueryKey(txId) });
      qc.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      router.back();
    } catch { } finally { setSaving(false); }
  };

  if (isLoading || !tx) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  const isCredit = tx.type === "credit";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Transaction</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
            {/* Amount */}
            <View style={[styles.amountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.txIcon, { backgroundColor: isCredit ? colors.successLight : "#2D0F0F" }]}>
                <Feather name={isCredit ? "arrow-down-left" : "arrow-up-right"} size={24} color={isCredit ? colors.creditGreen : colors.debitRed} />
              </View>
              <Text style={[styles.txAmount, { color: isCredit ? colors.creditGreen : colors.debitRed }]}>
                {isCredit ? "+" : "-"}₦{formatAmount(tx.amount)}
              </Text>
              <Text style={[styles.txDesc, { color: colors.foreground }]}>{tx.description}</Text>
              <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{formatDate(tx.createdAt)}</Text>
            </View>

            {/* Details */}
            <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <DetailRow label="Account" value={tx.accountName} colors={colors} />
              <DetailRow label="Bank" value={tx.bankName} colors={colors} dot={tx.bankColor} />
              <DetailRow label="Type" value={isCredit ? "Credit" : "Debit"} colors={colors} />
              <DetailRow label="Currency" value={tx.currency} colors={colors} />
              {tx.recipientName && <DetailRow label="Recipient" value={tx.recipientName} colors={colors} />}
              {tx.recipientBank && <DetailRow label="Recipient Bank" value={tx.recipientBank} colors={colors} />}
            </View>

            {/* Category */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(category === cat ? "" : cat)}
                    style={({ pressed }) => [
                      styles.categoryChip,
                      { backgroundColor: category === cat ? colors.gold : colors.card, borderColor: category === cat ? colors.gold : colors.border, opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Text style={[styles.categoryChipText, { color: category === cat ? "#FFF" : colors.foreground }]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Tag */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Tag</Text>
              <TextInput
                style={[styles.textField, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="e.g. essential, family, work"
                placeholderTextColor={colors.mutedForeground}
                value={tag}
                onChangeText={setTag}
              />
            </View>

            {/* Note */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Personal Note</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Add a note about this transaction..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.gold, opacity: pressed || saving ? 0.85 : 1 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </Pressable>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  amountCard: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 8, marginBottom: 16 },
  txIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  txAmount: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  txDesc: { fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  txDate: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  detailCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1 },
  detailLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  detailValueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  detailValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionBlock: { marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  categoryChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  textField: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, height: 50, fontSize: 14, fontFamily: "Inter_400Regular" },
  textArea: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", height: 90, textAlignVertical: "top" },
  saveBtn: { borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center", marginTop: 8 },
  saveBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
