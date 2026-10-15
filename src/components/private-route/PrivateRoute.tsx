import { getStorageItem } from "@/utils/safeStorage";
import { useGlobalStore } from "@/stores";
import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

export function PrivateRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const user = useGlobalStore((state) => state.user);

  if (!getStorageItem("token") || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
