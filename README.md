# VoteMirror — interactive demo frontend

A standalone, read-only showcase for judges and visitors: interactive recorded
walkthroughs, exact transaction links, a usage guide, and the narrated 2:45 film.

**Public demo:** [votemirror-demo.vercel.app](https://votemirror-demo.vercel.app)
— no account or wallet required.

**Core product:** [duclucky/votemirror-reactive](https://github.com/duclucky/votemirror-reactive).
That repository contains the real contracts, deployment scripts, sender service,
and execution evidence. This repository contains the presentation frontend only.

## What this website does

- Replays the filmed end-to-end run and eight verified safety scenarios.
- Shows a separate Base recovery sender path, explicitly distinguished from Reactive callbacks.
- Links directly to original Base Sepolia and Lasna transactions and immutable core evidence files.
- Explains trusted voters, same-side thresholds, delegation, owner controls and operating requirements.
- Plays the real Chrome recording with English narration and burned-in captions.

Replay buttons change local presentation state. They never send a transaction,
request a wallet, or fabricate an explorer response. The website does not rely on
RPCs or the sender being online. Explorer links naturally require the explorer to
be available. It is a recorded demonstration, not a live product uptime monitor.

## Run and verify

Use Node.js 24:

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:browser
```

`dist/` is the deployable static site. Vercel detects Vite; `vercel.json` declares
the build and output directory. Hash routes and `?scenario=…` links need no server
rewrites. Local browser tests use Google Chrome; CI uses Playwright Chromium.
To check an existing deployment, set `DEMO_URL` before running browser tests.

## Evidence provenance

All proof snapshots under `src/data/` come from the public core repository at
commit `088b642aae5f59ebbdc1f32f69c15f43ca9dcf62`:

- `submission.json`: eight-scenario suite verified on 24 November 2026.
- `video-proof.json`: independent verification of the exact filmed run.
- `recovery.json`: the separately identified sender recovery after fee exhaustion.
- `snapshot.json`: allowlisted public deployment fields and owner-control hashes.

No current-chain configuration or fresh receipt check is claimed. The walkthrough
preserves original ballot order, pause/skip behavior, retry results, owner vote
priority and the absence of a duplicate vote after a third ballot.
The demo voters share an operator; the film does not establish human independence.

## Media

`public/media/votemirror-demo.mp4` is the actual 165-second Chrome recording edit
with voice-over. It is not a slideshow. Waiting time is shortened and labeled;
explorer pickup shots use the same verified proposal and hashes. Separate English
SRT and WebVTT files are included. The poster is a frame from that film.

## Repository boundary

No Solidity contracts, signing scripts, keystores, wallet configuration, sender
runtime, or transaction-submission code belongs in this demo frontend.
The existing brand styles and SVG icons are reused from the core frontend under
the same MIT license. No server, signing keys or environment secrets are required.
