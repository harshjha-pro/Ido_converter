# Rules and sources

Every rate, divisor, threshold or official spec used by a tool must be listed here with a source before it is used in code (AGENTS.md rule 4). If a value has no source, it stays a `TODO(needs source)` and the tool must not hard-code it.

| Rule | Value | Source | effectiveFrom | lastChecked | reviewedBy |
|---|---|---|---|---|---|
| Volumetric weight divisor (default, if any) | TODO(needs source) | — | — | — | — |
| Visa/passport photo specs (per country) | TODO(needs source): countries not chosen yet (NOTES.md open question 5) | — | — | — | — |

## Notes

- **Volumetric weight calculator:** ships with no default divisor. The user enters their courier's divisor. A default can be added only with a courier rate-card source in the table above.
