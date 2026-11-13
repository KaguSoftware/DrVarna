"""Zip the static build (out/) into varnadaru-site.zip, including dotfiles like .htaccess.

Run from the project root after `npm run build`:  python scripts/pack.py
"""
import os
import sys
import zipfile

OUT = "out"
ZIP = "varnadaru-site.zip"

if not os.path.isfile(os.path.join(OUT, "index.html")):
    sys.exit("out/index.html not found. Run `npm run build` first.")
if not os.path.isfile(os.path.join(OUT, ".htaccess")):
    sys.exit("out/.htaccess missing. Check public/.htaccess exists, then rebuild.")

if os.path.exists(ZIP):
    os.remove(ZIP)

count = 0
with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(OUT):
        for f in files:
            p = os.path.join(root, f)
            z.write(p, os.path.relpath(p, OUT).replace(os.sep, "/"))
            count += 1

print(f"Wrote {ZIP}: {count} files, {os.path.getsize(ZIP) // 1024} KiB")
