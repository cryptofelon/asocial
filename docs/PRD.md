# asocial Product Requirements Document

**Status:** Draft for implementation
**Product:** asocial
**Initial platform:** Chrome on desktop
**Last updated:** 2026-08-13

## 1. Summary

asocial is an attention-control browser extension for X. It lets an authenticated X user keep publishing through X's official web interface while choosing how much social feedback the interface exposes.

It is not a replacement X client. It does not call the X API, automate posting, or reproduce X data. It modifies the presentation and navigation of `x.com` in the user's browser.

The product has three mutually exclusive modes:

1. **Write-only:** a journal-like writing surface. The user can compose and publish through X, but timelines, profiles, notifications, messages, replies, and other reading surfaces remain hidden.
2. **Low-dopamine:** X remains usable, but vanity metrics and configurable attention triggers are removed or quieted.
3. **Normal:** X is unchanged.

> Write-only is journal-like, not private. A post still uses the audience and privacy controls of the user's X account. asocial does not make a public post private.

## 2. Problem

X couples expression with feedback consumption. A user who opens X to write is immediately exposed to timelines, follower counts, engagement counts, view counts, notifications, recommendations, and commercial prompts. Those surfaces can turn writing into performance measurement and can discourage authentic posting.

The target user wants to:

- publish without first consuming a feed;
- stop monitoring whether a post gained or lost engagement;
- retain useful social functions when intentionally choosing them;
- avoid bright, counted notification cues;
- return to ordinary X instantly when desired;
- keep their X credentials, audience controls, and posting flow inside X.

## 3. Product thesis

asocial should be an **attention firewall around X**, not a new social network and not an unofficial API client.

This approach has four advantages:

- X continues to own authentication and posting.
- No X API access or developer account is required.
- The extension can ship without a server or collection of post content.
- The same behavior engine can later target Firefox and Safari WebExtensions.

The cost is ongoing maintenance when X changes its DOM. The product must treat DOM adaptation as a first-class subsystem rather than scattering selectors through UI code.

## 4. Goals

### G1 — Uninterrupted expression

A user in write-only mode can reopen X, compose, attach media using X's own composer, select X's native audience settings, publish or continue a thread, and remain in the journal without seeing readable X content.

### G2 — Remove self-evaluation loops

A user in low-dopamine mode cannot see their own numeric engagement or view metrics. Profile relationship summaries are hidden entirely so following decisions can be based on content rather than social proof.

### G3 — Preserve intentional actions

Hiding counts must not remove the reply, repost/quote, like, bookmark, follow, or share controls. X's existing repost control and quote-post menu remain intact.

### G4 — Configurable calm

The user can extend metric hiding to all profiles and posts, independently quiet notifications and messages, and independently control Mentions, trends, recommended posts, and account suggestions.

### G5 — Persistent and instant control

The selected mode persists across tab closure and browser restart. Normal restores the unmodified X interface without requiring extension removal or a browser restart.

### G6 — Private by architecture

asocial has no backend, telemetry, analytics, remote configuration, account database, or storage of post text. These are permanent product constraints, not merely MVP omissions.

## 5. Non-goals for MVP

- A standalone X client or recreation of the X timeline.
- Direct X API, private API, GraphQL, or network interception.
- Preventing X itself from fetching timeline data. asocial prevents rendering/exposure; it does not alter X's private request graph.
- Automated posting, scheduling, engagement, following, or messaging.
- A private journal, local post archive, draft backup, or cross-posting service.
- Changing who can see a post or hiding engagement from other X users.
- Filtering the notification badge to “replies only.” X exposes an aggregate badge; reliably categorizing it would require data asocial should not fetch.
- Changing Chrome or operating-system notification permissions.
- An ad blocker or anti-tracking product.
- Native iOS or Android applications.
- Team accounts, enterprise policy, cloud-synced preferences, or per-account settings.

## 6. Users and jobs

### Primary user

An authenticated X user on desktop Chrome who wants to write more freely and stop treating posting as a performance dashboard.

