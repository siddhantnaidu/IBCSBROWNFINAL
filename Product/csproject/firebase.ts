import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_WIQSfBJeCTtG3mevKpV33rRLBK5hgfQ",
  authDomain: "brownaifinal.firebaseapp.com",
  projectId: "brownaifinal",
  storageBucket: "brownaifinal.firebasestorage.app",
  messagingSenderId: "341617334725",
  appId: "1:341617334725:web:3a0bd48638ab64ba73d3ac",
  measurementId: "G-F4GLFK3R33"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { auth, db };
export default app;
