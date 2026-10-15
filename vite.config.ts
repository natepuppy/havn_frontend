import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const LOCAL_API_MODE = "local-api";

function localApiProxy(target: string) {
  return {
    "/api": {
      target,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ""),
    },
  };
}

export default defineConfig(({ mode }) => {
  const useLocalApi = mode === LOCAL_API_MODE;
  const railsOrigin = "http://localhost:3000";

  return {
    base: "/",
    server: useLocalApi ? { proxy: localApiProxy(railsOrigin) } : { port: 5173 },
    preview: useLocalApi ? { proxy: localApiProxy(railsOrigin) } : undefined,
    plugins: [react(), tsconfigPaths()],
  };
});
