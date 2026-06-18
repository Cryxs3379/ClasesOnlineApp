export default function EmptyState({ title, message, action, icon }) {
  return (
    <div className="empty-state">
      {icon ? (
        <span className="empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
      {action}
    </div>
  );
}
