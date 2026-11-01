import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, GraduationCap, Mail, MessageSquare, Send } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export const SUBJECT_OPTIONS = [
  'Question about a quiz',
  'Report a problem',
  'Suggestion',
  'Other',
];

export default function ContactPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: SUBJECT_OPTIONS[0],
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Update prefilled name and email when user loads or changes
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }
    if (trimmedMessage.length < 10) {
      setError('Message must be at least 10 characters long');
      return;
    }
    if (trimmedMessage.length > 1000) {
      setError('Message must not exceed 1000 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/contact', {
        name: trimmedName,
        email: trimmedEmail,
        subject: form.subject,
        message: trimmedMessage,
      });

      setSubmitted(true);
      toast.success(res.message || 'Thanks, we received your message.');
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
      toast.error(err.message || 'Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      subject: SUBJECT_OPTIONS[0],
      message: '',
    });
    setError('');
  }

  const charCount = form.message.trim().length;

  return (
    <div className="stack" style={{ maxWidth: 760, margin: '0 auto' }}>
      <PageHeader
        title="Contact Us"
        subtitle="Have a question about a quiz, need help, or want to share feedback? We'd love to hear from you."
      />

      {submitted ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 16 }}>
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--good-bg)',
                color: 'var(--good)',
              }}
            >
              <CheckCircle2 size={36} />
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Thanks, we received your message.</h2>
          <p className="muted" style={{ maxWidth: 440, margin: '0 auto 24px' }}>
            Our team will review your message. If a reply is needed, we will reach out to you at{' '}
            <strong>{form.email}</strong>.
          </p>

          <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
            <button type="button" className="btn btn-primary" onClick={handleReset}>
              <MessageSquare size={16} /> Send another message
            </button>
            {user ? (
              <Link to={user.role === 'teacher' ? '/teacher/quizzes' : '/dashboard'} className="btn btn-ghost">
                Back to dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-ghost">
                Back to login
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <form className="stack" onSubmit={handleSubmit} style={{ gap: 20 }}>
            {error && (
              <div className="notice notice-bad" role="alert">
                {error}
              </div>
            )}

            <div className="form-grid">
              <div className="field">
                <label htmlFor="contact-name">
                  Your name <span className="muted">*</span>
                </label>
                <input
                  id="contact-name"
                  className="input"
                  placeholder="e.g. Alex Johnson"
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                  maxLength={100}
                />
              </div>

              <div className="field">
                <label htmlFor="contact-email">
                  Email address <span className="muted">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="input"
                  placeholder="e.g. alex@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  required
                />
              </div>

              <div className="field full">
                <label htmlFor="contact-subject">
                  Subject <span className="muted">*</span>
                </label>
                <select
                  id="contact-subject"
                  className="select"
                  value={form.subject}
                  onChange={handleChange('subject')}
                  required
                >
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field full">
                <div className="row spread">
                  <label htmlFor="contact-message">
                    Message <span className="muted">*</span>
                  </label>
                  <span
                    className={`small ${charCount > 1000 ? 'badge-bad' : 'muted'}`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {charCount}/1000 (min 10)
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  className="textarea"
                  style={{ minHeight: 140 }}
                  placeholder="Describe your question, problem or suggestion in detail..."
                  value={form.message}
                  onChange={handleChange('message')}
                  required
                  minLength={10}
                  maxLength={1000}
                />
              </div>
            </div>

            <div className="row spread" style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
              <span className="small muted">
                {user ? (
                  <>
                    Logged in as <strong>{user.name}</strong> ({user.role})
                  </>
                ) : (
                  <>
                    Submitting as visitor. Have an account? <Link to="/login">Log in</Link>
                  </>
                )}
              </span>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || charCount < 10 || charCount > 1000}
              >
                <Send size={16} /> {submitting ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
