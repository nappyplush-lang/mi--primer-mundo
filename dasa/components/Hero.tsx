import Image from "next/image";
import WhatsAppButton from "./WhatsAppButton";
import ScrollIndicator from "./ScrollIndicator";
import { basePath, flags, site } from "@/config/site";
import { whatsappMessages } from "@/lib/whatsapp";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate min-h-[640px] h-svh overflow-hidden bg-bg-deep"
    >
      {/* z0 · FOTO DE FONDO — PLACEHOLDER: public/images/hero-bg.jpg (2400×1250).
          Reemplazar por la fachada real del centro al anochecer, ventanas con luz cálida. */}
      <Image
        src={`${basePath}/images/hero-bg.jpg`}
        alt={`Fachada del centro estético ${site.name} al anochecer, con luz cálida en las ventanas`}
        fill
        priority
        sizes="100vw"
        className="anim-zoom z-0 object-cover object-[55%_50%] sm:object-center"
      />

      {/* z1 · Overlays */}
      <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[rgba(5,8,16,0.15)]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,8,16,0.55) 0%, rgba(5,8,16,0) 30%), linear-gradient(to top, rgba(5,8,16,0.60) 0%, rgba(5,8,16,0) 45%)",
        }}
      />

      {/* Eyebrow */}
      <p className="eyebrow anim-fade absolute left-gutter right-gutter top-[88px] z-[4] max-w-[220px] sm:max-w-none lg:top-[13%]">
        Centro estético · Tratamientos a tu medida
      </p>

      {/* H1 único: las dos palabras se posicionan por separado para poder
          intercalar el recorte del edificio (z3) entre ambas. */}
      <h1>
        <span
          className="anim-fade absolute inset-x-0 top-[17%] z-[2] block whitespace-nowrap text-center font-serif uppercase leading-[0.85] tracking-[-0.01em] text-ink sm:top-[16%] lg:top-[15%] text-[clamp(2.8rem,18.7vw,19rem)] sm:text-[clamp(2.8rem,17.8vw,19rem)]"
          style={{ ["--d" as string]: "120ms" }}
        >
          Excepcional
        </span>
        <span
          className="anim-fade absolute left-gutter top-[29%] z-[4] block font-serif italic leading-none text-ink sm:top-[34%] lg:top-[59%] text-[clamp(1.77rem,11.78vw,12rem)] sm:text-[clamp(1.77rem,11.2vw,12rem)]"
          style={{ ["--d" as string]: "240ms" }}
        >
          cuidado.
        </span>
      </h1>

      {/* z3 · RECORTE DEL EDIFICIO — PLACEHOLDER: public/images/hero-fg.png
          Mismo encuadre y dimensiones que hero-bg.jpg; solo edificio/vegetación
          frontal con fondo transparente. */}
      {flags.HERO_DEPTH_EFFECT && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3]">
          <Image
            src={`${basePath}/images/hero-fg.png`}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="anim-zoom object-cover object-[55%_50%] sm:object-center"
          />
        </div>
      )}

      {/* Tagline + párrafo + CTA.
          <640: tagline → párrafo → CTA · 640–1023: párrafo+CTA sobre el tagline
          ≥1024: posiciones absolutas por porcentaje (lg:contents). */}
      <div className="absolute inset-x-gutter bottom-6 z-[4] flex flex-col gap-5 sm:flex-col-reverse sm:gap-8 lg:contents">
        <p
          className="anim-fade font-serif text-[20px] text-ink lg:absolute lg:bottom-[4.5%] lg:left-gutter lg:text-[22px]"
          style={{ ["--d" as string]: "480ms" }}
        >
          Donde empieza tu bienestar.
        </p>
        <div
          className="anim-fade flex flex-col gap-5 sm:max-w-[380px] lg:absolute lg:left-[51%] lg:top-[82%] lg:gap-[18px]"
          style={{ ["--d" as string]: "360ms" }}
        >
          <p className="max-w-[380px] text-sm leading-[1.6] text-ink-soft sm:text-[15px] lg:text-base">
            Tratamientos faciales, corporales y masajes de relajación, elegidos con criterio y aplicados con calma.
          </p>
          <WhatsAppButton variant="link" message={whatsappMessages.general}>
            Agendar cita
          </WhatsAppButton>
        </div>
      </div>

      <ScrollIndicator className="absolute right-[2%] top-[68%] z-[4] hidden sm:flex" />

      {flags.SHOW_DECORATIVE_DOT && (
        <span
          aria-hidden="true"
          className="absolute left-[70%] top-[65%] z-[4] hidden h-[5px] w-[5px] rounded-full bg-ink opacity-90 sm:block"
        />
      )}
    </section>
  );
}
