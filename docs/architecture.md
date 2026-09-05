# Arquitetura e decisões

Aplicação estática React + TypeScript. Não há backend próprio, autenticação, banco de dados ou segredo necessário para executar o projeto.

## Fluxo de dados

1. As rotas são carregadas sob demanda pelo React Router.
2. Listagens nacional, por geração, regionais, Mega e Gmax consultam o catálogo compacto em `public/data/catalog.json`. Não fazem uma requisição por Pokémon.
3. `features/catalog` valida e migra o estado salvo, combina busca/filtros, ordena e pagina. A página salva só é limitada após uma resposta bem-sucedida. Navegação de detalhes recebe a lista filtrada completa.
4. Detalhes, encontros, habilidades, ataques e evoluções continuam consultando a PokeAPI sob demanda. React Query controla estados de carregamento, erro, retry e cache de UI.
5. O transporte compartilhado valida respostas com Zod, limita a seis operações simultâneas e aplica timeout de 15 segundos após sair da fila. Consumidores compartilham a requisição, mas só a saída do último consumidor cancela o transporte. Erros não entram no cache.

## Organização

| Pasta                  | Responsabilidade                                               |
| ---------------------- | -------------------------------------------------------------- |
| `src/pages`            | Composição de rotas e apresentação específica de cada catálogo |
| `src/components`       | Interface reutilizável; `filters` contém as partes do painel   |
| `src/features/catalog` | Estado validado, migração, filtros e paginação compartilhados  |
| `src/lib/pokemon`      | Tipos, classificações e listas de formas mantidas pelo produto |
| `src/lib/pokeapi`      | Transporte, schemas e projeções por recurso                    |
| `src/test` / `e2e`     | Testes unitários, integração de hooks e navegação em Chromium  |
| `scripts`              | Geração explícita do catálogo e conversão de imagens           |
| `assets/backgrounds`   | PNG originais; não são copiados para o build                   |
| `public`               | Somente arquivos usados na distribuição estática               |

`src/lib/pokeapi.ts` é uma fachada pública de exports, não um módulo com todas as responsabilidades.

## Regras preservadas

- Estágio evolutivo ausente significa **Básico**. As formas alternativas continuam sem enriquecimento de estágio; não se deve deduzir outro estágio automaticamente.
- As bases nacionais têm estágio calculado pelos predecessores presentes no snapshot oficial. O terceiro estágio e os posteriores são agrupados em `stage2`, como antes.
- Mega e Gmax filtram pelo ID da espécie base. A ordenação por número agrupa formas após sua base, inclusive na ordem decrescente.
- Classificações especiais são listas editoriais do projeto. Não foram redefinidas nesta refatoração.
- Filtros invisíveis em determinada tela não restringem seus resultados.

## Atualização do catálogo

`npm run data:generate` usa cinco CSVs do repositório oficial [PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi/tree/d4f9a4af58ade123fbc0558f68b1c69daa97d9e4/data/v2/csv), fixados por SHA completo. O JSON registra sua origem; a geração valida os 1.025 IDs nacionais, duplicatas, atributos e formas regionais antes de substituir o arquivo.

Para atualizar, escolha e revise um novo commit oficial, altere a revisão padrão no script (ou use `POKEAPI_DATA_REVISION` com um SHA completo), gere novamente e revise o diff do JSON. Não há consulta de dados durante `npm run build` ou CI normal.

O snapshot inicial tem 1.209 registros. O slug editorial `meowstic-mega` não existe nesses CSVs e é avisado pelo gerador; nenhum registro foi inventado para preenchê-lo. Novas formas ou diferenças de nomenclatura precisam de revisão dos dados editoriais e regeneração. Um snapshot não promete acompanhar automaticamente novas publicações da API.

## Limites e manutenção

- Cache de transporte: até 100 respostas tipadas/sem campos não utilizados, expiração em cinco minutos. Catálogo: uma resposta, uma hora. React Query mantém dados de tela separadamente, com coleta após inatividade.
- Persistência é opcional: exceções de storage e valores inválidos nunca devem derrubar a UI. O tema usa localStorage; cada catálogo usa um único registro versionado em sessionStorage.
- Descrições dependem dos idiomas disponibilizados pela PokeAPI. A ausência real de texto é diferente de erro de rede.
- A linha evolutiva mantém a representação existente por estágios e a primeira condição devolvida pela API. Não representa todas as variantes de condições ou regras de cada jogo; essa ampliação exige uma evolução de produto própria.
- Mudanças visuais não foram objetivo desta revisão. Foram preservados estrutura de telas, cores, fundos e estilos; estados de erro/vazio e atributos de acessibilidade foram melhorados.
