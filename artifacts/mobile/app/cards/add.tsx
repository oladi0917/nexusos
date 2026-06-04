import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function detectBrand(num: string): string {
  const d = num.replace(/\s/g, "")[0];
  if (d === "4") return "VISA";
  if (d === "5" || d === "2") return "MASTERCARD";
  if (d === "6" || d === "5") return "VERVE";
  return "";
}

export default function AddCardScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { token } = useAuth();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const brand = detectBrand(cardNumber);
  const digits = cardNumber.replace(/\s/g, "");

  const handleAdd = async () => {
    setError("");
    if (digits.length < 13) { setError("Please enter a valid card number"); return; }
    if (expiry.length < 5) { setError("Please enter a valid expiry date"); return; }
    if (cvv.length < 3) { setError("Please enter the CVV"); return; }
    if (!cardholderName.trim()) { setError("Please enter the cardholder name"); return; }

    const [month, year] = expiry.split("/");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardNumber: digits,
          expiresMonth: month,
          expiresYear: `20${year}`,
          cvv,
          cardholderName: cardholderName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add card");

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["cards"] });
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add card");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.successWrap]}>
          <LinearGradient colors={[colors.gold, colors.goldDark ?? "#C89B3C"]} style={styles.successIcon}>
            <Feather name="check" size={40} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Card Added!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            {brand || "Your card"} •••• {digits.slice(-4)} has been securely linked to Nexus.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.successBtn, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.push("/(tabs)/cards" as any)}
          >
            <Text style={styles.successBtnText}>View Cards</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ghostBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => {
              setCardNumber(""); setExpiry(""); setCvv(""); setCardholderName(""); setSuccess(false); setError("");
            }}
          >
            <Text style={[styles.ghostBtnText, { color: colors.foreground }]}>Add Another</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Add Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Card preview */}
          <View style={[styles.cardPreview, { backgroundColor: brand === "VISA" ? "#1A1F6E" : brand === "MASTERCARD" ? "#6E1A1A" : "#111" }]}>
            <View style={styles.previewRing} />
            <View style={styles.previewTop}>
              <Text style={styles.previewBrand}>{brand || "NEXUS"}</Text>
              <Feather name="wifi" size={18} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: "90deg" }] }} />
            </View>
            <Text style={styles.previewNumber}>
              {cardNumber ? cardNumber.padEnd(19, " ").replace(/ /g, " ") : "•••• •••• •••• ••••"}
            </Text>
            <View style={styles.previewBottom}>
              <View>
                <Text style={styles.previewMeta}>CARDHOLDER</Text>
                <Text style={styles.previewValue}>{cardholderName.toUpperCase() || "YOUR NAME"}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.previewMeta}>EXPIRES</Text>
                <Text style={styles.previewValue}>{expiry || "MM/YY"}</Text>
              </View>
            </View>
            <View style={[styles.previewGlow, { backgroundColor: colors.gold }]} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Card Number</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="credit-card" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  value={cardNumber}
                  onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                  maxLength={19}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.foreground }]}>Expiry</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.foreground, paddingLeft: 16 }]}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    value={expiry}
                    onChangeText={(v) => setExpiry(formatExpiry(v))}
                    maxLength={5}
                  />
                </View>
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.foreground }]}>CVV</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="•••"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    secureTextEntry
                    value={cvv}
                    onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Cardholder Name</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="user" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="As printed on card"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                />
              </View>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: "#1A0000", borderColor: "#4A0000" }]}>
                <Feather name="alert-circle" size={14} color={colors.debitRed} />
                <Text style={[styles.errorText, { color: colors.debitRed }]}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.gold, opacity: pressed || loading ? 0.85 : 1 }]}
              onPress={handleAdd}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.addBtnText}>Add Card Securely</Text>
              }
            </Pressable>

            <View style={[styles.securityBadge, { backgroundColor: colors.goldLight }]}>
              <Feather name="shield" size={13} color={colors.gold} />
              <Text style={[styles.securityText, { color: colors.gold }]}>
                Card data is tokenized. CVV is never stored.
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { padding: 20, paddingBottom: 60 },

  cardPreview: {
    borderRadius: 18,
    padding: 20,
    overflow: "hidden",
    marginBottom: 28,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  previewRing: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 30,
    borderColor: "rgba(255,255,255,0.06)",
  },
  previewTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  previewBrand: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  previewNumber: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 4, marginBottom: 22 },
  previewBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  previewMeta: { color: "rgba(255,255,255,0.5)", fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 2 },
  previewValue: { color: "#FFFFFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  previewGlow: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, opacity: 0.4 },

  form: { gap: 16 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    height: 56,
    paddingRight: 14,
  },
  inputIcon: { marginLeft: 14, marginRight: 8 },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular" },
  row: { flexDirection: "row", gap: 12 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },

  addBtn: { borderRadius: 14, height: 56, alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },

  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  securityText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },

  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 10 },
  successBtn: { borderRadius: 14, height: 54, width: "100%", alignItems: "center", justifyContent: "center", marginTop: 12 },
  successBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  ghostBtn: { borderRadius: 14, height: 50, width: "100%", alignItems: "center", justifyContent: "center", borderWidth: 1.5, marginTop: 4 },
  ghostBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
