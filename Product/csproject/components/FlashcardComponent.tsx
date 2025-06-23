import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native"

// Define the Flashcard type if it doesn't exist
export interface Flashcard {
  front: string
  back: string
  id?: string | number
}

interface FlashcardComponentProps {
  flashcards?: Flashcard[]
  onComplete?: () => void
}

const { width } = Dimensions.get("window")

export default function FlashcardComponent({ flashcards = [], onComplete }: FlashcardComponentProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Reset to question side when card changes
  useEffect(() => {
    setIsFlipped(false)
  }, [currentIndex])

  // Reset index if flashcards change
  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [flashcards])

  // Safety check for flashcards
  if (!flashcards || flashcards.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No flashcards available</Text>
          <Text style={styles.emptySubtext}>Please add some flashcards to get started</Text>
        </View>
      </View>
    )
  }

  const currentFlashcard = flashcards[currentIndex]
  
  // Additional safety check for current flashcard
  if (!currentFlashcard) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Invalid flashcard data</Text>
        </View>
      </View>
    )
  }

  const hasNext = currentIndex < flashcards.length - 1
  const hasPrevious = currentIndex > 0

  const toggleCard = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1)
    } else if (onComplete) {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const resetToStart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {flashcards.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex + 1) / flashcards.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Flashcard */}
      <TouchableOpacity onPress={toggleCard} style={styles.cardContainer} activeOpacity={0.8}>
        <View style={[styles.card, isFlipped ? styles.cardBack : styles.cardFront]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>
              {isFlipped ? "Answer" : "Question"}
            </Text>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>
              {isFlipped ? (currentFlashcard.back || "No answer provided") : (currentFlashcard.front || "No question provided")}
            </Text>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={styles.tapHint}>
              {isFlipped ? "Tap to see question" : "Tap to reveal answer"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.navButton, styles.previousButton, !hasPrevious && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={!hasPrevious}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButtonText, !hasPrevious && styles.navButtonTextDisabled]}>
              ← Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>
              {hasNext ? "Next →" : "Complete"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reset Button */}
        {currentIndex > 0 && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToStart}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Start Over</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  progressContainer: {
    width: width - 40,
    marginBottom: 20,
  },
  progressText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 2,
  },
  cardContainer: {
    width: width - 40,
    height: 240,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    padding: 24,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardFront: {
    backgroundColor: "#6366F1",
  },
  cardBack: {
    backgroundColor: "#059669",
  },
  cardHeader: {
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  cardText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    lineHeight: 28,
  },
  cardFooter: {
    alignItems: "center",
  },
  tapHint: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
  navigationContainer: {
    marginTop: 24,
    width: width - 40,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previousButton: {
    backgroundColor: "#6B7280",
  },
  nextButton: {
    backgroundColor: "#374151",
  },
  navButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  navButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    color: "#D1D5DB",
  },
  resetButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  resetButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
})