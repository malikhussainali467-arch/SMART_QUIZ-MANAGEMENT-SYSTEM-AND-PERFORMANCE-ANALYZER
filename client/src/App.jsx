import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { GuestOnly, RequireAuth } from './components/RouteGuards.jsx';
import AuthPage from './pages/auth/AuthPage.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import QuizListPage from './pages/student/QuizListPage.jsx';
import TakeQuizPage from './pages/student/TakeQuizPage.jsx';
import ProgressPage from './pages/student/ProgressPage.jsx';
import HistoryPage from './pages/student/HistoryPage.jsx';
import ResultPage from './pages/shared/ResultPage.jsx';
import LeaderboardPage from './pages/shared/LeaderboardPage.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import SubjectsPage from './pages/teacher/SubjectsPage.jsx';
import QuestionsPage from './pages/teacher/QuestionsPage.jsx';
import QuizzesPage from './pages/teacher/QuizzesPage.jsx';
import QuizAnalyticsPage from './pages/teacher/QuizAnalyticsPage.jsx';
import StudentsPage from './pages/teacher/StudentsPage.jsx';
import StudentDetailPage from './pages/teacher/StudentDetailPage.jsx';
import ReviewsPage from './pages/teacher/ReviewsPage.jsx';

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
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          <Route element={<RequireAuth role="student" />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/quizzes" element={<QuizListPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>

          <Route element={<RequireAuth role="teacher" />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/subjects" element={<SubjectsPage />} />
            <Route path="/teacher/questions" element={<QuestionsPage />} />
            <Route path="/teacher/quizzes" element={<QuizzesPage />} />
            <Route path="/teacher/quizzes/:id" element={<QuizAnalyticsPage />} />
            <Route path="/teacher/students" element={<StudentsPage />} />
            <Route path="/teacher/students/:id" element={<StudentDetailPage />} />
            <Route path="/teacher/reviews" element={<ReviewsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
