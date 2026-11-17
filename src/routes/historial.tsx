import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/LoginScreen";
import { Toaster, toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Clock,
  History,
  Loader2,
  LogOut,
  Package,
  Search,
  ShieldAlert,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { getFirebase } from "@/lib/firebase";

const DAY_MS = 24 * 60 * 60 * 1000;

type OrderState = "reserved" | "confirmed" | "cancelled" | "expired";

type OrderItem = {
  productId?: string;
  name: string;
  color?: string;
  storage?: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: string;
  code: string;
  userEmail: string;
  userUid: string;
  status: OrderState;
  total: number;
  createdAt: Date | null;
  expiresAt: Date | null;
  imageSource: string;
  source: string;
  items: OrderItem[];
};

export const Route = createFileRoute("/historial")({
  head: () => ({
    meta: [
      { title: "Historial | Panel" },
      { name: "description", content: "Reservaciones y pedidos sincronizados con la app iOS." },
    ],
  }),
  component: HistorialPage,
});

function HistorialPage() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <HistorialGate />
    </AuthProvider>
  );
}

function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
    </div>
  );
}

function HistorialGate() {
  const { user, loading, isAdmin, logout } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <LoginScreen />;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-xl">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 shadow-2xl shadow-red-500/30">
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">No tienes acceso</h1>
          <p className="mt-2 text-sm text-slate-400">
            El historial del panel está disponible solo para administradores.
          </p>
          <button
            onClick={() => logout()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:shadow-fuchsia-500/50"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </div>
    );
  }
  return <HistorialContent />;
}

function HistorialContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"reservations" | "orders">("reservations");
  const [now, setNow] = useState(() => Date.now());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const { db } = getFirebase();
    if (!db) return;

    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const list = snapshot.docs.map((snap) => toOrder(snap.id, snap.data()));
        list.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
        setOrders(list);
      },
      (error) => {
        console.error("Error escuchando pedidos:", error);
        toast.error("No se pudo leer el historial", { description: error.message });
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const reservations = useMemo(
    () => orders.filter((order) => effectiveState(order, now) === "reserved" || effectiveState(order, now) === "expired"),
    [orders, now],
  );
  const confirmedOrders = useMemo(
    () => orders.filter((order) => effectiveState(order, now) === "confirmed" || effectiveState(order, now) === "cancelled"),
    [orders, now],
  );

  const visible = tab === "reservations" ? reservations : confirmedOrders;

  const hasActiveSearch = query.trim().length > 0;

  const filteredVisible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return visible;
    return visible.filter((order) => {
      const haystack = [
        order.code,
        order.userEmail,
        ...order.items.flatMap((item) => [item.name, item.color ?? "", item.storage ?? ""]),
      ];
      return haystack.some((value) => value.toLowerCase().includes(needle));
    });
  }, [visible, query]);

  const changeStatus = async (order: Order, status: "confirmed" | "cancelled") => {
    const { db } = getFirebase();
    if (!db) return;
    setBusyId(order.id);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        status,
        updatedAt: serverTimestamp(),
      });
      toast.success(status === "confirmed" ? "Pedido confirmado" : "Reserva cancelada", {
        description: `${order.code} se actualizó en la app iOS.`,
      });
    } catch (error) {
      toast.error("No se pudo actualizar", { description: (error as Error).message });
    } finally {
      setBusyId(null);
    }
  };

  const removeOrder = async (order: Order) => {
    const { db } = getFirebase();
    if (!db) return;
    if (!window.confirm(`¿Eliminar ${order.code}? También desaparecerá del historial de la app.`)) return;
    setBusyId(order.id);
    try {
      await deleteDoc(doc(db, "orders", order.id));
      toast.success("Registro eliminado");
    } catch (error) {
      toast.error("No se pudo eliminar", { description: (error as Error).message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-fuchsia-50/40 dark:from-slate-950 dark:via-indigo-950/40 dark:to-fuchsia-950/40">
      <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
              <History className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-slate-900 dark:text-white">Historial</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Reservaciones y pedidos de la app</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Catálogo
            </Link>
            <Link
              to="/usuarios"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Users className="h-3.5 w-3.5" /> Usuarios
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Panel
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Sincronizado con la app iOS</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                Reservaciones y pedidos en tiempo real
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Cada reserva hecha en la app se guarda 24 horas. Si no se confirma en ese plazo vence
                automáticamente y el stock vuelve a estar disponible.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-white shadow-lg shadow-orange-500/20">
                <p className="text-sm opacity-80">Reservaciones</p>
                <p className="text-3xl font-semibold">{reservations.length}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-white shadow-lg shadow-emerald-500/20">
                <p className="text-sm opacity-80">Pedidos</p>
                <p className="text-3xl font-semibold">{confirmedOrders.length}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex w-full max-w-md rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800/70">
            <button
              onClick={() => setTab("reservations")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                tab === "reservations"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Clock className="h-4 w-4" /> Reservaciones ({reservations.length})
            </button>
            <button
              onClick={() => setTab("orders")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                tab === "orders"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <ShoppingBag className="h-4 w-4" /> Pedidos ({confirmedOrders.length})
            </button>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por código, producto o correo"
              className="w-full rounded-xl border border-slate-200 bg-white/90 py-2 pl-9 pr-9 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
            />
            {hasActiveSearch && (
              <button
                onClick={() => setQuery("")}
                title="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {filteredVisible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center dark:border-white/10 dark:bg-slate-900/40">
            {hasActiveSearch ? (
              <Search className="mx-auto h-10 w-10 text-slate-400" />
            ) : (
              <Package className="mx-auto h-10 w-10 text-slate-400" />
            )}
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">
              {hasActiveSearch
                ? "Sin resultados"
                : tab === "reservations"
                  ? "No hay reservaciones activas"
                  : "Todavía no hay pedidos"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {hasActiveSearch
                ? `No encontramos registros para «${query.trim()}».`
                : "Cuando un cliente reserve desde la app iOS aparecerá aquí al instante."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVisible.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                now={now}
                busy={busyId === order.id}
                onConfirm={() => changeStatus(order, "confirmed")}
                onCancel={() => changeStatus(order, "cancelled")}
                onDelete={() => removeOrder(order)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function OrderCard({
  order,
  now,
  busy,
  onConfirm,
  onCancel,
  onDelete,
}: {
  order: Order;
  now: number;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const state = effectiveState(order, now);
  const remaining = order.expiresAt ? Math.max(0, order.expiresAt.getTime() - now) : 0;
  const progress = Math.min(100, Math.max(0, (remaining / DAY_MS) * 100));

  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            {order.imageSource ? (
              <img src={order.imageSource} alt="" className="h-full w-full object-contain" />
            ) : (
              <Package className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{order.code}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {order.userEmail || "Sin correo"} · {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${stateStyles(state).chip}`}>
            {stateStyles(state).label}
          </span>
          <button
            onClick={onDelete}
            disabled={busy}
            title="Eliminar registro"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {order.items.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-slate-200/70 pt-3 dark:border-white/10">
          {order.items.map((item, index) => (
            <div key={`${item.productId ?? item.name}-${index}`} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {[item.color, item.storage].filter(Boolean).join(" · ") || "Sin variante"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatMoney(item.unitPrice * item.quantity)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">x{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/10">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Total</span>
        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(order.total)}</span>
      </div>

      {state === "reserved" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400">
              <Clock className="h-3.5 w-3.5" /> Expira en {formatRemaining(remaining)}
            </span>
            <span className="text-slate-500 dark:text-slate-400">Límite: 24 horas</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${remaining < 3_600_000 ? "bg-red-500" : "bg-orange-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Confirmar pedido
            </button>
            <button
              onClick={onCancel}
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:hover:bg-red-500/20"
            >
              <X className="h-4 w-4" /> Cancelar reserva
            </button>
          </div>
        </div>
      )}

      {state === "expired" && order.expiresAt && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Clock className="h-4 w-4" /> Venció el {formatDate(order.expiresAt)}
        </p>
      )}
    </article>
  );
}

function toOrder(id: string, data: Record<string, unknown>): Order {
  const createdAt = toDate(data.createdAt);
  const expiresAt = toDate(data.expiresAt) ?? (createdAt ? new Date(createdAt.getTime() + DAY_MS) : null);
  const rawItems = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];

  return {
    id,
    code: typeof data.code === "string" && data.code ? data.code : id,
    userEmail: typeof data.userEmail === "string" ? data.userEmail : "",
    userUid: typeof data.userUid === "string" ? data.userUid : "",
    status: normalizeStatus(data.status),
    total: toNumber(data.total),
    createdAt,
    expiresAt,
    imageSource: typeof data.imageSource === "string" ? data.imageSource : "",
    source: typeof data.source === "string" ? data.source : "",
    items: rawItems.map((item) => ({
      productId: typeof item.productId === "string" ? item.productId : undefined,
      name: typeof item.name === "string" ? item.name : "Producto",
      color: typeof item.color === "string" ? item.color : undefined,
      storage: typeof item.storage === "string" ? item.storage : undefined,
      quantity: toNumber(item.quantity) || 1,
      unitPrice: toNumber(item.unitPrice),
    })),
  };
}

function normalizeStatus(value: unknown): OrderState {
  const raw = typeof value === "string" ? value.toLowerCase() : "reserved";
  if (raw === "confirmed" || raw === "completado" || raw === "entregado") return "confirmed";
  if (raw === "cancelled" || raw === "canceled" || raw === "cancelado") return "cancelled";
  if (raw === "expired" || raw === "expirado" || raw === "vencido") return "expired";
  return "reserved";
}

function effectiveState(order: Order, now: number): OrderState {
  if (order.status !== "reserved") return order.status;
  if (order.expiresAt && now >= order.expiresAt.getTime()) return "expired";
  return "reserved";
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "seconds" in value) {
    const seconds = Number((value as Timestamp).seconds ?? 0);
    return new Date(seconds * 1000);
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatDate(value: Date | null): string {
  if (!value) return "Sin fecha";
  return value.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatRemaining(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours} h ${rest} min` : `${Math.max(1, rest)} min`;
}

function stateStyles(state: OrderState): { label: string; chip: string } {
  switch (state) {
    case "confirmed":
      return { label: "Confirmado", chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" };
    case "cancelled":
      return { label: "Cancelado", chip: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" };
    case "expired":
      return { label: "Expirado", chip: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300" };
    default:
      return { label: "Reservado", chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" };
  }
}
