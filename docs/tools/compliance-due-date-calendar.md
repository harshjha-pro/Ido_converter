# Tool spec: GST and TDS Due Date Calendar

**URL:** `/ca/compliance-due-date-calendar` | **Core:** `core/ca/due-dates.ts` + `core/ca/due-dates.json` | **Phase:** 2
**Search phrase:** GST TDS due date calendar 2026-27
**Publishing:** unlisted until a CA fills `reviewedBy` in `core/ca/review.json` and `due-dates.json`.

## Dates (rules as data, each with an official source)

| Item | Due date | Source |
|---|---|---|
| GSTR-1 monthly | 11th of next month | GST portal GSTR-1 FAQ |
| GSTR-3B monthly | 20th of next month | GST portal GSTR-3B FAQ |
| GSTR-1 quarterly (QRMP) | 13th of month after quarter | GST portal GSTR-1 FAQ |
| IFF (QRMP, optional) | 13th of next month, months 1–2 of quarter | GST portal QRMP FAQ |
| PMT-06 (QRMP) | 25th of next month, months 1–2 of quarter | GST portal QRMP FAQ |
| GSTR-3B quarterly (QRMP) | 22nd (Chhattisgarh, MP, Gujarat, Maharashtra, Karnataka, Goa, Kerala, TN, Telangana, AP, DNH&DD, Puducherry, A&N, Lakshadweep) or 24th (other states/UTs) | CGST Rule 61 |
| TDS deposit (non-government) | 7th of next month; March by 30 April | Income Tax Dept: Payment of TDS and TCS |
| Quarterly TDS statements | 31 Jul, 31 Oct, 31 Jan, 31 May | Income Tax Dept: Return filing |
| Advance tax | 15 Jun (15%), 15 Sep (45%), 15 Dec (75%), 15 Mar (100%) | Income Tax portal: Tax payments |

Not included (not verified under current rules): ITR due dates, GSTR-9/9C, GSTR-4, TCS, government deductors. Extensions by notification are not tracked; the page says so. Weekend/holiday dates are not shifted.

## Output

Chronological list for the chosen FY (2026-27 or 2027-28), GST filing type and state, TDS and advance tax choices; `.ics` export (all-day events, RFC 5545 line folding), verified with the Python `icalendar` parser.
