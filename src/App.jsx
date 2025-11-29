import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import SignIn from './pages/SignIn';
import AcceptInvitation from './pages/AcceptInvitation';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Content from './pages/Content';
import Surveys from './pages/Surveys';
import SurveyDetail from './pages/SurveyDetail';
import Classes from './pages/Classes';
import ResetPassword from './pages/ResetPassword';
import { loadTheme } from './lib/theme';
import './App.css';

function App() {
  useEffect(() => {
    const schoolId = localStorage.getItem('schoolId') || 'default';
    loadTheme(schoolId);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/teacher/accept-invitation" element={<AcceptInvitation />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:studentId" element={<StudentDetail />} />
        <Route path="/content" element={<Content />} />
        <Route path="/surveys" element={<Surveys />} />
        <Route path="/surveys/:questionId" element={<SurveyDetail />} />
        <Route path="/" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
