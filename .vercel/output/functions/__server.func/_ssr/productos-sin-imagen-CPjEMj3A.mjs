import { o as __toESM } from "../_runtime.mjs";
import "../_libs/firebase.mjs";
import { a as updateDoc, c as doc, r as onSnapshot, s as collection } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getFirebase } from "./firebase-nyhvcZA1.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as normalizeProductData, i as getProductSearchText, n as dispatchProductChanged } from "./ProductForm-BH1sAVMJ.mjs";
import { n as writeCachedProducts, t as readCachedProducts } from "./product-cache-DsASDscr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/productos-sin-imagen-CPjEMj3A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductsWithoutImagePage() {
	const [products, setProducts] = (0, import_react.useState)(() => readCachedProducts());
	const [loading, setLoading] = (0, import_react.useState)(() => readCachedProducts().length === 0);
	const [search, setSearch] = (0, import_react.useState)("");
	const [imageUrls, setImageUrls] = (0, import_react.useState)({});
	const [savingId, setSavingId] = (0, import_react.useState)(null);
	const deferredSearch = (0, import_react.useDeferredValue)(search);
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
	const saveImageUrl = async (product) => {
		const url = (imageUrls[product.id] || "").trim();
		if (!url) return;
		const { db } = getFirebase();
		if (!db) return;
		setSavingId(product.id);
		try {
			await updateDoc(doc(db, "products", product.id), { image_url: url });
			const updated = normalizeProductData({
				...product,
				image_url: url
			});
			setProducts((current) => current.map((item) => item.id === product.id ? updated : item));
			dispatchProductChanged(updated);
			setImageUrls((prev) => ({
				...prev,
				[product.id]: ""
			}));
		} catch (err) {
			console.error(err);
		} finally {
			setSavingId(null);
		}
	};
	const productsWithSearch = (0, import_react.useMemo)(() => products.map((product) => ({
		product,
		searchText: getProductSearchText(product)
	})), [products]);
	const filteredProducts = (0, import_react.useMemo)(() => {
		const normalizedSearch = deferredSearch.trim().toLowerCase();
		return productsWithSearch.filter(({ product, searchText }) => !product.image_url?.trim() && (!normalizedSearch || searchText.includes(normalizedSearch))).map(({ product }) => product);
	}, [deferredSearch, productsWithSearch]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-fuchsia-50/40 dark:from-slate-950 dark:via-indigo-950/40 dark:to-fuchsia-950/40 px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold text-slate-900 dark:text-white",
					children: "Productos sin imagen ni enlace"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-slate-500 dark:text-slate-400 mt-1",
					children: "Revisa cada producto y completa su imagen o link en una sola pestaña."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-400",
							children: "Buscar:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Buscar producto...",
							className: "w-full min-w-[180px] bg-transparent outline-none placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition",
						children: "Volver al panel"
					})]
				})]
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4",
				children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 h-28 animate-pulse" }, i))
			}) : filteredProducts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-slate-700 dark:text-slate-300",
					children: "No hay productos sin imagen o link."
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: filteredProducts.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 p-4 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold text-slate-900 dark:text-white",
								children: product.name || product.product_name || "Producto sin nombre"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-slate-500 dark:text-slate-400 mt-1",
								children: ["Categoría: ", product.category || "Sin categoría"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-slate-500 dark:text-slate-400 mt-1",
								children: ["Precio: S/ ", Number(product.price ?? 0).toFixed(2)]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-semibold dark:bg-rose-500/10 dark:text-rose-200",
								children: "Sin imagen"
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-slate-600 dark:text-slate-300",
							children: product.description || product.biography || "Sin descripción disponible."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 p-3 text-sm text-slate-700 dark:text-slate-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1",
									children: "Link de imagen"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: imageUrls[product.id] ?? "",
									onChange: (e) => setImageUrls((prev) => ({
										...prev,
										[product.id]: e.target.value
									})),
									placeholder: "https://...",
									className: "w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => saveImageUrl(product),
									disabled: savingId === product.id || !imageUrls[product.id]?.trim(),
									className: "inline-flex items-center justify-center rounded-full bg-fuchsia-500 px-4 py-2 text-xs font-semibold text-white hover:bg-fuchsia-400 transition disabled:cursor-not-allowed disabled:opacity-50",
									children: savingId === product.id ? "Guardando..." : "Guardar imagen"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/catalogo/$productId",
									params: { productId: product.id },
									className: "inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition",
									children: "Abrir producto"
								})]
							})]
						})]
					})]
				}, product.id))
			})]
		})
	});
}
//#endregion
export { ProductsWithoutImagePage as component };
