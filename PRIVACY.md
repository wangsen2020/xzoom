# XZoom privacy

Version 1.0.0 · November 1, 2026

XZoom adds controls to photo previews on x.com and twitter.com. It reads the current photo URL and preview dimensions in the page so it can display and zoom the image. It does not send post text, account details, browsing history or image data to GoodExts or an AI service.

When a photo preview opens, the extension requests the available original from `https://pbs.twimg.com/media/…?name=orig`, X’s image CDN. These requests omit credentials and the referrer. X and its CDN receive ordinary network metadata such as your IP address. The image stays in browser memory while the preview is open. Downloading uses a local Blob and the browser’s normal download flow.

No extension analytics, advertising, tracking, account database or persistent user-content storage is included. XZoom has no background service. Closing or switching photos aborts pending original requests and releases the displayed image URL. Download object URLs expire shortly after use.

Links to the installation guide and source repository open GoodExts and GitHub. Those websites have separate privacy policies. Website analytics on GoodExts are separate from this extension.

The extension matches X pages because it needs to add photo controls. It does not request Chrome storage, tabs, downloads or scripting permissions. It does not post, follow, comment or change account settings.

Questions: [GoodExts contact](https://goodexts.com/contact-us).
