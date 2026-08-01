import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { NexusLogo } from "@/components/NexusLogo";

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { signup } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleSignup = async () => {
    const { firstName, lastName, email, phone, password } = form;
    if (!firstName || !lastName || !email || !phone || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signup({ firstName, lastName, email: email.trim().toLowerCase(), phone, password });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Signup failed";
      setError(msg);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const field = (
    icon: keyof typeof Feather.glyphMap,
    label: string,
    key: keyof typeof form,
    props: Record<string, unknown> = {}
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name={icon} size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholderTextColor={colors.mutedForeground}
          value={form[key]}
          onChangeText={update(key)}
          {...props}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={[styles.header, { paddingTop: topPad + 16 }]}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backBtn,
                  { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="arrow-left" size={20} color={colors.foreground} />
              </Pressable>
            </View>

            <View style={styles.content}>
              <View style={styles.brandRow}>
                <NexusLogo size="md" showWordmark showTagline />
              </View>
              <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Join Nexus and take control of your finances
              </Text>

              <View style={styles.form}>
                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    {field("user", "First Name", "firstName", { placeholder: "Ada" })}
                  </View>
                  <View style={{ flex: 1 }}>
                    {field("user", "Last Name", "lastName", { placeholder: "Okafor" })}
                  </View>
                </View>

                {field("mail", "Email", "email", {
                  placeholder: "ada@example.com",
                  autoCapitalize: "none",
                  keyboardType: "email-address",
                })}
                {field("phone", "Phone Number", "phone", {
                  placeholder: "0801 234 5678",
                  keyboardType: "phone-pad",
                })}

                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="lock" size={18} color={colors.mutedForeground} />
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      placeholder="At least 6 characters"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry={!showPassword}
                      value={form.password}
                      onChangeText={update("password")}
                    />
                    <Pressable onPress={() => setShowPassword((v) => !v)}>
                      <Feather
                        name={showPassword ? "eye-off" : "eye"}
                        size={18}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitBtn,
                    { backgroundColor: colors.gold, opacity: pressed || loading ? 0.85 : 1 },
                  ]}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Create Account</Text>
                  )}
                </Pressable>

                <View style={styles.switchRow}>
                  <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
                    Already have an account?{" "}
                  </Text>
                  <Pressable onPress={() => router.push("/(auth)/login")}>
                    <Text style={[styles.switchLink, { color: colors.gold }]}>Sign In</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  brandRow: { marginBottom: 20 },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 28 },
  form: { gap: 0 },
  row: { flexDirection: "row", gap: 12 },
  errorBox: { borderRadius: 10, padding: 12, marginBottom: 16, backgroundColor: "#2D0F0F" },
  errorText: { color: "#FF6B6B", fontSize: 13, fontFamily: "Inter_400Regular" },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 7 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  submitBtn: {
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 32,
  },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  switchLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
