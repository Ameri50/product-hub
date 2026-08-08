import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { dispatchProductChanged } from "@/lib/product-sync";
import { readCachedProducts, writeCachedProducts } from "@/lib/product-cache";
import { getProductSearchText, normalizeProductData, type Product } from "@/components/ProductForm";

export const Route = createFileRoute("/productos-sin-imagen")({
  component: ProductsWithoutImagePage,
});

function ProductsWithoutImagePage() {
  const [products, setProducts] = useState<Product[]>(() => readCachedProducts());
  const [loading, setLoading] = useState(() => readCachedProducts().length === 0);
  const [search, setSearch] = useState("");
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const { db } = getFirebase();
    if (!db) return;

    const cachedProducts = readCachedProducts();
    if (cachedProducts.length > 0) {
      setProducts(cachedProducts);
      setLoading(false);
    }

    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const items = snap.docs.map((d) => {
        const raw = { id: d.id, ...(d.data() as Omit<Product, "id">) } as Product;
        return normalizeProductData(raw);
      });

      writeCachedProducts(items);
      setProducts(items);
      setLoading(false);
    });

    return unsub;
  }, []);

  const saveImageUrl = async (product: Product) => {
    const url = (imageUrls[product.id] || "").trim();
    if (!url) return;

    const { db } = getFirebase();
    if (!db) return;

    setSavingId(product.id);
    try {
      await updateDoc(doc(db, "products", product.id), { image_url: url });
      const updated = normalizeProductData({ ...product, image_url: url });
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? updated : item)),
      );
      dispatchProductChanged(updated);
      setImageUrls((prev) => ({ ...prev, [product.id]: "" }));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const productsWithSearch = useMemo(
    () => products.map((product) => ({ product, searchText: getProductSearchText(product) })),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    return productsWithSearch
      .filter(({ product, searchText }) => !product.image_url?.trim() && (!normalizedSearch || searchText.includes(normalizedSearch)))
      .map(({ product }) => product);
  }, [deferredSearch, productsWithSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-fuchsia-50/40 dark:from-slate-950 dark:via-indigo-950/40 dark:to-fuchsia-950/40 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Productos sin imagen ni enlace</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Revisa cada producto y completa su imagen o link en una sola pestaña.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="text-slate-400">Buscar:</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full min-w-[180px] bg-transparent outline-none placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
              />
            </label>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Volver al panel
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 h-28 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center">
            <p className="text-slate-700 dark:text-slate-300">No hay productos sin imagen o link.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 p-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{product.name || product.product_name || "Producto sin nombre"}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Categoría: {product.category || "Sin categoría"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Precio: S/ {Number(product.price ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-semibold dark:bg-rose-500/10 dark:text-rose-200">
                      Sin imagen
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {product.description || product.biography || "Sin descripción disponible."}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 p-3 text-sm text-slate-700 dark:text-slate-200">
                      <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Link de imagen</span>
                      <input
                        value={imageUrls[product.id] ?? ""}
                        onChange={(e) => setImageUrls((prev) => ({ ...prev, [product.id]: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100"
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveImageUrl(product)}
                        disabled={savingId === product.id || !imageUrls[product.id]?.trim()}
                        className="inline-flex items-center justify-center rounded-full bg-fuchsia-500 px-4 py-2 text-xs font-semibold text-white hover:bg-fuchsia-400 transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingId === product.id ? "Guardando..." : "Guardar imagen"}
                      </button>
                      <Link
                        to="/catalogo/$productId"
                        params={{ productId: product.id }}
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                      >
                        Abrir producto
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
