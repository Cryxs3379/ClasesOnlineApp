import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Gestión de alumnos',
    text: 'Crea cuentas privadas para tus alumnos y gestiona su acceso desde un panel centralizado.',
  },
  {
    title: 'Calendario de clases',
    text: 'Programa sesiones, visualiza tu agenda y accede a cada clase con un clic.',
  },
  {
    title: 'BridgeCall con Jitsi self-hosted',
    text: 'Videollamadas integradas en cada clase con tu infraestructura propia.',
  },
  {
    title: 'Documentos y tareas',
    text: 'Comparte materiales y organiza el trabajo de cada alumno (próximamente).',
  },
  {
    title: 'Mensajería en tiempo real',
    text: 'Comunicación directa profesor-alumno dentro de la plataforma (próximamente).',
  },
  {
    title: 'Pizarra del profesor',
    text: 'Anotaciones en directo sincronizadas con el alumno durante la clase (próximamente).',
  },
];

export default function Home() {
  return (
    <div className="home home-saas">
      <section className="hero hero-saas">
        <span className="eyebrow">Plataforma profesional</span>
        <h1>Gestiona tus clases online desde un solo lugar</h1>
        <p className="hero__subtitle">
          BridgeClass une videollamadas, calendario, alumnos, documentos, mensajes y pizarra en
          directo para profesores particulares.
        </p>
        <div className="hero__actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Crear cuenta de profesor
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg">
            Iniciar sesión
          </Link>
        </div>
      </section>

      <section className="features-grid">
        {features.map((feature) => (
          <article key={feature.title} className="card feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="cta-section card">
        <h2>Tu espacio privado de enseñanza online</h2>
        <p>
          Regístrate como profesor, crea tus alumnos y empieza a impartir clases con BridgeCall
          integrado.
        </p>
        <Link to="/register" className="btn btn-primary">
          Empezar ahora
        </Link>
      </section>
    </div>
  );
}
