export interface ChangelogEntry {
  version: string;
  date?: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.9.4',
    date: '2026-10-31',
    title: 'Ataques, jogos, evoluções e navegação',
    changes: [
      'Busca por ataques aprendidos em todos os catálogos, combinada com os filtros existentes. Pesquise nomes como Surf e Thunderbolt.',
      'Tags abaixo do nome mostram os jogos em que cada ataque pesquisado pode ser aprendido.',
      'Seletor de jogo com pesquisa por nome, opções adaptadas ao celular e remoção rápida do filtro: resultados e tags respeitam o jogo escolhido, preservado ao voltar dos detalhes.',
      'A National Dex usa os mesmos controles das regiões: Paginado/Todos, paginação acima e abaixo da lista e Voltar ao topo.',
      'Métodos de evolução junto às setas, antes do Pokémon de destino, com leitura adaptada ao celular e condições alternativas expansíveis.',
      'Metadados de busca, identificação da AdibDex e sitemap configurados para adibdex.lovable.app.',
      'Os ataques consideram todos os jogos e métodos registrados na fonte; a disponibilidade varia conforme o jogo selecionado.',
    ],
  },
  {
    version: '0.9.3',
    date: '2026-09-05',
    title: 'Mais personalidade nos textos',
    changes: [
      'Títulos, nomes, números e descrições com estilos compartilhados na página inicial, catálogos e detalhes.',
      'Melhor contraste dos textos sobre imagens, etiquetas para os dados e leitura completa de nomes longos.',
    ],
  },
  {
    version: '0.9.2',
    date: '2026-09-05',
    title: 'Um novo visual para evoluir',
    changes: [
      'Quadro evolutivo com moldura de Pokédex, cards coloridos pelos tipos e conexões mais definidas.',
      'Destaque do Pokémon atual, detalhes próprios para o modo shiny e temas claro e escuro.',
    ],
  },
  {
    version: '0.9.1',
    date: '2026-09-05',
    title: 'Evoluções mais claras',
    changes: [
      'Novidades em uma faixa discreta, com o histórico aberto somente quando solicitado.',
      'Quadro evolutivo adaptável às ramificações de cada espécie, incluindo Eevee e Wurmple.',
      'Mega, Primal e Gigantamax aparecem somente para a espécie que está sendo consultada.',
    ],
  },
  {
    version: '0.9.0',
    date: '2026-09-05',
    title: 'Novas formas de explorar',
    changes: [
      'Busca por habilidades normais e ocultas em todos os catálogos.',
      'Catálogo atualizado da PokeAPI, com data de conferência e novas formas detectadas automaticamente.',
      'Linha evolutiva redesenhada, com ramos, condições alternativas e formas especiais organizadas.',
      'Barra de busca, filtros, paginação e estilos compartilhados entre as páginas.',
      'Histórico de novidades disponível na página inicial.',
    ],
  },
  {
    version: '0.8.0',
    title: 'Navegação e estabilidade',
    changes: [
      'Persistência de filtros, página e modo shiny ao voltar dos detalhes.',
      'Catálogo compacto, tratamento de falhas e cancelamento seguro de requisições.',
      'Reorganização dos módulos, testes automatizados e atualização das ferramentas.',
    ],
  },
];

export const VERSION_INFO = { version: CHANGELOG[0].version, changes: CHANGELOG[0].changes };
