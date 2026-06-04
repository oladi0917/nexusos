import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  useListBanks,
  useCreateAccount,
  getListAccountsQueryKey,
  getGetDashboardQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";

type Step = "select-bank" | "consent" | "success";

interface ConnectState {
  bankId: string | null;
  bankName: string | null;
  bankColor: string | null;
}

export default function AddAccountScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep] = useState<Step>("select-bank");
  const [connect, setConnect] = useState<ConnectState>({ bankId: null, bankName: null, bankColor: null });
  const [connecting, setConnecting] = useState(false);

  const { data: banks } = useListBanks();
  const createAccount = useCreateAccount();

  const handleConnect = async () => {
    if (!connect.bankId) return;
    setConnecting(true);
    try {
      const seed = connect.bankId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const accountNumber = `0${String(seed * 97 + 12345678).slice(0, 9)}`;
      const balance = 15000 + (seed % 200) * 1000;

      await new Promise((r) => setTimeout(r, 1500));

      await createAccount.mutateAsync({
        data: { bankId: connect.bankId, accountNumber, accountName: "Account Holder", balance },
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: getListAccountsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      setStep("success");
    } catch { } finally { setConnecting(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        {step !== "success" ? (
          <Pressable
            onPress={() => (step === "select-bank" ? router.back() : setStep("select-bank"))}
            style={[styles.backBtn, { backgroundColor: colors.card }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
        ) : <View style={{ width: 40 }} />}
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {step === "select-bank" ? "Add Account" : step === "consent" ? "Connect Account" : "Account Added"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
        {/* Select bank */}
        {step === "select-bank" && (
          <View style={styles.content}>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>Select the bank you want to connect</Text>
            <View style={styles.bankGrid}>
              {(banks ?? []).map((bank) => (
                <Pressable
                  key={bank.id}
                  onPress={() => { setConnect({ bankId: bank.id, bankName: bank.name, bankColor: bank.color }); setStep("consent"); }}
                  style={({ pressed }) => [styles.bankCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
                >
                  <View style={[styles.bankIcon, { backgroundColor: bank.color }]}>
                    <Text style={styles.bankIconText}>{bank.shortName.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.bankShort, { color: colors.foreground }]}>{bank.shortName}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Consent */}
        {step === "consent" && (
          <View style={styles.content}>
            <View style={[styles.consentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.consentBankIcon, { backgroundColor: connect.bankColor ?? "#888" }]}>
                <Text style={styles.bankIconText}>{(connect.bankName ?? "").slice(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={[styles.consentTitle, { color: colors.foreground }]}>Connect {connect.bankName}</Text>
              <Text style={[styles.consentDesc, { color: colors.mutedForeground }]}>
                Nexus will securely connect to your {connect.bankName} account to read your balance and transactions. We never make payments without your consent.
              </Text>
              <View style={styles.permList}>
                {["View account balance", "Read transaction history", "Account holder details"].map((perm) => (
                  <View key={perm} style={styles.permItem}>
                    <View style={[styles.permCheck, { backgroundColor: colors.successLight }]}>
                      <Feather name="check" size={12} color={colors.success} />
                    </View>
                    <Text style={[styles.permText, { color: colors.foreground }]}>{perm}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.securityBadge, { backgroundColor: colors.goldLight }]}>
                <Feather name="shield" size={14} color={colors.gold} />
                <Text style={[styles.securityText, { color: colors.gold }]}>256-bit bank-grade encryption</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.connectBtn, { backgroundColor: connect.bankColor ?? colors.gold, opacity: pressed || connecting ? 0.85 : 1 }]}
              onPress={handleConnect}
              disabled={connecting}
            >
              {connecting ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ActivityIndicator color="#FFF" size="small" />
                  <Text style={styles.connectBtnText}>Connecting...</Text>
                </View>
              ) : <Text style={styles.connectBtnText}>Connect Account</Text>}
            </Pressable>
            <Pressable style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.7 : 1 }]} onPress={() => setStep("select-bank")}>
              <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {/* Success */}
        {step === "success" && (
          <View style={styles.successContent}>
            <LinearGradient colors={[colors.gold, colors.goldDark ?? "#9A7828"]} style={styles.successIcon}>
              <Feather name="check" size={36} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Account Connected!</Text>
            <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
              Your {connect.bankName} account has been successfully connected to Nexus.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.connectBtn, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1, marginTop: 24 }]}
              onPress={() => router.push("/(tabs)/accounts")}
            >
              <Text style={styles.connectBtnText}>View Accounts</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => { setStep("select-bank"); setConnect({ bankId: null, bankName: null, bankColor: null }); }}
            >
              <Text style={[styles.cancelBtnText, { color: colors.gold }]}>Add Another Account</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  content: { gap: 16 },
  hint: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bankGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  bankCard: { width: "46%", borderRadius: 16, borderWidth: 1.5, padding: 16, alignItems: "center", gap: 10 },
  bankIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bankIconText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  bankShort: { fontSize: 13, fontFamily: "Inter_700Bold", textAlign: "center" },
  consentCard: { borderRadius: 20, borderWidth: 1.5, padding: 24, alignItems: "center", gap: 12 },
  consentBankIcon: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  consentTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  consentDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  permList: { alignSelf: "stretch", gap: 10, marginTop: 4 },
  permItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  permCheck: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  permText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  securityBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 4 },
  securityText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  connectBtn: { borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center", marginTop: 8 },
  connectBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  successContent: { alignItems: "center", paddingTop: 40, gap: 12 },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  successDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
});
