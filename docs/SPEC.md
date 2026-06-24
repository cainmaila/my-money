# System Specification: My Money

**Generated:** 2026-06-24
**Status:** Draft

---

## 1. Overview

My Money is a single-user personal cashflow tracker built as a static SPA inside the existing SvelteKit project. It helps the user record expenses, track current wallet balance, calculate monthly credit-card payable totals, and derive a daily spend allowance from a user-defined future target date.

---

## 2. Technical Stack

| Layer               | Decision                   | Notes                                            |
| ------------------- | -------------------------- | ------------------------------------------------ |
| Language            | TypeScript                 | version: 6.x from current project                |
| Backend Framework   | N/A                        | static SPA only                                  |
| Frontend Framework  | SvelteKit                  | existing repository project                      |
| Database            | IndexedDB                  | ORM: Dexie.js                                    |
| Cache               | none                       | all persistent state stored locally in IndexedDB |
| Migration strategy  | Dexie versioned migrations | code-first schema evolution                      |
| Auth method         | none                       | single-user local-only app                       |
| Authorization model | none                       | no auth layer                                    |
| Infrastructure      | GitHub Pages               | Containers: no                                   |
| Environments        | dev, main                  | main deploys to GitHub Pages                     |
| CI/CD               | GitHub Actions             | build and deploy static site                     |

---

## 3. Architecture Overview

The app is a client-only SvelteKit SPA composed of a typed domain layer, a Dexie-backed persistence layer, derived calculation services, and route-level Svelte UI components styled with Skeleton. User input updates wallet and transaction records in IndexedDB, and derived selectors calculate current wallet balance, per-bank monthly credit-card payable totals, remaining days to the target date, and the daily spend allowance using an inclusive date-count rule.

---

## 4. Integrations

None.

---

## 5. Constraints

- **Team:** 1 developer, AI-assisted implementation
- **Deadline:** none stated
- **Budget:** local-first, 0 cost
- **Repo structure:** monorepo
- **Existing codebase:** yes: implement inside the current SvelteKit repository
- **Compliance:** none
- **Must-use tech:** SvelteKit, Skeleton, IndexedDB, Dexie.js, GitHub Pages, GitHub Actions
- **Forbidden tech:** none

---

## 6. Non-Functional Requirements

- **Scale target:** single-user local app, normal personal-finance record volume
- **Response time target:** general interactions should feel immediate on local device
- **Availability SLA:** not specified
- **Observability:** none

---

## 7. MVP Scope

Features included in MVP:

- Set an initial wallet amount, defaulting to 0, and add funds manually
- Record expense entries with date, detail, amount, and payment method
- Treat blank payment method as cash
- Treat a selected bank as credit-card spending, with supported banks: CTBC, E.SUN, Taishin, Fubon, DBS
- Subtract each recorded expense from the current wallet balance
- Edit existing transaction records when an entry was entered incorrectly
- Aggregate monthly credit-card payable totals by recorded card transactions
- Let the user set a future target date
- Calculate remaining days from today to the target date using an inclusive count of both today and the target date
- Calculate daily spend allowance as current wallet balance divided by remaining days

Features deferred:

- None — all currently defined features are included in MVP

---

## 8. Parallel Development Plan

- **Expected parallel developers:** 1
- **Split strategy:** by layer
- **Contract-first boundaries:** none explicitly requested; define data schema, type models, and route structure early
- **Mock/stub policy:** allowed
- **Integration checkpoints:** complete and verify the foundation layer before integrating downstream UI/features

---

## 9. Open Risks

| Risk                      | Impact | Mitigation |
| ------------------------- | ------ | ---------- |
| None currently identified | L      | none       |
