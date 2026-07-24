import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { collection, onSnapshot, type Timestamp } from "firebase/firestore";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getFirebase } from "@/lib/firebase";

type OrderDocument = {
  id: string;
  customerName?: string;
  customerEmail?: string;
  status?: string;
  total?: number | string;
  createdAt?: Timestamp | { seconds: number; nanoseconds: number } | null;
  [key: string]: unknown;
};

export const Route = createFileRoute("/pedidos")({
  component: PedidosPage,
});

function PedidosPage() {
  const [orders, setOrders] = useState<OrderDocument[]>([]);

  useEffect(() => {
    const { db } = getFirebase();
    if (!db) return;

    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) })) as OrderDocument[];
      setOrders(items);
    });

    return () => unsubscribe();
  }, []);

  const totalPedidos = useMemo(() => orders.length, [orders]);

  const formatDate = (value: OrderDocument["createdAt"]) => {
    if (!value) return "Sin fecha";

    if (typeof value === "object" && value !== null && "seconds" in value) {
      const seconds = Number((value as { seconds?: number }).seconds ?? 0);
      return new Date(seconds * 1000).toLocaleString("es-ES");
    }

    return String(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-fuchsia-50/40 dark:from-slate-950 dark:via-indigo-950/40 dark:to-fuchsia-950/40">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/60 dark:border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-slate-900 dark:text-white">Pedidos</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Seguimiento de compras</p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Resumen</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">Compras registradas</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Aquí se muestran los pedidos que llegan desde Firestore y se actualizan en tiempo real.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 text-white shadow-lg shadow-fuchsia-500/20">
              <p className="text-sm opacity-80">Total</p>
              <p className="text-3xl font-semibold">{totalPedidos}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pedidos recientes</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">{totalPedidos} registros</span>
          </div>

          {orders.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
              Todavía no hay pedidos en Firestore.
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {orders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-800/70">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{order.customerName ?? `Pedido ${order.id.slice(0, 6)}`}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{order.customerEmail ?? "Sin correo"}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{order.status ?? "Pendiente"}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Total: {order.total ?? "—"}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Creado: {formatDate(order.createdAt)}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
