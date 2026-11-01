# XZoom

<img src="design/logo.png" alt="XZoom logo" width="96">

**1.0.1** · A free, open-source image zoom extension for X, maintained by [GoodExts](https://goodexts.com).

[Installation guide and ready ZIP](https://goodexts.com/blog/xzoom-install) · [中文安装教程](https://goodexts.com/zh/blog/xzoom-install) · [Privacy](PRIVACY.md)

XZoom adds centered mouse-wheel zoom and a small toolbar to X’s native photo preview. It is a standalone extension and does not require XFollower, AgentRelay, an AI service or account configuration.

- Centered wheel zoom and + / − controls, up to 800%.
- Drag enlarged photos, fit the window, or inspect actual pixels with 1:1.
- Request X’s available original image when a photo opens; download it after loading.
- Preserve preview zoom if the original is unavailable, with manual retry.
- Keep native photo navigation, close controls and post details.
- English, 简体中文, Português do Brasil and Español UI, following Chrome’s language.

“Original” means X’s `name=orig` media response. It may already match the preview dimensions; it is not a guarantee of the camera file before upload. Zoom does not add missing detail. Videos, avatars and inline timeline images are outside the scope.

## Version 1.0.1

Localized store titles and summaries now describe image zoom and original-photo downloads in all four languages. The extension homepage points to GoodExts. Photo behavior and site-access scope are unchanged. Store copy and [search-term evidence](tools/store-listing/keywords-20261101.md) are retained with the source.

## Install without a build

1. Download `xzoom-1.0.1.zip` from the [GitHub release](https://github.com/wangsen2020/xzoom/releases/tag/1.0.1) or the [GoodExts guide](https://goodexts.com/blog/xzoom-install), then extract it into a permanent folder.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked**, selecting the extracted folder with `manifest.json` directly inside.
4. Refresh an existing X tab or open a new one, then click a post photo.

When using GitHub’s **Download ZIP** source archive, select the included **dist** folder instead of the repository root. The ready installation ZIP contains `manifest.json` at its root. Keep the loaded folder on disk.

Unpacked extensions do not update automatically. Replace the files in the same folder, reload XZoom in extension management, then refresh X tabs. Remove XZoom from extension management to uninstall. Chrome Web Store 1.0.1 was submitted for review separately. Use the ready ZIP while the listing is pending; a GitHub release does not imply store approval.

## Controls

| Control | Action |
| --- | --- |
| Wheel / toolbar + and − | Zoom around the center of the preview |
| Drag | Move the enlarged image |
| Fit button / keyboard 0 | Fit the full image |
| 1:1 / double-click | Actual pixels / switch fit and actual size |
| Download | Save the loaded original |
| Keyboard + / − | Zoom while the viewer controls have focus |

## Develop and test

Node.js 22 or later:

```sh
npm ci
npm test
npm run build
npm run test:browser
npm run package
```

Load `dist/` in Chrome. The source is in `src/`; build copies the pinned Panzoom distribution and generates four PNG icon sizes from the included Logo. Packaging produces `artifacts/xzoom-1.0.1.zip` and `SHA256SUMS`.

Browser tests use an isolated Chrome profile and the real installed extension with controlled photo responses. Set `CHROME_PATH` if Chrome is not at the default Windows path. They verify center alignment at desktop and narrow widths, original pixels, drag, downloaded bytes, failure/retry and cleanup. Screenshots and test reports are written under ignored `artifacts/acceptance/`; they contain example content only.

## Permissions and credits

Only static content scripts on `https://x.com/*` and `https://twitter.com/*`. There is no background worker and no storage, downloads, tabs, scripting or broad host permission. Browser site access is required to add the controls. The image is fetched from `pbs.twimg.com` while its preview is open. No telemetry, account database or AI connection.

Uses [@panzoom/panzoom 4.6.2](https://github.com/timmywil/panzoom), under MIT. See [third-party notices](THIRD_PARTY_NOTICES.txt). Application code is MIT licensed. The Logo was generated with OpenAI image generation and is included as a project asset; it is not an X trademark.

XZoom is independent of X Corp. Changes to X’s DOM or image delivery may require compatibility updates.

## 中文说明

独立看图插件：在 X 原生图片预览中居中缩放、拖动看细节，支持适应窗口、1:1 与可用原图下载。无需 XFollower 或 AI。安装现成 ZIP 时选择解压后直接含 `manifest.json` 的文件夹；下载仓库源码时选择 `dist`。详细步骤与截图见[中文指南](https://goodexts.com/zh/blog/xzoom-install)。
