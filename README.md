# projeto-sustentabilidade

Projeto de extensão de ADS voltado à conscientização sobre sustentabilidade, reciclagem, descarte correto de resíduos e consumo consciente por meio de uma página web.

## Configurar o Supabase

1. O projeto Supabase conectado já respondeu à consulta da contagem. Para provisionar ou reconfigurar o esquema em outro projeto, abra **SQL Editor**, cole o conteúdo de [`docs/supabase.sql`](docs/supabase.sql) e execute para criar a tabela, as permissões e a contagem em tempo real.
2. A URL do projeto e a chave **publishable** são configuradas em [`assets/js/supabase-config.js`](assets/js/supabase-config.js). Esse arquivo é carregado pelo navegador: use somente uma chave pública `sb_publishable_` ou a chave `anon` legada. **Nunca** coloque uma chave `service_role` ou `sb_secret_` no front-end.
3. Sirva a pasta do projeto por HTTP ou HTTPS para que o navegador carregue os módulos JavaScript; abrir `Index.html` diretamente como arquivo não funciona com imports de módulos.

O formulário registra a visita armazenando somente o nome. A contagem é consultada por uma função que expõe apenas o total, sem conceder leitura pública dos nomes.
