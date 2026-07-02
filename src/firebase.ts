import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyDHBzsbz8TxCkEZDS9Dq5lxxgia-wBE-AM",
  authDomain: "gen-lang-client-0311401695.firebaseapp.com",
  projectId: "gen-lang-client-0311401695",
  storageBucket: "gen-lang-client-0311401695.firebasestorage.app",
  messagingSenderId: "1058970557308",
  appId: "1:1058970557308:web:6392a776e6ab20b89ae2f9"
};

const app = initializeApp(firebaseConfig);

// We must target the custom database ID provisioned for this applet
export const db = getFirestore(app, "ai-studio-telvox-994325ae-5902-4d52-9523-8624178d5809");

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
