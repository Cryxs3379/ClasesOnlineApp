const footerLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Cursos', href: '#cursos' },
  { label: 'Precios', href: '#precios' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Contacto', href: '#contacto' },
];

export default function LandingFooter() {
  return (
    <footer className="amb-footer" id="contacto">
      <div className="amb-container amb-footer__grid">
        <div className="amb-footer__brand">
          <div className="amb-logo amb-logo--light">
            <span className="amb-logo__mark">A</span>
            <span>Ambilengua</span>
          </div>
          <p>
            Academia online de inglés y español desde Málaga. Clases en directo, grupos reducidos
            y seguimiento personalizado.
          </p>
        </div>

        <div>
          <h4>Enlaces</h4>
          <ul className="amb-footer__links">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Contacto</h4>
          <ul className="amb-footer__links">
            <li>
              <a href="mailto:info@ambilengua.com">info@ambilengua.com</a>
            </li>
            <li>
              <a href="https://wa.me/34600000000" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </li>
            <li>Málaga, España</li>
          </ul>
        </div>

        <div>
          <h4>Legal</h4>
          <ul className="amb-footer__links">
            <li><a href="#legal">Aviso legal</a></li>
            <li><a href="#privacidad">Privacidad</a></li>
            <li><a href="#cookies">Cookies</a></li>
          </ul>
        </div>
      </div>

      <div className="amb-container amb-footer__bottom">
        <p>© {new Date().getFullYear()} Ambilengua. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
