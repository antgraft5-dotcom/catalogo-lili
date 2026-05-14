import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Hammer, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/lili-logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login Admin — Lili Materiais" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("admin");
  const [senha, setSenha] = useState("admin123");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [user, isAdmin, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Conta criada! Peça ao administrador para liberar seu acesso.");
      } else {
        const emailToUse = email === "admin" ? "admin@admin.com" : email;
        const { error } = await supabase.auth.signInWithPassword({ 
          email: emailToUse, 
          password: senha 
        });
        if (error) throw error;
        toast.success("Bem-vindo(a)!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-elegant">
        <Link to="/" className="mb-6 flex items-center justify-center gap-3">
          <img src={logo} alt="" className="h-14 w-14 rounded-md object-contain" />
          <div>
            <div className="font-display text-lg font-bold text-secondary">Lili Materiais</div>
            <div className="text-xs text-muted-foreground">Área Administrativa</div>
          </div>
        </Link>

        <h1 className="mb-1 text-center font-display text-2xl font-bold text-secondary">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {mode === "login"
            ? "Acesse para gerenciar produtos e estoque"
            : "Após criar, um admin precisa liberar seu acesso"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail / Usuário</Label>
            <Input
              id="email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
            />
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Primeiro acesso?{" "}
              <button onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button onClick={() => setMode("login")} className="font-medium text-primary hover:underline">
                Fazer login
              </button>
            </>
          )}
        </div>

        {user && !isAdmin && (
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-warning/15 p-4 text-sm text-secondary">
            <Hammer className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="font-semibold">Conta criada, aguardando liberação.</p>
              <p className="mt-1 text-muted-foreground">
                Um administrador precisa atribuir o papel <strong>admin</strong> ao seu usuário no banco
                de dados (tabela <code>user_roles</code>).
              </p>
            </div>
          </div>
        )}

        <Link to="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-primary">
          ← Voltar para o catálogo
        </Link>
      </div>
    </div>
  );
}
