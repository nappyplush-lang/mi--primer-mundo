import Reveal from "../Reveal";
import { faq } from "@/data/faq";

export default function Faq() {
  return (
    <section id="cuidados" aria-labelledby="cuidados-title" className="section-y bg-paper">
      <div className="container-site grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
        <Reveal>
          <p className="eyebrow mb-6">Cuidados</p>
          <h2 id="cuidados-title" className="h2-serif">
            Preguntas <em>frecuentes</em>
          </h2>
        </Reveal>
        <Reveal>
          <div>
            {faq.map((f) => (
              <details key={f.q} className="-mx-4 border-t border-hairline px-4 open:bg-surface last:border-b">
                <summary className="flex items-center justify-between gap-6 py-6 font-serif text-2xl">
                  {f.q}
                  <span aria-hidden="true" className="faq-plus text-2xl font-light">+</span>
                </summary>
                <p className="max-w-[560px] pb-6 leading-[1.6] text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
