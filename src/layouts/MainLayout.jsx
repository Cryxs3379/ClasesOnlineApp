import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="app-layout app-shell">
      <Navbar />
      <main className="main-content container">
        <Outlet />
      </main>
    </div>
  );
}
