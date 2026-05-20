// Verify the collapsible panels: default, right-rail hidden, solo map.
import puppeteer from 'puppeteer-core';

const CHROME = '/Users/vanta/.cache/puppeteer/chrome/mac_arm-143.0.7499.40/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    '--no-sandbox',
    '--enable-unsafe-swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-gl=angle',
    '--use-angle=metal',
    '--disable-features=PaintHolding',
  ],
  defaultViewport: { width: 1600, height: 1000, deviceScaleFactor: 1 },
});

try {
  const page = await browser.newPage();
  await page.goto('http://localhost:3939/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => !document.body.innerText.includes('INITIALIZING GEOSPATIAL CORE'),
    { timeout: 20_000 }
  );
  await new Promise(r => setTimeout(r, 4500));

  await page.screenshot({ path: '/tmp/cas-default.png' });
  console.log('default → /tmp/cas-default.png');

  // Click the right-rail chevron to hide the right rail
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      b => b.getAttribute('aria-label') === 'Hide right rail'
    );
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 450));
  await page.screenshot({ path: '/tmp/cas-rightoff.png' });
  console.log('right hidden → /tmp/cas-rightoff.png');

  // Now also hide the ticker and timeline via their chevrons
  await page.evaluate(() => {
    const labels = ['Hide news ticker', 'Hide timeline', 'Hide legend'];
    for (const label of labels) {
      const btn = Array.from(document.querySelectorAll('button')).find(
        b => b.getAttribute('aria-label') === label
      );
      if (btn) btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 450));
  await page.screenshot({ path: '/tmp/cas-multiple.png' });
  console.log('several hidden → /tmp/cas-multiple.png');

  // Use the SOLO MAP button in the top bar
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent?.includes('SOLO MAP') || b.textContent?.includes('SHOW ALL')
    );
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/tmp/cas-solo.png' });
  console.log('solo map → /tmp/cas-solo.png');

  // SHOW ALL to restore
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent?.includes('SHOW ALL')
    );
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/tmp/cas-restored.png' });
  console.log('restored → /tmp/cas-restored.png');
} finally {
  await browser.close();
}
