import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpenCheck,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import { initials } from '../utils/format.js';

const STUDENT_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quizzes', label: 'Quizzes', icon: BookOpenCheck },
  { to: '/history', label: 'History', icon: History },
  { to: '/contact', label: 'Contact us', icon: MessageSquare },
];

const TEACHER_NAV = [
  { to: '/teacher/quizzes', label: 'Quizzes', icon: ClipboardList },
  { to: '/teacher/subjects', label: 'Subjects & topics', icon: Layers },
  { to: '/teacher/questions', label: 'Question bank', icon: CircleHelp },
  { to: '/teacher/messages', label: 'Messages', icon: Mail, badge: true },
  { to: '/contact', label: 'Contact us', icon: MessageSquare },
];

/** Sidebar + top bar shared by every logged-in page. */
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isTeacher = user?.role === 'teacher';
  const nav = isTeacher ? TEACHER_NAV : STUDENT_NAV;

  // New message count for teacher's sidebar badge (refreshed on navigation)
  const newMessages = useFetch(
    () => (isTeacher ? api.get('/contact/messages/count') : Promise.resolve({ count: 0 })),
    [isTeacher, location.pathname]
  );

  useEffect(() => setOpen(false), [location.pathname]); // close the mobile menu after navigating

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="shell">
      <div className={`scrim ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><GraduationCap size={22} /></span>
          Smart Quiz
        </div>

        <nav className="nav">
          {nav.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              {label}
              {badge && newMessages.data?.count > 0 && (
                <span className="nav-count">{newMessages.data.count}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <span className="avatar">{initials(user.name)}</span>
            <div style={{ minWidth: 0 }}>
              <strong>{user.name}</strong>
              <span className="small muted">{isTeacher ? 'Teacher' : 'Student'}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}><LogOut size={16} /> Log out</button>
        </div>
      </aside>

      <main className="content">
        <div className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        </div>
        {/* key = path so each page fades in */}
        <div className="page" key={location.pathname}>{children || <Outlet />}</div>
      </main>
    </div>
  );
}
