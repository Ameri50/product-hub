import { useState } from "react";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, DatabaseZap } from "lucide-react";
import { appleProductsSeed } from "@/lib/appleProductsSeed";

// Corta en lotes de 450 para quedar por debajo del límite de 500
// operaciones por batch que impone Firestore.
const BATCH_SIZE = 450;

export function SeedCatalogButton() {
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const runSeed = async () => {
    const confirmed = window.confirm(
      `Esto va a agregar ${appleProductsSeed.length} productos nuevos a Firestore ` +
        `(no borra los existentes, ni evita duplicados si ya sembraste antes). ¿Continuar?`
    );
    if (!confirmed) return;

    const { db } = getFirebase();
    if (!db) {
      toast.error("Firestore no está disponible");
      return;
    }

    setSeeding(true);
    let written = 0;

    try {
      for (let i = 0; i < appleProductsSeed.length; i += BATCH_SIZE) {
        const chunk = appleProductsSeed.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);

        for (const p of chunk) {
          const ref = doc(collection(db, "products"));
          batch.set(ref, {
            name: p.name,
            price: p.price,
            category: p.category,
            image_url: p.image_url,
            description: p.description,
            stock: p.stock,
            colorOptions: p.colorOptions,
            storageOptions: p.storageOptions,
            created_at: serverTimestamp(),
          });
        }

        await batch.commit();
        written += chunk.length;
        setProgress(`${written} / ${appleProductsSeed.length}`);
      }

      toast.success(`Catálogo sembrado: ${written} productos agregados`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al sembrar el catálogo");
    } finally {
      setSeeding(false);
      setProgress(null);
    }
  };

  return (
    <button
      type="button"
      onClick={runSeed}
      disabled={seeding}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-60"
      title={`Agrega los ${appleProductsSeed.length} productos del catálogo Apple a Firestore`}
    >
      {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />}
      {seeding ? progress ?? "Sembrando..." : "Sembrar catálogo completo"}
    </button>
  );
}