# Assumptions and open questions

| # | Assumption (safe, reversible default) | Where it's set | Needs |
|---|---|---|---|
| Q1 | Domain is `https://idoconverter.com` | `NEXT_PUBLIC_SITE_URL` (default in `lib/config.ts`) | Owner confirms the real domain and preferred host (with or without www) |
| Q2 | Hostinger passes the visitor IP in `X-Forwarded-For` | `CLIENT_IP_HEADER` | Post-deploy check (ENVIRONMENT_CONFIGURATION.md) |
| Q3 | Hostinger MySQL is MySQL 8.0.16+ or MariaDB 10.6+ | SQL syntax | Run `npm run db:verify` |
| Q4 | Node.js 20+ is available for the Web App | `engines` in package.json | hPanel check |
| Q5 | The first segment is Indian cataloguers and multi-marketplace sellers | PRD | Validation interviews |
| Q6 | Amazon India rules (pure white, 85% fill, ≥1000 px, ASIN.MAIN naming) come from Amazon staff forum posts | `lib/presets.ts` | Confirm in Seller Central help |
| Q7 | Flipkart and Meesho rules are from third-party guides | `lib/presets.ts` (labelled Unverified) | Confirm in Seller Hub / Supplier Panel |
| Q8 | The done-for-you offer promises a 24-hour turnaround and 10 free photos | Homepage copy | Owner confirms they can deliver |
| Q9 | No business name, address or legal entity is shown anywhere | Privacy, Terms | Owner details and legal review |
| Q10 | All crawlers, including AI crawlers, may read public pages | `app/robots.ts` | Owner decision (TECHNICAL_SEO.md §4) |
| Q11 | No paid plan exists yet; the site says "free during early access" | Copy, MONETIZATION.md | Pricing decision after validation |

## Open questions that block launch
1. **Contact and support channel** (WhatsApp number, or a support email). Without one there's no way for users to request deletion except by replying to us.
2. **Legal review** of the privacy notice and terms (DPDP Act applicability).
3. **Real-device testing**: an Android phone and an iPhone.
