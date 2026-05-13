import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Minus, LogOut, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CATEGORIAS, categoriaLabel, type Categoria, type Produto } from "@/lib/produtos";
import { brl } from "@/lib/whatsapp";
import logo from "@/assets/lili-logo.png";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Admin — Lili Materiais" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type FormState = {
  id?: string;
  nome: string;
  descricao: string;
  categoria: Categoria;
  preco: string;
  promocao: boolean;
  preco_promocional: string;
  estoque: string;
  imagem: string;
  ativo: boolean;
};

const empty: FormState = {
  nome: "", descricao: "", categoria: "outros", preco: "0",
  promocao: false, preco_promocional: "", estoque: "0", imagem: "", ativo: true,
};

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, isAdmin, loading } = useAuth();

  const [form, setForm] = useState<FormState | null>(null);
  const [confirmDel, setConfirmDel] = useState<Produto | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/login" });
  }, [user, isAdmin, loading, navigate]);

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["admin-produtos"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Produto[];
    },
  });

  const stats = useMemo(() => ({
    total: produtos.length,
    ativos: produtos.filter((p) => p.ativo).length,
    promo: produtos.filter((p) => p.promocao).length,
    semEstoque: produtos.filter((p) => p.estoque <= 0).length,
  }), [produtos]);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-produtos"] });
    await qc.invalidateQueries({ queryKey: ["produtos"] });
  }

  async function ajustarEstoque(p: Produto, delta: number) {
    const novo = Math.max(0, p.estoque + delta);
    const { error } = await supabase.from("produtos").update({ estoque: novo }).eq("id", p.id);
    if (error) toast.error(error.message);
    else refresh();
  }

  async function excluir(p: Produto) {
    const { error } = await supabase.from("produtos").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Produto excluído");
      refresh();
    }
    setConfirmDel(null);
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Topbar */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="" className="h-10 w-10 rounded-md object-contain" />
            <div>
              <div className="font-display text-base font-bold text-secondary">Painel Lili</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="outline" size="sm">Ver site</Button></Link>
            <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}>
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total de produtos" value={stats.total} />
          <Stat label="Produtos ativos" value={stats.ativos} tone="success" />
          <Stat label="Em promoção" value={stats.promo} tone="primary" />
          <Stat label="Sem estoque" value={stats.semEstoque} tone="warning" />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-secondary">Produtos</h1>
          <Button variant="hero" onClick={() => setForm({ ...empty })}>
            <Plus className="size-4" /> Adicionar produto
          </Button>
        </div>

        {/* Lista */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          {isLoading ? (
            <div className="grid place-items-center p-16"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : produtos.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              Nenhum produto cadastrado. Clique em "Adicionar produto" para começar.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {produtos.map((p) => (
                <div key={p.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {p.imagem ? (
                      <img src={p.imagem} alt={p.nome} className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-muted-foreground">
                        <ImageIcon className="size-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-secondary">{p.nome}</h3>
                      {!p.ativo && <Badge variant="outline">Inativo</Badge>}
                      {p.promocao && <Badge className="bg-primary text-primary-foreground">Promoção</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{categoriaLabel(p.categoria)}</span>
                      <span>{brl(p.preco)}{p.promocao && p.preco_promocional ? ` → ${brl(p.preco_promocional)}` : ""}</span>
                    </div>
                  </div>

                  {/* Estoque */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => ajustarEstoque(p, -1)} disabled={p.estoque <= 0}>
                      <Minus className="size-4" />
                    </Button>
                    <div className="w-16 text-center">
                      <div className="text-xs text-muted-foreground">Estoque</div>
                      <div className="font-bold text-secondary">{p.estoque}</div>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => ajustarEstoque(p, 1)}>
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setForm({
                      id: p.id, nome: p.nome, descricao: p.descricao ?? "",
                      categoria: p.categoria, preco: String(p.preco), promocao: p.promocao,
                      preco_promocional: p.preco_promocional ? String(p.preco_promocional) : "",
                      estoque: String(p.estoque), imagem: p.imagem ?? "", ativo: p.ativo,
                    })}>
                      <Pencil className="size-4" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setConfirmDel(p)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {form && <ProductForm form={form} setForm={setForm} onClose={() => setForm(null)} onSaved={refresh} />}

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto "{confirmDel?.nome}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDel && excluir(confirmDel)} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "primary" | "success" | "warning" }) {
  const toneCls =
    tone === "primary" ? "text-primary"
    : tone === "success" ? "text-success"
    : tone === "warning" ? "text-warning"
    : "text-secondary";
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${toneCls}`}>{value}</div>
    </div>
  );
}

function ProductForm({
  form, setForm, onClose, onSaved,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("produtos").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("produtos").getPublicUrl(path);
      setForm({ ...form, imagem: data.publicUrl });
      toast.success("Imagem enviada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        categoria: form.categoria,
        preco: parseFloat(form.preco) || 0,
        promocao: form.promocao,
        preco_promocional: form.promocao && form.preco_promocional ? parseFloat(form.preco_promocional) : null,
        estoque: parseInt(form.estoque) || 0,
        imagem: form.imagem || null,
        ativo: form.ativo,
      };
      if (form.id) {
        const { error } = await supabase.from("produtos").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Produto atualizado");
      } else {
        const { error } = await supabase.from("produtos").insert(payload);
        if (error) throw error;
        toast.success("Produto criado");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v as Categoria })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estoque">Estoque</Label>
              <Input id="estoque" type="number" min="0" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="preco">Preço (R$) *</Label>
              <Input id="preco" type="number" step="0.01" min="0" required value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="promo">Preço promocional (R$)</Label>
              <Input id="promo" type="number" step="0.01" min="0" disabled={!form.promocao}
                value={form.preco_promocional} onChange={(e) => setForm({ ...form, preco_promocional: e.target.value })} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
            <div>
              <Label htmlFor="promocao" className="cursor-pointer">Em promoção</Label>
              <p className="text-xs text-muted-foreground">Aparece na seção de ofertas do dia</p>
            </div>
            <Switch id="promocao" checked={form.promocao} onCheckedChange={(v) => setForm({ ...form, promocao: v })} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
            <div>
              <Label htmlFor="ativo" className="cursor-pointer">Produto ativo</Label>
              <p className="text-xs text-muted-foreground">Apenas produtos ativos aparecem no catálogo</p>
            </div>
            <Switch id="ativo" checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
          </div>

          <div>
            <Label>Imagem</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="size-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                {form.imagem ? (
                  <img src={form.imagem} alt="" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-muted-foreground">
                    <ImageIcon className="size-5" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  id="upload"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <label htmlFor="upload">
                  <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                    <span className="cursor-pointer">
                      {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                      {uploading ? "Enviando..." : "Enviar imagem"}
                    </span>
                  </Button>
                </label>
                {form.imagem && (
                  <button type="button" onClick={() => setForm({ ...form, imagem: "" })}
                    className="ml-2 text-xs text-destructive hover:underline">
                    remover
                  </button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="hero" disabled={saving || uploading}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
