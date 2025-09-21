import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { CssBaseline } from '@mui/material';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminOverview from './components/admin/Overview';
import AdminBlogs from './components/admin/Blogs';
import CreateBlog from './components/blog/CreateBlog';
import ManageBlog from './components/blog/ManageBlog';
import AdminDonations from './components/admin/Donations';
import AdminContacts from './components/admin/Customers';
import CreateContact from './components/admin/CreateCustomer';
import Analytics from './components/admin/Analytics';
import VideoManagement from './components/admin/VideoManagement';
import Login from './components/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NetworkProvider>
          <CssBaseline />
          <Router>
            <Routes>
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="donations" element={<AdminDonations />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="contacts/create" element={<CreateContact />} />
              <Route path="social-media" element={<VideoManagement />} />
              <Route path="blog/create" element={<CreateBlog />} />
              <Route path="blog/edit/:id" element={<CreateBlog />} />
              <Route path="blog/manage" element={<ManageBlog />} />
            </Route>
            </Routes>
          </Router>
        </NetworkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;