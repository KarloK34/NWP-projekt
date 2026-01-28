import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsMismatch'));
      return false;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError(t('auth.passwordRequirements'));
      return false;
    }

    if (formData.username.length < 3) {
      setError(t('auth.usernameMinLength'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || t('auth.registerError'));
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">
          {t('auth.registerTitle')}
        </h1>

        {error && (
          <div
            className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="username"
            label={t('auth.username')}
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={30}
            placeholder={t('auth.usernamePlaceholder')}
          />

          <Input
            id="email"
            label={t('auth.email')}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={t('auth.emailPlaceholder')}
          />

          <Input
            id="password"
            label={t('auth.password')}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            placeholder={t('auth.passwordPlaceholder')}
            hint={t('auth.passwordHint')}
          />

          <Input
            id="confirmPassword"
            label={t('auth.confirmPassword')}
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder={t('auth.confirmPasswordPlaceholder')}
          />

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            variant="accent"
            fullWidth
            className="mt-2"
          >
            {loading ? t('auth.registerLoading') : t('auth.registerButton')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            {t('auth.loginLink')}
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
