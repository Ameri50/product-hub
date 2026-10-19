import { writeFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, writeBatch } from "firebase/firestore";

const EMAIL = "yo@gmail.com";
const PASSWORD = "moises2004";
const BATCH_SIZE = 450;

const app = initializeApp({
  apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk",
  authDomain: "miapp-4a216.firebaseapp.com",
  projectId: "miapp-4a216",
});
const auth = getAuth(app);
const db = getFirestore(app);

await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
console.log("✅ Sesión admin OK");

const snap = await getDocs(collection(db, "products"));
console.log(`📊 Documentos leídos: ${snap.size}`);

function serialize(value) {
  if (value && typeof value === "object" && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000).toISOString();
  }
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialize(v)]));
  }
  return value;
}

// Backup completo
const backup = snap.docs.map((d) => ({ id: d.id, ...serialize(d.data()) }));
const backupPath = `/Users/moisesrojas/Documents/productos/productos-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
writeFileSync(backupPath, JSON.stringify(backup, null, 2));
console.log(`💾 Backup guardado: ${backupPath} (${backup.length} docs)`);

const keyOf = (d) => {
  const n = (d.name ?? d.product_name ?? "");
  const c = (d.category ?? "");
  return `${String(n).trim().toLowerCase()}|${String(c).trim().toLowerCase()}`;
};
const scoreOf = (d) => {
  let s = 0;
  const img = d.image_url ?? d.imageURL ?? "";
  if (/^https?:\/\//.test(String(img))) s += 8;
  const desc = String(d.description ?? d.biography ?? "").trim();
  if (desc.length >= 18) s += 4;
  if (Array.isArray(d.colorOptions ?? d.colors) && (d.colorOptions ?? d.colors).length > 0) s += 2;
  if (Array.isArray(d.storageOptions ?? d.storages) && (d.storageOptions ?? d.storages).length > 0) s += 2;
  if (typeof d.stock === "number") s += 1;
  return s;
};
const millisOf = (d) => {
  const v = d.created_at;
  if (v && typeof v === "object" && typeof v.seconds === "number") return v.seconds * 1000;
  const p = Date.parse(String(v ?? ""));
  return Number.isNaN(p) ? 0 : p;
};

const groups = new Map();
for (const d of snap.docs) {
  const data = d.data();
  const key = keyOf(data);
  if (key.startsWith("|")) continue; // sin nombre: no tocar
  const list = groups.get(key) ?? [];
  list.push({ id: d.id, data });
  groups.set(key, list);
}

const toDelete = [];
for (const list of groups.values()) {
  if (list.length < 2) continue;
  const sorted = [...list].sort((a, b) => {
    const diff = scoreOf(b.data) - scoreOf(a.data);
    if (diff !== 0) return diff;
    const t = millisOf(b.data) - millisOf(a.data);
    if (t !== 0) return t;
    return a.id.localeCompare(b.id);
  });
  toDelete.push(...sorted.slice(1).map((x) => x.id));
}

console.log(`🔍 Grupos únicos: ${groups.size} — a eliminar: ${toDelete.length}`);

let deleted = 0;
for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
  const chunk = toDelete.slice(i, i + BATCH_SIZE);
  const batch = writeBatch(db);
  for (const id of chunk) batch.delete(doc(db, "products", id));
  await batch.commit();
  deleted += chunk.length;
  console.log(`🗑️  ${deleted}/${toDelete.length}`);
}

// Verificación final
const after = await getDocs(collection(db, "products"));
let conImagen = 0, sinImagen = 0;
after.forEach((d) => {
  const img = d.data().image_url ?? d.data().imageURL ?? "";
  if (/^https?:\/\//.test(String(img))) conImagen++; else sinImagen++;
});
console.log(`✅ LIMPIEZA COMPLETA: ${after.size} docs finales (${conImagen} con imagen URL, ${sinImagen} sin imagen)`);
