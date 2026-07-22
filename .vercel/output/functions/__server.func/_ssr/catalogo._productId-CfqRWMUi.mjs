import { o as __toESM } from "../_runtime.mjs";
import "../_libs/firebase.mjs";
import { r as onSnapshot, s as doc } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getFirebase } from "./firebase-BwL9iHXg.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as normalizeProductData } from "./ProductForm-BfGZTqwy.mjs";
import { t as Route } from "./catalogo._productId-BFVGR7Hm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalogo._productId-CfqRWMUi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductDetailPage() {
	const { productId } = Route.useParams();
	const [product, setProduct] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		const { db } = getFirebase();
		if (!db) return;
		return onSnapshot(doc(db, "products", productId), (snap) => {
			if (snap.exists()) {
				const raw = {
					id: snap.id,
					...snap.data()
				};
				setProduct(normalizeProductData(raw));
			} else setProduct(null);
		});
	}, [productId]);
	if (product === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-slate-400",
			children: "Cargando..."
		})
	});
	if (product === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 flex flex-col items-center justify-center gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-slate-300 text-lg",
			children: "Producto no encontrado."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/catalogo",
			className: "text-fuchsia-400 hover:underline",
			children: "Volver al catálogo"
		})]
	});
	const imageSrc = product.image_url || product.imageURL;
	const productName = product.name || product.product_name || "Producto";
	const description = product.description ?? product.biography ?? "";
	const colorOptions = product.colorOptions ?? product.colors ?? product.color_options ?? [];
	const storageOptions = product.storageOptions ?? product.storages ?? product.storage_options ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-4xl mx-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/catalogo",
				className: "inline-block mb-6 text-sm text-slate-300 hover:text-white border border-white/10 rounded-lg px-4 py-2 transition",
				children: "← Volver al catálogo"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl overflow-hidden bg-slate-800 h-80 md:h-full",
					children: imageSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: imageSrc,
						alt: productName,
						className: "w-full h-full object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full h-full flex items-center justify-center text-slate-600",
						children: "Sin imagen"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col",
					children: [
						product.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-block w-fit text-xs bg-fuchsia-500/20 text-fuchsia-300 px-3 py-1 rounded-full mb-3",
							children: product.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl font-bold text-white mb-2",
							children: productName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-3xl font-bold text-fuchsia-400 mb-4",
							children: ["S/ ", Number(product.price).toFixed(2)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold uppercase tracking-wide text-slate-300 mb-2",
								children: "Biografía"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-slate-400 leading-relaxed",
								children: description || "Sin biografía disponible."
							})]
						}),
						colorOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold uppercase tracking-wide text-slate-300 mb-2",
								children: "Colores"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: colorOptions.map((color, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-slate-200",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-3.5 w-3.5 rounded-full border border-white/20",
										style: { backgroundColor: color.hexColor }
									}), color.name]
								}, `${color.name}-${index}`))
							})]
						}),
						storageOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold uppercase tracking-wide text-slate-300 mb-2",
								children: "Gigas"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: storageOptions.map((storage, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-200",
									children: storage.capacity
								}, `${storage.capacity}-${index}`))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-auto text-sm text-slate-400",
							children: ["Stock disponible: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-white font-semibold",
								children: product.stock
							})]
						})
					]
				})]
			})]
		})
	});
}
//#endregion
export { ProductDetailPage as component };
