export default function LandingSection({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = '',
  dark = false,
}) {
  return (
    <section
      id={id}
      className={`amb-section ${dark ? 'amb-section--dark' : ''} ${className}`.trim()}
    >
      <div className="amb-container">
        {(eyebrow || title || subtitle) && (
          <div className="amb-section__header">
            {eyebrow && <span className="amb-eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="amb-section__subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
