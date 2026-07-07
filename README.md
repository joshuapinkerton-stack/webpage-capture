# Web Page Screenshot & Diagnostics

Capture full-page screenshots of any website and get diagnostics in one run. Supports device emulation, dark mode, multiple output formats, and bulk URL processing.

## Features

-   **Full-page or viewport-only** — Capture the entire scrollable page or just what's visible
-   **Device emulation** — iPhone, iPad, Pixel, Galaxy, Surface Pro presets
-   **Dark mode** — Emulates `prefers-color-scheme: dark`
-   **Multiple formats** — PNG (lossless), JPEG (small), WebP (best compression)
-   **Bulk URLs** — Submit up to 100 URLs in one run
-   **Diagnostics** — Each result includes page title, HTTP status code, and load time
-   **Fast mode** — Block images and use `load` event for quick captures

## Use Cases

-   **QA monitoring** — Capture your web app at regular intervals to detect visual regressions
-   **Page archival** — Save snapshots of web pages for compliance, records, or evidence
-   **Competitive monitoring** — Track competitor landing pages, pricing pages, or marketing sites
-   **Reporting** — Include screenshots in client reports, presentations, or dashboards
-   **SEO audits** — Capture how search engines and mobile users see your pages

## Input

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `urls` | array | required | One or more URLs to capture |
| `viewportWidth` | integer | 1280 | Browser width in pixels |
| `viewportHeight` | integer | 720 | Browser height (ignored if fullPage is true) |
| `fullPage` | boolean | true | Capture entire scrollable page |
| `deviceEmulation` | string | none | Device preset (overrides viewport) |
| `format` | string | png | Output format: png, jpeg, or webp |
| `quality` | integer | 85 | JPEG/WebP quality (1-100) |
| `darkMode` | boolean | false | Force dark color scheme |
| `waitUntil` | string | networkidle | Page load strategy |
| `waitAfter` | integer | 1000 | Extra wait in ms after page load |
| `blockImages` | boolean | false | Block images for faster capture |

## Output

Each URL produces a dataset entry with:

```json
{
  "url": "https://example.com",
  "timestamp": "2026-07-06T12:00:00.000Z",
  "screenshotKey": "screenshot-1712345678-a1b2c3",
  "title": "Example Domain",
  "statusCode": 200,
  "loadTimeMs": 1842,
  "error": null
}
```

The screenshot is stored in the actor's key-value store under the `screenshotKey` value. Download it directly or via the Apify API.

## Pricing

-   **capture-start**: $0.01 per run
-   **screenshot-captured**: $0.02 per successful screenshot

A typical run with 5 URLs costs $0.11 (1 x $0.01 + 5 x $0.02).

## Example: Schedule Daily Screenshots

Combine with Apify's scheduled runs to capture your site every morning. Set `fullPage: true`, `format: jpeg`, `quality: 70` for a fast daily archive at minimal cost.

---

Built by [Josh Pinkerton](https://apify.com/fluxcurulin)
