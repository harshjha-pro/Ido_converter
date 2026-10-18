# Security policy and incident response

_Also covers the secure development checklist and supply-chain practice._

## Reporting a vulnerability
Until a dedicated address exists, report security issues privately to the owner through the contact channel shown on the site. **Blocked:** a contact channel is needed (ASSUMPTIONS Q9). Please don't open public issues for vulnerabilities.

## Secure development checklist (every change)
- [ ] Inputs validated with Zod on the server; unknown fields rejected
- [ ] Parameterised queries only
- [ ] No personal data in logs; errors are generic to users
- [ ] No secrets in client code or the repo; `NEXT_PUBLIC_` used only for public values
- [ ] New dependency: justified, pinned, ≥ 14 days old, audit clean
- [ ] User-facing privacy claims still true
- [ ] Tests added for the security-relevant behaviour

## Incident response
1. **Detect:** health check failing, `rate_limited` or `db_error` spikes in logs, or a user report.
2. **Contain:** in hPanel, stop the app or remove `DATABASE_URL` (forms switch to "not available"; tools keep working). Rotate DB passwords and `IP_HASH_SECRET` if exposure is suspected.
3. **Assess:** what data (leads only?), how many, since when. Use logs with `requestId`.
4. **Recover:** fix, redeploy, verify health, restore from backup if data was altered.
5. **Notify:** if personal data was exposed, take legal advice on notifying affected people and authorities (DPDP Act obligations may apply).
6. **Learn:** add a test, update the THREAT_MODEL findings register and KNOWN_ISSUES.
