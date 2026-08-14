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

A user in write-only mode can open X, compose, attach media using X's own composer, select X's native audience settings, and publish without seeing readable X content.

### G2 — Remove self-evaluation loops

A user in low-dopamine mode cannot see their own follower/following totals or numeric engagement and view metrics on their own posts.

### G3 — Preserve intentional actions

Hiding counts must not remove the reply, repost/quote, like, bookmark, or share controls. X's existing repost control and quote-post menu remain intact.

### G4 — Configurable calm

The user can extend metric hiding to all profiles and posts, and can independently quiet notifications, mentions/replies access, and messages access.

### G5 — Instant reversibility

Normal mode restores the unmodified X interface without requiring extension removal or a browser restart.

### G6 — Local-first privacy

MVP has no backend, analytics, account authentication, or storage of post text. Settings and confirmed account handles remain on the device.

## 5. Non-goals for MVP

- A standalone X client or recreation of the X timeline.
- Direct X API, private API, GraphQL, or network interception.
- Automated posting, scheduling, engagement, following, or messaging.
- A private journal, local post archive, draft backup, or cross-posting service.
- Changing who can see a post or hiding engagement from other X users.
- Filtering the notification badge to “replies only.” X exposes an aggregate badge; reliably categorizing it would require data asocial should not fetch.
- Changing Chrome or operating-system notification permissions.
- An ad blocker or anti-tracking product.
- Native iOS or Android applications.
- Team accounts, enterprise policy, or cloud-synced preferences.

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
4. **No content custody.** Do not read, retain, transmit, or analyze post text in MVP.
5. **Opinionated defaults, explicit escape hatch.** Low-dopamine starts calm; Normal is always one toolbar action away.
6. **Fail calm.** Uncertain metric markup is hidden; uncertain action controls are left intact.
7. **No false precision.** If X does not expose reply-only badge data in the DOM, the product does not pretend it can.

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

- Hide the confirmed user's following count and follower count.
- Preserve the Following and Followers links where they can be retained without exposing a count.
- Hide the confirmed user's total post count where X shows it as a profile/header metric.
- Hide numeric reply, repost, like, bookmark, and view metrics on the user's posts.
- Hide numeric summaries for those metrics on a focused post page.
- Preserve reply, repost/quote, like, bookmark, and share controls.
- Hide direct profile/post analytics entry points shown only to the post owner.
- Keep Notifications, Mentions, and Messages navigation available by default.
- Quiet Notifications and Messages by hiding their unread dots/counts by default.
- Hide trends, “who to follow,” and premium/analytics upsells by default.
- Do not change the selected timeline or algorithm in MVP.

#### Metric scope

- **My metrics** (default): hide metrics for confirmed user handles. If ownership cannot be classified safely, hide the numeric metric but preserve its action.
- **All metrics:** hide numeric engagement/view and follower/following counts across X while preserving applicable actions and links.

#### Attention settings

| Setting | Values | Low-dopamine default | Meaning |
|---|---|---:|---|
| Metric scope | My metrics / All metrics | My metrics | Whose vanity metrics are hidden |
| Notifications | Normal / Quiet / Hidden | Quiet | Quiet keeps nav but removes badges; Hidden removes nav |
| Mentions & replies shortcut | Shown / Hidden | Shown | Controls deliberate access to `/notifications/mentions` |
| Messages | Normal / Quiet / Hidden | Quiet | Quiet keeps nav but removes badges; Hidden removes nav |
| Trends and recommendations | Shown / Hidden | Hidden | Controls trends and “who to follow” surfaces |
| Premium and analytics prompts | Shown / Hidden | Hidden | Controls commercial/scoreboard prompts |

Changing these settings does not alter write-only's stricter guarantees.

### 8.3 Write-only

Write-only must not depend on fragile per-component hiding. The extension owns a simple journal shell and reveals only X's native composer when it can identify the composer safely.

#### Allowed surfaces

- asocial's journal shell.
- X's native post composer and its necessary descendants:
  - text editor;
  - media attachment and preview;
  - emoji/GIF/poll/scheduling controls that X places in the composer;
  - audience/reply permissions;
  - publish button;
  - X-native validation and error messages tied to composing.
- Authentication or account-recovery pages when X requires them.
- X settings only after the user deliberately pauses write-only or switches to Normal.

#### Hidden/blocked surfaces

- Home, Following, and For You timelines.
- Profiles, individual post pages, replies, quote-post reading, search, Explore, Communities, Lists, Bookmarks, Grok, trends, and recommendations.
- Notifications, mentions, messages, and their badges.
- All profile and engagement metrics.
- Hover cards and content previews outside the composer.

