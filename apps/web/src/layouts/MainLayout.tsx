import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export function MainLayout() {
  return (
    <div className="flex h-screen bg-surface-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
