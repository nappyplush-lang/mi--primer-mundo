import Logo from "../Logo";
import WhatsAppButton from "../WhatsAppButton";
import { site } from "@/config/site";
import { buildWhatsAppLink, whatsappMessages } from "@/lib/whatsapp";

export default function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="container-site section-y grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo className="text-lg" />
          <p className="mt-4 text-sm text-ink-muted">Centro estético · {site.city}</p>
        </div>
        <div>
          <p className="eyebrow mb-4">Dirección</p>
          <p className="text-sm leading-[1.6] text-ink-soft">{site.address}</p>
        </div>
        <div>
          <p className="eyebrow mb-4">Horarios</p>
          {site.hours.map((h) => (
            <p key={h} className="text-sm leading-[1.6] text-ink-soft">{h}</p>
          ))}
        </div>
        <div>
          <p className="eyebrow mb-4">Contacto</p>
          <a
            href={buildWhatsAppLink(whatsappMessages.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-ink-soft hover:text-ink"
          >
            WhatsApp {site.phoneDisplay}
          </a>
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-sm text-ink-soft hover:text-ink"
          >
            Instagram {site.instagram.handle}
          </a>
          <div className="mt-8">
            <WhatsAppButton variant="outline" message={whatsappMessages.general}>
              Agendar cita
            </WhatsAppButton>
          </div>
        </div>
      </div>
      <div className="container-site border-t border-hairline py-6 text-xs text-ink-muted">
        © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
