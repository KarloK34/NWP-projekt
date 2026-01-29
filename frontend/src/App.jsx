import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Watchlist from './pages/Watchlist';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ToolsManagement from './pages/admin/ToolsManagement';
import ToolForm from './pages/admin/ToolForm';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import TagsManagement from './pages/admin/TagsManagement';
import ModelsManagement from './pages/admin/ModelsManagement';
import UsersManagement from './pages/admin/UsersManagement';
import ToolDetails from './pages/ToolDetails';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/watchlist"
                  element={
                    <ProtectedRoute>
                      <Watchlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="tools" element={<ToolsManagement />} />
                  <Route path="tools/new" element={<ToolForm />} />
                  <Route path="tools/:id/edit" element={<ToolForm />} />
                  <Route path="categories" element={<CategoriesManagement />} />
                  <Route path="tags" element={<TagsManagement />} />
                  <Route path="models" element={<ModelsManagement />} />
                  <Route path="users" element={<UsersManagement />} />
                </Route>
                <Route path="/tool/:id" element={<ToolDetails />} />
              </Routes>
            </Layout>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
