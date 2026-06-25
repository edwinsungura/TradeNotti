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
