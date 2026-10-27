import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { homeFor } from '../../components/RouteGuards.jsx';
import booksImage from '../../assets/books.jpg';

const DEMOS = [
  { label: 'Try as student', email: 'student@quiz.com', password: 'student123' },
  { label: 'Try as teacher', email: 'teacher@quiz.com', password: 'teacher123' },
];

/** One page for both Login and Register (the `mode` prop decides). */
export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', teacherCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function authenticate(credentials) {
    setBusy(true);
    setError('');
    try {
      const user = isLogin ? await login(credentials.email, credentials.password) : await register(credentials);
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
        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); authenticate(form); }}>
          <div>
            <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
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
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" className="input" value={form.name} onChange={set('name')} required />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={form.email} onChange={set('email')} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
               np {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
          

          {error && <div className="notice notice-bad" role="alert">{error}</div>}

          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>

          {isLogin && (
            <div className="demo-box">
              <span className="small muted">Demo accounts are ready to use:</span>
              <div className="row-wrap">
                {DEMOS.map((d) => (
                  <button type="button" key={d.email} className="btn btn-soft btn-sm" disabled={busy} onClick={() => authenticate(d)}>{d.label}</button>
                ))}
              </div>
            </div>
          )}

          <p className="muted small center">
            {isLogin ? 'New here? ' : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
