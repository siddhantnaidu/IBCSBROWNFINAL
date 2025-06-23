export interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: "easy" | "medium" | "hard"
  lastReviewed?: Date
  reviewCount: number
}

export interface Deck {
  id: string
  title: string
  description: string
  userId: string
  flashcards: Flashcard[]
  createdAt: Date
  lastStudied?: Date
  totalCards: number
}

export interface UserProgress {
  userId: string
  totalDecks: number
  totalCards: number
  studyStreak: number
  lastStudyDate?: Date
  accuracyRate: number
}

export interface QuizResult {
  deckId: string
  score: number
  totalQuestions: number
  completedAt: Date
  maxScore: number
}
