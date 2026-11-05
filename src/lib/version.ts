export interface ChangelogEntry {
  version: string;
  date?: string;
  title: string;
  changes: string[];
  titleEn: string;
  changesEn: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.9.5',
    date: '2026-11-03',
    title: 'Detalhes mais claros em qualquer tela',
    titleEn: 'Clearer details on every screen',
    changes: [
      'Página do Pokémon reorganizada com atalhos para habilidades, atributos, fraquezas, evoluções, formas, ataques e localizações.',
      'Ataques com seletor de jogo, filtros por método, busca e cartões compactos no celular.',
      'Cada ramificação evolutiva mostra origem, destino e condição, mantendo os caminhos seguintes agrupados.',
      'Cartões mais compactos e com contornos mais visíveis em telas pequenas.',
    ],
    changesEn: [
      'The Pokémon detail page now has shortcuts to abilities, stats, type matchups, evolution, forms, moves, and locations.',
      'Move lists now include a game selector, learning methods, search, and compact mobile cards.',
      'Each evolution branch shows its source, destination, and requirements, with later paths grouped beneath it.',
      'Cards are more compact, with clearer outlines on small screens.',
    ],
  },
  {
    version: '0.9.4',
    date: '2026-10-31',
    title: 'Ataques, jogos, evoluções e navegação',
    titleEn: 'Moves, games, evolution, and navigation',
    changes: [
      'Busca por ataques aprendidos em todos os catálogos, combinada com os filtros existentes. Pesquise nomes como Surf e Thunderbolt.',
      'Tags abaixo do nome mostram os jogos em que cada ataque pesquisado pode ser aprendido.',
      'Seletor de jogo com pesquisa por nome, opções adaptadas ao celular e remoção rápida do filtro: resultados e tags respeitam o jogo escolhido, preservado ao voltar dos detalhes.',
      'A National Dex usa os mesmos controles das regiões: Paginado/Todos, paginação acima e abaixo da lista e Voltar ao topo.',
      'Linha evolutiva com ilustrações em destaque, halos nas cores dos tipos e um percurso mais fluido; métodos nas setas, ramificações identificadas e alternativas expansíveis.',
      'Metadados de busca, identificação da AdibDex e sitemap configurados para adibdex.netlify.app.',
      'Os ataques consideram todos os jogos e métodos registrados na fonte; a disponibilidade varia conforme o jogo selecionado.',
    ],
    changesEn: [
      'Search for learned moves across all catalogs alongside the existing filters. Try names such as Surf or Thunderbolt.',
      'Tags below each Pokémon name show which games teach the searched move.',
      'The game selector supports search, mobile-friendly options, and quick filter removal. Results and tags follow the selected game, which is kept when returning from a detail page.',
      'The National Pokédex now uses the same controls as regional pages: paged or all-at-once views, pagination above and below the list, and a back-to-top button.',
      'The evolution chain has larger artwork, type-colored halos, clearer paths, requirements on arrows, labeled branches, and expandable alternatives.',
      'Search metadata, AdibDex identity, and the sitemap now use adibdex.netlify.app.',
      'Move results include every game and learning method recorded by the source; availability varies by selected game.',
    ],
  },
  {
    version: '0.9.3',
    date: '2026-09-05',
    title: 'Mais personalidade nos textos',
    titleEn: 'A more distinctive type style',
    changes: [
      'Títulos, nomes, números e descrições com estilos compartilhados na página inicial, catálogos e detalhes.',
      'Melhor contraste dos textos sobre imagens, etiquetas para os dados e leitura completa de nomes longos.',
    ],
    changesEn: [
      'Shared typography for titles, names, numbers, and descriptions across the home page, catalogs, and detail pages.',
      'Improved contrast over images, clearer data labels, and better handling of long names.',
    ],
  },
  {
    version: '0.9.2',
    date: '2026-09-05',
    title: 'Um novo visual para evoluir',
    titleEn: 'A new look for evolution',
    changes: [
      'Quadro evolutivo com moldura de Pokédex, cards coloridos pelos tipos e conexões mais definidas.',
      'Destaque do Pokémon atual, detalhes próprios para o modo shiny e temas claro e escuro.',
    ],
    changesEn: [
      'Evolution diagrams now have a Pokédex frame, type-colored cards, and clearer connections.',
      'The current Pokémon is highlighted, with dedicated shiny styling and light and dark themes.',
    ],
  },
  {
    version: '0.9.1',
    date: '2026-09-05',
    title: 'Evoluções mais claras',
    titleEn: 'Clearer evolution paths',
    changes: [
      'Novidades em uma faixa discreta, com o histórico aberto somente quando solicitado.',
      'Quadro evolutivo adaptável às ramificações de cada espécie, incluindo Eevee e Wurmple.',
      'Mega, Primal e Gigantamax aparecem somente para a espécie que está sendo consultada.',
    ],
    changesEn: [
      'Updates are shown in a compact strip, with history available on demand.',
      'Evolution diagrams now adapt to each species’ branches, including Eevee and Wurmple.',
      'Mega, Primal, and Gigantamax forms only appear for the species being viewed.',
    ],
  },
  {
    version: '0.9.0',
    date: '2026-09-05',
    title: 'Novas formas de explorar',
    titleEn: 'New ways to explore',
    changes: [
      'Busca por habilidades normais e ocultas em todos os catálogos.',
      'Catálogo atualizado da PokeAPI, com data de conferência e novas formas detectadas automaticamente.',
      'Linha evolutiva redesenhada, com ramos, condições alternativas e formas especiais organizadas.',
      'Barra de busca, filtros, paginação e estilos compartilhados entre as páginas.',
      'Histórico de novidades disponível na página inicial.',
    ],
    changesEn: [
      'Search for regular and hidden abilities across all catalogs.',
      'Catalog data is refreshed from PokéAPI, with a check date and newly detected forms.',
      'The evolution chain has been redesigned with branches, alternate requirements, and organized special forms.',
      'Search, filters, pagination, and styles are shared across pages.',
      'Release history is available on the home page.',
    ],
  },
  {
    version: '0.8.0',
    title: 'Navegação e estabilidade',
    titleEn: 'Navigation and stability',
    changes: [
      'Persistência de filtros, página e modo shiny ao voltar dos detalhes.',
      'Catálogo compacto, tratamento de falhas e cancelamento seguro de requisições.',
      'Reorganização dos módulos, testes automatizados e atualização das ferramentas.',
    ],
    changesEn: [
      'Filters, page number, and shiny mode persist when returning from detail pages.',
      'Compact catalog cards, improved error handling, and safe request cancellation.',
      'Modules reorganized, automated tests added, and tooling updated.',
    ],
  },
];

export const VERSION_INFO = { version: CHANGELOG[0].version, changes: CHANGELOG[0].changes };
