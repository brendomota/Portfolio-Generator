# Review — feat/complete-frontend

> Branch revisada contra `main`. Gerado automaticamente via `/code-review` seguindo os padrões definidos em `.claude/code-review/Padrões.md`.

---

## 🔴 Crítico

`🔴 CRÍTICO`

`CorsConfig.java:19-20`: `setAllowedHeaders(List.of("*"))` combinado com `setAllowCredentials(true)` viola a especificação CORS — navegadores rejeitam wildcard de headers quando credenciais estão habilitadas. Cada requisição preflight com o header `Authorization` (Bearer JWT) retorna erro de CORS policy, quebrando **todas** as chamadas autenticadas do front-end.

> **Correção:** substituir `List.of("*")` por `List.of("Authorization", "Content-Type")`.

---

`🔴 CRÍTICO`

`SecurityConfigurations.java:42`: `GET /curriculo/**` liberado sem autenticação expõe a lista completa de todos os currículos cadastrados (incluindo email, LinkedIn, GitHub e bytes do PDF) para qualquer requisição anônima — uma varredura de dados com um único `curl`. A intenção era tornar portfólios públicos, mas o endpoint `/curriculo/` retorna **todos** os registros, de **todos** os usuários.

> **Correção:** criar um endpoint dedicado `/curriculo/publico/{username}` que retorne apenas os campos não-sensíveis do usuário solicitado, e remover o `permitAll` do `/curriculo/**` geral.

---

`🔴 CRÍTICO`

`CurriculoController.java:115`: o endpoint `PATCH /curriculo/{id}` não verifica se o currículo pertence ao usuário autenticado — qualquer usuário com JWT válido pode sobrescrever o portfólio de qualquer outro usuário adivinhando o ID numérico (IDOR / BOLA). Não há nenhuma comparação entre o subject do token e o `curriculo.getUsuario()`.

> **Correção:** extrair o login do token JWT na requisição e validar `curriculo.getUsuario().getLogin().equals(loginDoToken)` antes de prosseguir. Retornar `403 Forbidden` se não bater.

---

## 🟠 Importante

`🟠 IMPORTANTE`

`Portfolio.jsx:12-45`: a função `buscar` é declarada como `async function` direta dentro do componente e é passada para `setInterval` e `addEventListener` sem ser envolvida em `useCallback`. Isso cria um **closure estale**: se `username` mudar (navegação de `/portfolio/alice` → `/portfolio/bob`), o interval e o listener continuam chamando a versão antiga da função, exibindo dados de `alice` na página de `bob` até a próxima re-montagem do componente.

> **Correção:** envolver `buscar` em `useCallback([username])`.

---

`🟠 IMPORTANTE`

`Portfolio.jsx:14`: a página busca **toda** a coleção `/curriculo/` a cada 4 segundos e filtra client-side para encontrar um único registro. Com N usuários, o payload cresce linearmente (incluindo dados de outros usuários). Agravado pelo fato de o endpoint ser público (`permitAll`), bots podem acionar esse scan indefinidamente sem autenticação.

> **Correção:** criar endpoint `GET /curriculo/usuario/{login}` no backend retornando apenas o registro do usuário solicitado, ou ao menos `GET /curriculo/?login={username}` com filtro server-side.

---

`🟠 IMPORTANTE`

`Dashboard.jsx:119`: `handleUpload` faz `GET /usuario/` — que retorna **todos** os usuários cadastrados — apenas para encontrar o ID do usuário logado. Além do custo de banda, isso expõe a lista de logins de todos os usuários ao front-end. O backend já valida o JWT e conhece a identidade do requisitante.

> **Correção:** criar endpoint `GET /usuario/me` que extrai o usuário do token e retorne apenas seu próprio registro. No front, substituir o `GET /usuario/` por `GET /usuario/me`.

---

`🟠 IMPORTANTE`

`Dashboard.jsx:129`: no bloco `handleUpload`, após criar o novo currículo via PDF, o código re-aplica `fotoPerfil` e `imagemFundo` com um PATCH adicional — mas **omite `faviconBase64`**. O favicon previamente carregado é silenciosamente perdido sempre que o usuário faz um novo upload de PDF, sem nenhum aviso ou erro.

> **Correção:** incluir `if (faviconBase64) patch.favicon = faviconBase64` no bloco de re-apply (linha ~131).

---

`🟠 IMPORTANTE`

`CorsConfig.java:17`: a origem CORS está hardcoded como `"http://localhost:5173"`. Em qualquer ambiente diferente de desenvolvimento local (staging, produção, Vercel, Docker) todas as requisições do front-end serão bloqueadas pelo CORS sem possibilidade de configuração via variável de ambiente.

