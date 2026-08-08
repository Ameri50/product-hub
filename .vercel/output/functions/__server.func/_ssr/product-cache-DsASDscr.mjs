//#region node_modules/.nitro/vite/services/ssr/assets/product-cache-DsASDscr.js
var PRODUCT_CACHE_KEY = "product-catalog-cache";
function readCachedProducts() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(PRODUCT_CACHE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function writeCachedProducts(products) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(products));
	} catch {}
}
//#endregion
export { writeCachedProducts as n, readCachedProducts as t };
