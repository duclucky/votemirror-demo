import './style.css';
import './demo.css';
import { icon, logo } from './icons.js';
import {
  scenarios,
  deployment as d,
  CORE,
  DEMO_REPO,
  summary,
  sourceFile,
  transactionURL,
  explorer,
} from './evidence.js';
import { buildSteps, replayState, SUPPORT } from './replay.js';

const app = document.querySelector('#app');
const nav = [
  ['overview', 'grid', 'Overview'],
  ['demo', 'play', 'Interactive demo'],
  ['proof', 'activity', 'Transaction evidence'],
  ['guide', 'book', 'How to use'],
  ['video', 'layers', 'Demo film'],
];
const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
const short = (value) => `${value.slice(0, 8)}…${value.slice(-6)}`;
const external = (url, label, className = 'text-link') =>
  `<a class="${className}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}${icon('link')}</a>`;
const badge = (text, tone = '') =>
  `<span class="badge ${tone}">${esc(text)}</span>`;
const tx = (hash, network = 'base', label = short(hash)) =>
  external(transactionURL(hash, network), esc(label), 'tx-link');
const state = {
  tab: 'overview',
  scenario: scenarios[0],
  step: buildSteps(scenarios[0]).length - 1,
  playing: false,
};
let timer;
function stop() {
  clearInterval(timer);
  state.playing = false;
}
function announce(text) {
  document.querySelector('#notifications').textContent = text;
}
function heading(kicker, title, body, action = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${body}</p></div>${action}</div>`;
}
function render() {
  const focusId = document.activeElement?.id;
  app.innerHTML = `<aside class="sidebar">
    <a class="brand" href="#overview" aria-label="VoteMirror overview"><span class="brand-mark">${logo}</span><span>VoteMirror<span class="brand-sub">GOVERNANCE, IN SYNC</span></span></a>
    <div class="workspace-label"><span class="workspace-avatar">V</span><div>Product demo<small>Recorded testnet evidence</small></div></div>
    <div class="nav-label">EXPLORE VOTEMIRROR</div><nav aria-label="Main navigation">${nav.map(([id, glyph, label]) => `<a class="nav-item ${state.tab === id ? 'selected' : ''}" href="#${id}" aria-label="${label}" ${state.tab === id ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span></a>`).join('')}</nav>
    <div class="sidebar-note"><span class="sidebar-note-icon">${icon('shield')}</span><strong>Your tokens stay yours.</strong><p>A trusted circle.<br>A policy you control.</p></div>
    <div class="sidebar-bottom">${external(CORE, `${icon('code')}Core product`)}${external(DEMO_REPO, `${icon('layers')}Demo frontend`)}<div class="build-note">Built with Reactive Omni<span>Base Sepolia + Reactive Lasna</span></div></div>
  </aside><div class="shell"><header class="topbar"><div class="breadcrumb">VoteMirror<span>/</span><strong>${nav.find((n) => n[0] === state.tab)[2]}</strong></div><div class="top-actions"><span class="readonly-label">${icon('shield')}No wallet needed</span>${badge('RECORDED DEMO', 'green')}</div></header>
  <main id="main" tabindex="-1"><div class="demo-disclosure">${icon('info')}<p><strong>Interactive replay of real testnet executions.</strong> Controls change this walkthrough only. Each transaction link opens the original on-chain evidence.</p><a href="#guide">How it works${icon('chevron')}</a></div>
  ${{ overview, demo: demoPage, proof: proofPage, guide: guidePage, video: videoPage }[state.tab]()}
  <footer class="page-footer"><span>VoteMirror · Your trusted circle. Your final say.</span><span>Testnet demonstration · Evidence snapshot: 24 Nov 2026</span></footer></main></div>`;
  if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
}
function overview() {
  return `${heading('YOUR GOVERNANCE, ON AUTOPILOT', 'Good decisions. Mirrored.', 'Understand the policy. Explore the flow. Inspect the proof.')}
  <section class="hero-panel" aria-labelledby="hero-title"><div class="hero-copy"><div class="hero-kicker"><span class="tiny-line"></span>TRUSTED VOTERS. SHARED CONVICTION.</div><h2 id="hero-title">Your vote follows<br>agreement. <em>Not noise.</em></h2><p>Follow a circle you trust. When enough of them vote the same way, VoteMirror follows — while you keep your tokens and your final say.</p><div class="hero-actions"><a href="#demo" class="button mint">${icon('play')}Explore the demo</a><a href="#video" class="hero-link">Watch the film${icon('chevron')}</a></div></div><div class="mirror-illustration" aria-label="Two of three trusted voters agree and VoteMirror follows"><div class="illustration-label">THE AGREEMENT LOOP</div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="avatar-node alice">A<span>${icon('check')}</span></div><div class="avatar-node bob">B<span>${icon('check')}</span></div><div class="avatar-node carol">C</div><div class="mirror-node">${logo}</div><div class="agreement-pill">${icon('check')}2 of 3 agree</div><div class="diagram-caption">Trusted circle<span class="diagram-line"></span>Your vote</div></div></section>
  <section class="metrics" aria-label="Demo policy and evidence"><div class="metric"><div class="metric-label">The demo policy${icon('network')}</div><div class="metric-value">2<span> / 3 voters</span></div><div class="metric-caption">Matching choices, not combined turnout</div></div><div class="metric"><div class="metric-label">Safety scenarios${icon('shield')}</div><div class="metric-value">${summary.scenarios}<span> on-chain tests</span></div><div class="metric-caption">Linked to source events and callbacks</div></div><div class="metric metric-good"><div class="metric-label">Getting started${icon('play')}</div><div class="metric-value">No wallet</div><div class="metric-caption">Explore every recorded path, at your pace</div></div></section>
  <section class="journey-grid" aria-label="Explore the product">${[
    [
      'demo',
      'play',
      '01',
      'Follow a decision',
      'Walk from the first ballot to the final Governor vote. Step through disagreements, skips and retries.',
      'Start the walkthrough',
    ],
    [
      'proof',
      'activity',
      '02',
      'See the receipts',
      'Open exact transaction hashes across Base Sepolia and Lasna. Recovery paths are labeled separately.',
      'Inspect transaction evidence',
    ],
    [
      'guide',
      'book',
      '03',
      'Make it your own',
      'Learn how to set up a trusted circle, delegate voting power, and keep control over each proposal.',
      'Read the usage guide',
    ],
  ]
    .map(
      ([route, glyph, n, title, body, cta]) =>
        `<a class="panel journey-card" href="#${route}"><div class="journey-top"><span class="proof-icon">${icon(glyph)}</span><span>${n}</span></div><h2>${title}</h2><p>${body}</p><span class="journey-cta">${cta}${icon('chevron')}</span></a>`,
    )
    .join('')}</section>
  <section class="panel review-card"><div><div class="eyebrow">A GOOD PLACE TO START</div><h2>The filmed end-to-end run</h2><p>Alice votes For. Bob agrees. Reactive delivers a callback. The Governor records VoteMirror’s voting power. The film and walkthrough use the same proposal and hashes.</p></div><div class="review-actions"><a href="?scenario=video#demo" class="button dark">${icon('play')}Open this run</a><a href="#video" class="button secondary">Watch 2:45 film</a></div></section>`;
}
function demoPage() {
  const s = state.scenario,
    steps = buildSteps(s),
    view = replayState(s, state.step),
    current = steps[state.step];
  const best = Math.max(...view.counts),
    complete = state.step === steps.length - 1;
  return `${heading('FROM BALLOT TO CALLBACK', 'Follow a decision, step by step.', 'Play a recorded path or move through each event. Playback speed does not represent network latency.')}
  <section class="panel execution-panel"><div class="scenario-picker"><label for="scenario">Recorded scenario</label><div class="select-wrap"><select id="scenario">${scenarios.map((item) => `<option value="${item.id}"${item.id === s.id ? ' selected' : ''}>${esc(item.title)} · ${item.category}</option>`).join('')}</select>${icon('down')}</div>${badge(s.path, s.path === 'Reactive callback' ? 'green' : 'amber')}</div>
  <div class="proposal-heading"><div><div class="proposal-meta">BASE SEPOLIA GOVERNOR <span>·</span> ${esc(short(s.proposalId))}</div><h2>${esc(s.title)}</h2><p>${esc(s.detail)}</p></div>${badge(view.outcome, view.mirroredVotes ? 'green' : view.ownerVoted ? 'blue' : 'amber')}</div>
  <div class="replay-controls"><button id="replay-toggle" class="button dark small" data-action="play">${icon(state.playing ? 'pause' : 'play')}${state.playing ? 'Pause replay' : complete ? 'Replay this path' : 'Play replay'}</button><button id="step-back" class="button secondary small" data-action="back"${state.step === 0 ? ' disabled' : ''}>Previous</button><button id="step-next" class="button secondary small" data-action="next"${complete ? ' disabled' : ''}>Next event${icon('chevron')}</button><span class="replay-position">Step ${state.step + 1} of ${steps.length} · recorded sequence</span></div>
  <div class="decision-grid"><div class="ballots-panel"><div class="mini-heading">TRUSTED BALLOTS<span>At this replay step</span></div>${d.trustedVoters
    .map((address, i) => {
      const b = view.ballots.find(
        (x) => x.voter.toLowerCase() === address.toLowerCase(),
      );
      return `<div class="ballot-row"><span class="person-avatar avatar-${i}">${['A', 'B', 'C'][i]}</span><div class="ballot-person"><strong>${['Alice', 'Bob', 'Carol'][i]}</strong><small>${b ? tx(b.hash, 'base', 'Recorded ballot') : 'Not shown yet'}</small></div>${b ? badge(SUPPORT[b.support], b.support === 1 ? 'green' : b.support === 0 ? 'rose' : '') : '<span class="muted">Awaiting ballot</span>'}</div>`;
    })
    .join(
      '',
    )}</div><div class="consensus-panel"><div class="mini-heading">SAME-SIDE AGREEMENT</div><div class="consensus-numeral">${best}<span> / 2</span></div><div class="consensus-track"><span style="width:${Math.min(100, best * 50)}%"></span></div><strong>${view.agreedSide < 0 ? 'Threshold not reached' : `${SUPPORT[view.agreedSide]} reaches the threshold`}</strong><p>Against ${view.counts[0]} · For ${view.counts[1]} · Abstain ${view.counts[2]}</p><span class="recorded-weight">${view.ownerVoted ? 'Owner’s vote preserved' : view.mirroredVotes ? '1 mirrored vote recorded' : 'No mirrored vote at this step'}</span></div></div>
  <div class="replay-current" role="region" aria-label="Current replay event"><span class="proof-icon">${icon(current.kind === 'request' ? 'network' : current.kind === 'callback' ? 'shield' : 'activity')}</span><div><span class="eyebrow">STEP ${state.step + 1} · ${current.network === 'lasna' ? 'REACTIVE LASNA' : 'BASE SEPOLIA'}</span><h3>${esc(current.title)}</h3><p>${esc(current.body)}</p>${tx(current.hash, current.network, 'Open this transaction')}</div></div>
  <ol class="recorded-steps" aria-label="Recorded execution steps">${steps.map((step, i) => `<li><button id="event-${i}" class="recorded-step ${i === state.step ? 'current' : ''} ${i < state.step ? 'past' : ''}" data-step="${i}" ${i === state.step ? 'aria-current="step"' : ''}><span class="recorded-step-number">${i < state.step ? icon('check') : i + 1}</span><span><strong>${esc(step.title)}</strong><small>${step.network === 'lasna' ? 'Reactive Lasna' : 'Base Sepolia'}</small></span>${i === state.step ? icon('chevron') : ''}</button></li>`).join('')}</ol>
  <div class="evidence-footer"><span>${icon('info')}Saved on-chain evidence · playback does not send transactions</span>${external(sourceFile(s.source), 'Original evidence JSON')}</div></section>
  <div class="demo-bottom"><p>Want to verify this path independently? Open the proof files and all transaction links.</p><a class="button secondary" href="#proof">${icon('activity')}Inspect evidence</a></div>`;
}
function proofPage() {
  return `${heading('SHOW THE WORK', 'Every claim has a transaction.', 'A filmed run, eight safety scenarios, and a separate recovery. These are saved testnet records, not live uptime metrics.', external(sourceFile('docs/submission-evidence.md'), 'Core evidence index', 'button secondary'))}
 <div class="proof-intro"><span class="proof-seal">${icon('shield')}</span><p>Source evidence was verified on 24 November 2026. Explorer links let you check the original records. This static demo does not recheck receipts in your browser.</p></div>
 <section class="proof-grid">${scenarios.map((s) => `<article class="panel proof-card"><div class="proof-card-top"><span class="proof-icon">${icon(s.path === 'Recovery sender' ? 'refresh' : 'shield')}</span>${badge(s.outcome, s.outcome === 'Skipped' ? 'amber' : 'green')}</div><div class="eyebrow">${s.category}</div><h2>${esc(s.title)}</h2><p>${esc(s.detail)}</p><div class="proof-links">${tx(s.ballots.at(-1).hash, 'base', 'Source ballot')}${s.requests.map((r, i) => tx(r.hash, 'lasna', i ? 'Reactive retry' : 'Reactive request')).join('')}${s.callbacks.map((c, i) => tx(c.hash, 'base', s.path === 'Recovery sender' ? 'Sender recovery' : c.outcome === 'Skipped' ? 'Callback: skipped' : 'Callback: mirrored')).join('')}${s.id === 'owneroverride' ? tx(s.controls.ownerOverride.hash, 'base', 'Owner’s direct vote') : ''}</div><div class="proof-card-bottom"><a class="text-link" href="?scenario=${s.id}#demo">Replay this path${icon('chevron')}</a>${external(sourceFile(s.source), 'JSON')}</div></article>`).join('')}</section>
 <section class="panel deployment-reference"><div class="section-title"><h2>Deployed contracts</h2>${badge('v4 · testnet')}</div><p class="section-copy">Public addresses from the evidence snapshot. Current configuration may change after recording.</p><div class="table-scroll"><table><thead><tr><th>Contract</th><th>Network</th><th>Address</th></tr></thead><tbody>${[
   ['DemoGovernor', d.demoGovernor, 'base'],
   ['VoteMirror', d.voteMirror, 'base'],
   ['MirrorReactive', d.mirrorReactive, 'lasna'],
   ['Callback proxy', d.callbackProxy, 'base'],
 ]
   .map(
     ([name, address, network]) =>
       `<tr><td><strong>${name}</strong></td><td>${network === 'lasna' ? 'Reactive Lasna' : 'Base Sepolia'}</td><td>${external(`${explorer(network)}/address/${address}`, esc(address), 'address-link')}</td></tr>`,
   )
   .join('')}</tbody></table></div></section>`;
}
function guidePage() {
  return `${heading('YOUR CIRCLE. YOUR POLICY.', 'A guide to voting with VoteMirror.', 'Start with the walkthrough, then understand how the deployed contracts are operated.')}
 <section class="panel guide-start"><div class="proof-icon">${icon('play')}</div><div><h2>Try the demo in one minute</h2><p>Open Interactive demo. Pick a scenario. Use Next event to follow each ballot, the Reactive request, and the Base result. Select a transaction to inspect its real explorer record.</p></div><a class="button dark" href="#demo">Start exploring${icon('chevron')}</a></section>
 <section class="guide-grid">${[
   [
     '01',
     'Choose a circle you trust',
     'The owner configures trusted addresses and a threshold. In this test deployment, Alice, Bob and Carol form a two-of-three circle. Demo addresses share one operator; they are not independent people.',
   ],
   [
     '02',
     'Delegate voting power',
     'The holder delegates governance voting power to VoteMirror through the voting token. Tokens remain in the holder’s wallet. Follow the token’s governance rules and snapshot timing.',
   ],
   [
     '03',
     'Vote on the original Governor',
     'Trusted voters submit their own ballots on Base Sepolia. Against, For and Abstain are counted separately. Two different choices never combine into agreement.',
   ],
   [
     '04',
     'Let events carry the decision',
     'Reactive observes Governor events on Lasna and requests a callback. On Base, VoteMirror independently checks ordered receipts and the current policy before voting.',
   ],
   [
     '05',
     'Keep the final say',
     'The owner can pause mirroring, skip a proposal, or vote directly. A prior owner vote is preserved. Configuration changes must keep the Base and Reactive policies aligned.',
   ],
   [
     '06',
     'Operate delivery responsibly',
     'Real execution needs reachable networks, funded fees and an open voting window. A separate Base recovery sender can reconcile eligible votes; it is distinct from the Reactive callback path.',
   ],
 ]
   .map(
     ([n, title, body]) =>
       `<article class="panel guide-card"><span class="guide-number">${n}</span><h2>${title}</h2><p>${body}</p></article>`,
   )
   .join('')}</section>
 <section class="panel guide-boundaries"><h2>Demo controls and deployed product</h2><dl><div><dt>Here in this demo</dt><dd>Read-only playback, recorded results, public explorer links, and the film. No wallet connection or transaction submission.</dd></div><div><dt>In the core product</dt><dd>Solidity contracts, deployment scripts, testnet execution and recovery sender. Technical setup and operating instructions live in the core repository.</dd></div></dl><div class="guide-links">${external(sourceFile('README.md') + '#reproduce-a-testnet-demo', 'Demo runbook', 'button secondary')}${external(sourceFile('docs/recovery-v4.md'), 'Contract and recovery design', 'button secondary')}${external(CORE, 'Core repository', 'button dark')}</div></section>`;
}
function videoPage() {
  return `${heading('SEE IT RUN', 'A real run. On film.', '2 minutes 45 seconds · Chrome screen recording · English narration and captions')}
 <section class="panel film-panel"><video id="demo-film" controls playsinline preload="metadata" poster="/media/demo-poster.jpg" aria-label="VoteMirror real testnet demonstration"><source src="/media/votemirror-demo.mp4" type="video/mp4" /><track kind="captions" label="English" srclang="en" src="/media/votemirror-demo.en.vtt" /><p>Your browser cannot play this video. <a href="/media/votemirror-demo.mp4">Download the MP4.</a></p></video><div class="film-description"><div><h2>From trusted ballots to a verified vote</h2><p>The filmed proposal matches “The filmed end-to-end run” in the walkthrough. Waiting time is shortened and labeled; recorded safety scenarios and sender recovery are shown separately.</p></div><a href="?scenario=video#demo" class="button secondary">Explore the same run${icon('chevron')}</a></div></section>
 <div class="film-resources"><a class="button secondary" href="/media/votemirror-demo.mp4" download>Download MP4${icon('down')}</a><a class="button secondary" href="/media/votemirror-demo.en.srt" download>English subtitles${icon('book')}</a>${external(sourceFile('docs/video-evidence.md'), 'Film transaction evidence', 'button secondary')}</div>`;
}
function selectScenario(id) {
  state.scenario = scenarios.find((s) => s.id === id) ?? scenarios[0];
  state.step = buildSteps(state.scenario).length - 1;
}
function route() {
  stop();
  const hash = location.hash.slice(1);
  if (hash === 'main') {
    document.querySelector('#main')?.focus();
    return;
  }
  state.tab = nav.some((n) => n[0] === hash) ? hash : 'overview';
  const id = new URLSearchParams(location.search).get('scenario');
  if (id && id !== state.scenario.id) selectScenario(id);
  render();
  window.scrollTo(0, 0);
}
app.addEventListener('click', (event) => {
  const step = event.target.closest('[data-step]');
  if (step) {
    stop();
    state.step = Number(step.dataset.step);
    render();
    announce(buildSteps(state.scenario)[state.step].title);
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'play') {
    if (state.playing) stop();
    else {
      if (state.step === buildSteps(state.scenario).length - 1) state.step = 0;
      state.playing = true;
      timer = setInterval(() => {
        state.step++;
        if (state.step >= buildSteps(state.scenario).length - 1) stop();
        render();
        announce(
          `Replay step ${state.step + 1}: ${buildSteps(state.scenario)[state.step].title}`,
        );
      }, 2600);
    }
  } else {
    stop();
    state.step = Math.max(
      0,
      Math.min(
        buildSteps(state.scenario).length - 1,
        state.step + (action === 'next' ? 1 : -1),
      ),
    );
  }
  render();
  announce(
    `Replay step ${state.step + 1}: ${buildSteps(state.scenario)[state.step].title}`,
  );
});
app.addEventListener('change', (event) => {
  if (event.target.id !== 'scenario') return;
  stop();
  selectScenario(event.target.value);
  const url = new URL(location.href);
  url.searchParams.set('scenario', state.scenario.id);
  history.replaceState(null, '', url);
  render();
  announce(`Selected recorded scenario: ${state.scenario.title}`);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.playing) {
    stop();
    render();
  }
});
window.addEventListener('hashchange', route);
window.addEventListener('popstate', route);
route();
