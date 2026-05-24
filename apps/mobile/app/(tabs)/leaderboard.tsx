import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BRAND  = "#f97316";
const BG     = "#09090e";
const BG2    = "#0e0e15";
const TEXT1  = "#f0f0f8";
const TEXT3  = "#484860";
const BORDER = "rgba(255,255,255,0.07)";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/leaderboard?limit=50`)
      .then(r => r.json())
      .then(d => setEntries(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard 🏆</Text>
        <Text style={styles.subtitle}>Top coders ranked by XP</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={BRAND} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>
                {index < 3 ? MEDALS[index] : `#${index + 1}`}
              </Text>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.username as string)?.[0]?.toUpperCase() ?? "?"}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.username as string}</Text>
                <Text style={styles.rankBadge}>{item.rank as string}</Text>
              </View>
              <Text style={styles.xp}>{(item.total_xp as number)?.toLocaleString()} XP</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:     { padding: 20, paddingBottom: 12 },
  title:      { fontSize: 22, fontWeight: "800", color: "#f0f0f8" },
  subtitle:   { fontSize: 13, color: TEXT3, marginTop: 2 },
  row:        { flexDirection: "row", alignItems: "center", backgroundColor: BG2, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 8, gap: 10 },
  rank:       { width: 30, fontSize: 16, textAlign: "center" },
  avatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(249,115,22,0.15)", borderWidth: 1.5, borderColor: "rgba(249,115,22,0.3)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "700", color: BRAND },
  info:       { flex: 1 },
  name:       { fontSize: 14, fontWeight: "700", color: "#f0f0f8" },
  rankBadge:  { fontSize: 10, color: TEXT3, marginTop: 1 },
  xp:         { fontSize: 12, fontWeight: "700", color: BRAND },
});
