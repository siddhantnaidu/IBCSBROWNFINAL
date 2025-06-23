import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Alert, SafeAreaView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useAuth } from "../../hooks/useAuth"
import { getUserDecks } from "../../lib/firebase-service"
import type { Deck } from "../../types"
import FlashcardComponent from "../../components/FlashcardComponent"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function DeckStudy() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadDeck()
  }, [id, user])

  const loadDeck = async () => {
    if (!user || !id) return

    try {
      const userDecks = await getUserDecks(user.uid)
      const foundDeck = userDecks.find((d) => d.id === id)

      if (!foundDeck) {
        Alert.alert("Error", "Deck not found")
        router.back()
        return
      }

      setDeck(foundDeck)
    } catch (error) {
      Alert.alert("Error", "Failed to load deck")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleStudyComplete = () => {
    Alert.alert(
      "Study Complete!", 
      `You've reviewed all ${deck!.flashcards.length} cards in this deck. Great job!`,
      [
        { 
          text: "Study Again", 
          onPress: () => {
            // Force re-render of FlashcardComponent by updating the key
            setDeck({ ...deck! })
          }
        },
        { 
          text: "Back to Decks", 
          onPress: () => router.back() 
        },
      ]
    )
  }

  if (loading) {
    return <LoadingSpinner message="Loading deck..." />
  }

  if (!deck || !deck.flashcards || deck.flashcards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>No Flashcards Found</Text>
          <Text style={styles.errorText}>
            This deck appears to be empty or there was an error loading the flashcards.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.deckTitle}>{deck.title}</Text>
        {deck.description && (
          <Text style={styles.deckDescription}>{deck.description}</Text>
        )}
      </View>

      <FlashcardComponent 
        flashcards={deck.flashcards}
        onComplete={handleStudyComplete}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  deckTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  deckDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
})