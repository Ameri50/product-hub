import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase } from "./firebase";

type AuthCtx = {
  user: User | null;
  loading: boolean;
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
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const { auth } = getFirebase();
    if (!auth) return;
    await signOut(auth);
  };

  return <Ctx.Provider value={{ user, loading, signIn, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return v;
}
