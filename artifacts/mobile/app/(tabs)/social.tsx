import React, { useState } from "react";
import {
  Alert,
  Linking,
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
import { useColors } from "@/hooks/useColors";
import { NexusLogo } from "@/components/NexusLogo";

/* ─── Mock Data ─── */
const JOINT_SAVINGS = [
  { id: 1, name: "Vacation Fund", target: 500000, current: 120000, members: 3, color: "#1A1F6E" },
  { id: 2, name: "Emergency Fund", target: 1000000, current: 450000, members: 5, color: "#1A4E1A" },
];

const OSUSU_GROUPS = [
  { id: 1, name: "Office Ajo", members: 10, amount: 10000, frequency: "Monthly", nextPayout: "Jul 15", position: 3 },
  { id: 2, name: "Family Thrift", members: 6, amount: 25000, frequency: "Monthly", nextPayout: "Jun 30", position: 1 },
];

const SUGGESTED_FRIENDS = [
  { id: 1, name: "Adaeze Okonkwo", phone: "0803***4512", mutual: 2 },
  { id: 2, name: "Emeka Chukwu", phone: "0812***8834", mutual: 1 },
  { id: 3, name: "Fatima Sule", phone: "0701***2267", mutual: 4 },
];

const SOCIAL_ACTIONS = [
  { icon: "send" as const, label: "Send Money", color: "#1A3A6E", coming: false },
  { icon: "download" as const, label: "Request", color: "#1A4E1A", coming: false },
  { icon: "divide-circle" as const, label: "Split Bill", color: "#6E1A1A", coming: true },
  { icon: "users" as const, label: "Group Pay", color: "#1A3A4E", coming: true },
];

function formatBalance(n: number) {
  return n.toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

/* ─── Section Header ─── */
function SectionHeader({ title, icon, subtitle }: { title: string; icon: keyof typeof Feather.glyphMap; subtitle?: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: colors.goldLight }]}>
        <Feather name={icon} size={16} color={colors.gold} />
      </View>
      <View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle && <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
    </View>
  );
}

