// Fase 1: descargar todas las fuentes y construir el pool de imágenes únicas
const fs = require("fs");

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

const paginasActuales = [
  ["iphone-duo", "https://www.apple.com/es/shop/buy-iphone/iphone-duo"],
  ["iphone-18-pro", "https://www.apple.com/es/shop/buy-iphone/iphone-18-pro"],
  ["iphone-air", "https://www.apple.com/es/shop/buy-iphone/iphone-air"],
  ["iphone-17", "https://www.apple.com/es/shop/buy-iphone/iphone-17"],
  ["iphone-17e", "https://www.apple.com/es/shop/buy-iphone/iphone-17e"],
  ["iphone-16", "https://www.apple.com/es/shop/buy-iphone/iphone-16"],
  ["ipad-pro", "https://www.apple.com/es/shop/buy-ipad/ipad-pro"],
  ["ipad-air", "https://www.apple.com/es/shop/buy-ipad/ipad-air"],
  ["ipad", "https://www.apple.com/es/shop/buy-ipad/ipad"],
  ["ipad-mini", "https://www.apple.com/es/shop/buy-ipad/ipad-mini"],
  ["macbook-neo", "https://www.apple.com/es/shop/buy-mac/macbook-neo"],
  ["macbook-air", "https://www.apple.com/es/shop/buy-mac/macbook-air"],
  ["macbook-pro", "https://www.apple.com/es/shop/buy-mac/macbook-pro"],
  ["imac", "https://www.apple.com/es/shop/buy-mac/imac"],
  ["mac-mini", "https://www.apple.com/es/shop/buy-mac/mac-mini"],
  ["mac-studio", "https://www.apple.com/es/shop/buy-mac/mac-studio"],
  ["studio-display", "https://www.apple.com/es/shop/buy-mac/studio-display"],
  ["watch-s12", "https://www.apple.com/es/shop/buy-watch/apple-watch"],
  ["watch-ultra", "https://www.apple.com/es/shop/buy-watch/apple-watch-ultra"],
  ["watch-se3", "https://www.apple.com/es/shop/buy-watch/apple-watch-se"],
  ["watch-hermes", "https://www.apple.com/es/shop/buy-watch/apple-watch-hermes"],
  ["airpods-5", "https://www.apple.com/es/shop/buy-airpods/airpods-5"],
  ["airpods-pro-3", "https://www.apple.com/es/shop/buy-airpods/airpods-pro-3"],
  ["airpods-max-2", "https://www.apple.com/es/shop/buy-airpods/airpods-max-2"],
  ["appletv-4k", "https://www.apple.com/es/shop/buy-tv/apple-tv-4k"],
  ["homepod", "https://www.apple.com/es/shop/buy-homepod/homepod"],
  ["homepod-mini", "https://www.apple.com/es/shop/buy-homepod/homepod-mini"],
  ["acc-all", "https://www.apple.com/es/shop/accessories/all"],
  ["acc-iphone", "https://www.apple.com/es/shop/iphone/accessories"],
  ["acc-mac", "https://www.apple.com/es/shop/mac/accessories"],
  ["acc-ipad", "https://www.apple.com/es/shop/ipad/accessories"],
  ["acc-watch", "https://www.apple.com/es/shop/watch/accessories"],
  ["acc-bands", "https://www.apple.com/es/shop/watch/bands"],
  ["acc-airtag", "https://www.apple.com/es/shop/airtag/accessories/airtag"],
  ["acc-smarthome", "https://www.apple.com/es/shop/home/accessories/smart-home-accessories"],
];

const wayback = [
  ["wb-iphone-15pro-2023", "https://www.apple.com/es/shop/buy-iphone/iphone-15-pro", "20231015"],
  ["wb-iphone-15-2023", "https://www.apple.com/es/shop/buy-iphone/iphone-15", "20231015"],
  ["wb-iphone-14-2022", "https://www.apple.com/es/shop/buy-iphone/iphone-14", "20221015"],
  ["wb-iphone-14pro-2022", "https://www.apple.com/es/shop/buy-iphone/iphone-14-pro", "20221015"],
  ["wb-iphone-13-2021", "https://www.apple.com/es/shop/buy-iphone/iphone-13", "20211101"],
  ["wb-iphone-12-2020", "https://www.apple.com/es/shop/buy-iphone/iphone-12", "20201101"],
  ["wb-iphone-se-2022", "https://www.apple.com/es/shop/buy-iphone/iphone-se", "20220501"],
  ["wb-watch-2023", "https://www.apple.com/es/shop/buy-watch", "20231015"],
  ["wb-watch-2022", "https://www.apple.com/es/shop/buy-watch", "20221015"],
  ["wb-watch-2021", "https://www.apple.com/es/shop/buy-watch", "20211101"],
  ["wb-ipad-2023", "https://www.apple.com/es/shop/buy-ipad", "20231015"],
  ["wb-ipad-2022", "https://www.apple.com/es/shop/buy-ipad/ipad-air", "20220501"],
  ["wb-ipad-2021", "https://www.apple.com/es/shop/buy-ipad", "20211101"],
  ["wb-mac-2024", "https://www.apple.com/es/shop/buy-mac", "20241015"],
  ["wb-mac-2022", "https://www.apple.com/es/shop/buy-mac", "20221015"],
  ["wb-mac-2021", "https://www.apple.com/es/shop/buy-mac", "20211101"],
  ["wb-airpods-2024", "https://www.apple.com/es/shop/buy-airpods", "20241015"],
  ["wb-tv-2024", "https://www.apple.com/es/shop/buy-tv/apple-tv-4k", "20240501"],
  ["wb-homepod-2023", "https://www.apple.com/es/shop/buy-homepod/homepod", "20230601"],
];

