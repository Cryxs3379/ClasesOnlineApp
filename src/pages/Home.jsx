import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Clases online con profesores en directo</h1>
        <p className="hero__subtitle">
          Encuentra profesores, reserva una clase y entra en tu sala online desde la misma plataforma.
        </p>
        <div className="hero__actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Empezar ahora
          </Link>
          <Link to="/teachers" className="btn btn-outline btn-lg">
            Ver profesores
          </Link>
        </div>
      </section>

      <section className="steps">
        <h2>Cómo funciona</h2>
        <div className="steps__grid">
          <div className="step-card">
            <span className="step-card__number">1</span>
            <h3>Busca un profesor</h3>
            <p>Explora perfiles, materias y precios por hora.</p>
          </div>
          <div className="step-card">
            <span className="step-card__number">2</span>
            <h3>Reserva una clase</h3>
            <p>Elige fecha y hora que mejor te venga.</p>
          </div>
          <div className="step-card">
            <span className="step-card__number">3</span>
            <h3>Entra en la sala online</h3>
            <p>Conéctate en directo con tu profesor desde el navegador.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
