import StudentPanelMockup from '../components/landing/StudentPanelMockup';
import LandingSection from '../components/landing/LandingSection';
import LandingCard from '../components/landing/LandingCard';

const problemCards = [
  {
    title: 'Sin enlaces perdidos',
    text: 'Tu clase, materiales y acceso en directo viven en un solo panel. Nada de buscar el enlace a última hora.',
  },
  {
    title: 'Sin horarios confusos',
    text: 'Consulta tus próximas clases, calendario y recordatorios desde la plataforma, con claridad.',
  },
  {
    title: 'Sin materiales desordenados',
    text: 'PDFs, ejercicios y tareas organizados por clase, siempre a mano cuando los necesitas.',
  },
];

const solutionCards = [
  {
    title: 'Clases en directo',
    text: 'Aprende con profesores reales en sesiones online en tiempo real, con interacción y práctica oral.',
  },
  {
    title: 'Grupos reducidos',
    text: 'Grupos pequeños para participar, corregir y avanzar con atención personalizada.',
  },
  {
    title: 'Panel del alumno',
    text: 'Accede a tus clases, horarios, materiales y enlaces desde un espacio digital propio.',
  },
  {
    title: 'Seguimiento personalizado',
    text: 'Tu profesor conoce tu nivel, objetivos y progreso para adaptar cada sesión.',
  },
];

const courses = [
  {
    id: 'ingles',
    accent: 'blue',
    title: 'Inglés online',
    description: 'Mejora tu inglés con clases en directo, desde nivel básico hasta avanzado.',
    benefits: [
      'Conversación y pronunciación',
      'Preparación para exámenes',
      'Grupos por nivel',
      'Horarios flexibles',
    ],
    buttonLabel: 'Quiero aprender inglés',
  },
  {
    id: 'spanish',
    accent: 'mint',
    title: 'Spanish for foreigners',
    description: 'Aprende español con profesores nativos, ideal si vives en Málaga o aprendes desde fuera.',
    benefits: [
      'Español de la vida real',
      'Cultura y comunicación',
      'Grupos internacionales',
      'Clases adaptadas a tu nivel',
    ],
    buttonLabel: 'Quiero aprender español',
  },
  {
    id: 'particulares',
    accent: 'orange',
    title: 'Clases particulares',
    description: 'Sesiones 1 a 1 totalmente personalizadas según tus objetivos y ritmo.',
    benefits: [
      'Plan a medida',
      'Máxima flexibilidad',
      'Feedback inmediato',
      'Ideal para objetivos concretos',
    ],
    buttonLabel: 'Reservar clase individual',
  },
];

const steps = [
  { num: '1', title: 'Elige tu curso', text: 'Inglés, español para extranjeros o clases particulares.' },
  { num: '2', title: 'Reserva una clase de prueba', text: 'Cuéntanos tu nivel y horarios. Primera clase gratis.' },
  { num: '3', title: 'Accede a tu panel', text: 'Recibe tus credenciales y entra a tu espacio de alumno.' },
  { num: '4', title: 'Aprende en directo', text: 'Conéctate a tu clase online con profesor y materiales listos.' },
];

const pricing = [
  {
    accent: 'blue',
    title: 'Grupo reducido',
    price: 'desde 49€/mes',
    benefits: ['Clases semanales en directo', 'Grupo pequeño por nivel', 'Materiales incluidos', 'Seguimiento del profesor'],
    featured: true,
  },
  {
    accent: 'mint',
    title: 'Clase individual',
    price: 'desde 18€/clase',
    benefits: ['100% personalizada', 'Horario flexible', 'Enfoque en tus objetivos', 'Feedback detallado'],
  },
  {
    accent: 'orange',
    title: 'Bono de clases',
    price: 'desde 70€',
    benefits: ['Pack de sesiones', 'Ideal para avanzar rápido', 'Validez flexible', 'Precio ventajoso'],
  },
];

const differentiators = [
  { title: 'Profesores reales', text: 'Docentes cualificados y cercanos, no solo vídeos grabados.' },
  { title: 'Grupos reducidos', text: 'Participas, preguntas y practicas de verdad en cada sesión.' },
  { title: 'Plataforma propia', text: 'Clases, materiales y acceso organizados en un solo lugar.' },
  { title: 'Desde Málaga', text: 'Academia con raíces locales e internacionales, conectada con el mundo.' },
  { title: 'Primera clase de prueba', text: 'Prueba la metodología y el ambiente antes de decidir.' },
];

