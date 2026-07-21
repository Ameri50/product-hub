import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { LogIn, Loader2, ShieldCheck } from "lucide-react";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("joshuarojas432@gmail.com");
  const [password, setPassword] = useState("tesis2026");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Sesión iniciada");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-2xl shadow-fuchsia-500/30 mb-4">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Panel</h1>
          <p className="mt-2 text-sm text-slate-400">Inicia sesión para administrar productos</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4 shadow-2xl"
        >
          <div>
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wide">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-transparent transition"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wide">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Iniciar sesión
          </button>
          <p className="text-xs text-slate-500 text-center pt-2">
            Crea usuarios desde la consola de Firebase Authentication
          </p>
        </form>
      </div>
    </div>
  );
}