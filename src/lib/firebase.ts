import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk",
  authDomain: "miapp-4a216.firebaseapp.com",
  projectId: "miapp-4a216",
  storageBucket: "miapp-4a216.firebasestorage.app",
  messagingSenderId: "553513944411",
  appId: "1:553513944411:web:c4b3592357220c9f63c67e",
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function getFirebase() {
  if (typeof window === "undefined") {
    // Firebase Auth usa IndexedDB; solo inicializar en el navegador.
    return { app: null, db: null, auth: null } as {
      app: FirebaseApp | null;
      db: Firestore | null;
      auth: Auth | null;
    };
  }
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    _db = getFirestore(_app);
    _auth = getAuth(_app);
  }
  return { app: _app, db: _db!, auth: _auth! };
}