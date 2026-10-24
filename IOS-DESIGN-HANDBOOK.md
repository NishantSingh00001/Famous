# iOS Interface Design Handbook

Practical rules for designing FAMOUS and future apps that should feel at home on iPhone and iPad. Reviewed against Apple’s Human Interface Guidelines on **24 October 2026**.

## 1. What “an iOS app” means in this project

FAMOUS is packaged and launched as an iOS app through Xcode. Capacitor supplies the iOS app shell and embeds the app UI in Apple’s WebKit view (`WKWebView`). The screen interface is authored in HTML, CSS, and JavaScript, so the same interface can also run in a browser. This is still an iOS app package; it does mean the UI must follow both Apple’s iOS interaction conventions and WebKit’s input, viewport, and safe-area behavior.

For a fully native SwiftUI/UIKit app, use native controls and system layout APIs. For a Capacitor app, apply the equivalent rules using semantic HTML, CSS, JavaScript, and Capacitor plugins where native integration is needed. Do not claim that a WebView UI is built from native SwiftUI controls.

## 2. Core design principles

1. **Clarity:** every screen has one clear purpose; labels explain unfamiliar actions; important content is easy to scan.
2. **Deference:** the app’s brand supports the content and system experience. Keep controls recognizable and avoid unnecessary decoration.
3. **Depth:** distinguish navigation, content, and temporary surfaces. Use hierarchy, spacing, and appropriate materials instead of piling on borders and shadows.
4. **Consistency:** use the same navigation, spacing, typography, button states, and color meanings across screens.
5. **Direct manipulation:** visible controls respond where the user taps. Familiar platform gestures supplement, rather than replace, discoverable controls.
6. **Adaptability:** layouts respond to safe areas, device sizes, orientation, text size, keyboard, and appearance changes.

These principles guide the result; Apple does not mandate one universal “iOS look” or a single pixel-perfect layout.

## 3. Layout and screen geometry

- Use the full screen where it suits the experience, while keeping interactive content out of the status bar, Dynamic Island, camera housing, Home indicator, and system bars. In native views, respect safe areas; in a WebView, use `viewport-fit=cover` with `env(safe-area-inset-*)` padding where content approaches those edges.
- Do not hard-code one iPhone’s screen dimensions. Use flexible widths, intrinsic height, wrapping, and scroll containers. Check short and tall phones, portrait and landscape, and compact iPad windows.
- Keep primary content in a natural reading order: top to bottom, leading to trailing. Align related content and controls.
- Use consistent horizontal margins and spacing. Avoid edge-to-edge primary buttons unless the composition clearly supports them and the button remains inset from the device edge.
- Do not create accidental horizontal scrolling, clipped labels, overlapping controls, or content hidden behind the keyboard or bottom navigation.
- Let long content scroll. Keep navigation and persistent controls stable, and reserve the correct scroll inset beneath bottom bars.
- Avoid arbitrary floating panels over important content. Temporary sheets and popovers should have a clear entry, dismissal, and relationship to their source.
- Images preserve their intended aspect ratio. Crop intentionally and keep the subject focal point visible at different display sizes.

## 4. Type and readable text

- Use the system font for interface text unless the product has a deliberate display face. In a WebView, `-apple-system, BlinkMacSystemFont, sans-serif` follows the Apple system font where available.
- Use semantic text roles: a prominent screen title, section headings, body text, and subdued secondary information. Avoid making every label bold or uppercase.
- Apple lists **17 pt** as the default iOS text size and **11 pt** as a minimum reference for game text. Treat 11 pt as a lower boundary, not a target for routine interface copy. Use comfortable body text and reserve small text for nonessential metadata.
- Support the user’s preferred text size. Native apps should use Dynamic Type and reflow when text grows; WebView interfaces should use scalable units, allow wrapping, and avoid fixed-height text containers.
- Do not communicate an important state using color alone. Pair color with a label, symbol, or other cue.
- Keep text contrast strong in light and dark appearances. Check secondary text, disabled controls, placeholder text, and text over photos.

## 5. Touch, buttons, and gestures

