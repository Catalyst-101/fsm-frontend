import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import CreateUserPage from './pages/CreateUserPage';
import UserDetailPage from './pages/UserDetailPage';

// Parent pages
import ParentsPage from './pages/parents/ParentsPage';
import CreateEditParentPage from './pages/parents/CreateEditParentPage';
import ParentDetailPage from './pages/parents/ParentDetailPage';

// Student pages
import StudentsPage from './pages/students/StudentsPage';
import CreateEditStudentPage from './pages/students/CreateEditStudentPage';
import StudentDetailPage from './pages/students/StudentDetailPage';
import StudentPromotionPage from './pages/students/StudentPromotionPage';

// Academic Year & Fee Structure pages
import AcademicYearsPage from './pages/academicYears/AcademicYearsPage';
import FeeStructuresPage from './pages/feeStructures/FeeStructuresPage';

// Fee Payment pages
import FeePaymentPage from './pages/feePayments/FeePaymentPage';
import StudentFeeDetailsPage from './pages/feePayments/StudentFeeDetailsPage';
import FeeLedgerPage from './pages/feePayments/FeeLedgerPage';
import ParentFeeBillPage from './pages/feePayments/ParentFeeBillPage';
import ReceiptViewPage from './pages/feePayments/ReceiptViewPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Parent Management Routes */}
          <Route path="/parents" element={<ParentsPage />} />
          <Route path="/parents/create" element={<CreateEditParentPage />} />
          <Route path="/parents/edit/:id" element={<CreateEditParentPage />} />
          <Route path="/parents/:id" element={<ParentDetailPage />} />

          {/* Student Management Routes */}
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/create" element={<CreateEditStudentPage />} />
          <Route path="/students/edit/:id" element={<CreateEditStudentPage />} />
          <Route path="/students/promotion" element={<StudentPromotionPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />

          {/* Academic Year & Fee Structure Routes */}
          <Route path="/academic-years" element={<AcademicYearsPage />} />
          <Route path="/fee-structures" element={<FeeStructuresPage />} />
          {/* Fee Payments Module */}
          <Route path="/fee-payment" element={<FeePaymentPage />} />
          <Route path="/student-fee-details" element={<StudentFeeDetailsPage />} />
          <Route path="/fee-ledger" element={<FeeLedgerPage />} />
          <Route path="/parent-fee-bill" element={<ParentFeeBillPage />} />
          <Route path="/receipt/:id" element={<ReceiptViewPage />} />

          {/* SUPER_ADMIN and ADMIN Routes */}
          <Route element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/create" element={<CreateUserPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
          </Route>
        </Route>
      </Route>

      {/* Default Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
