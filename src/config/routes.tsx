import { DocumentsPage, LoginPage, MarketsPage, NewRepPage, NotFoundPage, PermissionsPage, RepPage, RepsPage, UsersPage } from "@/pages";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export type AppRoute = {
  path: string;
  type: "public" | "private";
  element: ReactNode;
};

export const routes: AppRoute[] = [
  { path: "/login", type: "public", element: <LoginPage /> },
  { path: "/", type: "private", element: <Navigate to="/reps" replace /> },
  { path: "/reps", type: "private", element: <RepsPage /> },
  { path: "/reps/new", type: "private", element: <NewRepPage /> },
  { path: "/reps/:repId", type: "private", element: <RepPage /> },
  { path: "/documents", type: "private", element: <DocumentsPage /> },
  { path: "/markets", type: "private", element: <MarketsPage /> },
  { path: "/users", type: "private", element: <UsersPage /> },
  { path: "/permissions", type: "private", element: <PermissionsPage /> },
  { path: "*", type: "public", element: <NotFoundPage /> },
];
