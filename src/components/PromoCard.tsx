import { Flame, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brl, productInquiryMessage, whatsappLink } from "@/lib/whatsapp";
import type { Produto } from "@/lib/produtos";

export function PromoCard({ produto }: { produto: Produto }) {
  const desconto =
    produto.preco_promocional && produto.preco
      ? Math.round((1 - produto.preco_promocional / produto.preco) * 100)
      : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-primary/30 bg-card shadow-soft transition-base hover:-translate-y-1 hover:shadow-glow">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-gradient-promo px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow">
        <Flame className="size-3.5" />
        OFERTA DO DIA
      </div>

      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {produto.imagem ? (
          <img
            src={produto.imagem}
            alt={produto.nome}
            loading="lazy"
            className="size-full object-cover transition-base group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Package className="size-16" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-xl font-bold text-secondary">{produto.nome}</h3>
        {produto.descricao && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{produto.descricao}</p>
        )}

        <div className="mt-1 flex items-end gap-3">
          <span className="text-3xl font-extrabold text-primary">{brl(produto.preco_promocional)}</span>
          <span className="pb-1 text-sm text-muted-foreground line-through">{brl(produto.preco)}</span>
          {desconto > 0 && (
            <span className="ml-auto rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">
              -{desconto}%
            </span>
          )}
        </div>

        <a
          href={whatsappLink(productInquiryMessage(produto))}
          target="_blank"
          rel="noreferrer"
          className="mt-2"
        >
          <Button variant="hero" size="lg" className="w-full">
            <MessageCircle className="size-5" />
            Quero esta oferta
          </Button>
        </a>
      </div>
    </article>
  );
}
