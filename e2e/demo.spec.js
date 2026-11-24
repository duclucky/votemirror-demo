import { test, expect } from '@playwright/test';
test('judge can explore recorded evidence without wallet or RPC access', async ({
  page,
}) => {
  const errors = [],
    rpc = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route(/sepolia\.base\.org|lasna-rpc|alchemy|infura/, (route) => {
    rpc.push(route.request().url());
    return route.abort();
  });
  await page.addInitScript(() => {
    window.ethereum = {
      request: () => {
        throw Error('Demo must never request a wallet');
      },
    };
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Good decisions. Mirrored.' }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Explore the demo', exact: true })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'The filmed end-to-end run',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText('1 mirrored vote recorded', { exact: true }),
  ).toBeVisible();
  await page.locator('#scenario').selectOption('splitmajority');
  await page.locator('[data-step="2"]').click();
  await expect(
    page.getByText('Threshold not reached', { exact: true }),
  ).toBeVisible();
  await page.locator('#step-next').click();
  await expect(
    page.getByText('For reaches the threshold', { exact: true }),
  ).toBeVisible();
  await page.locator('#scenario').selectOption('skip');
  await expect(
    page.getByText('No mirrored vote at this step', { exact: true }),
  ).toBeVisible();
  await page.locator('#scenario').selectOption('owneroverride');
  await expect(
    page.getByText('Owner’s vote preserved', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Transaction evidence', exact: true })
    .click();
  await expect(page.locator('.proof-card')).toHaveCount(10);
  await expect(
    page.getByRole('link', { name: 'Sender recovery', exact: true }),
  ).toHaveAttribute(
    'href',
    /0xba401020d14156ed4b4e2748b4f6d969911aa42691311f5c372290cab2b8cd21/,
  );
  expect(errors).toEqual([]);
  expect(rpc).toEqual([]);
});
test('replay pauses, advances, and stops on navigation', async ({ page }) => {
  await page.goto('/#demo');
  await page.locator('#replay-toggle').click();
  await expect(page.locator('#replay-toggle')).toHaveText('Pause replay');
  await page.locator('#replay-toggle').click();
  await expect(page.locator('.replay-position')).toContainText('Step 1');
  await page.locator('#step-next').click();
  await expect(page.locator('.replay-position')).toContainText('Step 2');
  await page.getByRole('link', { name: 'How to use', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A guide to voting with VoteMirror.' }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Start exploring', exact: true })
    .click();
  await expect(page.locator('#replay-toggle')).toHaveText('Play replay');
});
test('film loads and plays as real video with a caption track', async ({
  page,
}) => {
  await page.goto('/#video');
  const video = page.locator('#demo-film');
  await expect(video).toBeVisible();
  await video.evaluate(async (v) => {
    await v.play();
  });
  await page.waitForFunction(
    () => document.querySelector('video').currentTime > 0.2,
  );
  const state = await video.evaluate((v) => ({
    duration: v.duration,
    paused: v.paused,
    width: v.videoWidth,
    height: v.videoHeight,
    error: v.error?.message,
  }));
  expect(state.duration).toBeCloseTo(165, 0);
  expect(state.paused).toBe(false);
  expect(state.width).toBe(1920);
  expect(state.height).toBe(1080);
  expect(state.error).toBeUndefined();
  await expect(video.locator('track')).toHaveAttribute(
    'src',
    '/media/votemirror-demo.en.vtt',
  );
});
test('desktop and mobile layouts remain usable across every view', async ({
  page,
}) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const tab of ['overview', 'demo', 'proof', 'guide', 'video']) {
      await page.goto(`/#${tab}`);
      await expect(page.locator('h1')).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      expect(overflow, `${tab} at ${width}px`).toBe(false);
    }
    await page.goto('/');
    await page.screenshot({
      path: `.local/overview-${width}.png`,
      fullPage: true,
    });
  }
});