### Jobs to be done

- **When I have something to say,** let me publish it without making me enter a feed.
- **When I intentionally browse X,** let me interact without showing me a scoreboard about myself.
- **When I need context or messages,** let me deliberately restore access without uninstalling anything.
- **When X changes,** fail calmly: protect write-only mode and preserve actions before attempting cosmetic precision.

## 7. Product principles

1. **Expression before engagement.** Writing is the primary action.
2. **Hide numbers, not capabilities.** Action buttons remain usable when their counts are hidden.
3. **No surprise privacy claims.** X's audience settings still govern every post.
4. **No content custody.** Do not retain, transmit, or analyze post text.
5. **Opinionated defaults, explicit escape hatch.** Low-dopamine starts calm; Normal is always one toolbar action away.
6. **Fail calm.** Uncertain metric markup is hidden; uncertain action controls are left intact.
7. **No false precision.** If X does not expose reply-only badge data in the DOM, the product does not pretend it can.
8. **No attention leak.** A persisted restrictive mode applies before X content is revealed.
9. **Minimum authority.** Request only permissions required for the current behavior.
10. **No surveillance business model.** No backend, telemetry, analytics, tracking pixels, remote configuration, or usage counters will be added.

## 8. Modes

### 8.1 Normal

Normal mode makes no visible or navigational changes to X.

Requirements:

- Remove every asocial overlay, annotation, style state, and route guard.
- Do not hide, redirect, reorder, click, or restyle X content.
- Keep only the extension toolbar popup available.
- Make Normal the first-install default until onboarding explicitly changes it.

### 8.2 Low-dopamine

Low-dopamine keeps reading and interaction available while reducing feedback and commercial pressure.

#### Required default behavior

- Detect the active X account automatically from the current page; do not ask for or persist handles.
- Hide the active user's total post count where X shows it as a profile/header metric.
- Hide numeric reply, repost, like, bookmark, and view metrics on the active user's posts.
- Hide numeric summaries for those metrics on a focused post page.
- Hide Following and Followers summary links entirely on profiles.
- Preserve reply, repost/quote, like, bookmark, follow, and share controls.
- Hide direct profile/post analytics entry points shown only to the post owner.
- Keep Notifications, Mentions, and Messages navigation available by default.
- Quiet Notifications and Messages by hiding their unread dots/counts by default.
- Hide trends, recommended posts, account suggestions, and premium/analytics upsells by default.
- Do not otherwise change the selected timeline or algorithm.

#### Metric scope

- **My metrics** (default): hide metrics for the automatically detected active account. If active-account signals disagree or ownership cannot be classified safely, hide the numeric metric but preserve its action.
- **All metrics:** hide numeric engagement/view metrics across X while preserving applicable actions.

Following and Followers summary links are controlled separately and hidden globally by the low-dopamine default.

#### Attention settings

| Setting | Values | Low-dopamine default | Meaning |
|---|---|---:|---|
| Metric scope | My metrics / All metrics | My metrics | Whose post vanity metrics are hidden |
| Profile relationship links | Shown / Hidden | Hidden | Controls Following and Followers summary links on profiles |
| Notifications | Normal / Quiet / Hidden | Quiet | Quiet keeps nav but removes badges; Hidden removes nav |
| Mentions & replies shortcut | Shown / Hidden | Shown | Controls a direct shortcut to `/notifications/mentions`; removable independently |
| Messages | Normal / Quiet / Hidden | Quiet | Quiet keeps nav but removes badges; Hidden removes nav |
| Trends | Shown / Hidden | Hidden | Controls trending-topic surfaces |
| Recommended posts | Shown / Hidden | Hidden | Controls algorithmically suggested posts where they can be classified safely |
| Account suggestions | Shown / Hidden | Hidden | Controls “who to follow” and similar account recommendations |
| Premium and analytics prompts | Shown / Hidden | Hidden | Controls commercial/scoreboard prompts |

Changing these settings does not alter write-only's stricter guarantees.

### 8.3 Write-only

