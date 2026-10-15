import { getStorageItem } from "@/utils/safeStorage";
import { useGlobalStore } from "@/stores";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const user = useGlobalStore((state) => state.user);
  if (getStorageItem("token") && user) return <Navigate to="/reps" replace />;
  return children;
}
