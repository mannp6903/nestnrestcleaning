"""Turn one photo into the four files the site uses, cropped to the site's 4:5 frame.

    python3 tools/add_photo.py ~/Downloads/empty-condo.jpg empty-home
    python3 tools/add_photo.py ~/Downloads/stovetop.jpg deep-detail --focus 0.5,0.4

Writes assets/photos/<name>-600.jpg/.webp (600 x 745) and <name>-928.jpg/.webp (928 x 1152), then run
`node tools/build.mjs`: a photo slot switches to the new picture once all four files exist (see hasPhoto() in
tools/build.mjs). --focus x,y (0 to 1) keeps that point of the picture in frame when cropping; the default is the centre.
Needs Pillow with WebP (pip install Pillow). Camera rotation is applied and location data (EXIF) is not copied.
"""
import argparse
import pathlib
import sys

from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "photos"
SIZES = [(600, 745), (928, 1152)]  # the same sizes as the room photos already on the site


def crop_to(im, ratio, fx, fy):
    w, h = im.size
    if w / h > ratio:
        cw, ch = round(h * ratio), h
    else:
        cw, ch = w, round(w / ratio)
    left = min(max(round(fx * w - cw / 2), 0), w - cw)
    top = min(max(round(fy * h - ch / 2), 0), h - ch)
    return im.crop((left, top, left + cw, top + ch))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image", type=pathlib.Path)
    ap.add_argument("name", help="slot name, e.g. empty-home, deep-detail, mann-at-door")
    ap.add_argument("--focus", default="0.5,0.5", help="x,y between 0 and 1 to keep in frame (default centre)")
    a = ap.parse_args()
    if not a.name.replace("-", "").isalnum() or a.name != a.name.lower():
        sys.exit("name: lowercase letters, numbers and hyphens only")
    fx, fy = (float(v) for v in a.focus.split(","))
    im = ImageOps.exif_transpose(Image.open(a.image)).convert("RGB")
    if min(im.size) < 928:
        print(f"note: the photo is only {im.size[0]} x {im.size[1]}; it may look soft at 928 x 1152", file=sys.stderr)
    OUT.mkdir(parents=True, exist_ok=True)
    for w, h in SIZES:
        out = crop_to(im, w / h, fx, fy).resize((w, h), Image.LANCZOS)
        out.save(OUT / f"{a.name}-{w}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
        out.save(OUT / f"{a.name}-{w}.webp", "WEBP", quality=80, method=6)
        print(f"wrote assets/photos/{a.name}-{w}.jpg and .webp ({w} x {h})")


if __name__ == "__main__":
    main()
