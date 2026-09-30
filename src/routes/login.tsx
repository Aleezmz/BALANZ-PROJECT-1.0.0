import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Balanz" },
      { name: "description", content: "Accedé a Balanz y controlá tus finanzas personales mes a mes." },
      { property: "og:title", content: "Iniciar sesión — Balanz" },
      { property: "og:description", content: "Accedé a Balanz y controlá tus finanzas personales mes a mes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error("Correo o contraseña incorrectos"); return; }
      navigate({ to: "/" });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      if (data.session) navigate({ to: "/" });
      else toast.success("Revisá tu correo para confirmar la cuenta");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 bg-mesh" aria-hidden />
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-hero-gradient shadow-elegant">
            <Wallet className="size-7 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Balanz</h1>
          <p className="mt-1 text-sm text-muted-foreground">Finanzas personales, sin vueltas.</p>
        </div>

        <div className="glass rounded-3xl p-7 shadow-elegant sm:p-8">
          <h2 className="text-lg font-semibold">{mode === "in" ? "Iniciar sesión" : "Crear cuenta"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ingresá para ver el resumen de tu mes.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="h-12 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 pl-10 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Ingresando…
                </>
              ) : (
                mode === "in" ? "Ingresar" : "Crear cuenta"
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "in" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
            <button type="button" className="font-medium text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? "Crear una" : "Iniciar sesión"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
