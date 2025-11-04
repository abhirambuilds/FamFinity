# Favicon Generation

This file is a placeholder. You need to add `favicon.png` (256x256 PNG) to this directory.

To generate `favicon.png` from the existing `logo-mark.svg`:

1. Open `logo-mark.svg` in an image editor (e.g., Inkscape, GIMP, or online tool like https://convertio.co/svg-png/)
2. Export/resize to 256x256 pixels
3. Save as `favicon.png` in this directory (`frontend/public/`)

Alternatively, use a command-line tool:
```bash
# Using ImageMagick (if installed)
convert -background none -resize 256x256 logo-mark.svg favicon.png

# Or using Inkscape CLI
inkscape logo-mark.svg --export-type=png --export-filename=favicon.png -w 256 -h 256
```

The build will work without this file (browser will use SVG fallback), but `favicon.png` is recommended for better browser compatibility.
