import { useEffect, useRef, useState, type FormEvent } from 'react';
import Header from '../components/Header';
import { useAuth, emitAuthChanged } from '../hooks/useAuth';
import {
  AuthError,
  login,
  loginVerify,
  register,
  resendCode,
  verifyEmail,
} from '../services/auth';
import styles from './AuthPage.module.css';

type Mode = 'login' | 'register';
type Step = 'credentials' | 'code';

type CodeContext = {
  mode: Mode;
  email: string;
  challengeId: string | null;
  expiresInSeconds: number;
};

export default function AuthPage() {
  const { user, status, logout } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeContext, setCodeContext] = useState<CodeContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      setEmail('');
      setPassword('');
      setCode('');
      setCodeContext(null);
      setStep('credentials');
      setError(null);
      setInfo(null);
      setFieldErrors({});
      setExpiresAt(null);
      setCooldownUntil(null);
    }
  }, [status]);

  useEffect(() => {
    if (step !== 'code') {
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    tickRef.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [step]);

  const expiresLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 1000)) : 0;
  const cooldownLeft = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;

  const resetCommon = () => {
    setError(null);
    setInfo(null);
    setFieldErrors({});
  };

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetCommon();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const challenge = await login(email, password);
        setCodeContext({
          mode: 'login',
          email: challenge.email,
          challengeId: challenge.challengeId,
          expiresInSeconds: challenge.expiresInSeconds,
        });
        setExpiresAt(Date.now() + challenge.expiresInSeconds * 1000);
        setCooldownUntil(null);
        setStep('code');
        setInfo(`Код отправлен на ${challenge.email}`);
      } else {
        const result = await register(email, password);
        setCodeContext({
          mode: 'register',
          email: result.email,
          challengeId: null,
          expiresInSeconds: result.expiresInSeconds,
        });
        setExpiresAt(Date.now() + result.expiresInSeconds * 1000);
        setCooldownUntil(null);
        setStep('code');
        setInfo(`Код подтверждения отправлен на ${result.email}`);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!codeContext) return;
    resetCommon();
    setSubmitting(true);
    try {
      if (codeContext.mode === 'login') {
        if (!codeContext.challengeId) throw new Error('missing challenge');
        await loginVerify(codeContext.challengeId, code);
      } else {
        await verifyEmail(codeContext.email, code);
        const challenge = await login(email, password);
        setCodeContext({
          mode: 'login',
          email: challenge.email,
          challengeId: challenge.challengeId,
          expiresInSeconds: challenge.expiresInSeconds,
        });
        setExpiresAt(Date.now() + challenge.expiresInSeconds * 1000);
        setCooldownUntil(null);
        setCode('');
        setInfo(`Email подтверждён. Код для входа отправлен на ${challenge.email}`);
        return;
      }
      emitAuthChanged();
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!codeContext || resending || cooldownLeft > 0) return;
    resetCommon();
    setResending(true);
    try {
      if (codeContext.mode === 'register') {
        const result = await resendCode(codeContext.email);
        setExpiresAt(Date.now() + result.expiresInSeconds * 1000);
        setCooldownUntil(Date.now() + 60 * 1000);
        setInfo(`Код повторно отправлен на ${result.email}`);
      } else {
        const challenge = await login(email, password);
        setCodeContext({
          mode: 'login',
          email: challenge.email,
          challengeId: challenge.challengeId,
          expiresInSeconds: challenge.expiresInSeconds,
        });
        setExpiresAt(Date.now() + challenge.expiresInSeconds * 1000);
        setCooldownUntil(Date.now() + 60 * 1000);
        setInfo(`Код повторно отправлен на ${challenge.email}`);
      }
      setCode('');
    } catch (err) {
      handleError(err);
    } finally {
      setResending(false);
    }
  };

  const handleError = (err: unknown) => {
    if (err instanceof AuthError) {
      setError(err.message);
      if (err.fields) setFieldErrors(err.fields);
      if (err.code === 'resend_too_soon' && err.retryAfterSeconds) {
        setCooldownUntil(Date.now() + err.retryAfterSeconds * 1000);
      }
      if (err.code === 'too_many_attempts' || err.code === 'code_expired' || err.code === 'challenge_not_found') {
        setExpiresAt(null);
      }
    } else {
      setError('Не удалось выполнить запрос');
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep('credentials');
    setCode('');
    setCodeContext(null);
    setExpiresAt(null);
    setCooldownUntil(null);
    resetCommon();
  };

  const backToCredentials = () => {
    setStep('credentials');
    setCode('');
    setCodeContext(null);
    setExpiresAt(null);
    setCooldownUntil(null);
    resetCommon();
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
              <dt>Email</dt>
              <dd>{user.email}</dd>
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
              disabled={step === 'code'}
            >
              Вход
            </button>
            <button
              type="button"
              className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
              onClick={() => switchMode('register')}
              disabled={step === 'code'}
            >
              Регистрация
            </button>
          </div>

          {step === 'credentials' && (
            <form className={styles.form} onSubmit={handleCredentialsSubmit} noValidate>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
                {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
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
                {submitting
                  ? 'Отправка...'
                  : mode === 'login' ? 'Получить код' : 'Зарегистрироваться'}
              </button>
            </form>
          )}

          {step === 'code' && codeContext && (
            <form className={styles.form} onSubmit={handleCodeSubmit} noValidate>
              <p className={styles.hint}>
                {codeContext.mode === 'login'
                  ? 'Введите код из письма, чтобы завершить вход.'
                  : 'Введите код из письма, чтобы подтвердить email.'}
              </p>

              <label className={styles.field}>
                <span className={styles.label}>Код подтверждения</span>
                <input
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  minLength={6}
                  maxLength={6}
                  pattern="\d{6}"
                />
                {fieldErrors.code && <span className={styles.fieldError}>{fieldErrors.code}</span>}
              </label>

              {expiresLeft > 0 && (
                <p className={styles.meta}>Код действителен ещё {formatDuration(expiresLeft)}</p>
              )}

              {info && <p className={styles.info_}>{info}</p>}
              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.submit} disabled={submitting || code.length !== 6}>
                {submitting ? 'Проверка...' : 'Подтвердить'}
              </button>

              <div className={styles.secondaryRow}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={backToCredentials}
                  disabled={submitting}
                >
                  Назад
                </button>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => { void handleResend(); }}
                  disabled={resending || cooldownLeft > 0 || submitting}
                >
                  {cooldownLeft > 0
                    ? `Отправить повторно через ${cooldownLeft}с`
                    : resending ? 'Отправка...' : 'Отправить код повторно'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
