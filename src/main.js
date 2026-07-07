import { Actor, log } from 'apify';
import { chromium, devices } from 'playwright';

// Device presets mapped to Playwright device descriptors
const DEVICE_MAP = {
  'iPhone 15 Pro Max': 'iPhone 15 Pro Max',
  'iPhone 15 Pro': 'iPhone 15 Pro',
  'iPhone SE': 'iPhone SE',
  'Pixel 9 Pro': 'Pixel 9 Pro',
  'Samsung Galaxy S24': 'Samsung Galaxy S24',
  'iPad Pro 13': 'iPad Pro (13-inch) (M4)',
  'iPad Mini': 'iPad Mini',
  'Surface Pro 9': 'Surface Pro 9',
};

await Actor.main(async () => {
  const input = await Actor.getInput();

  const {
    urls = [],
    viewportWidth = 1280,
    viewportHeight = 720,
    fullPage = true,
    deviceEmulation = 'none',
    format = 'png',
    quality = 85,
    darkMode = false,
    waitUntil = 'networkidle',
    waitAfter = 1000,
    blockImages = false,
  } = input || {};

  if (!urls || urls.length === 0) {
    throw new Error('No URLs provided. Please provide at least one URL in the "urls" field.');
  }

  // --- Charge PPE events ---
  // One "capture-start" event per run
  await Actor.charge({ eventName: 'capture-start' });

  // Launch browser with Playwright
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  // Build a shared context config (same for all URLs in this run)
  const contextOptions = {};
  if (deviceEmulation && deviceEmulation !== 'none' && DEVICE_MAP[deviceEmulation]) {
    const deviceConfig = devices[DEVICE_MAP[deviceEmulation]];
    if (deviceConfig) {
      Object.assign(contextOptions, deviceConfig);
    }
  } else {
    contextOptions.viewport = { width: viewportWidth, height: viewportHeight };
  }
  if (darkMode) {
    contextOptions.colorScheme = 'dark';
  }

  const context = await browser.newContext(contextOptions);

  const results = [];

  try {
    for (const rawUrl of urls) {
      const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      const result = {
        url,
        timestamp: new Date().toISOString(),
        screenshotKey: null,
        title: null,
        statusCode: null,
        loadTimeMs: null,
        error: null,
      };

      try {
        const page = await context.newPage();

        // Block images if requested
        if (blockImages) {
          await page.route('**/*.{png,jpg,jpeg,gif,svg,webp,ico}', (route) => route.abort());
        }

        const startTime = Date.now();

        const response = await page.goto(url, {
          waitUntil,
          timeout: 60000,
        });

        const loadTimeMs = Date.now() - startTime;
        result.loadTimeMs = loadTimeMs;
        result.statusCode = response?.status() || null;
        result.title = await page.title().catch(() => null);

        // Extra wait for lazy content
        if (waitAfter > 0) {
          await page.waitForTimeout(waitAfter);
        }

        // Capture screenshot
        const screenshotOpts = {
          type: format,
          fullPage,
        };
        if (format !== 'png') {
          screenshotOpts.quality = quality;
        }

        const screenshotBuffer = await page.screenshot(screenshotOpts);

        // Store in key-value store
        const safeKey = `screenshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await Actor.setValue(safeKey, screenshotBuffer, { contentType: `image/${format === 'jpg' ? 'jpeg' : format}` });
        result.screenshotKey = safeKey;

        await page.close();

        // Charge per-screenshot event
        await Actor.charge({ eventName: 'screenshot-captured' });
      } catch (err) {
        result.error = err.message || String(err);
      }

      results.push(result);
      Actor.pushData(result);
    }
  } finally {
    await context.close();
    await browser.close();
  }

  log.info(`Captured ${results.filter(r => !r.error).length}/${results.length} screenshots successfully.`);
});
