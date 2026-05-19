import { createActor } from "@/backend";
import { AnimatedAgmMark } from "@/components/AnimatedAgmMark";
import { AppSplashScreen } from "@/components/AppSplashScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/hooks/use-auth";
import { buildClient } from "@/lib/backend-client";
import { useAppActor } from "@/lib/use-app-actor";
import { Navigate, useLocation, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound, Lock, User } from "lucide-react";
import { useState } from "react";

type Mode = "login" | "reset";
const BRAND_LOGO = "/assets/images/bcb-logo.png";
const AUTH_BG = "/assets/images/auth-bg.jpg";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    login,
    user,
    sessionToken,
    mustChangePassword,
    requiresPhoneVerification,
    isLoading,
  } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { actor } = useAppActor(createActor);
  const redirectTo =
    typeof location.search === "object" &&
    location.search &&
    "redirect" in location.search &&
    typeof location.search.redirect === "string"
      ? location.search.redirect
      : "/dashboard";

  async function performLogin() {
    if (!username.trim() || !password.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await login(username.trim(), password);
      if (result.mustChangePassword || result.requiresPhoneVerification) {
        navigate({ to: "/change-password", replace: true });
      } else {
        navigate({ to: redirectTo, replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      showToast(
        msg.includes("Invalid")
          ? "Invalid username or password"
          : msg.includes("disabled")
            ? "Account is disabled"
            : msg,
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    await performLogin();
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !resetCode.trim() || !newPassword.trim()) return;
    if (newPassword.length < 10) {
      showToast(
        "Use at least 10 characters and include letters and numbers.",
        "error",
      );
      return;
    }
    if (!actor) {
      showToast("Backend not ready", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const client = buildClient(actor);
      await client.resetPassword(
        username.trim(),
        resetCode.trim(),
        newPassword,
      );
      showToast("Password reset successful. Please sign in.", "success");
      setMode("login");
      setResetCode("");
      setNewPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Reset failed";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sessionToken && user) {
    return (
      <Navigate
        to={
          mustChangePassword || requiresPhoneVerification
            ? "/change-password"
            : redirectTo
        }
        replace
      />
    );
  }

  if (isLoading) {
    return <AppSplashScreen label="Preparing AGM workspace" />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <img
          src={AUTH_BG}
          alt=""
          className="h-full w-full scale-105 object-cover blur-[5px]"
        />
        <div className="absolute inset-0 bg-background/45 dark:bg-background/65" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background/10 to-secondary/15" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
        <div className="relative mt-12 w-full max-w-sm rounded-2xl glass-card-elevated px-5 pb-6 pt-20 shadow-glass-dark sm:px-6">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center" data-ocid="auth.bcb_badge">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-background shadow-glass ring-4 ring-primary/20">
                <img
                  src={BRAND_LOGO}
                  alt="Bawjiase Community Bank logo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mb-10 space-y-1 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">
              AGM Portal
            </h1>
            <p className="text-sm text-muted-foreground">Secure Access</p>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} noValidate>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 rounded-xl glass-input pl-9 text-base"
                      data-ocid="login.username.input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl glass-input pl-9 pr-10 text-base"
                      data-ocid="login.password.input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="mt-5 h-12 w-full rounded-xl glass-button text-sm font-bold uppercase tracking-wide"
                disabled={isSubmitting || !username || !password}
                data-ocid="login.submit_button"
              >
                {isSubmitting ? "Signing in..." : "Secure Login"}
              </Button>

              <button
                type="button"
                onClick={() => setMode("reset")}
                className="mt-3 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                data-ocid="login.forgot_password.link"
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} noValidate>
              <div className="mb-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back
                </button>
                <h2 className="font-display font-semibold text-foreground">
                  Reset Password
                </h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="reset-username"
                    className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-username"
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 rounded-xl glass-input pl-9 text-base"
                      data-ocid="login.reset_username.input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reset-code"
                    className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Reset Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-code"
                      type="text"
                      placeholder="Enter reset code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="h-12 rounded-xl glass-input pl-9 text-base"
                      data-ocid="login.reset_code.input"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contact your administrator for the reset code.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="new-password"
                    className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="At least 10 characters with letters and numbers"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 rounded-xl glass-input pl-9 pr-10 text-base"
                      data-ocid="login.new_password.input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  New passwords must be at least 10 characters and include both
                  letters and numbers.
                </p>
              </div>

              <Button
                type="submit"
                className="mt-5 h-12 w-full rounded-xl glass-button text-sm font-bold uppercase tracking-wide"
                disabled={isSubmitting || !username || !resetCode || !newPassword}
                data-ocid="login.reset_submit_button"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="mt-3 h-12 w-full rounded-xl"
                onClick={() => setMode("login")}
              >
                Return to Login
              </Button>
            </form>
          )}

          <div className="mt-3 border-border border-t pt-5 text-center">
            <p className="text-xs text-muted-foreground">
              Authorized Access Only
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
