"use client"

import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native"
import { Camera } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import { generateFlashcardsFromImage } from "../../lib/openai"
import { createDeck } from "../../lib/firebase-service"
import { useAuth } from "../../hooks/useAuth"
import type { Flashcard } from "../../types"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function Generate() {
  const [loading, setLoading] = useState(false)
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([])
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [deckTitle, setDeckTitle] = useState("")
  const { user } = useAuth()

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera permission is required to take photos of your notes.")
      return false
    }
    return true
  }

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission()
    if (!hasPermission) return

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    })

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri)
      // The base64 data is available in result.assets[0].base64
      if (result.assets[0].base64) {
        await handleGenerateFromImage(result.assets[0].base64)
      }
    }
  }

  const selectFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    })

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri)
      if (result.assets[0].base64) {
        await handleGenerateFromImage(result.assets[0].base64)
      }
    }
  }

  const handleGenerateFromImage = async (base64Image: string) => {
    setLoading(true)
    try {
      const flashcards = await generateFlashcardsFromImage(base64Image)
      setGeneratedCards(flashcards)

      // Auto-generate a title based on the content
      if (flashcards.length > 0) {
        setDeckTitle(`Notes from ${new Date().toLocaleDateString()}`)
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate flashcards from image")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDeck = async () => {
    if (!user || generatedCards.length === 0) return

    try {
      const deckData = {
        title: deckTitle || `Notes from ${new Date().toLocaleDateString()}`,
        description: `Flashcards generated from captured notes`,
        userId: user.uid,
        flashcards: generatedCards,
        createdAt: new Date(),
        totalCards: generatedCards.length,
      }

      await createDeck(deckData)
      Alert.alert("Success", "Deck saved successfully!")

      // Reset form
      setCapturedImage(null)
      setGeneratedCards([])
      setDeckTitle("")
    } catch (error) {
      Alert.alert("Error", "Failed to save deck")
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setGeneratedCards([])
    setDeckTitle("")
  }

  if (loading) {
    return <LoadingSpinner message="Analyzing your notes with AI..." />
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.backgroundGradient} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.headerIcon}>📸</Text>
          </View>
          <Text style={styles.title}>Capture Your Notes</Text>
          <Text style={styles.subtitle}>Take a photo of your notes and let AI create flashcards</Text>
        </View>

        {!capturedImage ? (
          <View style={styles.cameraSection}>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>How it works:</Text>
              <Text style={styles.instructionText}>
                1. Take a clear photo of your handwritten or printed notes{"\n"}
                2. AI will analyze the content{"\n"}
                3. Flashcards will be automatically generated{"\n"}
                4. Review and save your deck
              </Text>
            </View>

            <View style={styles.cameraButtons}>
              <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                <View style={styles.cameraButtonIcon}>
                  <Text style={styles.cameraButtonEmoji}>📷</Text>
                </View>
                <Text style={styles.cameraButtonText}>Take Photo</Text>
                <Text style={styles.cameraButtonSubtext}>Use camera to capture notes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.galleryButton} onPress={selectFromGallery}>
                <View style={styles.galleryButtonIcon}>
                  <Text style={styles.galleryButtonEmoji}>🖼️</Text>
                </View>
                <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
                <Text style={styles.galleryButtonSubtext}>Select existing photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.imagePreviewSection}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: capturedImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                <Text style={styles.retakeButtonText}>📷 Retake Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {generatedCards.length > 0 && (
          <View style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Generated {generatedCards.length} Flashcards</Text>
              <View style={styles.successBadge}>
                <Text style={styles.successText}>Ready!</Text>
              </View>
            </View>

            <View style={styles.cardsPreview}>
              {generatedCards.slice(0, 3).map((card, index) => (
                <View key={card.id} style={[styles.previewCard, { transform: [{ rotate: `${(index - 1) * 2}deg` }] }]}>
                  <Text style={styles.previewCardFront}>{card.front}</Text>
                  <View style={styles.cardDivider} />
                  <Text style={styles.previewCardBack}>{card.back}</Text>
                </View>
              ))}
            </View>

            {generatedCards.length > 3 && (
              <Text style={styles.moreCards}>+{generatedCards.length - 3} more cards...</Text>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveDeck}>
              <Text style={styles.saveButtonText}>💾 Save Deck</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    height: 300,
    backgroundColor: "#1B5E20",
    opacity: 0.05,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
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
  cameraSection: {
    gap: 16,
  },
  instructionCard: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    marginBottom: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F9FAFB",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: "#B0B0B0",
    lineHeight: 18,
  },
  cameraButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: "#1B5E20",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraButtonIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#2E7D32",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cameraButtonEmoji: {
    fontSize: 18,
  },
  cameraButtonText: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  cameraButtonSubtext: {
    color: "#B0B0B0",
    fontSize: 12,
    textAlign: "center",
  },
  galleryButton: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  galleryButtonIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#3A3A3A",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  galleryButtonEmoji: {
    fontSize: 18,
  },
  galleryButtonText: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  galleryButtonSubtext: {
    color: "#B0B0B0",
    fontSize: 12,
    textAlign: "center",
  },
  imagePreviewSection: {
    marginBottom: 20,
  },
  imageContainer: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  retakeButton: {
    backgroundColor: "#3A3A3A",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  retakeButtonText: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
  },
  previewSection: {
    marginTop: 30,
    padding: 24,
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F9FAFB",
  },
  successBadge: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  successText: {
    color: "#F9FAFB",
    fontSize: 12,
    fontWeight: "600",
  },
  cardsPreview: {
    alignItems: "center",
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: "#3A3A3A",
    padding: 16,
    borderRadius: 12,
    marginBottom: -8,
    width: "90%",
    borderWidth: 1,
    borderColor: "#4A4A4A",
  },
  previewCardFront: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F9FAFB",
    marginBottom: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#4A4A4A",
    marginVertical: 8,
  },
  previewCardBack: {
    fontSize: 14,
    color: "#B0B0B0",
  },
  moreCards: {
    textAlign: "center",
    color: "#B0B0B0",
    fontStyle: "italic",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#2E7D32",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
  },
})
