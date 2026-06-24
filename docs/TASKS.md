# Development Tasks: My Money

**Total tasks:** 11
**Generated:** 2026-06-24
**Parallel planning:** shared prerequisites first, then fan out by workstream and parallel group

---

## Workstream Summary

| Workstream | Goal                                                                              | Can start after                                            | Notes                                                               |
| ---------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| Contracts  | Freeze domain contracts for wallet, transactions, banks, and derived calculations | none                                                       | Feeds all downstream data and UI tasks                              |
| Data       | Deliver persistent IndexedDB storage and derived financial selectors              | TASK-001                                                   | Enables real data wiring for frontend tasks                         |
| Frontend   | Deliver screens and user interactions for setup, entry, editing, and summaries    | TASK-001                                                   | Can use mocks early, then bind to real stores after data tasks land |
| Infra      | Deliver static deployment and environment configuration                           | TASK-001                                                   | Can proceed in parallel with implementation work                    |
| QA         | Deliver focused automated validation for domain, persistence, and user flows      | TASK-002, TASK-003, TASK-006, TASK-007, TASK-008, TASK-009 | Verifies core behavior without redefining scope                     |

## Task Format

Each task follows this structure:

Each task maps to exactly one execution payload and one isolated output directory. `parallel_group` decides scheduling order only; it does not allow later orchestration to merge sibling tasks back together.

---

## Tasks

### TASK-001: Domain contracts define wallet, transaction, and allowance rules

**Area:** Data
**Workstream:** Contracts
**Parallel Group:** PG-0
**Owner Role:** Full-stack developer
**Size:** S
**Depends on:** none
**Execution Output Dir:** [project-root]/modules/task-001/
**Produces:** typed domain model contract, bank enum contract, derived-calculation contract
**Consumes:** none

**Description:**
Create the canonical TypeScript domain contracts for wallet funding events, expense transactions, supported bank/payment method values, target-date settings, and derived financial metrics. This task also fixes the inclusive day-count rule and the formulas that downstream code must follow for wallet balance, monthly card payable totals, and daily spend allowance.

**Acceptance Criteria:**

- [ ] Type definitions exist for wallet state, transaction records, supported banks, target-date settings, and derived summary outputs
- [ ] Blank payment method is explicitly represented as cash in the domain contract
- [ ] The inclusive day-count rule and daily allowance formula are documented in code-level contracts or tests
- [ ] Downstream tasks can consume the exported types without redefining business rules

---

### TASK-002: Dexie schema persists wallet, settings, and transaction records

**Area:** Data
**Workstream:** Data
**Parallel Group:** PG-1
**Owner Role:** Full-stack developer
**Size:** S
**Depends on:** TASK-001
**Execution Output Dir:** [project-root]/modules/task-002/
**Produces:** Dexie database instance, table schema, versioned migration scaffold
**Consumes:** typed domain model contract

**Description:**
Implement the IndexedDB persistence layer with Dexie tables for wallet-related state, target-date settings, and transaction records. The schema must be versioned so future data changes can be introduced through Dexie migrations without resetting user data.

**Acceptance Criteria:**

- [ ] Dexie database and tables are created for the agreed domain entities
- [ ] The initial schema is defined through a versioned migration entry
- [ ] Records can be inserted and read back through the database layer without using raw IndexedDB APIs elsewhere
- [ ] The persistence layer compiles cleanly in the SvelteKit project

---

### TASK-003: Financial selectors compute balance, card totals, and daily allowance

**Area:** Data
**Workstream:** Data
**Parallel Group:** PG-1
**Owner Role:** Full-stack developer
**Size:** S
**Depends on:** TASK-001
**Execution Output Dir:** [project-root]/modules/task-003/
**Produces:** pure calculation helpers/selectors
**Consumes:** typed domain model contract

**Description:**
Implement the pure business-logic helpers that compute current wallet balance, monthly credit-card payable totals, remaining inclusive days to a target date, and daily spend allowance. These selectors must be reusable from both tests and UI-facing stores.

**Acceptance Criteria:**

