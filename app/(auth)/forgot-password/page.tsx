import Link from "next/link";
import { BrandLogo } from "@/components/ui";

export default function ForgotPasswordPage() {
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
            <p className="pp-auth-sub">
              Password reset by email is coming soon. In the meantime, sign in with Google, or reach us at{" "}
              <a href="mailto:support@tradenotti.app">support@tradenotti.app</a> and we&apos;ll help you back in.
            </p>
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
