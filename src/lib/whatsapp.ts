// Número WhatsApp da Lili Materiais de Construção
export const WHATSAPP_NUMBER = "555180279411";
export const WHATSAPP_DISPLAY = "55 51 8027-9411";
export const STORE_HOURS = "Seg a Sáb · 07h00 às 18h00";
export const STORE_ADDRESS = "Av. Argemiro Barbosa da Silva, 640 — Bonfinópolis de Minas/MG";
export const STORE_NAME = "Lili Materiais de Construção";
export const STORE_SLOGAN = "Desde 1995 fazendo parte dos seus sonhos";
export const GOOGLE_MAPS_EMBED =
  "https://www.google.com/maps?q=" +
  encodeURIComponent("Av. Argemiro Barbosa da Silva, 640, Bonfinópolis de Minas, MG") +
  "&output=embed";

export function whatsappLink(message: string) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function productInquiryMessage(produto: {
  nome: string;
  preco: number;
  promocao?: boolean;
  preco_promocional?: number | null;
}) {
  const preco = produto.promocao && produto.preco_promocional
    ? `R$ ${produto.preco_promocional.toFixed(2).replace(".", ",")} (promoção)`
    : `R$ ${produto.preco.toFixed(2).replace(".", ",")}`;
  return `Olá! Tenho interesse no produto "${produto.nome}" (${preco}). Ainda está disponível?`;
}

export function brl(value: number | null | undefined) {
  if (value == null) return "—";
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}
