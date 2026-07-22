import { useEffect, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, Plus, Save, X, Trash2 } from "lucide-react";
import { dispatchProductChanged } from "@/lib/product-sync";

// ---------------------------------------------------------------------------
// Tipos — deben calzar 1:1 con lo que lee ProductStore.swift.parseProduct(),
// que es la fuente real de datos de ProductListView (no FirebaseProductManager,
// ese solo se usa para el seed inicial en AppDelegate.swift).
// ---------------------------------------------------------------------------
export type ColorOption = {
  name: string;
  hexColor: string;
};

export type StorageOption = {
  capacity: string;
  priceMultiplier: number;
};

export type ProductInput = {
  name: string;
  price: number;
  category: string;
  image_url?: string;
  description?: string;
  biography?: string;
  stock?: number;
  colorOptions?: ColorOption[];
  colors?: ColorOption[];
  color_options?: ColorOption[];
  storageOptions?: StorageOption[];
  storages?: StorageOption[];
  storage_options?: StorageOption[];
};

export type Product = ProductInput & {
  id: string;
  created_at?: unknown;
  // compatibilidad con productos antiguos / otros formatos
  product_name?: string;
  imageName?: string;
  imageURL?: string;
};

export function normalizeProductData(product: Partial<Product> & Record<string, unknown>): Product {
  const normalizedColors = (product.colorOptions ?? product.colors ?? product.color_options ?? []) as ColorOption[];
  const normalizedStorages = (product.storageOptions ?? product.storages ?? product.storage_options ?? []) as StorageOption[];

  return {
    ...(product as Product),
    name: product.name || product.product_name || "",
    description: product.description || product.biography || "",
    biography: product.biography || product.description || "",
    colorOptions: normalizedColors,
    colors: normalizedColors,
    storageOptions: normalizedStorages,
    storages: normalizedStorages,
  } as Product;
}

export function matchesProductSearch(product: Partial<Product>, term: string) {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) return true;

  const normalizedProduct = normalizeProductData(product as Partial<Product> & Record<string, unknown>);
  const searchableFields = [
    normalizedProduct.name,
    normalizedProduct.category,
    normalizedProduct.description,
    normalizedProduct.biography,
    normalizedProduct.price?.toString(),
    ...(normalizedProduct.colorOptions || []).map((color) => `${color.name} ${color.hexColor}`),
    ...(normalizedProduct.storageOptions || []).map((storage) => `${storage.capacity} ${storage.priceMultiplier}`),
  ];

  return searchableFields.some((field) => field?.toLowerCase().includes(normalizedTerm));
}

// Mismas categorías que usa la app (HomeView.swift / CategoryView.swift)
const CATEGORIES = ["iPhone", "iPad", "Mac", "Apple Watch", "AirPods", "TV y Casa", "Accesorios"];

const emptyForm: ProductInput = {
  name: "",
  price: 0,
  category: CATEGORIES[0],
  image_url: "",
  description: "",
  stock: 50,
  colorOptions: [],
  storageOptions: [],
};

