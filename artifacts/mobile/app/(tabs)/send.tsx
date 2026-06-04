import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  useListAccounts,
  useListBanks,
  useResolveAccount,
  useCreateTransfer,
  getGetDashboardQueryKey,
  getListAccountsQueryKey,
  getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { AccountCard } from "@/components/AccountCard";
import { NexusLogo } from "@/components/NexusLogo";

type Step = "select-source" | "select-bank" | "enter-account" | "confirm-amount" | "success";

interface TransferState {
  sourceAccountId: number | null;
  recipientBankId: string | null;
  recipientBankName: string | null;
  recipientAccountNumber: string;
  recipientName: string | null;
  amount: string;
  note: string;
}

function formatBalance(n: number | string): string {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return v.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const BACK_STEP: Record<Step, Step | null> = {
  "select-source": null,
  "select-bank": "select-source",
  "enter-account": "select-bank",
  "confirm-amount": "enter-account",
  success: null,
};

const STEP_INDEX: Record<Step, number> = {
  "select-source": 0,
  "select-bank": 1,
  "enter-account": 2,
  "confirm-amount": 3,
  success: 4,
};

const STEP_TITLES: Record<Step, string> = {
  "select-source": "Select Account",
  "select-bank": "Select Bank",
  "enter-account": "Recipient",
  "confirm-amount": "Send Money",
  success: "Transfer Sent",
};

export default function SendScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep] = useState<Step>("select-source");
  const [transfer, setTransfer] = useState<TransferState>({
    sourceAccountId: null,
    recipientBankId: null,
    recipientBankName: null,
    recipientAccountNumber: "",
    recipientName: null,
    amount: "",
    note: "",
  });
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [successTx, setSuccessTx] = useState<{ id: number; amount: number } | null>(null);

  const { data: accounts } = useListAccounts();
  const { data: banks } = useListBanks();
  const resolveAccount = useResolveAccount();
  const createTransfer = useCreateTransfer();

  const sourceAccount = accounts?.find((a) => a.id === transfer.sourceAccountId);

  const reset = () => {
    setStep("select-source");
    setTransfer({ sourceAccountId: null, recipientBankId: null, recipientBankName: null, recipientAccountNumber: "", recipientName: null, amount: "", note: "" });
    setResolveError("");
    setSuccessTx(null);
  };

  const handleResolve = async () => {
    if (!transfer.recipientAccountNumber || transfer.recipientAccountNumber.length < 10) {
      setResolveError("Please enter a valid 10-digit account number");
      return;
    }
    setResolving(true);
    setResolveError("");
    try {
      const result = await resolveAccount.mutateAsync({
        data: { bankId: transfer.recipientBankId!, accountNumber: transfer.recipientAccountNumber },
      });
      setTransfer((t) => ({ ...t, recipientName: result.accountName }));
      setStep("confirm-amount");
    } catch {
      setResolveError("Could not resolve account. Please check the number.");
    } finally {
      setResolving(false);
    }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transfer.amount);
    if (isNaN(amount) || amount <= 0) { Alert.alert("Invalid Amount", "Please enter a valid amount."); return; }
    const srcBalance = typeof sourceAccount?.balance === "string" ? parseFloat(sourceAccount.balance) : (sourceAccount?.balance ?? 0);
    if (amount > srcBalance) { Alert.alert("Insufficient Funds", "You don't have enough balance."); return; }

    try {
      const result = await createTransfer.mutateAsync({
        data: {
          sourceAccountId: transfer.sourceAccountId!,
          recipientBank: transfer.recipientBankId!,
          recipientAccountNumber: transfer.recipientAccountNumber,
          recipientName: transfer.recipientName!,
          amount,
          note: transfer.note,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessTx({ id: result.transaction.id, amount });
      setStep("success");
      qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      qc.invalidateQueries({ queryKey: getListAccountsQueryKey() });
      qc.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
    } catch (e: unknown) {
      Alert.alert("Transfer Failed", e instanceof Error ? e.message : "Transfer failed");
    }
  };

  const canGoBack = step !== "select-source" && step !== "success";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        {canGoBack ? (
          <Pressable
            onPress={() => setStep(BACK_STEP[step]!)}
            style={[styles.backBtn, { backgroundColor: colors.card }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
        ) : <NexusLogo size="xs" />}
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{STEP_TITLES[step]}</Text>
        <View style={{ width: 40 }} />
      </View>

      {step !== "success" && (
        <View style={[styles.progressBar, { paddingHorizontal: 20, paddingBottom: 14 }]}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i <= STEP_INDEX[step] ? colors.gold : colors.secondary, flex: 1 },
              ]}
            />
          ))}
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">

            {/* STEP 1: Select source */}
            {step === "select-source" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>Which account to send from?</Text>
                {!accounts?.length ? (
                  <View style={[styles.noAccounts, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="credit-card" size={28} color={colors.mutedForeground} />
                    <Text style={[styles.noAccountsText, { color: colors.mutedForeground }]}>No accounts connected. Add an account first.</Text>
                    <Pressable style={[styles.addAcctBtn, { backgroundColor: colors.gold }]} onPress={() => router.push("/accounts/add")}>
                      <Text style={{ color: "#FFF", fontFamily: "Inter_600SemiBold" }}>Add Account</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    {accounts.map((account) => (
                      <AccountCard
                        key={account.id}
                        bankName={account.bankName}
                        bankColor={account.bankColor}
                        accountNumber={account.accountNumber}
                        accountName={account.accountName}
                        balance={account.balance}
                        currency={account.currency}
                        compact
                        selected={transfer.sourceAccountId === account.id}
                        onPress={() => { setTransfer((t) => ({ ...t, sourceAccountId: account.id })); setStep("select-bank"); }}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* STEP 2: Select bank */}
            {step === "select-bank" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>Select the recipient's bank</Text>
                <View style={styles.bankGrid}>
                  {(banks ?? []).map((bank) => (
                    <Pressable
                      key={bank.id}
                      onPress={() => { setTransfer((t) => ({ ...t, recipientBankId: bank.id, recipientBankName: bank.name })); setStep("enter-account"); }}
                      style={({ pressed }) => [styles.bankItem, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
                    >
                      <View style={[styles.bankDot, { backgroundColor: bank.color }]} />
                      <Text style={[styles.bankName, { color: colors.foreground }]} numberOfLines={2}>{bank.shortName}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* STEP 3: Account number */}
            {step === "enter-account" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>Enter the recipient's account number</Text>
                <View style={[styles.selectedBank, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.bankDotLg, { backgroundColor: banks?.find((b) => b.id === transfer.recipientBankId)?.color ?? "#888" }]} />
                  <Text style={[styles.selectedBankName, { color: colors.foreground }]}>{transfer.recipientBankName}</Text>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>Account Number</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.acctInput, { color: colors.foreground }]}
                      placeholder="0000000000"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="number-pad"
                      maxLength={10}
                      value={transfer.recipientAccountNumber}
                      onChangeText={(v) => setTransfer((t) => ({ ...t, recipientAccountNumber: v }))}
                    />
                  </View>
                  {resolveError ? <Text style={{ color: colors.debitRed, fontSize: 13, marginTop: 6, fontFamily: "Inter_400Regular" }}>{resolveError}</Text> : null}
                </View>
                <Pressable
                  style={({ pressed }) => [styles.nextBtn, { backgroundColor: colors.gold, opacity: pressed || resolving ? 0.85 : 1 }]}
                  onPress={handleResolve}
                  disabled={resolving}
                >
                  {resolving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextBtnText}>Verify Account</Text>}
                </Pressable>
              </View>
            )}

            {/* STEP 4: Amount */}
            {step === "confirm-amount" && (
              <View style={styles.stepContent}>
                <View style={[styles.recipientCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.recipientAvatar, { backgroundColor: colors.goldLight }]}>
                    <Text style={[styles.recipientInitial, { color: colors.gold }]}>{(transfer.recipientName ?? "?")[0]}</Text>
                  </View>
                  <View>
                    <Text style={[styles.recipientName, { color: colors.foreground }]}>{transfer.recipientName}</Text>
                    <Text style={[styles.recipientMeta, { color: colors.mutedForeground }]}>{transfer.recipientBankName} · {transfer.recipientAccountNumber}</Text>
                  </View>
                </View>
                {sourceAccount && (
                  <View style={[styles.fromBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.fromLabel, { color: colors.mutedForeground }]}>From</Text>
                    <View style={[styles.fromDot, { backgroundColor: sourceAccount.bankColor }]} />
                    <Text style={[styles.fromBank, { color: colors.foreground }]}>{sourceAccount.bankName} · Bal: ₦{formatBalance(sourceAccount.balance)}</Text>
                  </View>
                )}
                <View style={styles.amountSection}>
                  <Text style={[styles.amountPrefix, { color: colors.mutedForeground }]}>₦</Text>
                  <TextInput
                    style={[styles.amountInput, { color: colors.foreground }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.border}
                    keyboardType="decimal-pad"
                    value={transfer.amount}
                    onChangeText={(v) => setTransfer((t) => ({ ...t, amount: v }))}
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>Note (optional)</Text>
                  <TextInput
                    style={[styles.noteInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="What's this for?"
                    placeholderTextColor={colors.mutedForeground}
                    value={transfer.note}
                    onChangeText={(v) => setTransfer((t) => ({ ...t, note: v }))}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [styles.nextBtn, { backgroundColor: colors.gold, opacity: pressed || createTransfer.isPending ? 0.85 : 1 }]}
                  onPress={handleTransfer}
                  disabled={createTransfer.isPending}
                >
                  {createTransfer.isPending ? <ActivityIndicator color="#FFF" /> : (
                    <Text style={styles.nextBtnText}>Send ₦{transfer.amount ? parseFloat(transfer.amount).toLocaleString() : "0"}</Text>
                  )}
                </Pressable>
              </View>
            )}

            {/* SUCCESS */}
            {step === "success" && (
              <View style={styles.successContent}>
                <LinearGradient colors={[colors.gold, colors.goldDark ?? "#9A7828"]} style={styles.successIcon}>
                  <Feather name="check" size={40} color="#FFF" />
                </LinearGradient>
                <Text style={[styles.successTitle, { color: colors.foreground }]}>Transfer Successful!</Text>
                <Text style={[styles.successAmt, { color: colors.gold }]}>₦{successTx ? formatBalance(successTx.amount) : ""}</Text>
                <Text style={[styles.successSub, { color: colors.mutedForeground }]}>Sent to {transfer.recipientName} at {transfer.recipientBankName}</Text>
                <Pressable style={({ pressed }) => [styles.nextBtn, { backgroundColor: colors.gold, marginTop: 32, opacity: pressed ? 0.85 : 1, width: "100%" }]} onPress={reset}>
                  <Text style={styles.nextBtnText}>Send Another</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.ghostBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => { reset(); router.push("/(tabs)"); }}
                >
                  <Text style={[styles.ghostBtnText, { color: colors.foreground }]}>Back to Home</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  progressBar: { flexDirection: "row", gap: 4, height: 18 },
  progressDot: { height: 4, borderRadius: 2 },
  stepContent: { gap: 16 },
  stepHint: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bankGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  bankItem: { width: "46%", borderRadius: 14, borderWidth: 1.5, padding: 16, alignItems: "center", gap: 8 },
  bankDot: { width: 32, height: 32, borderRadius: 16 },
  bankDotLg: { width: 20, height: 20, borderRadius: 10 },
  bankName: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  selectedBank: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  selectedBankName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputWrap: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, height: 56, justifyContent: "center" },
  acctInput: { fontSize: 20, fontFamily: "Inter_400Regular", letterSpacing: 2 },
  nextBtn: { borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center", marginTop: 8 },
  nextBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  recipientCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1.5 },
  recipientAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  recipientInitial: { fontSize: 20, fontFamily: "Inter_700Bold" },
  recipientName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  recipientMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  fromBadge: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10 },
  fromLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  fromDot: { width: 10, height: 10, borderRadius: 5 },
  fromBank: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  amountSection: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 16 },
  amountPrefix: { fontSize: 32, fontFamily: "Inter_700Bold" },
  amountInput: { fontSize: 48, fontFamily: "Inter_700Bold", minWidth: 120, textAlign: "center" },
  noteInput: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", height: 52 },
  noAccounts: { borderRadius: 16, borderWidth: 1, alignItems: "center", padding: 32, gap: 12 },
  noAccountsText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  addAcctBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  successContent: { alignItems: "center", paddingTop: 40, gap: 12 },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  successAmt: { fontSize: 36, fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 20 },
  ghostBtn: { borderRadius: 14, height: 50, alignItems: "center", justifyContent: "center", borderWidth: 1.5, width: "100%", marginTop: 8 },
  ghostBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
