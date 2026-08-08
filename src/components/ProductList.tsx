import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { Boxes, ImageOff, Package, Pencil, Tag, Trash2 } from "lucide-react";
import { getFirebase } from "@/lib/firebase";
import { dispatchProductRemoved, removeProductInList, upsertProductInList } from "@/lib/product-sync";
import { getProductSearchText, matchesProductSearch, normalizeProductData, type Product } from "./ProductForm";
import { readCachedProducts, writeCachedProducts } from "@/lib/product-cache";

export function ProductList({
  onEdit,
  searchTerm = "",
}: {
  onEdit: (p: Product) => void;
  searchTerm?: string;
}) {
  const [products, setProducts] = useState<Product[] | null>(() => readCachedProducts());
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const { db } = getFirebase();
    if (!db) return;

    const cachedProducts = readCachedProducts();
    if (cachedProducts.length > 0) {
      setProducts(cachedProducts);
    }

    const unsub = onSnapshot(
      collection(db, "products"),
      (snap) => {
        const items = snap.docs.map((d) => {
          const raw = {
            id: d.id,
            ...(d.data() as Omit<Product, "id">),
          } as Product;

          return normalizeProductData(raw);
        });

        writeCachedProducts(items);
        setProducts(items);
      },
      (err) => {
        toast.error("Error al cargar productos: " + err.message);
        setProducts(readCachedProducts());
      },
    );

    const handleExternalProductChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        type: "upsert" | "remove";
        product?: Product;
        productId?: string;
      }>;

      const detail = customEvent.detail;
      if (!detail) return;

      setProducts((current) => {
        if (!current) return current;

        if (detail.type === "upsert" && detail.product) {
          return upsertProductInList(current, normalizeProductData(detail.product));
        }

        if (detail.type === "remove" && detail.productId) {
          return removeProductInList(current, detail.productId);
        }

        return current;
      });
    };

    window.addEventListener("products-updated", handleExternalProductChange as EventListener);

    return () => {
      window.removeEventListener("products-updated", handleExternalProductChange as EventListener);
      unsub();
    };
  }, []);

  const remove = async (p: Product) => {
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

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const productsWithSearch = useMemo(() => {
    return (products ?? []).map((product) => ({
      product,
      searchText: getProductSearchText(product),
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedTerm = deferredSearchTerm.trim().toLowerCase();
    if (!normalizedTerm) return products ?? [];

    return productsWithSearch
      .filter((item) => item.searchText.includes(normalizedTerm))
      .map((item) => item.product);
  }, [productsWithSearch, deferredSearchTerm, products]);

  // ✅ Ya puedes hacer el return del loading
  if (products === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900/60 h-80"
          />
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center">
        <Package className="mx-auto h-10 w-10 text-slate-400" />
        <h3 className="mt-3 font-semibold text-slate-800 dark:text-white">
          Sin productos
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          No hay productos que coincidan con la búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredProducts.map((p) => {
        const imageSrc = p.image_url;
        const description = p.description ?? (p as Product & { biography?: string }).biography ?? "";
        const colorOptions = (p.colorOptions ?? (p as Product & { colors?: typeof p.colorOptions }).colors ?? (p as Product & { color_options?: typeof p.colorOptions }).color_options ?? []) as Array<{ name: string; hexColor: string }>;
        const storageOptions = (p.storageOptions ?? (p as Product & { storages?: typeof p.storageOptions }).storages ?? (p as Product & { storage_options?: typeof p.storageOptions }).storage_options ?? []) as Array<{ capacity: string; priceMultiplier: number }>;

        return (
          <article
            key={p.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-lg shadow-slate-200/40 dark:shadow-black/40 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/10 flex flex-col"
          >
            <div className="aspect-video w-full bg-gradient-to-br from-indigo-100 to-fuchsia-100 dark:from-indigo-950/50 dark:to-fuchsia-950/50 relative overflow-hidden">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={p.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
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

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm">{p.name}</h3>
              {description && (
                <div className="mt-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Biografía</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{description}</p>
                </div>
              )}

              {colorOptions.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Colores</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {colorOptions.slice(0, 3).map((c, i) => (
                      <div
                        key={`${c.name || "color"}-${c.hexColor || "#000"}-${i}`}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5"
                        title={c.name}
                      >
                        <div
                          className="h-3 w-3 rounded-full border border-slate-300 dark:border-white/20"
                          style={{ backgroundColor: c.hexColor }}
                        />
                        <span className="text-[10px] text-slate-600 dark:text-slate-300">{c.name}</span>
                      </div>
                    ))}
                    {colorOptions.length > 3 && (
                      <span className="text-[10px] text-slate-500 ml-1">+{colorOptions.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              {storageOptions.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Gigas</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {storageOptions.slice(0, 3).map((storage, i) => (
                      <span
                        key={`${storage.capacity || "storage"}-${storage.priceMultiplier || 1}-${i}`}
                        className="rounded-full border border-fuchsia-200 dark:border-fuchsia-500/20 bg-fuchsia-50 dark:bg-fuchsia-500/10 px-2 py-0.5 text-[10px] text-fuchsia-700 dark:text-fuchsia-300"
                      >
                        {storage.capacity}
                      </span>
                    ))}
                    {storageOptions.length > 3 && (
                      <span className="text-[10px] text-slate-500 ml-1">+{storageOptions.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                  S/ {Number(p.price).toFixed(2)}
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