- Target **44 × 44 points** for iOS control hit areas. Apple’s accessibility guidance lists 28 × 28 pt as a minimum control size, but 44 × 44 pt is the recommended comfortable target and Apple’s button guidance uses a 44 × 44 pt hit region.
- Leave enough space between adjacent controls to reduce wrong taps. Make the hit region larger than a small icon when needed.
- A custom button needs a visible pressed state, a useful accessible name, and a clear result. Keep the press feedback brief.
- Use one prominent action per region when practical. Do not make every button equally vivid.
- Use familiar system symbols when possible; keep custom icon stroke, size, and alignment consistent. Add text labels when the symbol alone could be ambiguous.
- Prefer standard iOS behaviors for back navigation, sheets, tab switching, swipe dismissal, and keyboard return. Do not hijack system gestures or require a gesture as the only way to use a feature.
- Avoid hover-only states on touch devices. Avoid scale-up interactions that can look like the whole page is zooming.

## 6. Navigation

- Use a navigation stack for a hierarchy of screens, with a clear back action that returns to the previous context.
- Use a tab bar for stable top-level destinations, not one-off actions. Keep it visible as people switch among sections, use concise labels, and use only as many tabs as the information architecture needs.
- Place actions that affect the current screen in a toolbar or in the content, rather than disguising them as navigation tabs.
- Keep search placement consistent. Apple’s current guidance supports search in a tab bar, toolbar, or inline with the content it searches. An inline search field belongs directly above the list it filters.
- Use clear modal dismissal and preserve context when returning from a temporary task.
- Explain unavailable or empty sections instead of making their navigation disappear unpredictably.

## 7. Search and text entry

- A search field includes a recognizable magnifying-glass symbol, a concise placeholder describing its scope, a way to clear text, and immediate or clearly triggered results.
- Search can update results as the user types. Debounce expensive network searches, not the visual response to typed input.
- Keep the field and its result list in the same visual context. Use scope filters only when they represent clearly defined categories.
- Use the appropriate keyboard (`type="search"`, `inputmode`, autocomplete and capitalization settings) for the expected value. Provide a useful Return/Search action.
- Avoid stealing focus and opening the keyboard unexpectedly. When search is a dedicated destination, autofocus only when that is an intentional, predictable interaction.
- Keep the focused field visible above the keyboard. Allow the keyboard to dismiss through the system control, a clear action, or normal navigation.
- **Capacitor/WebKit rule for this project:** set text inputs, textareas, selects, and editable text to at least **16 CSS px** on iPhone. WebKit can auto-zoom the page when a smaller input receives focus. Fix the input font size; do not disable pinch zoom or set `user-scalable=no` / `maximum-scale=1` as a workaround.
- On focus, do not transform or scale the page, viewport, or field. Keep the viewport stable while the keyboard opens and closes.

## 8. Color, light/dark appearance, and materials

- Use semantic color roles: primary background, grouped/elevated surface, primary label, secondary label, separator, accent, success, warning, and destructive.
- Supply deliberate light and dark variants for custom colors. Prefer system semantic colors in native UI. Do not just invert the light palette.
- Dark Mode should retain hierarchy: use a base background for the screen and distinguish foreground cards/sheets with an elevated surface. Pure black may be appropriate for OLED-oriented full-screen media, but avoid flattening every layer into the same black.
- Follow system appearance by default. If a manual appearance override exists, keep “System” available and make the override explicit.
- Ensure contrast remains sufficient for text, symbols, and controls in light mode, dark mode, and increased-contrast settings.
- Use transparency and blur sparingly. Ensure content beneath translucent bars remains legible and not visually noisy.
- Keep accent color meanings consistent. A blue action should not sometimes mean “selected,” sometimes “danger,” and sometimes decoration without context.

## 9. Motion and response

- Motion explains a transition, acknowledges an action, or gives meaningful life to content. It should not delay repeated tasks or distract from reading.
- Keep transitions short, predictable, and connected to the user’s action. A pushed screen enters and exits in a way that preserves spatial continuity; sheets dismiss through an expected direction.
- Every animation has a nonanimated way to understand the state. Motion must not carry essential information by itself.
- Respect Reduce Motion: reduce or replace parallax, large zooms, repeated movement, and decorative transitions. Avoid flashing, persistent pulsing, and motion that starts without user intent.
- Let users interrupt or cancel nonessential animation. Preserve scroll position and typed text when rerendering search results.
- Taps should feel immediate: show pressed or selected feedback while work is happening, and provide progress or an error when an operation takes time.

