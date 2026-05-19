import { createActor } from "@/backend";
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
    <div className="relative min-h-screen overflow-hidden bg-background p-4 sm:p-6">
      <div className="absolute inset-0" aria-hidden>
        <img
          src={AUTH_BG}
          alt=""
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,18,32,0.88),rgba(13,79,50,0.72))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,205,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(93,170,108,0.18),transparent_26%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_440px]">
          <div className="hidden pr-8 text-white lg:block">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white/20 bg-white shadow-glass">
                <img
                  src={BRAND_LOGO}
                  alt="Bawjiase Community Bank logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="font-display text-4xl font-bold leading-tight">
                  AGM Portal
                </div>
                <div className="mt-1 text-sm uppercase tracking-[0.24em] text-white/72">
                  Bawjiase Community Bank PLC
                </div>
              </div>
            </div>
            <h1 className="max-w-xl font-display text-5xl font-bold leading-[1.02]">
              Annual General Meeting workspace with the same BCB portal feel.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80">
              Sign in to manage registrations, shareholder records, board
              reporting, and AGM operations inside the same interface language
              used across the staff portal.
            </p>
          </div>

          <div className="relative w-full max-w-md justify-self-center lg:justify-self-end">
            <div className="mb-6 text-center text-white lg:hidden">
              <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-white/20 bg-white shadow-glass">
                <img
                  src={BRAND_LOGO}
                  alt="Bawjiase Community Bank logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <h1 className="font-display text-3xl font-bold">AGM Portal</h1>
              <p className="mt-1 text-sm text-white/72">
                Bawjiase Community Bank PLC
              </p>
            </div>

            <div className="glass-card-elevated rounded-3xl border border-white/20 p-6 shadow-glass sm:p-7">
              <div className="mb-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                  Secure Access
                </div>
                <h2 className="mt-2 font-display text-3xl font-bold text-foreground">
                  {mode === "login" ? "Sign In" : "Reset Password"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {mode === "login"
                    ? "Use your AGM account to continue into the operations workspace."
                    : "Enter the admin-issued reset code and set a new password."}
                </p>
              </div>

              {mode === "login" ? (
                <form onSubmit={handleLogin} noValidate>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          autoComplete="username"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="glass-input min-h-[48px] rounded-xl pl-9"
                          data-ocid="login.username.input"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="glass-input min-h-[48px] rounded-xl pl-9 pr-10"
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
                    className="mt-6 glass-button min-h-[48px] w-full rounded-xl font-semibold"
                    disabled={isSubmitting || !username || !password}
                    data-ocid="login.submit_button"
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
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
                  <div className="mb-5">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Back to Sign In
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reset-username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reset-username"
                          type="text"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="glass-input min-h-[48px] rounded-xl pl-9"
                          data-ocid="login.reset_username.input"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="reset-code">Reset Code</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reset-code"
                          type="text"
                          placeholder="Enter reset code"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          className="glass-input min-h-[48px] rounded-xl pl-9"
                          data-ocid="login.reset_code.input"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Contact your administrator for the reset code.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="At least 10 characters with letters and numbers"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="glass-input min-h-[48px] rounded-xl pl-9 pr-10"
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
                      New passwords must be at least 10 characters and include
                      both letters and numbers.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="mt-6 glass-button min-h-[48px] w-full rounded-xl font-semibold"
                    disabled={isSubmitting || !username || !resetCode || !newPassword}
                    data-ocid="login.reset_submit_button"
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 min-h-[48px] w-full rounded-xl"
                    onClick={() => setMode("login")}
                  >
                    Return to Login
                  </Button>
                </form>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-white/70">
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
