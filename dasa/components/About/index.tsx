import Reveal from "../Reveal";

const benefits = [
  "Atención personalizada",
  "Profesionales capacitados",
  "Productos de calidad",
  "Ambiente tranquilo",
  "Valoración previa",
];

export default function About() {
  return (
    <section id="nosotros" aria-labelledby="nosotros-title" className="section-y bg-sand">
      <div className="container-site grid gap-14 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <p className="eyebrow mb-6">Nosotros</p>
          <h2 id="nosotros-title" className="h2-serif">
            Un espacio para <em>volver</em> a ti
          </h2>
          <p className="mt-8 max-w-[440px] leading-[1.6] text-ink-soft">
            Creemos en el cuidado sin prisa. Escuchamos lo que necesitas, te explicamos cada paso y aplicamos
            cada tratamiento con calma, en un ambiente pensado para que te sientas cómoda.
          </p>
        </Reveal>
        <Reveal>
          <ul>
            {benefits.map((b, i) => (
              <li key={b} className="flex items-baseline gap-6 border-t border-hairline py-5 last:border-b">
                <span className="eyebrow text-accent">0{i + 1}</span>
                <span className="font-serif text-2xl">{b}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