## 10. Accessibility and inclusive behavior

- Provide VoiceOver labels, roles, and values for custom controls. Ensure reading order follows the screen’s visual hierarchy.
- Support Dynamic Type / larger text, Bold Text where practical, VoiceOver, Switch Control, Reduce Motion, increased contrast, and keyboard navigation.
- Use more than color to distinguish selected, liked, unread, success, or error states.
- Provide visible focus indicators and sufficiently large hit targets. Ensure text and icon controls have labels that describe the action, not just appearance.
- Write concise error messages that explain what happened and the next step. Do not rely on a transient toast for important or persistent information.
- Test accessibility settings on a real device or Simulator, not only in a desktop browser.

## 11. Native shell and WebView details for Capacitor

- Keep the app viewport declaration compatible with modern iPhones, including `viewport-fit=cover`; preserve pinch zoom for accessibility.
- Respect `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, and the left/right insets where relevant. Check the keyboard and Home-indicator regions together.
- Use `100dvh` with fallbacks where a full-height page is needed; do not assume legacy `100vh` accounts for changing Safari/WebView chrome or the keyboard.
- Avoid `overflow:hidden` on the document when users need to scroll, zoom, select, or reach content. Constrain horizontal overflow at the components that cause it instead.
- Avoid accidental double-tap zoom on custom controls, but do not globally block pinch zoom. Keep `touch-action` changes narrowly scoped and preserve native scrolling.
- Use a clear pressed state instead of hover lift on touch. Do not apply a transform to an ancestor of a fixed composer or tab bar unless the stacking and containing-block effects are intentional.
- Native behavior such as haptics, status bar appearance, share sheets, file picking, and permission prompts should use Capacitor/native APIs when needed. Ask for permissions only when a feature is actually invoked and explain why.

## 12. FAMOUS design contract

- **Story picker:** one FAMOUS identity per screen; search first, horizontally scrollable genre chips, one cinematic featured story, then a horizontal trending row. Keep the entire page readable without sideways page scrolling.
- **Game feed:** “For you / Following / Nearby” at the top, story circles, readable post identity and caption, large media, familiar action row, mission card, and five labeled bottom destinations.
- **Conversation:** clear back action and participant identity, post context, readable threaded comments, visible reply actions, relationship context, and a composer above the Home indicator/keyboard.
- Theme follows the iPhone appearance by default. Keep all three primary screens coherent in light and dark modes.
- Treat the generated design image as a visual target, not as a substitute for real responsive behavior, accessible controls, or working interactions.

## 13. Review checklist before calling an iOS UI finished

### Layout and appearance
- [ ] No duplicated logos or titles.
- [ ] No horizontal page scroll, clipping, or overlap at supported widths.
- [ ] Status bar, Dynamic Island, Home indicator, tab bar, and keyboard do not cover content.
- [ ] Light, dark, and system appearance are coherent; appearance switching updates every screen.
- [ ] Large text settings do not clip buttons, navigation, cards, or dialogs.

### Interaction
- [ ] Every control is at least 44 × 44 pt where practical and has visible pressed/selected feedback.
- [ ] Search focus does not zoom the page; typing preserves the cursor and scroll position.
- [ ] Keyboard does not hide the active field, composer, submit button, or validation message.
- [ ] Back, close, tab, and swipe interactions return to the expected place.
- [ ] Taps do not leave the page stuck at a changed scale or altered viewport.

### Accessibility and testing
- [ ] VoiceOver announces controls meaningfully and in a useful order.
- [ ] Reduce Motion removes or softens nonessential motion.
- [ ] Increased contrast and larger text remain usable.
- [ ] Test on the smallest and largest supported iPhones and at least one iPad layout if supported.
- [ ] Test on a physical iPhone after every Capacitor sync; the open Safari/local HTML page is not the same runtime as the Xcode-installed app.

## 14. Official Apple references

- [Human Interface Guidelines: Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields)
- [Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields)
- [Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
- [Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [UI Design Dos and Don’ts](https://developer.apple.com/design/tips/)
- [Testing system accessibility features](https://developer.apple.com/documentation/accessibility/testing-system-accessibility-features-in-your-app)

This handbook summarizes Apple guidance; it is not a claim that every listed practice is a formal App Store review requirement. Apple updates the HIG over time, so check the linked pages when beginning a new native implementation.
