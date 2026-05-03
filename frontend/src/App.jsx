import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import JobSeekerProfilePage from "./pages/profile/JobSeekerProfilePage";
import RecruiterProfilePage from "./pages/profile/RecruiterProfilePage";
import CompaniesListPage from "./pages/company/CompaniesListPage";
import CompanyFormPage from "./pages/company/CompanyFormPage";
import CompanyDetailPage from "./pages/company/CompanyDetailPage";
import JobSeekerDashboard from "./pages/dashboard/JobSeekerDashboard";
import RecruiterDashboard from "./pages/dashboard/RecruiterDashboard";
import MyApplicationsPage from "./pages/applications/MyApplicationsPage";
import RecruiterApplicationsPage from "./pages/applications/RecruiterApplicationsPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import PostJobPage from "./pages/jobs/PostJobPage";
import RecruiterJobsPage from "./pages/jobs/RecruiterJobsPage";
import CandidateSearchPage from "./pages/recruiter/CandidateSearchPage";
import CandidateProfilePage from "./pages/recruiter/CandidateProfilePage";
import JobAlertsPage from "./pages/alerts/JobAlertsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Redirect authenticated users away from public pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"}
        replace
      />
    );
  }
  return children;
};

// Add this component above App
const SmartHome = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"}
        replace
      />
    );
  }
  return <HomePage />;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<SmartHome />} />
      {/* ── Landing — redirect to dashboard if logged in ── */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <HomePage />
          </PublicRoute>
        }
      />

      {/* ── Auth pages ── */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* ── Semi-public — show navbar if logged in ── */}
      <Route
        path="/jobs"
        element={
          <AppLayout>
            <JobsPage />
          </AppLayout>
        }
      />
      <Route
        path="/jobs/:slug"
        element={
          <AppLayout>
            <JobDetailPage />
          </AppLayout>
        }
      />
      <Route
        path="/companies"
        element={
          <AppLayout>
            <CompaniesListPage />
          </AppLayout>
        }
      />
      <Route
        path="/companies/:id"
        element={
          <AppLayout>
            <CompanyDetailPage />
          </AppLayout>
        }
      />

      {/* ── Jobseeker ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <JobSeekerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <MyApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-jobs"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <SavedJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <JobSeekerProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <JobAlertsPage />
          </ProtectedRoute>
        }
      />

      {/* ── Shared ── */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={["jobseeker", "recruiter", "admin"]}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* ── Recruiter ── */}
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/new"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <PostJobPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <PostJobPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/applications"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/profile"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/companies"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CompaniesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/companies/new"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CompanyFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/companies/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CompanyFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/candidates"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CandidateSearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/candidates/:userId"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CandidateProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
