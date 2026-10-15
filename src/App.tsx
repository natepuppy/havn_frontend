import { AppLayout, PrivateRoute, PublicOnlyRoute } from "@/components";
import { routes } from "@/config/routes";
import { useGlobalStore } from "@/stores";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme as antdTheme } from "antd";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <Routes>
        {routes
          .filter((route) => route.type === "public")
          .map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.path === "/login" ? (
                  <PublicOnlyRoute>{route.element}</PublicOnlyRoute>
                ) : (
                  route.element
                )
              }
            />
          ))}
        {routes
          .filter((route) => route.type === "private")
          .map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PrivateRoute>
                  <AppLayout>{route.element}</AppLayout>
                </PrivateRoute>
              }
            />
          ))}
    </Routes>
  );
}

export default function App() {
  const mode = useGlobalStore((state) => state.theme);
  const dark = mode === "dark";

  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: dark
            ? {
                colorPrimary: "#c4b8a2",
                colorBgLayout: "#1c1a16",
                colorBgContainer: "#26231e",
                colorText: "#f3efe6",
                colorBorder: "#3d382f",
                borderRadius: 2,
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
              }
            : {
                colorPrimary: "#4a4332",
                colorText: "#3c382c",
                colorBgLayout: "#f7f4ee",
                colorBgContainer: "#fffcf8",
                colorBorder: "#e3dcd0",
                borderRadius: 2,
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
              },
          components: dark
            ? {
                Layout: {
                  siderBg: "#24211c",
                  bodyBg: "#1c1a16",
                },
              }
            : {
                Menu: {
                  itemSelectedBg: "#e7e1d4",
                  itemSelectedColor: "#3c382c",
                  itemHoverBg: "#efeae0",
                },
                Layout: {
                  siderBg: "#f3efe6",
                  bodyBg: "#f7f4ee",
                },
              },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ToastContainer autoClose={2500} theme={dark ? "dark" : "light"} />
          <AppContent />
        </QueryClientProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}