> **Correção:** injetar via `@Value("${cors.allowed-origins:http://localhost:5173}")` e separar múltiplas origens por vírgula.

---

## 🟡 Sugestão

`🟡 SUGESTÃO`

`Dashboard.jsx` (formulário de edição): os 12 campos de input/textarea repetem o mesmo bloco JSX — `className`, `style` inline completo e `onChange={handleCampo}` — copiado manualmente. Qualquer ajuste visual (ex.: cor de foco, padding) exige editar cada cópia. Extrair um componente `FormField({ label, name, value, onChange, rows })` eliminaria a duplicação e tornaria o código mais fácil de manter.

---

`🟡 SUGESTÃO`

`Dashboard.jsx` (estilo dos inputs): as mesmas propriedades CSS estão declaradas duas vezes — no `style={{}}` do elemento (linha ~335) e na tag `<style>` com `!important` (linha ~185). O `!important` sempre vence, tornando o `style` prop ineficaz — qualquer edição no `style={{}}` não produz efeito visual. Consolidar em um único ponto (preferencialmente no arquivo `.css`).

---

`🟡 SUGESTÃO`

`CurriculoController.java` (método PATCH): 13 blocos `if (campo != null) { set(campo) }` estruturalmente idênticos. Adicionar um campo novo na entidade exige escrever manualmente um novo bloco — e esquecê-lo deixa o campo silenciosamente inalterável via PATCH sem erro de compilação. Considerar `BeanUtils.copyProperties` com filtro de nulos, ou MapStruct.

---

`🟡 SUGESTÃO`

`themes.js`: cada tema armazena o mesmo gradient CSS em duas chaves distintas (`preview` e `background`). Corrigir a paleta de um tema exige editar duas strings no mesmo literal; uma edição parcial faz o swatch mostrar o tema antigo enquanto o portfólio aplica o novo. Simplificar para uma única chave `gradient` usada em ambos os contextos.

---

`🟡 SUGESTÃO`

`Portfolio.jsx:32`: o polling de 4 segundos roda mesmo quando a aba está em background (sem Page Visibility API). Em dispositivos móveis isso drena bateria e dados desnecessariamente. Considerar pausar o `setInterval` quando `document.hidden === true`.

---

`🟡 SUGESTÃO`

`api.js:4` e `vite.config.js`: a `baseURL` está hardcoded como `http://localhost:8080`. Usar `import.meta.env.VITE_API_URL` com fallback, e adicionar `VITE_API_URL=http://localhost:8080` no `.env.example`, seria a forma padrão em projetos Vite e não exige alteração de código para deploy.

---

## 🟢 Elogio

`🟢 ELOGIO`

`App.jsx`: implementação limpa do `PrivateRoute` com `<Navigate to="/login" replace />` — uso correto do `replace` para não poluir o histórico de navegação com redirecionamentos.

---

`🟢 ELOGIO`

`Dashboard.jsx` (`handleUpload`): lógica de re-apply das imagens após novo upload de PDF é um detalhe fino que preserva a experiência do usuário — a foto de perfil não some quando o currículo é reprocessado. Boa antecipação de edge case.

---

`🟢 ELOGIO`

`Portfolio.jsx`: combinação de polling + `localStorage` storage event para sincronização entre abas é uma solução elegante para o requisito de atualização em tempo real sem WebSocket, adequada ao escopo acadêmico do projeto.

---

`🟢 ELOGIO`

`CorsConfig.java`: boa separação de responsabilidades — a configuração CORS foi extraída para uma classe dedicada em vez de ser embutida no `SecurityConfigurations`, facilitando manutenção independente.

---

## 🔵 Observação

`🔵 OBSERVAÇÃO`

Commits `dc6a8d3` e `276dbfd` não seguem o formato Conventional Commits exigido pelo `Padrões.md` (`tipo(escopo): descrição curta`). Os títulos `"Project structure: ..."` e `"Backend: ..."` não são tipos válidos. Para branches futuras, usar o formato correto: ex. `feat(frontend): bootstrap React app with Vite + router + axios`.

---

`🔵 OBSERVAÇÃO`

`frontend/src/services/api.js:4`: o `baseURL` hardcoded funcionará normalmente em desenvolvimento. Nenhuma ação bloqueante agora, mas documentar no `README.md` a necessidade de criar um `.env.local` com `VITE_API_URL` antes de qualquer deploy evitará confusão futura na equipe.

---

`🔵 OBSERVAÇÃO`

`Portfolio.jsx`: o `setCarregando(false)` no bloco `finally` é executado mesmo em erros de rede, o que faz a tela mostrar "portfólio não encontrado" instantaneamente em caso de falha transitória. Para um projeto acadêmico é aceitável, mas em produção valeria distinguir "não encontrado" de "erro de rede" para melhor UX.
