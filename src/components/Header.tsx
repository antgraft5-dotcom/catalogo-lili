import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/lili-logo.png";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Promoções", href: "/#promocoes" },
  { label: "Produtos", href: "/#produtos" },
  { label: "Localização", href: "/#localizacao" },
  { label: "Contato", href: "/#contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Lili Materiais de Construção" className="h-12 w-12 rounded-md object-contain" />
          <div className="hidden sm:block leading-tight">
            <div className="font-display text-base font-bold text-secondary">Lili Materiais</div>
            <div className="text-[11px] text-muted-foreground">Desde 1995 · Bonfinópolis/MG</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-secondary transition-base hover:bg-accent hover:text-primary"
            >
              {n.label}
            </a>
          ))}
          <Link to="/login" className="ml-2">
            <Button variant="outline" size="sm">Área Admin</Button>
          </Link>
        </nav>

        <button
          className="md:hidden rounded-md p-2 text-secondary hover:bg-accent"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container mx-auto flex max-w-7xl flex-col px-4 py-3">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-secondary hover:bg-accent"
              >
                {n.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="mt-2">
              <Button variant="outline" className="w-full">Área Admin</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
