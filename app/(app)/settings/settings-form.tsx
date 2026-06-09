"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Select, Segmented, Button, TagChip } from "@/components/ui";
import { updateProfile, addAccount } from "@/lib/actions/profile";

export function SettingsForm({
  name,
  theme,
  accent,
  timezone,
  email,
  watchlist,
}: {
  name: string;
  theme: string;
  accent: string;
  timezone: string;
  email: string;
  watchlist: string[];
}) {
  const router = useRouter();
  const [n, setN] = useState(name);
  const [t, setT] = useState(theme);
  const [a, setA] = useState(accent);
  const [tz, setTz] = useState(timezone);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    const fd = new FormData();
    fd.set("name", n);
    fd.set("theme", t);
    fd.set("accentPalette", a);
    fd.set("timezone", tz);
    startTransition(async () => {
      await updateProfile(fd);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Name">
        <Input value={n} onChange={(e) => setN(e.target.value)} />
      </Field>
      <Field label="Email">
        <Input value={email} disabled />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Theme">
          <Segmented
            value={t}
            onChange={setT}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </Field>
        <Field label="Accent">
          <Select
            value={a}
            onChange={setA}
            options={[
              { value: "iris", label: "Iris" },
              { value: "blue", label: "Blue" },
              { value: "emerald", label: "Emerald" },
              { value: "gold", label: "Gold" },
            ]}
          />
        </Field>
      </div>
      <Field label="Timezone" hint="e.g. Europe/London, America/New_York">
        <Input value={tz} onChange={(e) => setTz(e.target.value)} placeholder="UTC" />
      </Field>

      {watchlist.length ? (
        <div>
          <span className="oa-field-label">Watchlist</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            {watchlist.map((p) => (
              <TagChip key={p} tone="neutral">
                {p}
              </TagChip>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button variant="accent" icon="check" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {saved ? <span style={{ color: "var(--profit)", fontSize: 13 }}>Saved</span> : null}
      </div>
    </div>
  );
}

export function AddAccountForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button variant="secondary" icon="plus" onClick={() => setOpen(true)} style={{ width: "100%", justifyContent: "center" }}>
        Add trading account
      </Button>
    );
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await addAccount(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Field label="Name">
        <Input name="name" required placeholder="Live · FTMO 100k" />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Broker">
          <Input name="broker" placeholder="MetaTrader 5" />
        </Field>
        <Field label="Currency">
          <Input name="currency" defaultValue="USD" />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Kind">
          <Select
            name="kind"
            defaultValue="live"
            options={[
              { value: "live", label: "Live" },
              { value: "demo", label: "Demo" },
              { value: "prop", label: "Prop firm" },
            ]}
          />
        </Field>
        <Field label="Balance">
          <Input name="balance" placeholder="$100,000" />
        </Field>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Adding…" : "Add account"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
