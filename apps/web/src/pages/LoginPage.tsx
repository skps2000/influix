import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button, Input, Card } from '@influix/ui';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        await register(email, name, password);
        navigate('/onboarding');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred');
    }
  };

  return (
    <Card variant="bordered" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-surface-100">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-surface-400 mt-1">
            {isRegister
              ? 'Start understanding why content works'
              : 'Sign in to continue to InfluiX / skps2000@gmail.com'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isRegister && (
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            hint={isRegister ? 'At least 8 characters' : undefined}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          {isRegister ? 'Create account' : 'Sign in'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </form>
    </Card>
  );
}
