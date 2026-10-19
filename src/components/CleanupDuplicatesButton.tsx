import { useState } from "react";
import { collection, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, CopyX } from "lucide-react";

// Firestore permite hasta 500 operaciones por batch; usamos 450 por margen.
const BATCH_SIZE = 450;

type ProductDoc = {
  id: string;
  data: Record<string, unknown>;
  score: number;
};

function normalizeKey(name: unknown, category: unknown) {
  const n = typeof name === "string" ? name.trim().toLowerCase() : "";
  const c = typeof category === "string" ? category.trim().toLowerCase() : "";
  return `${n}|${c}`;
}

// Prioriza el documento más completo: con URL de imagen > descripción >
// opciones de color/capacidad > stock. Es el que quedará visible en la web.
function scoreDoc(data: Record<string, unknown>) {
  let score = 0;
  const image = data.image_url ?? data.imageURL;
  if (typeof image === "string" && /^https?:\/\//.test(image)) score += 8;
  const description = (data.description ?? data.biography ?? "") as string;
  if (typeof description === "string" && description.trim().length >= 18) score += 4;
  const colors = data.colorOptions ?? data.colors;
  if (Array.isArray(colors) && colors.length > 0) score += 2;
  const storages = data.storageOptions ?? data.storages;
  if (Array.isArray(storages) && storages.length > 0) score += 2;
  if (typeof data.stock === "number") score += 1;
  return score;
}

function timestampMillis(value: unknown): number {
  // Soporta Timestamp de Firestore ({seconds, nanoseconds}) y Date/ISO.
  if (value && typeof value === "object" && "seconds" in value) {
    const { seconds } = value as { seconds: number };
    return seconds * 1000;
  }
  const parsed = Date.parse(String(value ?? ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function CleanupDuplicatesButton() {
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const runCleanup = async () => {
    const confirmed = window.confirm(
      "Esto elimina las copias duplicadas de productos en Firestore, dejando solo el " +
        "ejemplar más completo de cada uno (con imagen y descripción). Antes de borrar " +
        "se descarga automáticamente un backup JSON. ¿Continuar?"
    );
    if (!confirmed) return;

    const { db } = getFirebase();
    if (!db) {
      toast.error("Firestore no está disponible");
      return;
    }

    setCleaning(true);
    try {
      const snap = await getDocs(collection(db, "products"));

      // Agrupar por nombre|categoría. Los docs sin nombre se tratan como únicos.
      const groups = new Map<string, ProductDoc[]>();
      snap.forEach((d) => {
        const data = d.data() as Record<string, unknown>;
        const key = normalizeKey(data.name ?? data.product_name, data.category);
        if (!key.startsWith("|")) {
          const list = groups.get(key) ?? [];
          list.push({ id: d.id, data, score: scoreDoc(data) });
          groups.set(key, list);
        }
      });

      const toDelete: string[] = [];
      for (const list of groups.values()) {
        if (list.length < 2) continue;
        const sorted = [...list].sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          const timeDiff = timestampMillis(b.data.created_at) - timestampMillis(a.data.created_at);
          if (timeDiff !== 0) return timeDiff;
          return a.id.localeCompare(b.id);
        });
        toDelete.push(...sorted.slice(1).map((d) => d.id));
      }

      if (toDelete.length === 0) {
        toast.success("No hay duplicados: el catálogo ya está limpio");
        return;
      }

      // Backup completo antes de tocar nada.
      const backup = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `productos-backup-${new Date().toISOString().slice(0, 19)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      let deleted = 0;
      for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
        const chunk = toDelete.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        for (const id of chunk) {
          batch.delete(doc(db, "products", id));
        }
        await batch.commit();
        deleted += chunk.length;
        setProgress(`${deleted} / ${toDelete.length}`);
      }

      toast.success(`Limpieza completa: ${toDelete.length} duplicados eliminados (${groups.size} productos únicos)`);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al limpiar duplicados");
    } finally {
      setCleaning(false);
      setProgress(null);
    }
  };

  return (
    <button
      type="button"
      onClick={runCleanup}
      disabled={cleaning}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-white dark:bg-slate-900/60 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-60"
      title="Elimina las copias duplicadas de productos, dejando el ejemplar más completo de cada uno"
    >
      {cleaning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CopyX className="h-4 w-4" />}
      {cleaning ? progress ?? "Limpiando..." : "Limpiar duplicados"}
    </button>
  );
}