Write-only is the persistent journal mode. It must not depend on fragile per-component hiding. The extension owns a simple journal shell and reveals only narrowly classified native X controls.

#### Allowed surfaces

- asocial's journal shell.
- X's native post composer and its necessary descendants:
  - text editor;
  - media attachment and preview;
  - emoji/GIF/poll/scheduling controls that X places in the composer;
  - native multi-post/thread composition controls;
  - audience/reply permissions;
  - publish button;
  - X-native validation and error messages tied to composing.
- A reliably classified self-thread continuation/reply composer with only the minimum self-authored parent context required by X.
- X's native account-switcher button and its portal menu, with unread badges and unrelated navigation removed.
- Authentication or account-recovery pages when X requires them.
- X settings only after the user deliberately pauses write-only or switches to Normal.

#### Hidden/blocked surfaces

- Home, Following, and For You timelines.
- Profiles, individual post pages, other users' replies, quote-post reading, search, Explore, Communities, Lists, Bookmarks, Grok, trends, and recommendations.
- Notifications, mentions, messages, and their badges.
- All profile and engagement metrics.
- Hover cards and content previews outside the composer, minimal self-thread context, or account switcher.

#### Persistence and navigation

- `chrome.storage.local` persists write-only across tab closure and browser restart.
- Opening `x.com` while write-only is persisted applies the startup mask before X content can paint, then shows the journal shell.
- “Write on X” opens X's native `/compose/post` flow inside the masked page.
- Publishing, adding another post to a native thread, replying to the user's own thread, or closing the composer keeps write-only active.
- After composer completion or closure, return to the journal shell; never fall through to Low-dopamine or Normal automatically.
- Direct navigation to a reading route remains masked and returns to the shell. asocial does not erase browser history.
- Account switching occurs through X's native switcher when it can be isolated safely. During a switch, all metrics remain hidden until active-account signals agree.
- A visible toolbar action can switch to another mode at any time.
- The shell displays a concise reminder: “Your post uses your X audience settings.”

#### Fetching boundary

Write-only guarantees that X reading surfaces are not displayed. It does not guarantee that X's own application will not request timeline data in the background. Blocking private X requests would require fragile interception and broader permissions, so it is explicitly rejected.

## 9. Core user flows

### 9.1 First run

1. Extension installs in Normal mode.
2. Onboarding explains the three modes and that write-only posts are not private.
3. The user selects an initial mode and optional low-dopamine settings.
4. asocial detects the active account automatically when self-specific rules are needed.

The user never enters, confirms, or manages X handles.

### 9.2 Write-only post or thread

1. User selects Write-only from the toolbar popup.
2. The mode is persisted before the current X tab is revealed.
3. Any open X tab is masked before mode-specific content is exposed.
4. User chooses “Write on X.”
5. X's composer appears with no readable timeline behind it.
6. User publishes one post, uses X's native multi-post thread control, or continues a reliably classified self-thread.
7. The composer closes and asocial returns to its journal shell with Write-only still active.
8. Closing and reopening X returns directly to the masked journal experience.

### 9.3 Intentional browsing

1. User opens the toolbar popup.
2. User selects Low-dopamine or Normal.
3. The current X tab updates immediately.
4. Normal removes all asocial presentation and route behavior.

### 9.4 Multiple X accounts

- Settings and the selected mode are global.
- asocial derives the active handle from redundant current-page signals and stores no handle.
- X's native account switcher may be exposed inside write-only only when the button and its portal menu can be isolated without revealing unrelated content or badges.
- During account switching or signal disagreement, ownership is `unknown` and numeric metrics are hidden.
- If the native switcher cannot be isolated safely after an X change, write-only keeps the page masked and offers a Normal-mode escape.
- asocial never reads or stores X cookies, tokens, passwords, internal account IDs, or handles.

## 10. Functional requirements

