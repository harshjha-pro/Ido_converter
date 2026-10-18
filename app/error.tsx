"use client";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

/** Shown if a page crashes in the browser. Offers recovery instead of a blank screen. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("page_error", error.digest ?? ""); }, [error]);
  return (
    <div className="wrap" style={{ paddingBlock: 64, maxWidth: 640 }}>
      <h1 style={{ fontSize: 32 }}>Something went wrong on this page</h1>
      <p className="muted" style={{ marginTop: 16 }}>Your photos were never uploaded, so nothing has been lost on our side. Try again, or go back to the homepage.</p>
      <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">Homepage</ButtonLink>
      </div>
    </div>
  );
}
