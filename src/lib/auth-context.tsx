import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type AuthError,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase } from "./firebase";
import { isAdminEmail } from "./admin";

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

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = (err as AuthError).code;
      const accountMissing = code === "auth/user-not-found" || code === "auth/invalid-credential";
      // Auto-provisión: si el email está en la lista de admins y la cuenta no
      // existe todavía, se crea con la contraseña indicada (evita tener que
      // crearla a mano desde la consola de Firebase).
      if (!accountMissing || !isAdminEmail(email)) throw err;
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (createErr) {
        if ((createErr as AuthError).code === "auth/email-already-in-use") {
          throw new Error("La cuenta existe pero la contraseña no coincide");
        }
        throw createErr;
      }
    }

    if (!auth.currentUser?.email) {
      throw new Error("No se pudo identificar la cuenta");
    }
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