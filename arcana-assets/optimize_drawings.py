from pathlib import Path
from PIL import Image, ImageOps
import re, json, unicodedata

root = Path('/home/ubuntu/webdev-static-assets/desenhos/Desenhos')
out = Path('/home/ubuntu/webdev-static-assets/desenhos-optimized')
out.mkdir(parents=True, exist_ok=True)


def slug(text: str) -> str:
    normalized = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    normalized = re.sub(r'[^a-zA-Z0-9]+', '-', normalized).strip('-').lower()
    return normalized or 'desenho'

items = []
for folder in sorted([p for p in root.iterdir() if p.is_dir()], key=lambda p: p.name.lower()):
    category_slug = slug(folder.name)
    for idx, path in enumerate(sorted([p for p in folder.iterdir() if p.is_file()], key=lambda p: p.name.lower()), start=1):
        base = f'{category_slug}-{idx:02d}-{slug(path.stem)[:36]}'
        target = out / f'{base}.webp'
        try:
            with Image.open(path) as im:
                im = ImageOps.exif_transpose(im).convert('RGB')
                im.thumbnail((1500, 1500), Image.Resampling.LANCZOS)
                im.save(target, 'WEBP', quality=82, method=6)
                items.append({
                    'id': base,
                    'category': folder.name,
                    'categorySlug': category_slug,
                    'file': path.name,
                    'output': target.name,
                    'width': im.width,
                    'height': im.height,
                })
        except Exception as exc:
            print(f'SKIP {path}: {exc}')

(Path('/home/ubuntu/webdev-static-assets/desenhos-manifest.json')).write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'optimized={len(items)}')
print(f'original_mb={sum(p.stat().st_size for p in root.rglob("*" ) if p.is_file())/1024/1024:.1f}')
print(f'optimized_mb={sum(p.stat().st_size for p in out.glob("*.webp"))/1024/1024:.1f}')
