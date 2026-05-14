import { MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { brl, productInquiryMessage, whatsappLink } from "@/lib/whatsapp";
import { categoriaLabel, type Produto } from "@/lib/produtos";

export function ProductCard({ produto }: { produto: Produto }) {
  const emPromocao = produto.promocao && produto.preco_promocional != null;
  const semEstoque = produto.estoque <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-base hover:-translate-y-0.5 hover:shadow-elegant">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {produto.imagem ? (
          <img
            src={produto.imagem}
            alt={produto.nome}
            loading="lazy"
            className="size-full object-cover transition-base group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Package className="size-12" />
          </div>
        )}
        {emPromocao && (
          <Badge className="absolute left-3 top-3 bg-gradient-promo text-primary-foreground shadow-glow">
            OFERTA
          </Badge>
        )}
        {semEstoque && (
          <div className="absolute inset-0 grid place-items-center bg-secondary/70 text-sm font-semibold text-white">
            Sem estoque
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>{categoriaLabel(produto.categoria)}</span>
          <span>Estoque: {produto.estoque}</span>
        </div>
        <h3 className="line-clamp-2 font-display text-base font-semibold text-secondary">
          {produto.nome}
        </h3>
        {produto.descricao && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{produto.descricao}</p>
        )}

        <div className="mt-2">
          {emPromocao ? (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">{brl(produto.preco_promocional)}</span>
              <span className="text-sm text-muted-foreground line-through">{brl(produto.preco)}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-secondary">{brl(produto.preco)}</span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-3">
          {produto.link && (
            <a href={produto.link} target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full">
                Ver detalhes
              </Button>
            </a>
          )}
          <a
            href={whatsappLink(productInquiryMessage(produto))}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="whatsapp" className="w-full" disabled={semEstoque}>
              <MessageCircle className="size-4" />
              Chamar no WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </article>
  );
}
