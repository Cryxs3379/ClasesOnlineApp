import { Link } from 'react-router-dom';
import { useState } from 'react';

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Cursos', href: '#cursos' },
  { label: 'Inglés online', href: '#ingles' },
  { label: 'Spanish for foreigners', href: '#spanish' },
  { label: 'Precios', href: '#precios' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Contacto', href: '#contacto' },
];

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="amb-header">
      <div className="amb-container amb-header__inner">
        <Link to="/" className="amb-logo" onClick={() => setMenuOpen(false)}>
          <span className="amb-logo__mark">A</span>
          <span>Ambilengua</span>
        </Link>

        <button
          type="button"
          className="amb-header__toggle"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`amb-nav ${menuOpen ? 'amb-nav--open' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#contacto" className="amb-btn amb-btn--primary amb-btn--sm">
            Clase gratis
          </a>
          <Link to="/login" className="amb-nav__login" onClick={() => setMenuOpen(false)}>
            Acceder
          </Link>
        </nav>
      </div>
    </header>
  );
}
