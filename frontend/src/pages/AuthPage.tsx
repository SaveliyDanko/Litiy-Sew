import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Header from '../components/Header';
import { useAuth, emitAuthChanged } from '../hooks/useAuth';
import {
  AuthError,
  login,
  register,
  resendCode,
  verifyEmail,
} from '../services/auth';
import styles from './AuthPage.module.css';

type Mode = 'login' | 'register';
type Step = 'credentials' | 'code';

type CodeContext = {
  email: string;
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

  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoCardRef = useRef<HTMLDivElement | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user?.email) {
      setProfileForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  useEffect(() => {
    if (!photoMenuOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!photoCardRef.current) return;
      if (!photoCardRef.current.contains(event.target as Node)) {
        setPhotoMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPhotoMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [photoMenuOpen]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [settingsOpen]);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const handlePickFile = () => {
    setPhotoMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: FormEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(file));
    event.currentTarget.value = '';
  };

  const openSettings = () => {
    setPhotoMenuOpen(false);
    setSettingsOpen(true);
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsOpen(false);
  };

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
        await login(email, password);
        emitAuthChanged();
      } else {
        const result = await register(email, password);
        setCodeContext({
          email: result.email,
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
      await verifyEmail(codeContext.email, code);
      await login(email, password);
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
      const result = await resendCode(codeContext.email);
      setExpiresAt(Date.now() + result.expiresInSeconds * 1000);
      setCooldownUntil(Date.now() + 60 * 1000);
      setInfo(`Код повторно отправлен на ${result.email}`);
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
        <main className={styles.profilePage}>
          <aside className={styles.profileAside}>
            <div className={styles.photoCard} ref={photoCardRef}>
              <button
                type="button"
                className={styles.photoButton}
                onClick={handlePickFile}
                style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}
              >
                {!photoUrl && (
                  <>
                    <CameraIcon />
                    <span>Добавить фото</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className={styles.photoSettings}
                aria-label="Настройки профиля"
                aria-haspopup="menu"
                aria-expanded={photoMenuOpen}
                onClick={() => setPhotoMenuOpen((open) => !open)}
              >
                <GearIcon />
              </button>
              {photoMenuOpen && (
                <div className={styles.photoMenu} role="menu">
                  <button type="button" className={styles.photoMenuItem} role="menuitem" onClick={openSettings}>
                    Настройки аккаунта
                  </button>
                  <button type="button" className={styles.photoMenuItem} role="menuitem" onClick={handlePickFile}>
                    Изменить фото
                  </button>
                </div>
              )}
            </div>

            <div className={styles.helpCard}>
              <LifebuoyIcon />
              <p className={styles.helpTitle}>Нужна помощь?</p>
              <p className={styles.helpText}>
                Если у Вас возник вопрос по заказу, выкройке или по другой теме, Вы можете
                обратиться в нашу службу поддержки
              </p>
              <div className={styles.helpSocials}>
                <a href="#" className={styles.helpSocial} aria-label="WhatsApp"><WhatsAppIcon /></a>
                <a href="#" className={styles.helpSocial} aria-label="Telegram"><TelegramIcon /></a>
                <a href="#" className={styles.helpSocial} aria-label="VK"><VkIcon /></a>
              </div>
            </div>
          </aside>

          <section className={styles.profileMain}>
            <nav className={styles.profileTabs} aria-label="Разделы кабинета">
              <div className={styles.profileTabsList}>
                <button type="button" className={`${styles.profileTab} ${styles.profileTabActive}`}>
                  <UserIcon /> <span>Кабинет</span>
                </button>
                <button type="button" className={styles.profileTab}>
                  <BagIcon /> <span>Заказы</span>
                </button>
                <button type="button" className={styles.profileTab}>
                  <HangerIcon /> <span>Выкройки</span>
                </button>
                <button type="button" className={styles.profileTab}>
                  <GiftIcon /> <span>Бонусы</span>
                </button>
                <button type="button" className={styles.profileTab}>
                  <ChatIcon /> <span>Отзывы</span>
                </button>
                <button type="button" className={styles.profileTab}>
                  <RulerIcon /> <span>Мерки</span>
                </button>
              </div>
              <button
                type="button"
                className={styles.profileLogout}
                onClick={() => { void logout(); }}
              >
                <span>Выйти</span> <LogoutIcon />
              </button>
            </nav>

            <div className={styles.profileGrid}>
              <EmptyTile icon={<BagIcon />} title="Пока нет оформленных заказов" action="Перейти к покупкам" />
              <EmptyTile icon={<HangerIcon />} title="Пока нет купленных выкроек" action="Перейти к покупкам" />
              <EmptyTile icon={<GiftIcon />} title="Пока нет начисленных бонусов" action="Условия начисления" />
              <EmptyTile icon={<ChatIcon />} title="Пока нет оставленных отзывов" action="Приобрели выкройку? Оставьте свой отзыв" />
              <EmptyTile icon={<RulerIcon />} title="Пока нет мерок" action="Добавить мерку" />
            </div>
          </section>

          {settingsOpen && (
            <div
              className={styles.modalOverlay}
              role="dialog"
              aria-modal="true"
              aria-label="Настройки аккаунта"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setSettingsOpen(false);
              }}
            >
              <div className={styles.modal}>
                <button
                  type="button"
                  className={styles.modalClose}
                  aria-label="Закрыть"
                  onClick={() => setSettingsOpen(false)}
                >
                  <CloseIcon />
                </button>
                <form className={styles.modalForm} onSubmit={handleProfileSubmit}>
                  <label className={styles.modalField}>
                    <span className={styles.modalLabel}>Имя:</span>
                    <input
                      className={styles.modalInput}
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                      maxLength={100}
                    />
                  </label>
                  <label className={styles.modalField}>
                    <span className={styles.modalLabel}>Фамилия:</span>
                    <input
                      className={styles.modalInput}
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                      maxLength={100}
                    />
                  </label>
                  <label className={styles.modalField}>
                    <span className={styles.modalLabel}>E-Mail:</span>
                    <input
                      className={styles.modalInput}
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                      maxLength={255}
                    />
                  </label>
                  <label className={styles.modalField}>
                    <span className={styles.modalLabel}>Телефон:</span>
                    <input
                      className={styles.modalInput}
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      maxLength={30}
                    />
                  </label>

                  <button type="submit" className={styles.modalSave}>Сохранить</button>

                  <button type="button" className={styles.modalPassword}>
                    <LockIcon />
                    <span>Изменить пароль</span>
                  </button>
                </form>
              </div>
            </div>
          )}
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
                  : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
          )}

          {step === 'code' && codeContext && (
            <form className={styles.form} onSubmit={handleCodeSubmit} noValidate>
              <p className={styles.hint}>Введите код из письма, чтобы подтвердить email.</p>

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

type EmptyTileProps = {
  icon: ReactNode;
  title: string;
  action: string;
};

function EmptyTile({ icon, title, action }: EmptyTileProps) {
  return (
    <div className={styles.tile}>
      <div className={styles.tileIcon}>{icon}</div>
      <p className={styles.tileTitle}>{title}</p>
      <button type="button" className={styles.tileAction}>
        <span>{action}</span>
        <ChevronRightIcon />
      </button>
    </div>
  );
}

const ICON_SIZE = 22;

function CameraIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.9l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function LifebuoyIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M4.9 4.9 9.5 9.5M14.5 14.5l4.6 4.6M4.9 19.1l4.6-4.6M14.5 9.5l4.6-4.6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l1.7-5.1A8 8 0 1 1 8.1 19.3L3 21Z" />
      <path d="M9 10c.3 1 1 2 2 3s2 1.7 3 2l1.2-1.2a1 1 0 0 1 1-.2l2 .7a1 1 0 0 1 .7 1v1.7a1 1 0 0 1-1 1A9 9 0 0 1 8 9a1 1 0 0 1 1-1h1.7a1 1 0 0 1 1 .7l.7 2a1 1 0 0 1-.2 1L11 13" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 11 17-7-3 16-5-4-3 3v-4l8-7-10 6-4-3Z" />
    </svg>
  );
}

function VkIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h3c.5 3 1.8 5.5 3.5 6.5V8h3v4c1.3-.5 2.4-2 3-4h3c-.5 2.2-1.8 4.3-3.5 5.5 1.8 1 3.2 2.8 4 4.5h-3.3c-.7-1.5-2-2.8-3.2-3.2V18H9.5c-4-.5-6-5.3-6.5-10Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width={ICON_SIZE - 4} height={ICON_SIZE - 4} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6 18c1.2-2 3.4-3 6-3s4.8 1 6 3" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function HangerIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 10a2 2 0 1 1 2-2" />
      <path d="M12 10 3 17a1 1 0 0 0 .6 1.8h16.8A1 1 0 0 0 21 17l-9-7Z" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="9" width="16" height="4" rx="0.5" />
      <path d="M5 13v7h14v-7M12 9v11" />
      <path d="M12 9c-1.5-3-5-3-5-1s2 2 5 1Zm0 0c1.5-3 5-3 5-1s-2 2-5 1Z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16v10H8l-4 4V6Z" />
      <path d="M8 10h8M8 13h5" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="8" rx="1" />
      <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h12" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="1" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
