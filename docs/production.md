# Publicação e validação

Execute `npm ci` e `npm run build`, e publique somente `dist/`. `npm run dev` e `npm run preview` são ferramentas locais, não servidores de produção.

## Hosting estático

- Netlify/Cloudflare Pages: `public/_redirects` define o fallback da SPA, e `public/_headers` define políticas para os arquivos estáticos. Configure build `npm run build`, saída `dist` e a versão Node de `.nvmrc`.
- Vercel: `vercel.json` contém rewrites das rotas existentes, cabeçalhos e diretório de saída.
- Outro servidor: configure fallback para `index.html` nas rotas da aplicação, sirva arquivos estáticos reais antes do fallback e replique os cabeçalhos. Em Nginx, a regra básica é `try_files $uri $uri/ /index.html;`.

Arquivos em `/assets` possuem hash e podem ter cache imutável longo. HTML precisa de revalidação; o catálogo sem hash usa cache curto. Ative gzip/Brotli e HTTPS no provedor. Configure HSTS somente depois de confirmar que o domínio e seus subdomínios suportam HTTPS.

## Política de conteúdo

A CSP permite scripts locais, estilos locais/inline necessários ao React, Google Fonts, imagens de `raw.githubusercontent.com` e consultas à PokeAPI. Bloqueia objetos, enquadramento e destinos inesperados. Se trocar fontes, servidor de sprites ou adicionar uma integração, revise a política junto com a alteração. O preview do Vite não aplica arquivos `_headers`: os cabeçalhos precisam ser verificados no host real.

## Checklist depois da publicação

1. Abrir diretamente `/national`, `/generation/1` e `/pokemon/25`, incluindo reload.
2. Verificar `Content-Type` do catálogo, compressão, cache e cabeçalhos de segurança.
3. Conferir busca, filtros, voltar à lista, tema e imagens em desktop e celular.
4. Simular rede indisponível e confirmar que “Tentar novamente” recupera a tela.
5. Conferir eventuais bloqueios de CSP no console e falhas de carregamento dos chunks.

Nenhum deploy ou alteração de conta externa é feito pelos workflows incluídos. Faltam o provedor/domínio reais para validar DNS, HTTPS, CSP aplicada, CDN e rotas em produção. Os testes E2E são determinísticos, com serviços externos simulados; não provam disponibilidade contínua da PokeAPI ou dos sprites.

## Segurança de dependências

`npm audit` deve ser executado online. Um resultado limpo significa apenas que o registry não reportou vulnerabilidades conhecidas na revisão consultada. A CI de qualidade não depende da disponibilidade do endpoint de auditoria; um workflow separado consulta os avisos semanalmente e sob demanda.

O React Router foi atualizado para uma versão posterior à correção do [aviso de redirecionamento GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6). A validação local de origens internas continua ativa como proteção adicional.

## Descoberta no Google

O domínio canônico é `https://adibdex.com`. O build usa o catálogo versionado e a lista de regiões para gerar o HTML de cada rota e o `dist/sitemap.xml`. A geração falha se faltar uma página ou se o HTML tiver metadados inválidos, duplicados ou uma URL canônica incorreta. A home e os catálogos incluem links para navegação antes de o JavaScript carregar.

Use `npm run seo:audit` para conferir todas as URLs publicadas. Para auditar um preview, use `npm run seo:audit -- https://endereco-do-preview --preview`. O modo preview contabiliza o cabeçalho de não indexação do provedor sem reprovar o HTML da página. O script confere a lista do sitemap e testa cada página por HTTP, incluindo resposta 200, URL canônica de produção, metadados e conteúdo inicial.

No Search Console, envie `https://adibdex.com/sitemap.xml` na propriedade do domínio. Use a Inspeção de URL na versão canônica para comparar o último rastreamento com a página publicada. O Google decide quais páginas indexar.
