"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button, BrandLogo, Field, Input, Select } from "@/components/ui";
import { registerUser } from "@/lib/actions/auth";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      if (isSignup) {
        const res = await registerUser(form);
        if (!res.ok) {
          setError(res.error);
          setLoading(false);
          return;
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(isSignup ? "Account created, but sign-in failed. Try logging in." : "Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push("/today");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
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
            <span style={{ color: "var(--fg-2)" }}>
              Have an account? <Link href="/login">Sign in</Link>
            </span>
          ) : (
            <span style={{ color: "var(--fg-2)" }}>
              No account?{" "}
              <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>
                Create free account
              </Link>
            </span>
          )}
        </div>
      </header>

      <div className="pp-auth pp-auth-centered">
        <div className="pp-auth-left">
          <div className="pp-auth-card">
            <h1>{isSignup ? "Start your trial." : "Welcome back."}</h1>
            <p className="pp-auth-sub">{isSignup ? "14 days free. No card required." : "Pick up where you left off."}</p>

            <form className="pp-auth-form" onSubmit={onSubmit}>
              <button
                type="button"
                className="pp-oauth-btn"
                onClick={() => signIn("google", { callbackUrl: "/today" })}
              >
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
                <Field label="Name">
                  <Input name="name" type="text" placeholder="Your name" autoComplete="name" />
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
              {isSignup && (
                <Field label="Trading focus">
                  <Select
                    name="tradingFocus"
                    defaultValue="forex"
                    options={[
                      { value: "forex", label: "Forex" },
                      { value: "crypto", label: "Crypto" },
                      { value: "stocks", label: "Stocks / indices" },
                      { value: "mixed", label: "Mixed" },
                    ]}
                  />
                </Field>
              )}

              {error ? (
                <div style={{ color: "var(--loss)", fontSize: 13, fontWeight: 500 }}>{error}</div>
              ) : null}

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

            <p className="pp-auth-foot" style={{ textAlign: "center", marginTop: 16 }}>
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>
                    Create one free
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
