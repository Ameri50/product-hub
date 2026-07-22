import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { matchesProductSearch, normalizeProductData, type Product } from "@/components/ProductForm";

export const Route = createFileRoute("/catalogo")({
  component: CatalogoPage,
});

function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const { db } = getFirebase();
    if (!db) return;
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const items = snap.docs.map((d) => {
        const raw = { id: d.id, ...(d.data() as Omit<Product, "id">) } as Product;
        return normalizeProductData(raw);
      });
      setProducts(items);
      setLoading(false);
    });
    return unsub;
  }, []);

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products],
  ) as string[];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = matchesProductSearch(p, deferredSearch);
      const matchesCategory = categoryFilter === "Todas" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, deferredSearch, products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Catálogo de productos</h1>
            <p className="text-slate-400 mt-1">Explora todos nuestros productos disponibles</p>
          </div>
          <Link
            to="/"
            className="text-sm text-slate-300 hover:text-white border border-white/10 rounded-lg px-4 py-2 transition"
          >
            Volver al panel
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg bg-slate-900/60 border border-white/10 px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg bg-slate-900/60 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/10 h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-center py-20">No se encontraron productos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((p) => {
              const description = p.description ?? (p as Product & { biography?: string }).biography ?? "";
              const colorOptions = (p.colorOptions ?? (p as Product & { colors?: typeof p.colorOptions }).colors ?? (p as Product & { color_options?: typeof p.colorOptions }).color_options ?? []) as Array<{ name: string; hexColor: string }>;
              const storageOptions = (p.storageOptions ?? (p as Product & { storages?: typeof p.storageOptions }).storages ?? (p as Product & { storage_options?: typeof p.storageOptions }).storage_options ?? []) as Array<{ capacity: string; priceMultiplier: number }>;
              return (
              <Link
                key={p.id}
                to="/catalogo/$productId"
                params={{ productId: p.id }}
                className="group rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20 transition-all hover:-translate-y-1"
              >
                <div className="relative h-44 bg-slate-800">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                      Sin imagen
                    </div>
                  )}
                  {p.category && (
                    <span className="absolute top-3 left-3 text-xs bg-black/60 text-white px-2.5 py-1 rounded-full">
                      {p.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold group-hover:text-fuchsia-400 transition line-clamp-2">
                    {p.name}
                  </h3>
                  {description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-fuchsia-400">S/ {Number(p.price).toFixed(2)}</span>
                    <span className="text-xs text-slate-400">Stock: {p.stock}</span>
                  </div>
                  {colorOptions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {colorOptions.slice(0, 3).map((color, index) => (
                        <span key={`${color.name}-${index}`} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color.hexColor }} />
                          {color.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {storageOptions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {storageOptions.slice(0, 3).map((storage, index) => (
                        <span key={`${storage.capacity}-${index}`} className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] text-fuchsia-200">
                          {storage.capacity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}