"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { Button, BrandLogo, Field, Input } from "@/components/ui";

function clerkError(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "errors" in err) {
    const e = (err as { errors?: Array<{ longMessage?: string; message?: string }> }).errors?.[0];
    return e?.longMessage || e?.message || fallback;
  }
  return fallback;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [stage, setStage] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setStage("reset");
      setLoading(false);
    } catch (err) {
      setError(clerkError(err, "Couldn't send a reset code. Check the email and try again."));
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const res = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push("/today");
      } else if (res.status === "needs_second_factor") {
        setError("Two-factor authentication is on for this account — please sign in from the login page.");
        setLoading(false);
      } else {
        setError("Couldn't reset your password. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError(clerkError(err, "Invalid or expired code."));
      setLoading(false);
    }
  }

  return (
    <div className="pp-stage" style={{ height: "auto", minHeight: "100vh", overflow: "visible" }}>
      <header className="pp-utilbar">
        <Link href="/" className="pp-brand" style={{ textDecoration: "none" }}>
          <BrandLogo size={18} />
        </Link>
        <div className="pp-right">
          <Link href="/login">Sign in</Link>
        </div>
      </header>

      <div className="pp-auth pp-auth-centered">
        <div className="pp-auth-left">
          <div className="pp-auth-card">
            <h1>Reset your password.</h1>

            {stage === "request" ? (
              <form className="pp-auth-form" onSubmit={requestCode}>
                <p className="pp-auth-sub" style={{ marginTop: 4 }}>
                  Enter your email and we&apos;ll send you a code to reset your password.
                </p>
                <Field label="Email">
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                  />
                </Field>
                {error ? <div style={{ color: "var(--loss)", fontSize: 13, fontWeight: 500 }}>{error}</div> : null}
                <Button
                  type="submit"
                  variant="accent"
                  iconRight={loading ? undefined : "arrow-right"}
                  style={{ height: 42, justifyContent: "center", fontSize: 14 }}
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send reset code"}
                </Button>
              </form>
            ) : (
              <form className="pp-auth-form" onSubmit={resetPassword}>
                <p className="pp-auth-sub" style={{ marginTop: 4 }}>
                  We emailed a 6-digit code to <strong>{email}</strong>. Enter it and choose a new password.
                </p>
                <Field label="Reset code">
                  <Input
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    required
                    value={code}
                    onChange={(ev) => setCode(ev.target.value)}
                  />
                </Field>
                <Field label="New password" hint="At least 8 characters">
                  <Input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                  />
                </Field>
                {error ? <div style={{ color: "var(--loss)", fontSize: 13, fontWeight: 500 }}>{error}</div> : null}
                <Button
                  type="submit"
                  variant="accent"
                  iconRight={loading ? undefined : "arrow-right"}
                  style={{ height: 42, justifyContent: "center", fontSize: 14 }}
                  disabled={loading}
                >
                  {loading ? "Resetting…" : "Reset password"}
                </Button>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--fg-3)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                  onClick={() => {
                    setStage("request");
                    setCode("");
                    setPassword("");
                    setError(null);
                  }}
                >
                  Use a different email
                </button>
              </form>
            )}

            <p className="pp-auth-foot" style={{ textAlign: "center", marginTop: 20 }}>
              <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
