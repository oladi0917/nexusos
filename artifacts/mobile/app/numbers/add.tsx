import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

type Step = "enter" | "otp" | "success";

export default function AddNumberScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { token } = useAuth();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep] = useState<Step>("enter");
  const [number, setNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async () => {
    setError("");
    const cleaned = number.replace(/\s+/g, "");
    if (!cleaned) { setError("Please enter a phone number"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/phone-numbers/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ number: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send OTP"); return; }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (otp.length < 4) { setError("Please enter the OTP you received"); return; }
    setLoading(true);
    try {
      const cleaned = number.replace(/\s+/g, "");
      const res = await fetch(`${BASE_URL}/api/phone-numbers/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ number: cleaned, otp, label: label || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Invalid OTP"); return; }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await qc.invalidateQueries({ queryKey: ["phone-numbers"] });
      setStep("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canGoBack = step === "enter" || step === "otp";

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        {canGoBack ? (
          <Pressable
            style={[styles.backBtn, { backgroundColor: colors.card }]}
            onPress={() => {
              if (step === "otp") { setStep("enter"); setOtp(""); setError(""); }
              else router.back();
            }}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
        ) : <View style={{ width: 40 }} />}
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {step === "enter" ? "Link Number" : step === "otp" ? "Verify OTP" : "Number Linked"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {step !== "success" && (
        <View style={[styles.progressBar, { paddingHorizontal: 20, paddingBottom: 14 }]}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={[styles.progressDot, {
                backgroundColor: (step === "enter" ? 0 : 1) >= i ? colors.gold : colors.secondary,
                flex: 1,
              }]}
            />
          ))}
        </View>
      )}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          {step === "enter" && (
            <View style={styles.stepContent}>
              <View style={[styles.iconWrap, { backgroundColor: "#1A0A2E" }]}>
                <Feather name="phone" size={32} color="#A78BFA" />
              </View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Enter Your Number</Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                We'll send a one-time code to verify this number.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>Phone Number</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: error ? colors.debitRed : colors.border }]}>
                  <Feather name="phone" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="e.g. 08012345678"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="phone-pad"
                    value={number}
                    onChangeText={(v) => { setNumber(v); setError(""); }}
                    maxLength={14}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>Label (optional)</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="tag" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="e.g. Work, Personal"
                    placeholderTextColor={colors.mutedForeground}
                    value={label}
                    onChangeText={setLabel}
                    maxLength={30}
                  />
                </View>
              </View>

              {error ? <Text style={[styles.errorText, { color: colors.debitRed }]}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: colors.gold, opacity: pressed || loading ? 0.85 : 1 }]}
                onPress={handleRequestOtp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : (
                  <Text style={styles.primaryBtnText}>Send OTP</Text>
                )}
              </Pressable>
            </View>
          )}

          {step === "otp" && (
            <View style={styles.stepContent}>
              <View style={[styles.iconWrap, { backgroundColor: "#1A0A2E" }]}>
                <Feather name="message-square" size={32} color="#A78BFA" />
              </View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Enter OTP</Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                Enter the code sent to{" "}
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                  {number}
                </Text>
                .{"\n"}Use any 4–6 digit code for demo purposes.
              </Text>

              <View style={[styles.otpHint, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="info" size={14} color={colors.gold} />
                <Text style={[styles.otpHintText, { color: colors.mutedForeground }]}>
                  Demo mode: Enter any 4–6 digits to verify
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>Verification Code</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: error ? colors.debitRed : colors.border }]}>
                  <Feather name="lock" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.otpInput, { color: colors.foreground }]}
                    placeholder="• • • • • •"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={(v) => { setOtp(v); setError(""); }}
                    maxLength={6}
                  />
                </View>
              </View>

              {error ? <Text style={[styles.errorText, { color: colors.debitRed }]}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: colors.gold, opacity: pressed || loading ? 0.85 : 1 }]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : (
                  <Text style={styles.primaryBtnText}>Verify & Link</Text>
                )}
              </Pressable>

              <Pressable onPress={() => { setStep("enter"); setOtp(""); setError(""); }}>
                <Text style={[styles.resendText, { color: colors.gold }]}>Change number</Text>
              </Pressable>
            </View>
          )}

          {step === "success" && (
            <View style={styles.successContent}>
              <View style={[styles.successIcon, { backgroundColor: colors.successLight }]}>
                <Feather name="check-circle" size={48} color={colors.creditGreen} />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>Number Linked!</Text>
              <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
                <Text style={{ color: "#A78BFA", fontFamily: "Inter_600SemiBold" }}>{number}</Text>
                {"\n"}has been verified and added to your account.
              </Text>

              <View style={[styles.successFeatures, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {[
                  "Receive money via phone number",
                  "Used as financial identity in Nexus",
                  "Discoverable by other Nexus users",
                ].map((feat, i) => (
                  <View key={i} style={styles.successFeatureRow}>
                    <Feather name="check" size={14} color={colors.creditGreen} />
                    <Text style={[styles.successFeatureText, { color: colors.mutedForeground }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => { router.back(); }}
              >
                <Text style={styles.primaryBtnText}>View Linked Numbers</Text>
              </Pressable>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  progressBar: { flexDirection: "row", gap: 4, height: 18 },
  progressDot: { height: 4, borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 40 },
  stepContent: { gap: 18, paddingTop: 12 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 4,
  },
  stepTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  stepSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, height: 56,
  },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular" },
  otpInput: { flex: 1, fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: 8, textAlign: "center" },
  otpHint: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  otpHintText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  primaryBtn: { borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center", marginTop: 4 },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  resendText: { textAlign: "center", fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 4 },
  successContent: { alignItems: "center", paddingTop: 32, gap: 16 },
  successIcon: {
    width: 96, height: 96, borderRadius: 28,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  successTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  successFeatures: {
    width: "100%", padding: 16, borderRadius: 14, borderWidth: 1, gap: 10, marginTop: 4,
  },
  successFeatureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  successFeatureText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
});
