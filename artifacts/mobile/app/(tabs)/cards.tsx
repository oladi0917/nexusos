import React, { useCallback, useState } from "react";
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
import type { NexusCard } from "@/lib/apiClient";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

function getBrandGradient(brand: string): [string, string] {
  if (brand === "VISA") return ["#1A1F6E", "#2E3699"];
  if (brand === "MASTERCARD") return ["#6E1A1A", "#992E2E"];
  return ["#1A4E1A", "#2E7A2E"];
}

function VisualCard({ card, onDelete }: { card: NexusCard; onDelete: () => void }) {
  const [bg1, bg2] = getBrandGradient(card.brand);

  return (
    <View style={[styles.visualCard, { backgroundColor: bg1 }]}>
      {/* Shimmer circles */}
      <View style={[styles.shimmer1, { backgroundColor: bg2 }]} />
      <View style={[styles.shimmer2, { backgroundColor: bg2, opacity: 0.4 }]} />

      {/* Top row */}
      <View style={styles.cardTop}>
        <NexusLogo size="xs" />
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="trash-2" size={15} color="rgba(255,255,255,0.6)" />
        </Pressable>
      </View>

      {/* Card number */}
      <Text style={styles.cardNumber}>
        •••• •••• •••• {card.last4}
      </Text>

      {/* Bottom row */}
      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.cardMeta}>CARDHOLDER</Text>
          <Text style={styles.cardValue}>{card.cardholderName}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.cardMeta}>EXPIRES</Text>
          <Text style={styles.cardValue}>{card.expiresMonth}/{card.expiresYear}</Text>
        </View>
        <Text style={[styles.brandText, { color: card.brand === "VISA" ? "#A8C7FA" : card.brand === "MASTERCARD" ? "#FFAA99" : "#99FFAA" }]}>
          {card.brand}
        </Text>
      </View>
    </View>
  );
}

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { token } = useAuth();
  const qc = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: cards = [], isLoading } = useQuery<NexusCard[]>({
    queryKey: ["cards"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch cards");
      return res.json();
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE_URL}/api/cards/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove card");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });

  const handleDelete = useCallback((card: NexusCard) => {
    Alert.alert(
      "Remove Card",
      `Remove ${card.brand} •••• ${card.last4}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteMutation.mutate(card.id),
        },
      ]
    );
  }, [deleteMutation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <NexusLogo size="xs" showWordmark />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Cards</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/cards/add" as any)}
        >
          <Feather name="plus" size={18} color={colors.gold} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: "#0E0E00", borderColor: "#2A2510" }]}>
          <View style={styles.waveRing} />
          <Text style={[styles.summaryLabel, { color: colors.gold }]}>NEXUS CARDS</Text>
          <Text style={[styles.summaryCount, { color: colors.foreground }]}>
            {isLoading ? "–" : cards.length} card{cards.length !== 1 ? "s" : ""} linked
          </Text>
          <Text style={[styles.summaryHint, { color: colors.mutedForeground }]}>
            Tokenized & secured by Nexus
          </Text>
          <View style={[styles.glowLine, { backgroundColor: colors.gold }]} />
        </View>

        {/* Cards list */}
        <View style={styles.cardsList}>
          {isLoading ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
          ) : cards.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="credit-card" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No cards yet</Text>
              <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
                Add a debit or credit card to fund transfers and view activity.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.emptyBtn, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push("/cards/add" as any)}
              >
                <Text style={styles.emptyBtnText}>Add Card</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {cards.map((card) => (
                <VisualCard
                  key={card.id}
                  card={card}
                  onDelete={() => handleDelete(card)}
                />
              ))}
              {/* Add another card */}
              <Pressable
                style={({ pressed }) => [styles.addAnotherBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                onPress={() => router.push("/cards/add" as any)}
              >
                <Feather name="plus" size={16} color={colors.mutedForeground} />
                <Text style={[styles.addAnotherText, { color: colors.mutedForeground }]}>Add Another Card</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Security note */}
        <View style={[styles.secNote, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shield" size={16} color={colors.gold} />
          <Text style={[styles.secNoteText, { color: colors.mutedForeground }]}>
            Card numbers are never stored. Only the last 4 digits are retained for identification.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { paddingTop: 4 },

  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    overflow: "hidden",
    marginBottom: 24,
  },
  waveRing: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 24,
    borderColor: "rgba(212,175,55,0.08)",
  },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.4, marginBottom: 8 },
  summaryCount: { fontSize: 32, fontFamily: "Inter_700Bold", marginBottom: 4 },
  summaryHint: { fontSize: 13, fontFamily: "Inter_400Regular" },
  glowLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.4,
  },

  cardsList: { paddingHorizontal: 20, gap: 16, marginBottom: 20 },

  visualCard: {
    borderRadius: 18,
    padding: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  shimmer1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.3,
  },
  shimmer2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardNumber: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
    marginBottom: 20,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  cardMeta: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  brandText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },

  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 36,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyHint: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  emptyBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyBtnText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  addAnotherBtn: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addAnotherText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  secNote: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  secNoteText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
});
