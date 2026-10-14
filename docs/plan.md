# Plano de Desenvolvimento: Site de Sustentabilidade e Conscientização Local

## 1. Visão Geral do Projeto
Desenvolver uma página web simples, acessível e responsiva voltada para a comunidade local. O site tem como objetivo educar sobre reciclagem, descarte correto de resíduos, consumo consciente e dicas práticas para evitar o desperdício (alimentos, água e energia), além de registrar o engajamento dos visitantes.

## 2. Stack Tecnológica
- **Front-end:** HTML5, CSS3 (com design responsivo/flexbox) e JavaScript (Vanilla).
- **Banco de Dados / Backend as a Service:** Supabase (para armazenamento dos registros de participação).
- **Hospedagem / Divulgação:** Vercel, Netlify ou GitHub Pages (com link compartilhável).

## 3. Funcionalidades Planejadas
1. **Página Informativa:** Seções claras com dicas de sustentabilidade, separação de lixo, economia de recursos e consumo consciente.
2. **Formulário de Participação:** Campo para o visitante inserir seu nome/contato e confirmar o apoio à iniciativa.
3. **Contador de Participantes:** Exibição dinâmica na tela do número total de pessoas cadastradas (buscado diretamente do Supabase).
4. **Avaliação de Impacto:** Métricas baseadas na quantidade de registros e no feedback dos usuários.

## 4. Etapas de Implementação (Passo a Passo para a IA)

### Fase 1: Estrutura Base (HTML & CSS)
- [x] Criar a estrutura HTML semântica (`Index.html`) dividida em seções: Cabeçalho, Sobre, Dicas de Sustentabilidade, Formulário de Participação e Rodapé.
- [x] Estilizar a página com CSS (`assets/styles/styles.css`), garantindo acessibilidade, bom contraste, tipografia legível e design responsivo (Mobile First).

### Fase 2: Lógica Front-end e Interatividade (JavaScript)
- [x] Criar o script (`assets/js/script.js`) para capturar o envio do formulário.
- [x] Adicionar validações básicas nos campos de entrada.

### Fase 3: Integração com o Supabase
- [x] Configurar o cliente Supabase no projeto via CDN ou módulo JS.
- [x] Confirmar a tabela e a função de contagem no Supabase; o endpoint do projeto respondeu com a contagem atual. `docs/supabase.sql` contém o SQL para provisionar ou reconfigurar o esquema.
- [x] Implementar a função para **inserir** um novo registro no banco ao enviar o formulário.
- [x] Implementar a função para **contar e exibir** em tempo real o número total de participantes cadastrados na página.

### Fase 4: Ajustes Finais e Testes
- [x] Realizar testes de responsividade em 320, 360, 390, 420, 700, 768, 1024 e 1440 px; não foi encontrada rolagem horizontal.
- [x] Verificar a acessibilidade: estrutura semântica, hierarquia de títulos, nomes de links, associação dos rótulos aos campos, estados anunciados e contraste do placeholder do formulário.
- [ ] Preparar instruções para publicação do site.