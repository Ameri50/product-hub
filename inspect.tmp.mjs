import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({ apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk", authDomain: "miapp-4a216.firebaseapp.com", projectId: "miapp-4a216" });
const auth = getAuth(app);
const db = getFirestore(app);
await signInWithEmailAndPassword(auth, "yo@gmail.com", "moises2004");

const snap = await getDocs(collection(db, "products"));
const dominios = {};
snap.forEach((d) => {
  const img = String(d.data().image_url ?? d.data().imageURL ?? "");
  if (!img.startsWith("http")) return;
  try { const h = new URL(img).host; dominios[h] = (dominios[h] || 0) + 1; } catch {}
});
console.log("Dominios de imágenes:", JSON.stringify(dominios, null, 2));

const res = await fetch("https://firebasestorage.googleapis.com/v0/b/miapp-4a216.firebasestorage.app/o?maxResults=1000");
const j = await res.json();
const items = j.items ?? [];
let total = 0;
const porPrefijo = {};
for (const it of items) {
  total += Number(it.size || 0);
  const pref = it.name.split("/")[0] || "(raíz)";
  porPrefijo[pref] = (porPrefijo[pref] || 0) + Number(it.size || 0);
}
console.log(`Objetos: ${items.length}, total: ${(total/1024/1024).toFixed(1)} MB`);
console.log("Por prefijo (MB):", Object.fromEntries(Object.entries(porPrefijo).map(([k,v])=>[k,(v/1024/1024).toFixed(1)])));
