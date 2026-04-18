import { useEffect, useState, type FormEvent } from 'react';
import Header from '../components/Header';
import { useAuth, emitAuthChanged } from '../hooks/useAuth';
import { AuthError, login, register } from '../services/auth';
import styles from './AuthPage.module.css';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const { user, status, logout } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      setUsername('');
      setPassword('');
      setError(null);
      setFieldErrors({});
    }
  }, [status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
        await login(username, password);
      }
      emitAuthChanged();
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
        if (err.fields) setFieldErrors(err.fields);
      } else {
        setError('Не удалось выполнить запрос');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setFieldErrors({});
  };

  if (status === 'loading') {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <p className={styles.loading}>Загрузка...</p>
        </main>
      </>
    );
  }

  if (status === 'authenticated' && user) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <div className={styles.card}>
            <h1 className={styles.title}>Профиль</h1>
            <dl className={styles.info}>
              <dt>Логин</dt>
              <dd>{user.username}</dd>
              <dt>Роль</dt>
              <dd>{user.role}</dd>
            </dl>
            <button
              type="button"
              className={styles.submit}
              onClick={() => { void logout(); }}
            >
              Выйти
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => switchMode('login')}
            >
              Вход
            </button>
            <button
              type="button"
              className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
              onClick={() => switchMode('register')}
            >
              Регистрация
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.field}>
              <span className={styles.label}>Логин</span>
              <input
                className={styles.input}
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={64}
              />
              {fieldErrors.username && <span className={styles.fieldError}>{fieldErrors.username}</span>}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Пароль</span>
              <input
                className={styles.input}
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={128}
              />
              {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? 'Отправка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
