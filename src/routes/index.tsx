import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Hammer, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { PromoCard } from "@/components/PromoCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIAS, type Produto, type Categoria } from "@/lib/produtos";
import { STORE_SLOGAN } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lili Materiais de Construção — Bonfinópolis/MG" },
      {
        name: "description",
        content:
          "Catálogo de materiais de construção em Bonfinópolis de Minas. Cimento, tijolos, ferramentas, hidráulica, elétrica e acabamento. Desde 1995.",
      },
      { property: "og:title", content: "Lili Materiais de Construção" },
      { property: "og:description", content: STORE_SLOGAN },
    ],
  }),
  component: Home,
});

function Home() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Categoria | "todas">("todas");

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Produto[];
    },
  });

  const promocoes = useMemo(
    () => produtos.filter((p) => p.promocao && p.preco_promocional != null),
    [produtos],
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      if (filtro !== "todas" && p.categoria !== filtro) return false;
      if (!q) return true;
      return (
        p.nome.toLowerCase().includes(q) ||
        (p.descricao?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [produtos, busca, filtro]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 40%)",
        }} />
        <div className="container relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Hammer className="size-3.5" /> Desde 1995 em Bonfinópolis/MG
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Da fundação ao acabamento, <span className="text-primary-glow">tudo num só lugar.</span>
            </h1>
            <p className="mt-5 text-lg text-white/80">
              {STORE_SLOGAN}. Confira nossas <strong className="text-white">ofertas do dia</strong> e
              fale com a gente direto no WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#promocoes">
                <Button variant="hero" size="xl">
                  Ver promoções <ArrowRight className="size-5" />
                </Button>
              </a>
              <a href="#produtos">
                <Button variant="outline" size="xl" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  Catálogo completo
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PROMOÇÕES */}
      <section id="promocoes" className="container mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              🔥 Ofertas do dia
            </div>
            <h2 className="font-display text-3xl font-bold text-secondary md:text-4xl">
              Promoções imperdíveis
            </h2>
            <p className="mt-1 text-muted-foreground">Selecionadas a dedo. Estoque limitado.</p>
          </div>
        </div>

        {isLoading ? (
          <SkeletonGrid n={3} large />
        ) : promocoes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Nenhuma promoção ativa no momento. Fique de olho — sempre temos novidades!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promocoes.map((p) => (
              <PromoCard key={p.id} produto={p} />
            ))}
          </div>
        )}
      </section>

      {/* CATÁLOGO */}
      <section id="produtos" className="bg-muted/40 py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-secondary md:text-4xl">
              Nosso catálogo
            </h2>
            <p className="mt-1 text-muted-foreground">
              Filtre por categoria ou busque pelo nome do produto.
            </p>
          </div>

          {/* Busca */}
          <div className="relative mb-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto..."
              className="h-12 pl-10 text-base"
            />
          </div>

          {/* Filtros */}
          <div className="mb-8 flex flex-wrap gap-2">
            <FilterChip active={filtro === "todas"} onClick={() => setFiltro("todas")}>
              Todas
            </FilterChip>
            {CATEGORIAS.map((c) => (
              <FilterChip
                key={c.value}
                active={filtro === c.value}
                onClick={() => setFiltro(c.value)}
              >
                <span>{c.icon}</span> {c.label}
              </FilterChip>
            ))}
          </div>

          {isLoading ? (
            <SkeletonGrid n={8} />
          ) : filtrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
              Nenhum produto encontrado{busca && ` para "${busca}"`}.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtrados.map((p) => (
                <ProductCard key={p.id} produto={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-base ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-soft"
          : "border-border bg-card text-secondary hover:border-primary/40 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonGrid({ n, large = false }: { n: number; large?: boolean }) {
  return (
    <div
      className={`grid gap-5 ${large ? "md:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
    >
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <div className={`${large ? "aspect-[4/3]" : "aspect-square"} animate-pulse bg-muted`} />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
