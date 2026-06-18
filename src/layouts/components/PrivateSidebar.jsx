import { NavLink } from 'react-router-dom';
import { getNavItems, getRoleLabel, getUserInitial } from '../privateNavConfig';

export default function PrivateSidebar({ user, onLogout, isOpen, onNavigate }) {
  const navItems = getNavItems(user?.role);

  function handleNavClick() {
    onNavigate?.();
  }

  return (
    <aside className={`private-sidebar${isOpen ? ' is-open' : ''}`} aria-label="Navegación principal">
      <div className="private-brand">
        <span className="private-brand__icon" aria-hidden="true">
          A
        </span>
        <div className="private-brand__text">
          <strong>Ambilengua</strong>
          <span>Academia online</span>
        </div>
      </div>

      <nav className="private-nav">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `private-nav-link${isActive ? ' active' : ''}`}
            onClick={handleNavClick}
          >
            <span className="private-nav-link__icon" aria-hidden="true">
              {icon}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="private-user-card">
        <div className="private-user-card__profile">
          <span className="private-avatar" aria-hidden="true">
            {getUserInitial(user)}
          </span>
          <div className="private-user-card__info">
            <strong>{user?.name || 'Usuario'}</strong>
            <span>{getRoleLabel(user?.role)}</span>
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm btn-block private-user-card__logout" onClick={onLogout}>
          Salir
        </button>
      </div>
    </aside>
  );
}
