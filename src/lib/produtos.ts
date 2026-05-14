import type { Database } from "@/integrations/supabase/types";

export type Produto = Database["public"]["Tables"]["produtos"]["Row"];
export type Categoria = string;

export const CATEGORIAS: { value: string; label: string; icon: string }[] = [
  { value: "cimento", label: "Cimento", icon: "🧱" },
  { value: "tijolos", label: "Tijolos", icon: "🧱" },
  { value: "areia", label: "Areia", icon: "🏖️" },
  { value: "acabamento", label: "Acabamento", icon: "🎨" },
  { value: "ferramentas", label: "Ferramentas", icon: "🔨" },
  { value: "hidraulica", label: "Hidráulica", icon: "🚰" },
  { value: "eletrica", label: "Elétrica", icon: "⚡" },
  { value: "outros", label: "Outros", icon: "📦" },
];

export function categoriaLabel(c: Categoria) {
  return CATEGORIAS.find((x) => x.value === c)?.label ?? c;
}