| ID | Requirement |
|---|---|
| AS-001 | Expose Write-only, Low-dopamine, and Normal as mutually exclusive modes in the toolbar popup. |
| AS-002 | Persist mode and settings in extension-local storage across tab closure, browser restart, and extension update. |
| AS-003 | Apply a mode change to all open X tabs through storage change events, without reload. |
| AS-004 | In Normal mode, remove all extension-owned visual and navigational effects. |
| AS-005 | In Write-only mode, prevent timelines or reading surfaces from appearing during initial load and SPA navigation. |
| AS-006 | Use X's native composer and publish action; never synthesize a post request. |
| AS-007 | Keep X authentication, media upload, audience selection, thread composition, and composer validation inside X. |
| AS-008 | Derive the active X handle from at least two current-page DOM signals without user input or persistent handle storage. |
| AS-009 | In Low-dopamine, classify posts as active-user, other-user, or unknown. |
| AS-010 | Hide all listed numeric metrics for active-user posts. |
| AS-011 | Under signal disagreement or unknown ownership, hide metric numbers but retain action controls. |
| AS-012 | Preserve repost and quote-post access through X's existing combined control/menu. |
| AS-013 | Support a global metric-hiding scope. |
| AS-014 | Hide Following and Followers profile-summary links entirely when configured. |
| AS-015 | Support Normal, Quiet, and Hidden notification navigation states. |
| AS-016 | Support Normal, Quiet, and Hidden message navigation states. |
| AS-017 | Support an independent, removable Mentions & replies shortcut. |
| AS-018 | Control trends, recommended posts, account suggestions, premium prompts, and analytics prompts with separate settings. |
| AS-019 | Detect X SPA route/content changes without continuous polling or full-page rescans. |
| AS-020 | Keep extension-injected UI visually attributable to asocial and accessible by keyboard. |
| AS-021 | Store no post text, timeline content, handles, cookies, auth tokens, internal account IDs, or browsing history. |
| AS-022 | Send no telemetry, analytics, user data, or remote configuration off-device. |
| AS-023 | Provide user-visible degraded status and local selector self-tests containing mode, adapter version, active-account signal agreement, and unmatched rule IDs without post content or identifiers. |
| AS-024 | Keep Write-only active after publishing, closing the composer, native multi-post composition, and supported self-thread replies. |
| AS-025 | Expose X's native account switcher in Write-only only when its button and portal menu pass the strict allowlist contract. |
| AS-026 | Keep X masked by manifest-declared static CSS until the selected mode's first safe state is complete; startup failure must reveal only an asocial recovery shell. |

## 11. Non-functional requirements

### Privacy and security

- Request only X host access and extension storage.
- No backend, telemetry, analytics, tracking pixels, remote configuration, or remotely hosted executable code.
- No page-world code unless a future feature proves isolated content scripts insufficient.
- Do not access or alter X network requests, cookies, local storage, or authentication state.
- Do not log DOM text, handles, post content, post identifiers, or browsing history. Diagnostics may name rule IDs, signal agreement, and match counts only.
- Keep settings in `chrome.storage.local`; do not use Chrome sync.
- Treat X DOM and stored settings as untrusted input.
- Keep the generated extension package auditable and reproducible.

### Resilience

- Centralize all X-specific selectors and classifiers in one adapter boundary.
- Prefer semantic attributes, roles, link shapes, and route context over generated CSS class names.
- Annotate stable containers with asocial-owned attributes; mode CSS consumes those attributes.
- Process only added/changed subtrees and batch work; never rescan the full document on every mutation.
- When a selector fails, preserve X action controls and hide uncertain numeric metrics.
- If write-only cannot safely identify an allowed surface, keep reading content masked, show degraded selector status, and provide a deliberate Normal-mode escape.

### Performance

