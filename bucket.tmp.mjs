import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, listAll } from "firebase/storage";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({ apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk", authDomain: "miapp-4a216.firebaseapp.com", projectId: "miapp-4a216", storageBucket: "miapp-4a216.firebasestorage.app" });
const auth = getAuth(app);
await signInWithEmailAndPassword(auth, "yo@gmail.com", "moises2004");
const storage = getStorage(app);

const root = await listAll(ref(storage, "/"));
const porPrefijo = {};
let total = 0, objetos = 0;
const grandes = [];
for (const carpeta of root.prefixes) {
  const l = await listAll(ref(storage, carpeta.fullPath));
  let t = 0;
  for (const it of l.items) { t += Number(it.size ?? 0); objetos++; total += Number(it.size ?? 0); if ((it.size ?? 0) > 300*1024) grandes.push(`${(it.size/1024/1024).toFixed(1)}MB ${it.fullPath}`); }
  porPrefijo[carpeta.fullPath] = (t/1024/1024).toFixed(1);
}
for (const it of root.items) { total += Number(it.size ?? 0); objetos++; porPrefijo["(raíz)"] = ((porPrefijo["(raíz)"]?Number(porPrefijo["(raíz)"]):0) + it.size/1024/1024).toFixed(1); }
console.log("Carpetas (MB):", JSON.stringify(porPrefijo));
console.log(`Objetos: ${objetos}, total: ${(total/1024/1024).toFixed(1)} MB`);
console.log("Archivos >300KB:");
grandes.sort().slice(0, 25).forEach(g => console.log("  " + g));

// muestra de URL existente
const db = getFirestore(app);
const snap = await getDocs(collection(db, "products"));
for (const d of snap.docs) {
  const u = String(d.data().image_url ?? "");
  if (u.includes("firebasestorage")) { console.log("URL ejemplo:", u.slice(0, 120)); break; }
}
