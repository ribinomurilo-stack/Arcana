# Arcana — arquivos grandes

O pacote original contém cerca de 249,6 MB de arquivos. Os maiores assets são imagens e um arquivo de áudio, todos individuais e abaixo do limite de 100 MB por arquivo do GitHub.

## Estratégia

- Assets binários ficam em `arcana-assets/`.
- `.gitattributes` marca imagens, áudio, vídeo, fontes e ZIP como Git LFS.
- Código-fonte permanece em Git normal.
- Não coloque credenciais, `.env` ou secrets no repositório.

## Maiores arquivos encontrados no pacote

- `arcana-assets/desenhos/Desenhos/GATOS/...png` — ~10,4 MB
- `arcana-assets/atlas-flash-cover-misticos.jpg` — ~8,7 MB
- `arcana-assets/atlas-hero-authorial-guardian.jpg` — ~8,3 MB
- `arcana-assets/atlas-flash-cover-knight-animals.jpg` — ~8,1 MB
- `arcana-assets/atlas-editorial-creature-replacement.jpg` — ~7,9 MB
- `arcana-assets/desenhos/Desenhos/MISTICOS/...png` — ~7,6 MB
- `arcana-assets/atlas-flash-cover-peculiares.jpg` — ~7,2 MB
- `arcana-assets/atlas-contact-authorial-studio.jpg` — ~6,9 MB
- `arcana-assets/atlas-hero-ink.png` — ~6,5 MB
- `arcana-assets/atlas-seal-totem.png` — ~6,0 MB
- `arcana-assets/atlas-studio-shadow.png` — ~5,8 MB
- `arcana-assets/atlas-stamp-detail.png` — ~5,6 MB
- `arcana-assets/arcana-ambient.wav` — ~2,5 MB

## Importante

A API do conector GitHub usada nesta sessão não possui upload de Git LFS nem endpoint de upload binário/release. Portanto, a configuração foi preparada no repositório, mas os bytes dos assets do ZIP não são falsamente declarados como enviados.

Para publicar os assets, execute localmente:

```bash
git lfs install
git clone https://github.com/ribinomurilo-stack/Arcana-Portifolio.git
cd Arcana-Portifolio
# copie o conteúdo de arcana-assets/ do ZIP para o diretório correspondente
git lfs track "*.png" "*.jpg" "*.jpeg" "*.webp" "*.wav" "*.mp3" "*.mp4" "*.mov" "*.woff" "*.woff2"
git add .gitattributes arcana-assets/
git commit -m "Add Arcana portfolio assets"
git push origin main
```
