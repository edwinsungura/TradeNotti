"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Icon, BrandLogo } from "@/components/ui";

export type AccountVM = {
  id: string;
  name: string;
  broker?: string | null;
  currency: string;
  kind: string;
  balance?: string | null;
};

export type ShellUser = { name: string; email: string; plan?: string };

const NAV_MAIN = [
  { href: "/today", icon: "sun", label: "Today" },
  { href: "/journal", icon: "notebook-pen", label: "Journal" },
  { href: "/analytics", icon: "layout-dashboard", label: "Analytics" },
  { href: "/notebook", icon: "calendar", label: "Notebook" },
  { href: "/rules", icon: "book-marked", label: "Rules" },
  { href: "/partners", icon: "users", label: "Partners" },
];

const NAV_LIBRARY = [
  { href: "/resources", icon: "layers", label: "Resources" },
  { href: "/pinboard", icon: "images", label: "Pinboard" },
];

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link href={href} className={`oa-nav-item ${active ? "active" : ""}`}>
      <Icon name={icon} size={17} />
      <span>{label}</span>
    </Link>
  );
}

function AccountSwitcher({ accounts, currentId }: { accounts: AccountVM[]; currentId?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!accounts.length) {
    return (
      <Link href="/settings" className="oa-acct-trigger" style={{ textDecoration: "none" }}>
        <span className="oa-acct-dot demo" />
        <div className="oa-acct-info">
          <div className="oa-acct-name">Add a trading account</div>
          <div className="oa-acct-meta">Settings · accounts</div>
        </div>
        <Icon name="plus" size={14} color="var(--fg-3)" />
      </Link>
    );
  }

  const cur = accounts.find((a) => a.id === currentId) || accounts[0];
  return (
    <div className="oa-acct" ref={ref}>
      <button className="oa-acct-trigger" onClick={() => setOpen((o) => !o)}>
        <span className={`oa-acct-dot ${cur.kind}`} />
        <div className="oa-acct-info">
          <div className="oa-acct-name">{cur.name}</div>
          <div className="oa-acct-meta">
            {cur.broker} · {cur.currency}
          </div>
        </div>
        <Icon name="chevrons-up-down" size={14} color="var(--fg-3)" />
      </button>
      {open ? (
        <div className="oa-acct-menu">
          <div className="overline" style={{ padding: "8px 12px 4px" }}>
            Accounts
          </div>
          {accounts.map((a) => (
            <Link
              key={a.id}
              href={`/today?account=${a.id}`}
              className={`oa-acct-item ${a.id === cur.id ? "on" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className={`oa-acct-dot ${a.kind}`} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div className="oa-acct-name">{a.name}</div>
                <div className="oa-acct-meta">
                  {a.broker} · {a.currency} · {a.balance}
                </div>
              </div>
              {a.id === cur.id ? <Icon name="check" size={14} color="var(--gold-deep)" /> : null}
            </Link>
          ))}
          <div className="oa-acct-foot">
            <Link href="/settings" className="oa-acct-item ghost" onClick={() => setOpen(false)}>
              <Icon name="plus" size={14} /> Add trading account
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProfileMenu({ user }: { user: ShellUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();
  return (
    <div className="oa-profile" ref={ref}>
      <button className={`oa-avatar-btn ${open ? "on" : ""}`} onClick={() => setOpen((o) => !o)} title="Profile & settings">
        <span className="oa-avatar">{initial}</span>
      </button>
      {open ? (
        <div className="oa-profile-menu">
          <div className="oa-profile-head">
            <span className="oa-avatar lg">{initial}</span>
            <div style={{ minWidth: 0 }}>
              <div className="oa-profile-name">{user.name || "Trader"}</div>
              <div className="oa-profile-email">{user.email}</div>
              <span className="oa-profile-plan">{user.plan || "Free trial"}</span>
            </div>
          </div>
          <div className="oa-profile-section">
            <Link className="oa-profile-item" href="/settings" onClick={() => setOpen(false)}>
              <Icon name="user" size={16} /> <span>Profile</span>
            </Link>
            <Link className="oa-profile-item" href="/settings" onClick={() => setOpen(false)}>
              <Icon name="settings" size={16} /> <span>Settings</span>
            </Link>
            <Link className="oa-profile-item" href="/partners" onClick={() => setOpen(false)}>
              <Icon name="users" size={16} /> <span>Partners</span>
            </Link>
          </div>
          <div className="oa-profile-section">
            <button className="oa-profile-item danger" onClick={() => signOut({ callbackUrl: "/" })}>
              <Icon name="log-out" size={16} /> <span>Sign out</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AppShell({
  accounts,
  currentId,
  user,
  children,
}: {
  accounts: AccountVM[];
  currentId?: string;
  user: ShellUser;
  children: React.ReactNode;
}) {
  return (
    <div className="oa-shell">
      <header className="oa-topbar">
        <div className="oa-topbar-left">
          <Link href="/today" style={{ textDecoration: "none" }}>
            <BrandLogo size={18} />
          </Link>
        </div>
        <AccountSwitcher accounts={accounts} currentId={currentId} />
        <div />
        <div className="oa-topbar-right">
          <button className="oa-iconbtn" title="Notifications">
            <Icon name="bell" size={17} />
          </button>
          <ProfileMenu user={user} />
        </div>
      </header>
      <div className="oa-body">
        <nav className="oa-rail">
          <div className="oa-rail-section">
            {NAV_MAIN.map((n) => (
              <NavItem key={n.href} {...n} />
            ))}
          </div>
          <div className="oa-rail-section">
            <div className="oa-rail-label">Library</div>
            {NAV_LIBRARY.map((n) => (
              <NavItem key={n.href} {...n} />
            ))}
          </div>
          <div className="oa-rail-foot">
            <NavItem href="/settings" icon="settings" label="Settings" />
          </div>
        </nav>
        <main className="oa-main">{children}</main>
      </div>
    </div>
  );
}
