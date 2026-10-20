// Reanudación: aplica las asignaciones pendientes + eliminaciones, tolerante a fallos
const fs = require("fs");
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk",
  authDomain: "miapp-4a216.firebaseapp.com",
  projectId: "miapp-4a216",
  storageBucket: "miapp-4a216.appspot.com",
  messagingSenderId: "492885584086",
  appId: "1:492885584086:web:83e9569499d61a1f42f410",
};

(async () => {
  const pendientes = JSON.parse(fs.readFileSync("/tmp/pendientes.json", "utf8"));
  const { eliminar } = JSON.parse(fs.readFileSync("/tmp/asignaciones-finales.json", "utf8"));
  const app = initializeApp(firebaseConfig);
  await signInWithEmailAndPassword(getAuth(app), "yo@gmail.com", "moises2004");
  const db = getFirestore(app);

  const snap = await getDocs(collection(db, "products"));
  const map = new Map(snap.docs.map((d) => [d.id, d]));
  console.log("Docs actuales:", map.size, "| Pendientes:", pendientes.length);

  let ok = 0;
  const fallos = [];
  for (const a of pendientes) {
    if (!map.has(a.id)) { fallos.push("INEXISTENTE " + a.nombre + " (" + a.id + ")"); continue; }
    try {
      await updateDoc(doc(db, "products", a.id), { image_url: a.a, updatedAt: serverTimestamp() });
      ok++;
    } catch (e) {
      fallos.push(a.nombre + " (" + a.id + "): " + e.code);
    }
  }
  console.log("Actualizadas:", ok, "| Fallos:", fallos.length);
  fallos.forEach((f) => console.log("  ⚠️", f));

  let borrados = 0;
  for (const id of eliminar || []) {
    try { await deleteDoc(doc(db, "products", id)); borrados++; }
    catch (e) { console.log("  ⚠️ no borrado", id, e.code); }
  }
  console.log("Eliminados:", borrados);
})();
