// Fase 2 v3 FINAL: guardas por tipo + anti-cruce + generaciones + fallback por niveles
const fs = require("fs");
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const MODO = process.argv[2] === "aplicar" ? "aplicar" : "simular";

const firebaseConfig = {
  apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk",
  authDomain: "miapp-4a216.firebaseapp.com",
  projectId: "miapp-4a216",
  storageBucket: "miapp-4a216.appspot.com",
  messagingSenderId: "492885584086",
  appId: "1:492885584086:web:83e9569499d61a1f42f410",
};

const norm = (s) =>
  (s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const colores = {
  black: ["negro", "black", "midnight", "medianoche"],
  white: ["blanco", "white", "starlight", "plata", "silver"],
  blue: ["azul", "blue", "ultramarine", "ultramar"],
  green: ["verde", "green"],
  pink: ["rosa", "pink"],
  gold: ["gold", "oro", "dorado"],
  red: ["rojo", "red", "burdeos", "product red"],
  yellow: ["amarillo", "yellow"],
  purple: ["morado", "purpura", "purple"],
  orange: ["naranja", "orange"],
  graphite: ["grafito", "graphite", "space black", "spaceblack", "negro espacial"],
  titanium: ["titanio", "titanium", "desert"],
  lavender: ["lavanda", "lavender"],
  sage: ["salvia", "sage"],
  mistblue: ["azul neblina", "mistblue"],
  spacegray: ["gris espacial", "space gray", "spacegray", "spacegrey"],
};

function colorDe(nombre) {
  const n = " " + norm(nombre) + " ";
  for (const [clave, palabras] of Object.entries(colores)) {
    for (const p of palabras) if (n.includes(" " + norm(p) + " ")) return clave;
  }
  return null;
}

const SOLO_LAPIZ = /pencil|lapiz/;
const SOLO_TECLADO = /keyboard|folio/;
const SOLO_BANDA = /grid-|band-unselect|-band-|bands|loop(?!-gallery)|braided|sport-band/;
const SOLO_CASE = /-case-|case-unselect|cases/;
const SOLO_CARGADOR = /adapter|charger|power-|witb|usbc|usb-c/;

// tipo de producto: accesorios específicos primero, dispositivos después
function tipoProducto(p) {
  const n = norm(p.name || "");
  if (/airtag/.test(n)) return "acc-airtag";
  if (/pencil|lapiz/.test(n)) return "acc-pencil";
  if (/keyboard|teclado|folio/.test(n)) return "acc-keyboard";
  if (/trackpad/.test(n)) return "acc-trackpad";
  if (/mouse|raton/.test(n)) return "acc-mouse";
  if (/cable/.test(n)) return "acc-cable";
  if (/vesa/.test(n)) return "acc-vesa";
  if (/cargador|adaptador|adapter|power adapter/.test(n)) return "acc-power";
  if (/car mount/.test(n)) return "acc-carmount";
  if (/wallet/.test(n)) return "acc-wallet";
  if (/funda|case|carcasa/.test(n)) return "acc-case";
  if (/correa|band|loop|link|cinta|leather/.test(n)) return "acc-band";
  if (/display/.test(n)) return "display";
  if (/apple tv|appletv/.test(n)) return "appletv";
  if (/homepod/.test(n)) return "homepod";
  if (/airpod/.test(n)) return "airpods";
  if (/beats/.test(n)) return "beats";
  if (/iphone/.test(n)) return "iphone";
  if (/ipad/.test(n)) return "ipad";
  if (/watch|reloj/.test(n)) return "watch";
  if (/macbook/.test(n)) return "macbook";
  if (/imac/.test(n)) return "imac";
  if (/mac mini/.test(n)) return "mac-mini";
  if (/mac studio/.test(n)) return "mac-studio";
  if (/mac pro/.test(n)) return "mac-pro";
  if (/^mac\b|mac\b/.test(n)) return "mac";
  const cat = (p.category || "").toLowerCase();
  if (cat.includes("accesorio")) return "acc-cualquiera";
  return "cualquiera";
}

const FAMILIA = {
  iphone: "iphone", ipad: "ipad", watch: "watch", macbook: "mac", imac: "mac", "mac-mini": "mac", "mac-studio": "mac", "mac-pro": "mac", mac: "mac",
  display: "mac", appletv: "appletv", homepod: "homepod", airpods: "airpods", beats: "beats",
};

function antiCruce(tipo, s) {
  // los dispositivos nunca reciben imágenes de otra familia
  if (!FAMILIA[tipo]) return true;
  const tieneOtra =
    /iphone/.test(s) && FAMILIA[tipo] !== "iphone" ||
    /ipad/.test(s) && FAMILIA[tipo] !== "ipad" ||
    /watch/.test(s) && FAMILIA[tipo] !== "watch" ||
    /macbook|imac|mac-|macmini|mac studio|macbookpro|refurb mb|refurb imac|refurb mac/.test(s) && FAMILIA[tipo] !== "mac" ||
    /homepod/.test(s) && FAMILIA[tipo] !== "homepod" ||
    /apple-?tv|appletv/.test(s) && FAMILIA[tipo] !== "appletv" ||
    /airpod/.test(s) && FAMILIA[tipo] !== "airpods" ||
    /beats/.test(s) && FAMILIA[tipo] !== "beats";
  return !tieneOtra;
}

function gateOK(tipo, item, p) {
  const s = item.slug.toLowerCase().replace(/[_\-/.]/g, " ");
  const n = norm(p.name || "");
  if (!antiCruce(tipo, s)) return false;

  // imágenes de un solo tipo de accesorio solo sirven para ese accesorio
  if (SOLO_LAPIZ.test(s) && tipo !== "acc-pencil") return false;
  if (SOLO_TECLADO.test(s) && tipo !== "acc-keyboard") return false;
  if (SOLO_BANDA.test(s) && tipo !== "acc-band" && tipo !== "watch") return false;
  if (SOLO_CASE.test(s) && tipo !== "acc-case" && tipo !== "watch") return false;
  if (SOLO_CARGADOR.test(s) && tipo !== "acc-power" && tipo !== "acc-cable") return false;
  if (/case/.test(s) && tipo === "acc-case" && /s\d+|watch|ultra|se/.test(s) && !/iphone|ipad/.test(n)) return false;
  if (/carrier|vodafone|movistar|orange|plan/.test(s)) return false;
  if (/energy|footnote|applecare|logo|gift/.test(s)) return false;

  switch (tipo) {
    case "iphone": return /iphone/.test(s) && !SOLO_TECLADO.test(s) && !SOLO_BANDA.test(s) && !SOLO_CASE.test(s) && !SOLO_CARGADOR.test(s) && !/pencil/.test(s);
    case "ipad": return /ipad/.test(s) && !SOLO_TECLADO.test(s) && !SOLO_CASE.test(s) && !SOLO_CARGADOR.test(s) && !/pencil/.test(s);
    case "watch": return /watch|series\s?\d|(^|\D)s\d+(\D|$)|-nc-|ultra[-_ ]?(case|cell)|hermes|nike|sport|compare|se gen|aluminum|titanium|stainless|cellular|gps/.test(s) && !/band-unselect|grid-/.test(s);
    case "appletv": return /apple-?tv|appletv/.test(s);
    case "homepod": return /homepod/.test(s);
    case "airpods": return /airpod/.test(s) && !SOLO_CARGADOR.test(s);
    case "beats": return /beats|powerbeats|solo|pill/.test(s);
    case "macbook": return /macbook|refurb mb[ap]/.test(s);
    case "imac": return /imac/.test(s);
    case "mac-mini": return /mac\s?mini/.test(s);
    case "mac-studio": return /mac\s?studio/.test(s);
    case "mac-pro": return /mac\s?pro/.test(s) && !/display/.test(s);
    case "mac": return /mac|studio|display|stand mount/.test(s);
    case "display": return /display/.test(s);
    case "acc-keyboard": return /keyboard|folio/.test(s);
    case "acc-mouse": return /mouse/.test(s);
    case "acc-trackpad": return /mouse|trackpad|aalp|magic acc/.test(s);
    case "acc-pencil": return /pencil/.test(s);
    case "acc-cable": return /cable|thunderbolt/.test(s);
    case "acc-power": return /adapter|charger|power|magsafe|witb|staycharged|battery/.test(s) && !/airpod|pencil/.test(s);
    case "acc-airtag": return /airtag|tag/.test(s);
    case "acc-case": return /case|funda|silicone|clear|bumper|finewoven/.test(s) || /MK[M9HD]|MH0|MKR/.test(s);
    case "acc-band": return /band|loop|braided|link|leather|cinta|correa|sport/.test(s);
    case "acc-wallet": return /wallet/.test(s) || ((item.fuente || "").startsWith("acc") && !SOLO_LAPIZ.test(s) && !SOLO_TECLADO.test(s) && !SOLO_CASE.test(s) && !SOLO_BANDA.test(s) && !SOLO_CARGADOR.test(s));
    case "acc-carmount": return ((item.fuente || "").startsWith("acc") && !SOLO_LAPIZ.test(s) && !SOLO_TECLADO.test(s) && !SOLO_CASE.test(s) && !SOLO_BANDA.test(s));
    case "acc-vesa": return /vesa|stand mount|mount/.test(s);
    case "acc-cualquiera": return (item.fuente || "").startsWith("acc") || /accessor|case|band|adapter|cable|pencil|mouse|keyboard|trackpad|tag|wallet|mount/.test(s);
    case "cualquiera": return true;
    default: return true;
  }
}

function tokensProducto(p) {
  const n = norm(p.name || "");
  const t = { modelo: null, gen: null, serie: null, tamanos: [], chip: null, ipadTipo: null, airpods: null };
  const mIphone = n.match(/iphone\s+(\d+)/);
  if (mIphone) {
    t.gen = mIphone[1];
    t.modelo = "iphone " + mIphone[1];
    if (/\bpro max\b/.test(n)) t.modelo += " pro max";
    else if (/\bpro\b/.test(n)) t.modelo += " pro";
    else if (/\bplus\b/.test(n)) t.modelo += " plus";
    else if (/\bmini\b/.test(n)) t.modelo += " mini";
  }
  const mWatch = n.match(/(?:apple watch )?(?:series|serie)\s*(\d+)/);
  if (mWatch) t.serie = "s" + mWatch[1];
  else if (/watch se|^apple watch se/.test(n)) t.serie = "se";
  if (/ultra/.test(n) && /watch|reloj/.test(n)) {
    const mu = n.match(/ultra\s*(\d)?/);
    t.serie = "ultra" + (mu?.[1] || "");
  }
  const mIpad = n.match(/ipad\s*(?:air\s*)?(?:pro\s*)?(\d+)?\s*(?:ª gen)?/);
  const mIpadTipo = n.match(/ipad\s*(pro|air|mini)/);
  if (mIpadTipo) t.ipadTipo = mIpadTipo[1];
  for (const sz of [41, 42, 44, 45, 46, 49, 13, 14, 15, 16]) if (new RegExp("(^|\\D)" + sz + "(\\D|$)").test(n.replace(/m\d/g, " x ").replace(/º|ª/g, " "))) t.tamanos.push(String(sz));
  const mChip = n.match(/\b(m\d)\b/);
  if (mChip) t.chip = mChip[1];
  if (/airpod/.test(n)) {
    t.airpods = { max: /max/.test(n), pro: /\bpro\b/.test(n), gen: (n.match(/airpods?\s*(?:pro|max)?\s*(\d)/) || [])[1] || null, lightning: /lightning/.test(n), anc: /anc/.test(n) };
  }
  return t;
}

function puntuar(item, p, t, tipo) {
  const s = item.slug.toLowerCase().replace(/[_\-/.]/g, " ");
  const n = norm(p.name || "");
  let puntos = 0;

  if (/select|hero|digitalmat|family-select/.test(s)) puntos += 30;
  else if (/finish|gallery|unselect/.test(s)) puntos += 20;
  else if (/card/.test(s)) puntos += 6;
  else if (/banner|lifestyle|shelf|compare|value|alp|featurecard/.test(s)) puntos += 1;
  if (item.url.includes("cdsassets.apple.com")) puntos += 28; // foto oficial de soporte, limpia y estable
  if (/png-alpha/.test(item.url)) puntos += 4;
  const wid = Number((item.url.match(/wid=(\d+)/) || [0, 0])[1]);
  if (wid >= 900) puntos += 4; else if (wid > 0 && wid < 500) puntos -= 4;
  if ((item.fuente || "").startsWith("acc")) puntos -= 4;
  if (/carrier|vodafone|plan/.test(s)) puntos -= 40;

  // iPhone
  if (tipo === "iphone") {
    if (t.modelo) {
      const modeloEsp = t.modelo;
      if (s.includes(modeloEsp)) puntos += 60;
      else if (new RegExp("iphone[^a-z0-9]*" + t.gen + "([^0-9]|$)").test(s)) puntos += 30;
      else if (new RegExp("(^|[^0-9])" + t.gen + "([^0-9]|$)").test(s.replace(/20\d\d/g, ""))) puntos += 8;
      else puntos -= 30; // otra generación
      const slugMod = /(pro max|promax)/.test(s) ? "pro max" : /\bpro\b/.test(s) ? "pro" : /plus/.test(s) ? "plus" : /mini/.test(s) ? "mini" : /air/.test(s) ? "air" : null;
      const mios = [];
      if (t.modelo.includes("pro max")) mios.push("pro max");
      if (/\bpro\b/.test(t.modelo) && !t.modelo.includes("max")) mios.push("pro");
      if (t.modelo.includes("plus")) mios.push("plus");
      if (t.modelo.includes("mini")) mios.push("mini");
      if (t.modelo.includes("air")) mios.push("air");
      if (slugMod && !mios.includes(slugMod)) puntos -= 25;
      if (mios.length && !slugMod) puntos -= 10;
    } else {
      if (s.includes("iphone")) puntos += 15;
      if (/(^|\W)se(\W|$)/.test(n) && /(^|\W)se(\W|$)/.test(s)) puntos += 25;
      if (/duo/.test(s) && !/duo/.test(n)) puntos -= 35;
      if (/air/.test(s) && !/air/.test(n)) puntos -= 25;
      if (/pro/.test(s) && !/pro/.test(n)) puntos -= 20;
      const genNombre = (n.match(/iphone\s+(\d+)/) || [])[1];
      if (genNombre) {
        if (new RegExp("iphone[^a-z0-9]*" + genNombre + "([^0-9]|$)").test(s)) puntos += 30;
        else if (new RegExp("iphone\s?\d\d", s) && !s.includes(genNombre)) puntos -= 25;
      }
    }
  }

  // Apple Watch
  if (tipo === "watch") {
    if (t.serie) {
      if (t.serie.startsWith("ultra")) {
        if (/ultra/.test(s)) puntos += 55;
        else puntos -= 20;
      } else if (/^s\d/.test(t.serie)) {
        const num = t.serie.slice(1);
        if (new RegExp("series\\s*" + num + "([^0-9]|$)|(^|[^a-z0-9])s" + num + "([^0-9]|$)").test(s)) puntos += 55;
        else if (/watch|compare/.test(s)) puntos += 5;
        else puntos -= 20;
      } else if (t.serie === "se") {
        if (/(^|\W)se(\W|$)/.test(s)) puntos += 45;
        else puntos -= 15;
      }
      if (/hermes|herm/.test(n) && /hermes|herm/.test(s)) puntos += 30;
      else if (/hermes|herm/.test(n)) puntos -= 30;
      if (/nike/.test(n) && /nike/.test(s)) puntos += 30;
      else if (/nike/.test(n)) puntos -= 25;
      if (/cellular|celular/.test(n) && /(cell|cellular)/.test(s)) puntos += 10;
      if (/gps/.test(n) && /gps/.test(s)) puntos += 8;
      if (/sport/.test(n) && /sport/.test(s)) puntos += 10;
      if (/titanio|titanium/.test(n) && /titanium/.test(s)) puntos += 14;
      if (/acero|stainless|inoxidable/.test(n) && /stainless/.test(s)) puntos += 14;
      if (/aluminio|aluminum/.test(n) && /alum/.test(s)) puntos += 12;
      if (/ceramic/.test(n) && /ceramic/.test(s)) puntos += 14;
      for (const sz of t.tamanos) if (new RegExp("(^|[^0-9])" + sz + "([^0-9]|$)").test(s.replace(/20\d\d/g, ""))) puntos += 8;
    }
  }

  // iPad
  if (tipo === "ipad") {
    if (t.ipadTipo) {
      if (t.ipadTipo === "pro" && /ipad pro/.test(s)) puntos += 40;
      else if (t.ipadTipo === "air" && /ipad air/.test(s)) puntos += 40;
      else if (t.ipadTipo === "mini" && /ipad mini/.test(s)) puntos += 40;
      else if (/ipad/.test(s)) puntos += 10;
      else puntos -= 20;
    }
    const genNum = (n.match(/(\d+)\s*ª gen/) || [])[1];
    if (genNum) {
      const anios = { 7: "2021", 8: "2021", 9: "2021", 10: "2022" };
      if (anios[genNum] && s.includes(anios[genNum])) puntos += 20;
    }
    if (/starlight|estelar/.test(n) && /starlight/.test(s)) puntos += 25;
  }

  // Mac
  if (["macbook", "imac", "mac-mini", "mac-studio", "mac-pro", "mac", "display"].includes(tipo)) {
    if (t.chip && new RegExp("(^|[^a-z])" + t.chip + "([^0-9]|$)").test(s.replace(/20\d\d/g, ""))) puntos += 15;
    if (/ultra/.test(n) && /ultra/.test(s) && !/ultramarine/.test(s)) puntos += 12;
    if (/max/.test(n) && /max/.test(s) && tipo === "mac" || /max/.test(n) && /max/.test(s)) puntos += 8;
    if (tipo === "macbook") {
      const s2 = s.replace(/refurb mbp ?(\d{2})/, "macbook pro $1").replace(/refurb mba ?(\d{2})/, "macbook air $1");
      if (/pro/.test(n) && /pro/.test(s2)) puntos += 12;
      if (/pro/.test(n) && !/pro/.test(s2)) puntos -= 25;
      if (/air/.test(n) && /air/.test(s2)) puntos += 14;
      if (/air/.test(n) && !/air/.test(s2)) puntos -= 20;
      if (!/air/.test(n) && !/pro/.test(n) && (/air/.test(s2) || /neo/.test(s2)) && !/neo/.test(n)) puntos -= 30;
      if (/neo/.test(n) && /neo/.test(s2)) puntos += 45;
      if (/neo/.test(s2) && !/neo/.test(n)) puntos -= 30;
      const tams = (n.match(/(\d{2})\s*(?:pulgadas|")?/g) || []).map((x) => x.trim().slice(0, 2));
      const miTam = tams.find((sz) => ["13", "14", "15", "16"].includes(sz));
      const slugTam = ["13", "14", "15", "16"].find((sz) => new RegExp("(^|[^0-9])" + sz + "([^0-9]|$)").test(s2.replace(/20\d\d|m\d/g, "").replace(/mac ?book/g, "")));
      if (miTam && slugTam) puntos += miTam === slugTam ? 14 : -22;
    }
    if (/space gray|gris espacial/.test(n) && /(spacegray|space gray)/.test(s)) puntos += 15;
    if (/silver|plata/.test(n) && /silver/.test(s)) puntos += 12;
    if (/negro|black|space black/.test(n) && /(black|midnight|spaceblack|space black)/.test(s)) puntos += 12;
    if (/purple|morado/.test(n) && /purple/.test(s)) puntos += 15;
    if (/blue|azul/.test(n) && /blue/.test(s)) puntos += 12;
    // escasea la imagen real de estos accesorios: penalizar robarla desde productos mac
    if (/vesa|stand mount/.test(s) && !/vesa|stand|soporte|mount|pie/.test(n)) puntos -= 40;
    if (/magicmouse|featurecard mouse|magic acc/.test(s) && !/magic|mouse|raton|trackpad/.test(n)) puntos -= 40;
  }

  // AirPods
  if (tipo === "airpods" && t.airpods) {
    const a = t.airpods;
    if (a.max) { if (/max/.test(s)) puntos += 45; else puntos -= 35; }
    if (a.pro) { if (/pro/.test(s)) puntos += 35; else puntos -= 25; }
    if (!a.pro && !a.max && /pro/.test(s)) puntos -= 20;
    if (a.gen) {
      if (new RegExp("airpods[^a-z0-9]*" + a.gen + "([^0-9]|$)|(^|[^0-9])" + a.gen + "((rd|th)? gen|ª|ª gen|st gen|nd gen|rd gen)".replace(/ /g, "\\s?")).test(s)) puntos += 40;
      else if (/airpods\s?\d/.test(s)) puntos -= 30;
    }
    if (a.gen === "2" && /2nd|2ª/.test(s)) puntos += 40;
    if (a.gen === "4" && /(^|[^0-9])4([^0-9]|$)/.test(s.replace(/202\d/g, ""))) puntos += 40;
    if (a.usbc) puntos += 0;
  }

  // color (aplica a todos)
  const c = colorDe(p.name);
  if (c) {
    const mapaColor = { black: "black|midnight|medianoche|spaceblack|space black", white: "white|starlight|silver|plata", blue: "blue|ultramarine", green: "green", pink: "pink", gold: "gold", red: "red", yellow: "yellow", purple: "purple", orange: "orange", graphite: "graphite|spaceblack|space black", titanium: "titanium|titanio", lavender: "lavender", sage: "sage", mistblue: "mistblue", starlight: "starlight", spacegray: "spacegray|space gray|spacegrey" };
    if (mapaColor[c] && new RegExp(mapaColor[c]).test(s)) puntos += 22;
  }

  // accesorios: bonos específicos
  if (tipo === "acc-band") {
    if (/hermes/.test(n) && /hermes/.test(s)) puntos += 30;
    if (/sport loop/.test(n) && /sport[- ]loop/.test(s)) puntos += 30;
    if (/leather link/.test(n) && /(leather|link)/.test(s)) puntos += 25;
    if (/braided/.test(n) && /braided/.test(s)) puntos += 30;
  }
  if (tipo === "acc-case" && /iphone/.test(n) && /iphone/.test(s)) puntos += 25;
  if (tipo === "acc-keyboard" && /touch id/.test(n) && /touch id/.test(s)) puntos += 15;
  if (tipo === "acc-power") {
    if (/adapter|staycharged|battery/.test(s)) puntos += 25;
    if (/cable/.test(s) && /cable|cargador|adaptador/.test(n)) puntos += 18;
    if (/magsafe/.test(s)) puntos += 10;
    if (/airpod/.test(s)) puntos -= 45;
    if (/beats|band|pencil|keyboard|mouse|wallet/.test(s)) puntos -= 25;
  }
  if (tipo === "acc-trackpad" || tipo === "acc-mouse") {
    if (/trackpad/.test(s)) puntos += 30;
    if (/magicmouse|magic mouse/.test(s)) puntos += tipo === "acc-mouse" ? 30 : 12;
    if (/magic acc/.test(s)) puntos += 22;
    if (/beats|airpod/.test(s)) puntos -= 45;
  }
  if (tipo === "acc-wallet" || tipo === "acc-carmount") {
    if (/magsafe/.test(s)) puntos += 42;
    if (/airpod|beats|charging case|airtag/.test(s)) puntos -= 45;
  }
  if (tipo === "acc-vesa") {
    if (/vesa/.test(s)) puntos += 30;
    if (/stand mount/.test(s)) puntos += 12;
  }
  return puntos;
}

async function headOK(url) {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(12000), headers: { "User-Agent": "Mozilla/5.0" } });
    return res.status === 200;
  } catch {
    return false;
  }
}

(async () => {
  const pool = JSON.parse(fs.readFileSync("/tmp/apple-pool-crudo.json", "utf8"));
  // tiles oficiales de la tienda de accesorios (foto real de producto, por número de parte)
  const tiles = JSON.parse(fs.readFileSync("/tmp/apple-tiles.json", "utf8"));
  const TILE_MAP = [
    [/^iphone leather case$/, "MKD14"],
    [/^iphone silicone case$/, "MK944"],
    [/^iphone clear case$/, "MKDU4"],
    [/^magsafe wallet$/, "MK9K4"],
    [/^magsafe car mount$/, "HRX72"],
    [/^usb c power adapter$/, "MD3J4"],
    [/cargador usb c 30/, "HS9R2"],
    [/cargador usb c 67/, "MGTU4"],
    [/cable usb c a usb c/, "MDGE4"],
    [/^usb c cable$/, "HSJY2"],
  ];
  const slugsTile = new Set(TILE_MAP.map(([, s]) => s));
  const tilePara = (p) => {
    const n = norm(p.name || "");
    for (const [re, slug] of TILE_MAP) if (re.test(n)) return tiles.find((t) => t.slug === slug && !usadosPool.has(t.slug));
    return null;
  };
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  await signInWithEmailAndPassword(auth, "yo@gmail.com", "moises2004");
  console.log("✅ Sesión OK");
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, "products"));
  const productos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log("Productos:", productos.length, "| Pool:", pool.length);

  const porImg = new Map();
  for (const p of productos) {
    const img = (p.image_url || p.imageURL || "").toString().trim();
    if (!porImg.has(img)) porImg.set(img, []);
    porImg.get(img).push(p);
  }
  const usadas = new Set([...porImg.keys()]);
  const reasignar = [];
  for (const [img, arr] of porImg) {
    if (arr.length > 1) {
      const orden = [...arr].sort((a, b) => norm(a.name).localeCompare(norm(b.name)));
      orden.slice(1).forEach((p) => reasignar.push(p));
    }
  }

  const docCombo = productos.find((p) => norm(p.name) === "iphone 18 pro y iphone 18 pro max");
  const doc18pro = productos.find((p) => norm(p.name) === "iphone 18 pro");
  const doc18promax = productos.find((p) => norm(p.name) === "iphone 18 pro max");
  const docSinNombre = productos.find((p) => !norm(p.name) && (p.category === "Electrónica" || p.category === "electronics"));
  console.log("A reasignar:", reasignar.length);

  const disponibles = pool.filter((it) => !usadas.has(it.url) && ![...slugsTile].some((s) => it.slug === s || it.slug.startsWith(s + "_")));
  const usadosPool = new Set();
  const asignaciones = [];
  const sinAsignar = [];

  const conInfo = reasignar.map((p) => {
    const t = tokensProducto(p);
    const tipo = tipoProducto(p);
    const espec = (t.modelo ? 2 : 0) + (t.serie ? 2 : 0) + (t.chip ? 1 : 0) + (t.ipadTipo ? 1 : 0) + (t.airpods ? 1 : 0) + (tipo !== "cualquiera" && tipo !== "acc-cualquiera" ? 1 : 0);
    return { p, t, tipo, espec };
  });
  conInfo.sort((a, b) => b.espec - a.espec);

  const elegir = (cands) => {
    for (const c of cands) if (!usadosPool.has(c.it.slug)) return c;
    return null;
  };

  for (const { p, t, tipo } of conInfo) {
    const tile = tilePara(p);
    if (tile) {
      usadosPool.add(tile.slug);
      asignaciones.push({ id: p.id, nombre: p.name, categoria: p.category, tipo: tipo + "-tile", de: (p.image_url || "").toString().slice(0, 50), a: tile.url, slug: tile.slug, puntos: 200 });
      continue;
    }
    const todos = disponibles.filter((it) => !usadosPool.has(it.slug)).map((it) => ({ it, puntos: puntuar(it, p, t, tipo) }));

    // nivel 1: gate estricto
    let cands = todos.filter((c) => gateOK(tipo, c.it, p)).sort((a, b) => b.puntos - a.puntos);
    let elegido = elegir(cands);

    // nivel 2: familia
    if (!elegido && FAMILIA[tipo]) {
      const fam = FAMILIA[tipo];
      cands = todos.filter((c) => antiCruce(tipo, c.it.slug.toLowerCase().replace(/[_\-/.]/g, " ")) && c.it.slug.toLowerCase().includes(fam === "mac" ? "mac" : fam)).sort((a, b) => b.puntos - a.puntos);
      elegido = elegir(cands);
    }

    // nivel 3: cualquier accesorio de la tienda de accesorios
    if (!elegido && tipo.startsWith("acc")) {
      cands = todos.filter((c) => (c.it.fuente || "").startsWith("acc") && !SOLO_LAPIZ.test(c.it.slug) && !SOLO_TECLADO.test(c.it.slug) && !SOLO_BANDA.test(c.it.slug) && !SOLO_CASE.test(c.it.slug) && !SOLO_CARGADOR.test(c.it.slug)).sort((a, b) => b.puntos - a.puntos);
      elegido = elegir(cands);
    }

    // nivel 4: lo que sea
    if (!elegido) {
      cands = todos.sort((a, b) => b.puntos - a.puntos);
      elegido = elegir(cands);
    }

    if (!elegido) { sinAsignar.push(p.name + " (" + p.category + ")"); continue; }
    usadosPool.add(elegido.it.slug);
    asignaciones.push({ id: p.id, nombre: p.name, categoria: p.category, tipo, de: (p.image_url || "").toString().slice(0, 50), a: elegido.it.url, slug: elegido.it.slug, puntos: elegido.puntos });
  }

  const urlCombo = docCombo ? (docCombo.image_url || "").toString() : null;
  if (doc18pro && urlCombo) asignaciones.push({ id: doc18pro.id, nombre: doc18pro.name, categoria: doc18pro.category, tipo: "iphone", de: (doc18pro.image_url || "").slice(0, 50), a: urlCombo, slug: "iphone-card-40-18pro-202609", puntos: 100 });
  if (doc18promax) {
    const c18max = disponibles.find((it) => /18[-_]?pro[-_]?max|18promax/.test(it.slug) && !usadosPool.has(it.slug) && !/case|funda/.test(it.slug));
    if (c18max) { usadosPool.add(c18max.slug); asignaciones.push({ id: doc18promax.id, nombre: doc18promax.name, categoria: doc18promax.category, tipo: "iphone", de: (doc18promax.image_url || "").slice(0, 50), a: c18max.url, slug: c18max.slug, puntos: 100 }); }
    else console.log("⚠️ sin imagen 18 Pro Max");
  }

  console.log("\n=== ASIGNACIONES ===");
  for (const a of asignaciones) console.log(`[${a.puntos}] ${a.nombre} (${a.categoria}) -> ${a.slug}`);
  console.log("\nSin asignar:", JSON.stringify(sinAsignar));

  console.log("\nVerificando URLs...");
  const unicas = [...new Set(asignaciones.map((a) => a.a))];
  const badUrls = new Set();
  for (let i = 0; i < unicas.length; i += 12) {
    const lote = unicas.slice(i, i + 12);
    const res = await Promise.all(lote.map(async (url) => [url, await headOK(url)]));
    for (const [url, bien] of res) if (!bien) badUrls.add(url);
  }
  console.log("URLs malas:", badUrls.size, [...badUrls].slice(0, 3));

  const finales = asignaciones.filter((a) => !badUrls.has(a.a));
  fs.writeFileSync("/tmp/asignaciones-finales.json", JSON.stringify({ asignaciones: finales, eliminar: [docCombo?.id, docSinNombre?.id].filter(Boolean) }, null, 1));
  console.log("Finales:", finales.length, "| A eliminar:", [docCombo?.id, docSinNombre?.id].filter(Boolean).length, "| MODO:", MODO);

  if (MODO === "aplicar" && badUrls.size === 0) {
    const { doc: docRef, updateDoc, deleteDoc, serverTimestamp } = require("firebase/firestore");
    let n = 0;
    for (const a of finales) {
      await updateDoc(docRef(db, "products", a.id), { image_url: a.a, updatedAt: serverTimestamp() });
      n++;
      if (n % 40 === 0) console.log("  ...", n);
    }
    for (const id of [docCombo?.id, docSinNombre?.id].filter(Boolean)) await deleteDoc(docRef(db, "products", id));
    console.log("\n✅ APLICADO:", n, "actualizaciones +", [docCombo?.id, docSinNombre?.id].filter(Boolean).length, "eliminaciones");
  } else if (MODO === "aplicar") {
    console.log("\n⛔ NO APLICADO: URLs malas");
  }
})();
