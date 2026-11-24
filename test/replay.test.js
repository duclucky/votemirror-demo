import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarios } from '../src/evidence.js';
import { buildSteps, replayState } from '../src/replay.js';
const scenario = (id) => scenarios.find((s) => s.id === id);
test('split ballots stay below same-side threshold until Carol votes', () => {
  const s = scenario('splitmajority');
  const steps = buildSteps(s);
  const second = steps.findIndex((x) => x.hash === s.ballots[1].hash);
  assert.ok(second > 0);
  assert.deepEqual(replayState(s, second).counts, [1, 1, 0]);
  assert.equal(replayState(s, second).mirroredVotes, 0);
  assert.equal(replayState(s, steps.length - 1).mirroredVotes, 1);
});
test('third ballot follows callback and never creates a second mirrored vote', () => {
  const s = scenario('thirdvote');
  const steps = buildSteps(s);
  const callback = steps.findIndex((x) => x.hash === s.callbacks[0].hash);
  const third = steps.findIndex((x) => x.hash === s.ballots[2].hash);
  assert.ok(callback > 0 && third > callback);
  assert.equal(replayState(s, third).mirroredVotes, 1);
});
test('pause, skip, retry and owner priority preserve their actual outcomes', () => {
  const s = scenario('retry');
  const steps = buildSteps(s);
  const skipped = steps.findIndex((x) => x.hash === s.callbacks[0].hash);
  assert.ok(skipped > 0);
  assert.equal(replayState(s, skipped).mirroredVotes, 0);
  assert.equal(replayState(s, steps.length - 1).mirroredVotes, 1);
  assert.equal(replayState(scenario('skip'), 99).mirroredVotes, 0);
  const owner = replayState(scenario('owneroverride'), 99);
  assert.equal(owner.ownerVoted, true);
  assert.equal(owner.mirroredVotes, 0);
  assert.equal(owner.outcome, 'Owner vote preserved');
});
test('Against is a real support value and recovery does not invent Lasna requests', () => {
  assert.deepEqual(replayState(scenario('against'), 99).counts, [2, 0, 0]);
  assert.equal(
    buildSteps(scenario('recovery')).some((x) => x.kind === 'request'),
    false,
  );
});
