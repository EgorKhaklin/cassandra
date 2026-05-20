// Compare label placement across layer modes.
import puppeteer from 'puppeteer-core';

const CHROME = '/Users/vanta/.cache/puppeteer/chrome/mac_arm-143.0.7499.40/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--enable-webgl',
         '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=metal',
         '--disable-features=PaintHolding'],
  defaultViewport: { width: 1600, height: 1000, deviceScaleFactor: 1 },
});

try {
  const page = await browser.newPage();
  await page.goto('http://localhost:3939/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => !document.body.innerText.includes('INITIALIZING GEOSPATIAL CORE'),
    { timeout: 20_000 }
  );
  await new Promise(r => setTimeout(r, 5000)); // let scene settle

  // EXTRUSION (default)
  await page.screenshot({ path: '/tmp/cas-ext.png' });
  console.log('extrusion → /tmp/cas-ext.png');

  // Click CHOROPLETH
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.trim() === 'CHOROPLETH');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500)); // let mesh.scale.z lerp settle
  await page.screenshot({ path: '/tmp/cas-cho.png' });
  console.log('choropleth → /tmp/cas-cho.png');

  // Click SURFACE
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.trim() === 'SURFACE');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: '/tmp/cas-sur.png' });
  console.log('surface → /tmp/cas-sur.png');
} finally {
  await browser.close();
}
