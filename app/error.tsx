"use client";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import s from "@/components/marketing/marketing.module.css";

/** Shown if a page crashes in the browser. Offers recovery instead of a blank screen. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("page_error", error.digest ?? ""); }, [error]);
  return (
    <div className={`wrap ${s.narrow}`}>
      <h1>Something went wrong on this page</h1>
      <p>Your photos were never uploaded, so nothing has been lost on our side. Try again, or go back to the homepage.</p>
      <div className={s.actions}>
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">Homepage</ButtonLink>
      </div>
    </div>
  );
}
