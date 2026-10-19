const fs = require("fs");
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk",
  authDomain: "miapp-4a216.firebaseapp.com",
  projectId: "miapp-4a216",
  storageBucket: "miapp-4a216.appspot.com",
  messagingSenderId: "492885584086",
  appId: "1:492885584086:web:83e9569499d61a1f42f410",
};

(async () => {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  await signInWithEmailAndPassword(auth, "yo@gmail.com", "moises2004");
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, "products"));
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log("Total docs:", products.length);

  // 1) Imágenes compartidas
  const byImg = new Map();
  for (const p of products) {
    const img = (p.image_url || p.imageURL || "").toString().trim();
    if (!byImg.has(img)) byImg.set(img, []);
    byImg.get(img).push(p);
  }
  const groups = [...byImg.entries()].filter(([, arr]) => arr.length > 1).sort((a, b) => b[1].length - a[1].length);
  const sinImg = [...byImg.get("") || []];
  console.log("URLs de imagen únicas:", byImg.size);
  console.log("Productos sin imagen:", sinImg.length);
  console.log("Grupos que comparten imagen:", groups.length);
  const necesitados = groups.reduce((acc, [, arr]) => acc + (arr.length - 1), 0);
  console.log("Imágenes nuevas necesarias (mínimo):", necesitados);

  const resumen = {};
  for (const [img, arr] of groups) {
    const cats = {};
    arr.forEach((p) => (cats[p.category || "?"] = (cats[p.category || "?"] || 0) + 1));
    const key = img.startsWith("/assets/") ? img : img.slice(0, 90);
    resumen[key] = { n: arr.length, cats };
  }
  console.log("\n— Top grupos —");
  groups.slice(0, 15).forEach(([img, arr]) => {
    const cats = {};
    arr.forEach((p) => (cats[p.category || "?"] = (cats[p.category || "?"] || 0) + 1));
    console.log(`${arr.length}x  ${img.slice(0, 70)}  ${JSON.stringify(cats)}`);
  });

  // 2) Nombres parecidos a "iPhone 18 Pro"
  const norm = (s) => (s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const names = products.map((p) => p.name);
  console.log("\n— Docs con '18 pro' en nombre —");
  products.filter((p) => /18\s*pro/i.test(p.name || "")).forEach((p) => console.log(`  [${p.category}] ${p.name} | img=${(p.image_url || "").slice(0, 60)}`));

  // 3) Nombres duplicados exactos
  const byName = {};
  products.forEach((p) => {
    const k = norm(p.name);
    (byName[k] = byName[k] || []).push(p);
  });
  const dupNames = Object.entries(byName).filter(([, a]) => a.length > 1);
  console.log("\nNombres duplicados exactos:", dupNames.length);
  dupNames.forEach(([k, a]) => console.log("  DUP:", a.map((p) => `${p.name}[${p.category}]`).join(" | ")));

  fs.writeFileSync("/tmp/audit-productos.json", JSON.stringify({ total: products.length, grupos: groups.map(([img, arr]) => ({ img, productos: arr.map((p) => ({ id: p.id, name: p.name, category: p.category })) })) }, null, 2));
})();
