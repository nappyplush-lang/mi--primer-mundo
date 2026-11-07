import Reveal from "../Reveal";
import { steps } from "@/data/steps";

export default function Process() {
  return (
    <section id="proceso" aria-labelledby="proceso-title" className="section-y">
      <div className="container-site">
        <Reveal>
          <p className="eyebrow mb-6">Proceso</p>
          <h2 id="proceso-title" className="h2-serif">
            Así es <em>agendar</em>
          </h2>
        </Reveal>
        <Reveal>
          <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((s) => (
              <li key={s.number} className="border-t border-hairline pt-6">
                <span className="eyebrow">{s.number}</span>
                <h3 className="mt-4 font-serif text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-[1.6] text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
