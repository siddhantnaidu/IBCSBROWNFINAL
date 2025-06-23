import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#808080",
        tabBarStyle: {
          backgroundColor: "#1A1A1A",
          borderTopWidth: 1,
          borderTopColor: "#3A3A3A",
        },
        headerStyle: {
          backgroundColor: "#1A1A1A",
        },
        headerTintColor: "#F9FAFB",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="generate"
        options={{
          title: "Generate",
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "Study",
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: "Quiz",
          tabBarIcon: ({ color, size }) => <Ionicons name="help-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}