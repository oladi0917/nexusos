import { Redirect } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, Platform, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

const ND = Platform.OS !== "web";
const BG = "#050505";
const GOLD = "#C9A84C";

function AnimatedSplash() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.78)).current;
  const pulse1Scale = useRef(new Animated.Value(1)).current;
  const pulse1Opacity = useRef(new Animated.Value(0.7)).current;
  const pulse2Scale = useRef(new Animated.Value(1)).current;
  const pulse2Opacity = useRef(new Animated.Value(0.5)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: ND,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: ND,
      }),
    ]).start();

    const loopPulse1 = Animated.loop(
      Animated.parallel([
        Animated.timing(pulse1Scale, {
          toValue: 2.2,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: ND,
        }),
        Animated.timing(pulse1Opacity, {
          toValue: 0,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: ND,
        }),
      ])
    );

    const loopPulse2 = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(pulse2Scale, {
            toValue: 2.2,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: ND,
          }),
          Animated.timing(pulse2Opacity, {
            toValue: 0,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: ND,
          }),
        ]),
      ])
    );

    const loopBreathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.06,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: ND,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: ND,
        }),
      ])
    );

    const loopShimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: ND,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: ND,
        }),
      ])
    );

    loopPulse1.start();
    loopPulse2.start();
    loopBreathe.start();
    loopShimmer.start();

    return () => {
      loopPulse1.stop();
      loopPulse2.stop();
      loopBreathe.stop();
      loopShimmer.stop();
    };
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.badge, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <Animated.View
          style={[styles.pulseRing, { transform: [{ scale: pulse1Scale }], opacity: pulse1Opacity }]}
        />
        <Animated.View
          style={[styles.pulseRing, { transform: [{ scale: pulse2Scale }], opacity: pulse2Opacity }]}
        />
        <View style={styles.glowHalo} />
        <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
          <Image
            source={require("@/assets/images/nexus-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.wordmarkWrap, { opacity: fadeAnim }]}>
        <Animated.Text style={[styles.wordmark, { opacity: shimmerOpacity }]}>
          NEXUS
        </Animated.Text>
        <Text style={styles.tagline}>CONNECTED FINANCE. SIMPLIFIED.</Text>
      </Animated.View>

      <Animated.View style={[styles.dots, { opacity: fadeAnim }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  pulseRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  glowHalo: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "transparent",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 20,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 20,
  },
  wordmarkWrap: {
    alignItems: "center",
    gap: 6,
  },
  wordmark: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: 10,
  },
  tagline: {
    color: GOLD,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2.5,
  },
  dots: {
    position: "absolute",
    bottom: 56,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#333",
  },
  dotActive: {
    width: 18,
    height: 5,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
});

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AnimatedSplash />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
