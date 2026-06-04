import React, { useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

const FAQS = [
  {
    q: "How do I link a bank account?",
    a: "Go to the Accounts tab and tap the + button. Select your bank, grant consent, and follow the secure connection flow.",
  },
  {
    q: "How do I add a card?",
    a: "Go to the Cards tab and tap Add Card. Enter your card details — they are tokenized and stored securely.",
  },
  {
    q: "How do I transfer money?",
    a: "Tap Send on the Home screen. Select your source account, choose the recipient bank, enter the account number, then confirm the amount.",
  },
  {
    q: "How do I reset my PIN?",
    a: "Go to Profile → Security → Reset PIN. You'll verify your identity via email OTP and then set a new PIN.",
  },
  {
    q: "How do I update my profile?",
    a: "Profile editing will be available in the next update. For urgent changes, contact support.",
  },
  {
    q: "How do I link a phone number?",
    a: "Go to the Numbers tab and tap Add. Enter your number, verify via OTP, and it will be added to your account.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Nexus uses bank-level encryption, tokenization, and secure session management to protect all your data.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        setOpen((v) => !v);
      }}
      style={[styles.faqItem, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: colors.foreground, flex: 1 }]}>{question}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
      </View>
      {open && (
        <Text style={[styles.faqAnswer, { color: colors.mutedForeground, borderTopColor: colors.border }]}>
          {answer}
        </Text>
      )}
    </Pressable>
  );
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSubmitted(true);
    setTimeout(() => {
      setSubject("");
      setDescription("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroCard, { backgroundColor: "#0D0D00", borderColor: "#2A2510" }]}>
            <View style={[styles.heroIcon, { backgroundColor: "#2A2510" }]}>
              <Feather name="life-buoy" size={28} color="#D4AF37" />
            </View>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroSub}>Browse FAQs or reach out to our support team.</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={{ gap: 6, marginBottom: 24 }}>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CONTACT SUPPORT</Text>
          <View style={{ gap: 8, marginBottom: 24 }}>
            {[
              { icon: "mail" as const, label: "Email Support", sub: "support@nexus.finance", onPress: () => Linking.openURL("mailto:support@nexus.finance") },
              { icon: "message-circle" as const, label: "Live Chat", sub: "Coming soon", onPress: undefined },
              { icon: "phone-call" as const, label: "Call Support", sub: "Coming soon", onPress: undefined },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.contactRow,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed && item.onPress ? 0.75 : item.onPress ? 1 : 0.5 },
                ]}
              >
                <View style={[styles.contactIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name={item.icon} size={18} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.contactSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                </View>
                {item.onPress && <Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>REPORT A PROBLEM</Text>
          <View style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {submitted ? (
              <View style={{ alignItems: "center", padding: 24, gap: 12 }}>
                <View style={[styles.successIcon, { backgroundColor: colors.successLight }]}>
                  <Feather name="check-circle" size={32} color={colors.creditGreen} />
                </View>
                <Text style={[styles.successTitle, { color: colors.foreground }]}>Ticket Submitted!</Text>
                <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
                  We'll get back to you within 24 hours.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 16, padding: 16 }}>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Subject</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Brief description of your issue"
                    placeholderTextColor={colors.mutedForeground}
                    value={subject}
                    onChangeText={setSubject}
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Description</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Please describe the issue in detail..."
                    placeholderTextColor={colors.mutedForeground}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.submitBtn,
                    { backgroundColor: subject && description ? colors.gold : colors.secondary, opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={handleSubmit}
                  disabled={!subject.trim() || !description.trim()}
                >
                  <Feather name="send" size={16} color={subject && description ? "#FFF" : colors.mutedForeground} />
                  <Text style={[styles.submitBtnText, { color: subject && description ? "#FFF" : colors.mutedForeground }]}>
                    Submit Ticket
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  heroCard: {
    alignItems: "center", padding: 24, borderRadius: 18, borderWidth: 1,
    marginBottom: 24, gap: 10,
  },
  heroIcon: {
    width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center",
  },
  heroTitle: { color: "#D4AF37", fontSize: 20, fontFamily: "Inter_700Bold" },
  heroSub: { color: "rgba(212,175,55,0.6)", fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10,
  },
  faqItem: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  faqHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  faqQuestion: { fontSize: 14, fontFamily: "Inter_500Medium" },
  faqAnswer: {
    fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20,
    padding: 16, paddingTop: 12, borderTopWidth: 1,
  },
  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  contactIcon: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  contactSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  reportCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  textInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
    height: 48, fontSize: 14, fontFamily: "Inter_400Regular",
  },
  textArea: {
    borderWidth: 1, borderRadius: 10, padding: 14,
    minHeight: 100, fontSize: 14, fontFamily: "Inter_400Regular",
  },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 50, borderRadius: 12,
  },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  successIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
