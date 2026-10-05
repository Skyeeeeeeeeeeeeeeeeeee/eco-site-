#!/usr/bin/env python3
"""Постобработка рендера: RGBA 2400x2400 -> 900 и 450 px (прозрачный PNG).
Ресайз Lanczos (RGBA ресайзится с премультипликацией, без тёмной каймы).
Лимит 400 КБ для 900 px: pngquant (если есть), иначе понижение разрядности RGB (8 -> 7 -> 6 бит) при полном альфа-канале,
чтобы мягкая тень не получала полос."""
import io, os, shutil, subprocess, sys
from PIL import Image, ImageOps

src, out900, out450 = sys.argv[1:4]
LIMIT = 400 * 1024

def encode(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True, compress_level=9); return b.getvalue()

def poster(im, bits):
    r, g, b, a = im.split()
    p = ImageOps.posterize(Image.merge('RGB', (r, g, b)), bits)
    return Image.merge('RGBA', (*p.split(), a))

def write(im, path, limit):
    data = encode(im)
    if len(data) > limit and shutil.which('pngquant'):
        tmp = path + '.tmp.png'; im.save(tmp)
        subprocess.run(['pngquant', '--force', '--quality=80-98', '--output', path, tmp], check=False)
        os.remove(tmp)
        if os.path.exists(path) and os.path.getsize(path) <= limit:
            return
    for bits in (7, 6, 5):
        if len(data) <= limit * 0.95: break
        data = encode(poster(im, bits))
    with open(path, 'wb') as f: f.write(data)
    if len(data) > limit: print('WARN: %s = %d KB > limit' % (path, len(data) // 1024), file=sys.stderr)

im = Image.open(src).convert('RGBA')
write(im.resize((900, 900), Image.LANCZOS), out900, LIMIT)
write(im.resize((450, 450), Image.LANCZOS), out450, LIMIT)
