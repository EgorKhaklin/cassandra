// Cinematic hero gallery for the GitHub README.
// Produces docs/screenshots/*.png — NO state selected anywhere.

import puppeteer from 'puppeteer-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');

const CHROME =
  '/Users/vanta/.cache/puppeteer/chrome/mac_arm-143.0.7499.40/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

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
});

try {
  // =====================================================================
  // 1) HERO — ultra-wide cinematic. Solo Map, no selection, oblique view.
  // =====================================================================
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 2560, height: 1100, deviceScaleFactor: 1 });
    await page.goto('http://localhost:3939/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => !document.body.innerText.includes('INITIALIZING GEOSPATIAL CORE'),
      { timeout: 25_000 }
    );
    await wait(6500);

    // SOLO MAP — hide all panels, NO state selection.
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes('SOLO MAP'));
      if (btn) btn.click();
    });
    await wait(800);

    // Mute toasts so the hero stays uncluttered.
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes('WARNINGS') || b.textContent?.includes('MUTED'));
      if (btn && btn.textContent?.includes('WARNINGS')) btn.click();
    });
    await wait(400);

    // Hide the top bar too via its chevron — pure canvas hero.
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Hide top bar"]');
      if (btn) btn.click();
    });
    await wait(700);

    await page.screenshot({ path: path.join(OUT, '01-hero.png') });
    console.log('01-hero.png (cinematic, no selection)');
    await page.close();
  }

  // =====================================================================
  // 2-6) Gallery shots at standard 1800x1100. No state selection.
  // =====================================================================
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 1100, deviceScaleFactor: 1 });
    await page.goto('http://localhost:3939/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => !document.body.innerText.includes('INITIALIZING GEOSPATIAL CORE'),
      { timeout: 25_000 }
    );
    await wait(5500);

    // 2) DEFAULT — full HUD, all panels visible, NO selection
    await page.screenshot({ path: path.join(OUT, '02-default.png') });
    console.log('02-default.png (full HUD)');

    // 3) CHOROPLETH — flat color choropleth, no selection
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'CHOROPLETH');
      if (btn) btn.click();
    });
    await wait(1500);
    await page.screenshot({ path: path.join(OUT, '03-choropleth.png') });
    console.log('03-choropleth.png');

    // 4) SURFACE — extremity heights
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'SURFACE');
      if (btn) btn.click();
    });
    await wait(1500);
    await page.screenshot({ path: path.join(OUT, '04-surface.png') });
    console.log('04-surface.png');

    // 5) EXTRUSION restored — for the gallery alongside CHOROPLETH and SURFACE
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'EXTRUSION');
      if (btn) btn.click();
    });
    await wait(1500);
    await page.screenshot({ path: path.join(OUT, '02b-extrusion.png') });
    console.log('02b-extrusion.png');

    // 6) SOLO MAP standard aspect — no panels, no selection
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes('SOLO MAP'));
      if (btn) btn.click();
    });
    await wait(700);
    await page.screenshot({ path: path.join(OUT, '05-solo-map.png') });
    console.log('05-solo-map.png');

    // 7) Search palette open — typing "penn", no commit (no selection)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes('SHOW ALL'));
      if (btn) btn.click();
    });
    await wait(500);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('cassandra-jump')));
    await wait(450);
    await page.keyboard.type('penn', { delay: 35 });
    await wait(250);
    await page.screenshot({ path: path.join(OUT, '06-palette.png') });
    console.log('06-palette.png');

    // 8) Grid OFF vs ON, to show what the GRID button does
    await page.keyboard.press('Escape');
    await wait(300);
    // Currently grid should be ON. Click GRID to toggle off.
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'GRID');
      if (btn) btn.click();
    });
    await wait(500);
    // Now SOLO so we see the grid effect clearly
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes('SOLO MAP'));
      if (btn) btn.click();
    });
    await wait(600);
    await page.screenshot({ path: path.join(OUT, '07-grid-off.png') });
    console.log('07-grid-off.png');

    // Toggle grid ON
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes('SHOW ALL'));
      if (btn) btn.click();
    });
    await wait(400);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'GRID');
      if (btn) btn.click();
    });
    await wait(500);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes('SOLO MAP'));
      if (btn) btn.click();
    });
    await wait(700);
    await page.screenshot({ path: path.join(OUT, '08-grid-on.png') });
    console.log('08-grid-on.png');

    await page.close();
  }
} finally {
  await browser.close();
}
