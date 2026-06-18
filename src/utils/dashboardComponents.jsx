import { Link } from 'react-router-dom';

export function StatCard({ icon, label, value, hint, variant }) {
  const variantClass = variant ? `stat-card--${variant}` : '';
  return (
    <article className={`stat-card ${variantClass}`.trim()}>
      {icon ? (
        <span className="stat-card__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <strong className="stat-card__value">{value}</strong>
      <span className="stat-card__label">{label}</span>
      {hint ? <span className="stat-card__hint">{hint}</span> : null}
    </article>
  );
}

/** @deprecated Use StatCard — kept for other pages */
export function DashboardStatCard({ label, value, hint, variant }) {
  return <StatCard label={label} value={value} hint={hint} variant={variant} />;
}

export function DashboardSectionCard({ title, action, children, className = '' }) {
  return (
    <section className={`dashboard-section-card card ${className}`.trim()}>
      <div className="dashboard-section-card__header">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="dashboard-section-card__body">{children}</div>
    </section>
  );
}

/** @deprecated Use DashboardSectionCard */
export function DashboardSection({ title, action, children }) {
  return (
    <DashboardSectionCard title={title} action={action}>
      {children}
    </DashboardSectionCard>
  );
}

export function DashboardListItem({ title, meta, badge, action, className = '' }) {
  return (
    <li className={`dashboard-list-item ${className}`.trim()}>
      <div className="dashboard-list-item__main">
        <p className="dashboard-list-item__title">{title}</p>
        {meta ? <p className="dashboard-list-item__meta">{meta}</p> : null}
      </div>
      {badge ? <span className="dashboard-list-item__badge">{badge}</span> : null}
      {action ? <div className="dashboard-list-item__actions">{action}</div> : null}
    </li>
  );
}

export function InlineEmptyState({ title, message, action }) {
  return (
    <div className="dashboard-empty-inline">
      {title ? <h3>{title}</h3> : null}
      <p>{message}</p>
      {action}
    </div>
  );
}

export function QuickActionButton({ to, label, icon }) {
  return (
    <Link to={to} className="quick-action-button">
      {icon ? (
        <span className="quick-action-button__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </Link>
  );
}

/** @deprecated Use QuickActionButton */
export function DashboardQuickLink({ to, label }) {
  return <QuickActionButton to={to} label={label} />;
}

export function QuickActions({ children }) {
  return <div className="quick-actions">{children}</div>;
}
