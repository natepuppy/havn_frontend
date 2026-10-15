import "@ant-design/v5-patch-for-react-19";
import { createRoot } from "react-dom/client";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.tsx";
import "./styles/index.postcss";

createRoot(document.getElementById("root")!).render(<App />);
