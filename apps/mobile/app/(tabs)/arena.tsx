import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const BRAND  = "#f97316";
const BG     = "#09090e";
const BG2    = "#0e0e15";
const TEXT1  = "#f0f0f8";
const TEXT2  = "#8888a0";
const TEXT3  = "#484860";
const BORDER = "rgba(255,255,255,0.07)";

const DIFF_COLORS: Record<string, string> = {
  easy:   "#22c55e",
  medium: "#eab308",
  hard:   "#ef4444",
};

export default function ArenaScreen() {
  const router  = useRouter();
  const [challenges, setChallenges] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/challenges?limit=50`)
      .then(r => r.json())
      .then(d => setChallenges(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = challenges.filter(c =>
    !search || (c.title as string).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search challenges…"
          placeholderTextColor={TEXT3}
          style={styles.search}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={BRAND} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id as string}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/arena/${item.slug}` as never)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title as string}</Text>
                <View style={[styles.badge, { backgroundColor: (DIFF_COLORS[item.difficulty as string] ?? "#888") + "20", borderColor: DIFF_COLORS[item.difficulty as string] ?? "#888" }]}>
                  <Text style={[styles.badgeText, { color: DIFF_COLORS[item.difficulty as string] ?? "#888" }]}>
                    {(item.difficulty as string)?.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.lang}>{item.language as string}</Text>
                <Text style={styles.xp}>⚡ {item.xp_reward as number} XP</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No challenges found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchWrap: { padding: 12, paddingBottom: 4 },
  search:     { backgroundColor: BG2, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 10, color: TEXT1, fontSize: 14 },
  card:       { backgroundColor: BG2, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10 },
  cardTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  cardTitle:  { flex: 1, fontSize: 14, fontWeight: "700", color: TEXT1 },
  badge:      { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText:  { fontSize: 10, fontWeight: "700" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between" },
  lang:       { fontSize: 11, color: TEXT2, fontWeight: "600", textTransform: "uppercase" },
  xp:         { fontSize: 11, color: BRAND, fontWeight: "700" },
  empty:      { textAlign: "center", color: TEXT3, marginTop: 40, fontSize: 14 },
});
