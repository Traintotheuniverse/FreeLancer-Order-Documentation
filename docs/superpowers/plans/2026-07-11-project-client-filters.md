# Project And Client Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cumulative project and client filters, and show both order count and quantity total for the chosen scope.

**Architecture:** Keep the current single-file app structure. Add filter state and helper functions in `app.js`, add select controls in `index.html`, and restyle the existing month filter into a compact filter panel in `styles.css`.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node `assert` tests.

## Global Constraints

- Do not change localStorage order schema.
- Do not add dependencies.
- Summary, list, and CSV export must share the same active filters.
- Blank quantity values count as zero in quantity totals.
- Keep controls readable on mobile.

---

### Task 1: Filter State And Summary Behavior

**Files:**
- Modify: `tests/order-card-content.test.js`
- Modify: `app.js`

**Interfaces:**
- Produces: `scopeFilteredOrders()` returning orders filtered by month, project, and client.
- Produces: `filteredOrders()` returning scope-filtered orders plus payment status.
- Produces: `orderQuantity(order)` returning a numeric quantity total contribution.

- [ ] **Step 1: Write the failing test**

Add test data in the VM sandbox, set `state.month`, `state.project`, and `state.client`, call `renderSummary()`, and assert that the summary contains `订单数`, `数量合计`, and matching totals.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/order-card-content.test.js`
Expected: FAIL because `state.project`, `state.client`, or the new summary labels are missing.

- [ ] **Step 3: Write minimal implementation**

Add project/client state, add `scopeFilteredOrders()`, update `filteredOrders()`, and update `renderSummary()` to include order count and quantity total.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/order-card-content.test.js`
Expected: PASS.

### Task 2: Filter Controls And Layout

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.js`
- Modify: `tests/order-card-content.test.js`

**Interfaces:**
- Consumes: `scopeFilteredOrders()`.
- Produces: `renderProjectOptions()` and `renderClientFilterOptions()` for the list filters.

- [ ] **Step 1: Write the failing test**

Assert that project and client select options are rendered from order history and that changing active state affects `filteredOrders()`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/order-card-content.test.js`
Expected: FAIL because the list filter selects and render helpers do not exist.

- [ ] **Step 3: Write minimal implementation**

Add `projectFilter` and `clientFilter` selects, bind change handlers, generate options from saved orders, and reset invalid selected filters to `all`.

- [ ] **Step 4: Update layout**

Replace `.month-filter` with a reusable filter panel style that lays out three stacked rows on mobile and remains compact in the 520px shell.

- [ ] **Step 5: Run test to verify it passes**

Run: `node tests/order-card-content.test.js`
Expected: PASS.

### Task 3: Export Filename And Final Verification

**Files:**
- Modify: `app.js`
- Test: `tests/order-card-content.test.js`

**Interfaces:**
- Consumes: `filteredOrders()`.

- [ ] **Step 1: Write the failing test**

Assert that `filteredOrders()` is the source for CSV-visible data after month/project/client/payment filters are active.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/order-card-content.test.js`
Expected: FAIL until project/client filters are included in the shared filter path.

- [ ] **Step 3: Write minimal implementation**

Ensure CSV uses `filteredOrders()` and include project/client filter names in the exported filename.

- [ ] **Step 4: Run final verification**

Run: `node tests/order-card-content.test.js`
Expected: PASS.
