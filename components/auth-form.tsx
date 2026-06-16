"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { Button, BrandLogo, Field, Input } from "@/components/ui";

function clerkError(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "errors" in err) {
    const e = (err as { errors?: Array<{ longMessage?: string; message?: string }> }).errors?.[0];
    return e?.longMessage || e?.message || fallback;
  }
  return fallback;
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingCode, setPendingCode] = useState(false);
  const [code, setCode] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const username = String(form.get("name") || "");

    if (isSignup) {
      if (!signUpLoaded) return;
      setLoading(true);
      try {
        await signUp.create({
          emailAddress: email,
          password,
          // Clerk enforces username uniqueness instance-wide and rejects
          // duplicates here with a "username is taken" error.
          ...(username ? { username } : {}),
        });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setPendingCode(true);
        setLoading(false);
      } catch (err) {
        setError(clerkError(err, "Could not create your account. Please try again."));
        setLoading(false);
      }
      return;
    }

    if (!signInLoaded) return;
    setLoading(true);
    try {
      const res = await signIn.create({ identifier: email, password });
      if (res.status === "complete") {
        await setSignInActive({ session: res.createdSessionId });
        router.push("/today");
      } else {
        setError("Additional verification is required to sign in.");
        setLoading(false);
      }
    } catch (err) {
      setError(clerkError(err, "Invalid email or password."));
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signUpLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === "complete") {
        await setSignUpActive({ session: res.createdSessionId });
        router.push("/today");
      } else {
        setError("That code didn't work. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError(clerkError(err, "Invalid or expired code."));
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    try {
      if (isSignup) {
        if (!signUpLoaded) return;
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/today",
        });
      } else {
        if (!signInLoaded) return;
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/today",
        });
      }
    } catch (err) {
      setError(clerkError(err, "Couldn't continue with Google."));
    }
  }

  return (
    <div className="pp-stage" style={{ height: "auto", minHeight: "100vh", overflow: "visible" }}>
      <header className="pp-utilbar">
        <Link href="/" className="pp-brand" style={{ textDecoration: "none" }}>
          <BrandLogo size={18} />
        </Link>
        <div className="pp-right">
          {isSignup ? (
            <Link href="/login">Sign in</Link>
          ) : (
            <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Start free trial
            </Link>
          )}
        </div>
      </header>

      <div className="pp-auth pp-auth-centered">
        <div className="pp-auth-left">
          <div className="pp-auth-card">
            <h1>{isSignup ? "Start your free trial." : "Welcome back."}</h1>
            {isSignup && <p className="pp-auth-sub">14 days free. No card required.</p>}

            {pendingCode ? (
              <form className="pp-auth-form" onSubmit={onVerify}>
                <p className="pp-auth-sub" style={{ marginTop: 4 }}>
                  We emailed you a 6-digit verification code. Enter it to finish creating your account.
                </p>
                <Field label="Verification code">
                  <Input
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={code}
                    onChange={(ev) => setCode(ev.target.value)}
                    required
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
                  {loading ? "Verifying…" : "Verify email"}
                </Button>
              </form>
            ) : (
              <form className="pp-auth-form" onSubmit={onSubmit}>
                <button type="button" className="pp-oauth-btn" onClick={onGoogle}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M15.5 8.2c0-.5 0-1-.1-1.4H8v2.7h4.2c-.2 1-.7 1.8-1.5 2.4v2h2.4c1.4-1.3 2.2-3.2 2.2-5.5z" fill="#4285F4" />
                    <path d="M8 16c2 0 3.7-.7 4.9-1.8l-2.4-1.9c-.7.5-1.5.7-2.5.7-1.9 0-3.6-1.3-4.2-3H1.4v1.9C2.6 14.5 5.1 16 8 16z" fill="#34A853" />
                    <path d="M3.8 9.6c-.1-.3-.2-.7-.2-1s.1-.7.2-1V5.6H1.4C1 6.4.8 7.2.8 8s.2 1.6.6 2.4l2.4-1.8z" fill="#FBBC04" />
                    <path d="M8 3.5c1.1 0 2.1.4 2.8 1.1l2.1-2.1C11.7.9 10 0 8 0 5.1 0 2.6 1.5 1.4 3.6l2.4 1.9C4.4 4.5 6.1 3.5 8 3.5z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>

                <div className="pp-auth-divider">or with email</div>

                {isSignup && (
                  <Field label="Username" hint="Must be unique">
                    <Input name="name" type="text" required placeholder="yourname" autoComplete="username" />
                  </Field>
                )}
                <Field label="Email">
                  <Input name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
                </Field>
                <Field label="Password" hint={isSignup ? "At least 8 characters" : undefined}>
                  <Input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••••"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                  />
                </Field>
                {!isSignup && (
                  <div style={{ textAlign: "right", marginTop: -4 }}>
                    <Link href="/forgot-password" style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 500 }}>
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Clerk bot-protection mounts here during sign-up */}
                {isSignup && <div id="clerk-captcha" />}

                {error ? <div style={{ color: "var(--loss)", fontSize: 13, fontWeight: 500 }}>{error}</div> : null}

                <Button
                  type="submit"
                  variant="accent"
                  iconRight={loading ? undefined : "arrow-right"}
                  style={{ height: 42, justifyContent: "center", fontSize: 14 }}
                  disabled={loading}
                >
                  {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
                </Button>
              </form>
            )}

            <p className="pp-auth-foot" style={{ textAlign: "center", marginTop: 16 }}>
              {isSignup ? (
                <>
                  Have an account?{" "}
                  <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  No account?{" "}
                  <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>
                    Start free trial
                  </Link>
                </>
              )}
            </p>

            {isSignup && (
              <p className="pp-auth-foot" style={{ textAlign: "center" }}>
                By starting your trial you agree to our <a>Terms</a> and <a>Privacy</a>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
