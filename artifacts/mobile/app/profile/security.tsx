import React, { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme, type ThemePreference } from "@/context/ThemeContext";

const PIN_KEY = "nexus_pin";

async function getPin(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(PIN_KEY);
  return SecureStore.getItemAsync(PIN_KEY);
}

async function setPin(pin: string) {
  if (Platform.OS === "web") localStorage.setItem(PIN_KEY, pin);
  else await SecureStore.setItemAsync(PIN_KEY, pin);
}

async function deletePin() {
  if (Platform.OS === "web") localStorage.removeItem(PIN_KEY);
  else await SecureStore.deleteItemAsync(PIN_KEY);
}

function ToggleRow({ icon, label, subtitle, value, onValueChange }: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={18} color={colors.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.gold }}
        thumbColor="#FFF"
      />
    </View>
  );
}

function ActionRow({ icon, label, subtitle, onPress, danger }: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: danger ? "#2D0F0F" : colors.secondary }]}>
        <Feather name={icon} size={18} color={danger ? colors.debitRed : colors.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: danger ? colors.debitRed : colors.foreground }]}>{label}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { preference, isDark, setPreference } = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [hasPin, setHasPin] = useState(false);
  const [showPinForm, setShowPinForm] = useState<"create" | "change" | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [pinError, setPinError] = useState("");

  const [biometricFace, setBiometricFace] = useState(false);
  const [biometricFinger, setBiometricFinger] = useState(false);
  const [txAlerts, setTxAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [securityNotifs, setSecurityNotifs] = useState(true);
  const [deviceRecognition, setDeviceRecognition] = useState(true);

  useEffect(() => {
    getPin().then((p) => setHasPin(!!p));
  }, []);

  const handleCreatePin = async () => {
    setPinError("");
    if (pinInput.length < 4 || pinInput.length > 6) { setPinError("PIN must be 4–6 digits"); return; }
    if (pinInput !== pinConfirm) { setPinError("PINs do not match"); return; }
    if (!/^\d+$/.test(pinInput)) { setPinError("PIN must contain only digits"); return; }
    await setPin(pinInput);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHasPin(true);
    setShowPinForm(null);
    setPinInput(""); setPinConfirm(""); setCurrentPin("");
    Alert.alert("PIN Created", "Your Nexus PIN has been set successfully.");
  };

  const handleChangePin = async () => {
    setPinError("");
    const stored = await getPin();
    if (stored !== currentPin) { setPinError("Current PIN is incorrect"); return; }
    if (pinInput.length < 4 || pinInput.length > 6) { setPinError("New PIN must be 4–6 digits"); return; }
    if (pinInput !== pinConfirm) { setPinError("New PINs do not match"); return; }
    await setPin(pinInput);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowPinForm(null);
    setPinInput(""); setPinConfirm(""); setCurrentPin("");
    Alert.alert("PIN Changed", "Your PIN has been updated.");
  };

  const handleDeletePin = () => {
    Alert.alert("Remove PIN", "Are you sure you want to remove your Nexus PIN?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => { await deletePin(); setHasPin(false); },
      },
    ]);
  };

  const THEME_OPTIONS: { label: string; value: ThemePreference; icon: keyof typeof Feather.glyphMap }[] = [
    { label: "System Default", value: "system", icon: "monitor" },
    { label: "Light Mode", value: "light", icon: "sun" },
    { label: "Dark Mode", value: "dark", icon: "moon" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NEXUS PIN</Text>
        <View style={styles.group}>
          {!hasPin ? (
            <ActionRow icon="lock" label="Create Nexus PIN" subtitle="Secure your account with a 4–6 digit PIN" onPress={() => setShowPinForm("create")} />
          ) : (
            <>
              <ActionRow icon="edit-2" label="Change PIN" subtitle="Update your current Nexus PIN" onPress={() => setShowPinForm("change")} />
              <ActionRow icon="unlock" label="Remove PIN" subtitle="Delete your Nexus PIN" onPress={handleDeletePin} danger />
            </>
          )}
        </View>

        {showPinForm && (
          <View style={[styles.pinForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.pinFormHeader}>
              <Text style={[styles.pinFormTitle, { color: colors.foreground }]}>
                {showPinForm === "create" ? "Create PIN" : "Change PIN"}
              </Text>
              <Pressable onPress={() => { setShowPinForm(null); setPinInput(""); setPinConfirm(""); setCurrentPin(""); setPinError(""); }}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            {showPinForm === "change" && (
              <View style={styles.pinField}>
                <Text style={[styles.pinLabel, { color: colors.foreground }]}>Current PIN</Text>
                <TextInput
                  style={[styles.pinInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Enter current PIN"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={6}
                  value={currentPin}
                  onChangeText={setCurrentPin}
                />
              </View>
            )}
            <View style={styles.pinField}>
              <Text style={[styles.pinLabel, { color: colors.foreground }]}>{showPinForm === "change" ? "New PIN" : "PIN"}</Text>
              <TextInput
                style={[styles.pinInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
                placeholder="4–6 digits"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
                value={pinInput}
                onChangeText={setPinInput}
              />
            </View>
            <View style={styles.pinField}>
              <Text style={[styles.pinLabel, { color: colors.foreground }]}>Confirm PIN</Text>
              <TextInput
                style={[styles.pinInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Re-enter PIN"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
                value={pinConfirm}
                onChangeText={setPinConfirm}
              />
            </View>
            {pinError ? <Text style={[styles.pinError, { color: colors.debitRed }]}>{pinError}</Text> : null}
            <Pressable
              style={({ pressed }) => [styles.pinSaveBtn, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 }]}
              onPress={showPinForm === "create" ? handleCreatePin : handleChangePin}
            >
              <Text style={styles.pinSaveBtnText}>{showPinForm === "create" ? "Set PIN" : "Update PIN"}</Text>
            </Pressable>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>BIOMETRICS</Text>
        <View style={styles.group}>
          <ToggleRow icon="eye" label="Face ID" subtitle="Use Face ID to unlock Nexus" value={biometricFace} onValueChange={setBiometricFace} />
          <ToggleRow icon="activity" label="Fingerprint" subtitle="Use fingerprint to unlock Nexus" value={biometricFinger} onValueChange={setBiometricFinger} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>APPEARANCE</Text>
        <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                setPreference(opt.value);
                Haptics.selectionAsync().catch(() => {});
              }}
              style={({ pressed }) => [
                styles.themeOption,
                preference === opt.value && [styles.themeOptionActive, { borderColor: colors.gold, backgroundColor: colors.goldLight }],
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={[styles.themeIconWrap, { backgroundColor: preference === opt.value ? colors.gold : colors.secondary }]}>
                <Feather name={opt.icon} size={16} color={preference === opt.value ? "#FFF" : colors.mutedForeground} />
              </View>
              <Text style={[styles.themeOptionLabel, { color: preference === opt.value ? colors.gold : colors.foreground }]}>
                {opt.label}
              </Text>
              {preference === opt.value && (
                <Feather name="check" size={16} color={colors.gold} style={{ marginLeft: "auto" }} />
              )}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LOGIN SECURITY</Text>
        <View style={[styles.loginCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Last Login", value: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
            { label: "Last Device", value: Platform.OS === "ios" ? "iPhone" : Platform.OS === "android" ? "Android" : "Web Browser" },
            { label: "Active Sessions", value: "1 session" },
          ].map((item, i) => (
            <View key={i} style={[styles.loginRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.loginLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.loginValue, { color: colors.foreground }]}>{item.value}</Text>
            </View>
          ))}
          <Pressable
            style={({ pressed }) => [styles.logoutOtherBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => Alert.alert("Logged Out", "All other devices have been logged out.")}
          >
            <Feather name="log-out" size={14} color={colors.debitRed} />
            <Text style={[styles.logoutOtherText, { color: colors.debitRed }]}>Log Out Other Devices</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SECURITY PREFERENCES</Text>
        <View style={styles.group}>
          <ToggleRow icon="bell" label="Transaction Alerts" subtitle="Get notified for every transaction" value={txAlerts} onValueChange={setTxAlerts} />
          <ToggleRow icon="shield" label="Login Alerts" subtitle="Alert when a new device logs in" value={loginAlerts} onValueChange={setLoginAlerts} />
          <ToggleRow icon="alert-triangle" label="Security Notifications" subtitle="Fraud and suspicious activity alerts" value={securityNotifs} onValueChange={setSecurityNotifs} />
          <ToggleRow icon="smartphone" label="Device Recognition" subtitle="Trust this device for faster login" value={deviceRecognition} onValueChange={setDeviceRecognition} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8, marginTop: 20 },
  group: { gap: 2 },
  settingRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 2,
  },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  settingSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  pinForm: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14, marginBottom: 4 },
  pinFormHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pinFormTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  pinField: { gap: 6 },
  pinLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  pinInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
    height: 48, fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 6,
  },
  pinError: { fontSize: 13, fontFamily: "Inter_400Regular" },
  pinSaveBtn: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pinSaveBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  themeCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", gap: 2, padding: 8 },
  themeOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "transparent",
  },
  themeOptionActive: { borderWidth: 1 },
  themeIconWrap: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  themeOptionLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  loginCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  loginRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  loginLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  loginValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  logoutOtherBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, padding: 14,
  },
  logoutOtherText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
