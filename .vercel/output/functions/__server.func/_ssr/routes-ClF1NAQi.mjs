import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth, t as AuthProvider } from "./auth-context-Dj2eZIgJ.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { c as ShieldAlert, g as LoaderCircle, h as LogIn, m as LogOut, s as ShieldCheck } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-ClF1NAQi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
var Dashboard = (0, import_react.lazy)(() => import("./Dashboard-CAAMAJ55.mjs").then((m) => ({ default: m.Dashboard })));
function FullScreenLoader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen grid place-items-center bg-slate-950",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-fuchsia-500" })
	});
}
function NotAuthorizedScreen() {
	const { user, logout } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 shadow-2xl shadow-red-500/30 mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-7 w-7 text-white" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-bold text-white",
					children: "No tienes acceso"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-slate-400",
					children: [
						"La cuenta ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-200",
							children: user?.email
						}),
						" inició sesión correctamente, pero no está autorizada para usar el panel admin."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: async () => {
						await logout();
						toast.success("Sesión cerrada");
					},
					className: "mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Cerrar sesión"]
				})
			]
		})
	});
}
function Gate() {
	const { user, loading, isAdmin } = useAuth();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullScreenLoader, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginScreen, {});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotAuthorizedScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullScreenLoader, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {})
	});
}
function ClientApp() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setHydrated(true), []);
	if (!hydrated) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		position: "top-right",
		richColors: true
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gate, {})] });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientApp, {});
//#endregion
export { SplitComponent as component };
