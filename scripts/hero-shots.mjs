// Capture a cinematic gallery for the GitHub README.
// Produces docs/screenshots/*.png.

import puppeteer from 'puppeteer-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');

const CHROME =
  '/Users/vanta/.cache/puppeteer/chrome/mac_arm-143.0.7499.40/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

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
  defaultViewport: { width: 1800, height: 1100, deviceScaleFactor: 1 },
});

const wait = (ms) => new Promise(r => setTimeout(r, ms));

try {
  const page = await browser.newPage();
  await page.goto('http://localhost:3939/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => !document.body.innerText.includes('INITIALIZING GEOSPATIAL CORE'),
    { timeout: 25_000 }
  );
  await wait(6000); // let stream settle, scene render, lerp lerp lerp

  // 1) HERO — extrusion mode, default view, all panels visible
  await page.screenshot({ path: path.join(OUT, '01-hero.png') });
  console.log('01-hero.png');

  // 2) Selected state Texas + selection beam + fly-to camera
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('cassandra-jump')));
  await wait(350);
  await page.keyboard.type('texas', { delay: 30 });
  await wait(200);
  await page.keyboard.press('Enter');
  await wait(1600); // fly-to ease
  await page.screenshot({ path: path.join(OUT, '02-selected-texas.png') });
  console.log('02-selected-texas.png');

  // 3) Switch to CHOROPLETH layer
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.trim() === 'CHOROPLETH');
    if (btn) btn.click();
  });
  await wait(1400);
  await page.screenshot({ path: path.join(OUT, '03-choropleth.png') });
  console.log('03-choropleth.png');

  // 4) SURFACE layer (extremity)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.trim() === 'SURFACE');
    if (btn) btn.click();
  });
  await wait(1400);
  await page.screenshot({ path: path.join(OUT, '04-surface.png') });
  console.log('04-surface.png');

  // 5) Solo map — back to extrusion + hide all
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.trim() === 'EXTRUSION');
    if (btn) btn.click();
  });
  await wait(900);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.includes('SOLO MAP'));
    if (btn) btn.click();
  });
  await wait(600);
  await page.screenshot({ path: path.join(OUT, '05-solo-map.png') });
  console.log('05-solo-map.png');

  // 6) Search palette open
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.includes('SHOW ALL'));
    if (btn) btn.click();
  });
  await wait(450);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('cassandra-jump')));
  await wait(400);
  await page.keyboard.type('penn', { delay: 35 });
  await wait(250);
  await page.screenshot({ path: path.join(OUT, '06-palette.png') });
  console.log('06-palette.png');

  // 7) Wide-shot 1800x1100 with a state selected and partial collapse
  await page.keyboard.press('Escape');
  await wait(300);
  // Click California via search
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('cassandra-jump')));
  await wait(300);
  await page.keyboard.type('cali', { delay: 30 });
  await wait(150);
  await page.keyboard.press('Enter');
  await wait(1500);
  await page.screenshot({ path: path.join(OUT, '07-selected-california.png') });
  console.log('07-selected-california.png');
} finally {
  await browser.close();
}
