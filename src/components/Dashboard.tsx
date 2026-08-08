import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProductForm, type Product } from "./ProductForm";
import { ProductList } from "./ProductList";
import { SeedCatalogButton } from "./SeedCatalogButton";
import { ImageOff, LogOut, Sparkles, LayoutGrid, ShoppingBag, Users } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-fuchsia-50/40 dark:from-slate-950 dark:via-indigo-950/40 dark:to-fuchsia-950/40">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/60 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center shadow-lg shadow-fuchsia-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Admin de Productos</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-fuchsia-500/30 hover:opacity-90 transition"
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Ver catálogo
            </Link>
            <Link
              to="/pedidos"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Pedidos
            </Link>
            <Link
              to="/usuarios"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Users className="h-3.5 w-3.5" /> Usuarios
            </Link>
            <Link
              to="/productos-sin-imagen"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ImageOff className="h-3.5 w-3.5" /> Sin imagen
            </Link>
            <button
              onClick={async () => {
                await logout();
                toast.success("Sesión cerrada");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <ProductForm editing={editing} onDone={() => setEditing(null)} />
        </section>
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Productos</h2>
            <SeedCatalogButton />
          </div>
          <ProductList onEdit={setEditing} />
        </section>
      </main>
    </div>
  );
}