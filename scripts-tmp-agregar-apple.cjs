const fs = require("fs");
const path = require("path");
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  signInWithEmailAndPassword,
} = require("firebase/auth");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk",
  authDomain: "miapp-4a216.firebaseapp.com",
  projectId: "miapp-4a216",
  storageBucket: "miapp-4a216.appspot.com",
  messagingSenderId: "492885584086",
  appId: "1:492885584086:web:83e9569499d61a1f42f410",
};

const norm = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

(async () => {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  await signInWithEmailAndPassword(auth, "yo@gmail.com", "moises2004");
  console.log("✅ Sesión admin OK");
  const db = getFirestore(app);

  const snap = await getDocs(collection(db, "products"));
  const existing = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log("🌐 Firestore:", existing.length, "docs");

  const backupPath = path.resolve(
    "/Users/moisesrojas/Documents/productos",
    `productos-backup-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`
  );
  fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2));
  console.log("💾 Backup:", backupPath);

  const apple = JSON.parse(
    fs.readFileSync(
      "/Users/moisesrojas/Documents/Qoder/2026-10-19/cf58ccb2/apple-store-productos.json",
      "utf8"
    )
  ).productos;

  const byName = new Map();
  for (const p of existing) byName.set(norm(p.name), p);

  let creados = 0;
  let actualizados = 0;
  const cambios = [];

  for (const a of apple) {
    // "iPhone 18 Pro y 18 Pro Max" -> buscar coincidencia exacta o por partes
    const partes = a.nombre
      .replace(/^iPhone\s+(\d+)\s+Pro y\s+.*Pro Max$/i, "")
      .split(/\sy\s/i)
      .map(norm)
      .filter(Boolean);
    let target = byName.get(norm(a.nombre));
    if (!target && partes.length > 1) {
      for (const parte of partes) {
        const cand = byName.get(parte);
        if (cand) {
          target = cand;
          break;
        }
      }
    }

    const base = {
      name: a.nombre,
      price: a.precio,
      category: a.categoria,
      image_url: a.url_imagen,
      description: "Producto oficial de Apple vendido en la Apple Store España.",
      stock: 10,
      updatedAt: serverTimestamp(),
    };

    if (target) {
      await updateDoc(doc(db, "products", target.id), base);
      actualizados++;
      cambios.push({ accion: "actualizado", nombre: a.nombre, doc: target.id });
      console.log(`🔁 Actualizado: "${a.nombre}" -> doc existente "${target.name}"`);
    } else {
      const ref = await addDoc(collection(db, "products"), {
        ...base,
        created_at: serverTimestamp(),
      });
      byName.set(norm(a.nombre), { id: ref.id, ...base });
      creados++;
      cambios.push({ accion: "creado", nombre: a.nombre, doc: ref.id });
      console.log(`➕ Creado: ${a.nombre}`);
    }
  }

  fs.writeFileSync(
    "/Users/moisesrojas/Documents/Qoder/2026-10-19/cf58ccb2/cambios-apple.json",
    JSON.stringify(cambios, null, 2)
  );
  console.log(`\n✅ Creados: ${creados} | Actualizados: ${actualizados}`);
})();
