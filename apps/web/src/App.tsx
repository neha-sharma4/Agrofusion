import type { ReactNode } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { Spinner } from "./components/ui";
import { Shell } from "./components/Shell";
import { ForgotPage, LandingPage, LoginPage, ResetPage, SignupPage, VerifyPage } from "./pages/auth/AuthPages";
import { FieldsPage } from "./pages/fields/FieldsPage";
import { NewCyclePage, NewFieldPage } from "./pages/fields/AddFieldPage";
import { FieldHomePage } from "./pages/fields/FieldHomePage";
import { IrrigationPage } from "./pages/fields/IrrigationPage";
import { GlobalScanPage, ScanPage } from "./pages/fields/ScanPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AdminAnalytics, AdminKnowledge, AdminLayout, AdminLogs, AdminMaster, AdminUsers } from "./pages/admin/AdminPages";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/fields" replace />;
  return <>{children}</>;
}

function ScanWithField() {
  const { id } = useParams();
  return <ScanPage fieldIdFromRoute={id} />;
}

function NewCycleRoute() {
  const { id } = useParams();
  return <NewCyclePage fieldId={id!} />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/forgot" element={<ForgotPage />} />
      <Route path="/reset-password" element={<ResetPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminAnalytics />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="master" element={<AdminMaster />} />
        <Route path="knowledge" element={<AdminKnowledge />} />
      </Route>
      <Route
        path="*"
        element={
          <RequireAuth>
            <Shell>
              <Routes>
                <Route path="/fields" element={<FieldsPage />} />
                <Route path="/fields/new" element={<NewFieldPage />} />
                <Route path="/fields/:id" element={<FieldHomePage />} />
                <Route path="/fields/:id/new-cycle" element={<NewCycleRoute />} />
                <Route path="/fields/:id/irrigation" element={<IrrigationPage />} />
                <Route path="/fields/:id/scan" element={<ScanWithField />} />
                <Route path="/scan" element={<GlobalScanPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="*" element={<Navigate to="/fields" replace />} />
              </Routes>
            </Shell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
