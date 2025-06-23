"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native"
import { useAuth } from "../../hooks/useAuth"
import { getUserDecks, updateDeckLastStudied } from "../../lib/firebase-service"
import type { Deck } from "../../types"
import LoadingSpinner from "../../components/LoadingSpinner"
import { useRouter } from "expo-router"

export default function Study() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadDecks()
  }, [user])

  const loadDecks = async () => {
    if (!user) return

    try {
      const userDecks = await getUserDecks(user.uid)
      setDecks(userDecks)
    } catch (error) {
      Alert.alert("Error", "Failed to load decks")
    } finally {
      setLoading(false)
    }
  }

  const handleStudyDeck = async (deck: Deck) => {
    try {
      await updateDeckLastStudied(deck.id)
      ;(router as any).push(`/deck/${deck.id}`)
    } catch (error) {
      Alert.alert("Error", "Failed to start study session")
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Never"
    return date.toLocaleDateString()
  }

  const renderDeckItem = ({ item, index }: { item: Deck; index: number }) => {
    return (
      <TouchableOpacity
        style={[styles.deckCard, { transform: [{ scale: 1 - index * 0.01 }] }]}
        onPress={() => handleStudyDeck(item)}
      >
        <View style={styles.deckHeader}>
          <View style={styles.deckTitleContainer}>
            <Text style={styles.deckTitle}>{item.title}</Text>
          </View>
          <View style={styles.cardCountBadge}>
            <Text style={styles.cardCount}>{item.totalCards}</Text>
          </View>
        </View>

        <Text style={styles.deckDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.deckFooter}>
          <View style={styles.lastStudiedContainer}>
            <Text style={styles.lastStudiedLabel}>Last studied</Text>
            <Text style={styles.lastStudied}>{formatDate(item.lastStudied)}</Text>
          </View>
          <View style={styles.studyButton}>
            <Text style={styles.studyButtonText}>Study →</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return <LoadingSpinner message="Loading your decks..." />
  }

  if (decks.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
        </View>
        <Text style={styles.emptyTitle}>No Study Decks Yet</Text>
        <Text style={styles.emptySubtitle}>Create your first deck in the Generate tab to start studying!</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            ;(router as any).push("/(tabs)")
            setTimeout(() => {
              ;(router as any).push("/generate")
            }, 100)
          }}
        >
          <Text style={styles.createButtonText}>✨ Create First Deck</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <View style={styles.header}>
        <Text style={styles.title}>Your Study Decks</Text>
        <Text style={styles.subtitle}>
          Choose a deck to start studying • {decks.length} deck{decks.length !== 1 ? "s" : ""} available
        </Text>
      </View>

      <FlatList
        data={decks}
        renderItem={renderDeckItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
    height: 200,
    backgroundColor: "#1B5E20",
    opacity: 0.05,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  header: {
    padding: 20,
    alignItems: "center",
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
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  deckCard: {
    backgroundColor: "#2A2A2A",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deckHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deckTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F9FAFB",
    flex: 1,
  },
  cardCountBadge: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cardCount: {
    fontSize: 14,
    color: "#F9FAFB",
    fontWeight: "600",
  },
  deckDescription: {
    fontSize: 14,
    color: "#B0B0B0",
    marginBottom: 16,
    lineHeight: 20,
  },
  deckFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastStudiedContainer: {
    flex: 1,
  },
  lastStudiedLabel: {
    fontSize: 12,
    color: "#808080",
    marginBottom: 2,
  },
  lastStudied: {
    fontSize: 14,
    color: "#B0B0B0",
    fontWeight: "500",
  },
  studyButton: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  studyButtonText: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#2A2A2A",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F9FAFB",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#B0B0B0",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
  },
})
