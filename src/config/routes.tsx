import { DocumentsPage, LoginPage, MarketsPage, NewRepPage, NotFoundPage, PermissionsPage, ProjectionsPage, RecruitingGoalsPage, RepPage, RepsPage, RolesPage, UsersPage } from "@/pages";
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
  { path: "/roles", type: "private", element: <RolesPage /> },
  { path: "/permissions", type: "private", element: <PermissionsPage /> },
  { path: "/projections", type: "private", element: <ProjectionsPage /> },
  { path: "/recruiting-goals", type: "private", element: <RecruitingGoalsPage /> },
  { path: "*", type: "public", element: <NotFoundPage /> },
];
