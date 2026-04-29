import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import StudentDashboard from './pages/student/Dashboard';
import Chatbot from './pages/student/Chatbot';
import Rooms from './pages/student/Rooms';
import Payment from './pages/student/Payment';
import Complaints from './pages/student/Complaints';
import RoommateMatching from './pages/student/RoommateMatching';
import Feedback from './pages/student/Feedback';
import AdminDashboard from './pages/admin/Dashboard';
import AdminComplaints from './pages/admin/Complaints';
import Allocation from './pages/admin/Allocation';
import AdminPayments from './pages/admin/Payments';
import AdminStaff from './pages/admin/Staff';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/chatbot" element={<Chatbot />} />
                <Route path="/student/rooms" element={<Rooms />} />
                <Route path="/student/payment" element={<Payment />} />
                <Route path="/student/complaints" element={<Complaints />} />
                <Route path="/student/roommates" element={<RoommateMatching />} />
                <Route path="/student/feedback" element={<Feedback />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/complaints" element={<AdminComplaints />} />
                <Route path="/admin/allocation" element={<Allocation />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/staff" element={<AdminStaff />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
};

export default App;
