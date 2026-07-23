# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Any two or more people who need to work on code together in real time — developers pairing on a feature, interviewers running a live coding screen, colleagues debugging together remotely. Users arrive with an invite code or direct session URL and expect to be inside a shared editor within seconds.

**Secondary:** Hosts who own and manage sessions — creating rooms, naming them, creating/renaming/deleting files, and deciding when to end the session.

## Product Purpose

Air IDE is a session-based collaborative code editor. A host creates a named room; collaborators join via an invite code or URL. Everyone in the session edits the same files simultaneously, with changes propagated in real time through Yjs CRDT sync over WebSockets. Sessions are ephemeral workspaces, not full cloud development environments: there is no terminal, no build runner, and no persistent personal workspace outside of a session.

Success means two or more people open the same file and their keystrokes appear in each other's editors within milliseconds, without conflicts, without locking, and without losing data.

## Positioning

Air IDE's meaningful difference is the combination of **zero-latency CRDT-based co-editing** (no operational transform delays, no lock-then-merge friction) with a **self-hosted, session-scoped model** — the entire collaboration state lives in memory for the duration of the session and is not retained in a third-party cloud. Teams control the deployment; there is no vendor lock-in and no data residency concern. Neighboring tools (Replit, CodeSandbox, VS Code Live Share) either require a cloud backend the vendor controls, or sacrifice true conflict-free simultaneous editing.

## Operating Context

- Users arrive through a direct invite URL or by entering a room code on the dashboard.
- The dashboard shows sessions the user owns (created) and sessions they have joined.
- Inside a session: a file tree on the left, a Monaco editor in the center, a collaborators sidebar, and a session header. Users open files into tabs; edits sync live across all participants.
- Each collaborator is colour-coded; their cursor line is marked in the gutter and their active file is shown in the members sidebar.
- The host can create, rename, and delete files; any participant can edit any open file.
- Sessions end when the host terminates the room; all participants are redirected to the dashboard.
- The app defaults to dark mode. Light mode is available via a theme toggle.
- Dev command: `npm run dev` (Vite). Entry: `src/main.tsx`.

## Capabilities and Constraints

- **Real-time sync:** Yjs documents, one per file, bridged to Monaco via y-monaco. Socket.IO carries awareness and CRDT updates.
- **File operations:** create, rename, delete. No directories — flat file list per session.
- **Auth:** email + password, JWT token stored in Redux state.
- **No terminal, no build runner, no package manager, no git integration** — the editor is the product.
- **No persistent personal workspace** — files exist only within a session. Sessions can be rejoined while active.
- **No offline mode** — a broken socket leads to an error screen.
- **Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), Redux Toolkit + RTK Query, React Router v8, Vite.
- **Undecided:** maximum number of participants per session; file size or type restrictions; session expiry policy; mobile/tablet experience requirements.

## Brand Commitments

Name: **Air IDE** (confirmed). No logo, color palette, or visual style is locked. Tone is undecided.

## Evidence on Hand

- Full working frontend implementation: auth pages, dashboard with session tabs, session room with Monaco editor, file management, collaborator awareness.
- No marketing copy, testimonials, press, or external-facing assets exist yet.
- No logo asset file found in `public/`.

## Product Principles

1. **Instant presence.** The moment you join a session you are live — no waiting, no loading state beyond the socket handshake. Latency and friction are the enemy.
2. **Transparent collaboration.** Every collaborator is always visible: who is in the room, which file they are in, where their cursor is. No hidden state.
3. **Session-scoped simplicity.** Air IDE does exactly one thing well — shared editing inside a timed session — and does not sprawl into a general-purpose IDE. Scope is a feature.
4. **Self-hostable by default.** No user data leaves the operator's infrastructure. Privacy and control are architectural, not optional add-ons.
5. **Code first.** The editor is the product. UI chrome serves the editing experience and never competes with it.

## Accessibility & Inclusion

No product-specific accessibility standard has been confirmed. Monaco Editor provides keyboard navigation within the editor surface. Standard WCAG 2.1 AA is the working assumption for all non-editor UI.
