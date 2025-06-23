"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../../hooks/useAuth"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      // The useAuth hook and _layout.tsx will handle the redirect automatically
    } catch (error: any) {
      Alert.alert("Login Failed", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.decorativeTop} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>📚</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#808080"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#808080"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Signing In..." : "Sign In"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/signup" as any)}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Sign up</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.decorativeBottom} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  decorativeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "#1B5E20",
    opacity: 0.1,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  decorativeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: "#2E7D32",
    opacity: 0.05,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#2A2A2A",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  logo: {
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F9FAFB",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#B0B0B0",
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    backgroundColor: "#2A2A2A",
    padding: 18,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    color: "#F9FAFB",
  },
  button: {
    backgroundColor: "#1B5E20",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    textAlign: "center",
    color: "#B0B0B0",
    fontSize: 16,
    marginTop: 20,
  },
  linkAccent: {
    color: "#2E7D32",
    fontWeight: "600",
  },
})