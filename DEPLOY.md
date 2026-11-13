# Updating varnadaru.com

The site is a static export (`output: "export"`) hosted on Netafraz DirectAdmin shared hosting
(service 448564, user `varnadar`, folder `/domains/varnadaru.com/public_html`).
Nothing runs on the server; updating = rebuild, zip, upload, extract.

## 1. Change the code (ask Claude Code, or edit yourself)

Edit text in `messages/`, components in `components/`, pages in `app/`.
Preview locally with `npm run dev`.

## 2. Build and pack (in the project folder)

```
npm run build
python scripts/pack.py
```

This produces `varnadaru-site.zip` in the project root (about 740 KiB).

## 3. Upload and extract (DirectAdmin)

Log in: clients.netafraz.com > Services > varnadaru.com > "ورود به دایرکت ادمین".
Then: File Manager (مدیریت فایل) > `domains/varnadaru.com/public_html`.

1. **Clean old files.** Select everything EXCEPT `cgi-bin` and the `*.shtml` stubs
   (400, 401, 403, 404, 500). That means `index.html`, `404.html`, `.htaccess`, `fa`, `en`,
   `_next`, `_not-found`, `404`, `favicon.ico`, `logo.svg`, `logo-1024.png`.
   Click **حذف** with "انتقال به زباله‌دان" (move to trash) ticked.
   Skipping this works too, but old hashed files in `_next` pile up.
2. **Upload.** At the bottom, click "آپلود کردن فایل در دایرکتوری فعلی". Click the first
   **Choose File**, pick `varnadaru-site.zip`, then click the **RIGHT** button
   "آپلود کردن فایل ها". (The left one only adds more file fields and uploads nothing.)
3. **Extract.** Click **خارج کردن** next to the zip, destination `public_html`, confirm.
4. **Delete the zip** from `public_html` (move to trash).

## 4. Check

Open https://varnadaru.com and hard refresh (Ctrl+Shift+R). Check `/fa/`, `/en/`,
`/en/contact/`, and a nonsense URL (should show the custom 404).

Rollback: the old files are in the DirectAdmin trash until emptied, and git has every version
(rebuild an old commit and redo steps 2-4).

---

## Claude in Chrome prompts

Claude in Chrome can't operate the Windows file picker, so **you always do the upload click
yourself** (step 2). Everything else it can do.

### A. Full update (use after you've built the zip)

First do these yourself: DirectAdmin File Manager open on public_html, zip uploaded
(you can see `varnadaru-site.zip` in the listing). Then paste:

```
varnadaru-site.zip is now in /domains/varnadaru.com/public_html/ (visible in File Manager).
Update the live site:
1. List public_html. Move to trash (keep "move to trash" ticked) everything EXCEPT: the zip,
   cgi-bin, and 400/401/403/404/500.shtml. Tell me what you're trashing before you do it.
2. Click "خارج کردن" (Extract) next to varnadaru-site.zip, destination
   /domains/varnadaru.com/public_html. Make sure index.html, 404.html, fa/, en/, _next/,
   favicon.ico, logo.svg, logo-1024.png sit directly in public_html (not in a subfolder; if
   they landed in one, move them up and remove the empty folder).
3. Move the zip to trash. Confirm .htaccess exists (show hidden files if needed).
4. Verify https://varnadaru.com/fa/, /en/, /en/contact/ and a nonsense URL like /xyz (custom
   404). Hard refresh each. Report HTTP result, styling, and any warnings.
Only touch varnadaru.com. Never touch drvarna.ir, billing, nameservers, DNS or passwords.
Report: final public_html contents, what you trashed, each URL's result, any errors.
```

### B. Just verify the live site

```
Open https://varnadaru.com and verify: redirects to /fa/, page renders with styling, /en/ and
/en/contact/ work, a nonsense URL like /xyz shows the custom 404, no certificate or
mixed-content warnings, and http:// redirects to https:// (report if it doesn't). Read-only.
Report results for each URL.
```

### C. Roll back to the previous version

```
In DirectAdmin File Manager for varnadaru.com, open the trash (the "Trash" / "زباله‌دان"
link) and list what's there with dates. DO NOT restore or delete anything yet; report the
list to me and wait for my instruction.
```

### D. Check or fix DNS / SSL

```
In DirectAdmin for varnadaru.com, REPORT the DNS A/AAAA records for the root and www (correct
IP is 185.223.160.25) and the SSL certificate status (issuer, expiry, covers www?). Don't
change anything; ask me first.
```

## Notes

- Do not hand-edit files on the server; the next upload overwrites them.
- `public/.htaccess` is copied into the build; edit it in the repo, not on the server.
- Site URL for metadata lives in `app/[lang]/layout.tsx` (`metadataBase`).
- Renewals: domain and hosting both renew on 1406/08/20 (auto-renew on for the domain).
