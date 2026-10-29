import type { ReactNode } from "react";
import { useAuth } from "../lib/auth";
import { Spinner } from "./ui";
import { Navigate } from "react-router-dom";

export function Guard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
