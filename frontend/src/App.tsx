import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';

// Pages will be implemented next
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import UserDashboard from './pages/user/Dashboard';
import StoreOwnerDashboard from './pages/store/Dashboard';
import StoreList from './pages/stores/StoreList';
import UserList from './pages/admin/UserList';
import ChangePassword from './pages/auth/ChangePassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            Public Routes
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            Protected Routes - Admin
            <Route
              path="/admin/dashboard"
              element={
                // <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                // </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserList />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Normal User */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stores"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <StoreList />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Store Owner */}
            <Route
              path="/store/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                  <StoreOwnerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Common Protected Routes */}
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    // </AuthProvider>
  );
}

export default App
