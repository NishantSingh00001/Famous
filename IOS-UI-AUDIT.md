# FAMOUS iOS interface checklist

FAMOUS currently runs as a web app inside Capacitor's iOS WebView. This checklist covers the iOS interface and interaction contract; App Store review, account security, and native SwiftUI implementation are separate work.

## Applied in the shared iOS layer

- Preserve user pinch zoom; use `touch-action: manipulation` to avoid delayed/double-tap browser zoom on controls.
- Keep editable controls at 16 CSS px or larger so WebKit does not zoom the page to focus a field. All iPhone inputs, textareas, selects, and editable regions now have a 16px minimum, including story search and the conversation composer.
- Remove hover lift/scale effects on touch devices; give taps a brief pressed state instead.
- Use system fonts in the iOS WebView and keep content within the device width. The final iPhone layer now gives buttons at least 44×44 CSS px targets.
- Respect top and bottom safe-area insets, including the Dynamic Island and Home indicator.
- Keep the tab bar fixed above the Home indicator and reserve content space beneath it.
- Give primary controls at least 44×44 CSS px hit areas. iPhone search genre chips, story notification, feed search, conversation back/more, and composer send controls now meet that target.
- Present compose/dialog surfaces as bottom sheets on iPhone and keep them scrollable above the keyboard.
- Respect `prefers-reduced-motion`; retain visible focus and pressed feedback. A reduced-motion override now removes long transitions and animation while preserving state changes.
- Allow OS zoom and larger text; do not set `maximum-scale=1` or `user-scalable=no`.

## Page-by-page review targets

| Page | iPhone-specific checks |
| --- | --- |
| Story picker | No duplicate identity, no horizontal overflow, large search and category controls, readable two-column story cards, player switch entry point. |
| Home/feed | Feed and story rail fit the viewport; actions are thumb-sized; content clears the bottom tab bar. |
| Explore | People, cards, filters, and media wrap without clipping. |
| Missions | Mission actions and progress remain readable and tappable in a single-column layout. |
| Inbox | Chat list and conversation adapt to phone width; keyboard does not cover the composer. |
| Profile | Avatar/art cannot cover bio or stats; long text wraps; stats and tabs reflow. |
| Reels/stories | Full-screen media respects safe areas; swipe is supplemental to visible next/close controls. |
| Open board | Replies and compose forms remain visible above the keyboard and preserve text size. |
| Chapter choices | Choices stack vertically, have large hit areas, and do not rely on hover. |
| Account picker/settings | Each local profile has a separate save; switching and logging out are explicit; profile slots are clearly described as local, not secure accounts. |

## Remaining native/release checklist

- Verify on the physical iPhone in light and dark appearance, at the user's chosen larger text size, and with the keyboard open. CSS emulation cannot fully reproduce iOS WebKit, Dynamic Type, or VoiceOver behavior.
- Review VoiceOver order/announcements, Reduce Motion, Bold Text, and contrast on-device.
- Confirm app icon, launch screen, display name, bundle identifier, orientation policy, privacy disclosures, permission prompts, and signing before any distribution build.
- Decide whether the app needs a native status-bar/theme integration or native share/notification APIs; do not request permissions until the corresponding feature is implemented.

## Apple references

- [Layout and safe areas](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Gestures and touch conventions](https://developer.apple.com/design/human-interface-guidelines/gestures)
- [Game controls and touch target sizing](https://developer.apple.com/design/human-interface-guidelines/game-controls)
- [UI design dos and don'ts](https://developer.apple.com/design/tips/)
