import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { homeFor } from '../../components/RouteGuards.jsx';
import booksImage from '../../assets/books.jpg';

const DEMOS = [
  { label: 'Try as student', email: 'student@quiz.com', password: 'student123' },
  { label: 'Try as teacher', email: 'teacher@quiz.com', password: 'teacher123' },
];

const HAS_NUMBERS = /[0-9]/;
const HAS_SPECIAL_CHARS = /[^A-Za-z\s]/;
const PWD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

function checkNameChars(value, label) {
  if (!value) return '';
  const hasNum = HAS_NUMBERS.test(value);
  const hasSpec = HAS_SPECIAL_CHARS.test(value);
  if (hasNum && hasSpec) {
    return `${label} must contain only letters (no numbers or special characters allowed).`;
  }
  if (hasNum) {
    return `${label} cannot contain numbers. Only letters are allowed.`;
  }
  if (hasSpec) {
    return `${label} cannot contain special characters. Only letters are allowed.`;
  }
  return '';
}

/** One page for both Login and Register (the `mode` prop decides). */
export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // Real-time validations for First and Last Name
  const firstNameError = checkNameChars(form.firstName, 'First name');
  const lastNameError = checkNameChars(form.lastName, 'Last name');

  // Real-time validations for Password (registration mode)
  const pwdLengthOk = form.password.length >= 12;
  const pwdUpperOk = /[A-Z]/.test(form.password);
  const pwdLowerOk = /[a-z]/.test(form.password);
  const pwdSpecialOk = PWD_SPECIAL_REGEX.test(form.password);
  const pwdAllLower = form.password.length > 0 && !pwdUpperOk;

  // Confirm password matching
  const passwordsMatch = !isLogin && form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch = !isLogin && form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (isLogin) {
      setBusy(true);
      try {
        const user = await login(form.email, form.password);
        navigate(homeFor(user));
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
      return;
    }

    // Registration validations:
    if (!form.firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (firstNameError) {
      setError(firstNameError);
      return;
    }

    if (!form.lastName.trim()) {
      setError('Please enter your last name.');
      return;
    }
    if (lastNameError) {
      setError(lastNameError);
      return;
    }

    if (!form.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!form.password) {
      setError('Please enter a password.');
      return;
    }

    if (!pwdLengthOk) {
      setError('Password must be at least 12 characters long.');
      return;
    }

    if (!pwdUpperOk) {
      setError('Password cannot be only lowercase. It must include at least one uppercase letter (A-Z).');
      return;
    }

    if (!pwdLowerOk) {
      setError('Password must contain at least one lowercase letter (a-z).');
      return;
    }

    if (!pwdSpecialOk) {
      setError('Password must contain at least one special character (e.g. !@#$%^&*).');
      return;
    }

    if (!form.confirmPassword) {
      setError('Please confirm your password.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
      };
      const user = await register(payload);
      navigate(homeFor(user));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDemoLogin(credentials) {
    setBusy(true);
    setError('');
    try {
      const user = await login(credentials.email, credentials.password);
      navigate(homeFor(user));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <section
        className="auth-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(35, 22, 14, 0.75) 0%, rgba(35, 22, 14, 0.45) 50%, rgba(35, 22, 14, 0.2) 100%), url(${booksImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#3e271a',
        }}
      >
        <div className="brand">
          <span className="brand-mark"><GraduationCap size={22} /></span>
          Smart Quiz
        </div>

        <div>
          <h1>Know exactly what to study next.</h1>
          <p>Take quizzes, test your knowledge across topics, and track your performance.</p>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div>
            <h2>{isLogin ? 'Welcome back' : 'Sign Up'}</h2>
            <p className="muted" style={{ marginTop: 6 }}>{isLogin ? 'Log in to continue.' : 'It takes less than a minute.'}</p>
          </div>

          {!isLogin && (
            <div className="role-switch" role="radiogroup" aria-label="Account type">
              {['student', 'teacher'].map((role) => (
                <button type="button" key={role} className={form.role === role ? 'active' : ''} onClick={() => setForm({ ...form, role })}>
                  {role === 'student' ? 'I am a student' : 'I am a teacher'}
                </button>
              ))}
            </div>
          )}

          {!isLogin && (
            <div className="form-grid">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  className={`input ${firstNameError ? 'is-error' : ''}`}
                  value={form.firstName}
                  onChange={set('firstName')}
                  required
                  placeholder="e.g. John"
                  autoComplete="given-name"
                />
                {firstNameError && (
                  <span className="field-msg error">{firstNameError}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  className={`input ${lastNameError ? 'is-error' : ''}`}
                  value={form.lastName}
                  onChange={set('lastName')}
                  required
                  placeholder="e.g. Doe"
                  autoComplete="family-name"
                />
                {lastNameError && (
                  <span className="field-msg error">{lastNameError}</span>
                )}
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={form.email}
              onChange={set('email')}
              required
              autoComplete="email"
              placeholder="name@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">{isLogin ? 'Password' : 'New password'}</label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`input ${!isLogin && (pwdAllLower || (form.password && !pwdLengthOk)) ? 'is-error' : ''}`}
                value={form.password}
                onChange={set('password')}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder={isLogin ? '••••••••' : 'At least 12 characters'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {!isLogin && (
              <>
                <div className="pwd-rules" aria-live="polite">
                  <div className={`pwd-rule ${pwdLengthOk ? 'valid' : 'invalid'}`}>
                    <Check size={14} style={{ opacity: pwdLengthOk ? 1 : 0.4 }} />
                    <span>At least 12 characters ({form.password.length}/12)</span>
                  </div>
                  <div className={`pwd-rule ${pwdUpperOk ? 'valid' : 'invalid'}`}>
                    <Check size={14} style={{ opacity: pwdUpperOk ? 1 : 0.4 }} />
                    <span>At least one uppercase letter (A-Z)</span>
                  </div>
                  <div className={`pwd-rule ${pwdLowerOk ? 'valid' : 'invalid'}`}>
                    <Check size={14} style={{ opacity: pwdLowerOk ? 1 : 0.4 }} />
                    <span>At least one lowercase letter (a-z)</span>
                  </div>
                  <div className={`pwd-rule ${pwdSpecialOk ? 'valid' : 'invalid'}`}>
                    <Check size={14} style={{ opacity: pwdSpecialOk ? 1 : 0.4 }} />
                    <span>At least one special character (!@#$%^&* etc.)</span>
                  </div>
                </div>

                {pwdAllLower && (
                  <span className="field-msg error">
                    Password cannot be only lowercase. You must include at least one uppercase letter (A-Z).
                  </span>
                )}
              </>
            )}
          </div>

          {!isLogin && (
            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="password-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input ${passwordsMismatch ? 'is-error' : ''}`}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {passwordsMismatch && (
                <span className="field-msg error">Passwords do not match.</span>
              )}
              {passwordsMatch && (
                <span className="field-msg success">Passwords match ✓</span>
              )}
            </div>
          )}

          {error && <div className="notice notice-bad" role="alert">{error}</div>}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Sign Up'}
          </button>

          {isLogin && (
            <div className="demo-box">
              <span className="small muted">Demo accounts are ready to use:</span>
              <div className="row-wrap">
                {DEMOS.map((d) => (
                  <button type="button" key={d.email} className="btn btn-soft btn-sm" disabled={busy} onClick={() => handleDemoLogin(d)}>{d.label}</button>
                ))}
              </div>
            </div>
          )}

          <p className="muted small center">
            {isLogin ? 'New here? ' : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Sign Up' : 'Log in'}</Link>
          </p>

          <p className="muted small center" style={{ marginTop: -8 }}>
            Have a question or feedback? <Link to="/contact">Contact us</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