- [ ] Wallet balance calculation reflects initial funding plus later deposits minus recorded expenses
- [ ] Monthly card totals count only transactions assigned to a supported bank
- [ ] Remaining days are calculated inclusively for today and the target date
- [ ] Daily allowance returns a predictable value for valid target dates and defined wallet balance inputs

---

### TASK-004: Mock repositories support early UI development

**Area:** Frontend
**Workstream:** Frontend
**Parallel Group:** PG-1
**Owner Role:** Frontend developer
**Size:** S
**Depends on:** TASK-001
**Execution Output Dir:** [project-root]/modules/task-004/
**Produces:** mock repository adapter, sample fixture data
**Consumes:** typed domain model contract

**Description:**
Provide mock-backed data adapters and representative fixtures that conform to the same contracts as the real data layer. This lets UI tasks proceed before Dexie wiring is complete while preserving the eventual integration boundary.

**Acceptance Criteria:**

- [ ] Mock data covers wallet amount, target date, cash transactions, and card transactions
- [ ] The adapter exposes the same contract shape expected from the real data-access layer
- [ ] UI tasks can render against the mock adapter without custom per-screen fixtures
- [ ] Replacing the mock adapter with the real repository does not require changing domain types

---

### TASK-005: Static deployment config publishes the SPA to GitHub Pages

**Area:** Infra
**Workstream:** Infra
**Parallel Group:** PG-1
**Owner Role:** Platform developer
**Size:** S
**Depends on:** TASK-001
**Execution Output Dir:** [project-root]/modules/task-005/
**Produces:** SvelteKit static deployment configuration, GitHub Actions deployment workflow contract
**Consumes:** existing repository build scripts

**Description:**
Configure the existing SvelteKit project for static output suitable for GitHub Pages and define the GitHub Actions workflow that builds from the main branch and deploys the generated site. The task should also capture any required base-path or environment assumptions for the repository.

**Acceptance Criteria:**

- [ ] The project is configured for static-site output compatible with GitHub Pages
- [ ] A GitHub Actions workflow exists for build and deploy from the main branch
- [ ] The deployment configuration is consistent with the repository target specified for main
- [ ] The setup documents any repository-specific path or base URL requirement needed for publishing

---

### TASK-006: App shell exposes dashboard, entry, and history layout

**Area:** Frontend
**Workstream:** Frontend
**Parallel Group:** PG-2
**Owner Role:** Frontend developer
**Size:** S
**Depends on:** TASK-001, TASK-004
**Execution Output Dir:** [project-root]/modules/task-006/
**Produces:** route structure, page layout contract, shared UI skeleton
**Consumes:** typed domain model contract, mock repository adapter

**Description:**
Build the top-level route structure and page layout for the money dashboard, transaction entry flow, and editable history view using Skeleton components. This task establishes the stable UI composition that later tasks populate with real interactions and data.

**Acceptance Criteria:**

- [ ] The app has a coherent route/page structure for setup, recording, and reviewing data
- [ ] Shared layout components render correctly with mock-backed content
- [ ] Skeleton-based visual primitives are wired into the app shell
- [ ] The route structure is stable enough for downstream form and summary tasks to target

---

### TASK-007: Wallet and target-date controls manage available budget inputs

**Area:** Frontend
**Workstream:** Frontend
**Parallel Group:** PG-2
**Owner Role:** Frontend developer
**Size:** S
**Depends on:** TASK-001, TASK-004, TASK-006
**Execution Output Dir:** [project-root]/modules/task-007/
**Produces:** wallet setup UI, deposit UI, target-date settings UI
**Consumes:** route structure, typed domain model contract, mock repository adapter

**Description:**
Implement the controls that let the user set the initial wallet amount, add money later, and set or change the future target date used for daily allowance calculations. The UI must make the current configured values visible and editable.

**Acceptance Criteria:**

- [ ] The user can set an initial wallet amount with a default starting state of 0
- [ ] The user can add more money after initial setup without re-entering the entire balance history
- [ ] The user can create or update the target date from the UI
- [ ] Input states and displayed values stay consistent with the active repository adapter