- Persist the selected mode locally so restrictive startup never waits for network state.
- Inject the compiled startup mask statically through the manifest; it must mask by default without waiting for a JavaScript-added marker.
- Do not reveal X until the stored mode's first safe state is applied.
- In Write-only, do not annotate or scan timeline posts; observe only composer, account-switcher, authentication, and route boundaries.
- After safe classification, remove disallowed X regions from layout and the accessibility tree rather than leaving an invisible interactive page.
- No recurring polling loop.
- No network requests from the extension runtime.
- No UI framework in the content-script path.
- A DOM mutation should be processed once per batch and only within the affected subtree.
- Mode changes should be visibly applied by the next animation frame after settings arrive.
- Measure startup with browser navigation filmstrips and mutation-processing benchmarks; performance claims require recorded evidence.
- Test the built extension with cache disabled and CPU/network throttling; source-level CSS tests are insufficient proof of no flash.

### Accessibility

- Toolbar and settings controls require labels, visible focus, correct roles, and full keyboard operation.
- Hidden content must be removed from the accessibility tree, not merely made transparent.
- Metric hiding must retain accessible action names without spoken numeric counts where feasible.
- Respect X/OS reduced-motion preferences; asocial adds no attention-grabbing animation.

### Compatibility

- MVP: latest stable desktop Chrome supported by the current WXT release at implementation time.
- The behavior engine should use WebExtension-compatible APIs to preserve a Firefox/Safari path.
- Support both `https://x.com/*` and `https://twitter.com/*` while either remains usable.

## 12. Acceptance criteria

### Normal

- Comparing a supported X route with the extension disabled versus Normal shows no asocial-hidden or redirected surface.
- Switching from either restrictive mode to Normal restores X without reload.

### Low-dopamine

- The active account is derived automatically; no onboarding or settings field requests a handle.
- If active-account signals disagree, all uncertain numeric metrics remain hidden.
- On the active user's posts in home, profile, and focused-post contexts, reply, repost, like, bookmark, and view numbers are hidden.
- Following and Followers summary links are absent from both the visual and accessibility trees when their setting is Hidden.
- Reply, repost/quote, like, bookmark, follow, and share controls remain keyboard- and pointer-operable.
- “All metrics” hides the same post counts on other users' content.
- Quiet notifications/messages keep their navigation links and remove unread dots/counts.
- Hidden notifications/messages remove their navigation links from both visual and accessibility trees.
- Trends, recommended posts, and account suggestions can each be enabled or hidden without changing the other two.
- The Mentions shortcut can be removed without changing Notifications mode.

### Write-only

- After Write-only is selected, closing every X tab or restarting Chrome and reopening `x.com` does not reveal a readable X frame.
- A navigation-start filmstrip does not show a readable timeline before the journal shell or composer mask applies.
- Opening home, profile, post, search, notifications, or messages routes never reveals their content.
- The native composer can publish text and media and create a native multi-post thread using the user's existing X session.
- Publishing or closing the composer returns to the journal shell and Write-only remains persisted.
- A supported self-thread reply flow exposes only the minimum self-authored context and native reply composer.
- The native account-switcher button and portal menu can switch accounts without revealing timelines, badges, or unrelated navigation.
- During account switching, active-account disagreement exposes no self-specific metrics.
- If composer or account-switcher detection fails, X remains masked and a Normal-mode recovery path remains available.
- Required-rule failure is visible in the recovery shell and popup, and the local selector self-test contains no content or handles.

### Privacy and performance

- Network inspection shows no requests initiated by asocial.
- Extension storage contains the versioned global settings object only.
- No post text, handles, X credential material, or browsing history appears in logs or storage.
- The packaged extension contains no analytics, telemetry, remote-code loader, or backend endpoint.
- Write-only performs no timeline-post annotation pass.
- CI verifies the built manifest requests only the reviewed permissions and host matches.

## 13. Success measures

MVP success is product correctness, not engagement growth:

- Zero known metric leaks across the supported route matrix.
- Zero removed or disabled post action controls in low-dopamine.
- Zero readable timeline frames during supported write-only cold starts, tab reopens, and browser restarts.
- All mode transitions pass without page reload.
- A manual user can publish and continue a thread through write-only while remaining in the journal.
- X's native account switcher works in journal mode or fails closed with a Normal escape.
- No telemetry is used to measure success. Validation is local, reproducible, and release-checklist based.

## 14. Risks and mitigations

