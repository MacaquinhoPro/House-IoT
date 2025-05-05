import { AuthProvider } from "../context/AuthContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  
  return (
    <AuthProvider>
      <Stack
        screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="auth"/>
        <Stack.Screen name="(app)"/>
        <Stack.Screen name="index"/>
      </Stack>
    </AuthProvider>
  )
}