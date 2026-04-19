import { useEffect, useRef, useState, type FormEvent } from 'react';
import Header from '../components/Header';
import { useAuth, emitAuthChanged } from '../hooks/useAuth';
import ProfileCabinetPage from './ProfileCabinetPage';
import ProfileMeasurementsPage from './ProfileMeasurementsPage';
import ProfileOrdersPage from './ProfileOrdersPage';
import ProfilePatternsPage from './ProfilePatternsPage';
import ProfileReviewsPage from './ProfileReviewsPage';
import {
  AuthError,
  login,
  register,
  resendCode,
  updateProfile,
  verifyEmail,
} from '../services/auth';
import styles from './AuthPage.module.css';
import {
  BagIcon,
  CameraIcon,
  ChatIcon,
  CloseIcon,
  CODE_LENGTH,
  GearIcon,
  HangerIcon,
  LifebuoyIcon,
  LockIcon,
  LogoutIcon,
  RESEND_COOLDOWN_MS,
  RulerIcon,
  TelegramIcon,
  UserIcon,
  VkIcon,
  WhatsAppIcon,
  formatDuration,
  type CodeContext,
  type Mode,
  type Step,
} from './authPageData';

type ProfileView = 'cabinet' | 'orders' | 'patterns' | 'reviews' | 'measurements';

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
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileInfo, setProfileInfo] = useState<string | null>(null);
  const [profileView, setProfileView] = useState<ProfileView>(() => getProfileView(window.location.pathname));

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email,
      phone: user.phoneNumber ?? '',
    });
  }, [user]);

  useEffect(() => {
    const handlePopState = () => {
      setProfileView(getProfileView(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    setProfileError(null);
    setProfileInfo(null);
    setSettingsOpen(true);
  };

  const navigateToProfileView = (nextView: ProfileView) => {
    const nextPath = getProfilePath(nextView);

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setSettingsOpen(false);
    setPhotoMenuOpen(false);
    setProfileView(nextView);
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setProfileError(null);
    setProfileInfo(null);

    const nextFirstName = normalizeProfileValue(profileForm.firstName);
    const nextLastName = normalizeProfileValue(profileForm.lastName);
    const nextPhoneNumber = normalizeProfileValue(profileForm.phone);
    const currentFirstName = normalizeProfileValue(user.firstName ?? '');
    const currentLastName = normalizeProfileValue(user.lastName ?? '');
    const currentPhoneNumber = normalizeProfileValue(user.phoneNumber ?? '');

    const isClearingProfileField =
      (currentFirstName && !nextFirstName)
      || (currentLastName && !nextLastName)
      || (currentPhoneNumber && !nextPhoneNumber);

    if (isClearingProfileField) {
      setProfileError('Очистка полей пока не поддерживается. Укажите новое значение для сохранения.');
      return;
    }

    const payload = {
      ...(nextFirstName && nextFirstName !== currentFirstName ? { firstName: nextFirstName } : {}),
      ...(nextLastName && nextLastName !== currentLastName ? { lastName: nextLastName } : {}),
      ...(nextPhoneNumber && nextPhoneNumber !== currentPhoneNumber ? { phoneNumber: nextPhoneNumber } : {}),
    };

    if (Object.keys(payload).length === 0) {
      setProfileInfo('Нет изменений для сохранения');
      return;
    }

    setProfileSubmitting(true);
    try {
      const updatedUser = await updateProfile(payload);
      setProfileForm({
        firstName: updatedUser.firstName ?? '',
        lastName: updatedUser.lastName ?? '',
        email: updatedUser.email,
        phone: updatedUser.phoneNumber ?? '',
      });
      setSettingsOpen(false);
      emitAuthChanged();
    } catch (err) {
      if (err instanceof AuthError) {
        setProfileError(err.message);
      } else {
        setProfileError('Не удалось сохранить данные');
      }
    } finally {
      setProfileSubmitting(false);
    }
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
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
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

  const updateProfileField =
    (field: 'firstName' | 'lastName' | 'phone') =>
      (value: string) => {
        setProfileError(null);
        setProfileInfo(null);
        setProfileForm((current) => ({ ...current, [field]: value }));
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
                <button
                  type="button"
                  className={`${styles.profileTab} ${profileView === 'cabinet' ? styles.profileTabActive : ''}`}
                  onClick={() => navigateToProfileView('cabinet')}
                >
                  <UserIcon /> <span>Кабинет</span>
                </button>
                <button
                  type="button"
                  className={`${styles.profileTab} ${profileView === 'orders' ? styles.profileTabActive : ''}`}
                  onClick={() => navigateToProfileView('orders')}
                >
                  <BagIcon /> <span>Заказы</span>
                </button>
                <button
                  type="button"
                  className={`${styles.profileTab} ${profileView === 'patterns' ? styles.profileTabActive : ''}`}
                  onClick={() => navigateToProfileView('patterns')}
                >
                  <HangerIcon /> <span>Выкройки</span>
                </button>
                <button
                  type="button"
                  className={`${styles.profileTab} ${profileView === 'reviews' ? styles.profileTabActive : ''}`}
                  onClick={() => navigateToProfileView('reviews')}
                >
                  <ChatIcon /> <span>Отзывы</span>
                </button>
                <button
                  type="button"
                  className={`${styles.profileTab} ${profileView === 'measurements' ? styles.profileTabActive : ''}`}
                  onClick={() => navigateToProfileView('measurements')}
                >
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

            {profileView === 'orders' ? (
              <ProfileOrdersPage />
            ) : profileView === 'patterns' ? (
              <ProfilePatternsPage />
            ) : profileView === 'reviews' ? (
              <ProfileReviewsPage />
            ) : profileView === 'measurements' ? (
              <ProfileMeasurementsPage />
            ) : (
              <ProfileCabinetPage />
            )}
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
                      onChange={(e) => updateProfileField('firstName')(e.target.value)}
                      maxLength={100}
                    />
                  </label>
                  <label className={styles.modalField}>
                    <span className={styles.modalLabel}>Фамилия:</span>
                    <input
                      className={styles.modalInput}
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => updateProfileField('lastName')(e.target.value)}
                      maxLength={100}
                    />
                  </label>
                  <label className={styles.modalField}>
                    <span className={styles.modalLabel}>E-Mail:</span>
                    <input
                      className={styles.modalInput}
                      type="email"
                      value={profileForm.email}
                      readOnly
                      maxLength={255}
                    />
                  </label>
                  <label className={styles.modalField}>
                    <span className={styles.modalLabel}>Телефон:</span>
                    <input
                      className={styles.modalInput}
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => updateProfileField('phone')(e.target.value)}
                      maxLength={32}
                    />
                  </label>

                  {profileInfo && <p className={styles.info_}>{profileInfo}</p>}
                  {profileError && <p className={styles.error}>{profileError}</p>}

                  <button type="submit" className={styles.modalSave} disabled={profileSubmitting}>
                    {profileSubmitting ? 'Сохранение...' : 'Сохранить'}
                  </button>

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
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
                  required
                  minLength={CODE_LENGTH}
                  maxLength={CODE_LENGTH}
                  pattern={`\\d{${CODE_LENGTH}}`}
                />
                {fieldErrors.code && <span className={styles.fieldError}>{fieldErrors.code}</span>}
              </label>

              {expiresLeft > 0 && (
                <p className={styles.meta}>Код действителен ещё {formatDuration(expiresLeft)}</p>
              )}

              {info && <p className={styles.info_}>{info}</p>}
              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.submit} disabled={submitting || code.length !== CODE_LENGTH}>
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

function normalizeProfileValue(value: string): string | undefined {
  const normalized = value.trim();
  return normalized === '' ? undefined : normalized;
}

function getProfileView(pathname: string): ProfileView {
  if (pathname.startsWith('/profile/orders')) return 'orders';
  if (pathname.startsWith('/profile/patterns')) return 'patterns';
  if (pathname.startsWith('/profile/reviews')) return 'reviews';
  if (pathname.startsWith('/profile/measurements')) return 'measurements';
  return 'cabinet';
}

function getProfilePath(view: ProfileView): string {
  switch (view) {
    case 'orders':
      return '/profile/orders';
    case 'patterns':
      return '/profile/patterns';
    case 'reviews':
      return '/profile/reviews';
    case 'measurements':
      return '/profile/measurements';
    default:
      return '/profile';
  }
}
