export default function LandingCard({
  title,
  description,
  benefits = [],
  buttonLabel = 'Saber más',
  buttonHref = '#contacto',
  accent = 'blue',
  featured = false,
}) {
  return (
    <article className={`amb-card amb-card--${accent} ${featured ? 'amb-card--featured' : ''}`}>
      <h3>{title}</h3>
      {description && <p className="amb-card__desc">{description}</p>}
      {benefits.length > 0 && (
        <ul className="amb-card__list">
          {benefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      <a href={buttonHref} className="amb-btn amb-btn--outline amb-btn--block">
        {buttonLabel}
      </a>
    </article>
  );
}
