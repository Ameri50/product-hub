import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { normalizeProductData, type Product } from "@/components/ProductForm";

export const Route = createFileRoute("/catalogo/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    const { db } = getFirebase();
    if (!db) return;
    const unsub = onSnapshot(doc(db, "products", productId), (snap) => {
      if (snap.exists()) {
        const raw = { id: snap.id, ...(snap.data() as Omit<Product, "id">) } as Product;
        setProduct(normalizeProductData(raw));
      } else {
        setProduct(null);
      }
    });
    return unsub;
  }, [productId]);

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 flex items-center justify-center">
        <div className="text-slate-400">Cargando...</div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-300 text-lg">Producto no encontrado.</p>
        <Link to="/catalogo" className="text-fuchsia-400 hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const imageSrc = product.image_url || product.imageURL;
  const productName = product.name || product.product_name || "Producto";
  const description = product.description ?? (product as Product & { biography?: string }).biography ?? "";
  const colorOptions = (product.colorOptions ?? (product as Product & { colors?: typeof product.colorOptions }).colors ?? (product as Product & { color_options?: typeof product.colorOptions }).color_options ?? []) as Array<{ name: string; hexColor: string }>;
  const storageOptions = (product.storageOptions ?? (product as Product & { storages?: typeof product.storageOptions }).storages ?? (product as Product & { storage_options?: typeof product.storageOptions }).storage_options ?? []) as Array<{ capacity: string; priceMultiplier: number }>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/catalogo"
          className="inline-block mb-6 text-sm text-slate-300 hover:text-white border border-white/10 rounded-lg px-4 py-2 transition"
        >
          ← Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <div className="rounded-xl overflow-hidden bg-slate-800 h-80 md:h-full">
            {imageSrc ? (
              <img src={imageSrc} alt={productName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                Sin imagen
              </div>
            )}
          </div>

          <div className="flex flex-col">
            {product.category && (
              <span className="inline-block w-fit text-xs bg-fuchsia-500/20 text-fuchsia-300 px-3 py-1 rounded-full mb-3">
                {product.category}
              </span>
            )}
            <h1 className="text-3xl font-bold text-white mb-2">{productName}</h1>
            <p className="text-3xl font-bold text-fuchsia-400 mb-4">S/ {Number(product.price).toFixed(2)}</p>

            <section className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-2">Biografía</h2>
              <p className="text-slate-400 leading-relaxed">{description || "Sin biografía disponible."}</p>
            </section>

            {colorOptions.length > 0 && (
              <section className="mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-2">Colores</h2>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color, index) => (
                    <div key={`${color.name}-${index}`} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-slate-200">
                      <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ backgroundColor: color.hexColor }} />
                      {color.name}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {storageOptions.length > 0 && (
              <section className="mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-2">Gigas</h2>
                <div className="flex flex-wrap gap-2">
                  {storageOptions.map((storage, index) => (
                    <span key={`${storage.capacity}-${index}`} className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-200">
                      {storage.capacity}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-auto text-sm text-slate-400">
              Stock disponible: <span className="text-white font-semibold">{product.stock}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}