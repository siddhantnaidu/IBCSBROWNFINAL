import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useAuth } from "../../hooks/useAuth"
import { getUserDecks } from "../../lib/firebase-service"
import type { Deck } from "../../types"
import LoadingSpinner from "../../components/LoadingSpinner"
import { useRouter } from "expo-router"

export default function Progress() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadProgress()
  }, [user])

  const loadProgress = async () => {
    if (!user) return

    try {
      const userDecks = await getUserDecks(user.uid)
      setDecks(userDecks)
    } catch (error) {
      console.error("Failed to load progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const totalDecks = decks.length
    const totalCards = decks.reduce((sum, deck) => sum + deck.totalCards, 0)
    const studiedDecks = decks.filter((deck) => deck.lastStudied).length

    return { totalDecks, totalCards, studiedDecks }
  }

  const getRecentActivity = () => {
    return decks
      .filter((deck) => deck.lastStudied)
      .sort((a, b) => {
        const dateA = a.lastStudied ? new Date(a.lastStudied).getTime() : 0
        const dateB = b.lastStudied ? new Date(b.lastStudied).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Never"
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("./auth/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading your progress..." />
  }

  const stats = calculateStats()
  const recentActivity = getRecentActivity()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backgroundGradient} />
      
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your learning journey</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.primaryStatCard]}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>📚</Text>
          </View>
          <Text style={styles.statNumber}>{stats.totalDecks}</Text>
          <Text style={styles.statLabel}>Total Decks</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>🃏</Text>
          </View>
          <Text style={styles.statNumber}>{stats.totalCards}</Text>
          <Text style={styles.statLabel}>Total Cards</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>✅</Text>
          </View>
          <Text style={styles.statNumber}>{stats.studiedDecks}</Text>
          <Text style={styles.statLabel}>Decks Studied</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityBadge}>
            <Text style={styles.activityBadgeText}>{recentActivity.length}</Text>
          </View>
        </View>

        {recentActivity.length > 0 ? (
          <View style={styles.activityList}>
            {recentActivity.map((deck, index) => (
              <View key={deck.id} style={[styles.activityItem, { transform: [{ scale: 1 - index * 0.01 }] }]}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityEmoji}>📖</Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{deck.title}</Text>
                  <Text style={styles.activityDate}>Studied {formatDate(deck.lastStudied)}</Text>
                </View>
                <View style={styles.activityStats}>
                  <Text style={styles.cardCount}>{deck.totalCards}</Text>
                  <Text style={styles.cardLabel}>cards</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyActivity}>
            <View style={styles.emptyActivityIcon}>
              <Text style={styles.emptyActivityEmoji}>📊</Text>
            </View>
            <Text style={styles.emptyText}>No study activity yet</Text>
            <Text style={styles.emptySubtext}>Start studying to see your progress here!</Text>
          </View>
        )}
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.accountCard}>
          <View style={styles.accountInfo}>
            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>Signed in as</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: "#1B5E20",
    opacity: 0.05,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#2A2A2A",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  avatar: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F9FAFB",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#B0B0B0",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryStatCard: {
    borderColor: "#2E7D32",
    backgroundColor: "#1B5E20",
    opacity: 0.9,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#B0B0B0",
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F9FAFB",
  },
  activityBadge: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityBadgeText: {
    color: "#F9FAFB",
    fontSize: 12,
    fontWeight: "600",
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#3A3A3A",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 18,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F9FAFB",
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 14,
    color: "#B0B0B0",
  },
  activityStats: {
    alignItems: "center",
  },
  cardCount: {
    fontSize: 18,
    color: "#2E7D32",
    fontWeight: "bold",
  },
  cardLabel: {
    fontSize: 12,
    color: "#B0B0B0",
  },
  emptyActivity: {
    backgroundColor: "#2A2A2A",
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  emptyActivityIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#3A3A3A",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyActivityEmoji: {
    fontSize: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B0B0B0",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#808080",
    textAlign: "center",
  },
  accountCard: {
    backgroundColor: "#2A2A2A",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  accountInfo: {
    marginBottom: 20,
  },
  emailContainer: {
    alignItems: "center",
  },
  emailLabel: {
    fontSize: 14,
    color: "#B0B0B0",
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 16,
    color: "#F9FAFB",
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#B71C1C",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
  },
})