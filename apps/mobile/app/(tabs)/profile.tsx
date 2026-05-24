import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const BRAND  = "#f97316";
const BG     = "#09090e";
const BG2    = "#0e0e15";
const TEXT1  = "#f0f0f8";
const TEXT3  = "#484860";
const BORDER = "rgba(255,255,255,0.07)";

export default function ProfileScreen() {
  const router = useRouter();

  const menuItems = [
    { icon: "📊", label: "My Stats",          route: null },
    { icon: "🏅", label: "Achievements",       route: null },
    { icon: "📜", label: "My Submissions",     route: null },
    { icon: "⚙️",  label: "Account Settings",  route: null },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <Text style={styles.name}>Upgradian User</Text>
          <Text style={styles.rank}>🥉 Bronze Coder</Text>
        </View>

        {/* XP Card */}
        <View style={styles.xpCard}>
          <View style={styles.xpRow}>
            <View style={styles.xpStat}>
              <Text style={styles.xpValue}>0</Text>
              <Text style={styles.xpLabel}>Total XP</Text>
            </View>
            <View style={styles.xpDivider} />
            <View style={styles.xpStat}>
              <Text style={styles.xpValue}>0</Text>
              <Text style={styles.xpLabel}>Solved</Text>
            </View>
            <View style={styles.xpDivider} />
            <View style={styles.xpStat}>
              <Text style={styles.xpValue}>0🔥</Text>
              <Text style={styles.xpLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem}
              onPress={() => item.route ? router.push(item.route as never) : Alert.alert("Coming soon")}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOut} onPress={() => router.push("/login" as never)}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { padding: 20, paddingBottom: 40 },
  avatarWrap:  { alignItems: "center", marginBottom: 20 },
  avatar:      { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(249,115,22,0.15)", borderWidth: 2, borderColor: "rgba(249,115,22,0.3)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText:  { fontSize: 32, fontWeight: "800", color: BRAND },
  name:        { fontSize: 20, fontWeight: "800", color: TEXT1 },
  rank:        { fontSize: 13, color: TEXT3, marginTop: 4 },
  xpCard:      { backgroundColor: BG2, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 20 },
  xpRow:       { flexDirection: "row", justifyContent: "space-around" },
  xpStat:      { alignItems: "center" },
  xpValue:     { fontSize: 20, fontWeight: "800", color: BRAND },
  xpLabel:     { fontSize: 11, color: TEXT3, marginTop: 2 },
  xpDivider:   { width: 1, backgroundColor: BORDER },
  menu:        { backgroundColor: BG2, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden", marginBottom: 16 },
  menuItem:    { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  menuIcon:    { fontSize: 18, marginRight: 12 },
  menuLabel:   { flex: 1, fontSize: 14, fontWeight: "600", color: TEXT1 },
  menuArrow:   { fontSize: 20, color: TEXT3 },
  signOut:     { borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 14, padding: 14, alignItems: "center" },
  signOutText: { color: "#ef4444", fontWeight: "700", fontSize: 14 },
});
