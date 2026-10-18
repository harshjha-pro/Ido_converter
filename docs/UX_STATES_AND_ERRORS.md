# UX states and error handling

| Surface | Empty | Loading | Success | Failure | Recovery |
|---|---|---|---|---|---|
| Product-photo tool | Drop zone, limits, "Try 4 sample photos" | Placeholder of the same size (no layout shift); "Loading previews n of N" | "Done in X s · N ready"; Pass/Check/Fail counts; ZIP and CSV | Per-file reason + fix; failed files excluded from the ZIP and labelled; WhatsApp help when configured | Change settings → "Process again"; Stop; Start over; remove a photo (also after processing); download one photo from the inspector; leave-page warning while running |
| Converter | Drop zone, supported formats | Per-file "Loading/Waiting/Working" | "N ready · in KB → out KB"; per-file Download; ZIP | "Failed" + reason; batch continues | "Convert again", Start over, Stop, remove an image (also after converting) |
| Early-access form | — | "Sending…" (button disabled) | "You're on the list" with the normalised contact | Field errors (focus moves to the first); 429 "Too many attempts"; offline message; 503 "isn't available right now" | Edit and resubmit; duplicates update, not duplicate |
| Pages | — | Static | — | Runtime crash → `app/error.tsx` with "Try again" and Homepage; 404 page | — |

**Message rules:**
- Say what happened, why, and what to do.
- No codes or stack traces for users.
- Server errors carry a `requestId` for support.
- Never blame the user.
