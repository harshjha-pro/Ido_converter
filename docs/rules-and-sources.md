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

| GSTR-3B late fee (tax periods from June 2021) | ₹25/day per Act (₹10 nil); cap per Act: nil ₹250, AATO ≤1.5 cr ₹1,000, 1.5–5 cr ₹2,500, >5 cr ₹5,000 | [Notification 19/2021-CT (GST Council)](https://gstcouncil.gov.in/node/4305), [PIB 43rd GSTCM](https://www.pib.gov.in/PressReleasePage.aspx?PRID=1722578), [GST portal FAQ](https://tutorial.gst.gov.in/userguide/returns/GSTR3B.htm) | 2021-06-01 | 2026-10-02 | TODO (CA) |
| GST interest on late payment (s.50(1)) | 18% p.a. on cash-paid current-period tax; from Jan 2026 periods less minimum ECL balance | [CGST Act s.50](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_CGST_act/active/chapter10/section50_v1.00.html), [GST portal advisory](https://tutorial.gst.gov.in/downloads/news/final_advisory_on_interest_calculator.pdf) | — | 2026-10-02 | TODO (CA) |

| TDS rates and thresholds, tax year 2026-27 (s.393, Income-tax Act 2025) | 11 rows listed in docs/tools/tds-rate-lookup.md and core/ca/tds-rates.json | [TDS Rates](https://www.incometaxindia.gov.in/w/tds-rates-1), [Section 393](https://www.incometaxindia.gov.in/w/section-393-5), [194A](https://www.incometaxindia.gov.in/w/section-194a), [194C](https://www.incometaxindia.gov.in/w/section-194c), [rent by individual/HUF](https://www.incometaxindia.gov.in/w/tds-on-rent-by-certain-individual-or-huf), [property](https://www.incometaxindia.gov.in/w/tds-purchase-of-immovable-property), [CBDT Budget 2026 FAQs](https://www.incometaxindia.gov.in/documents/20117/15766092/FAQs-Budget-2026.pdf/ff3d0e10-88a0-b11f-3c27-b58375974227) | 2026-04-01 | 2026-10-02 | TODO (CA) |

## Notes

- **Volumetric weight calculator:** ships with no default divisor. The user enters their courier's divisor. A default can be added only with a courier rate-card source in the table above.
- **Visa photo specs:** the values above were read from the official domains via search results on 2026-10-02 (this build environment could not open the government pages directly). A person must open each source, confirm the values, and put their name in `reviewedBy` here and in `core/forms/visa-photo-presets.json`. Until every preset has a reviewer, the tool is built but **not listed** on the site (AGENTS.md rule 5).
- Not used: the Indian 630 × 810 px / 250 KB online-upload figure that appears on third-party sites; no official source was found for it.
- Derived values (not official, labelled on the page): 300 DPI print resolution for printed presets; 4:5 shape and 900 × 1125 px for the UK digital preset (from the official 600 × 750 minimum).
