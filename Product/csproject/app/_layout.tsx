import { useEffect } from "react"
import { Stack, useRouter, useSegments } from "expo-router"
import { useAuth } from "../hooks/useAuth"
import LoadingSpinner from "../components/LoadingSpinner"

export default function RootLayout() {
  const { user, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === "auth"

    if (!user && !inAuthGroup) {
      router.replace("/auth/login" as any)
    } else if (user && segments[0] !== "(tabs)") {
      router.replace("/(tabs)/generate" as any)
    }
  }, [user, loading, segments])

  if (loading) {
    return <LoadingSpinner message="Loading app..." />
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen
        name="deck/[id]"
        options={{
          title: "Study Session",
          headerStyle: { backgroundColor: "#4F46E5" },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
    </Stack>
  )
}