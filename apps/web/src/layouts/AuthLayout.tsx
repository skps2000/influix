import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">InfluiX</h1>
          <p className="text-surface-400 mt-2">AI-native influence intelligence</p>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
}
