import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";

export const Route = createFileRoute("/catalogo/$productId")({
  component: ProductDetailPage,
});

type Product = {
  id: string;
  product_name: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
  imageURL?: string;
  description?: string;
};

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    const { db } = getFirebase();
    if (!db) return;
    const unsub = onSnapshot(doc(db, "products", productId), (snap) => {
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() } as Product);
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
              <img src={imageSrc} alt={product.product_name} className="w-full h-full object-cover" />
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
            <h1 className="text-3xl font-bold text-white mb-2">{product.product_name}</h1>
            <p className="text-3xl font-bold text-fuchsia-400 mb-4">${Number(product.price).toFixed(2)}</p>
            <p className="text-slate-400 mb-6">{product.description || "Sin descripción disponible."}</p>
            <div className="mt-auto text-sm text-slate-400">
              Stock disponible: <span className="text-white font-semibold">{product.stock}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}