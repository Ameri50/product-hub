import { o as __toESM } from "../_runtime.mjs";
import "../_libs/firebase.mjs";
import { a as writeBatch, l as serverTimestamp, n as deleteDoc, o as collection, r as onSnapshot, s as doc } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getFirebase } from "./firebase-BwL9iHXg.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-CeI1DVkt.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as Boxes, d as LogOut, g as DatabaseZap, h as ImageOff, i as Sparkles, l as Pencil, m as LayoutGrid, n as Trash2, o as Search, p as LoaderCircle, r as Tag, u as Package } from "../_libs/lucide-react.mjs";
import { a as removeProductInList, i as normalizeProductData, n as dispatchProductRemoved, o as upsertProductInList, r as matchesProductSearch, t as ProductForm } from "./ProductForm-BfGZTqwy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Dashboard-Cxi7lUFS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductList({ onEdit, searchTerm = "" }) {
	const [products, setProducts] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const { db } = getFirebase();
		if (!db) return;
		const unsub = onSnapshot(collection(db, "products"), (snap) => {
			const items = snap.docs.map((d) => {
				return normalizeProductData({
					id: d.id,
					...d.data()
				});
			});
			setProducts(items);
		}, (err) => {
			toast.error("Error al cargar productos: " + err.message);
			setProducts([]);
		});
		const handleExternalProductChange = (event) => {
			const detail = event.detail;
			if (!detail) return;
			setProducts((current) => {
				if (!current) return current;
				if (detail.type === "upsert" && detail.product) return upsertProductInList(current, normalizeProductData(detail.product));
				if (detail.type === "remove" && detail.productId) return removeProductInList(current, detail.productId);
				return current;
			});
		};
		window.addEventListener("products-updated", handleExternalProductChange);
		return () => {
			window.removeEventListener("products-updated", handleExternalProductChange);
			unsub();
		};
	}, []);
	const remove = async (p) => {
		if (!confirm(`¿Eliminar "${p.name}"?`)) return;
		const { db } = getFirebase();
		if (!db) return;
		setDeleting(p.id);
		try {
			await deleteDoc(doc(db, "products", p.id));
			dispatchProductRemoved(p.id);
			toast.success("Producto eliminado");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error al eliminar");
		} finally {
			setDeleting(null);
		}
	};
	const filteredProducts = (0, import_react.useMemo)(() => {
		return (products ?? []).filter((p) => matchesProductSearch(p, searchTerm));
	}, [products, searchTerm]);
	if (products === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
		children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "animate-pulse rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900/60 h-80" }, i))
	});
	if (filteredProducts.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "mx-auto h-10 w-10 text-slate-400" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-3 font-semibold text-slate-800 dark:text-white",
				children: "Sin productos"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-slate-500",
				children: "No hay productos que coincidan con la búsqueda."
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
		children: filteredProducts.map((p) => {
			const imageSrc = p.image_url;
			const description = p.description ?? p.biography ?? "";
			const colorOptions = p.colorOptions ?? p.colors ?? p.color_options ?? [];
			const storageOptions = p.storageOptions ?? p.storages ?? p.storage_options ?? [];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-lg shadow-slate-200/40 dark:shadow-black/40 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/10 flex flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "aspect-video w-full bg-gradient-to-br from-indigo-100 to-fuchsia-100 dark:from-indigo-950/50 dark:to-fuchsia-950/50 relative overflow-hidden",
					children: [imageSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: imageSrc,
						alt: p.name,
						className: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
						onError: (e) => {
							e.currentTarget.style.display = "none";
						}
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full w-full items-center justify-center text-slate-400",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOff, { className: "h-8 w-8" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-white",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-3 w-3" }),
							" ",
							p.category
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 flex-1 flex flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold text-slate-900 dark:text-white truncate text-sm",
							children: p.name
						}),
						description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium uppercase tracking-wide text-slate-400",
								children: "Biografía"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-500 dark:text-slate-400 line-clamp-2",
								children: description
							})]
						}),
						colorOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium uppercase tracking-wide text-slate-400",
								children: "Colores"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex flex-wrap gap-1",
								children: [colorOptions.slice(0, 3).map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5",
									title: c.name,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-3 w-3 rounded-full border border-slate-300 dark:border-white/20",
										style: { backgroundColor: c.hexColor }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-slate-600 dark:text-slate-300",
										children: c.name
									})]
								}, `${c.name || "color"}-${c.hexColor || "#000"}-${i}`)), colorOptions.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] text-slate-500 ml-1",
									children: ["+", colorOptions.length - 3]
								})]
							})]
						}),
						storageOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium uppercase tracking-wide text-slate-400",
								children: "Gigas"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex flex-wrap gap-1",
								children: [storageOptions.slice(0, 3).map((storage, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full border border-fuchsia-200 dark:border-fuchsia-500/20 bg-fuchsia-50 dark:bg-fuchsia-500/10 px-2 py-0.5 text-[10px] text-fuchsia-700 dark:text-fuchsia-300",
									children: storage.capacity
								}, `${storage.capacity || "storage"}-${storage.priceMultiplier || 1}-${i}`)), storageOptions.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] text-slate-500 ml-1",
									children: ["+", storageOptions.length - 3]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-lg font-bold bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent",
								children: ["S/ ", Number(p.price).toFixed(2)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 text-xs text-slate-500",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boxes, { className: "h-3.5 w-3.5" }),
									" ",
									p.stock
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => onEdit(p),
								className: "flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Editar"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								disabled: deleting === p.id,
								onClick: () => remove(p),
								className: "flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-medium transition disabled:opacity-50",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }),
									" ",
									deleting === p.id ? "..." : "Eliminar"
								]
							})]
						})
					]
				})]
			}, p.id);
		})
	});
}
var C = {
	plata: {
		name: "Plata",
		hexColor: "#E8E8ED"
	},
	grisEspacial: {
		name: "Gris Espacial",
		hexColor: "#3A3A3C"
	},
	negroEspacial: {
		name: "Negro Espacial",
		hexColor: "#1C1C1E"
	},
	negro: {
		name: "Negro",
		hexColor: "#1C1C1E"
	},
	blanco: {
		name: "Blanco",
		hexColor: "#F5F5F0"
	},
	luzEstelar: {
		name: "Luz Estelar",
		hexColor: "#F0EDE4"
	},
	medianoche: {
		name: "Medianoche",
		hexColor: "#222930"
	},
	titNegro: {
		name: "Titanio Negro",
		hexColor: "#2C2C2E"
	},
	titBlanco: {
		name: "Titanio Blanco/Plata",
		hexColor: "#E8E8ED"
	},
	titNatural: {
		name: "Titanio Natural",
		hexColor: "#C8B89A"
	},
	titDesierto: {
		name: "Titanio Desierto",
		hexColor: "#C6A882"
	},
	titTeal: {
		name: "Titanio Teal",
		hexColor: "#3E7A7E"
	},
	titAzul: {
		name: "Titanio Azul",
		hexColor: "#4A6FA5"
	},
	rosa: {
		name: "Rosa",
		hexColor: "#F2A7BB"
	},
	rosaClaro: {
		name: "Rosa Claro",
		hexColor: "#F4C2C2"
	},
	oroRosa: {
		name: "Oro Rosa",
		hexColor: "#E8B4B8"
	},
	rojo: {
		name: "Rojo",
		hexColor: "#FF3B30"
	},
	productoRED: {
		name: "Product RED",
		hexColor: "#BF0000"
	},
	azul: {
		name: "Azul",
		hexColor: "#3478F6"
	},
	azulCielo: {
		name: "Azul Cielo",
		hexColor: "#7EC8E3"
	},
	azulMedianoche: {
		name: "Azul Medianoche",
		hexColor: "#2C3E6B"
	},
	teal: {
		name: "Teal",
		hexColor: "#3E7A7E"
	},
	ultramarino: {
		name: "Ultramarino",
		hexColor: "#3B4A8C"
	},
	verde: {
		name: "Verde",
		hexColor: "#30D158"
	},
	verdeAlpino: {
		name: "Verde Alpino",
		hexColor: "#4CAF7D"
	},
	cian: {
		name: "Cian",
		hexColor: "#5AC8FA"
	},
	amarillo: {
		name: "Amarillo",
		hexColor: "#FFD60A"
	},
	naranja: {
		name: "Naranja",
		hexColor: "#FF9F0A"
	},
	morado: {
		name: "Morado",
		hexColor: "#BF5AF2"
	},
	moradoOscuro: {
		name: "Morado Oscuro",
		hexColor: "#7B3FA0"
	},
	oro: {
		name: "Oro",
		hexColor: "#D4AF37"
	},
	grafito: {
		name: "Grafito",
		hexColor: "#5A5A5E"
	},
	azuliMac: {
		name: "Azul",
		hexColor: "#6AADCF"
	},
	verdeiMac: {
		name: "Verde",
		hexColor: "#75C08B"
	},
	rosaiMac: {
		name: "Rosa",
		hexColor: "#E8A0A8"
	},
	amarilloiMac: {
		name: "Amarillo",
		hexColor: "#F3D46A"
	},
	naranjaiMac: {
		name: "Naranja",
		hexColor: "#F0956A"
	},
	moradoiMac: {
		name: "Morado",
		hexColor: "#9E7FC2"
	},
	verdeAM: {
		name: "Verde",
		hexColor: "#4CAF7D"
	},
	celesteAM: {
		name: "Celeste",
		hexColor: "#AED6F1"
	},
	rosaAM: {
		name: "Rosa",
		hexColor: "#F8BBD9"
	}
};
var S = {
	g32: {
		capacity: "32GB",
		priceMultiplier: 1
	},
	g64: {
		capacity: "64GB",
		priceMultiplier: 1
	},
	g128: {
		capacity: "128GB",
		priceMultiplier: 1
	},
	g256: {
		capacity: "256GB",
		priceMultiplier: 1.15
	},
	g512: {
		capacity: "512GB",
		priceMultiplier: 1.35
	},
	t1: {
		capacity: "1TB",
		priceMultiplier: 1.6
	},
	t2: {
		capacity: "2TB",
		priceMultiplier: 1.95
	},
	t4: {
		capacity: "4TB",
		priceMultiplier: 2.5
	},
	t8: {
		capacity: "8TB",
		priceMultiplier: 3.2
	}
};
function product(name, price, category, description, colors, storages, stock = 50) {
	return {
		name,
		price,
		category,
		image_url: "",
		description,
		stock,
		colorOptions: colors,
		storageOptions: storages
	};
}
var iPhones = [
	product("iPhone 17e", 2199, "iPhone", "El iPhone más accesible de la familia 17. Pantalla OLED de 6.1\", chip A19 con módem C1X integrado, cámara 48 MP Fusion con 4K Dolby Vision y soporte MagSafe.", [
		C.negro,
		C.blanco,
		C.rosa
	], [S.g128, S.g256]),
	product("iPhone 17 Pro Max", 4999, "iPhone", "El iPhone más potente. Pantalla Super Retina XDR de 6.9\" ProMotion 120 Hz, chip A19 Pro, triple cámara 48 MP con zoom óptico 5×, chasis de titanio aeroespacial.", [
		C.titNegro,
		C.titBlanco,
		C.titNatural,
		C.titDesierto
	], [
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPhone 17 Pro", 4499, "iPhone", "Pantalla Super Retina XDR de 6.3\" ProMotion 120 Hz, chip A19 Pro, triple cámara 48 MP con zoom óptico 5×, chasis de titanio aeroespacial cepillado.", [
		C.titNegro,
		C.titBlanco,
		C.titNatural,
		C.titTeal
	], [
		S.g128,
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPhone Air", 4199, "iPhone", "El iPhone más delgado de la historia (5.6 mm). Pantalla OLED de 6.6\", chip A19, cámara 48 MP Fusion. Chasis de aluminio aeroespacial ultraligero.", [
		C.azulCielo,
		C.blanco,
		C.negro,
		C.rosa
	], [S.g256, S.g512]),
	product("iPhone 17", 3199, "iPhone", "Pantalla OLED de 6.3\" ProMotion 120 Hz con Always-On Display, chip A19, cámara dual 48 MP. El mejor valor de la gama actual.", [
		C.negro,
		C.blanco,
		C.ultramarino,
		C.rosa,
		C.verde
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 16 Pro Max", 4700, "iPhone", "Pantalla Super Retina XDR de 6.9\" ProMotion 120 Hz, chip A18 Pro, triple cámara 48 MP con zoom óptico 5×. Camera Control físico. Titanio grado 5.", [
		C.titNegro,
		C.titBlanco,
		C.titNatural,
		C.titDesierto
	], [
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPhone 16 Pro", 4199, "iPhone", "Pantalla Super Retina XDR de 6.3\" ProMotion 120 Hz, chip A18 Pro, triple cámara 48 MP. Camera Control físico. Titanio grado 5.", [
		C.titNegro,
		C.titBlanco,
		C.titNatural,
		C.titDesierto
	], [
		S.g128,
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPhone 16 Plus", 3899, "iPhone", "Pantalla OLED de 6.7\" con chip A18 y Camera Control. Dynamic Island. Batería de larga duración.", [
		C.negro,
		C.blanco,
		C.rosa,
		C.teal,
		C.ultramarino
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 16", 2900, "iPhone", "Pantalla OLED de 6.1\", chip A18 y Camera Control. Dynamic Island. Compatible con Apple Intelligence.", [
		C.negro,
		C.blanco,
		C.rosa,
		C.teal,
		C.ultramarino
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 16e", 2119, "iPhone", "Opción de entrada con chip A18 y Apple Intelligence. Pantalla OLED de 6.1\", cámara 48 MP Fusion, Dynamic Island. Módem C1 integrado.", [C.negro, C.blanco], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 15 Pro Max", 4283, "iPhone", "Pantalla Super Retina XDR de 6.7\" ProMotion, titanio grado 5, cámara 48 MP con zoom tetraprismático 5×. Primer iPhone con puerto USB-C.", [
		C.titNegro,
		C.titBlanco,
		C.titAzul,
		C.titNatural
	], [
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPhone 15 Pro", 3400, "iPhone", "Pantalla Super Retina XDR de 6.1\" ProMotion, titanio grado 5, cámara 48 MP. USB-C con velocidades USB 3.", [
		C.titNegro,
		C.titBlanco,
		C.titAzul,
		C.titNatural
	], [
		S.g128,
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPhone 15 Plus", 3200, "iPhone", "Pantalla OLED de 6.7\" con Dynamic Island y USB-C. Chip A16 Bionic.", [
		C.negro,
		C.amarillo,
		C.verde,
		C.azul,
		C.rosa
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 15", 2600, "iPhone", "Pantalla Super Retina XDR OLED de 6.1\", Dynamic Island, cámara 48 MP y USB-C. Chip A16 Bionic.", [
		C.negro,
		C.amarillo,
		C.verde,
		C.azul,
		C.rosa
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 14 Pro Max", 3300, "iPhone", "Pantalla Super Retina XDR de 6.7\" ProMotion con Dynamic Island (primer año), cámara 48 MP. Chip A16 Bionic. Always-On Display.", [
		C.negroEspacial,
		C.plata,
		C.oro,
		C.moradoOscuro
	], [
		S.g128,
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPhone 14 Pro", 2300, "iPhone", "Pantalla Super Retina XDR de 6.1\" ProMotion con Dynamic Island, cámara 48 MP. Chip A16 Bionic.", [
		C.negroEspacial,
		C.plata,
		C.oro,
		C.moradoOscuro
	], [
		S.g128,
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPhone 14 Plus", 2500, "iPhone", "Pantalla OLED de 6.7\", chip A15 Bionic y batería de larga duración. Crash Detection y Emergency SOS vía satélite.", [
		C.medianoche,
		C.luzEstelar,
		C.azul,
		C.morado,
		C.amarillo,
		C.productoRED
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 14", 2200, "iPhone", "Pantalla OLED de 6.1\", chip A15 Bionic. Crash Detection y Emergency SOS vía satélite.", [
		C.medianoche,
		C.luzEstelar,
		C.azul,
		C.morado,
		C.amarillo,
		C.productoRED
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 13 Pro Max", 2900, "iPhone", "Pantalla Super Retina XDR de 6.7\" ProMotion 120 Hz, triple cámara con macro y LiDAR. Chip A15 Bionic.", [
		C.grafito,
		C.oro,
		C.plata,
		C.azul,
		C.verdeAlpino
	], [
		S.g128,
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPhone 13 Pro", 2100, "iPhone", "Pantalla Super Retina XDR de 6.1\" ProMotion 120 Hz, triple cámara con macro y LiDAR. Chip A15 Bionic.", [
		C.grafito,
		C.oro,
		C.plata,
		C.azul,
		C.verdeAlpino
	], [
		S.g128,
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPhone 13", 1750, "iPhone", "Pantalla OLED de 6.1\", chip A15 Bionic, cámara dual avanzada. Muesca más pequeña.", [
		C.medianoche,
		C.luzEstelar,
		C.azul,
		C.rosa,
		C.verde,
		C.productoRED
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 13 Mini", 1300, "iPhone", "Pantalla OLED compacta de 5.4\", chip A15 Bionic. El iPhone más pequeño de su generación.", [
		C.medianoche,
		C.luzEstelar,
		C.azul,
		C.rosa,
		C.verde,
		C.productoRED
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone SE (3ª Gen)", 1400, "iPhone", "Pantalla Retina HD de 4.7\", chip A15 Bionic, 5G y Touch ID. La opción más económica con botón de inicio.", [
		C.medianoche,
		C.luzEstelar,
		C.productoRED
	], [
		S.g64,
		S.g128,
		S.g256
	]),
	product("iPhone 12 Pro Max", 2675, "iPhone", "Pantalla Super Retina XDR de 6.7\", LiDAR Scanner, cámara triple con zoom óptico 2.5×. Chip A14 Bionic. 5G.", [
		C.grafito,
		C.plata,
		C.oro,
		C.azul
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 12 Pro", 1900, "iPhone", "Pantalla Super Retina XDR de 6.1\", LiDAR Scanner, cámara triple. Chip A14 Bionic. 5G.", [
		C.grafito,
		C.plata,
		C.oro,
		C.azul
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPhone 12", 1499, "iPhone", "Pantalla OLED de 6.1\", 5G, A14 Bionic, cámara dual 12 MP. Diseño de aluminio con Ceramic Shield.", [
		C.negro,
		C.blanco,
		C.rosa,
		C.verde,
		C.azul,
		C.productoRED
	], [
		S.g64,
		S.g128,
		S.g256
	])
];
var iPads = [
	product("iPad Pro 13\" M4", 6963, "iPad", "Pantalla Tandem OLED Ultra Retina XDR de 13\". Chip M4. El iPad más delgado (5.1 mm). Compatible con Apple Pencil Pro y Magic Keyboard.", [C.plata, C.negroEspacial], [
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("iPad Pro 11\" M4", 5355, "iPad", "Pantalla Tandem OLED Ultra Retina XDR de 11\". Chip M4. Diseño ultradelgado de 5.3 mm. Compatible con Apple Pencil Pro.", [C.plata, C.negroEspacial], [
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("iPad Air 11\" M2", 3950, "iPad", "Pantalla Liquid Retina de 11\". Chip M2. Compatible con Apple Pencil Pro y Magic Keyboard. Wi-Fi 6E.", [
		C.azul,
		C.morado,
		C.luzEstelar,
		C.rosa
	], [
		S.g128,
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPad Air 13\" M2", 4150, "iPad", "Pantalla Liquid Retina de 13\". Chip M2. Primera iPad Air de 13\". Wi-Fi 6E y Magic Keyboard compatible.", [
		C.azul,
		C.morado,
		C.luzEstelar
	], [
		S.g128,
		S.g256,
		S.g512,
		S.t1
	]),
	product("iPad mini 7", 2675, "iPad", "Pantalla Liquid Retina de 8.3\". Chip A17 Pro. Compatible con Apple Pencil Pro. El mini más potente.", [
		C.azul,
		C.morado,
		C.luzEstelar,
		C.rosa
	], [
		S.g128,
		S.g256,
		S.g512
	]),
	product("iPad Pro 12.9\" M2", 5087, "iPad", "Pantalla Liquid Retina XDR de 12.9\" con miniLED. Chip M2. ProMotion 120 Hz. Compatible con Apple Pencil 2ª gen.", [C.plata, C.grisEspacial], [
		S.g128,
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("iPad Pro 11\" M2", 4699, "iPad", "Pantalla Liquid Retina de 11\". Chip M2. ProMotion 120 Hz. Compatible con Apple Pencil 2ª gen.", [C.plata, C.grisEspacial], [
		S.g128,
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("iPad 10ª Gen", 1871, "iPad", "Pantalla Liquid Retina de 10.9\". Chip A14 Bionic. Diseño de bordes planos con USB-C. Compatible con Apple Pencil USB-C.", [
		C.azul,
		C.rosa,
		C.amarillo,
		C.plata
	], [S.g64, S.g256]),
	product("iPad 9ª Gen", 1495, "iPad", "Pantalla Retina de 10.2\". Chip A13 Bionic. Botón de inicio con Touch ID y Lightning. El iPad de entrada más popular.", [C.grisEspacial, C.plata], [S.g64, S.g256]),
	product("iPad mini 6", 2407, "iPad", "Pantalla Liquid Retina de 8.3\". Chip A15 Bionic. Rediseño total con Touch ID lateral y USB-C. Compatible con Apple Pencil 2ª gen.", [
		C.grisEspacial,
		C.rosa,
		C.morado,
		C.luzEstelar
	], [S.g64, S.g256]),
	product("iPad Pro 12.9\" M1", 4283, "iPad", "Pantalla Liquid Retina XDR de 12.9\" con miniLED (primera generación). Chip M1. Thunderbolt / USB 4. Center Stage.", [C.plata, C.grisEspacial], [
		S.g128,
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("iPad Air 5ª Gen (M1)", 3091, "iPad", "Pantalla Liquid Retina de 10.9\". Chip M1. Primera iPad Air con 5G y Center Stage. Compatible con Apple Pencil 2ª gen.", [
		C.azul,
		C.morado,
		C.rosa,
		C.luzEstelar,
		C.grisEspacial
	], [S.g64, S.g256]),
	product("iPad Air 4ª Gen", 2451, "iPad", "Pantalla Liquid Retina de 10.9\". Chip A14 Bionic. Primer Air con Touch ID lateral y USB-C. Compatible con Apple Pencil 2ª gen.", [
		C.grisEspacial,
		C.plata,
		C.oroRosa,
		C.verde,
		C.cian
	], [S.g64, S.g256]),
	product("iPad mini 5ª Gen", 1703, "iPad", "Pantalla Retina de 7.9\". Chip A12 Bionic. Compatible con Apple Pencil 1ª gen. Diseño clásico con botón de inicio.", [
		C.grisEspacial,
		C.plata,
		C.oro,
		C.rosaClaro
	], [S.g64, S.g256]),
	product("iPad 8ª Gen", 1275, "iPad", "Pantalla Retina de 10.2\". Chip A12 Bionic con Neural Engine. Compatible con Smart Keyboard y Apple Pencil 1ª gen.", [
		C.grisEspacial,
		C.plata,
		C.oro
	], [S.g32, S.g128]),
	product("iPad 7ª Gen", 1059, "iPad", "Pantalla Retina de 10.2\". Chip A10 Fusion. El primer iPad con pantalla de 10.2\" y Smart Connector.", [
		C.grisEspacial,
		C.plata,
		C.oro
	], [S.g32, S.g128]),
	product("iPad Air 3ª Gen", 1811, "iPad", "Pantalla Retina de 10.5\". Chip A12 Bionic. Compatible con Apple Pencil 1ª gen y Smart Keyboard.", [
		C.grisEspacial,
		C.plata,
		C.oro,
		C.rosaClaro,
		C.cian
	], [S.g64, S.g256])
];
var macs = [
	product("MacBook Pro 16\" M5", 18755, "Mac", "Pantalla Liquid Retina XDR de 16\" ProMotion 120 Hz. Chip M5 Max, hasta 128 GB de RAM unificada. Thunderbolt 5. Hasta 22 h de batería.", [C.plata, C.negroEspacial], [
		S.g512,
		S.t1,
		S.t2,
		S.t4
	]),
	product("MacBook Pro 14\" M5", 13395, "Mac", "Pantalla Liquid Retina XDR de 14.2\" ProMotion 120 Hz. Chip M5 Pro, 24 GB de RAM unificada. Carga MagSafe 3. Thunderbolt 5.", [C.plata, C.negroEspacial], [
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Air 15\" M4", 7500, "Mac", "Pantalla Liquid Retina de 15.3\". Chip M4, 16 GB RAM. Sin ventilador. Hasta 18 h de batería. Cámara Center Stage 12 MP.", [
		C.medianoche,
		C.luzEstelar,
		C.plata,
		C.azulCielo
	], [
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Air 13\" M4", 6500, "Mac", "Pantalla Liquid Retina de 13.6\". Chip M4, 16 GB RAM. El portátil más vendido del mundo. Soporte para dos monitores externos.", [
		C.medianoche,
		C.luzEstelar,
		C.plata,
		C.azulCielo
	], [
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Pro 16\" M4 Pro", 17500, "Mac", "Pantalla Liquid Retina XDR de 16\" ProMotion. Chip M4 Pro, 24 GB RAM. Thunderbolt 5. Hasta 24 h de batería.", [C.plata, C.negroEspacial], [
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Pro 14\" M4 Pro", 10715, "Mac", "Pantalla Liquid Retina XDR de 14.2\" ProMotion. Chip M4 Pro, 24 GB RAM. Thunderbolt 5.", [C.plata, C.negroEspacial], [
		S.g512,
		S.t1,
		S.t2
	]),
	product("Mac mini M4 Pro", 4819, "Mac", "Mac mini con chip M4 Pro, 24 GB RAM. 3× Thunderbolt 5. Rediseño histórico compacto de 12.7×12.7 cm.", [C.plata, C.negro], [
		S.g512,
		S.t1,
		S.t2
	]),
	product("Mac mini M4", 3747, "Mac", "Mac mini con chip M4, 16 GB RAM. El Mac más pequeño de la historia. Thunderbolt 4. Precio de entrada histórico.", [C.plata], [S.g256, S.g512]),
	product("Mac Studio M4 Max", 21435, "Mac", "Rendimiento extremo. Chip M4 Max, 36 GB RAM unificada. Thunderbolt 5. Para videófilos, músicos y diseñadores 3D.", [C.plata], [
		S.g512,
		S.t1,
		S.t2
	]),
	product("Mac Pro M4 Ultra", 42876, "Mac", "El Mac más potente. Chip M4 Ultra, hasta 192 GB RAM unificada. Para rendering industrial, ML y postproducción.", [C.plata], [
		S.t1,
		S.t2,
		S.t4,
		S.t8
	]),
	product("iMac 24\" M3", 6963, "Mac", "Todo-en-uno con pantalla Retina 4.5K de 24\". Chip M3, 8 GB RAM. Diseño ultrafino en 7 colores vibrantes. Cámara 12 MP Center Stage.", [
		C.azuliMac,
		C.verdeiMac,
		C.rosaiMac,
		C.plata,
		C.amarilloiMac,
		C.naranjaiMac,
		C.moradoiMac
	], [
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Pro 16\" M3 Max", 16075, "Mac", "Pantalla Liquid Retina XDR de 16\" ProMotion. Chip M3 Max. Disponible en el nuevo Negro Espacial exclusivo de los Pro.", [C.plata, C.negroEspacial], [
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Pro 14\" M3 Pro", 9500, "Mac", "Pantalla Liquid Retina XDR de 14.2\" ProMotion. Chip M3 Pro. Disponible en Negro Espacial.", [C.plata, C.negroEspacial], [
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Air 15\" M3", 6963, "Mac", "Pantalla Liquid Retina de 15.3\". Chip M3, 8 GB RAM. Sin ventilador. Soporte para dos pantallas externas.", [
		C.medianoche,
		C.luzEstelar,
		C.plata,
		C.grisEspacial
	], [
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Air 13\" M3", 5891, "Mac", "Pantalla Liquid Retina de 13.6\". Chip M3, 8 GB RAM. Soporte para dos pantallas externas simultáneas.", [
		C.medianoche,
		C.luzEstelar,
		C.plata,
		C.grisEspacial
	], [
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Air 13\" M2", 5355, "Mac", "Pantalla Liquid Retina de 13.6\". Chip M2. Rediseño total con muesca, MagSafe 3 y sin ventilador.", [
		C.medianoche,
		C.luzEstelar,
		C.grisEspacial,
		C.plata
	], [
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Pro 14\" M1 Pro", 8571, "Mac", "Pantalla Liquid Retina XDR de 14.2\" ProMotion. Chip M1 Pro. HDMI, SD y MagSafe 3. Primera generación Pro con Apple Silicon.", [C.plata, C.grisEspacial], [
		S.g512,
		S.t1,
		S.t2
	]),
	product("MacBook Pro 16\" M1 Max", 13395, "Mac", "Pantalla Liquid Retina XDR de 16.2\" ProMotion. Chip M1 Max, hasta 64 GB RAM. Primera generación con Apple Silicon Pro Max.", [C.plata, C.grisEspacial], [
		S.t1,
		S.t2,
		S.t4
	]),
	product("Mac mini M2", 3211, "Mac", "Mac mini con chip M2, 8 GB RAM. Dos puertos Thunderbolt 4. Segunda generación Apple Silicon compacta.", [C.plata], [
		S.g256,
		S.g512,
		S.t1,
		S.t2
	]),
	product("Mac mini M1", 2900, "Mac", "Mac mini con chip M1, 8 GB RAM. El primer Mac con Apple Silicon. Rendimiento revolucionario en formato compacto.", [C.plata], [
		S.g256,
		S.g512,
		S.t1,
		S.t2
	])
];
var watches = [
	product("Apple Watch Series 11", 2350, "Apple Watch", "[Especulativo 2025] Sucesor del Series 10. Detección de apnea del sueño mejorada, sensores de salud avanzados y chip S11.", [
		C.medianoche,
		C.luzEstelar,
		C.rosa,
		C.plata
	], []),
	product("Apple Watch Ultra 3", 4600, "Apple Watch", "[Especulativo 2025] Sucesor del Ultra 2. Titanio, resistencia extrema certificada, batería de 3+ días y nuevos sensores de salud.", [C.titNatural], []),
	product("Apple Watch SE 3", 1450, "Apple Watch", "[Especulativo 2025] Sucesor del SE 2. Fitness esencial con GPS, Crash Detection y chip S9 actualizado.", [
		C.medianoche,
		C.luzEstelar,
		C.plata
	], []),
	product("Apple Watch Series 10", 2139, "Apple Watch", "La pantalla más grande y delgada del Apple Watch. Detección de apnea del sueño. Carga ultrarrápida. Chip S10.", [
		C.plata,
		C.negro,
		C.oroRosa
	], []),
	product("Apple Watch Ultra 2", 4283, "Apple Watch", "Caja de titanio aeroespacial. Hasta 60 h de batería. Resistencia extrema MIL-STD-810H. Display Always-On 2000 nits. Chip S9.", [C.titNatural], []),
	product("Apple Watch Series 9", 1950, "Apple Watch", "Doble Toque para controlar con una mano. Chip S9, pantalla hasta 2000 nits. Temperatura corporal y ECG.", [
		C.medianoche,
		C.luzEstelar,
		C.rosa,
		C.rojo,
		C.plata
	], []),
	product("Apple Watch SE 2", 1335, "Apple Watch", "Fitness esencial con GPS, Crash Detection y detección de caídas. Chip S8. La opción más económica del Watch actual.", [
		C.medianoche,
		C.luzEstelar,
		C.plata
	], []),
	product("Apple Watch Series 8", 1800, "Apple Watch", "Sensor de temperatura corporal y Crash Detection. ECG y oxígeno en sangre. Chip S8.", [
		C.medianoche,
		C.luzEstelar,
		C.rojo,
		C.plata
	], []),
	product("Apple Watch Series 7", 1650, "Apple Watch", "Pantalla más grande con bordes curvos. ECG, oxígeno en sangre y carga rápida. Chip S7.", [
		C.medianoche,
		C.luzEstelar,
		C.verde,
		C.azul,
		C.rojo
	], []),
	product("Apple Watch SE 1", 1200, "Apple Watch", "El Apple Watch SE original. GPS y detección de caídas. Chip S5. Buena opción de entrada económica.", [
		C.grisEspacial,
		C.plata,
		C.oro
	], []),
	product("Apple Watch Series 6", 1500, "Apple Watch", "Primer Apple Watch con sensor de oxígeno en sangre (SpO2). Always-On Display de segunda generación. Chip S6.", [
		C.azul,
		C.rojo,
		C.negro,
		C.plata,
		C.oro
	], []),
	product("Apple Watch Hermès Series 9", 4819, "Apple Watch", "Edición de lujo en colaboración con Hermès. Caja de acero inoxidable con correas de cuero artesanal francés exclusivas.", [C.plata], []),
	product("Apple Watch Nike Series 9", 2040, "Apple Watch", "Edición deportiva Nike con correa Nike Sport Band y watchfaces exclusivos Nike. Chip S9.", [C.negro, C.plata], []),
	product("Apple Watch Nike Series 8", 1875, "Apple Watch", "Edición deportiva Nike con correa exclusiva y watchfaces Nike. Crash Detection. Chip S8.", [C.negro, C.plata], []),
	product("Apple Watch Hermès Series 8", 4283, "Apple Watch", "Edición Hermès con Series 8. Acero inoxidable y correas de cuero artesanal francés.", [C.plata], [])
];
var airpods = [
	product("AirPods Pro 3", 1335, "AirPods", "[Especulativo 2025] Sucesor de los AirPods Pro 2. Chip H3, sensores de salud auditiva mejorados y cancelación de ruido de tercera generación.", [C.blanco], []),
	product("AirPods Pro 2 USB-C", 1227, "AirPods", "Cancelación activa de ruido H2. Audio Adaptivo y Volumen Adaptivo. Estuche USB-C con MagSafe. Modo Transparencia conversacional.", [C.blanco], []),
	product("AirPods Pro 2 Lightning", 1335, "AirPods", "Cancelación activa de ruido de segunda generación. Chip H2. Audio Espacial Personalizado. Estuche con altavoz y correa.", [C.blanco], []),
	product("AirPods Max USB-C", 2943, "AirPods", "Auriculares over-ear premium con cancelación activa de ruido. Puerto USB-C. Audio Espacial dinámico. Malla de tela y aluminio anodizado.", [
		C.azulMedianoche,
		C.luzEstelar,
		C.verde,
		C.naranja,
		C.morado
	], []),
	product("AirPods Max (Lightning)", 2675, "AirPods", "Primera versión con puerto Lightning. Cancelación activa de ruido original, Audio Espacial y chip H1. 5 colores originales.", [
		C.plata,
		C.grisEspacial,
		C.verdeAM,
		C.celesteAM,
		C.rosaAM
	], []),
	product("AirPods 4 con ANC", 959, "AirPods", "AirPods 4 con Cancelación Activa de Ruido y modo Transparencia. Chip H2. Diseño abierto sin almohadillas.", [C.blanco], []),
	product("AirPods 4", 691, "AirPods", "AirPods 4 base. Nuevo diseño ergonómico con mejor ajuste. Audio Espacial Personalizado. Chip H2.", [C.blanco], []),
	product("AirPods 3ª Gen", 691, "AirPods", "Diseño inspirado en los Pro sin almohadillas. Audio Espacial dinámico y resistencia IPX4. Chip H1.", [C.blanco], []),
	product("AirPods 2ª Gen", 531, "AirPods", "Los auriculares inalámbricos clásicos de Apple. Chip H1, activación Hey Siri. La opción más económica.", [C.blanco], []),
	product("AirPods Pro 1ª Gen", 959, "AirPods", "El AirPods Pro original. Cancelación activa de primera generación con almohadillas de silicona. Chip H1.", [C.blanco], [])
];
var tvCasa = [
	product("Apple TV 4K (2024) WiFi", 531, "TV y Casa", "Streaming 4K a 60fps con WiFi 6E y HDR10+. Chip A15 Bionic. Siri Remote con USB-C. El streamer más poderoso de Apple.", [{
		name: "Negro",
		hexColor: "#1C1C1E"
	}], []),
	product("Apple TV 4K (2024) Wi-Fi + Ethernet", 638, "TV y Casa", "Streaming 4K con puerto Ethernet Gigabit y WiFi 6E. Ideal para instalaciones permanentes con máxima estabilidad de red.", [{
		name: "Negro",
		hexColor: "#1C1C1E"
	}], []),
	product("Apple TV HD", 316, "TV y Casa", "Streaming en 1080p con chip A8. La entrada más económica al ecosistema Apple TV con AirPlay y HomeKit.", [{
		name: "Negro",
		hexColor: "#1C1C1E"
	}], []),
	product("Apple TV 4K (2022)", 531, "TV y Casa", "Apple TV 4K de tercera generación. Chip A15, WiFi 6 y HDR10+. Siri Remote rediseñado con clickpad.", [{
		name: "Negro",
		hexColor: "#1C1C1E"
	}], []),
	product("HomePod 2ª Gen", 1603, "TV y Casa", "Altavoz inteligente de alta fidelidad con sonido envolvente Dolby Atmos. Chip S7. Sensor de temperatura y humedad. Hub de HomeKit.", [{
		name: "Blanco",
		hexColor: "#F5F5F0"
	}, {
		name: "Medianoche",
		hexColor: "#222930"
	}], []),
	product("HomePod mini Blanco", 531, "TV y Casa", "Altavoz inteligente compacto con chip S5. Intercom, automatizaciones del hogar y audio 360°. Hub de HomeKit.", [{
		name: "Blanco",
		hexColor: "#F5F5F0"
	}], []),
	product("HomePod mini Medianoche", 531, "TV y Casa", "HomePod mini en color Medianoche. Centro del hogar inteligente con chip S5 y audio de 360°.", [{
		name: "Medianoche",
		hexColor: "#222930"
	}], []),
	product("HomePod mini Naranja", 531, "TV y Casa", "HomePod mini en color Naranja. Diseño colorido para el hogar inteligente con chip S5.", [{
		name: "Naranja",
		hexColor: "#FF9F0A"
	}], []),
	product("HomePod mini Amarillo", 531, "TV y Casa", "HomePod mini en color Amarillo. Centro del hogar inteligente con chip S5.", [{
		name: "Amarillo",
		hexColor: "#FFD60A"
	}], []),
	product("HomePod mini Azul", 531, "TV y Casa", "HomePod mini en color Azul. Centro del hogar inteligente con chip S5.", [{
		name: "Azul",
		hexColor: "#5AC8FA"
	}], []),
	product("HomePod mini Rojo", 531, "TV y Casa", "HomePod mini edición Product RED. Una parte de la venta apoya al Fondo Global contra el SIDA.", [{
		name: "Rojo",
		hexColor: "#BF0000"
	}], [])
];
var accesorios = [
	product("Magic Keyboard con Touch ID USB-C", 1067, "Accesorios", "Teclado inalámbrico con Touch ID y puerto USB-C. Compatible con Mac, iPad e iPhone con iOS 16+.", [C.plata, C.grisEspacial], []),
	product("Magic Keyboard Numérico USB-C", 1335, "Accesorios", "Teclado extendido con teclado numérico, Touch ID y USB-C. Diseñado para Mac con chip Apple Silicon.", [C.plata, C.grisEspacial], []),
	product("Magic Mouse USB-C", 531, "Accesorios", "Ratón inalámbrico multitáctil con superficie de vidrio Multi-Touch. Puerto USB-C para carga.", [C.plata, C.negro], []),
	product("Magic Trackpad USB-C", 691, "Accesorios", "Trackpad inalámbrico con Force Touch y retroalimentación háptica. La superficie multitáctil más grande. USB-C.", [C.plata, C.negro], []),
	product("Apple Pencil Pro", 691, "Accesorios", "El Apple Pencil más avanzado. Squeeze, rotación y Find My. Compatible con iPad Pro M4 (11\"/13\"), iPad Air M2 (11\"/13\") e iPad mini 7.", [C.blanco], []),
	product("Apple Pencil 2ª Gen", 691, "Accesorios", "Carga y emparejamiento magnético. Doble toque para cambiar herramientas. Compatible con iPad Pro (2018-2022), Air 4ª y 5ª Gen, mini 6.", [C.blanco], []),
	product("Apple Pencil USB-C", 423, "Accesorios", "Carga deslizando la tapa USB-C. La opción más económica. Compatible con iPad 10ª gen, mini 6, Air M2 e iPad Pro M4.", [C.blanco], []),
	product("Apple Pencil 1ª Gen", 531, "Accesorios", "Apple Pencil original con conector Lightning. Compatible con iPad 9ª gen y anteriores, mini 5ª gen y Air 3ª gen.", [C.blanco], []),
	product("Magic Keyboard para iPad Pro M4 13\"", 1871, "Accesorios", "Magic Keyboard de aluminio con trackpad Force Touch. Exclusivo para iPad Pro M4 de 13\". Puerto USB-C pass-through para carga.", [C.blanco, C.negro], []),
	product("Magic Keyboard para iPad Pro M4 11\"", 1603, "Accesorios", "Magic Keyboard de aluminio con trackpad Force Touch. Exclusivo para iPad Pro M4 de 11\". Puerto USB-C pass-through.", [C.blanco, C.negro], []),
	product("Magic Keyboard Folio iPad 10ª Gen", 1067, "Accesorios", "Teclado con trackpad y cubierta trasera protectora. Exclusivo para iPad 10ª generación. Smart Connector.", [C.blanco], []),
	product("Smart Keyboard para iPad 9ª Gen", 638, "Accesorios", "Teclado inteligente plegable para iPad 9ª generación y anteriores. Lightning + Smart Connector. Sin necesidad de carga.", [C.negro], []),
	product("AirTag", 155, "Accesorios", "Localizador Bluetooth con Precisión espacial Ultra Wideband. Batería CR2032 reemplazable. Resistente al agua IPX7.", [{
		name: "Blanco/Acero",
		hexColor: "#F0F0F0"
	}], []),
	product("AirTag 4 Pack", 531, "Accesorios", "Pack de 4 localizadores AirTag. Protege llaves, billetera, mochila y maleta a la vez.", [{
		name: "Blanco/Acero",
		hexColor: "#F0F0F0"
	}], []),
	product("Cable USB-C a USB-C 1m", 102, "Accesorios", "Cable trenzado USB-C a USB-C de 1 metro. Compatible con iPhone 15/16/17, iPad Pro, iPad Air M2, Mac y cargadores MagSafe.", [{
		name: "Blanco",
		hexColor: "#F5F5F0"
	}], []),
	product("Cable USB-C a Lightning 1m", 102, "Accesorios", "Cable USB-C a Lightning de 1 metro. Para cargar rápido iPhone 14 y anteriores, AirPods con estuche Lightning.", [{
		name: "Blanco",
		hexColor: "#F5F5F0"
	}], []),
	product("Cable Thunderbolt 4 Pro 1m", 263, "Accesorios", "Cable Thunderbolt 4 blindado de 1 metro. Hasta 40 Gb/s de transferencia, 100W de carga y video 8K.", [{
		name: "Negro",
		hexColor: "#1C1C1E"
	}], []),
	product("Adaptador Lightning a 3.5mm", 48, "Accesorios", "Adaptador oficial para auriculares de 3.5mm en iPhone con Lightning. Imprescindible para iPhone 7 al 14.", [{
		name: "Blanco",
		hexColor: "#F5F5F0"
	}], []),
	product("Adaptador USB-C Multipuerto", 423, "Accesorios", "Adaptador USB-C Digital AV Multipuerto. Salida HDMI hasta 4K 60Hz, USB-A 3.0 y USB-C pass-through de carga.", [{
		name: "Plata",
		hexColor: "#E5E5EA"
	}], []),
	product("Cargador USB-C 20W", 155, "Accesorios", "Cargador compacto USB-C de 20W con carga rápida. Para iPhone 8 o posterior, iPad mini y AirPods Pro.", [{
		name: "Blanco",
		hexColor: "#F5F5F0"
	}], []),
	product("Cargador USB-C 30W", 263, "Accesorios", "Cargador USB-C de 30W. Carga rápida para iPhone, iPad Air, iPad mini y MacBook Air.", [{
		name: "Blanco",
		hexColor: "#F5F5F0"
	}], []),
	product("Cargador USB-C 67W", 531, "Accesorios", "Cargador USB-C de 67W de alta potencia. Para MacBook Pro 14\", iPad Pro y carga rápida de iPhone.", [{
		name: "Blanco",
		hexColor: "#F5F5F0"
	}], []),
	product("Base MagSafe Duo", 852, "Accesorios", "Carga inalámbrica simultánea para iPhone MagSafe (hasta 15W) y Apple Watch. Diseño plegable para viaje.", [{
		name: "Blanco",
		hexColor: "#F5F5F0"
	}], []),
	product("Funda FineWoven iPhone 17 Pro Max", 316, "Accesorios", "Funda de tejido FineWoven con MagSafe para iPhone 17 Pro Max. Microtexturas suaves y acabado premium.", [
		C.negro,
		C.verdeAlpino,
		C.morado,
		C.naranja
	], []),
	product("Funda Silicona iPhone 17", 263, "Accesorios", "Funda de silicona suave con interior de microfibra y MagSafe para iPhone 17. Agarre cómodo.", [
		C.negro,
		C.blanco,
		C.rosa,
		C.azul,
		C.verde
	], [])
];
var appleProductsSeed = [
	...iPhones,
	...iPads,
	...macs,
	...watches,
	...airpods,
	...tvCasa,
	...accesorios
];
var BATCH_SIZE = 450;
function SeedCatalogButton() {
	const [seeding, setSeeding] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(null);
	const runSeed = async () => {
		if (!window.confirm(`Esto va a agregar ${appleProductsSeed.length} productos nuevos a Firestore (no borra los existentes, ni evita duplicados si ya sembraste antes). ¿Continuar?`)) return;
		const { db } = getFirebase();
		if (!db) {
			toast.error("Firestore no está disponible");
			return;
		}
		setSeeding(true);
		let written = 0;
		try {
			for (let i = 0; i < appleProductsSeed.length; i += BATCH_SIZE) {
				const chunk = appleProductsSeed.slice(i, i + BATCH_SIZE);
				const batch = writeBatch(db);
				for (const p of chunk) {
					const ref = doc(collection(db, "products"));
					batch.set(ref, {
						name: p.name,
						price: p.price,
						category: p.category,
						image_url: p.image_url,
						description: p.description,
						biography: p.description,
						stock: p.stock,
						colorOptions: p.colorOptions,
						colors: p.colorOptions,
						storageOptions: p.storageOptions,
						storages: p.storageOptions,
						created_at: serverTimestamp()
					});
				}
				await batch.commit();
				written += chunk.length;
				setProgress(`${written} / ${appleProductsSeed.length}`);
			}
			toast.success(`Catálogo sembrado: ${written} productos agregados`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error al sembrar el catálogo");
		} finally {
			setSeeding(false);
			setProgress(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: runSeed,
		disabled: seeding,
		className: "inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-60",
		title: `Agrega los ${appleProductsSeed.length} productos del catálogo Apple a Firestore`,
		children: [seeding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatabaseZap, { className: "h-4 w-4" }), seeding ? progress ?? "Sembrando..." : "Sembrar catálogo completo"]
	});
}
function Dashboard() {
	const { user, logout } = useAuth();
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-fuchsia-50/40 dark:from-slate-950 dark:via-indigo-950/40 dark:to-fuchsia-950/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-10 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/60 dark:border-white/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center shadow-lg shadow-fuchsia-500/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-white" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-sm font-bold text-slate-900 dark:text-white leading-tight",
						children: "Admin de Productos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-slate-500 dark:text-slate-400",
						children: user?.email
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/catalogo",
						className: "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-fuchsia-500/30 hover:opacity-90 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-3.5 w-3.5" }), " Ver catálogo"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: async () => {
							await logout();
							toast.success("Sesión cerrada");
						},
						className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), " Salir"]
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductForm, {
				editing,
				onDone: () => setEditing(null)
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold text-slate-900 dark:text-white",
					children: "Productos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-2 sm:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: searchTerm,
							onChange: (e) => setSearchTerm(e.target.value),
							placeholder: "Buscar producto...",
							className: "w-full sm:w-56 bg-transparent outline-none placeholder:text-slate-400"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeedCatalogButton, {})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductList, {
				onEdit: setEditing,
				searchTerm
			})] })]
		})]
	});
}
//#endregion
export { Dashboard };