| Risk | Consequence | Mitigation |
|---|---|---|
| X changes DOM structure | Hidden content leaks or controls disappear | Central adapter, fixture contracts, manual route matrix, local selector-health diagnostics |
| Async settings or JavaScript startup delay | User sees the feed or metrics | Manifest-declared static CSS masks by default without a JavaScript marker; apply persisted mode before setting `ready` |
| Startup code fails before mode loads | X could remain inaccessible | Fail-closed recovery shell; toolbar popup and extension disable remain deliberate escape paths |
| Fail-closed behavior hides X after an adapter change | User cannot use the restricted surface | Recovery shell, user-visible degraded status, local selector self-test, deliberate Normal escape, and extension-disable escape |
| Write-only masking is too permissive | Reading content leaks | Default-deny shell; allowlist only validated composer, self-thread, authentication, and account-switcher surfaces |
| X still fetches timeline data | Unneeded network/computation may occur inside X | Do not claim request blocking; minimize asocial work and reject fragile private-request interception |
| Metric styling removes controls | Core interactions break | Annotate/count spans separately; never hide the action container |
| Current account is misidentified | Self metrics leak | Require profile-nav and account-switcher signals to agree; disagreement becomes unknown and hides numbers |
| Native account switcher changes | Journal could reveal unrelated UI | Strict button/menu contract, badge suppression, and fail-closed Normal escape |
| “Journal” implies privacy | User overshares publicly | Repeat clear audience reminder in onboarding and write-only shell |
| Aggregate notification badge cannot identify replies | Misleading reply-only behavior | Offer quiet/hidden badge and an independently removable Mentions shortcut; do not promise categorization |
| Release automation leaks credentials | Store account compromise | Protected environments, least-privilege secrets, manual approval, and no secrets in fork workflows |
| X terms or store policy changes | Distribution risk | Avoid APIs, automation, scraping, remote code, or data collection; review current terms before public release |
| Turborepo adds overhead to one app | More configuration than value | Keep one extension package initially; add shared packages only with a real second consumer |

## 15. Delivery scope

### Milestone 1 — Private desktop proof

- Local unpacked Chrome extension.
- Three-mode popup and global settings schema.
- Persisted, flash-free Write-only shell plus native composer allowlist.
- Automatic active-account detection with fail-calm disagreement behavior.
- Low-dopamine self/global metric hiding.
- Hidden profile relationship links.
- Independent trend, recommended-post, account-suggestion, Mentions, notification, and message controls.
- Normal-mode restoration.
- Synthetic adapter fixtures and an authenticated manual X route checklist.

### Milestone 2 — Resilience and daily use

- Native account switching inside the journal allowlist.
- Native multi-post and supported self-thread continuation.
- Selector-health diagnostics.
- Cross-tab and browser-restart mode propagation.
- Recorded cold-start filmstrip and mutation-performance evidence.
- Packaged private release artifact.

### Milestone 3 — Production distribution

- Public-source repository hygiene, security policy, privacy policy, and store disclosures.
- Reproducible GitHub Actions checks and signed/checksummed release artifacts.
- Manual-approved Chrome Web Store update submission through WXT.
- Brave compatibility validation through the Chrome Web Store package; no separate Brave store upload.
- Firefox build and validation.
- Safari WebExtension conversion spike for macOS/iOS; this is a browser extension path, not a native X client.

## 16. Locked product decisions

1. Write-only is persistent journal mode. Posting, closing the composer, native multi-post composition, and supported self-thread replies do not change the mode.
2. Following and Followers summary links are hidden entirely by Low-dopamine's default.
3. The Mentions shortcut is shown by default and removable independently.
4. Settings are global. Active-account identity is detected from the live page and never entered or persisted.
5. Trends, recommended posts, and account suggestions are separate settings with Hidden defaults; user testing may revise a default without changing the schema.
6. asocial will never have a backend, telemetry, analytics, tracking, or remote configuration.
7. Production quality includes minimum permissions, reproducible builds, automated verification, protected release automation, and fail-calm behavior when X changes.
