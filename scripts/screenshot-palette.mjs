// Screenshot the search palette open + Texas selected.
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
  await new Promise(r => setTimeout(r, 4000));

  // Trigger Cmd-K via direct CustomEvent
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('cassandra-jump')));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: '/tmp/cassandra-palette.png' });
  console.log('wrote /tmp/cassandra-palette.png');

  // Type "tex" and screenshot
  await page.keyboard.type('tex', { delay: 30 });
  await new Promise(r => setTimeout(r, 250));
  await page.screenshot({ path: '/tmp/cassandra-palette-tex.png' });
  console.log('wrote /tmp/cassandra-palette-tex.png');

  // Press Enter to select Texas, wait for fly-to to complete
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 1400));
  await page.screenshot({ path: '/tmp/cassandra-tx.png' });
  console.log('wrote /tmp/cassandra-tx.png');
} finally {
  await browser.close();
}
