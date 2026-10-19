import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpenCheck, ClipboardList, GraduationCap, History, Layers, LayoutDashboard, LogOut,
  Menu, Moon, PenLine, CircleHelp, Sun, TrendingUp, Trophy, Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import { initials } from '../utils/format.js';

const STUDENT_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quizzes', label: 'Quizzes', icon: BookOpenCheck },
  { to: '/progress', label: 'My progress', icon: TrendingUp },
  { to: '/history', label: 'History', icon: History },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const TEACHER_NAV = [
  { to: '/teacher', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/teacher/subjects', label: 'Subjects & topics', icon: Layers },
  { to: '/teacher/questions', label: 'Question bank', icon: CircleHelp },
  { to: '/teacher/quizzes', label: 'Quizzes', icon: ClipboardList },
  { to: '/teacher/students', label: 'Students', icon: Users },
  { to: '/teacher/reviews', label: 'Reviews', icon: PenLine, badge: true },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

/** Sidebar + top bar shared by every logged-in page. */
export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isTeacher = user.role === 'teacher';
  const nav = isTeacher ? TEACHER_NAV : STUDENT_NAV;

  // Pending-review count for the teacher's sidebar badge (refreshed on every page change).
  const pending = useFetch(() => (isTeacher ? api.get('/attempts/reviews/pending') : Promise.resolve([])), [isTeacher, location.pathname]);

  useEffect(() => setOpen(false), [location.pathname]); // close the mobile menu after navigating

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
              {badge && pending.data?.length > 0 && <span className="nav-count">{pending.data.length}</span>}
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
          <button className="icon-btn right" onClick={toggle} aria-label="Toggle dark mode">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
        {/* key = path so each page fades in */}
        <div className="page" key={location.pathname}><Outlet /></div>
      </main>
    </div>
  );
}
