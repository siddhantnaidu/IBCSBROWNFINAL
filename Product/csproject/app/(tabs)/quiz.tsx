import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native"
import { useAuth } from "../../hooks/useAuth"
import { getUserDecks, saveQuizResult } from "../../lib/firebase-service"
import type { Deck, Flashcard } from "../../types"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function Quiz() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState<Flashcard[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadDecks()
  }, [user])

  const loadDecks = async () => {
    if (!user) return

    try {
      const userDecks = await getUserDecks(user.uid)
      setDecks(userDecks.filter((deck) => deck.totalCards >= 4))
    } catch (error) {
      Alert.alert("Error", "Failed to load decks")
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = (deck: Deck) => {
    const shuffledCards = [...deck.flashcards].sort(() => Math.random() - 0.5)

    setSelectedDeck(deck)
    setQuizQuestions(shuffledCards)
    setCurrentQuestion(0)
    setScore(0)
    setQuizCompleted(false)
    setShowResult(false)
    setSelectedAnswer(null)
  }

  const generateOptions = (correctAnswer: string, allCards: Flashcard[]) => {
    const wrongAnswers = allCards
      .filter((card) => card.back !== correctAnswer)
      .map((card) => card.back)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)
    return options
  }

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)

    if (answer === quizQuestions[currentQuestion].back) {
      setScore(score + 10)
    }

    setTimeout(() => {
      if (currentQuestion + 1 < quizQuestions.length) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        completeQuiz()
      }
    }, 1500)
  }

  const completeQuiz = async () => {
    setQuizCompleted(true)

    if (selectedDeck && user) {
      try {
        const finalScore = score + (selectedAnswer === quizQuestions[currentQuestion].back ? 10 : 0)
        await saveQuizResult({
          deckId: selectedDeck.id,
          score: finalScore,
          totalQuestions: quizQuestions.length,
          maxScore: quizQuestions.length * 10,
          completedAt: new Date(),
        })
      } catch (error) {
        console.error("Failed to save quiz result:", error)
      }
    }
  }

  const resetQuiz = () => {
    setSelectedDeck(null)
    setQuizQuestions([])
    setCurrentQuestion(0)
    setScore(0)
    setQuizCompleted(false)
    setShowResult(false)
    setSelectedAnswer(null)
  }

  if (loading) {
    return <LoadingSpinner message="Loading quiz options..." />
  }

  if (decks.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>🧠</Text>
        </View>
        <Text style={styles.emptyTitle}>No Quiz Available</Text>
        <Text style={styles.emptySubtitle}>
          You need at least 4 flashcards in a deck to take a quiz. Create more flashcards first!
        </Text>
      </View>
    )
  }

  if (!selectedDeck) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.backgroundGradient} />
        
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.headerIcon}>🧠</Text>
          </View>
          <Text style={styles.title}>Quiz Challenge</Text>
          <Text style={styles.subtitle}>Test your knowledge • 10 points per correct answer</Text>
        </View>

        <View style={styles.deckList}>
          {decks.map((deck, index) => (
            <TouchableOpacity 
              key={deck.id} 
              style={[styles.deckOption, { transform: [{ scale: 1 - index * 0.01 }] }]} 
              onPress={() => startQuiz(deck)}
            >
              <View style={styles.deckInfo}>
                <Text style={styles.deckTitle}>{deck.title}</Text>
                <Text style={styles.deckDetails}>
                  {deck.totalCards} questions • Max Score: {deck.totalCards * 10} points
                </Text>
              </View>
              <View style={styles.startQuizButton}>
                <Text style={styles.startQuizText}>Start →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    )
  }

  if (quizCompleted) {
    const finalScore = score + (selectedAnswer === quizQuestions[currentQuestion]?.back ? 10 : 0)
    const maxScore = quizQuestions.length * 10
    const percentage = Math.round((finalScore / maxScore) * 100)

    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultIconContainer}>
          <Text style={styles.resultIcon}>🎉</Text>
        </View>
        
        <Text style={styles.resultTitle}>Quiz Complete!</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.resultScore}>{finalScore}</Text>
          <Text style={styles.resultMaxScore}>/ {maxScore}</Text>
        </View>
        
        <Text style={styles.resultSubtitle}>points</Text>
        
        <View style={styles.percentageContainer}>
          <Text style={styles.resultPercentage}>{percentage}%</Text>
        </View>

        <View style={styles.scoreBreakdown}>
          <Text style={styles.breakdownText}>
            {Math.floor(finalScore / 10)} correct out of {quizQuestions.length} questions
          </Text>
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.retryButton} onPress={() => startQuiz(selectedDeck)}>
            <Text style={styles.retryButtonText}>🔄 Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={resetQuiz}>
            <Text style={styles.backButtonText}>← Back to Decks</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const currentCard = quizQuestions[currentQuestion]
  const options = generateOptions(currentCard.back, selectedDeck.flashcards)
  const maxScore = quizQuestions.length * 10
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  return (
    <View style={styles.quizContainer}>
      <View style={styles.quizHeader}>
        <Text style={styles.progress}>
          Question {currentQuestion + 1} of {quizQuestions.length}
        </Text>
        <View style={styles.scoreDisplay}>
          <Text style={styles.currentScore}>{score}/{maxScore}</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.question}>{currentCard.front}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const getButtonStyle = () => {
            if (showResult && selectedAnswer === option) {
              if (option === currentCard.back) {
                return [styles.optionButton, styles.correctOption]
              } else {
                return [styles.optionButton, styles.wrongOption]
              }
            } else if (showResult && option === currentCard.back) {
              return [styles.optionButton, styles.correctOption]
            }
            return styles.optionButton
          }

          const getTextStyle = () => {
            if (showResult && selectedAnswer === option) {
              if (option === currentCard.back) {
                return [styles.optionText, styles.correctText]
              } else {
                return [styles.optionText, styles.wrongText]
              }
            } else if (showResult && option === currentCard.back) {
              return [styles.optionText, styles.correctText]
            }
            return styles.optionText
          }

          return (
            <TouchableOpacity
              key={index}
              style={getButtonStyle()}
              onPress={() => !showResult && handleAnswer(option)}
              disabled={showResult}
            >
              <Text style={getTextStyle()}>{option}</Text>
              {showResult && option === currentCard.back && (
                <Text style={styles.correctIndicator}>✓</Text>
              )}
              {showResult && selectedAnswer === option && option !== currentCard.back && (
                <Text style={styles.wrongIndicator}>✗</Text>
              )}
            </TouchableOpacity>
          )
        })}
      </View>
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
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#2A2A2A",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  headerIcon: {
    fontSize: 24,
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
  deckList: {
    padding: 20,
    paddingTop: 0,
  },
  deckOption: {
    backgroundColor: "#2A2A2A",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  deckDetails: {
    fontSize: 14,
    color: "#B0B0B0",
  },
  startQuizButton: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startQuizText: {
    fontSize: 16,
    color: "#F9FAFB",
    fontWeight: "600",
  },
  quizContainer: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    padding: 20,
  },
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progress: {
    fontSize: 16,
    color: "#B0B0B0",
  },
  scoreDisplay: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  currentScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#3A3A3A",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#B0B0B0",
    fontWeight: "600",
  },
  questionCard: {
    backgroundColor: "#2A2A2A",
    padding: 30,
    borderRadius: 20,
    marginBottom: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F9FAFB",
    textAlign: "center",
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#2A2A2A",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#F9FAFB",
    flex: 1,
  },
  correctOption: {
    backgroundColor: "#1B5E20",
    borderColor: "#2E7D32",
  },
  correctText: {
    color: "#F9FAFB",
    fontWeight: "600",
  },
  correctIndicator: {
    fontSize: 18,
    color: "#F9FAFB",
    fontWeight: "bold",
  },
  wrongOption: {
    backgroundColor: "#B71C1C",
    borderColor: "#D32F2F",
  },
  wrongText: {
    color: "#F9FAFB",
    fontWeight: "600",
  },
  wrongIndicator: {
    fontSize: 18,
    color: "#F9FAFB",
    fontWeight: "bold",
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 40,
  },
  resultIconContainer: {
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
  resultIcon: {
    fontSize: 40,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F9FAFB",
    marginBottom: 20,
    textAlign: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  resultMaxScore: {
    fontSize: 24,
    color: "#B0B0B0",
    marginLeft: 4,
  },
  resultSubtitle: {
    fontSize: 18,
    color: "#B0B0B0",
    marginBottom: 16,
  },
  percentageContainer: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  resultPercentage: {
    fontSize: 24,
    color: "#2E7D32",
    fontWeight: "bold",
  },
  scoreBreakdown: {
    marginBottom: 40,
  },
  breakdownText: {
    fontSize: 16,
    color: "#B0B0B0",
    textAlign: "center",
  },
  resultActions: {
    gap: 16,
    width: "100%",
  },
  retryButton: {
    backgroundColor: "#1B5E20",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#2A2A2A",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  backButtonText: {
    color: "#2E7D32",
    fontSize: 16,
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
    lineHeight: 24,
  },
})