# Arcana — Portfolio de Tatuagens

Projeto Arcana exportado do pacote `Arcana-portfolio-completo.zip`.

## Estrutura

- `portfolio-tatuagens/` — aplicação React + Vite + Express + tRPC + Drizzle.
- `arcana-assets/` — assets visuais, fontes, áudio e catálogo exportados do projeto.
- `Arcana-EXPORT-CONFIG.example.json` — modelo das variáveis de ambiente necessárias.
- `README-EXPORTACAO.md` — instruções completas de execução e exportação.

## Autenticação

A aplicação usa OAuth do Manus para autenticar o usuário e cria uma sessão JWT própria no backend. O JWT é armazenado em cookie `HttpOnly`, e as rotas administrativas verificam `ctx.user.role === "admin"` no servidor.

Fluxo resumido:

```text
React → Manus OAuth → /api/oauth/callback → access token → user/openId
     → MySQL → JWT de sessão → HttpOnly cookie → tRPC → autorização
```

## Configuração

Nunca publique valores reais de `JWT_SECRET`, `DATABASE_URL`, chaves de API ou outras credenciais. Use variáveis de ambiente no serviço de hospedagem.

O arquivo de exemplo contém apenas placeholders.

## Desenvolvimento

```bash
cd portfolio-tatuagens
pnpm install --frozen-lockfile
pnpm run dev
```

Validação:

```bash
pnpm run check
pnpm test
pnpm run build
```

## Assets grandes

Os assets do pacote original ocupam aproximadamente 247 MB e incluem imagens, fontes e áudio. Eles não devem ser enviados ao GitHub via uma sequência de arquivos individuais pela API. Para o upload completo, use Git/Git LFS ou a interface de upload do GitHub.
