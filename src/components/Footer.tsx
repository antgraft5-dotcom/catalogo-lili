import { MapPin, Phone, Clock } from "lucide-react";
import logo from "@/assets/lili-logo.png";
import {
  GOOGLE_MAPS_EMBED,
  STORE_ADDRESS,
  STORE_HOURS,
  STORE_NAME,
  STORE_SLOGAN,
  WHATSAPP_DISPLAY,
  whatsappLink,
} from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer id="contato" className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-14 w-14 rounded-md bg-white object-contain p-1" />
              <div>
                <div className="font-display text-lg font-bold">{STORE_NAME}</div>
                <div className="text-sm text-secondary-foreground/70">{STORE_SLOGAN}</div>
              </div>
            </div>
            <p className="mt-6 text-sm text-secondary-foreground/70">
              Produtos de qualidade, da obra ao acabamento.
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <h3 className="font-display text-base font-semibold">Contato</h3>
            <a
              href={whatsappLink("Olá! Gostaria de mais informações.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 text-secondary-foreground/80 hover:text-primary"
            >
              <Phone className="mt-0.5 size-4 shrink-0" />
              <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
            </a>
            <div className="flex items-start gap-3 text-secondary-foreground/80">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{STORE_ADDRESS}</span>
            </div>
            <div className="flex items-start gap-3 text-secondary-foreground/80">
              <Clock className="mt-0.5 size-4 shrink-0" />
              <span>{STORE_HOURS}</span>
            </div>
          </div>

          <div id="localizacao" className="space-y-3">
            <h3 className="font-display text-base font-semibold">Localização</h3>
            <div className="overflow-hidden rounded-lg border border-white/10">
              <iframe
                title="Mapa Lili Materiais"
                src={GOOGLE_MAPS_EMBED}
                width="100%"
                height="200"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-secondary-foreground/60">
          © {new Date().getFullYear()} {STORE_NAME}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
