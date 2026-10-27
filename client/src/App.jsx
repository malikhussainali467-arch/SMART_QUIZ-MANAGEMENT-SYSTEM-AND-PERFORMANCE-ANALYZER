import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { GuestOnly, RequireAuth } from './components/RouteGuards.jsx';
import AuthPage from './pages/auth/AuthPage.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import QuizListPage from './pages/student/QuizListPage.jsx';
import TakeQuizPage from './pages/student/TakeQuizPage.jsx';
import HistoryPage from './pages/student/HistoryPage.jsx';
import ResultPage from './pages/shared/ResultPage.jsx';
import SubjectsPage from './pages/teacher/SubjectsPage.jsx';
import QuestionsPage from './pages/teacher/QuestionsPage.jsx';
import QuizzesPage from './pages/teacher/QuizzesPage.jsx';
import QuizAnalyticsPage from './pages/teacher/QuizAnalyticsPage.jsx';

/** All page URLs of the app. Role rules live in RequireAuth. */
export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
      </Route>

      {/* The quiz player is full screen: it has no sidebar */}
      <Route element={<RequireAuth role="student" />}>
        <Route path="/attempt/:id" element={<TakeQuizPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/results/:id" element={<ResultPage />} />

          <Route element={<RequireAuth role="student" />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/quizzes" element={<QuizListPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>

          <Route element={<RequireAuth role="teacher" />}>
            <Route path="/teacher" element={<Navigate to="/teacher/quizzes" replace />} />
            <Route path="/teacher/quizzes" element={<QuizzesPage />} />
            <Route path="/teacher/quizzes/:id" element={<QuizAnalyticsPage />} />
            <Route path="/teacher/subjects" element={<SubjectsPage />} />
            <Route path="/teacher/questions" element={<QuestionsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
