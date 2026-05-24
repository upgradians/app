import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const BRAND = "#f97316";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: BRAND,
      tabBarInactiveTintColor: "#6b7280",
      tabBarStyle: { backgroundColor: "#0e0e15", borderTopColor: "rgba(255,255,255,0.07)" },
      headerStyle: { backgroundColor: "#09090e" },
      headerTintColor: "#f0f0f8",
      headerTitleStyle: { fontWeight: "800" },
    }}>
      <Tabs.Screen name="index" options={{
        title: "Dashboard",
        tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
      }} />
      <Tabs.Screen name="arena" options={{
        title: "Arena",
        tabBarIcon: ({ color, size }) => <Ionicons name="code-slash" size={size} color={color} />,
      }} />
      <Tabs.Screen name="leaderboard" options={{
        title: "Ranks",
        tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
