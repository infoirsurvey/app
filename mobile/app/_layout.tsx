import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Login' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="survey/[id]" options={{ title: 'Survey Form' }} />
      <Stack.Screen name="report/[id]" options={{ title: 'Report Viewer' }} />
    </Stack>
  );
}
