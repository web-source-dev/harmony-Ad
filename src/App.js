import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CssBaseline } from '@mui/material';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminOverview from './components/admin/Overview';
import AdminBlogs from './components/admin/Blogs';
import CreateBlog from './components/blog/CreateBlog';
import ManageBlog from './components/blog/ManageBlog';
import AdminDonations from './components/admin/Donations';
import AdminCustomers from './components/admin/Customers';
import Analytics from './components/admin/Analytics';
import VideoManagement from './components/admin/VideoManagement';

const App = () => {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/*"
            element={
              <AdminDashboard />
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="donations" element={<AdminDonations />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="social-media" element={<VideoManagement />} />
            <Route path="blog/create" element={<CreateBlog />} />
            <Route path="blog/edit/:id" element={<CreateBlog />} />
            <Route path="blog/manage" element={<ManageBlog />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;