#### Navigation behavior

- Opening `x.com` in write-only mode shows the journal shell, not a blank or partially hidden timeline.
- “Write on X” opens X's native `/compose/post` flow inside the masked page.
- After successful posting or closing the composer, return to the journal shell.
- Direct navigation to a reading route remains masked and returns to the shell. asocial does not erase browser history.
- A visible toolbar action can switch to Normal at any time.
- The shell displays a concise reminder: “Your post uses your X audience settings.”

## 9. Core user flows

### 9.1 First run

1. Extension installs in Normal mode.
2. Onboarding explains the three modes and that write-only posts are not private.
3. On an authenticated X tab, asocial proposes the currently detected handle.
4. The user confirms one or more handles. Handles are normalized without `@` and stored locally.
5. The user selects an initial mode and optional low-dopamine settings.

If no handle is confirmed, low-dopamine defaults to hiding metrics globally rather than risk exposing the user's own metrics.

### 9.2 Write-only post

1. User selects Write-only from the toolbar popup.
2. Any open X tab is masked before mode-specific content is exposed.
3. User chooses “Write on X.”
4. X's composer appears with no readable timeline behind it.
5. User publishes with X's own button.
6. The composer closes and asocial returns to its journal shell.

### 9.3 Intentional browsing

1. User opens the toolbar popup.
2. User selects Low-dopamine or Normal.
3. The current X tab updates immediately.
4. Normal removes all asocial presentation and route behavior.

### 9.4 Multiple X accounts

- MVP supports a local list of confirmed handles.
- A post authored by any confirmed handle is treated as “mine.”
- Automatic account switching must trigger reclassification of visible posts.
- asocial never stores X cookies, tokens, passwords, or internal account IDs.

## 10. Functional requirements

| ID | Requirement |
|---|---|
| AS-001 | Expose Write-only, Low-dopamine, and Normal as mutually exclusive modes in the toolbar popup. |
| AS-002 | Persist mode and settings in extension-local storage. |
| AS-003 | Apply a mode change to all open X tabs through storage change events, without reload. |
| AS-004 | In Normal mode, remove all extension-owned visual and navigational effects. |
| AS-005 | In Write-only mode, prevent timelines or reading surfaces from appearing during initial load and SPA navigation. |
| AS-006 | Use X's native composer and publish action; never synthesize a post request. |
| AS-007 | Keep X authentication, media upload, audience selection, and composer validation inside X. |
| AS-008 | In Low-dopamine, classify posts as confirmed-user, other-user, or unknown. |
| AS-009 | Hide all listed numeric metrics for confirmed-user posts. |
| AS-010 | Under unknown ownership, hide metric numbers but retain action controls. |
| AS-011 | Preserve repost and quote-post access through X's existing combined control/menu. |
| AS-012 | Support a global metric-hiding scope. |
| AS-013 | Hide confirmed-user follower/following counts without breaking retained navigation links. |
| AS-014 | Support Normal, Quiet, and Hidden notification navigation states. |
| AS-015 | Support Normal, Quiet, and Hidden message navigation states. |
| AS-016 | Support an independent Mentions & replies shortcut setting. |
| AS-017 | Remove trends, recommendations, premium prompts, and analytics prompts according to settings. |
| AS-018 | Detect X SPA route/content changes without continuous polling or full-page rescans. |
| AS-019 | Keep extension-injected UI visually attributable to asocial and accessible by keyboard. |
| AS-020 | Store no post text, timeline content, cookies, auth tokens, or browsing history. |
| AS-021 | Send no telemetry or user data off-device in MVP. |
| AS-022 | Provide a local diagnostic status showing active mode, confirmed handles, adapter version, and unmatched required surfaces without including post content. |

## 11. Non-functional requirements

### Privacy and security

- Request only X host access and extension storage.
- No backend and no remotely hosted executable code.
- No page-world code unless a future feature proves isolated content scripts insufficient.
- Do not access or alter X network requests, cookies, local storage, or authentication state.
- Do not log DOM text or post content. Diagnostic logs may name rule IDs and match counts only.
- Keep settings in `chrome.storage.local`; do not sync confirmed handles through Google in MVP.

### Resilience

- Centralize all X-specific selectors and classifiers in one adapter boundary.
- Prefer semantic attributes, roles, link shapes, and route context over generated CSS class names.
- Annotate stable containers with asocial-owned attributes; mode CSS consumes those attributes.
- Process only added/changed subtrees and batch work; never rescan the full document on every mutation.
- When a selector fails, preserve X action controls and hide uncertain numeric metrics.
- If write-only cannot safely identify a composer, keep reading content masked and show a recovery message with a Normal-mode escape.

