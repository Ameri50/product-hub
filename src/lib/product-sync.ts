import type { Product } from "@/components/ProductForm";

export type ProductSyncEventDetail =
  | { type: "upsert"; product: Product }
  | { type: "remove"; productId: string };

export function dispatchProductChanged(product: Product) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ProductSyncEventDetail>("products-updated", { detail: { type: "upsert", product } }));
}

export function dispatchProductRemoved(productId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ProductSyncEventDetail>("products-updated", { detail: { type: "remove", productId } }));
}

export function upsertProductInList(products: Product[], product: Product): Product[] {
  const existingIndex = products.findIndex((item) => item.id === product.id);
  if (existingIndex >= 0) {
    const next = [...products];
    next[existingIndex] = product;
    return next;
  }
  return [product, ...products];
}

export function removeProductInList(products: Product[], productId: string): Product[] {
  return products.filter((item) => item.id !== productId);
}
