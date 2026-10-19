import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, writeBatch, serverTimestamp, deleteDoc } from "firebase/firestore";

const app = initializeApp({ apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk", authDomain: "miapp-4a216.firebaseapp.com", projectId: "miapp-4a216" });
const auth = getAuth(app);
const db = getFirestore(app);
await signInWithEmailAndPassword(auth, "yo@gmail.com", "moises2004");
console.log("✅ Sesión OK");

const catalog = JSON.parse(readFileSync("/tmp/catalog-export/catalog.json", "utf8"));
const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/["”"'’]/g, "").replace(/\s+/g, " ");
const catalogByNormName = new Map(catalog.map((p) => [norm(p.name), p]));

const assetURL = (a) => `/assets/${a === "applepencil 1" ? "applepencil-1" : a === "AirTag 4 Pack" ? "airtag-4-pack" : a}.jpg`;
const JUNK_CATEGORIES = new Set(["electronics", "electrónica", "electronica", "otros", ""]);

const snap = await getDocs(collection(db, "products"));
console.log(`📊 Docs: ${snap.size}`);

// --- 1. Fusionar duplicados por nombre (ignora categoría) ---
const byNormName = new Map();
snap.forEach((d) => {
  const data = d.data();
  const key = norm(data.name ?? data.product_name);
  if (!key) return;
  if (!byNormName.has(key)) byNormName.set(key, []);
  byNormName.get(key).push({ id: d.id, data });
});

const deletions = [];
const imageFixes = [];

for (const [key, list] of byNormName) {
  if (list.length > 1) {
    // Keeper: el que coincide con el catálogo de la app; si no, el de categoría no-junk más completa
    const appEntry = catalogByNormName.get(key);
    let keeper;
    if (appEntry) {
      keeper = list.find((x) => norm(x.data.category) === norm(appEntry.category)) ?? list.find((x) => !JUNK_CATEGORIES.has(norm(x.data.category))) ?? list[0];
    } else {
      keeper = list.find((x) => !JUNK_CATEGORIES.has(norm(x.data.category))) ?? list[0];
    }
    for (const x of list) if (x.id !== keeper.id) deletions.push(x.id);
  }

  // --- 2. Imágenes rotas -> asset local ---
  const docInfo = list[0];
  const img = String(docInfo.data.image_url ?? docInfo.data.imageURL ?? "");
  const rota = !/^https?:\/\//.test(img) === false && (
    img.startsWith("https://i.blogs.es") ||
    img.startsWith("https://rimage.ripley.com.pe") ||
    img.startsWith("https://http2.mlstatic.com") ||
    img.startsWith("https://helios-i.mashable.com") ||
    img.startsWith("https://www.apple.com/v/") ||
    img.startsWith("https://www.apple.com/mx/")
  );
  if (rota) {
    const name = norm(docInfo.data.name);
    const cat = norm(docInfo.data.category);
    let asset = "Applicon";
    if (cat.includes("iphone") || name.includes("iphone")) asset = "iphone1";
    else if (cat.includes("ipad") || name.includes("ipad")) asset = name.includes("mini") ? "ipad01" : "ipad";
    else if (cat.includes("watch") || name.includes("watch")) asset = "applewatch";
    else if (cat.includes("airpod") || name.includes("airpod")) asset = "airpodspro";
    else if (cat.includes("mac") || name.includes("mac")) asset = name.includes("studio") || name.includes("mini") ? "desktopcomputer" : "macbook";
    else if (cat.includes("homepod") || name.includes("homepod")) asset = "hifispeaker";
    for (const x of list) if (x.id === (byNormName.get(key).find((y) => y.id !== deletions.includes(y.id)) ?? x).id) imageFixes.push({ id: x.id, asset });
  }
}

console.log(`🗑️  Duplicados por fusionar: ${deletions.length}`);
console.log(`🖼️  Imágenes rotas a reparar: ${new Set(imageFixes.map(f => f.id)).size} docs`);

// ejecutar deletes
for (const id of deletions) await deleteDoc(doc(db, "products", id));

// fixes de imagen (solo docs que siguen vivos)
const vivos = new Set(imageFixes.map((f) => f.id).filter((id) => !deletions.includes(id)));
const fixBatch = [];
for (const f of imageFixes) {
  if (deletions.includes(f.id)) continue;
  const url = assetURL(f.asset);
  fixBatch.push({ id: f.id, url });
}
for (let i = 0; i < fixBatch.length; i += 400) {
  const batch = writeBatch(db);
  for (const f of fixBatch.slice(i, i + 400)) {
    batch.set(doc(db, "products", f.id), { image_url: f.url, imageURL: f.url, updatedAt: serverTimestamp() }, { merge: true });
  }
  await batch.commit();
}
console.log(`✏️  Imágenes reparadas: ${fixBatch.length}`);

// --- Verificación final ---
const after = await getDocs(collection(db, "products"));
const byName2 = new Map();
let conImg = 0;
after.forEach((d) => {
  const data = d.data();
  const k = norm(data.name);
  byName2.set(k, (byName2.get(k) || 0) + 1);
  const img = String(data.image_url ?? data.imageURL ?? "");
  if (/^https?:\/\//.test(img) || img.startsWith("/assets/")) conImg++;
});
const dups = [...byName2.values()].filter((c) => c > 1).length;
console.log(`\n✅ FINAL: ${after.size} productos — ${conImg} con imagen, duplicados por nombre: ${dups}`);
