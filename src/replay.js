export const SUPPORT = ['Against', 'For', 'Abstain'];
export function buildSteps(scenario) {
  const s = scenario;
  const steps = [
    {
      kind: 'created',
      title: 'Proposal created',
      body: 'A proposal is registered in the demo Governor on Base Sepolia.',
      network: 'base',
      hash: s.creation,
    },
  ];
  const control = (name, title, body, kind = 'control') => {
    const hash = s.controls[name]?.hash;
    if (hash) steps.push({ kind, title, body, hash, network: 'base' });
  };
  control(
    'skip',
    'Owner skips this proposal',
    'The owner opts out before trusted agreement is reached.',
  );
  control(
    'pause',
    'Owner pauses mirroring',
    'The first callback must respect the paused contract.',
  );
  control(
    'ownerOverride',
    'Owner votes Against',
    'The holder uses their own voting power first. Automation cannot replace this vote.',
    'owner',
  );
  const ballot = (b, i) =>
    steps.push({
      kind: 'ballot',
      ballot: b,
      title: `${['Alice', 'Bob', 'Carol'][i]} votes ${SUPPORT[b.support]}`,
      body: 'This recorded Governor ballot contributes only to its own choice.',
      hash: b.hash,
      network: 'base',
    });
  const request = (r) =>
    steps.push({
      kind: 'request',
      title:
        r.event === 'MirrorRetried'
          ? 'Reactive retries delivery'
          : 'Reactive requests a callback',
      body: 'Lasna processes the Governor event and emits a callback request for VoteMirror on Base.',
      hash: r.hash,
      network: 'lasna',
    });
  const callback = (c) =>
    steps.push({
      kind: 'callback',
      result: c.outcome,
      title:
        c.outcome === 'Skipped'
          ? 'Callback respects the guard'
          : s.path === 'Recovery sender'
            ? 'The recovery sender reconciles'
            : 'VoteMirror casts its vote',
      body:
        c.outcome === 'Skipped'
          ? c.reason === 0
            ? 'Mirroring is paused. No automated vote is cast.'
            : c.reason === 1
              ? 'The owner skipped this proposal. No automated vote is cast.'
              : 'The Governor already recorded the owner’s vote. It is preserved.'
          : s.path === 'Recovery sender'
            ? 'A separate direct Base transaction restores the eligible vote; this is not a Reactive callback.'
            : 'Base validates ordered ballot receipts and the policy, then the Governor records the mirrored voting power.',
      hash: c.hash,
      network: 'base',
    });
  const beforeDelivery =
    s.id === 'thirdvote' ? s.ballots.slice(0, 2) : s.ballots;
  beforeDelivery.forEach(ballot);
  s.requests.slice(0, 1).forEach(request);
  s.callbacks.slice(0, 1).forEach(callback);
  if (s.id === 'retry') {
    control(
      'unpause',
      'Owner resumes mirroring',
      'The proposal is still eligible and within its voting deadline.',
    );
    s.requests.slice(1).forEach(request);
    s.callbacks.slice(1).forEach(callback);
  }
  if (s.id === 'thirdvote')
    s.ballots.slice(2).forEach((b, i) => ballot(b, i + 2));
  return steps;
}
export function replayState(scenario, index) {
  const steps = buildSteps(scenario);
  const shown = steps.slice(0, Math.max(0, Math.min(index + 1, steps.length)));
  const ballots = shown.filter((s) => s.kind === 'ballot').map((s) => s.ballot);
  const counts = [0, 0, 0];
  for (const b of ballots) counts[b.support]++;
  const callbacks = shown.filter((s) => s.kind === 'callback');
  const mirroredVotes = callbacks.filter((s) => s.result === 'Mirrored').length;
  const ownerVoted = shown.some((s) => s.kind === 'owner');
  const agreedSide = counts.findIndex((n) => n >= 2);
  const lastCallback = callbacks.at(-1);
  const outcome = mirroredVotes
    ? scenario.path === 'Recovery sender'
      ? 'Recovered'
      : 'Mirrored'
    : ownerVoted
      ? 'Owner vote preserved'
      : lastCallback?.result === 'Skipped'
        ? 'Skipped'
        : agreedSide >= 0
          ? 'Agreement reached'
          : 'Awaiting agreement';
  return { ballots, counts, mirroredVotes, ownerVoted, agreedSide, outcome };
}
