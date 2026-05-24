import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerStyle:      { backgroundColor: "#09090e" },
        headerTintColor:  "#f0f0f8",
        headerTitleStyle: { fontWeight: "800" },
        contentStyle:     { backgroundColor: "#09090e" },
      }}>
        <Stack.Screen name="(tabs)"  options={{ headerShown: false }} />
        <Stack.Screen name="login"   options={{ title: "Sign In" }} />
        <Stack.Screen name="arena/[slug]" options={{ title: "Challenge" }} />
      </Stack>
    </>
  );
}
