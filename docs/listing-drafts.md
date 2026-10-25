# Listing drafts

The existing Details → Photos → Review form loses its in-memory work when it
is closed or refreshed. A grower can now explicitly save one unfinished listing
per account in this browser and resume it from **Post listing** or **New listing**.
Saving does not publish a listing or call the listing API.

Drafts contain the form fields, up to five uploaded photo URLs, the wizard step,
and a save timestamp. They do not contain authentication tokens, account profiles,
reputation, transactions, or ledger records. Drafts remain after sign-out, so the
same account can resume later. Switching accounts closes an open editor and the
other account cannot resume that draft through the UI. Shared demo accounts and
accounts without a stable ID cannot save drafts.

## Storage and recovery

- Saving is explicit, including when fields are incomplete. The UI distinguishes
  saved work from unsaved edits and offers save-and-close, keep editing, or close
  without saving. Browser reload/leave warnings protect unsaved edits where the
  browser supports them; they are not a backup.
- Data is stored unencrypted in `localStorage`, under an account-specific key.
  This is not an access-control boundary against someone with browser/device
  access. The form explains that limitation before saving. Clearing site data,
  private browsing cleanup, or using another browser/device loses these drafts.
- Reads validate the version, account, field types, category, unit, step, and
  image references. Storage accepts at most 10,000 characters per text field and
  2,048 per photo URL. Unsupported/corrupt drafts are retained until the user
  confirms discard. Storage failures leave current edits intact and show an error.
- Photos use the existing upload endpoint. Saving waits for active uploads;
  only the returned URLs are saved, not image bytes. Discard removes local draft
  data, not server uploads. Expired/deleted server photos must be reattached.
- Discard requires confirmation and resets the editor. A successful listing API
  response removes the saved draft; a failed publication preserves it. A local
  cleanup failure after successful publication is reported separately.

## NTARI scope

This is an unpublished frontend work buffer, not a shared record, member history,
or federated Plan. No draft content is sent to a record or governance layer.
Existing publication/moderation, pricing, payments, reputation, and economic rules
are unchanged. This feature makes no claim that the existing application as a
whole is JFA-conformant. The existing AGPL-3.0 license remains in force.

The design follows Fruitful's agricultural listing purpose and the SDLC planner's
observation that complex digital processes are a participation barrier. Those
older documents describe a Wix implementation; the current `seed` branch's
Next.js form and API calls determine the integration here.

References reviewed:

- [Fruitful-UI overview](https://ntari.atlassian.net/wiki/spaces/Fruitful/pages/44761089)
- [Fruitful SDLC planner](https://ntari.atlassian.net/wiki/spaces/Fruitful/pages/7799381)
- [Slack: governing repositories and contribution workflow](https://ntari.slack.com/archives/C0AENHR5KG8/p1791982812690669)
- [Slack: local agriculture purpose and DCO sign-offs on commits](https://ntari.slack.com/archives/C0AENHR5KG8/p1792416355639889)
- [JFA, including E&I frontend scope and the twelve lines](https://github.com/NTARI-RAND/Janus/blob/fc9feb47d6fa513a06bd3cbeb7b904ee7714b57d/janus-facing-architecture.md)
- [Bylaws, including privacy §2.4 and licensing §9.4](https://github.com/NTARI-RAND/bylaws/blob/424660294879e713339b7bb40da91193ff2c055d/P1-001_Bylaws_v1.0.md)

## Verification

Run `npm ci`, `npm run test:drafts`, `npm run lint`, and `npm test` (the existing
production-build check). The dependency-free Node tests cover storage recovery,
account separation, validation, credential exclusion, and storage failures.

Browser checks use synthetic accounts and controlled listing/upload API responses;
they do not publish real listings. Check save → close/reload → resume for each
step, uploaded photo restoration, unsaved-close choices, discard/cancel, switching
accounts, demo restrictions, quota errors, corrupt drafts, and failed/successful
publication. Confirm save itself makes no listing POST and publication retains
the existing request shape. Check both English and Portuguese and a narrow viewport.
