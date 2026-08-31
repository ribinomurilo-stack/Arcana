from pathlib import Path
import json, re

manifest = json.loads(Path('/home/ubuntu/webdev-static-assets/desenhos-manifest.json').read_text(encoding='utf-8'))
raw = Path('/home/ubuntu/webdev-static-assets/drawings-upload.txt').read_text(encoding='utf-8')
paths = {}
for match in re.finditer(r'\[SUCCESS\] .*?/([^/]+\.webp) -> (/[A-Za-z0-9_./-]+)', raw):
    paths[match.group(1)] = match.group(2)

items = [dict(item, url=paths[item['output']]) for item in manifest if item['output'] in paths]
labels = {
    'Anões': 'Anões', 'Aqua': 'Aqua', 'Arca': 'Arca', 'Deuses': 'Deuses', 'Dionísio': 'Dionísio',
    'Duendes': 'Duendes', 'Elfos': 'Elfos', 'Ents': 'Ents', 'Fadas': 'Fadas', 'Fruitppl': 'Frutíferos',
    'GATOS': 'Gatos', 'Gnome': 'Gnomos', 'Humanos': 'Humanos', 'MISTICOS': 'Místicos', 'Morvuns': 'Morvuns',
    'Nextron': 'Nextron', 'Projetos': 'Projetos', 'Starman': 'Starman', 'Umbra': 'Umbra', 'Valars(Tolkien)': 'Valars',
    'VIkings': 'Vikings', 'Witches': 'Bruxas'
}
for item in items:
    item['label'] = labels.get(item['category'], item['category'])
    item['title'] = re.sub(r'[_-]+', ' ', Path(item['file']).stem).strip().title()

out = Path('/home/ubuntu/portfolio-tatuagens/client/src/data')
out.mkdir(parents=True, exist_ok=True)
content = "// Atlas de Tinta — catálogo gerado a partir dos desenhos enviados pelo artista.\n"
content += "export type Drawing = { id: string; category: string; categorySlug: string; file: string; url: string; width: number; height: number; label: string; title: string };\n\n"
content += "export const drawings: Drawing[] = " + json.dumps(items, ensure_ascii=False, indent=2) + ";\n\n"
content += "export const categoryOrder = " + json.dumps(list(dict.fromkeys(item['category'] for item in items)), ensure_ascii=False, indent=2) + ";\n"
(out / 'drawings.ts').write_text(content, encoding='utf-8')
print(f'wrote {len(items)} drawings')
