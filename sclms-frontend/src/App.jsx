import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

/* AUTH */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify2FA from "./pages/auth/Verify2FA";
import ChangePassword from "./pages/auth/ChangePassword";

/* USER LAYOUT + PAGES */
import UserLayout from "./layouts/UserLayout";
import UserDashboard from "./pages/dashboard/UserDashboard";
import Analytics from "./pages/dashboard/Analytics";
import Feedback from "./pages/dashboard/Feedback";
import Notifications from "./pages/dashboard/Notifications";
import ViewAllContracts from "./pages/contracts/ViewAllContracts";
import CreateContract from "./pages/contracts/CreateContract";
import ContractDetails from "./pages/contracts/ContractDetails";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/profile/Settings";

/* APPROVER */
import ApproverDashboard from "./pages/approver/ApproverDashboard";
import ApproverContracts from "./pages/approver/ApproverContracts";
import ApproverApprovals from "./pages/approver/ApproverApprovals";
import ApproveContract from "./pages/approver/ApproveContract";
import ApproverLayout from "./layouts/ApproverLayout";
import ApproverProfile from "./pages/approver/ApproverProfile";
import ApproverSettings from "./pages/approver/ApproverSettings";

/* ADMIN */
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Approvals from "./pages/admin/Approvals";
import UserManagement from "./pages/admin/UserManagement";
import UserProfile from "./pages/admin/UserProfile";
import AdminSettings from "./pages/admin/AdminSettings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* AUTH ROUTES - No protection needed */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-2fa" element={<Verify2FA />} />

          {/* USER ROUTES - Protected for authenticated users */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="contracts" element={<ViewAllContracts />} />
            <Route path="contracts/create" element={<CreateContract />} />
            <Route path="contracts/view/:id" element={<ContractDetails />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* CHANGE PASSWORD ROUTE - Protected */}
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />

          {/* APPROVER ROUTES - Protected for approvers only */}
          <Route path="/approver" element={
            <ProtectedRoute allowedRoles={["APPROVER"]}>
              <ApproverLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ApproverDashboard />} />
            <Route path="approvals" element={<ApproverApprovals />} />
            <Route path="contracts" element={<ApproverContracts />} />
            <Route path="contracts/approve/:id" element={<ApproveContract />} />
            <Route path="contracts/view/:id" element={<ApproveContract />} />
            <Route path="profile" element={<ApproverProfile />} />
            <Route path="settings" element={<ApproverSettings />} />
          </Route>

          {/* ADMIN ROUTES - Protected for admins only */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/:id" element={<UserProfile />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* CATCH ALL - Redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