const soporte = [
  ["soporte-ipad", "https://support.apple.com/es-es/108043"],
  ["soporte-airpods", "https://support.apple.com/es-es/109525"],
  ["soporte-watch", "https://support.apple.com/es-es/108056"],
];

const blacklist = /energy|icon|applecare|tradein|specialist|store-chat|logo|giftcard|gift-card|do-not-discard|carbonneutral|delivery|footnote|og-image|badge|finish-(white|black|blue|pink|green|lavender|sage|mistblue|starlight|midnight|silver|gold|spacegray|graphite|red|yellow|purple|orange|bluebelle|darkgreen|teal|ultramarine|naturaltitanium|deserttitanium|blacktitanium|whitetitanium)-20\d{4}\?|category-icon/i;

function extraerURLs(html, etiqueta) {
  const urls = new Map();
  const re = /storeimages\.cdn-apple\.com\/(\d+)\/as-images\.apple\.com\/is\/([A-Za-z0-9\-_.]+)\?([^"'\\ \n)]+)/g;
  let m;
  while ((m = re.exec(html))) {
    let params = m[3].replace(/&amp;/g, "&").replace(/&#38;/g, "&");
    const slug = m[2];
    if (blacklist.test(slug + "?" + params)) continue;
    if (/_SW_COLOR/.test(slug)) continue;
    const wid = Number((params.match(/wid=(\d+)/) || [0, 0])[1]);
    if (wid < 300) continue;
    if (!params.includes(".v=")) continue;
    const url = `https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/${slug}?${params}`;
    if (!urls.has(slug)) urls.set(slug, { url, slug, fuente: etiqueta });
  }
  const reCds = /(?:https:)?\/\/cdsassets\.apple\.com\/live\/7WUAS350\/images\/([A-Za-z0-9\-_/.]+\.(?:png|jpg|jpeg))/g;
  while ((m = reCds.exec(html))) {
    const ruta = m[1];
    if (/callout|related_topics|hero|lockup|welcome/i.test(ruta)) continue;
    const url = `https://cdsassets.apple.com/live/7WUAS350/images/${ruta}`;
    const slug = ruta.split("/").pop();
    if (!urls.has(slug)) urls.set(slug, { url, slug, fuente: etiqueta });
  }
  return [...urls.values()];
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function waybackUrl(url, ts) {
  try {
    const res = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}&timestamp=${ts}`, { signal: AbortSignal.timeout(20000) });
    const data = await res.json();
    return data?.archived_snapshots?.closest?.url || null;
  } catch {
    return null;
  }
}

(async () => {
  const pool = new Map();
  const agregar = (items, etiqueta) => {
    let n = 0;
    for (const it of items) {
      if (!pool.has(it.slug)) {
        it.fuente = etiqueta;
        pool.set(it.slug, it);
        n++;
      }
    }
    return n;
  };

  // 1) Páginas actuales
  const conc = 6;
  for (let i = 0; i < paginasActuales.length; i += conc) {
    const lote = paginasActuales.slice(i, i + conc);
    const resultados = await Promise.all(lote.map(async ([etiqueta, url]) => [etiqueta, await fetchText(url)]));
    for (const [etiqueta, html] of resultados) {
      const n = html ? agregar(extraerURLs(html, etiqueta), etiqueta) : 0;
      console.log(`${etiqueta}: ${n} imágenes`);
    }
  }

  // 2) Refurb (ya descargados)
  for (const [etiqueta, archivo] of [["refurb-iphone", "/tmp/refurb-iphone.html"], ["refurb-mac", "/tmp/refurb-mac.html"], ["refurb-ipad", "/tmp/refurb-ipad.html"]]) {
    try {
      const html = fs.readFileSync(archivo, "utf8");
      console.log(`${etiqueta}: ${agregar(extraerURLs(html, etiqueta), etiqueta)} imágenes`);
    } catch {}
  }

  // 3) Páginas de soporte (identify)
  for (let i = 0; i < soporte.length; i += 3) {
    const resultados = await Promise.all(soporte.slice(i, i + 3).map(async ([etiqueta, url]) => [etiqueta, await fetchText(url)]));
    for (const [etiqueta, html] of resultados) {
      const n = html ? agregar(extraerURLs(html, etiqueta), etiqueta) : 0;
      console.log(`${etiqueta}: ${n} imágenes`);
    }
  }
  // watch-identify ya descargado
  try {
    const html = fs.readFileSync("/tmp/watch-identify.html", "utf8");
    console.log(`soporte-watch-html: ${agregar(extraerURLs(html, "soporte-watch"), "soporte-watch")} imágenes`);
  } catch {}

  // 4) Wayback
  for (let i = 0; i < wayback.length; i += 4) {
    const lote = wayback.slice(i, i + 4);
    const resultados = await Promise.all(lote.map(async ([etiqueta, url, ts]) => {
      const wb = await waybackUrl(url, ts);
      if (!wb) return [etiqueta, null];
      return [etiqueta, await fetchText(wb)];
    }));
    for (const [etiqueta, html] of resultados) {
      const n = html ? agregar(extraerURLs(html, etiqueta), etiqueta) : 0;
      console.log(`${etiqueta}: ${n} imágenes`);
    }
  }

  const items = [...pool.values()];
  fs.writeFileSync("/tmp/apple-pool-crudo.json", JSON.stringify(items, null, 1));
  console.log(`\nPOOL CRUDO: ${items.length} imágenes únicas por slug`);
})();
