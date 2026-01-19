import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from './store';
import Login from './pages/Login';
import Scanner from './pages/Scanner';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check if user is admin (only otf user is admin based on seeded data)
  if (user?.username === 'otf' || user?.role === 'admin') {
    return children;
  }
  
  // Non-admin users are redirected to scanner
  return <Navigate to="/scanner" />;
};

const ScannerRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const currentUser = useAuthStore((state) => state.user);

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      useAuthStore.setState({
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
      });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/scanner"
          element={
            <ScannerRoute>
              <>
                <Header />
                <Scanner />
              </>
            </ScannerRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <>
                <Header />
                <AdminDashboard />
              </>
            </AdminRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      <ToastContainer position="bottom-right" />
    </Router>
  );
}

export default App;
