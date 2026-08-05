import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase } from "./firebase";
import { isAdminEmail } from "./admin";

const ALLOWED_ADMIN_EMAILS = ["joshuarojas432@gmail.com", "promo2026@outlook.com"];

type AuthCtx = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth, db } = getFirebase();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      if (!u || !db) return;

      // Solo se guarda/actualiza el perfil en Firestore si el usuario
      // es un admin conocido. Un usuario cualquiera que inicie sesión
      // (por ejemplo, con una cuenta de la app móvil) no debe poder
      // escribir en "users" desde este panel.
      if (!u.email || !ALLOWED_ADMIN_EMAILS.includes(u.email.toLowerCase())) return;

      await setDoc(
        doc(db, "users", u.uid),
        {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName ?? u.email?.split("@")[0] ?? "Usuario",
          photoURL: u.photoURL ?? null,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        },
        { merge: true },
      );
    });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    const { auth } = getFirebase();
    if (!auth) throw new Error("Firebase no está listo");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.email) {
      throw new Error("No se pudo identificar la cuenta");
    }
  };

  const logout = async () => {
    const { auth } = getFirebase();
    if (!auth) return;
    await signOut(auth);
  };

  const isAdmin = Boolean(user?.email && ALLOWED_ADMIN_EMAILS.includes(user.email.toLowerCase()));

  return (
    <Ctx.Provider value={{ user, loading, isAdmin, signIn, logout }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return v;
}