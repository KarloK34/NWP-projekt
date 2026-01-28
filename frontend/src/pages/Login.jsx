import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || t('auth.loginError'));
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-800">
          {t('auth.loginTitle')}
        </h1>

        {error && (
          <div
            className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('auth.emailPlaceholder')}
          />

          <Input
            id="password"
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t('auth.passwordPlaceholder')}
          />

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            fullWidth
            className="mt-2"
          >
            {loading ? t('auth.loginLoading') : t('auth.loginButton')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            {t('auth.registerLink')}
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
