import { Droplet, Hand, PersonStanding } from "lucide-react";
import Reveal from "../Reveal";
import WhatsAppButton from "../WhatsAppButton";
import { services } from "@/data/services";
import { whatsappMessages } from "@/lib/whatsapp";

const icons = { droplet: Droplet, figure: PersonStanding, hand: Hand };

export default function Services() {
  return (
    <section id="servicios" aria-labelledby="servicios-title" className="section-y bg-paper">
      <div className="container-site">
        <Reveal>
          <p className="eyebrow mb-6">Servicios</p>
          <h2 id="servicios-title" className="h2-serif max-w-[14ch]">
            Tratamientos a tu <em>medida</em>
          </h2>
        </Reveal>

        <ul className="mt-16 lg:mt-24">
          {services.map((s) => {
            const Icon = icons[s.icon];
            return (
              <li key={s.number} className="border-t border-hairline last:border-b">
                <Reveal className="grid gap-8 py-12 md:grid-cols-12 lg:py-16">
                  <span className="eyebrow text-accent md:col-span-1">{s.number} / 03</span>
                  <div className="md:col-span-7">
                    <Icon size={22} strokeWidth={1.25} aria-hidden="true" className="mb-5 text-ink-soft" />
                    <h3 className="h2-serif">{s.title}</h3>
                    <ul className="mt-6 space-y-2 text-ink-soft">
                      {s.items.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <WhatsAppButton variant="link" message={whatsappMessages[s.message]}>
                        Agendar
                      </WhatsAppButton>
                    </div>
                  </div>
                  {/* PLACEHOLDER FOTO 4:5 — real: {s.photo} */}
                  <div
                    role="img"
                    aria-label={`${s.photo} (imagen pendiente)`}
                    className="photo-soft flex aspect-[4/5] w-full max-w-[280px] items-end border border-hairline p-4 md:col-span-4 md:justify-self-end"
                  >
                    <span className="eyebrow">Foto · {s.photo}</span>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
