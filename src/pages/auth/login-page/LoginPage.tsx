import { getCurrentUser, resetPassword, sendResetLink, signIn } from "@/api";
import { useGlobalStore } from "@/stores";
import { setStorageItem } from "@/utils/safeStorage";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

type LoginValues = {
  email: string;
  password: string;
};

type ResetValues = {
  reset_password_token: string;
  password: string;
  password_confirmation: string;
};

export function LoginPage() {
  const setUser = useGlobalStore((state) => state.setUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromLink = searchParams.get("reset_password_token") || "";
  const [mode, setMode] = useState<"sign-in" | "forgot" | "reset">(tokenFromLink ? "reset" : "sign-in");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: LoginValues) => {
    try {
      setError("");
      setSubmitting(true);
      await signIn(values.email, values.password);
      const { data } = await getCurrentUser();
      if (!data?.id) throw new Error("Unable to load user details.");
      setUser(data);
      setStorageItem("user", JSON.stringify(data));
    } catch (submitError) {
      console.error(submitError);
      setError("Incorrect email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (values: { email: string }) => {
    try {
      setError("");
      setSubmitting(true);
      const result = await sendResetLink(values.email.trim());
      setNotice(result.message || "Password reset instructions have been sent.");
      setMode("reset");
    } catch (submitError) {
      console.error(submitError);
      setError("We couldn't send a reset email for that address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (values: ResetValues) => {
    try {
      setError("");
      setSubmitting(true);
      const result = await resetPassword(values.password, values.password_confirmation, values.reset_password_token.trim());
      setNotice(result.message || "Your password has been updated.");
      setSearchParams({});
      setMode("sign-in");
    } catch (submitError) {
      console.error(submitError);
      setError("That reset code is invalid or expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <section className="auth-hero">
        <div>
          <img className="auth-logo" src="/havn-logo.png" alt="havn." />
          <div className="auth-kicker">Pest Control</div>
          <div className="auth-rule" />
          <p className="auth-tagline">Protecting what matters most.</p>
        </div>
      </section>
      <section className="auth-panel">
        <Card className="auth-card">
          {notice ? <Alert type="success" message={notice} style={{ marginBottom: 16 }} /> : null}
          {error ? <Alert type="error" message={error} style={{ marginBottom: 16 }} /> : null}
          {mode === "sign-in" ? (
            <>
              <Typography.Title level={3}>Sign in</Typography.Title>
              <Typography.Paragraph type="secondary">
                Office staff, recruiters, and reps use this desk.
              </Typography.Paragraph>
              <Form<LoginValues>
                layout="vertical"
                onFinish={(values) => void handleSubmit(values)}
                initialValues={{
                  email: import.meta.env.VITE_DEV_EMAIL || (import.meta.env.DEV ? "admin@example.com" : ""),
                  password: import.meta.env.VITE_DEV_PASSWORD || (import.meta.env.DEV ? "pass123!!!" : ""),
                }}
              >
                <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                  <Input autoComplete="username" />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true }]}>
                  <Input.Password autoComplete="current-password" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={submitting}>
                  Sign in
                </Button>
                <Button type="link" onClick={() => { setError(""); setMode("forgot"); }} style={{ paddingLeft: 0, marginTop: 8 }}>
                  Forgot password?
                </Button>
              </Form>
            </>
          ) : null}
          {mode === "forgot" ? (
            <>
              <Typography.Title level={3}>Forgot password</Typography.Title>
              <Typography.Paragraph type="secondary">
                Enter your email and we'll send a reset code.
              </Typography.Paragraph>
              <Form<{ email: string }> layout="vertical" onFinish={(values) => void handleForgot(values)}>
                <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                  <Input autoComplete="username" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={submitting}>
                  Send reset code
                </Button>
                <Button type="link" onClick={() => { setError(""); setMode("sign-in"); }} style={{ paddingLeft: 0, marginTop: 8 }}>
                  Back to sign in
                </Button>
              </Form>
            </>
          ) : null}
          {mode === "reset" ? (
            <>
              <Typography.Title level={3}>Reset password</Typography.Title>
              <Typography.Paragraph type="secondary">
                Enter the code from the email and choose a new password.
              </Typography.Paragraph>
              <Form<ResetValues>
                layout="vertical"
                onFinish={(values) => void handleReset(values)}
                initialValues={{ reset_password_token: tokenFromLink }}
              >
                <Form.Item label="Reset code" name="reset_password_token" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="New password" name="password" rules={[{ required: true, min: 8 }]}>
                  <Input.Password autoComplete="new-password" />
                </Form.Item>
                <Form.Item
                  label="Confirm new password"
                  name="password_confirmation"
                  dependencies={["password"]}
                  rules={[
                    { required: true },
                    ({ getFieldValue }) => ({
                      validator(_rule, value) {
                        if (!value || getFieldValue("password") === value) return Promise.resolve();
                        return Promise.reject(new Error("Passwords do not match."));
                      },
                    }),
                  ]}
                >
                  <Input.Password autoComplete="new-password" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={submitting}>
                  Reset password
                </Button>
                <Button type="link" onClick={() => { setError(""); setMode("sign-in"); }} style={{ paddingLeft: 0, marginTop: 8 }}>
                  Back to sign in
                </Button>
              </Form>
            </>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
