import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { Product } from "./ProductForm";
import { toast } from "sonner";
import { Package, Pencil, Trash2, ImageOff, Tag, Boxes } from "lucide-react";

export function ProductList({ onEdit }: { onEdit: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const { db } = getFirebase();
    if (!db) return;
    const unsub = onSnapshot(
      collection(db, "products"),
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) })));
      },
      (err) => {
        toast.error("Error al cargar productos: " + err.message);
        setProducts([]);
      },
    );
    return unsub;
  }, []);

  const remove = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.product_name}"?`)) return;
    const { db } = getFirebase();
    if (!db) return;
    setDeleting(p.id);
    try {
      await deleteDoc(doc(db, "products", p.id));
      toast.success("Producto eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  if (products === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900/60 h-72"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center">
        <Package className="mx-auto h-10 w-10 text-slate-400" />
        <h3 className="mt-3 font-semibold text-slate-800 dark:text-white">Sin productos</h3>
        <p className="mt-1 text-sm text-slate-500">Agrega tu primer producto usando el formulario.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => {
        const imageSrc = p.image_url || p.imageURL;
        return (
          <article
            key={p.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-lg shadow-slate-200/40 dark:shadow-black/40 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/10"
          >
            <div className="aspect-video w-full bg-gradient-to-br from-indigo-100 to-fuchsia-100 dark:from-indigo-950/50 dark:to-fuchsia-950/50 relative overflow-hidden">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={p.product_name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => ((e.currentTarget.style.display = "none"))}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-white">
                <Tag className="h-3 w-3" /> {p.category}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">{p.product_name}</h3>
              {p.description && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                  ${Number(p.price).toFixed(2)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Boxes className="h-3.5 w-3.5" /> {p.stock}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onEdit(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
                <button
                  disabled={deleting === p.id}
                  onClick={() => remove(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-medium transition disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> {deleting === p.id ? "..." : "Eliminar"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}