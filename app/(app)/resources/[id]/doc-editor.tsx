"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Textarea, Icon } from "@/components/ui";
import { updateDocument, deleteDocument } from "@/lib/actions/documents";

export function DocEditor({ id, initialName, initialText }: { id: string; initialName: string; initialText: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [text, setText] = useState(initialText);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save(asTemplate = false) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("name", name);
    fd.set("text", text);
    if (asTemplate) fd.set("saveAsTemplate", "1");
    startTransition(async () => {
      await updateDocument(fd);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="oa-doc-title"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 26,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--ink)",
            width: "100%",
          }}
        />
        <button className="oa-iconbtn" title="Delete document" onClick={() => startTransition(() => deleteDocument(id))}>
          <Icon name="trash-2" size={16} color="var(--fg-3)" />
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={20}
          placeholder="Write your document…"
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
        <Button variant="accent" icon="check" onClick={() => save(false)} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" icon="bookmark" onClick={() => save(true)} disabled={pending}>
          Save as template
        </Button>
        {saved ? <span style={{ color: "var(--profit)", fontSize: 13 }}>Saved</span> : null}
      </div>
    </div>
  );
}
