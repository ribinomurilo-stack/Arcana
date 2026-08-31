from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

root = Path('/home/ubuntu/webdev-static-assets/desenhos/Desenhos')
out = Path('/home/ubuntu/webdev-static-assets/desenhos-contact-sheet.jpg')
items = []
for folder in sorted([p for p in root.iterdir() if p.is_dir()], key=lambda p: p.name.lower()):
    files = sorted([p for p in folder.iterdir() if p.is_file()])
    if files:
        items.append((folder.name, files[0]))

thumb_w, thumb_h = 220, 260
cols = 4
rows = (len(items) + cols - 1) // cols
sheet = Image.new('RGB', (cols * thumb_w, rows * thumb_h), '#f2eee7')
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default()
for i, (label, path) in enumerate(items):
    x = (i % cols) * thumb_w
    y = (i // cols) * thumb_h
    try:
        with Image.open(path) as im:
            im = im.convert('RGB')
            im.thumbnail((thumb_w - 24, thumb_h - 56))
            tile = Image.new('RGB', (thumb_w - 24, thumb_h - 56), '#ded8cd')
            tile.paste(im, ((tile.width - im.width) // 2, (tile.height - im.height) // 2))
            sheet.paste(tile, (x + 12, y + 10))
    except Exception:
        draw.rectangle((x + 12, y + 10, x + thumb_w - 12, y + thumb_h - 46), fill='#c9c1b5')
    draw.text((x + 12, y + thumb_h - 38), label[:28], fill='#20211f', font=font)
    draw.text((x + 12, y + thumb_h - 23), path.name[:28], fill='#646058', font=font)

sheet.save(out, quality=90)
print(out)
