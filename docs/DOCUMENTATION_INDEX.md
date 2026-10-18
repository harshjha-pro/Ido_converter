# Documentation index

One source of truth per subject. Requested documents that would have duplicated another are mapped to where their content lives.

| Document | Purpose | Status |
|---|---|---|
| [../README.md](../README.md) | Overview, setup, commands, deployment summary | Current |
| [../backend.md](../backend.md) | Backend architecture as implemented | Current |
| [PROJECT_AUDIT.md](PROJECT_AUDIT.md) | Baseline, findings by severity, quality gates | Current |
| [ASSUMPTIONS_AND_OPEN_QUESTIONS.md](ASSUMPTIONS_AND_OPEN_QUESTIONS.md) | Defaults in effect, blockers | Current |
| [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) | What's done, blocked, next; verdict | Current |
| [PRD.md](PRD.md) | Vision, personas, journeys, MVP scope (MoSCoW), user stories, metrics | Current |
| [FEATURE_CATALOG.md](FEATURE_CATALOG.md) | Feature matrix with status and test traceability | Current |
| [ROADMAP.md](ROADMAP.md) | Gated phases; future AI requirements | Current |
| [MONETIZATION.md](MONETIZATION.md) | Pricing hypotheses and costs | Hypotheses |
| [VALIDATION_PLAN.md](VALIDATION_PLAN.md) | 14-day plan and thresholds | Current |
| [PRODUCT_ANALYTICS.md](PRODUCT_ANALYTICS.md) | Events actually collected, funnel | Current |
| [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) | System, routes, components, image pipeline | Current |
| [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) | ADR-1…12 | Current |
| [TECH_STACK.md](TECH_STACK.md) | Technologies, versions, alternatives | Current |
| [DATABASE_DESIGN.md](DATABASE_DESIGN.md) | Schema, retention, backup, future tables | Current |
| [API_SPECIFICATION.md](API_SPECIFICATION.md) | Endpoint contracts and errors | Current |
| [BACKEND_SECURITY.md](BACKEND_SECURITY.md) | API controls with evidence | Current |
| [DESIGN.md](DESIGN.md) | Design system ("Inspection desk"): tokens, components | Current |
| [UX_STATES_AND_ERRORS.md](UX_STATES_AND_ERRORS.md) | Empty, loading, success and error states; error handling | Current |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | WCAG target, evidence, responsive behaviour | Current |
| [CONTENT_STYLE_GUIDE.md](CONTENT_STYLE_GUIDE.md) | Voice, claims, wording | Current |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Setup, coding standards, dependency policy, contributing | Current |
| [TEST_STRATEGY.md](TEST_STRATEGY.md) | Layers, scope, negative cases | Current |
| [TEST_RESULTS.md](TEST_RESULTS.md) | Actual results, defects fixed, not executed | Current |
| [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) | Release, manual regression, smoke tests | Current |
| [GO_LIVE_STEPS.md](GO_LIVE_STEPS.md) | Click-by-click go-live for the owner (hPanel, phpMyAdmin, checks) | Current |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Hostinger + MySQL deployment | Current |
| [ENVIRONMENT_CONFIGURATION.md](ENVIRONMENT_CONFIGURATION.md) | Variables (names only), DB users, IP header check | Current |
| [OPERATIONS.md](OPERATIONS.md) | Monitoring, logging, backup, rollback, restore, scaling | Current |
| [THREAT_MODEL.md](THREAT_MODEL.md) | Threats, mitigations, findings register | Current |
| [SECURITY_POLICY.md](SECURITY_POLICY.md) | Reporting, secure development checklist, incident response | Current (contact blocked) |
| [DATA_RETENTION.md](DATA_RETENTION.md) | What's kept, how long, deletion | Current |
| [LEGAL_READINESS.md](LEGAL_READINESS.md) | Legal drafts and gaps | Drafts, need review |
| [SEO_STRATEGY.md](SEO_STRATEGY.md) | Strategy, keyword map, page briefs, linking, content plan, launch checklist | Keywords unvalidated |
| [TECHNICAL_SEO.md](TECHNICAL_SEO.md) | Technical SEO, structured data, crawler policy | Current |
| [KNOWN_ISSUES.md](KNOWN_ISSUES.md) | Limitations and workarounds | Current |
| [CHANGELOG.md](CHANGELOG.md) | Release history | Current |
| [../database/README.md](../database/README.md) | Migrations, scripts, verification | Current |

## Requested names → where the content lives
| Requested | See |
|---|---|
| PRODUCT_VISION, PERSONAS_AND_JOURNEYS, MVP_SCOPE, USER_STORIES | PRD.md §1–5 |
| REQUIREMENTS_TRACEABILITY | FEATURE_CATALOG.md (tests column) + PRD.md §5 |
| ROUTES_AND_INFORMATION_ARCHITECTURE, COMPONENT_ARCHITECTURE, IMAGE_PROCESSING_PIPELINE | TECHNICAL_ARCHITECTURE.md §2–4 |
| DATA_MODEL, BACKUP_AND_RESTORE | DATABASE_DESIGN.md, OPERATIONS.md |
| ERROR_HANDLING, EMPTY_LOADING_ERROR_SUCCESS_STATES, UX_FLOWS | UX_STATES_AND_ERRORS.md, PRD.md §3 |
| DESIGN_BRIEF, DESIGN_SYSTEM | DESIGN.md |
| RESPONSIVE_DESIGN | ACCESSIBILITY.md |
| DEPENDENCY_POLICY, CODING_STANDARDS, DEVELOPMENT_SETUP, CONTRIBUTING | DEVELOPMENT.md |
| TEST_PLAN, REGRESSION_CHECKLIST | TEST_STRATEGY.md, RELEASE_CHECKLIST.md |
| ROLLBACK_AND_RECOVERY, MONITORING_AND_LOGGING | OPERATIONS.md |
| SECURE_DEVELOPMENT_CHECKLIST, INCIDENT_RESPONSE, DEPENDENCY_AND_SUPPLY_CHAIN_SECURITY | SECURITY_POLICY.md, DEVELOPMENT.md |
| FILE_UPLOAD_SECURITY | THREAT_MODEL.md S1, S2, S11 (files never reach the server) |
| PRIVACY_AND_DATA_HANDLING | DATA_RETENTION.md + `/privacy` |
| SEO_KEYWORD_MAP, SEO_PAGE_BRIEFS, INTERNAL_LINKING, SEO_CONTENT_PLAN, SEO_LAUNCH_CHECKLIST | SEO_STRATEGY.md |
| STRUCTURED_DATA | TECHNICAL_SEO.md |

## Not created (not applicable yet)
| Requested | Why |
|---|---|
| AI_INTEGRATION.md | No AI is integrated. Future requirements are in ROADMAP.md |
| AUTHENTICATION.md, AUTHORIZATION_AND_ACCESS_CONTROL.md | No accounts or protected resources |
