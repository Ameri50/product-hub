import { o as __toESM } from "../_runtime.mjs";
import { a as signOut, i as signInWithEmailAndPassword, r as onAuthStateChanged, t as createUserWithEmailAndPassword } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { f as serverTimestamp, o as setDoc, u as doc } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getFirebase } from "./firebase-nyhvcZA1.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as LoaderCircle, h as LogIn, s as ShieldCheck } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/LoginScreen-C8j4wcIw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ADMIN_EMAILS = [
	"joshuarojas432@gmail.com",
	"promo2026@outlook.com",
	"yo@gmail.com"
];
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
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (err) {
			const code = err.code;
			if (!(code === "auth/user-not-found" || code === "auth/invalid-credential") || !isAdminEmail(email)) throw err;
			try {
				await createUserWithEmailAndPassword(auth, email, password);
			} catch (createErr) {
				if (createErr.code === "auth/email-already-in-use") throw new Error("La cuenta existe pero la contraseña no coincide");
				throw createErr;
			}
		}
		if (!auth.currentUser?.email) throw new Error("No se pudo identificar la cuenta");
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
function LoginScreen() {
	const { signIn } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await signIn(email, password);
			toast.success("Sesión iniciada");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-2xl shadow-fuchsia-500/30 mb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-7 w-7 text-white" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-bold tracking-tight text-white",
						children: "Admin Panel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-slate-400",
						children: "Inicia sesión para administrar productos"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4 shadow-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium text-slate-300 uppercase tracking-wide",
						children: "Email"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "email",
						required: true,
						autoComplete: "email",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						className: "mt-1 w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-transparent transition",
						placeholder: "tu@email.com"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium text-slate-300 uppercase tracking-wide",
						children: "Contraseña"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						required: true,
						autoComplete: "current-password",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						className: "mt-1 w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-transparent transition",
						placeholder: "••••••••"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						disabled: loading,
						className: "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed",
						children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4" }), "Iniciar sesión"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-500 text-center pt-2",
						children: "Crea usuarios desde la consola de Firebase Authentication"
					})
				]
			})]
		})
	});
}
//#endregion
export { LoginScreen as n, useAuth as r, AuthProvider as t };
