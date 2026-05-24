import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const BRAND = "#f97316";
const BG    = "#09090e";
const BG2   = "#0e0e15";
const TEXT1 = "#f0f0f8";
const TEXT3 = "#484860";
const BORDER = "rgba(255,255,255,0.07)";

export default function DashboardScreen() {
  const router = useRouter();

  const stats = [
    { label: "XP Earned",   value: "0",    icon: "⚡" },
    { label: "Solved",      value: "0",    icon: "✅" },
    { label: "Streak",      value: "0🔥",  icon: "🔥" },
    { label: "Rank",        value: "Bronze", icon: "🥉" },
  ];

  const quickActions = [
    { label: "Practice",    icon: "⚔️",  route: "/arena" },
    { label: "Interview",   icon: "🤖",  route: "/interview" },
    { label: "Missions",    icon: "🎯",  route: "/internships" },
    { label: "Tracks",      icon: "📚",  route: "/tracks" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning! 👋</Text>
          <Text style={styles.subtitle}>Ready to level up today?</Text>
        </View>

        {/* XP Progress */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>XP Progress</Text>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: "0%" }]} />
          </View>
          <Text style={[styles.smallText, { marginTop: 4 }]}>0 / 1000 XP to Silver Developer</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map(a => (
            <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => router.push(a.route as never)}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { padding: 20, paddingBottom: 40 },
  header:       { marginBottom: 20 },
  greeting:     { fontSize: 24, fontWeight: "800", color: TEXT1 },
  subtitle:     { fontSize: 14, color: TEXT3, marginTop: 4 },
  card:         { backgroundColor: BG2, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 16 },
  cardLabel:    { fontSize: 12, fontWeight: "700", color: TEXT3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  xpBarBg:      { height: 6, borderRadius: 3, backgroundColor: "#14141c", overflow: "hidden" },
  xpBarFill:    { height: "100%", borderRadius: 3, backgroundColor: BRAND },
  smallText:    { fontSize: 11, color: TEXT3 },
  statsGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard:     { flex: 1, minWidth: "45%", backgroundColor: BG2, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, alignItems: "center" },
  statIcon:     { fontSize: 22, marginBottom: 6 },
  statValue:    { fontSize: 18, fontWeight: "800", color: BRAND },
  statLabel:    { fontSize: 11, color: TEXT3, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: TEXT1, marginBottom: 12 },
  actionsGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard:   { flex: 1, minWidth: "45%", backgroundColor: BG2, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, alignItems: "center" },
  actionIcon:   { fontSize: 28, marginBottom: 8 },
  actionLabel:  { fontSize: 12, fontWeight: "700", color: TEXT1 },
});