### Performance

- No recurring polling loop.
- No network requests from the extension runtime.
- No UI framework in the content-script path.
- A DOM mutation should be processed once per batch and only within the affected subtree.
- Mode changes should be visibly applied by the next animation frame after settings arrive.

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

- On the user's profile, follower, following, and post totals are not visible or exposed as count text.
- On the user's posts in home, profile, and focused-post contexts, reply, repost, like, bookmark, and view numbers are hidden.
- Reply, repost/quote, like, bookmark, and share controls remain keyboard- and pointer-operable.
- “All metrics” hides the same counts on other users' content.
- Quiet notifications/messages keep their navigation links and remove unread dots/counts.
- Hidden notifications/messages remove their navigation links from both visual and accessibility trees.

### Write-only

- A navigation-start filmstrip does not show a readable timeline before the journal shell or composer mask applies.
- Opening home, profile, post, search, notifications, or messages routes never reveals their content.
- The native composer can publish text and media using the user's existing X session.
- Closing or completing the composer returns to the journal shell without exposing the underlying route.
- If composer detection fails, the timeline remains masked and a Normal-mode recovery path remains available.

### Privacy

- Network inspection shows no requests initiated by asocial.
- Extension storage contains the versioned settings object and confirmed handles only; transient adapter diagnostics contain no post content.
- No post text or X credential material appears in logs or storage.

## 13. Success measures

MVP success is product correctness, not engagement growth:

- Zero known metric leaks across the supported route matrix.
- Zero removed or disabled post action controls in low-dopamine.
- Zero readable timeline frames during supported write-only navigation scenarios after extension startup.
- All mode transitions pass without page reload.
- A manual user can publish through write-only and deliberately return to Normal.
- No telemetry is required to measure MVP success. Validation is local and release-checklist based.

## 14. Risks and mitigations

| Risk | Consequence | Mitigation |
|---|---|---|
| X changes DOM structure | Hidden content leaks or controls disappear | Central adapter, fixture contracts, manual route matrix, local selector-health diagnostics |
| Async settings cause a first-paint flash | User sees the feed or metrics | Synchronous startup curtain at `document_start`, then apply stored mode before reveal |
| Startup code fails before mode loads | X could remain inaccessible | Short bootstrap fail-open watchdog; toolbar popup always remains available |
| Write-only masking is too permissive | Reading content leaks | Default-deny shell; allowlist only the identified composer subtree |
| Metric CSS removes controls | Core interactions break | Annotate/count spans separately; never hide the action container |
| Current account is misidentified | Self metrics leak | Explicit handle confirmation; unknown ownership hides numbers |
| “Journal” implies privacy | User overshares publicly | Repeat clear audience reminder in onboarding and write-only shell |
| Aggregate notification badge cannot identify replies | Misleading reply-only behavior | Offer quiet/hidden badge and a direct Mentions shortcut; do not promise categorization |
| X terms or store policy changes | Distribution risk | Avoid APIs, automation, scraping, remote code, or data collection; review current terms before public release |
| Turborepo adds overhead to one app | More configuration than value | Keep one extension package initially; add shared packages only with a real second consumer |

## 15. Delivery scope

### Milestone 1 — Private desktop proof

- Local unpacked Chrome extension.
- Three-mode popup.
- Local settings schema and confirmed handles.
- Write-only shell plus native composer allowlist.
- Low-dopamine self/global metric hiding.
- Quiet/hidden notification and message navigation.
- Normal-mode restoration.
- Synthetic adapter fixtures and an authenticated manual X route checklist.

### Milestone 2 — Resilience and daily use

- Account-switch detection.
- Selector-health diagnostics.
- Trends/recommendations and premium prompt controls.
- Cross-tab mode propagation.
- Packaged private release artifact.

### Milestone 3 — Optional distribution

- Privacy policy and store disclosures.
- Chrome Web Store policy review.
- Firefox build and validation.
- Safari WebExtension conversion spike for macOS/iOS; this is a browser extension path, not a native X client.

## 16. Product decisions still worth testing with the primary user

These do not block the private MVP architecture:

1. Should write-only remain active after posting, or optionally return to Low-dopamine?
2. Should the low-dopamine default hide Following/Follower links entirely, or preserve the links without counts?
3. Should Mentions be shown as a dedicated shortcut in the extension popup when X Notifications is hidden?
4. Should multiple confirmed handles share one settings profile or have per-handle settings later?
5. Is hiding trends/recommendations a default or an opt-in after a week of personal use?
