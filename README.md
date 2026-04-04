# AdibDex 

O AdibDex é uma Pokédex moderna, rápida e completa, desenvolvida para oferecer uma experiência muito mais avançada do que as Pokédex tradicionais. O projeto combina uma interface limpa com um sistema robusto de dados, permitindo explorar Pokémon de forma intuitiva, detalhada e eficiente, tanto no desktop quanto no mobile.

A aplicação foi pensada para ser altamente funcional, trazendo filtros inteligentes, navegação consistente e suporte completo às diferentes formas existentes no universo Pokémon, como Mega Evolutions, Gigantamax, formas regionais e Primal forms. Além disso, a experiência do usuário foi cuidadosamente construída para manter sempre o contexto de navegação, evitando comportamentos confusos ao explorar diferentes Pokémon.

Um dos principais diferenciais do AdibDex é o sistema avançado de filtros. É possível buscar Pokémon por tipo, fraquezas, vantagens contra determinados tipos, além de classificações específicas como lendários, míticos, pseudo-lendários, iniciais, ultra beasts, paradox e baby Pokémon. Todos esses filtros podem ser combinados entre si e funcionam perfeitamente junto com paginação e ordenação, permitindo uma navegação rápida mesmo com grandes volumes de dados.

A parte de batalha também recebe bastante atenção. Cada Pokémon possui sua move pool organizada por jogo ou geração, separando movimentos aprendidos por level, por TM/HM e por breeding (egg moves). Ao clicar em um movimento ou habilidade, o usuário pode visualizar uma descrição detalhada do efeito, sem redundância de informações já exibidas. Essas descrições ainda são automaticamente traduzidas de acordo com o idioma do usuário, mantendo a acessibilidade global da aplicação.

Outro ponto importante é o tratamento correto das formas alternativas. A cadeia evolutiva se adapta dinamicamente à forma visualizada, garantindo consistência — por exemplo, um Pokémon em sua forma regional exibirá apenas evoluções compatíveis com aquela variação, sem misturar com a forma base. Além disso, foram criadas categorias específicas para Mega Evolutions e Gigantamax, funcionando como “regiões” próprias dentro da Pokédex, com ordenação pela National Dex e identidade visual personalizada.

A navegação também foi projetada com atenção especial. O botão de voltar sempre respeita a origem do usuário, mantendo o contexto correto mesmo após navegar entre Pokémon por meio da evolution chain ou outras interações internas. O estado da página — incluindo filtros, ordenação e número da página — é preservado integralmente, evitando frustrações durante o uso.

Em termos de performance, o AdibDex utiliza paginação como padrão, carregamento sob demanda (lazy loading), divisão de código (code splitting) e otimização de imagens para garantir tempos de resposta rápidos e baixo consumo de dados, especialmente em dispositivos móveis. O sistema também inclui um toggle de sprites shiny, que alterna entre versões normais e brilhantes sem causar desalinhamento visual.

Por fim, o projeto utiliza dados estruturados da PokeAPI e segue como referência visual e organizacional o Pokémon Database, garantindo consistência, precisão e familiaridade para os usuários.

O objetivo do AdibDex é simples: criar uma Pokédex completa, rápida, intuitiva e fiel aos jogos, com uma experiência de uso moderna e altamente funcional.
