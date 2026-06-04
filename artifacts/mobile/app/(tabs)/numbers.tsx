import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { NexusLogo } from "@/components/NexusLogo";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface PhoneNumber {
  id: number;
  number: string;
  label: string | null;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

function formatNumber(n: string): string {
  const cleaned = n.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return n;
}

export default function NumbersScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { token } = useAuth();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [actionTarget, setActionTarget] = useState<number | null>(null);

  const { data: numbers = [], isLoading, refetch } = useQuery<PhoneNumber[]>({
    queryKey: ["phone-numbers"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/phone-numbers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok ? res.json() : [];
    },
    enabled: !!token,
  });

  const setDefault = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE_URL}/api/phone-numbers/${id}/default`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to set default");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["phone-numbers"] }),
  });

  const removeNumber = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE_URL}/api/phone-numbers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove number");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["phone-numbers"] }),
  });

  const handleRemove = (id: number, number: string) => {
    Alert.alert(
      "Remove Number",
      `Remove ${formatNumber(number)} from your account?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeNumber.mutate(id),
        },
      ]
    );
  };

  const handleAction = (phone: PhoneNumber) => {
    const options: Array<{ text: string; onPress?: () => void; style?: "cancel" | "destructive" }> = [
      {
        text: phone.isDefault ? "Already Default" : "Set as Default",
        onPress: phone.isDefault ? undefined : () => setDefault.mutate(phone.id),
      },
      {
        text: "Remove Number",
        style: "destructive",
        onPress: () => handleRemove(phone.id, phone.number),
      },
      { text: "Cancel", style: "cancel" },
    ];
    Alert.alert(formatNumber(phone.number), "Choose an action", options);
  };

  const primary = numbers.find((n) => n.isDefault);
  const secondary = numbers.filter((n) => !n.isDefault);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <NexusLogo size="xs" showWordmark />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Numbers</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.gold }]}
          onPress={() => router.push("/numbers/add")}
        >
          <Feather name="plus" size={16} color="#FFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: "#0D0A1E", borderColor: "#2A1A4E" }]}>
          <View style={styles.summaryRing} />
          <View style={[styles.summaryIcon, { backgroundColor: "#1A0A2E" }]}>
            <Feather name="phone" size={24} color="#A78BFA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Phone Number Hub</Text>
            <Text style={styles.summarySub}>
              {numbers.length} linked number{numbers.length !== 1 ? "s" : ""} · Your financial identity
            </Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
        ) : numbers.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.goldLight }]}>
              <Feather name="phone-off" size={28} color={colors.gold} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No linked numbers</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Link a phone number to use it as a financial identity layer across Nexus.
            </Text>
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: colors.gold }]}
              onPress={() => router.push("/numbers/add")}
            >
              <Feather name="plus" size={16} color="#FFF" />
              <Text style={styles.emptyBtnText}>Link Your First Number</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {primary && (
              <>
                <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>PRIMARY NUMBER</Text>
                <NumberCard
                  phone={primary}
                  colors={colors}
                  onAction={() => handleAction(primary)}
                />
              </>
            )}

            {secondary.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>SECONDARY NUMBERS</Text>
                {secondary.map((phone) => (
                  <NumberCard
                    key={phone.id}
                    phone={phone}
                    colors={colors}
                    onAction={() => handleAction(phone)}
                  />
                ))}
              </>
            )}

            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="info" size={16} color={colors.gold} style={{ marginTop: 1 }} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                Linked numbers can be used to receive and send money, identify yourself to other Nexus users, and manage your financial identity.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function NumberCard({ phone, colors, onAction }: {
  phone: PhoneNumber;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  onAction: () => void;
}) {
  return (
    <View style={[styles.numberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.numberIcon, { backgroundColor: "#1A0A2E" }]}>
        <Feather name="phone" size={20} color="#A78BFA" />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Text style={[styles.numberText, { color: colors.foreground }]}>
            {formatNumber(phone.number)}
          </Text>
          {phone.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
          {phone.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.successLight }]}>
              <Feather name="check-circle" size={10} color={colors.creditGreen} />
              <Text style={[styles.verifiedText, { color: colors.creditGreen }]}>Verified</Text>
            </View>
          )}
        </View>
        {phone.label && (
          <Text style={[styles.numberLabel, { color: colors.mutedForeground }]}>{phone.label}</Text>
        )}
      </View>
      <Pressable
        style={({ pressed }) => [styles.moreBtn, { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 }]}
        onPress={onAction}
      >
        <Feather name="more-vertical" size={18} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  addBtnText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 18, borderRadius: 18, borderWidth: 1, marginBottom: 24, overflow: "hidden",
  },
  summaryRing: {
    position: "absolute", top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 20, borderColor: "rgba(167,139,250,0.08)",
  },
  summaryIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  summaryTitle: { color: "#A78BFA", fontSize: 16, fontFamily: "Inter_700Bold" },
  summarySub: { color: "rgba(167,139,250,0.6)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  groupLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 1, marginBottom: 10, marginTop: 4,
  },
  numberCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 8,
  },
  numberIcon: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
  },
  numberText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  numberLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  defaultBadge: {
    backgroundColor: "rgba(167,139,250,0.15)",
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  defaultBadgeText: { color: "#A78BFA", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  verifiedText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  moreBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  emptyCard: {
    borderRadius: 20, borderWidth: 1, padding: 32,
    alignItems: "center", gap: 12, marginTop: 8,
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 13, borderRadius: 14, marginTop: 8,
  },
  emptyBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  infoCard: {
    flexDirection: "row", gap: 10, padding: 14,
    borderRadius: 12, borderWidth: 1, marginTop: 16,
  },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
