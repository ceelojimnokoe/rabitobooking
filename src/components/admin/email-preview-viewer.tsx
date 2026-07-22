"use client";

import { useState } from "react";
import type { EmailPreviewPayload } from "@/types/appointment";
import { Button } from "@/components/ui/button";

export function EmailPreviewViewer({ preview }: { preview: EmailPreviewPayload }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3">
      <dl className="grid gap-1 text-sm">
        <div className="flex gap-2">
          <dt className="font-semibold text-ink">To:</dt>
          <dd className="text-muted">{preview.to}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold text-ink">Subject:</dt>
          <dd className="text-muted">{preview.subject}</dd>
        </div>
      </dl>
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3"
      >
        {expanded ? "Hide email preview" : "View email preview"}
      </Button>
      {expanded ? (
        <iframe
          title="Email preview"
          srcDoc={preview.html}
          sandbox=""
          className="mt-3 h-96 w-full rounded-lg border border-border-blue bg-white"
        />
      ) : null}
    </div>
  );
}
