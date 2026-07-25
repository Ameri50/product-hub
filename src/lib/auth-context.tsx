import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase } from "./firebase";

// Helper to determine admin emails. You can set a comma-separated list of
// admin emails in NEXT_PUBLIC_ADMIN_EMAILS env var (e.g. "a@x.com,b@y.com").
const ADMIN_EMAILS = new Set(
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.size > 0 ? ADMIN_EMAILS.has(email) : false;
}

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
      if (!isAdminEmail(u.email)) return;

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

  const isAdmin = isAdminEmail(user?.email);

  return (
    <Ctx.Provider value={{ user, loading, isAdmin, signIn, logout }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return v;
}