export default function Home() {
  return (
    <div className="amb-home">
      <section className="amb-hero" id="inicio">
        <div className="amb-container amb-hero__grid">
          <div className="amb-hero__content">
            <span className="amb-eyebrow">Academia online · Málaga</span>
            <h1>Aprende idiomas online con clases en directo y seguimiento personalizado</h1>
            <p className="amb-hero__subtitle">
              Ambilengua es una academia online desde Málaga para aprender inglés y español con
              profesores reales, grupos reducidos y acceso a tu propio panel de alumno.
            </p>
            <div className="amb-hero__actions">
              <a href="#contacto" className="amb-btn amb-btn--primary amb-btn--lg">
                Reservar clase de prueba gratis
              </a>
              <a href="#cursos" className="amb-btn amb-btn--ghost amb-btn--lg">
                Ver cursos
              </a>
            </div>
            <ul className="amb-hero__tags">
              <li>Clases online en directo</li>
              <li>Grupos reducidos</li>
              <li>Profesores cualificados</li>
              <li>Horarios flexibles</li>
            </ul>
          </div>
          <div className="amb-hero__visual">
            <StudentPanelMockup />
          </div>
        </div>
      </section>

      <LandingSection
        title="Aprender online no debería ser un caos de enlaces, WhatsApp y horarios perdidos"
        subtitle="Ambilengua centraliza clases, horarios, enlaces y materiales para que tú solo te centres en aprender."
      >
        <div className="amb-cards-grid amb-cards-grid--3">
          {problemCards.map((card) => (
            <article key={card.title} className="amb-info-card">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection
        dark
        eyebrow="La solución"
        title="Tu academia online, organizada desde el primer día"
      >
        <div className="amb-cards-grid amb-cards-grid--4">
          {solutionCards.map((card) => (
            <article key={card.title} className="amb-info-card amb-info-card--dark">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection id="cursos" eyebrow="Cursos" title="Elige cómo quieres aprender">
        <div className="amb-cards-grid amb-cards-grid--3">
          {courses.map((course) => (
            <div key={course.id} id={course.id}>
              <LandingCard
                accent={course.accent}
                title={course.title}
                description={course.description}
                benefits={course.benefits}
                buttonLabel={course.buttonLabel}
                buttonHref="#contacto"
              />
            </div>
          ))}
        </div>
      </LandingSection>

      <section className="amb-malaga">
        <div className="amb-container amb-malaga__grid">
          <div className="amb-malaga__content">
            <span className="amb-eyebrow amb-eyebrow--light">Málaga · Mediterráneo</span>
            <h2>Una academia online desde Málaga, conectada con el mundo</h2>
            <p>
              Málaga es una ciudad internacional, acogedora y vibrante: el lugar perfecto para
              aprender idiomas en un entorno multicultural. En Ambilengua combinamos la calidez
              mediterránea con clases online accesibles desde cualquier parte del mundo.
            </p>
            <p>
              Ideal para extranjeros que quieren aprender español y para quienes buscan inglés con
              profesores cercanos y metodología clara.
            </p>
          </div>
          <div className="amb-malaga__visual" aria-hidden="true">
            <div className="amb-malaga__scene">
              <div className="amb-malaga__sun" />
              <div className="amb-malaga__sea" />
              <div className="amb-malaga__city">
                <span>Málaga</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingSection id="como-funciona" eyebrow="Proceso" title="Empezar es muy fácil">
        <div className="amb-steps">
          {steps.map((step) => (
            <article key={step.num} className="amb-step">
              <span className="amb-step__num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection id="precios" eyebrow="Precios" title="Precios sencillos para empezar">
        <div className="amb-cards-grid amb-cards-grid--3">
          {pricing.map((plan) => (
            <article
              key={plan.title}
              className={`amb-price-card amb-price-card--${plan.accent} ${plan.featured ? 'amb-price-card--featured' : ''}`}
            >
              <h3>{plan.title}</h3>
              <p className="amb-price-card__price">{plan.price}</p>
              <ul>
                {plan.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a href="#contacto" className="amb-btn amb-btn--primary amb-btn--block">
                Quiero empezar
              </a>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection title="¿Por qué elegir Ambilengua?">
        <div className="amb-cards-grid amb-cards-grid--5">
          {differentiators.map((item) => (
            <article key={item.title} className="amb-info-card amb-info-card--hover">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </LandingSection>

      <section className="amb-cta-final">
        <div className="amb-container amb-cta-final__inner">
          <h2>Reserva tu clase de prueba gratis</h2>
          <p>
            Cuéntanos qué idioma quieres aprender, tu nivel aproximado y tus horarios disponibles.
            Te responderemos lo antes posible.
          </p>
          <div className="amb-cta-final__actions">
            <a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noreferrer"
              className="amb-btn amb-btn--whatsapp amb-btn--lg"
            >
              Hablar por WhatsApp
            </a>
            <a href="mailto:info@ambilengua.com?subject=Clase%20de%20prueba%20gratis" className="amb-btn amb-btn--primary amb-btn--lg">
              Reservar clase gratis
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
