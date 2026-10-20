import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react'; // This is a package basically i wanted to add the password hide and show option i-e eye toggle
import { useAuth } from '../../context/AuthContext.jsx';
import { homeFor } from '../../components/RouteGuards.jsx';

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
      <section className="auth-hero">
        <div className="brand">
          <span className="brand-mark"><GraduationCap size={22} /></span>
          Smart Quiz
        </div>

        <div>
          <h1>Know exactly what to study next.</h1>
          <p>Take timed quizzes, see which topics are holding you back, and get practice built around your own mistakes.</p>
        </div>

        <div className="hero-cards" aria-hidden="true">
          <div className="hero-card" style={{ left: 0, top: 10, '--tilt': '-3deg' }}>
            <small>Trees</small>
            Needs work · 38%
            <div className="meter"><i style={{ width: '38%' }} /></div>
          </div>
          <div className="hero-card" style={{ left: '34%', top: 70, animationDelay: '-2s', '--tilt': '2deg' }}>
            <small>Quiz score</small>
            86% · Passed
          </div>
          <div className="hero-card" style={{ left: '8%', top: 150, animationDelay: '-4s', '--tilt': '1deg' }}>
            <small>Streak</small>
            4 days in a row
          </div>
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
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>
            
              
      
