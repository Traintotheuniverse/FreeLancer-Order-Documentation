# Project And Client Filters Design

## Goal

Users need to answer: for a selected month or all time, how many orders and how many total units came from a project, a client, or both.

## Scope

- Add project and client filters to the list page.
- Keep the existing payment status and month filters.
- Apply all active filters to the summary, order list, and CSV export.
- Show both order count and quantity total in the summary.
- Improve the filter layout so the page remains clear on mobile.

## Design

The list page will use one compact filter panel below the payment status segments. It will contain three selects: month, project, and client. The project and client options come from existing orders, sorted for scanning, with an all option at the top.

Filtering is cumulative. The app first applies month, project, and client filters, then applies the selected payment status for the visible list. The summary uses the month/project/client filtered set so it can still show paid and unpaid totals for that chosen scope.

Quantity total is the sum of numeric `quantity` values in the current summary scope. Blank or invalid values count as zero. Order count remains the number of matching orders.

## Testing

Tests should cover:

- Project and client options are generated from saved orders.
- Summary totals include order count and quantity total for the selected month/project/client.
- Filtered list and CSV export use the same active project and client filters.

## Constraints

- Do not change the order storage format.
- Do not add dependencies.
- Keep the app usable as a static HTML/CSS/JS app.
- This folder is not a Git repository, so the design cannot be committed here.
