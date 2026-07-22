import { o as __toESM } from "../_runtime.mjs";
import "../_libs/firebase.mjs";
import { i as updateDoc, l as serverTimestamp, o as collection, s as doc, t as addDoc } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getFirebase } from "./firebase-BwL9iHXg.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as Plus, n as Trash2, p as LoaderCircle, s as Save, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ProductForm-BfGZTqwy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function dispatchProductChanged(product) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("products-updated", { detail: {
		type: "upsert",
		product
	} }));
}
function dispatchProductRemoved(productId) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("products-updated", { detail: {
		type: "remove",
		productId
	} }));
}
function upsertProductInList(products, product) {
	const existingIndex = products.findIndex((item) => item.id === product.id);
	if (existingIndex >= 0) {
		const next = [...products];
		next[existingIndex] = product;
		return next;
	}
	return [product, ...products];
}
function removeProductInList(products, productId) {
	return products.filter((item) => item.id !== productId);
}
function normalizeProductData(product) {
	const normalizedColors = product.colorOptions ?? product.colors ?? product.color_options ?? [];
	const normalizedStorages = product.storageOptions ?? product.storages ?? product.storage_options ?? [];
	return {
		...product,
		name: product.name || product.product_name || "",
		description: product.description || product.biography || "",
		biography: product.biography || product.description || "",
		colorOptions: normalizedColors,
		colors: normalizedColors,
		storageOptions: normalizedStorages,
		storages: normalizedStorages
	};
}
function matchesProductSearch(product, term) {
	const normalizedTerm = term.trim().toLowerCase();
	if (!normalizedTerm) return true;
	const normalizedProduct = normalizeProductData(product);
	return [
		normalizedProduct.name,
		normalizedProduct.category,
		normalizedProduct.description,
		normalizedProduct.biography,
		normalizedProduct.price?.toString(),
		...(normalizedProduct.colorOptions || []).map((color) => `${color.name} ${color.hexColor}`),
		...(normalizedProduct.storageOptions || []).map((storage) => `${storage.capacity} ${storage.priceMultiplier}`)
	].some((field) => field?.toLowerCase().includes(normalizedTerm));
}
var CATEGORIES = [
	"iPhone",
	"iPad",
	"Mac",
	"Apple Watch",
	"AirPods",
	"TV y Casa",
	"Accesorios"
];
var emptyForm = {
	name: "",
	price: 0,
	category: CATEGORIES[0],
	image_url: "",
	description: "",
	stock: 50,
	colorOptions: [],
	storageOptions: []
};
function ProductForm({ editing, onDone }) {
	const [form, setForm] = (0, import_react.useState)(emptyForm);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (editing) {
			const normalized = normalizeProductData(editing);
			setForm({
				name: normalized.name,
				price: normalized.price ?? 0,
				category: normalized.category || CATEGORIES[0],
				image_url: normalized.image_url || normalized.imageURL || normalized.imageName || "",
				description: normalized.description || "",
				stock: normalized.stock ?? 50,
				colorOptions: normalized.colorOptions || [],
				storageOptions: normalized.storageOptions || []
			});
		} else setForm(emptyForm);
	}, [editing]);
	const addColor = () => {
		setForm((f) => ({
			...f,
			colorOptions: [...f.colorOptions || [], {
				name: "",
				hexColor: "#000000"
			}]
		}));
	};
	const updateColor = (index, patch) => {
		setForm((f) => ({
			...f,
			colorOptions: (f.colorOptions || []).map((c, i) => i === index ? {
				...c,
				...patch
			} : c)
		}));
	};
	const removeColor = (index) => {
		setForm((f) => ({
			...f,
			colorOptions: (f.colorOptions || []).filter((_, i) => i !== index)
		}));
	};
	const addStorage = () => {
		setForm((f) => ({
			...f,
			storageOptions: [...f.storageOptions || [], {
				capacity: "",
				priceMultiplier: 1
			}]
		}));
	};
	const updateStorage = (index, patch) => {
		setForm((f) => ({
			...f,
			storageOptions: (f.storageOptions || []).map((s, i) => i === index ? {
				...s,
				...patch
			} : s)
		}));
	};
	const removeStorage = (index) => {
		setForm((f) => ({
			...f,
			storageOptions: (f.storageOptions || []).filter((_, i) => i !== index)
		}));
	};
	const submit = async (e) => {
		e.preventDefault();
		const { db } = getFirebase();
		if (!db) return;
		const cleanColors = (form.colorOptions || []).filter((c) => c.name.trim() !== "" && c.hexColor.trim() !== "");
		const normalizedStorages = (form.storageOptions || []).filter((s) => s.capacity.trim() !== "").map((s) => ({
			capacity: s.capacity.trim(),
			priceMultiplier: Number(s.priceMultiplier) || 1
		}));
		setSaving(true);
		try {
			const payload = {
				name: form.name.trim(),
				price: Number(form.price),
				category: form.category,
				image_url: form.image_url?.trim() || "",
				description: form.description?.trim() || "",
				biography: form.description?.trim() || "",
				stock: Number(form.stock ?? 50),
				colorOptions: cleanColors,
				colors: cleanColors,
				storageOptions: normalizedStorages,
				storages: normalizedStorages
			};
			let savedProduct = null;
			if (editing) {
				await updateDoc(doc(db, "products", editing.id), payload);
				savedProduct = {
					...editing,
					...payload,
					id: editing.id
				};
				toast.success("Producto actualizado");
			} else {
				const ref = await addDoc(collection(db, "products"), {
					...payload,
					created_at: serverTimestamp()
				});
				savedProduct = {
					...payload,
					id: ref.id
				};
				toast.success("Producto agregado");
			}
			if (savedProduct) dispatchProductChanged(savedProduct);
			onDone();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error al guardar");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold text-slate-900 dark:text-white",
					children: editing ? "Editar producto" : "Nuevo producto"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-slate-500 dark:text-slate-400 mt-0.5",
					children: editing ? "Actualiza los datos y guarda" : "Completa el formulario para agregar un producto"
				})] }), editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onDone,
					className: "inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" }), " Cancelar"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nombre del producto",
						className: "md:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							}),
							className: inputCls,
							placeholder: "Ej. iPhone 13 Pro"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Precio",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							type: "number",
							step: "0.01",
							min: "0",
							value: form.price,
							onChange: (e) => setForm({
								...form,
								price: Number(e.target.value)
							}),
							className: inputCls
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Categoría",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: form.category,
							onChange: (e) => setForm({
								...form,
								category: e.target.value
							}),
							className: inputCls,
							children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Stock",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: "0",
							step: "1",
							value: form.stock ?? 50,
							onChange: (e) => setForm({
								...form,
								stock: Number(e.target.value)
							}),
							className: inputCls
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "URL de imagen",
						className: "md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "url",
							value: form.image_url,
							onChange: (e) => setForm({
								...form,
								image_url: e.target.value
							}),
							className: inputCls,
							placeholder: "https://..."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-slate-400 dark:text-slate-500",
							children: "Se muestra bien en la lista de productos (RemoteOrLocalImage soporta URLs). En la pantalla de detalle del producto todavía no, hasta aplicar el patch de ProductDetailView.swift."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Biografía (opcional)",
						className: "md:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 3,
							value: form.description,
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							}),
							className: inputCls + " resize-none",
							placeholder: "Detalles del producto"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/40 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300",
						children: "Vista previa del producto"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: addColor,
						className: "inline-flex items-center gap-1 text-[11px] font-medium text-fuchsia-600 dark:text-fuchsia-400",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Añadir color"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-wide text-slate-400",
							children: "Biografía"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-slate-600 dark:text-slate-300",
							children: form.description?.trim() || "Sin biografía aún"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-wide text-slate-400",
							children: "Colores"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: (form.colorOptions || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-slate-400",
								children: "Sin colores"
							}) : form.colorOptions?.map((color, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => updateColor(index, {
									name: color.name,
									hexColor: color.hexColor
								}),
								className: "inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-3 w-3 rounded-full border border-slate-300 dark:border-white/20",
									style: { backgroundColor: color.hexColor }
								}), color.name || "Sin nombre"]
							}, `${color.name}-${index}`))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-wide text-slate-400",
							children: "Gigas"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: (form.storageOptions || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-slate-400",
								children: "Sin capacidades"
							}) : form.storageOptions?.map((storage, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => updateStorage(index, {
									capacity: storage.capacity,
									priceMultiplier: storage.priceMultiplier
								}),
								className: "rounded-full border border-fuchsia-200 dark:border-fuchsia-500/20 bg-fuchsia-50 dark:bg-fuchsia-500/10 px-2.5 py-1 text-xs text-fuchsia-700 dark:text-fuchsia-300",
								children: storage.capacity || "Sin capacidad"
							}, `${storage.capacity}-${index}`))
						})] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide",
							children: "Colores (opcional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: addColor,
							className: "inline-flex items-center gap-1 text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-800 dark:hover:text-fuchsia-300 transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Agregar color"]
						})]
					}),
					(form.colorOptions || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-400 dark:text-slate-500 italic",
						children: "Sin colores. El selector de color no se mostrará en la app."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: (form.colorOptions || []).map((color, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "color",
									value: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color.hexColor) ? color.hexColor : "#000000",
									onChange: (e) => updateColor(i, { hexColor: e.target.value }),
									className: "h-9 w-10 shrink-0 rounded-md border border-slate-200 dark:border-white/10 bg-transparent cursor-pointer",
									title: "Elegir color"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: color.name,
									onChange: (e) => updateColor(i, { name: e.target.value }),
									className: inputCls,
									placeholder: "Nombre (ej. Azul medianoche)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: color.hexColor,
									onChange: (e) => updateColor(i, { hexColor: e.target.value }),
									className: inputCls + " w-28 shrink-0",
									placeholder: "#000000"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => removeColor(i),
									className: "shrink-0 rounded-md p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition",
									title: "Quitar",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						}, i))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide",
							children: "Capacidades / GB (opcional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: addStorage,
							className: "inline-flex items-center gap-1 text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-800 dark:hover:text-fuchsia-300 transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Agregar capacidad"]
						})]
					}),
					(form.storageOptions || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-400 dark:text-slate-500 italic",
						children: "Sin capacidades. Los botones de GB no se mostrarán en la app."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: (form.storageOptions || []).map((storage, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: storage.capacity,
									onChange: (e) => updateStorage(i, { capacity: e.target.value }),
									className: inputCls,
									placeholder: "Ej. 128GB"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									step: "0.01",
									min: "0",
									value: storage.priceMultiplier,
									onChange: (e) => updateStorage(i, { priceMultiplier: Number(e.target.value) }),
									className: inputCls + " w-36 shrink-0",
									placeholder: "Multiplicador (ej. 1.15)",
									title: "Multiplicador de precio sobre el precio base"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => removeStorage(i),
									className: "shrink-0 rounded-md p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition",
									title: "Quitar",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-[11px] text-slate-400 dark:text-slate-500",
						children: "El multiplicador se aplica sobre el precio base. Ej. si el precio base es $1000 y el multiplicador es 1.15, esa capacidad cuesta $1150."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "submit",
					disabled: saving,
					className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60",
					children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), editing ? "Guardar cambios" : "Agregar producto"]
				})
			})
		]
	});
}
var inputCls = "w-full rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-transparent transition";
function Field({ label, children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block " + className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1",
			children
		})]
	});
}
//#endregion
export { removeProductInList as a, normalizeProductData as i, dispatchProductRemoved as n, upsertProductInList as o, matchesProductSearch as r, ProductForm as t };
