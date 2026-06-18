import { Link } from 'react-router-dom';

export function DashboardStatCard({ label, value, hint, variant }) {
  const variantClass = variant ? `dashboard-stat-card--${variant}` : '';
  return (
    <article className={`dashboard-stat-card ${variantClass}`.trim()}>
      <span className="dashboard-stat-card__label">{label}</span>
      <strong className="dashboard-stat-card__value">{value}</strong>
      {hint && <span className="dashboard-stat-card__hint">{hint}</span>}
    </article>
  );
}

export function DashboardSection({ title, action, children }) {
  return (
    <section className="dashboard-section card">
      <div className="dashboard-section__header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function DashboardListItem({ title, meta, badge, action }) {
  return (
    <li className="dashboard-list-item">
      <div className="dashboard-list-item__main">
        <p className="dashboard-list-item__title">{title}</p>
        {meta && <p className="dashboard-list-item__meta">{meta}</p>}
      </div>
      {badge && <span className="dashboard-list-item__badge">{badge}</span>}
      {action && <div className="dashboard-list-item__actions">{action}</div>}
    </li>
  );
}

export function InlineEmptyState({ message, action }) {
  return (
    <div className="dashboard-empty-inline">
      <p>{message}</p>
      {action}
    </div>
  );
}

export function DashboardQuickLink({ to, label }) {
  return (
    <Link to={to} className="dashboard-quick-card">
      {label}
    </Link>
  );
}
