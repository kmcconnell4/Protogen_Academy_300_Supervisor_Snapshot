# Supervisor Snapshot

A Monday morning operational dashboard for a Clinical Care Manager overseeing community mental health caseworkers in Philadelphia. The prototype helps a supervisor see where referrals are concentrated, what care neighborhoods need, which clients need attention, and how team capacity is distributed.

## Run locally

```sh
npm install
npm run dev
```

The private prototype access password is `Protogen300!`.

The production check is:

```sh
npm run build
```

## What is included

- Global filters for referral date range, neighborhood, and caseworker
- Action-needed watchlists for contact gaps, Medicaid expirations, and waitlisted clients
- Clickable summary metrics, charts, and Philadelphia neighborhood map with detail drawers
- Sortable and paginated client lists in drill-down panels
- CSV export controls for chart data
- Responsive desktop and mobile layouts
- Keyboard focus states, chart text alternatives, and explicit empty/error states
- Lightweight session password gate before the dashboard

## Project context

- `BRIEF.md` contains the product, user, data, interaction, and visual requirements.
- `PRODUCT.md` records the user, purpose, and design principles.
- `context/` contains the case-study instructions and source context.
- `src/data/mockData.json` contains clearly labeled fictional data for the prototype, including referrals from May through September 2026.

No user accounts or live service integration are included; the password gate is a lightweight prototype access control, not production authentication.
