import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequestPasswordReset } from "@/lib/backend-client";
import { isOk } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const result = await apiRequestPasswordReset(email);
      if (isOk(result)) {
        setSent(true);
      } else {
        toast.error(result.err);
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-secondary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground text-xl mb-1">
              Check Your Email
            </h2>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to{" "}
              <strong className="text-foreground">{email}</strong>
            </p>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">
            The link expires in 30 minutes. If you don&apos;t see it, check your
            spam folder.
          </p>
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-smooth mt-2"
            data-ocid="forgot.back_to_login.link"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="space-y-1 text-center mb-6">
        <h1 className="font-display font-bold text-foreground text-2xl">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your official email to receive a reset link
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        data-ocid="forgot.form"
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Official Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@bawjiasearearuralbank.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input pl-10"
              autoComplete="email"
              required
              data-ocid="forgot.email.input"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full glass-button h-11 font-semibold"
          disabled={isLoading || !email}
          data-ocid="forgot.submit_button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-smooth"
          data-ocid="forgot.back_to_login.link"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </div>
    </AuthShell>
  );
}
