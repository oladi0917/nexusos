import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { NexusLogo } from "@/components/NexusLogo";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { login } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email.trim().toLowerCase(), password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setError(msg);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
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
              <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Sign in to your Nexus account
              </Text>

              <View style={styles.form}>
                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Feather name="mail" size={18} color={colors.mutedForeground} />
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.mutedForeground}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Feather name="lock" size={18} color={colors.mutedForeground} />
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
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
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Sign In</Text>
                  )}
                </Pressable>

                <View style={styles.switchRow}>
                  <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
                    Don't have an account?{" "}
                  </Text>
                  <Pressable onPress={() => router.push("/(auth)/signup")}>
                    <Text style={[styles.switchLink, { color: colors.gold }]}>Sign Up</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
  content: { paddingHorizontal: 24, paddingTop: 16 },
  brandRow: { marginBottom: 24 },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 32 },
  form: { gap: 0 },
  errorBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#2D0F0F",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
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
  switchRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  switchLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
