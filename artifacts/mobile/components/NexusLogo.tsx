import React from "react";
import { Image, StyleSheet, View, Text } from "react-native";

const GOLD = "#C9A84C";

interface Props {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showTagline?: boolean;
  center?: boolean;
}

const DIM: Record<NonNullable<Props["size"]>, number> = {
  xs: 24,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 96,
};

export function NexusLogo({
  size = "md",
  showWordmark = false,
  showTagline = false,
  center = false,
}: Props) {
  const dim = DIM[size];

  return (
    <View style={[styles.root, center && styles.centered]}>
      <Image
        source={require("@/assets/images/nexus-logo.png")}
        style={{ width: dim, height: dim, borderRadius: dim * 0.18 }}
        resizeMode="contain"
      />
      {showWordmark && (
        <View style={center ? styles.wordmarkCenter : styles.wordmarkRow}>
          <Text style={[styles.wordmark, { fontSize: dim * 0.38 }]}>NEXUS</Text>
          {showTagline && (
            <Text style={[styles.tagline, { fontSize: dim * 0.16 }]}>
              CONNECTED FINANCE. SIMPLIFIED.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  centered: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  wordmarkRow: {
    justifyContent: "center",
  },
  wordmarkCenter: {
    alignItems: "center",
  },
  wordmark: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
  },
  tagline: {
    color: GOLD,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginTop: 2,
  },
});
