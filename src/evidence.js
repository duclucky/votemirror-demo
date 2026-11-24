import suite from './data/submission.json' with { type: 'json' };
import video from './data/video-proof.json' with { type: 'json' };
import recovery from './data/recovery.json' with { type: 'json' };
import snapshot from './data/snapshot.json' with { type: 'json' };

export const CORE = 'https://github.com/duclucky/votemirror-reactive';
export const DEMO_REPO = 'https://github.com/duclucky/votemirror-demo';
export const SOURCE_COMMIT = snapshot.sourceCommit;
export const deployment = snapshot.deployment;
export const summary = suite.summary;
export const verifiedAt = suite.verifiedAt;
export const sourceFile = (file) => `${CORE}/blob/${SOURCE_COMMIT}/${file}`;
export const explorer = (network) =>
  network === 'lasna'
    ? 'https://lasna.reactscan.net'
    : 'https://base-sepolia.blockscout.com';
export const transactionURL = (hash, network = 'base') =>
  `${explorer(network)}/tx/${hash}`;
const descriptions = {
  for: 'Two trusted For ballots reach the threshold. The callback casts one vote.',
  against:
    'Agreement can reject a proposal too. Against has its own threshold.',
  abstain: 'Two matching Abstain ballots mirror an Abstain vote.',
  splitmajority:
    'For and Against do not combine. A third ballot creates a For majority.',
  skip: 'The owner skips the proposal. Trusted agreement cannot override that choice.',
  retry:
    'A paused callback is skipped. After unpausing, a Reactive retry succeeds.',
  thirdvote:
    'The third trusted ballot is observed after the vote. No duplicate is cast.',
  owneroverride:
    'The owner votes Against first. The later callback preserves that vote.',
};
const fresh = {
  id: 'video',
  title: 'The filmed end-to-end run',
  category: 'Video run',
  detail:
    'The same proposal shown in the film: Alice and Bob agree, Lasna requests a callback, and VoteMirror votes on Base.',
  proposalId: video.proposalId,
  creation: video.proposalCreation,
  ballots: video.origins.map((o, i) => ({
    voter: deployment.trustedVoters[i],
    support: 1,
    hash: o.hash,
    observation: o.observationHash,
  })),
  requests: [
    { event: 'MirrorRequested', hash: video.reactiveRequest, support: 1 },
  ],
  callbacks: [{ outcome: 'Mirrored', hash: video.callback, support: 1 }],
  controls: {},
  outcome: 'Mirrored',
  path: 'Reactive callback',
  source: 'deployments/video-proof-video-20261124-01.json',
};
export const scenarios = [
  fresh,
  ...suite.scenarios.map((s) => ({
    id: s.mode,
    title: s.label,
    category: 'Safety scenario',
    detail: descriptions[s.mode],
    proposalId: s.proposalId,
    creation: s.proposalCreation.hash,
    ballots: s.origins.map((o) => ({
      voter: o.voter,
      support: o.support,
      hash: o.hash,
      observation: o.reactiveObservation.hash,
    })),
    requests: s.requests,
    callbacks: s.callbacks,
    controls: snapshot.controls[s.mode],
    outcome:
      s.mode === 'owneroverride'
        ? 'Owner vote preserved'
        : s.mode === 'skip'
          ? 'Skipped'
          : 'Mirrored',
    path: 'Reactive callback',
    source: s.evidenceFile,
  })),
  {
    id: 'recovery',
    title: 'A separate recovery path',
    category: 'Recovery',
    detail:
      'A dedicated Base sender recovered an eligible proposal after event delivery ran out of funds. This is a direct recovery, separate from Reactive callbacks.',
    proposalId: recovery.proposalId,
    creation: recovery.proposeTx,
    ballots: recovery.ballots.map((b) => ({ ...b, hash: b.tx })),
    requests: [],
    callbacks: [
      {
        outcome: 'Mirrored',
        hash: recovery.resultTx,
        support: recovery.support,
      },
    ],
    controls: {},
    outcome: 'Recovered',
    path: 'Recovery sender',
    source: `deployments/${recovery.sourceFile}`,
  },
];
