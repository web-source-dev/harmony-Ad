import React, { useEffect } from 'react';
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
import PartnershipAgreements from './components/admin/PartnershipAgreements';
import RsvpEvents from './components/admin/RsvpEvents';
import RsvpEventDetail from './components/admin/RsvpEventDetail';
import AdminContacts from './components/admin/Customers';
import CreateContact from './components/admin/CreateCustomer';
import Analytics from './components/admin/Analytics';
import VideoManagementTabs from './components/admin/VideoManagementTabs';
import CustomEmail from './components/admin/CustomEmail';
import Login from './components/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';
import PublicCreateContact from './components/public/PublicCreateContact';
import VolunteerCheckIn from './components/public/checkin/VolunteerCheckIn';

const App = () => {
  useEffect(() => {
    // Register service worker for public contact page
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <ThemeProvider>
      <NetworkProvider>
        <AuthProvider>
          <CssBaseline />
          <Router>
            <Routes>
            {/* Public Routes */}
            <Route path="/contact-intake" element={<PublicCreateContact />} />
            {/* Door check-in: needs the admin login (guests opening their own QR see their pass). The old admin path is kept
                because QR codes in emails already sent point to it. */}
            <Route path="/check-in" element={<VolunteerCheckIn />} />
            <Route path="/check-in/:code" element={<VolunteerCheckIn />} />
            <Route path="/event-rsvps/check-in" element={<VolunteerCheckIn />} />
            <Route path="/event-rsvps/check-in/:code" element={<VolunteerCheckIn />} />
            
            {/* Admin Routes */}
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
              <Route path="partnership-agreements" element={<PartnershipAgreements />} />
              <Route path="event-rsvps" element={<RsvpEvents />} />
              <Route path="event-rsvps/:id" element={<RsvpEventDetail />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="contacts/create" element={<CreateContact />} />
              <Route path="social-media" element={<VideoManagementTabs />} />
              <Route path="custom-email" element={<CustomEmail />} />
              <Route path="blog/create" element={<CreateBlog />} />
              <Route path="blog/edit/:id" element={<CreateBlog />} />
              <Route path="blog/manage" element={<ManageBlog />} />
            </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
};

export default App;