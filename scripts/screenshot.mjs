// Headless screenshot helper. Uses the cached puppeteer chrome-headless-shell.
// Usage: node scripts/screenshot.mjs [url] [outPath]

import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'http://localhost:3939/';
const outPath = process.argv[3] || '/tmp/cassandra-shot.png';
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
  page.on('console', m => {
    const t = m.type();
    if (t === 'error' || t === 'warning') {
      console.error(`[${t}]`, m.text().slice(0, 240));
    }
  });
  page.on('pageerror', err => console.error('[pageerror]', err.message));

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  // Wait for initialize text to be gone (means dynamic 3D bundle loaded).
  try {
    await page.waitForFunction(
      () => !document.body.innerText.includes('INITIALIZING GEOSPATIAL CORE'),
      { timeout: 20_000 }
    );
  } catch { /* keep going — we still want a shot */ }

  // Give the canvas a few seconds of stream ticks so prisms have real colors.
  await new Promise(r => setTimeout(r, 6000));

  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`wrote ${outPath}`);
} finally {
  await browser.close();
}
