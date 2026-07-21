import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginScreen } from "./LoginScreen";
import { Dashboard } from "./Dashboard";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

function Gate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }
  return user ? <Dashboard /> : <LoginScreen />;
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
