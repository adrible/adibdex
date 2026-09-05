# AdibDex

Pokédex em português com catálogo nacional (1.025 espécies), formas regionais, Mega/Primal e Gigantamax, filtros e detalhes obtidos da PokeAPI.

## Executar localmente

Requisitos: Node.js 24.18.0 e npm 11.16.0 (versões de referência em `.nvmrc` e `package.json`). Use apenas npm; o lockfile oficial é `package-lock.json`.

```sh
npm ci
npm run dev
```

Abra http://127.0.0.1:8080. Nenhuma variável de ambiente, credencial ou banco é necessário. Listas usam o catálogo versionado; detalhes e imagens precisam de acesso à internet.

## Verificação

```sh
npm run typecheck
npm run lint
npm run format:check
npm run test:coverage
npm run build
npx --no-install playwright install chromium
npm run test:e2e
npm audit
```

Os E2E iniciam automaticamente um preview local na porta 8080 e **exigem um build atualizado**. Feche outro servidor nessa porta antes de executá-los. No Linux de CI, use `playwright install --with-deps chromium`.

Testes cobrem filtros, estado salvo inválido, storage bloqueado, paginação durante carregamento, busca além da primeira página, retorno dos detalhes, falhas HTTP, recuperação e cancelamento compartilhado. Relatórios ficam em `coverage/` e `playwright-report/`. Serviços externos são simulados nos testes; faça também o checklist do host real.

## Manutenção

- `npm run data:generate`: atualiza o JSON compacto a partir do commit oficial fixado no script. Revise o diff antes de publicar.
- `npm run images:convert`: converte os originais de `assets/backgrounds` para os WebP em `public/backgrounds`. Não é executado automaticamente no build.
- `npm run format`: formata código e configuração.
- A CI verifica qualidade, testes e build. A auditoria online tem workflow semanal separado. O conversor manual entrega um artefato; não faz commits ou push automático.

**Regra de produto:** estágio evolutivo ausente é tratado como **Básico**, inclusive nas formas sem enriquecimento. Essa regra tem testes e não deve ser removida como “dado inválido”.

## Documentação

- [Arquitetura, regras e atualização dos dados](docs/architecture.md)
- [Publicação, cabeçalhos e verificações de produção](docs/production.md)

Stack: React 18, TypeScript estrito, React Router, TanStack Query, Vite, Tailwind CSS, Radix UI, Zod, Vitest e Playwright. As versões exatas instaladas ficam no lockfile.

Dados: [PokeAPI](https://pokeapi.co/) e seu [repositório oficial](https://github.com/PokeAPI/pokeapi). Sprites: [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon e os nomes relacionados pertencem aos respectivos titulares; este é um projeto independente.
