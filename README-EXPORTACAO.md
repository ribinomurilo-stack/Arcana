# Arcana — pacote completo de exportação

Este arquivo acompanha o projeto **Arcana** para execução local e hospedagem. O pacote inclui o código-fonte React/Express/tRPC, configurações, migrations Drizzle, testes, lockfile, build de produção e a cópia dos assets estáticos associados ao site.

## Execução local

Use Node.js 20 ou superior e pnpm. Na pasta `portfolio-tatuagens`, execute:

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

Para validar e gerar o build:

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```

O script `pnpm run build` gera o frontend em `dist/public` e o servidor em `dist/index.js`.

## Configuração

As variáveis necessárias estão documentadas em `Arcana-EXPORT-CONFIG.example.json`. Não foram incluídos valores reais de banco de dados, autenticação ou API no ZIP. Configure esses valores no ambiente do novo host antes de iniciar o servidor.

## Assets e fontes

A pasta `arcana-assets/` contém a cópia dos assets estáticos disponíveis no ambiente do projeto, incluindo desenhos otimizados, imagens de identidade, manifestos, áudio e demais mídias auxiliares. A subpasta `arcana-assets/fonts/` contém cópias das fontes Cormorant Garamond e DM Sans usadas pela interface; o `client/index.html` ainda mantém o carregamento remoto pelo Google Fonts como fallback. As imagens da aplicação permanecem referenciadas pelos caminhos `/manus-storage/...` definidos no catálogo; em uma hospedagem fora do ecossistema Manus, é necessário manter esses arquivos disponíveis nesse caminho ou substituir as referências em `client/src/data/drawings.ts` pelos arquivos locais de `arcana-assets/`.

## O que não foi incluído

`node_modules/`, `.git/`, `.manus-logs/` e `.project-config.json` foram deixados fora porque são dependências instaladas, metadados de versionamento, logs temporários e configuração que contém credenciais/metadados privados. O `pnpm-lock.yaml`, o diretório `dist/` e todos os arquivos de código, configuração, testes, migrations e documentação foram incluídos.
