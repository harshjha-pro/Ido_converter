# Tool spec: GSTR-2B JSON to Excel (multi-month)

**URL:** `/ca/gstr-2b-json-to-excel` | **Core:** `core/ca/gstr2b-to-excel.ts`, `core/shared/xlsx.ts` | **Phase:** 2
**Search phrase:** GSTR-2B JSON to Excel multiple months
**Publishing:** unlisted until a CA fills `reviewedBy` in `core/ca/review.json` (AGENTS.md rule 5).

## What it does

Reads one or more GSTR-2B JSON files downloaded from the GST portal and writes one `.xlsx` workbook: a **Summary** sheet (documents and tax totals per month and section) and one sheet per section, months merged and sorted. It calculates no tax and decides no eligibility.

## Input format (from the portal's GSTR-2B JSON)

`{ data: { gstin, rtnprd: "MMYYYY", docdata: { b2b, b2ba, cdnr, cdnra, isd, impg, impgsez, … } } }` (also accepted without the outer `data`). Party records hold `ctin`, `trdnm`, `supprd`, `supfildt` and a document list (`inv` for B2B/B2BA, `nt` for CDNR/CDNRA, `doclist` for ISD). Documents hold `inum`/`ntnum`, `dt`, `val`, `pos`, `rev`, `itcavl`, `rsn`, `diffprcnt`, `srctyp`, `irn`, `irngendate`, `txval`, `igst`, `cgst`, `sgst`, `cess`.

**This is a data format, not a tax rule.** It was taken from the portal's published structure and checked against a third-party converter, not against a real downloaded file. **Verify with a real GSTR-2B JSON before listing the tool.** Unknown sections are named in the result, never dropped silently.

## Output

Columns per section are listed in the code (`SECTIONS`). Amounts stay numbers; Y/N become Yes/No; note type C/D becomes Credit/Debit note; periods read "Apr 2026". Credit notes keep their reported (positive) amounts; the Summary is a convenience total, not the official ITC summary.

## Excel writer

`core/shared/xlsx.ts` writes a standard Office Open XML workbook (zip with stored entries, inline strings, bold frozen header, column widths) so no spreadsheet library is needed. Verified by opening the output with openpyxl.

## Edge cases

No files, invalid JSON, non-GSTR-2B JSON, all-empty sections → clear errors. Duplicate months and mixed GSTINs → warnings. 5,000 invoices in one month works.

## Samples (`tests/fixtures/gstr2b-to-excel/`)

`gstr2b-042026.json` (B2B incl. reverse charge and ITC not available, CDNR credit note, IMPG, unsupported `ecom`), `gstr2b-052026.json` (B2B, B2BA, no outer wrapper fields).
