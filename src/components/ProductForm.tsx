import { useEffect, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, Plus, Save, X } from "lucide-react";

export type ProductInput = {
  name: string;
  price: number;
  category: string;
  image_url?: string;
  description?: string;
};

export type Product = ProductInput & {
  id: string;
  created_at?: unknown;
  // compatibilidad con productos antiguos de la app Flutter
  product_name?: string;
  imageName?: string;
  imageURL?: string;
  stock?: number;
};

const CATEGORIES = ["iPhone", "iPad", "Mac", "Apple Watch", "Accesorios", "Otros"];

export function ProductForm({
  editing,
  onDone,
}: {
  editing: Product | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState<ProductInput>({
    name: "",
    price: 0,
    category: CATEGORIES[0],
    image_url: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || editing.product_name || "",
        price: editing.price,
        category: editing.category,
        image_url: editing.image_url || editing.imageURL || "",
        description: editing.description || "",
      });
    } else {
      setForm({ name: "", price: 0, category: CATEGORIES[0], image_url: "", description: "" });
    }
  }, [editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { db } = getFirebase();
    if (!db) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category,
        image_url: form.image_url?.trim() || "",
        description: form.description?.trim() || "",
      };
      if (editing) {
        await updateDoc(doc(db, "products", editing.id), payload);
        toast.success("Producto actualizado");
      } else {
        await addDoc(collection(db, "products"), { ...payload, created_at: serverTimestamp() });
        toast.success("Producto agregado");
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
        <Field label="URL de imagen (opcional)" className="md:col-span-2">
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className={inputCls}
            placeholder="https://..."
          />
        </Field>
        <Field label="Descripción (opcional)" className="md:col-span-2">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputCls + " resize-none"}
            placeholder="Detalles del producto"
          />
        </Field>
      </div>

      <div className="mt-5 flex justify-end">
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