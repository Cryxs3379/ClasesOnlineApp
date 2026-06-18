import { useLocation } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import { getPageTitle, getRoleLabel, getUserInitial } from '../privateNavConfig';

export default function PrivateTopbar({ user, onLogout, onMenuToggle, menuOpen }) {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <header className="private-topbar">
      <div className="private-topbar__left">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuToggle}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? '✕' : '☰ Menú'}
        </button>

        <div className="private-topbar__brand-mobile">
          <span className="private-brand__icon private-brand__icon--sm" aria-hidden="true">
            A
          </span>
          <strong>Ambilengua</strong>
        </div>

        <h1 className="private-topbar__title">{title}</h1>
      </div>

      <div className="private-topbar__right">
        <NotificationBell />
        <div className="private-topbar__user">
          <span className="private-avatar private-avatar--sm" aria-hidden="true">
            {getUserInitial(user)}
          </span>
          <div className="private-topbar__user-text">
            <strong>{user?.name || 'Usuario'}</strong>
            <span className="badge badge-primary">{getRoleLabel(user?.role)}</span>
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm private-topbar__logout" onClick={onLogout}>
          Salir
        </button>
      </div>
    </header>
  );
}
