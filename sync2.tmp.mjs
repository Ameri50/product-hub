import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, addDoc, serverTimestamp, writeBatch } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk",
  authDomain: "miapp-4a216.firebaseapp.com",
  projectId: "miapp-4a216",
});
const auth = getAuth(app);
const db = getFirestore(app);
await signInWithEmailAndPassword(auth, "yo@gmail.com", "moises2004");
console.log("✅ Sesión admin OK");

// URL-safe names for files generated in public/assets
const URL_SAFE = { "applepencil 1": "applepencil-1", "AirTag 4 Pack": "airtag-4-pack" };
const ASSETS = new Set(["iphone1","iphone2","iphone3","ipad","ipad01","macbook","macbook2","macbook3","imac","desktopcomputer","applewatch","airpods","airpodspro","keyboard","mouse","Applicon","auri","hifispeaker","reloj","adapter","cable","applepencil","applepencil 1","trackpad","mouse2","airtag","AirTag 4 Pack"]);
const assetURL = (a) => `/assets/${URL_SAFE[a] ?? a}.jpg`;

const catalog = JSON.parse(readFileSync("/tmp/catalog-export/catalog.json", "utf8"));
console.log(`📱 Catálogo app: ${catalog.length} productos`);

const resolveImage = (src) => {
  if (!src) return "";
  if (/^https?:\/\//.test(src)) return src;
  if (src === "sf:tv.fill") return assetURL("Applicon");
  return ASSETS.has(src) ? assetURL(src) : assetURL("Applicon");
};

const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/["”"'’]/g, "").replace(/\s+/g, " ");
const isHttp = (s) => /^https?:\/\//.test(String(s ?? ""));
const storageAsset = (url) => {
  try {
    const u = new URL(url);
    if (!u.host.includes("firebasestorage")) return null;
    const path = decodeURIComponent(u.pathname.split("/o/")[1] ?? "");
    const m = path.match(/^products\/(.+)\.(png|jpg|jpeg)$/i);
    return m ? m[1] : null;
  } catch { return null; }
};

const snap = await getDocs(collection(db, "products"));
const byName = new Map();
snap.forEach((d) => {
  const data = d.data();
  const key = norm(data.name ?? data.product_name);
  if (!key || !byName.has(key)) byName.set(key, { id: d.id, data });
});
console.log(`🌐 Firestore: ${snap.size} docs`);

let agregados = 0;
const updates = [];
const catalogKeys = new Set();

for (const p of catalog) {
  const key = norm(p.name);
  catalogKeys.add(key);
  const image = resolveImage(p.imageName);
  const additionalImages = (p.additionalImages ?? []).map(resolveImage).filter(Boolean);
  const existing = byName.get(key);

  if (!existing) {
    await addDoc(collection(db, "products"), {
      name: p.name,
      price: Number(p.price),
      category: p.category,
      image_url: image,
      imageURL: image,
      imageName: p.imageName,
      description: p.description,
      biography: p.description,
      stock: Number(p.stock ?? 50),
      colorOptions: p.colorOptions,
      colors: p.colorOptions,
      storageOptions: p.storageOptions,
      storages: p.storageOptions,
      rating: Number(p.rating ?? 4.5),
      reviewCount: Number(p.reviewCount ?? 0),
      isOnSale: Boolean(p.isOnSale),
      discount: Number(p.discount ?? 0),
      inStock: true,
      additionalImages,
      created_at: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    agregados++;
  } else {
    const img = existing.data.image_url ?? existing.data.imageURL ?? "";
    if (!isHttp(img) && !String(img).startsWith("/assets/") && image) {
      updates.push({ id: existing.id, image_url: image, imageURL: image });
    }
  }
}
console.log(`➕ Agregados: ${agregados}`);

// Migrar URLs de Storage -> /assets/ (alivia la cuota diaria de Firebase)
let migrados = 0;
for (const { id, data } of byName.values()) {
  const img = String(data.image_url ?? data.imageURL ?? "");
  if (!img.includes("firebasestorage")) continue;
  const asset = storageAsset(img);
  if (asset && ASSETS.has(asset)) {
    updates.push({ id, image_url: assetURL(asset), imageURL: assetURL(asset) });
    migrados++;
  }
}
console.log(`🔁 A migrar de Storage: ${migrados}`);

// Rellenar los que siguen sin imagen (sin match en catálogo)
let rellenados = 0;
for (const [key, { id, data }] of byName) {
  if (catalogKeys.has(key)) continue;
  const img = data.image_url ?? data.imageURL ?? "";
  if (isHttp(img) || String(img).startsWith("/assets/")) continue;
  const cat = String(data.category ?? "").toLowerCase();
  let asset = "Applicon";
  if (cat.includes("iphone")) asset = "iphone1";
  else if (cat.includes("ipad")) asset = "ipad";
  else if (cat.includes("watch")) asset = "applewatch";
  else if (cat.includes("airpod")) asset = "airpodspro";
  else if (cat.includes("mac")) asset = "macbook";
  else if (cat.includes("tv") || cat.includes("casa") || cat.includes("homepod")) asset = "hifispeaker";
  updates.push({ id, image_url: assetURL(asset), imageURL: assetURL(asset) });
  rellenados++;
}

// Ejecutar updates en batches
let hechos = 0;
for (let i = 0; i < updates.length; i += 400) {
  const batch = writeBatch(db);
  for (const u of updates.slice(i, i + 400)) {
    batch.set(doc(db, "products", u.id), { image_url: u.image_url, imageURL: u.imageURL, updatedAt: serverTimestamp() }, { merge: true });
  }
  await batch.commit();
  hechos += Math.min(400, updates.length - i);
  console.log(`💾 ${hechos}/${updates.length}`);
}
console.log(`✏️  Updates: ${updates.length} (${migrados} migrados de Storage, ${rellenados} rellenados por categoría)`);

// Verificación
const after = await getDocs(collection(db, "products"));
let conImg = 0, sinImg = 0, enStorage = 0;
after.forEach((d) => {
  const img = String(d.data().image_url ?? d.data().imageURL ?? "");
  if (img.includes("firebasestorage")) enStorage++;
  if (isHttp(img) || img.startsWith("/assets/")) conImg++; else sinImg++;
});
console.log(`\n✅ FINAL: ${after.size} productos — ${conImg} con imagen, ${sinImg} sin imagen, ${enStorage} aún en Storage`);
