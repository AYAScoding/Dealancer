# Dealancer Frontend

## Design foundation

- Shared workspace navigation for clients and freelancers lives in `src/components/AppShell.jsx`.
- Theme tokens, responsive layout rules, and reduced-motion support live in `src/index.css`.
- Reusable buttons, surfaces, badges, feedback states, tabs, and accessible native-dialog drawers live in `src/components/ui.jsx`.
- The light/dark preference is stored separately from authentication as `dealancer-theme`.
- Existing authentication, profile, and job-post forms retain their backend contracts. The `.legacy-page` adapter brings these forms into the new theme without replacing their validation logic.
- The unused Vite starter stylesheet was removed. Profile navigation is now owned by the shared shell.

## Data and actions

- Dashboard counts are calculated from the current user's jobs, bids, and contracts, including paginated API results. Contract value is not represented as paid earnings.
- Marketplace filters and sorting are functional and stored in the URL. The current implementation loads the collection before filtering; move to server-side pagination/filtering when volume warrants it.
- Clients can open their jobs, review proposals, and accept a bid. If acceptance returns an error after saving, the frontend reloads the job and checks the accepted bid before displaying a failure.
- Both roles can review their contracts and confirm completion or cancellation through the existing contract endpoints.
- Proposal submission uses the returned bid instead of creating a temporary fake bid.
- Public copy does not claim unimplemented payments, verification badges, partner relationships, or live marketplace statistics.

## Development and verification

From `Frontend`:

```powershell
npm run dev
npm run build
npm run lint
npm run test:ui
```

The browser suite uses Microsoft Edge and port 5174. It can start Vite itself or reuse an existing server at that address. Tests intercept API requests with isolated fixtures; they do not mutate the development database. Screenshots are written to ignored `test-results/`.

Run a separate manual check against Django with real client and freelancer accounts before release. Browser fixtures validate frontend workflows, not backend authorization, email delivery, payment processing, or database consistency.

Existing lint findings remain in untouched authentication files (unused imports, context fast-refresh organization, and synchronous state updates inside effects). Dependency audit findings also require a separate upgrade review; no forced dependency upgrades were applied.

## Asset

`public/workspace.jpg` is a locally served workspace photograph from Unsplash:
https://images.unsplash.com/photo-1497366754035-f200968a6e72

## Follow-up priorities

1. Verify real-account hiring, profile saves, and contract transitions with the local backend.
2. Resolve the remaining authentication lint and dependency-audit findings.
3. Add server-paginated dashboard summaries as the dataset grows.
4. Build messaging, reviews, and payments only when their backend workflows are ready; avoid presenting static placeholders as working features.
