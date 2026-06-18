import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import PrivateSidebar from './components/PrivateSidebar';
import PrivateTopbar from './components/PrivateTopbar';
import Loading from '../components/Loading';

function AuthShell() {
  return (
    <div className="auth-shell">
      <header className="auth-shell__header">
        <Link to="/" className="private-brand private-brand--compact">
          <span className="private-brand__icon" aria-hidden="true">
            A
          </span>
          <div className="private-brand__text">
            <strong>Ambilengua</strong>
            <span>Academia online</span>
          </div>
        </Link>
      </header>
      <main className="auth-shell__main">
        <Outlet />
      </main>
    </div>
  );
}

function PrivateShell() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function handleLogout() {
    setMenuOpen(false);
    logoutUser();
    navigate('/login');
  }

  return (
    <div className="private-shell">
      {menuOpen ? (
        <button
          type="button"
          className="private-shell__overlay"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <PrivateSidebar
        user={user}
        onLogout={handleLogout}
        isOpen={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />

      <div className="private-main">
        <PrivateTopbar
          user={user}
          onLogout={handleLogout}
          onMenuToggle={() => setMenuOpen((open) => !open)}
          menuOpen={menuOpen}
        />

        <main className="private-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-shell">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return <AuthShell />;
  }

  return <PrivateShell />;
}
