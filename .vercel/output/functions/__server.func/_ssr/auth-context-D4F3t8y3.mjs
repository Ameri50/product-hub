import { o as __toESM } from "../_runtime.mjs";
import { i as signOut, n as onAuthStateChanged, r as signInWithEmailAndPassword } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { c as doc, i as setDoc, u as serverTimestamp } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getFirebase } from "./firebase-nyhvcZA1.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-context-D4F3t8y3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ADMIN_EMAILS = ["joshuarojas432@gmail.com"];
function isAdminEmail(email) {
	if (!email) return false;
	const normalized = email.trim().toLowerCase();
	return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}
var Ctx = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const { auth, db } = getFirebase();
		if (!auth) {
			setLoading(false);
			return;
		}
		return onAuthStateChanged(auth, async (u) => {
			setUser(u);
			setLoading(false);
			if (!u || !db) return;
			if (!isAdminEmail(u.email)) return;
			await setDoc(doc(db, "users", u.uid), {
				uid: u.uid,
				email: u.email,
				displayName: u.displayName ?? u.email?.split("@")[0] ?? "Usuario",
				photoURL: u.photoURL ?? null,
				createdAt: serverTimestamp(),
				lastLoginAt: serverTimestamp()
			}, { merge: true });
		});
	}, []);
	const signIn = async (email, password) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value: {
			user,
			loading,
			isAdmin,
			signIn,
			logout
		},
		children
	});
}
function useAuth() {
	const v = (0, import_react.useContext)(Ctx);
	if (!v) throw new Error("useAuth debe usarse dentro de AuthProvider");
	return v;
}
//#endregion
export { useAuth as n, AuthProvider as t };