/* ─── Joint Savings Card ─── */
function JointSavingsCard({ item, colors }: { item: typeof JOINT_SAVINGS[0]; colors: ReturnType<typeof useColors> }) {
  const progress = item.current / item.target;
  return (
    <View style={[styles.savingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.savingsIcon, { backgroundColor: item.color }]}>
        <Feather name="target" size={18} color="#FFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.savingsName, { color: colors.foreground }]}>{item.name}</Text>
        <View style={styles.savingsProgress}>
          <View style={[styles.progressBar, { backgroundColor: colors.secondary }]}>
            <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` as any, backgroundColor: colors.gold }]} />
          </View>
          <Text style={[styles.progressPct, { color: colors.gold }]}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={[styles.savingsAmt, { color: colors.mutedForeground }]}>₦{formatBalance(item.current)}</Text>
          <Text style={[styles.savingsAmt, { color: colors.mutedForeground }]}>₦{formatBalance(item.target)}</Text>
        </View>
      </View>
      <View style={[styles.membersChip, { backgroundColor: colors.secondary }]}>
        <Feather name="users" size={10} color={colors.mutedForeground} />
        <Text style={[styles.membersText, { color: colors.mutedForeground }]}>{item.members}</Text>
      </View>
    </View>
  );
}

/* ─── Osusu Card ─── */
function OsusuCard({ item, colors }: { item: typeof OSUSU_GROUPS[0]; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.osusuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.osusuHeader}>
        <View style={[styles.osusuIcon, { backgroundColor: colors.goldLight }]}>
          <Feather name="rotate-cw" size={16} color={colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.osusuName, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.osusuSub, { color: colors.mutedForeground }]}>{item.members} members · {item.frequency}</Text>
        </View>
        <View style={[styles.osusuPosition, { backgroundColor: colors.goldLight }]}>
          <Text style={[styles.osusuPositionText, { color: colors.gold }]}>#{item.position}</Text>
        </View>
      </View>
      <View style={[styles.osusuFooter, { borderTopColor: colors.border }]}>
        <View style={styles.osusuStat}>
          <Text style={[styles.osusuStatLabel, { color: colors.mutedForeground }]}>Contribution</Text>
          <Text style={[styles.osusuStatValue, { color: colors.foreground }]}>₦{formatBalance(item.amount)}</Text>
        </View>
        <View style={[styles.osusuDivider, { backgroundColor: colors.border }]} />
        <View style={styles.osusuStat}>
          <Text style={[styles.osusuStatLabel, { color: colors.mutedForeground }]}>Next Payout</Text>
          <Text style={[styles.osusuStatValue, { color: colors.creditGreen }]}>{item.nextPayout}</Text>
        </View>
      </View>
    </View>
  );
}

/* ─── Friend Card ─── */
function FriendCard({ item, colors }: { item: typeof SUGGESTED_FRIENDS[0]; colors: ReturnType<typeof useColors> }) {
  const [added, setAdded] = useState(false);
  const initials = item.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={[styles.friendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.friendAvatar, { backgroundColor: colors.gold }]}>
        <Text style={styles.friendInitials}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.friendName, { color: colors.foreground }]}>{item.name}</Text>
        <Text style={[styles.friendPhone, { color: colors.mutedForeground }]}>{item.phone}</Text>
        <Text style={[styles.friendMutual, { color: colors.mutedForeground }]}>{item.mutual} mutual connection{item.mutual !== 1 ? "s" : ""}</Text>
      </View>
      <Pressable
        onPress={() => { Haptics.selectionAsync().catch(() => {}); setAdded((v) => !v); }}
        style={({ pressed }) => [
          styles.addFriendBtn,
          { backgroundColor: added ? colors.secondary : colors.gold, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name={added ? "check" : "user-plus"} size={14} color={added ? colors.mutedForeground : "#FFF"} />
      </Pressable>
    </View>
  );
}

/* ─── Invite Flow ─── */
function InviteSection({ colors }: { colors: ReturnType<typeof useColors> }) {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!phone.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSent(true);
    setTimeout(() => { setSent(false); setPhone(""); }, 2500);
  };

  return (
    <View style={[styles.inviteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {sent ? (
        <View style={{ alignItems: "center", paddingVertical: 12, gap: 8 }}>
          <Feather name="check-circle" size={28} color={colors.creditGreen} />
          <Text style={[styles.inviteSentText, { color: colors.foreground }]}>Invitation Sent!</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <Text style={[styles.inviteDesc, { color: colors.mutedForeground }]}>
            Invite friends to join Nexus via their phone number.
          </Text>
          <View style={[styles.inviteInput, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="phone" size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.inviteField, { color: colors.foreground }]}
              placeholder="Enter phone number"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={14}
            />
          </View>
          <Pressable
            onPress={handleSend}
            style={({ pressed }) => [
              styles.inviteBtn,
              { backgroundColor: phone.trim() ? colors.gold : colors.secondary, opacity: pressed ? 0.85 : 1 },
            ]}
            disabled={!phone.trim()}
          >
            <Feather name="send" size={14} color={phone.trim() ? "#FFF" : colors.mutedForeground} />
            <Text style={[styles.inviteBtnText, { color: phone.trim() ? "#FFF" : colors.mutedForeground }]}>
              Send Invite
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ─── Main Screen ─── */
export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [showCreateSavings, setShowCreateSavings] = useState(false);
  const [showCreateOsusu, setShowCreateOsusu] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <NexusLogo size="xs" showWordmark />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Social Finance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={[styles.heroBanner, { backgroundColor: "#0D0A1E", borderColor: "#2A1A4E" }]}>
          <View style={styles.heroRing} />
          <View style={[styles.heroIcon, { backgroundColor: "#1A0A2E" }]}>
            <Feather name="users" size={28} color="#A78BFA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Social Finance</Text>
            <Text style={styles.heroSub}>Save together. Pay together. Grow together.</Text>
          </View>
        </View>

        {/* Social Payments */}
        <View style={styles.section}>
          <SectionHeader title="Social Payments" icon="zap" subtitle="Quick financial interactions" />
          <View style={styles.actionsGrid}>
            {SOCIAL_ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => {
                  if (action.coming) {
                    Alert.alert("Coming Soon", `${action.label} will be available soon!`);
                  }
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Feather name={action.icon} size={20} color="#FFF" />
                </View>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
                {action.coming && (
                  <View style={[styles.soonChip, { backgroundColor: colors.goldLight }]}>
                    <Text style={[styles.soonText, { color: colors.gold }]}>Soon</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Joint Savings */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader title="Joint Savings" icon="target" subtitle="Shared savings goals" />
            <Pressable
              style={[styles.createBtn, { backgroundColor: colors.gold }]}
              onPress={() => setShowCreateSavings(true)}
            >
              <Feather name="plus" size={14} color="#FFF" />
              <Text style={styles.createBtnText}>Create</Text>
            </Pressable>
          </View>
          {JOINT_SAVINGS.map((item) => (
            <JointSavingsCard key={item.id} item={item} colors={colors} />
          ))}
          {showCreateSavings && (
            <View style={[styles.createForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.createFormTitle, { color: colors.foreground }]}>Create Savings Goal</Text>
              {["Goal Name", "Target Amount", "Invite Members"].map((placeholder) => (
                <TextInput
                  key={placeholder}
                  style={[styles.formInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
                  placeholder={placeholder}
                  placeholderTextColor={colors.mutedForeground}
                />
              ))}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  style={[styles.formBtn, { backgroundColor: colors.secondary, flex: 1 }]}
                  onPress={() => setShowCreateSavings(false)}
                >
                  <Text style={[styles.formBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.formBtn, { backgroundColor: colors.gold, flex: 1 }]}
                  onPress={() => { setShowCreateSavings(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); Alert.alert("Goal Created!", "Your joint savings goal has been created."); }}
                >
                  <Text style={[styles.formBtnText, { color: "#FFF" }]}>Create Goal</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Osusu / Ajo */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader title="Osusu / Ajo" icon="rotate-cw" subtitle="Rotating savings groups" />
            <Pressable
              style={[styles.createBtn, { backgroundColor: colors.gold }]}
              onPress={() => setShowCreateOsusu(true)}
            >
              <Feather name="plus" size={14} color="#FFF" />
              <Text style={styles.createBtnText}>Join / Create</Text>
            </Pressable>
          </View>
          {OSUSU_GROUPS.map((item) => (
            <OsusuCard key={item.id} item={item} colors={colors} />
          ))}
          {showCreateOsusu && (
            <View style={[styles.createForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.createFormTitle, { color: colors.foreground }]}>Create Ajo Group</Text>
              {["Group Name", "Contribution Amount", "Number of Members", "Frequency (Monthly/Weekly)"].map((p) => (
                <TextInput
                  key={p}
                  style={[styles.formInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
                  placeholder={p}
                  placeholderTextColor={colors.mutedForeground}
                />
              ))}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable style={[styles.formBtn, { backgroundColor: colors.secondary, flex: 1 }]} onPress={() => setShowCreateOsusu(false)}>
                  <Text style={[styles.formBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.formBtn, { backgroundColor: colors.gold, flex: 1 }]}
                  onPress={() => { setShowCreateOsusu(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); Alert.alert("Group Created!", "Your Ajo group has been created. Invite members to join."); }}
                >
                  <Text style={[styles.formBtnText, { color: "#FFF" }]}>Create Group</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Nexus Friends */}
        <View style={styles.section}>
          <SectionHeader title="Nexus Friends" icon="user-plus" subtitle="Connect with other Nexus users" />
          {SUGGESTED_FRIENDS.map((friend) => (
            <FriendCard key={friend.id} item={friend} colors={colors} />
          ))}
        </View>

        {/* Invite Friends */}
        <View style={styles.section}>
          <SectionHeader title="Invite Friends" icon="share-2" subtitle="Grow your Nexus network" />
          <InviteSection colors={colors} />
        </View>

        {/* Shared Wallet Teaser */}
        <View style={[styles.teaserCard, { backgroundColor: "#0D0A1E", borderColor: "#2A1A4E" }]}>
          <Feather name="layers" size={22} color="#A78BFA" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.teaserTitle, { color: "#A78BFA" }]}>Shared Wallets</Text>
            <Text style={styles.teaserSub}>Create wallets shared with friends and family — coming soon.</Text>
          </View>
          <View style={[styles.soonChip, { backgroundColor: "rgba(167,139,250,0.1)" }]}>
            <Text style={[styles.soonText, { color: "#A78BFA" }]}>Soon</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  content: { padding: 20, paddingBottom: 110 },
  heroBanner: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 18, borderRadius: 18, borderWidth: 1, marginBottom: 24, overflow: "hidden",
  },
  heroRing: {
    position: "absolute", top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 20, borderColor: "rgba(167,139,250,0.08)",
  },
  heroIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  heroTitle: { color: "#A78BFA", fontSize: 18, fontFamily: "Inter_700Bold" },
  heroSub: { color: "rgba(167,139,250,0.6)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { marginBottom: 28 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14, flex: 1 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  sectionSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionBtn: {
    width: "48%" as any, borderRadius: 14, borderWidth: 1,
    padding: 16, alignItems: "center", gap: 8,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  soonChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  soonText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  createBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  createBtnText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  savingsCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
  savingsIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  savingsName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  savingsProgress: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%" as any, borderRadius: 2 },
  progressPct: { fontSize: 11, fontFamily: "Inter_700Bold", minWidth: 28 },
  savingsAmt: { fontSize: 11, fontFamily: "Inter_400Regular" },
  membersChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  membersText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  osusuCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  osusuHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  osusuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  osusuName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  osusuSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  osusuPosition: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  osusuPositionText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  osusuFooter: { flexDirection: "row", borderTopWidth: 1, paddingTop: 10 },
  osusuStat: { flex: 1, alignItems: "center" },
  osusuStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 2 },
  osusuStatValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
  osusuDivider: { width: 1, marginHorizontal: 12 },
  friendCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  friendAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  friendInitials: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
  friendName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  friendPhone: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  friendMutual: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  addFriendBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  inviteCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  inviteDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  inviteInput: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, height: 48,
  },
  inviteField: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  inviteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 48, borderRadius: 10,
  },
  inviteBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inviteSentText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  createForm: { padding: 16, borderRadius: 14, borderWidth: 1, marginTop: 8, gap: 10 },
  createFormTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  formInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, height: 46, fontSize: 14, fontFamily: "Inter_400Regular" },
  formBtn: { height: 46, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  formBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  teaserCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 14, borderWidth: 1,
  },
  teaserTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  teaserSub: { color: "rgba(167,139,250,0.6)", fontSize: 12, fontFamily: "Inter_400Regular" },
});
