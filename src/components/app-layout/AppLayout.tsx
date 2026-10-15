import { getCurrentUser, logout } from "@/api";
import { can } from "@/lib/permissions";
import { useGlobalStore } from "@/stores";
import { setStorageItem } from "@/utils/safeStorage";
import { LogoutOutlined, UserAddOutlined, TeamOutlined, FileTextOutlined, UserOutlined, SafetyOutlined, EnvironmentOutlined, BulbOutlined } from "@ant-design/icons";
import { Button, Layout, Menu } from "antd";
import { useEffect, type PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider, Content } = Layout;

export function AppLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useGlobalStore((state) => state.user);
  const setUser = useGlobalStore((state) => state.setUser);
  const theme = useGlobalStore((state) => state.theme);
  const setTheme = useGlobalStore((state) => state.setTheme);
  const dark = theme === "dark";
  const selected = location.pathname.startsWith("/permissions")
    ? "/permissions"
    : location.pathname.startsWith("/users")
      ? "/users"
      : location.pathname.startsWith("/documents")
        ? "/documents"
        : location.pathname.startsWith("/markets")
          ? "/markets"
        : location.pathname.startsWith("/reps/new")
          ? "/reps/new"
          : "/reps";

  useEffect(() => {
    void getCurrentUser().then(({ data }) => {
      if (!data?.id) return;
      setUser(data);
      setStorageItem("user", JSON.stringify(data));
    });
  }, [setUser]);

  const menuItems = [
    can(user?.permissions, "view_reps") ? { key: "/reps", icon: <TeamOutlined />, label: "Reps" } : null,
    can(user?.permissions, "manage_reps") ? { key: "/reps/new", icon: <UserAddOutlined />, label: "New rep" } : null,
    { key: "/documents", icon: <FileTextOutlined />, label: "Documents" },
    can(user?.permissions, "manage_reps")
      ? { key: "/markets", icon: <EnvironmentOutlined />, label: "Markets" }
      : null,
    can(user?.permissions, "manage_users") ? { key: "/users", icon: <UserOutlined />, label: "Users" } : null,
    can(user?.permissions, "manage_permissions")
      ? { key: "/permissions", icon: <SafetyOutlined />, label: "Permissions" }
      : null,
  ].filter((item) => item !== null);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        theme={dark ? "dark" : "light"}
        style={{
          background: dark ? "#24211c" : "#f3efe6",
          borderRight: dark ? "1px solid #3d382f" : "1px solid #e3dcd0",
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="app-sider">
          <div>
            <div className="brand">
              <img className="brand-logo" src="/havn-logo.png" alt="havn." />
              <div className="brand-kicker">Pest Control</div>
            </div>
            <Menu
              theme={dark ? "dark" : "light"}
              mode="inline"
              selectedKeys={[selected]}
              style={{ background: "transparent" }}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
            />
          </div>
          <div className="app-sider-footer">
            <div className="app-sider-profile">
              <div className="app-sider-profile-name">{user?.full_name}</div>
              <div className="app-sider-profile-meta">{user?.email}</div>
            </div>
            <Button
              icon={<BulbOutlined />}
              block
              onClick={() => setTheme(dark ? "light" : "dark")}
            >
              {dark ? "Light mode" : "Dark mode"}
            </Button>
            <Button icon={<LogoutOutlined />} block onClick={() => void logout()}>
              Log out
            </Button>
          </div>
        </div>
      </Sider>
      <Layout style={{ marginInlineStart: 240 }}>
        <Content style={{ padding: 28 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
