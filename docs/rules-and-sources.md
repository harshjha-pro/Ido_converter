# Rules and sources

Every rate, divisor, threshold or official spec used by a tool must be listed here with a source before it is used in code (AGENTS.md rule 4). If a value has no source, it stays a `TODO(needs source)` and the tool must not hard-code it.

| Rule | Value | Source | effectiveFrom | lastChecked | reviewedBy |
|---|---|---|---|---|---|
| Volumetric weight divisor (default, if any) | TODO(needs source) | — | — | — | — |
| India passport printed photo | 35 × 45 mm (4.5 × 3.5 cm), colour, plain white background, dark clothing, frontal full face | [Passport Seva instruction booklet V3.0](https://www.passportindia.gov.in/AppOnlineProject/pdf/ApplicationformInstructionBooklet-V3.0.pdf) | — | 2026-10-02 | TODO |
| USA visa digital photo | Square, 600 × 600 to 1200 × 1200 px; JPEG ≤ 240 kB; colour; head 50–69% of image height | [travel.state.gov visa photo requirements](https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html) | — | 2026-10-02 | TODO |
| USA passport printed photo | 2 × 2 in (51 × 51 mm); head 1–1.4 in (25–35 mm) | [travel.state.gov passport photos](https://travel.state.gov/content/travel/en/passports/requirements/photos.html) | — | 2026-10-02 | TODO |
| UK passport digital photo | ≥ 600 × 750 px; 50 KB–10 MB; colour, in focus, unaltered | [GOV.UK digital photos](https://www.gov.uk/photos-for-passports) | — | 2026-10-02 | TODO |
| UK passport printed photo | 45 × 35 mm; head 29–34 mm | [GOV.UK printed photos](https://www.gov.uk/photos-for-passports/photo-requirements) | — | 2026-10-02 | TODO |

| GSTR-2B JSON structure (data format, not a rate) | `data.docdata.{b2b,b2ba,cdnr,cdnra,isd,impg,impgsez}` with fields listed in docs/tools/gstr-2b-json-to-excel.md | [GST portal: Viewing Form GSTR-2B](https://tutorial.gst.gov.in/userguide/returns/Manual_gstr2b.htm) and section help pages | — | 2026-10-02 | TODO (CA: verify with a real downloaded file) |

| GST rates from 22-09-2025 | Nil, 0.25%, 1.5%, 3%, 5%, 18%, 40% (tobacco items on a later notified date) | [PIB: 56th GST Council recommendations](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2163555), [GST Council press release](https://gstcouncil.gov.in/sites/default/files/2025-09/press_release_press_information_bureau.pdf) | 2025-09-22 | 2026-10-02 | TODO (CA) |

## Notes

- **Volumetric weight calculator:** ships with no default divisor. The user enters their courier's divisor. A default can be added only with a courier rate-card source in the table above.
- **Visa photo specs:** the values above were read from the official domains via search results on 2026-10-02 (this build environment could not open the government pages directly). A person must open each source, confirm the values, and put their name in `reviewedBy` here and in `core/forms/visa-photo-presets.json`. Until every preset has a reviewer, the tool is built but **not listed** on the site (AGENTS.md rule 5).
- Not used: the Indian 630 × 810 px / 250 KB online-upload figure that appears on third-party sites; no official source was found for it.
- Derived values (not official, labelled on the page): 300 DPI print resolution for printed presets; 4:5 shape and 900 × 1125 px for the UK digital preset (from the official 600 × 750 minimum).