export function ProductForm({
  editing,
  onDone,
}: {
  editing: Product | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      const normalized = normalizeProductData(editing);

      setForm({
        name: normalized.name,
        price: normalized.price ?? 0,
        category: normalized.category || CATEGORIES[0],
        // ProductStore.swift lee "image_url" primero, luego "imageURL" como fallback
        image_url: normalized.image_url || normalized.imageURL || normalized.imageName || "",
        description: normalized.description || "",
        stock: normalized.stock ?? 50,
        colorOptions: normalized.colorOptions || [],
        storageOptions: normalized.storageOptions || [],
      });
    } else {
      setForm(emptyForm);
    }
  }, [editing]);

  // --- Colores ---
  const addColor = () => {
    setForm((f) => ({
      ...f,
      colorOptions: [...(f.colorOptions || []), { name: "", hexColor: "#000000" }],
    }));
  };
  const updateColor = (index: number, patch: Partial<ColorOption>) => {
    setForm((f) => ({
      ...f,
      colorOptions: (f.colorOptions || []).map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));
  };
  const removeColor = (index: number) => {
    setForm((f) => ({
      ...f,
      colorOptions: (f.colorOptions || []).filter((_, i) => i !== index),
    }));
  };

  // --- Capacidades ---
  const addStorage = () => {
    setForm((f) => ({
      ...f,
      storageOptions: [...(f.storageOptions || []), { capacity: "", priceMultiplier: 1 }],
    }));
  };
  const updateStorage = (index: number, patch: Partial<StorageOption>) => {
    setForm((f) => ({
      ...f,
      storageOptions: (f.storageOptions || []).map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  };
  const removeStorage = (index: number) => {
    setForm((f) => ({
      ...f,
      storageOptions: (f.storageOptions || []).filter((_, i) => i !== index),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { db } = getFirebase();
    if (!db) return;

    const cleanColors = (form.colorOptions || []).filter(
      (c) => c.name.trim() !== "" && c.hexColor.trim() !== ""
    );
    const cleanStorages = (form.storageOptions || []).filter((s) => s.capacity.trim() !== "");
    const normalizedStorages = cleanStorages.map((s) => ({
      capacity: s.capacity.trim(),
      priceMultiplier: Number(s.priceMultiplier) || 1,
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
        storages: normalizedStorages,
      };
      let savedProduct: Product | null = null;
      if (editing) {
        await updateDoc(doc(db, "products", editing.id), payload);
        savedProduct = { ...editing, ...payload, id: editing.id } as Product;
        toast.success("Producto actualizado");
      } else {
        const ref = await addDoc(collection(db, "products"), { ...payload, created_at: serverTimestamp() });
        savedProduct = { ...payload, id: ref.id } as Product;
        toast.success("Producto agregado");
      }
      if (savedProduct) {
        dispatchProductChanged(savedProduct);
      }
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {editing ? "Editar producto" : "Nuevo producto"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {editing ? "Actualiza los datos y guarda" : "Completa el formulario para agregar un producto"}
          </p>
        </div>
        {editing && (
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
          >
            <X className="h-3.5 w-3.5" /> Cancelar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nombre del producto" className="md:col-span-2">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
            placeholder="Ej. iPhone 13 Pro"
          />
        </Field>
        <Field label="Precio">
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
        <Field label="Categoría">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Stock">
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock ?? 50}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
        <Field label="URL de imagen" className="md:col-span-2">
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className={inputCls}
            placeholder="https://..."
          />
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Se muestra bien en la lista de productos (RemoteOrLocalImage soporta URLs). En la pantalla de
            detalle del producto todavía no, hasta aplicar el patch de ProductDetailView.swift.
          </p>
        </Field>
        <Field label="Biografía (opcional)" className="md:col-span-2">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputCls + " resize-none"}
            placeholder="Detalles del producto"
          />
        </Field>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Vista previa del producto
          </span>
          <button
            type="button"
            onClick={addColor}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-fuchsia-600 dark:text-fuchsia-400"
          >
            <Plus className="h-3.5 w-3.5" /> Añadir color
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Biografía</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{form.description?.trim() || "Sin biografía aún"}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Colores</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(form.colorOptions || []).length === 0 ? (
                <span className="text-xs text-slate-400">Sin colores</span>
              ) : (
                form.colorOptions?.map((color, index) => (
                  <button
                    key={`${color.name}-${index}`}
                    type="button"
                    onClick={() => updateColor(index, { name: color.name, hexColor: color.hexColor })}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300"
                  >
                    <span className="h-3 w-3 rounded-full border border-slate-300 dark:border-white/20" style={{ backgroundColor: color.hexColor }} />
                    {color.name || "Sin nombre"}
                  </button>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Gigas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(form.storageOptions || []).length === 0 ? (
                <span className="text-xs text-slate-400">Sin capacidades</span>
              ) : (
                form.storageOptions?.map((storage, index) => (
                  <button
                    key={`${storage.capacity}-${index}`}
                    type="button"
                    onClick={() => updateStorage(index, { capacity: storage.capacity, priceMultiplier: storage.priceMultiplier })}
                    className="rounded-full border border-fuchsia-200 dark:border-fuchsia-500/20 bg-fuchsia-50 dark:bg-fuchsia-500/10 px-2.5 py-1 text-xs text-fuchsia-700 dark:text-fuchsia-300"
                  >
                    {storage.capacity || "Sin capacidad"}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Colores */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
            Colores (opcional)
          </span>
          <button
            type="button"
            onClick={addColor}
            className="inline-flex items-center gap-1 text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-800 dark:hover:text-fuchsia-300 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar color
          </button>
        </div>
        {(form.colorOptions || []).length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            Sin colores. El selector de color no se mostrará en la app.
          </p>
        )}
        <div className="space-y-2">
          {(form.colorOptions || []).map((color, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color.hexColor) ? color.hexColor : "#000000"}
                onChange={(e) => updateColor(i, { hexColor: e.target.value })}
                className="h-9 w-10 shrink-0 rounded-md border border-slate-200 dark:border-white/10 bg-transparent cursor-pointer"
                title="Elegir color"
              />
              <input
                value={color.name}
                onChange={(e) => updateColor(i, { name: e.target.value })}
                className={inputCls}
                placeholder="Nombre (ej. Azul medianoche)"
              />
              <input
                value={color.hexColor}
                onChange={(e) => updateColor(i, { hexColor: e.target.value })}
                className={inputCls + " w-28 shrink-0"}
                placeholder="#000000"
              />
              <button
                type="button"
                onClick={() => removeColor(i)}
                className="shrink-0 rounded-md p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                title="Quitar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Capacidades / GB */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
            Capacidades / GB (opcional)
          </span>
          <button
            type="button"
            onClick={addStorage}
            className="inline-flex items-center gap-1 text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-800 dark:hover:text-fuchsia-300 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar capacidad
          </button>
        </div>
        {(form.storageOptions || []).length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            Sin capacidades. Los botones de GB no se mostrarán en la app.
          </p>
        )}
        <div className="space-y-2">
          {(form.storageOptions || []).map((storage, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={storage.capacity}
                onChange={(e) => updateStorage(i, { capacity: e.target.value })}
                className={inputCls}
                placeholder="Ej. 128GB"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={storage.priceMultiplier}
                onChange={(e) => updateStorage(i, { priceMultiplier: Number(e.target.value) })}
                className={inputCls + " w-36 shrink-0"}
                placeholder="Multiplicador (ej. 1.15)"
                title="Multiplicador de precio sobre el precio base"
              />
              <button
                type="button"
                onClick={() => removeStorage(i)}
                className="shrink-0 rounded-md p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                title="Quitar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          El multiplicador se aplica sobre el precio base. Ej. si el precio base es $1000 y el multiplicador es 1.15,
          esa capacidad cuesta $1150.
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : editing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {editing ? "Guardar cambios" : "Agregar producto"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-transparent transition";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={"block " + className}>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}