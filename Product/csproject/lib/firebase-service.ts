import { db } from "../firebase"
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore"
import type { Deck, QuizResult } from "../types"

export const createDeck = async (deck: Omit<Deck, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "decks"), {
      ...deck,
      createdAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating deck:", error)
    throw error
  }
}

export const getUserDecks = async (userId: string): Promise<Deck[]> => {
  try {
    const q = query(collection(db, "decks"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          lastStudied: doc.data().lastStudied?.toDate(),
        }) as Deck,
    )
  } catch (error) {
    console.error("Error fetching decks:", error)
    throw error
  }
}

export const updateDeckLastStudied = async (deckId: string) => {
  try {
    const deckRef = doc(db, "decks", deckId)
    await updateDoc(deckRef, {
      lastStudied: new Date(),
    })
  } catch (error) {
    console.error("Error updating deck:", error)
    throw error
  }
}

export const deleteDeck = async (deckId: string) => {
  try {
    await deleteDoc(doc(db, "decks", deckId))
  } catch (error) {
    console.error("Error deleting deck:", error)
    throw error
  }
}

export const saveQuizResult = async (result: QuizResult) => {
  try {
    await addDoc(collection(db, "quizResults"), {
      ...result,
      completedAt: new Date(),
    })
  } catch (error) {
    console.error("Error saving quiz result:", error)
    throw error
  }
}
