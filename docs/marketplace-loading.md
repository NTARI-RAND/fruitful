# Marketplace loading and recovery

The marketplace distinguishes loading, successful results, a successful empty
result, and a failed request. Network errors and rejected HTTP responses show an
accessible error message with **Try again** instead of demo inventory. The error
and retry action are translated into English and Portuguese. A failed request
shows neither listing cards nor a misleading zero-results count.

Retry uses the current category, state, price inputs and search text. These
controls and the selected sort option remain in place. A successful retry shows
the API's listings; a successful empty response uses the existing empty state.
The API's existing array and `{ listings: [...] }` response shapes remain
supported. An unexpected response shape shows the recoverable error state.

A request generation prevents earlier results or failures from replacing a
newer request's state. Category/state/sort changes and unmount invalidate older
completions. This does not cancel already-started network requests. Search text
filters the current result set once, so a request's old search text does not
permanently discard matching results before rendering.

The demo catalogue was removed from this page. No separate marketplace demo
mode is introduced. Other application demo surfaces are outside this change.
Categories, pricing, payment rules, listing publication, saved drafts and the
existing listing endpoint/query contract retain their behavior.

## Verification

```sh
npm ci
npx playwright install chromium
npm run test:marketplace
npm run test:drafts
npm run lint
npm test
```

The marketplace suite starts and stops its own Next.js development server and
headless Chromium. It uses isolated browser contexts, synthetic listing data,
and controlled API responses at a local fixture path. It does not need a live
backend or credentials and does not publish listings. External HTTPS resources
are blocked during these tests to keep font/image availability independent of
the behavior under test.

Browser checks cover network errors, 401 and 500 responses, empty results,
recovery with retained filters, older successes/failures arriving after a newer
category selection, raw-array responses, unexpected payloads, and Portuguese at
a narrow viewport. The existing draft suite and production build remain
regression obligations. On Linux, Chromium may also need the system dependencies
installed by `npx playwright install --with-deps chromium`.

## Integration and NTARI scope

The existing [marketplace rewrite](https://github.com/NTARI-RAND/fruitful/pull/2)
changes this surface and its endpoint naming. Preserve the failure/empty
separation, retry action and stale-response guard when integrating that work;
these changes do not depend on merging the rewrite first.

This is frontend recovery behavior. It creates no shared records, changes no
covenant or settlement rules, sends no request contents to governance, and makes
no claim of full-application JFA conformance. Contributions remain fork-based,
with signed, DCO-signed-off commits and independent human review, following the
[NTARI Bug-Build-Test workflow](https://ntari.slack.com/docs/T0978JCFFSL/F0C9PQT2WTW).
