import { o as __toESM } from "../_runtime.mjs";
import "../_libs/firebase.mjs";
import { a as onSnapshot, f as serverTimestamp, l as collection, n as deleteDoc, s as updateDoc, u as doc } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getFirebase } from "./firebase-nyhvcZA1.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { C as Check, S as Clock, T as ArrowLeft, c as ShieldAlert, g as LoaderCircle, l as Search, m as LogOut, n as Users, o as ShoppingBag, p as Package, r as Trash2, t as X, y as History } from "../_libs/lucide-react.mjs";
import { n as LoginScreen, r as useAuth, t as AuthProvider } from "./LoginScreen-C8j4wcIw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/historial-Df2rgK0Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DAY_MS = 1440 * 60 * 1e3;
function HistorialPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		position: "top-right",
		richColors: true
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistorialGate, {})] });
}
function FullScreenLoader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-slate-950",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-fuchsia-500" })
	});
}
function HistorialGate() {
	const { user, loading, isAdmin, logout } = useAuth();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullScreenLoader, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginScreen, {});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 shadow-2xl shadow-red-500/30",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-7 w-7 text-white" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-bold text-white",
					children: "No tienes acceso"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-slate-400",
					children: "El historial del panel está disponible solo para administradores."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => logout(),
					className: "mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:shadow-fuchsia-500/50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Cerrar sesión"]
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistorialContent, {});
}
function HistorialContent() {
	const [orders, setOrders] = (0, import_react.useState)([]);
	const [tab, setTab] = (0, import_react.useState)("reservations");
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const [busyId, setBusyId] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const { db } = getFirebase();
		if (!db) return;
		const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
			const list = snapshot.docs.map((snap) => toOrder(snap.id, snap.data()));
			list.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
			setOrders(list);
		}, (error) => {
			console.error("Error escuchando pedidos:", error);
			toast.error("No se pudo leer el historial", { description: error.message });
		});
		return () => unsubscribe();
	}, []);
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => setNow(Date.now()), 3e4);
		return () => window.clearInterval(timer);
	}, []);
	const reservations = (0, import_react.useMemo)(() => orders.filter((order) => effectiveState(order, now) === "reserved" || effectiveState(order, now) === "expired"), [orders, now]);
	const confirmedOrders = (0, import_react.useMemo)(() => orders.filter((order) => effectiveState(order, now) === "confirmed" || effectiveState(order, now) === "cancelled"), [orders, now]);
	const visible = tab === "reservations" ? reservations : confirmedOrders;
	const hasActiveSearch = query.trim().length > 0;
	const filteredVisible = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return visible;
		return visible.filter((order) => {
			return [
				order.code,
				order.userEmail,
				...order.items.flatMap((item) => [
					item.name,
					item.color ?? "",
					item.storage ?? ""
				])
			].some((value) => value.toLowerCase().includes(needle));
		});
	}, [visible, query]);
	const changeStatus = async (order, status) => {
		const { db } = getFirebase();
		if (!db) return;
		setBusyId(order.id);
		try {
			await updateDoc(doc(db, "orders", order.id), {
				status,
				updatedAt: serverTimestamp()
			});
			toast.success(status === "confirmed" ? "Pedido confirmado" : "Reserva cancelada", { description: `${order.code} se actualizó en la app iOS.` });
		} catch (error) {
			toast.error("No se pudo actualizar", { description: error.message });
		} finally {
			setBusyId(null);
		}
	};
	const removeOrder = async (order) => {
		const { db } = getFirebase();
		if (!db) return;
		if (!window.confirm(`¿Eliminar ${order.code}? También desaparecerá del historial de la app.`)) return;
		setBusyId(order.id);
		try {
			await deleteDoc(doc(db, "orders", order.id));
			toast.success("Registro eliminado");
		} catch (error) {
			toast.error("No se pudo eliminar", { description: error.message });
		} finally {
			setBusyId(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-fuchsia-50/40 dark:from-slate-950 dark:via-indigo-950/40 dark:to-fuchsia-950/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-4 w-4 text-white" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-sm font-bold leading-tight text-slate-900 dark:text-white",
						children: "Historial"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-slate-500 dark:text-slate-400",
						children: "Reservaciones y pedidos de la app"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/catalogo",
							className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800",
							children: "Catálogo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/usuarios",
							className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }), " Usuarios"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Panel"]
						})
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-indigo-600 dark:text-indigo-400",
								children: "Sincronizado con la app iOS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-2xl font-semibold text-slate-900 dark:text-white",
								children: "Reservaciones y pedidos en tiempo real"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300",
								children: "Cada reserva hecha en la app se guarda 24 horas. Si no se confirma en ese plazo vence automáticamente y el stock vuelve a estar disponible."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-white shadow-lg shadow-orange-500/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm opacity-80",
									children: "Reservaciones"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-3xl font-semibold",
									children: reservations.length
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-white shadow-lg shadow-emerald-500/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm opacity-80",
									children: "Pedidos"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-3xl font-semibold",
									children: confirmedOrders.length
								})]
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex w-full max-w-md rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setTab("reservations"),
							className: `flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === "reservations" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" }),
								" Reservaciones (",
								reservations.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setTab("orders"),
							className: `flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === "orders" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-4 w-4" }),
								" Pedidos (",
								confirmedOrders.length,
								")"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative w-full md:max-w-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "search",
								value: query,
								onChange: (event) => setQuery(event.target.value),
								placeholder: "Buscar por código, producto o correo",
								className: "w-full rounded-xl border border-slate-200 bg-white/90 py-2 pl-9 pr-9 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
							}),
							hasActiveSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setQuery(""),
								title: "Limpiar búsqueda",
								className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})
						]
					})]
				}),
				filteredVisible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center dark:border-white/10 dark:bg-slate-900/40",
					children: [
						hasActiveSearch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mx-auto h-10 w-10 text-slate-400" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "mx-auto h-10 w-10 text-slate-400" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-semibold text-slate-900 dark:text-white",
							children: hasActiveSearch ? "Sin resultados" : tab === "reservations" ? "No hay reservaciones activas" : "Todavía no hay pedidos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-slate-500 dark:text-slate-400",
							children: hasActiveSearch ? `No encontramos registros para «${query.trim()}».` : "Cuando un cliente reserve desde la app iOS aparecerá aquí al instante."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4",
					children: filteredVisible.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderCard, {
						order,
						now,
						busy: busyId === order.id,
						onConfirm: () => changeStatus(order, "confirmed"),
						onCancel: () => changeStatus(order, "cancelled"),
						onDelete: () => removeOrder(order)
					}, order.id))
				})
			]
		})]
	});
}
function OrderCard({ order, now, busy, onConfirm, onCancel, onDelete }) {
	const state = effectiveState(order, now);
	const remaining = order.expiresAt ? Math.max(0, order.expiresAt.getTime() - now) : 0;
	const progress = Math.min(100, Math.max(0, remaining / DAY_MS * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800",
						children: order.imageSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: order.imageSource,
							alt: "",
							className: "h-full w-full object-contain"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5 text-slate-400" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-slate-900 dark:text-white",
						children: order.code
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-slate-500 dark:text-slate-400",
						children: [
							order.userEmail || "Sin correo",
							" · ",
							formatDate(order.createdAt)
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `rounded-full px-2.5 py-1 text-[11px] font-semibold ${stateStyles(state).chip}`,
						children: stateStyles(state).label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onDelete,
						disabled: busy,
						title: "Eliminar registro",
						className: "rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-500/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})]
				})]
			}),
			order.items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-2 border-t border-slate-200/70 pt-3 dark:border-white/10",
				children: order.items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-slate-800 dark:text-slate-100",
						children: item.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-500 dark:text-slate-400",
						children: [item.color, item.storage].filter(Boolean).join(" · ") || "Sin variante"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-slate-900 dark:text-white",
							children: formatMoney(item.unitPrice * item.quantity)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-slate-500 dark:text-slate-400",
							children: ["x", item.quantity]
						})]
					})]
				}, `${item.productId ?? item.name}-${index}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-semibold text-slate-700 dark:text-slate-200",
					children: "Total"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-lg font-bold text-indigo-600 dark:text-indigo-400",
					children: formatMoney(order.total)
				})]
			}),
			state === "reserved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }),
								" Expira en ",
								formatRemaining(remaining)
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-500 dark:text-slate-400",
							children: "Límite: 24 horas"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `h-full rounded-full transition-all ${remaining < 36e5 ? "bg-red-500" : "bg-orange-500"}`,
							style: { width: `${progress}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onConfirm,
							disabled: busy,
							className: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50",
							children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), "Confirmar pedido"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onCancel,
							disabled: busy,
							className: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:hover:bg-red-500/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), " Cancelar reserva"]
						})]
					})
				]
			}),
			state === "expired" && order.expiresAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" }),
					" Venció el ",
					formatDate(order.expiresAt)
				]
			})
		]
	});
}
function toOrder(id, data) {
	const createdAt = toDate(data.createdAt);
	const expiresAt = toDate(data.expiresAt) ?? (createdAt ? new Date(createdAt.getTime() + DAY_MS) : null);
	const rawItems = Array.isArray(data.items) ? data.items : [];
	return {
		id,
		code: typeof data.code === "string" && data.code ? data.code : id,
		userEmail: typeof data.userEmail === "string" ? data.userEmail : "",
		userUid: typeof data.userUid === "string" ? data.userUid : "",
		status: normalizeStatus(data.status),
		total: toNumber(data.total),
		createdAt,
		expiresAt,
		imageSource: typeof data.imageSource === "string" ? data.imageSource : "",
		source: typeof data.source === "string" ? data.source : "",
		items: rawItems.map((item) => ({
			productId: typeof item.productId === "string" ? item.productId : void 0,
			name: typeof item.name === "string" ? item.name : "Producto",
			color: typeof item.color === "string" ? item.color : void 0,
			storage: typeof item.storage === "string" ? item.storage : void 0,
			quantity: toNumber(item.quantity) || 1,
			unitPrice: toNumber(item.unitPrice)
		}))
	};
}
function normalizeStatus(value) {
	const raw = typeof value === "string" ? value.toLowerCase() : "reserved";
	if (raw === "confirmed" || raw === "completado" || raw === "entregado") return "confirmed";
	if (raw === "cancelled" || raw === "canceled" || raw === "cancelado") return "cancelled";
	if (raw === "expired" || raw === "expirado" || raw === "vencido") return "expired";
	return "reserved";
}
function effectiveState(order, now) {
	if (order.status !== "reserved") return order.status;
	if (order.expiresAt && now >= order.expiresAt.getTime()) return "expired";
	return "reserved";
}
function toDate(value) {
	if (!value) return null;
	if (value instanceof Date) return value;
	if (typeof value === "object" && value !== null && "seconds" in value) {
		const seconds = Number(value.seconds ?? 0);
		return /* @__PURE__ */ new Date(seconds * 1e3);
	}
	if (typeof value === "string") {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}
	return null;
}
function toNumber(value) {
	if (typeof value === "number") return value;
	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isNaN(parsed) ? 0 : parsed;
	}
	return 0;
}
function formatDate(value) {
	if (!value) return "Sin fecha";
	return value.toLocaleString("es-PE", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function formatMoney(value) {
	return value.toLocaleString("en-US", {
		style: "currency",
		currency: "USD"
	});
}
function formatRemaining(ms) {
	const minutes = Math.max(0, Math.floor(ms / 6e4));
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return hours > 0 ? `${hours} h ${rest} min` : `${Math.max(1, rest)} min`;
}
function stateStyles(state) {
	switch (state) {
		case "confirmed": return {
			label: "Confirmado",
			chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
		};
		case "cancelled": return {
			label: "Cancelado",
			chip: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
		};
		case "expired": return {
			label: "Expirado",
			chip: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
		};
		default: return {
			label: "Reservado",
			chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
		};
	}
}
//#endregion
export { HistorialPage as component };
