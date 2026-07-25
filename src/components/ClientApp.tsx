import { lazy, Suspense, useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginScreen } from "./LoginScreen";
import { Toaster } from "sonner";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";
import { toast } from "sonner";

const Dashboard = lazy(() => import("./Dashboard").then((m) => ({ default: m.Dashboard })));

function FullScreenLoader() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
    </div>
  );
}

function NotAuthorizedScreen() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center shadow-2xl">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 shadow-2xl shadow-red-500/30 mb-4">
          <ShieldAlert className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">No tienes acceso</h1>
        <p className="mt-2 text-sm text-slate-400">
          La cuenta <span className="text-slate-200">{user?.email}</span> inició sesión
          correctamente, pero no está autorizada para usar el panel admin.
        </p>
        <button
          onClick={async () => {
            await logout();
            toast.success("Sesión cerrada");
          }}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function Gate() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <LoginScreen />;
  if (!isAdmin) return <NotAuthorizedScreen />;

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Dashboard />
    </Suspense>
  );
}

export function ClientApp() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Gate />
    </AuthProvider>
  );
}