---

### TASK-008: Transaction form records cash and card expenses

**Area:** Frontend
**Workstream:** Frontend
**Parallel Group:** PG-2
**Owner Role:** Frontend developer
**Size:** S
**Depends on:** TASK-001, TASK-004, TASK-006
**Execution Output Dir:** [project-root]/modules/task-008/
**Produces:** transaction entry form, payment-method selector contract
**Consumes:** route structure, typed domain model contract, mock repository adapter

**Description:**
Build the transaction entry form for date, detail, amount, and payment method selection. The form must default the date to today, default payment method to cash when left blank, and support the defined list of bank-backed card options.

**Acceptance Criteria:**

- [ ] New transaction input defaults the date field to today
- [ ] The form captures detail, amount, and payment method without requiring extra fields
- [ ] Blank payment method is saved as cash behavior rather than as an invalid state
- [ ] Supported card-bank choices are limited to CTBC, E.SUN, Taishin, Fubon, and DBS

---

### TASK-009: Transaction history supports editing existing entries

**Area:** Frontend
**Workstream:** Frontend
**Parallel Group:** PG-2
**Owner Role:** Frontend developer
**Size:** S
**Depends on:** TASK-001, TASK-004, TASK-006
**Execution Output Dir:** [project-root]/modules/task-009/
**Produces:** transaction history UI, edit interaction contract
**Consumes:** route structure, typed domain model contract, mock repository adapter

**Description:**
Implement the history/list view that displays recorded entries and lets the user revise a transaction when it was entered incorrectly. The task covers selection, editing, and update feedback in the UI.

**Acceptance Criteria:**

- [ ] Existing transactions are listed in a reviewable history view
- [ ] The user can open a recorded transaction and change its stored values
- [ ] Updated values are reflected in the rendered history without requiring a page reload
- [ ] The editing flow uses the same domain rules as new transaction creation

---

### TASK-010: Summary widgets surface wallet balance, card payables, and daily allowance

**Area:** Frontend
**Workstream:** Frontend
**Parallel Group:** PG-3
**Owner Role:** Frontend developer
**Size:** S
**Depends on:** TASK-003, TASK-006, TASK-007, TASK-008, TASK-009
**Execution Output Dir:** [project-root]/modules/task-010/
**Produces:** dashboard summary widgets
**Consumes:** calculation helpers/selectors, route structure, wallet inputs, transaction data

**Description:**
Build the summary area that displays current wallet balance, monthly card payable totals, remaining days to the target date, and the per-day spend allowance. This task focuses on presenting derived values clearly from the already-defined calculations.

**Acceptance Criteria:**

- [ ] Current wallet balance is visible in the dashboard summary
- [ ] Monthly credit-card payable totals are visible from recorded card transactions
- [ ] Remaining inclusive days to the target date are displayed
- [ ] Daily spend allowance is shown from current wallet balance divided by remaining days

---

### TASK-011: Automated tests cover domain rules, persistence, and core user flow

**Area:** Testing
**Workstream:** QA
**Parallel Group:** PG-3
**Owner Role:** QA
**Size:** M
**Depends on:** TASK-002, TASK-003, TASK-007, TASK-008, TASK-009, TASK-010
**Execution Output Dir:** [project-root]/modules/task-011/
**Produces:** unit test suite, persistence tests, e2e smoke coverage
**Consumes:** Dexie schema, calculation helpers, UI flows

**Description:**
Add automated coverage for the highest-risk MVP behaviors: balance calculations, inclusive day counts, card monthly totals, persistence through Dexie, and the end-to-end flow of adding funds, recording a transaction, editing it, and observing updated summary values.

**Acceptance Criteria:**

- [ ] Unit tests verify balance, card-total, and daily-allowance calculations including the inclusive date rule
- [ ] Data-layer tests verify records persist and can be updated through the Dexie repository layer
- [ ] A smoke e2e flow covers funding, transaction entry, transaction edit, and summary updates
- [ ] The core automated checks run through the repository's existing test tooling
