# AdibDex — A Pokédex de Adib

Pokédex em português com catálogo nacional (1.025 espécies), formas regionais, Mega/Primal e Gigantamax, busca por nome, número, habilidade (inclusive oculta) ou ataque aprendido, filtros e detalhes obtidos da PokeAPI. A página inicial mostra novidades e a data de conferência dos dados.

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

- `npm run data:generate`: gera o JSON compacto a partir do commit oficial fixado no script.
- `npm run data:update`: consulta a revisão mais recente do repositório oficial da PokeAPI e atualiza o catálogo, incluindo habilidades e descoberta de formas. Revise o diff e rode testes/build antes de publicar. Não há atualização ou publicação automática em produção.
- `src/lib/version.ts`: fonte única do changelog da página inicial e da versão no rodapé. A data dos dados vem do catálogo, não da data do release.
- `npm run format`: formata código e configuração.
- A CI verifica qualidade, testes e build. A auditoria online tem workflow semanal separado. O conversor manual entrega um artefato; não faz commits ou push automático.

**Regra de produto:** estágio evolutivo ausente é tratado como **Básico**, inclusive nas formas sem enriquecimento. Essa regra tem testes e não deve ser removida como “dado inválido”.

A busca usa os nomes oficiais em inglês de habilidades e ataques da PokeAPI, como `Overgrow`, `Solar Power`, `Surf` e `Thunderbolt`. Ataques incluem a união dos aprendizados registrados em todos os jogos e métodos (nível, TM/HM, ovo, tutor e outros); o resultado não garante disponibilidade em um jogo específico. O seletor **Jogo**, no painel **Filtros**, restringe os resultados e os ataques ao jogo escolhido; **Todos os jogos** remove essa restrição. Sem pesquisa por ataque, considera os registros de aprendizado no jogo, que podem ser incompletos para algumas formas. Tags abaixo do nome do Pokémon mostram os jogos de cada ataque encontrado, separadamente quando a busca corresponde a vários ataques. Formas sem ataques na fonte mantêm a lista vazia. Não diferencia maiúsculas, acentos, espaços e hífens. O quadro evolutivo se adapta automaticamente às ramificações, mantendo os descendentes de cada ramo agrupados. Transformações Mega/Primal e Gigantamax ficam separadas e pertencem somente à espécie aberta. As novidades aparecem em uma faixa compacta na página inicial; use “Ver alterações” para abrir o histórico e as datas dos dados.

## Documentação

- [Arquitetura, regras e atualização dos dados](docs/architecture.md)
- [Publicação, cabeçalhos e verificações de produção](docs/production.md)

Stack: React 18, TypeScript estrito, React Router, TanStack Query, Vite, Tailwind CSS, Radix UI, Zod, Vitest e Playwright. As versões exatas instaladas ficam no lockfile.

Dados: [PokeAPI](https://pokeapi.co/) e seu [repositório oficial](https://github.com/PokeAPI/pokeapi). Sprites: [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon e os nomes relacionados pertencem aos respectivos titulares; este é um projeto independente.
