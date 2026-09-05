# Arquitetura e decisões

Aplicação estática React + TypeScript. Não há backend próprio, autenticação, banco de dados ou segredo necessário para executar o projeto.

## Fluxo de dados

1. As rotas são carregadas sob demanda pelo React Router.
2. Listagens nacional, por geração, regionais, Mega e Gmax consultam o catálogo compacto em `public/data/catalog.json`. Não fazem uma requisição por Pokémon.
3. `features/catalog` valida e migra o estado salvo, combina busca por nome/número/habilidade (inclusive oculta) com filtros, ordena e pagina. A busca usa os nomes oficiais em inglês, normaliza acentos, caixa, espaços e hífens; não traduz habilidades nem faz novas chamadas HTTP. A página salva só é limitada após uma resposta bem-sucedida. Navegação de detalhes recebe a lista filtrada completa.
4. Detalhes, encontros, habilidades, ataques e evoluções continuam consultando a PokeAPI sob demanda. React Query controla estados de carregamento, erro, retry e cache de UI.
5. O transporte compartilhado valida respostas com Zod, limita a seis operações simultâneas e aplica timeout de 15 segundos após sair da fila. Consumidores compartilham a requisição, mas só a saída do último consumidor cancela o transporte. Erros não entram no cache.

## Organização

| Pasta                  | Responsabilidade                                                               |
| ---------------------- | ------------------------------------------------------------------------------ |
| `src/pages`            | Composição de rotas e apresentação específica de cada catálogo                 |
| `src/components`       | Interface reutilizável; `catalog`, `filters` e `evolution` agrupam suas partes |
| `src/features/catalog` | Estado validado, migração, filtros e paginação compartilhados                  |
| `src/lib/pokemon`      | Tipos e classificações editoriais mantidas pelo produto                        |
| `src/lib/pokeapi`      | Transporte, schemas e projeções por recurso                                    |
| `src/test` / `e2e`     | Testes unitários, integração de hooks e navegação em Chromium                  |
| `scripts`              | Geração explícita do catálogo e conversão de imagens                           |
| `assets/backgrounds`   | PNG originais; não são copiados para o build                                   |
| `public`               | Somente arquivos usados na distribuição estática                               |

`src/lib/pokeapi.ts` é uma fachada pública de exports, não um módulo com todas as responsabilidades.

`CatalogPageShell`, `CatalogBrowser`, `CatalogToolbar` e `CatalogPagination` centralizam layout, estados da consulta, busca e controles. As páginas definem somente o recorte de dados, o título e o fundo. Seus estilos ficam no bloco compartilhado de `src/index.css`, assim como os estilos dos painéis evolutivo e de novidades. Cores, fundos e temas existentes foram preservados; o quadro evolutivo ganhou uma nova apresentação.

O changelog é mantido em `src/lib/version.ts`; o rodapé consome a mesma versão. Na página inicial, uma faixa compacta permite abrir/fechar as novidades. Os metadados são consultados apenas ao abrir, pelo mesmo transporte/cache do catálogo, exibindo datas reais de conferência e da revisão da fonte.

## Regras preservadas

- Estágio evolutivo ausente significa **Básico**. As formas alternativas continuam sem enriquecimento de estágio; não se deve deduzir outro estágio automaticamente.
- As bases nacionais têm estágio calculado pelos predecessores presentes no snapshot oficial. O terceiro estágio e os posteriores são agrupados em `stage2`, como antes.
- Mega e Gmax usam a disponibilidade por espécie calculada dos registros oficiais do catálogo. As listas editoriais ficam apenas como fallback para objetos legados sem esses atributos. A ordenação por número agrupa formas após sua base, inclusive na ordem decrescente.
- Classificações especiais são listas editoriais do projeto. Não foram redefinidas nesta refatoração.
- Filtros invisíveis em determinada tela não restringem seus resultados.

## Atualização do catálogo

`npm run data:generate` usa sete CSVs do repositório oficial [PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi/tree/d4f9a4af58ade123fbc0558f68b1c69daa97d9e4/data/v2/csv), fixados por SHA completo: Pokémon, espécies, tipos, vínculos de tipos, atributos, habilidades e vínculos de habilidades. O JSON (schema v2) registra `generatedAt`, `sourceUpdatedAt` e a URL da revisão. A geração valida os 1.025 IDs nacionais, duplicatas, atributos e habilidades das bases antes de substituir o arquivo.

Para atualizar, execute `npm run data:update`. O script resolve o HEAD oficial uma única vez e baixa todos os CSVs daquele mesmo SHA, evitando misturar revisões. É possível reproduzir uma revisão com `POKEAPI_DATA_REVISION` e `npm run data:generate`. Revise o diff e execute os testes antes de publicar. Não há consulta de dados durante `npm run build` ou CI normal. GitHub/API pública precisam estar acessíveis; limites de requisições ou falhas interrompem a geração sem substituir o catálogo anterior.

O snapshot conferido em 05/09/2026 tem 1.217 registros. A revisão da fonte é de 03/09/2026. São oito formas a mais que o catálogo anterior: a descoberta agora usa os identificadores oficiais de formas regionais, Mega/Primal e Gmax, incluindo `meowstic-male-mega` e `meowstic-female-mega`, sem depender de uma lista manual de slugs. Formas alternativas sem habilidade na fonte mantêm a lista vazia; não recebem habilidades inventadas ou herdadas automaticamente. O catálogo continua limitado às 1.025 espécies nacionais suportadas pelo produto; uma nova geração exige revisar esse limite. Um snapshot não acompanha publicações futuras sem regeneração e publicação.

## Limites e manutenção

- Cache de transporte: até 100 respostas tipadas/sem campos não utilizados, expiração em cinco minutos. Catálogo: uma resposta, uma hora. React Query mantém dados de tela separadamente, com coleta após inatividade.
- Persistência é opcional: exceções de storage e valores inválidos nunca devem derrubar a UI. O tema usa localStorage; cada catálogo usa um único registro versionado em sessionStorage.
- Descrições dependem dos idiomas disponibilizados pela PokeAPI. A ausência real de texto é diferente de erro de rede.
- A linha evolutiva conserva os vínculos pai/filho e todos os conjuntos alternativos de condições retornados pela API (incluindo valores zero). `features/evolution/tree.ts` detecta divisões pelos vínculos entre espécies, sem uma lista manual de exceções. Linhas simples usam estágios; divisões usam uma árvore compacta que mantém as continuações de cada ramo juntas (Eevee, Wurmple, divisões tardias etc.). Mega/Primal e Gigantamax aparecem somente quando seu `baseId` corresponde ao `speciesId` do Pokémon aberto: Pikachu Gigantamax não aparece no Pichu nem no Raichu. A seleção de equivalentes regionais continua baseada nas variedades da espécie; não é um simulador das regras de cada jogo. Condições ausentes na API não são inventadas.
- Testes automatizados validam busca por habilidade, persistência, navegação, condições alternativas, ramos, ausência de overflow no celular e o changelog. Imagens/serviços externos são simulados nos E2E; a disponibilidade real dos sprites e regras específicas dos jogos ainda depende das fontes externas.
