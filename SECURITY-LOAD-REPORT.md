# FAMOUS local quality and load report

Date: 2026-10-24
Scope: local source/build, save-data validation, feed interaction logic, and a deterministic virtual-player stress test. No external targets or real accounts were involved.

## Work completed

- Added focused unit coverage for imported-save validation, HTML escaping and bounds, malformed account data, preservation of saved gameplay fields, and board sort/filter behavior.
- Added build integration checks for shipped runtime modules, unsafe/oversized import guards, and event routes for notification, conversation, comment-sort, and board-filter controls.
- Fixed board filters that changed only the selected-chip style without rerendering results.
- Added actual comment ordering toggle (Most relevant / Newest).
- Save-write failures now produce a one-time warning instead of being silently swallowed; added a quota-error regression test.
- Save normalization now retains story reactions; the regression test first reproduced their loss on reload.
- Added working notification and conversation-options panels.
- Fixed Explore's image-catalog 401 path: failed/empty Openverse image searches now fall back to a public Wikimedia Commons search; video searches use Commons directly. Audio remains Openverse-only and displays its failure clearly because Commons is not an audio fallback in this implementation. Result links and creator/license metadata are retained, and media URLs are restricted to HTTPS before rendering.
- Expanded each NPC profile into a populated story-aware profile with highlights, follower/post counts, bio/personality details, profile tabs (posts/reels/reposts/tagged), follow, and message actions.
- Reworked the For You stories into a labeled, story-specific moments rail; made feed NPC identities tappable so they open the existing NPC profile and its follow/message interactions.
- Added deterministic 10,000-name generation and story/personality-based NPC bios. NPC profile portraits now draw from a curated Unsplash portrait pool; the stock set is reused across the cast, not one unique image per NPC.
- Added story-linked NPC task DMs during world simulation: three NPCs per active simulation tick send a lead or warning, and the player can act or leave it unanswered. Outcomes affect trust/stress and persist with the local save. The cast is rotated over time, so a particular NPC will not message immediately on story start.
- NPC stock selection now draws from a deduplicated combined library of 83 curated Unsplash image IDs, so the 50 starter posts in one story can use 50 distinct image IDs instead of cycling a 6–10 image category list.
- Simulated 5,001 virtual players with independent local saves, 50 posts per save, story progress, comments, one friend, and a message. The save-normalization workload completed in about 150 ms on this machine during the recorded run; the test enforces a 5-second ceiling. This is an in-process data validation/serialization workload, not 5,001 app processes, devices, network sessions, or concurrent backend users.

## Automated results

`npm test`: 20 passed, 0 failed. This includes 10,000 distinct NPC names/bios, help/risk task generation, persistence of task state, the 5,001 virtual-player stress test, Openverse 401 → Commons fallback, direct video catalog routing, NPC profile and task-DM event wiring, and Capacitor packaging. The command rebuilds `dist/` before running Node's built-in test runner. `node --check app.js` passes. `npm run cap:sync` succeeded after the latest changes and copied the current web assets into Android and iOS projects.

## Limits and outstanding verification

- FAMOUS is an offline-first, single-device game with fictional NPC behavior and local saves. It has no backend or real player accounts to load-test as concurrent network clients.
- No genuine usability survey or recommendation score was collected. Synthetic profiles cannot provide trustworthy human opinions or an NPS result.
- The current environment blocks local loopback server binding, and the in-app browser policy rejected inspection of the `file://` page. Therefore full browser-driven interaction tests and on-device iPhone/Xcode testing were not executed here.
- The integration checks verify packaging and event wiring statically; they do not substitute for tapping through every screen on a real iPhone. Manual device verification remains necessary, especially for media permissions, safe-area layout, keyboard/zoom behavior, offline media, and account switching.
- The catalog integration was verified with mocked HTTP responses, not a live catalog request from the iPhone. Public catalog availability, CORS behavior in the current network, video codecs, and source image availability still depend on the service/device connection. Openverse 401 is handled for images; audio can still fail if Openverse rejects its request.

## Review notes

The application stores progress locally and has no server-side authentication boundary. Multiple local profiles are convenience profiles on one device, not private accounts. Treat device access and browser/WebView storage accordingly; provide exported saves only on trusted devices and avoid representing NPC activity as real people.
