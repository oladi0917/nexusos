import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";

/* ─── Tab definition ─── */
interface TabDef {
  name: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  sfDefault?: string;
  sfFocused?: string;
  hidden?: boolean;
}

const TABS: TabDef[] = [
  { name: "index", title: "Home", icon: "home", sfDefault: "house", sfFocused: "house.fill" },
  { name: "finances", title: "Finances", icon: "bar-chart-2", sfDefault: "chart.bar", sfFocused: "chart.bar.fill" },
  { name: "transactions", title: "Transactions", icon: "list", sfDefault: "list.bullet.rectangle", sfFocused: "list.bullet.rectangle.fill" },
  { name: "social", title: "Social", icon: "users", sfDefault: "person.2", sfFocused: "person.2.fill" },
  { name: "profile", title: "Profile", icon: "user", sfDefault: "person", sfFocused: "person.fill" },
  { name: "accounts", title: "Accounts", icon: "link", sfDefault: "creditcard", sfFocused: "creditcard.fill" },
  { name: "cards", title: "Cards", icon: "credit-card", sfDefault: "wallet.pass", sfFocused: "wallet.pass.fill" },
  { name: "numbers", title: "Numbers", icon: "phone", sfDefault: "phone", sfFocused: "phone.fill" },
  { name: "send", title: "Send", icon: "send", hidden: true },
];

const VISIBLE_TABS = TABS.filter((t) => !t.hidden);

/* ─── Custom scrollable tab bar ─── */
function CustomTabBar({ state, descriptors, navigation }: any) {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View
      style={[
        tabStyles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          borderTopColor: colors.border,
          backgroundColor: isIOS ? "transparent" : colors.card,
        },
      ]}
    >
      {isIOS && (
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      )}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tabStyles.scrollContent}
        decelerationRate="fast"
      >
        {state.routes.map((route: any, index: number) => {
          const tabDef = TABS.find((t) => t.name === route.name);
          if (!tabDef || tabDef.hidden) return null;

          const isFocused = state.index === index;
          const color = isFocused ? colors.gold : colors.mutedForeground;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                tabStyles.tab,
                { opacity: pressed ? 0.75 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tabDef.title}
            >
              <Feather name={tabDef.icon} size={21} color={color} />
              <Text style={[tabStyles.label, { color }]}>{tabDef.title}</Text>
              {isFocused && (
                <View style={[tabStyles.activeDot, { backgroundColor: colors.gold }]} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ─── Native Tab Layout (iOS Liquid Glass) ─── */
function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="finances">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Finances</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="transactions">
        <Icon sf={{ default: "list.bullet.rectangle", selected: "list.bullet.rectangle.fill" }} />
        <Label>Transactions</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="social">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>Social</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

/* ─── Classic Tab Layout (web / Android) ─── */
function ClassicTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            href: tab.hidden ? null : undefined,
            tabBarIcon: ({ color, focused }) =>
              Platform.OS === "ios" && tab.sfDefault ? (
                <SymbolView
                  name={(focused ? tab.sfFocused! : tab.sfDefault) as any}
                  tintColor={color}
                  size={22}
                />
              ) : (
                <Feather name={tab.icon} size={21} color={color} />
              ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const tabStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    overflow: "hidden",
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    minWidth: 64,
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },
});
