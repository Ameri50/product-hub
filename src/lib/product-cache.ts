import type { Product } from "@/components/ProductForm";

const PRODUCT_CACHE_KEY = "product-catalog-cache";

export function readCachedProducts(): Product[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(PRODUCT_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCachedProducts(products: Product[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(products));
  } catch {
    // ignore cache write failures
  }
}
