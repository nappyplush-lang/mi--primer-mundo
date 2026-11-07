import Reveal from "../Reveal";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section id="testimonios" aria-labelledby="testimonios-title" className="section-y">
      <div className="container-site">
        <Reveal>
          <p className="eyebrow mb-6">Testimonios · EJEMPLO — reemplazar</p>
          <h2 id="testimonios-title" className="h2-serif">
            Lo que <em>sienten</em> quienes nos visitan
          </h2>
        </Reveal>
        <Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
            {testimonials.map((t) => (
              <figure key={t.name} className="border-t border-hairline pt-6">
                <blockquote className="font-serif text-2xl leading-snug">“{t.quote}”</blockquote>
                <figcaption className="mt-6 text-sm text-ink-muted">
                  {t.name} · {t.treatment}
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
