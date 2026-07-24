import { o as __toESM } from "../_runtime.mjs";
import "../_libs/firebase.mjs";
import { r as onSnapshot, s as collection } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getFirebase } from "./firebase-nyhvcZA1.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as normalizeProductData, r as matchesProductSearch } from "./ProductForm-D5EXkFqJ.mjs";
import { n as writeCachedProducts, t as readCachedProducts } from "./product-cache-DsASDscr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalogo-CHlJIQ8a.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CatalogoPage() {
	const [products, setProducts] = (0, import_react.useState)(() => readCachedProducts());
	const [loading, setLoading] = (0, import_react.useState)(() => readCachedProducts().length === 0);
	const [search, setSearch] = (0, import_react.useState)("");
	const [categoryFilter, setCategoryFilter] = (0, import_react.useState)("Todas");
	(0, import_react.useEffect)(() => {
		const { db } = getFirebase();
		if (!db) return;
		const cachedProducts = readCachedProducts();
		if (cachedProducts.length > 0) {
			setProducts(cachedProducts);
			setLoading(false);
		}
		return onSnapshot(collection(db, "products"), (snap) => {
			const items = snap.docs.map((d) => {
				return normalizeProductData({
					id: d.id,
					...d.data()
				});
			});
			writeCachedProducts(items);
			setProducts(items);
			setLoading(false);
		});
	}, []);
	const categories = (0, import_react.useMemo)(() => ["Todas", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))], [products]);
	const filtered = (0, import_react.useMemo)(() => {
		return products.filter((p) => {
			const matchesSearch = matchesProductSearch(p, search);
			const matchesCategory = categoryFilter === "Todas" || p.category === categoryFilter;
			return matchesSearch && matchesCategory;
		});
	}, [
		categoryFilter,
		products,
		search
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-6xl mx-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-bold text-white",
						children: "Catálogo de productos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-slate-400 mt-1",
						children: "Explora todos nuestros productos disponibles"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "text-sm text-slate-300 hover:text-white border border-white/10 rounded-lg px-4 py-2 transition",
						children: "Volver al panel"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-4 mb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						placeholder: "Buscar producto...",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						className: "flex-1 rounded-lg bg-slate-900/60 border border-white/10 px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: categoryFilter,
						onChange: (e) => setCategoryFilter(e.target.value),
						className: "rounded-lg bg-slate-900/60 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60",
						children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c,
							children: c
						}, c))
					})]
				}),
				loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
					children: [...Array(8)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rounded-2xl bg-white/5 border border-white/10 h-72 animate-pulse" }, i))
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-slate-400 text-center py-20",
					children: "No se encontraron productos."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
					children: filtered.map((p) => {
						const description = p.description ?? p.biography ?? "";
						const colorOptions = p.colorOptions ?? p.colors ?? p.color_options ?? [];
						const storageOptions = p.storageOptions ?? p.storages ?? p.storage_options ?? [];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/catalogo/$productId",
							params: { productId: p.id },
							className: "group rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20 transition-all hover:-translate-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative h-44 bg-slate-800",
								children: [p.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: p.image_url,
									alt: p.name,
									className: "w-full h-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full h-full flex items-center justify-center text-slate-600 text-sm",
									children: "Sin imagen"
								}), p.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute top-3 left-3 text-xs bg-black/60 text-white px-2.5 py-1 rounded-full",
									children: p.category
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-white font-semibold group-hover:text-fuchsia-400 transition line-clamp-2",
										children: p.name
									}),
									description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-slate-400 mt-1 line-clamp-2",
										children: description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between mt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-lg font-bold text-fuchsia-400",
											children: ["S/ ", Number(p.price).toFixed(2)]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-slate-400",
											children: ["Stock: ", p.stock]
										})]
									}),
									colorOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 flex flex-wrap gap-1",
										children: colorOptions.slice(0, 3).map((color, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "h-2.5 w-2.5 rounded-full",
												style: { backgroundColor: color.hexColor }
											}), color.name]
										}, `${color.name}-${index}`))
									}),
									storageOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 flex flex-wrap gap-1",
										children: storageOptions.slice(0, 3).map((storage, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] text-fuchsia-200",
											children: storage.capacity
										}, `${storage.capacity}-${index}`))
									})
								]
							})]
						}, p.id);
					})
				})
			]
		})
	});
}
//#endregion
export { CatalogoPage as component };
