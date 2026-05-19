import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hashPassword } from "@/lib/auth-crypto";
import { apiConfirmPasswordReset } from "@/lib/backend-client";
import { isOk } from "@/types";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { token?: string };
  const token = search.token ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      toast.error("Invalid or expired reset link.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiConfirmPasswordReset(
        token,
        hashPassword(newPassword),
      );
      if (isOk(result)) {
        setDone(true);
        setTimeout(() => navigate({ to: "/login" }), 3000);
      } else {
        toast.error(
          result.err || "Failed to reset password. The link may have expired.",
        );
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-secondary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground text-xl mb-1">
              Password Reset!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your password has been updated. Redirecting to sign in…
            </p>
          </div>
          <Link
            to="/login"
            className="text-sm text-primary hover:text-primary/80 transition-smooth"
            data-ocid="reset.login.link"
          >
            Go to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="space-y-1 text-center mb-6">
        <h1 className="font-display font-bold text-foreground text-2xl">
          New Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        data-ocid="reset.form"
      >
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="glass-input pl-10 pr-10"
              autoComplete="new-password"
              minLength={8}
              required
              data-ocid="reset.new_password.input"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide" : "Show"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="glass-input pl-10"
              autoComplete="new-password"
              required
              data-ocid="reset.confirm_password.input"
            />
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p
              className="text-xs text-destructive mt-1"
              data-ocid="reset.password_mismatch.error_state"
            >
              Passwords do not match
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full glass-button h-11 font-semibold"
          disabled={
            isLoading ||
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword
          }
          data-ocid="reset.submit_button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting…
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
