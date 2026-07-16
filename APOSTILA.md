# 📚 APOSTILA — PortfólioPro (Portfolio-Generator)

> **Projeto Final — Desenvolvimento de Softwares para a WEB**
> Gerador de Portfólio para Programadores com IA
> Stack: Java Spring Boot + PostgreSQL + JPA/Hibernate + Spring Security/JWT + React JS + Tailwind CSS

---

## Como usar esta apostila

Esta apostila foi escrita para que **qualquer integrante do grupo** — mesmo quem nunca mexeu em uma parte específica do código — consiga:

1. Explicar **o que** o projeto faz (o pitch);
2. Explicar **como** ele faz (arquitetura, cada arquivo, cada linha importante);
3. Responder **qualquer pergunta isolada** do professor com segurança.

**Ordem de leitura sugerida:**

| Parte | Conteúdo | Para quem |
|---|---|---|
| 1 | O projeto em uma página (pitch) | Todos — decorar |
| 2 | Fundamentos de Web (HTTP, REST, JSON…) | Quem está começando do zero |
| 3 | A Stack (por que cada tecnologia) | Todos |
| 4 | Arquitetura geral e estrutura de pastas | Todos |
| 5 | Diagrama de Classes UML explicado | Todos — cai na apresentação |
| 6 | Banco de Dados (tabelas reais geradas) | Todos |
| 7 | Back-end arquivo por arquivo | Aprofundamento |
| 8 | Segurança de ponta a ponta (BCrypt + JWT) | Aprofundamento — **o professor adora** |
| 9 | A IA (PDF → Groq → JSON) | Aprofundamento — é o diferencial do projeto |
| 10 | Front-end arquivo por arquivo | Aprofundamento |
| 11 | Fluxos completos ponta a ponta | Todos — decorar para a live demo |
| 12 | Checklist do enunciado — todos os critérios atendidos e onde | Todos — **muito importante** |
| 13 | Simulado: perguntas prováveis do professor | Todos — treinar em dupla |
| 14 | Glossário | Consulta rápida |

---

# PARTE 1 — O projeto em uma página (o Pitch)

## O problema (a "dor")

Todo programador precisa de um portfólio para conseguir emprego, mas:
- Criar um site do zero leva tempo;
- Ferramentas prontas são genéricas e não entendem currículos;
- Manter o portfólio atualizado é chato — as informações já existem no currículo em PDF, e a pessoa precisa digitá-las de novo.

## A solução

**PortfólioPro**: o usuário se cadastra, faz login, envia seu **currículo em PDF**, e uma **Inteligência Artificial** lê o PDF e extrai automaticamente nome, e-mail, LinkedIn, GitHub, resumo, skills, experiências, educação, projetos e idiomas. O sistema gera na hora uma **página de portfólio pública e bonita**, com URL compartilhável (`/portfolio/login-do-usuario`), personalizável com foto de perfil, imagem de fundo, favicon e 8 temas de cor. O usuário ainda pode **revisar e editar** qualquer campo que a IA extraiu.

## Frase de efeito para a apresentação

> "Você arrasta um PDF, a IA lê, e em segundos você tem um portfólio profissional com link pronto para mandar ao recrutador. Do PDF ao portfólio publicado sem escrever uma linha de HTML."

## Números do projeto

- **Back-end:** Java 21 + Spring Boot, ~18 classes divididas em 5 camadas (model, repository, service, controller, security).
- **Front-end:** React 19 + Vite, 6 páginas + layout com `<Outlet>`, roteamento com React Router 7, estilização com Tailwind CSS 4.
- **Banco:** PostgreSQL com 4 tabelas mapeadas via JPA/Hibernate (`usuario`, `curriculo`, `skill` e a junção `curriculo_skill`), com relacionamento **1:N** (Usuario–Curriculo), **N:N** (Curriculo–Skill) e **herança SINGLE_TABLE** (Admin herda de Usuario, coluna discriminadora `tipo`).
- **Segurança:** Spring Security stateless com JWT (expira em 2 horas) e senhas com BCrypt.
- **IA:** API da Groq rodando o modelo `llama-3.1-8b-instant`, com extração de texto do PDF feita pelo Apache PDFBox.

---

# PARTE 2 — Fundamentos: o mínimo que você precisa saber de Web

*(Se você já sabe o que é HTTP, REST e JSON, pule para a Parte 3.)*

## 2.1 O modelo cliente-servidor

Toda aplicação web moderna tem dois lados:

```
┌──────────────┐         requisição HTTP          ┌──────────────┐
│   CLIENTE     │ ───────────────────────────────▶ │   SERVIDOR    │
│ (navegador,   │                                   │ (nossa API    │
│  nosso React) │ ◀─────────────────────────────── │  Spring Boot) │
└──────────────┘         resposta HTTP             └──────┬───────┘
                                                          │ SQL
                                                   ┌──────▼───────┐
                                                   │  PostgreSQL   │
                                                   └──────────────┘
```

- **Cliente (front-end):** o que roda no navegador do usuário. No nosso caso, o React servido pelo Vite na porta **5173**. Ele desenha as telas e faz pedidos ao servidor.
- **Servidor (back-end):** o que roda "escondido". No nosso caso, o Spring Boot na porta **8080**. Ele recebe pedidos, aplica regras de negócio, fala com o banco e responde.
- **Banco de dados:** onde os dados vivem de forma permanente. PostgreSQL na porta **5432**.

## 2.2 HTTP: a língua que cliente e servidor falam

Cada pedido HTTP (requisição) tem:

1. **Verbo (método):** a intenção do pedido.
   - `GET` → "me dê dados" (ler)
   - `POST` → "crie algo novo"
   - `PUT` → "substitua esse recurso inteiro"
   - `PATCH` → "altere só alguns campos desse recurso"
   - `DELETE` → "apague"
2. **URL (rota/endpoint):** o endereço do recurso. Ex.: `/curriculo/5`.
3. **Headers (cabeçalhos):** metadados. O mais importante para nós: `Authorization: Bearer <token>` (identifica o usuário logado) e `Content-Type` (formato do corpo).
4. **Body (corpo):** os dados enviados (em JSON, ou `multipart/form-data` quando há arquivo).

Cada **resposta** tem um **código de status**:

| Código | Nome | Quando usamos |
|---|---|---|
| 200 | OK | Sucesso genérico |
| 201 | Created | Currículo criado com sucesso (`POST /curriculo/`) |
| 400 | Bad Request | Login já existe no `/auth/register` |
| 403 | Forbidden | Usuário sem token tenta rota protegida; ou tenta editar currículo de outro usuário |
| 404 | Not Found | Currículo/usuário não existe |
| 500 | Internal Server Error | Erro inesperado (ex.: login com senha errada — ver Parte 12) |

## 2.3 O que é uma API REST

**API** = interface que um programa expõe para outros programas usarem. **REST** é um estilo de organizar essa API:

- Cada "coisa" do sistema é um **recurso** com uma URL: `/usuario`, `/curriculo`.
- As operações sobre o recurso usam os **verbos HTTP corretos** (não se faz `GET /deletarUsuario?id=3`; faz-se `DELETE /usuario/3`).
- O servidor é **stateless**: não guarda "sessão" de quem está logado — cada requisição carrega tudo que precisa (por isso o token JWT vai em **toda** requisição protegida).

## 2.4 JSON

JSON (JavaScript Object Notation) é o formato de texto usado para trocar dados:

```json
{
  "login": "gustavo",
  "password": "123456"
}
```

Chaves e valores. É o que o React envia no corpo das requisições e o que o Spring devolve. No Java, a biblioteca **Jackson** converte objetos Java ⇄ JSON automaticamente (isso se chama *serialização/desserialização*).

## 2.5 O que é um framework

Framework é um "esqueleto pronto" de aplicação: você escreve só a parte específica do seu problema e ele cuida do resto (servidor HTTP, conexão com banco, segurança...). **Spring Boot** é o framework do nosso back-end; **React** é a biblioteca/framework do nosso front-end.

---

# PARTE 3 — A Stack: o que é cada tecnologia e por que usamos

## Back-end

| Tecnologia | O que é | Papel no projeto |
|---|---|---|
| **Java 21** | Linguagem de programação | Linguagem do back-end |
| **Spring Boot** | Framework Java para APIs web | Levanta o servidor na porta 8080, injeção de dependências, rotas REST |
| **Spring Data JPA** | Módulo de persistência | Gera os SQLs automaticamente a partir de interfaces (`CrudRepository`) |
| **Hibernate** | Implementação do JPA (ORM) | Traduz objetos Java ⇄ tabelas do PostgreSQL |
| **Spring Security** | Módulo de segurança | Bloqueia rotas privadas, cadeia de filtros, BCrypt |
| **java-jwt (Auth0)** | Biblioteca JWT | Gera e valida os tokens JWT |
| **Apache PDFBox** | Biblioteca de PDF | Extrai o texto puro do PDF enviado |
| **Jackson** | Biblioteca JSON | Monta o corpo da chamada à Groq e lê a resposta |
| **Lombok** | Gerador de código | Gera getters/setters/construtores via anotações (`@Getter`, `@Setter`...) |
| **Maven** | Gerenciador de build | Baixa dependências (`pom.xml`) e compila/roda o projeto |

## Front-end

| Tecnologia | O que é | Papel no projeto |
|---|---|---|
| **React 19** | Biblioteca de UI | Constrói as telas com componentes e estado |
| **Vite** | Empacotador/dev server | Roda o front na porta 5173 com hot-reload |
| **React Router DOM 7** | Roteador | Navegação entre páginas **sem recarregar** (SPA) |
| **Axios** | Cliente HTTP | Faz as requisições à API, com interceptor que injeta o token |
| **Tailwind CSS 4** | Framework CSS utilitário | Estiliza tudo via classes utilitárias direto no JSX (`flex`, `rounded-md`, `bg-[#0d6efd]`...), sem escrever CSS separado |
| **lucide-react** | Ícones | Ícones da landing page |

## Banco e IA

| Tecnologia | Papel |
|---|---|
| **PostgreSQL** | Banco relacional; guarda usuários e currículos |
| **Groq API** (`llama-3.1-8b-instant`) | LLM que lê o texto do currículo e devolve JSON estruturado |

### Conceito importante: ORM

**ORM (Object-Relational Mapping)** = mapear classes Java para tabelas do banco. Em vez de escrever `INSERT INTO usuario (login, email...) VALUES (...)`, fazemos `usuarioRepository.save(newUser)` e o Hibernate escreve o SQL. **JPA** é a especificação (o "contrato"); **Hibernate** é a implementação que usamos.

### Conceito importante: SPA

O React cria uma **SPA (Single Page Application)**: o navegador baixa o app uma única vez e, ao navegar entre `/login`, `/dashboard`, `/portfolio/...`, quem troca o conteúdo é o **JavaScript** — a página **não recarrega**. Isso é visível na demo: o professor pede exatamente para mostrar "navegação sem recarregar".

---

# PARTE 4 — Arquitetura geral e estrutura de pastas

## 4.1 O desenho macro

```
NAVEGADOR (usuário)
   │
   ▼
REACT (localhost:5173)
   │  páginas: Home, Login, Cadastro, Dashboard, Portfolio, NotFound
   │  axios com interceptor: injeta "Authorization: Bearer <token>"
   ▼
SPRING BOOT (localhost:8080)
   │
   │  [CorsConfig]  ── libera requisições vindas do 5173
   │  [SecurityFilter] ── lê o token JWT de cada requisição
   │  [SecurityConfigurations] ── decide o que é público e o que é privado
   │
   ├─ CONTROLLERS (recebem HTTP)      AuthenticationController, UsuarioController, CurriculoController
   ├─ SERVICES (regras de negócio)    IaService, TokenService, AuthorizationService
   ├─ REPOSITORIES (acesso a dados)   UsuarioRepository, CurriculoRepository
   └─ MODELS (entidades e DTOs)       Usuario, Curriculo, UserRole, DTOs (records)
   │
   ▼                                  ▼
POSTGRESQL (localhost:5432)      GROQ API (nuvem)
tabelas: usuario, curriculo      modelo llama-3.1-8b-instant
```

## 4.2 As camadas do back-end (arquitetura limpa)

Este é um dos critérios do enunciado: **Model → Repository → Service → Controller**.

| Camada | Pasta | Responsabilidade | Analogia (restaurante) |
|---|---|---|---|
| **Model** | `model/` | Definir os dados: entidades JPA (viram tabelas) e DTOs (viajam no JSON) | O cardápio e os ingredientes |
| **Repository** | `repository/` | Falar com o banco (CRUD). São **interfaces** — o Spring gera a implementação | O estoque/despensa |
| **Service** | `service/` | Regras de negócio (chamar a IA, gerar token, carregar usuário) | A cozinha |
| **Controller** | `controller/` | Receber requisições HTTP e devolver respostas | O garçom |
| **Security** | `security/` | Configuração transversal de segurança e CORS | O segurança da porta |

**Por que separar em camadas?** Cada classe tem uma responsabilidade única; dá para trocar o banco sem mexer nos controllers, testar regras sem subir servidor, e várias pessoas trabalharem em paralelo sem conflito.

## 4.3 Estrutura de pastas real do repositório

```
Portfolio-Generator/
├── README.md                 ← guia de instalação (Ubuntu, Postgres, chaves)
├── NovoDiagramUML.pdf        ← diagrama de classes UML
├── backend/
│   ├── pom.xml               ← dependências Maven
│   └── src/main/java/br/unesp/backend/
│       ├── BackendApplication.java      ← ponto de entrada (main)
│       ├── model/
│       │   ├── Usuario.java             ← entidade JPA + UserDetails (raiz da herança SINGLE_TABLE)
│       │   ├── Admin.java               ← SUBCLASSE de Usuario (@DiscriminatorValue("ADMIN"))
│       │   ├── Curriculo.java           ← entidade JPA (tem @ManyToMany com Skill)
│       │   ├── Skill.java               ← entidade JPA (lado inverso do N:N)
│       │   ├── UserRole.java            ← enum ADMIN/USER
│       │   ├── AuthenticationDTO.java   ← record (login, password)
│       │   ├── RegisterDTO.java         ← record (login, password, email, role)
│       │   ├── LoginResponseDTO.java    ← record (token)
│       │   └── CurriculoDadosIA.java    ← record com os 12 campos da IA
│       ├── repository/
│       │   ├── UsuarioRepository.java   ← CrudRepository + findByLogin
│       │   ├── CurriculoRepository.java ← CrudRepository puro
│       │   └── SkillRepository.java     ← CrudRepository + findByNome (query method)
│       ├── service/
│       │   ├── IaService.java           ← PDF → texto → Groq → JSON → record
│       │   └── AuthorizationService.java← UserDetailsService (busca p/ login)
│       ├── security/
│       │   ├── SecurityConfigurations.java ← regras de acesso, beans
│       │   ├── SecurityFilter.java         ← filtro que valida o JWT
│       │   ├── TokenService.java           ← gera/valida token
│       │   └── CorsConfig.java             ← libera o front 5173
│       └── controller/
│           ├── AuthenticationController.java ← /auth/login, /auth/register
│           ├── UsuarioController.java        ← CRUD /usuario
│           └── CurriculoController.java      ← CRUD /curriculo + upload + público
└── frontend/
    ├── package.json          ← dependências npm
    ├── index.html            ← página única da SPA
    └── src/
        ├── main.jsx          ← monta o React no DOM
        ├── App.jsx           ← rotas (React Router) + PrivateRoute
        ├── index.css / App.css
        ├── services/
        │   ├── api.js        ← axios + interceptor do token
        │   └── themes.js     ← os 8 temas de gradiente
        ├── layouts/
        │   └── AuthLayout.jsx← layout fixo com <Outlet> (header + conteúdo + footer)
        └── pages/
            ├── Home.jsx      ← landing page pública
            ├── Login.jsx     ← tela de login
            ├── Cadastro.jsx  ← tela de registro
            ├── Dashboard.jsx ← área privada: upload, edição, personalização
            ├── Portfolio.jsx ← página pública do portfólio
            └── NotFound.jsx  ← página 404 personalizada
```

---

# PARTE 5 — O Diagrama de Classes UML explicado

O arquivo `NovoDiagramUML.pdf` mostra as classes do back-end. Vamos entender **cada caixa e cada seta**.

> ⚠️ **Atenção:** o PDF do diagrama foi gerado **antes** das classes `Admin` e `Skill` serem adicionadas. Antes da entrega final, **regerem o diagrama** incluindo: a herança `Admin ──▷ Usuario` (triângulo vazio) e a associação N:N `Curriculo "0..*" ── "0..*" Skill`. Ambas estão explicadas abaixo.

## 5.1 Como ler UML (revisão rápida)

- Cada **caixa** é uma classe: nome em cima, **atributos** no meio, **métodos** embaixo.
- `-` antes do nome = **privado**; `+` = **público**.
- `«interface»` = é uma interface (contrato sem implementação própria).
- `«record»` = record Java (classe imutável, só carrega dados).
- **Setas** entre caixas = relacionamentos.
- Números nas pontas das setas = **multiplicidade** (quantos de cada lado).

## 5.2 Os relacionamentos do nosso diagrama

### Usuario 1 ── 0..* Curriculo (Associação / Composição) — ⭐ o mais importante

```
Usuario "1" ────possui──── "0..*" Curriculo
```

- **Leitura:** 1 usuário possui zero ou muitos currículos; cada currículo pertence a exatamente 1 usuário.
- No código, isso é o par `@OneToMany` (lado Usuario) / `@ManyToOne` (lado Curriculo).
- Vai além de uma associação simples: como usamos `cascade = CascadeType.ALL` e `orphanRemoval = true`, o currículo **não vive sem o usuário** — apagou o usuário, apagam-se os currículos. Isso caracteriza **COMPOSIÇÃO** (o losango preto do UML): a parte (Curriculo) tem o ciclo de vida controlado pelo todo (Usuario).

> **Se o professor perguntar "onde está a composição?"** → "Na relação Usuario–Curriculo: com `cascade = ALL` e `orphanRemoval = true`, o currículo é criado e destruído junto com o usuário; ele não existe de forma independente. Isso é composição. Se fosse agregação, o currículo continuaria existindo sem o usuário."

### Admin ──▷ Usuario (Herança / Generalização) — ⭐ SINGLE_TABLE

```
        Usuario  ◁──── Admin
   (superclasse)      (subclasse)
```

- **Leitura:** `Admin` **é um** `Usuario` — herda todos os atributos (id, login, email, senha, role) e sobrescreve `getAuthorities()` para acumular os papéis `ROLE_ADMIN` + `ROLE_USER`.
- Em UML: seta contínua com **triângulo vazio** apontando para a superclasse (generalização).
- No banco, usamos a estratégia exigida pelo enunciado — **tabela única**:

```java
// Usuario.java (superclasse)
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)  // toda a hierarquia em UMA tabela
@DiscriminatorColumn(name = "tipo")                    // coluna que diz o tipo de cada linha
@DiscriminatorValue("USUARIO")                         // valor gravado p/ instâncias de Usuario
public class Usuario implements UserDetails { ... }

// Admin.java (subclasse)
@Entity
@DiscriminatorValue("ADMIN")                           // valor gravado p/ instâncias de Admin
public class Admin extends Usuario { ... }
```

- **Como funciona:** existe **uma única tabela** `usuario` para as duas classes. A coluna extra `tipo` (a *discriminator column*) guarda `"USUARIO"` ou `"ADMIN"` — é assim que o Hibernate sabe **qual classe instanciar** ao ler cada linha. No `/auth/register`, se o papel enviado for ADMIN, o controller instancia `new Admin(...)`; senão, `new Usuario(...)`.
- **Vantagem do SINGLE_TABLE:** sem JOINs — leitura rápida e simples. **Desvantagem:** colunas exclusivas de uma subclasse precisariam aceitar NULL nas demais (no nosso caso, Admin não adiciona colunas, então não há desperdício).

### Curriculo ⟷ Skill (Associação Muitos-para-Muitos) — ⭐ N:N

```
Curriculo "0..*" ──────── "0..*" Skill
```

- **Leitura:** um currículo tem várias skills, e **a mesma skill** (ex.: "Java") aparece em vários currículos.
- No código: `Curriculo` é o **lado dono** com `@ManyToMany` + `@JoinTable(name = "curriculo_skill", joinColumns = @JoinColumn(name = "curriculo_id"), inverseJoinColumns = @JoinColumn(name = "skill_id"))`; `Skill` é o lado inverso com `@ManyToMany(mappedBy = "skills")` e `@JsonIgnore` (para cortar o ciclo de serialização).
- No banco, N:N exige uma **tabela de junção**: `curriculo_skill`, com duas FKs (`curriculo_id`, `skill_id`) — nenhuma das duas tabelas principais consegue guardar "vários dos dois lados" sozinha.
- **De onde vêm os dados:** a IA devolve as skills como texto ("Java, React, SQL"). O método `sincronizarSkills` do `CurriculoController` faz o *split* por vírgula e, para cada nome, **reaproveita** a `Skill` existente no banco (`findByNome`) ou **cria** uma nova — e associa à lista do currículo. Isso roda no upload e sempre que o usuário edita as skills (PATCH). O campo textual `skillsExtraidas` continua existindo (é ele que o front consome), e a relação N:N é mantida em paralelo, normalizada.

### Usuario ──▷ UserDetails (Realização de interface — outra forma de herança)

`Usuario implements UserDetails` — a classe herda o **contrato** da interface do Spring Security e é obrigada a implementar `getAuthorities()`, `getUsername()`, `getPassword()`. Em UML isso é uma **realização** (seta tracejada com triângulo vazio). Graças a isso, o Spring Security consegue tratar o nosso `Usuario` como "um usuário autenticável" — **polimorfismo** na prática: onde o Spring espera um `UserDetails`, entregamos um `Usuario`.

### Usuario ──> UserRole (Associação com enum)

Todo `Usuario` **tem** um `UserRole` (ADMIN ou USER). Enum = tipo com valores fixos e conhecidos.

### Dependências ("usa", "chama", "retorna") entre as classes de serviço

Setas simples no diagrama indicam **dependência** (uma classe usa a outra):

| De | Para | Sentido |
|---|---|---|
| `CurriculoController` | `IaService` | *chama* — o controller pede a extração dos dados |
| `CurriculoController` | `CurriculoRepository` | *usa* — para salvar/buscar no banco |
| `IaService` | `CurriculoDadosIA` | *retorna* — devolve o record com os 12 campos |
| `AuthenticationController` | `TokenService` | *usa* — para gerar o token no login |
| `AuthenticationController` | `UsuarioRepository` | *usa* — para checar/registrar usuário |
| `SecurityFilter` | `TokenService` | *valida* — valida o token de cada requisição |
| `SecurityFilter` | `UsuarioRepository` | *busca* — carrega o usuário do token |
| `AuthorizationService` | `UsuarioRepository` | *usa* — `loadUserByUsername` |

## 5.3 Classe por classe do diagrama

### Entidades (viram tabelas no banco)

**`Usuario`** — atributos: `id: Long`, `login: String`, `email: String`, `senha: String` (guarda o **hash BCrypt**, nunca a senha pura), `role: UserRole`. Métodos: os 3 exigidos por `UserDetails`. É a **raiz da herança SINGLE_TABLE**.

**`Admin`** — subclasse de `Usuario` (`extends Usuario`, `@DiscriminatorValue("ADMIN")`). Não adiciona atributos; sobrescreve `getAuthorities()` devolvendo `ROLE_ADMIN` + `ROLE_USER`. Compartilha a tabela `usuario`.

**`Skill`** — atributos: `id: Long`, `nome: String` (único no banco). Participa do N:N com `Curriculo`; o lado `curriculos` tem `@JsonIgnore` para evitar loop na serialização.

**`Curriculo`** — atributos: `id`, `conteudoTexto` (descrição livre), `arquivoPdf: byte[]` (o PDF em si, binário), `dataUpload: LocalDateTime` (preenchido automaticamente), campos de personalização (`fotoPerfil`, `imagemFundo`, `favicon` — imagens em **base64**; `temaFundo` — id do tema) e os **12 campos extraídos pela IA** (`nomeExtraido`, `emailExtraido`, `linkedinExtraido`, `githubExtraido`, `localizacaoExtraida`, `resumoExtraido`, `skillsExtraidas`, `skillsInterpessoaisExtraidas`, `experienciasExtraidas`, `educacaoExtraida`, `projetosExtraidos`, `idiomasExtraidos`).

### Enum

**`UserRole`** — `ADMIN`, `USER`. Define os papéis de autorização.

### DTOs (records — só transportam dados, não viram tabela)

| Record | Campos | Usado em |
|---|---|---|
| `AuthenticationDTO` | login, password | corpo do `POST /auth/login` |
| `RegisterDTO` | login, password, email, role | corpo do `POST /auth/register` |
| `LoginResponseDTO` | token | resposta do login |
| `CurriculoDadosIA` | os 12 campos extraídos | retorno do `IaService` |

> **Por que DTO e não a entidade direto?** DTO (Data Transfer Object) desacopla o formato da API do formato do banco. No login, por exemplo, só precisamos de login+senha — não faz sentido (nem é seguro) trafegar a entidade inteira. **Records** são ideais para DTOs: imutáveis, concisos (uma linha), com `equals/hashCode/toString` automáticos.

### Serviços e segurança

- **`IaService`** — orquestra: PDF → texto (PDFBox) → Groq → JSON → `CurriculoDadosIA`.
- **`TokenService`** — `generateToken(usuario)` e `validateToken(token)` com HMAC256.
- **`AuthorizationService`** — implementa `UserDetailsService`; é como o Spring Security encontra o usuário no banco durante o login.
- **`SecurityFilter`** — filtro executado **em toda requisição**, antes do controller.
- **`SecurityConfigurations`** — define rotas públicas/privadas e os beans de segurança.

### Interfaces de repositório

- **`UsuarioRepository`** — herda `CrudRepository` e adiciona `findByLogin(login)` com `@Query` JPQL.
- **`CurriculoRepository`** — herda `CrudRepository` puro (ganha `findAll`, `findById`, `save`, `deleteById` de graça).
- **`SkillRepository`** — herda `CrudRepository` e adiciona `findByNome(nome)` como **query method**: o Spring Data deriva o SQL só pelo nome do método (compare com o `findByLogin`, que usa `@Query` explícita — os dois jeitos estão demonstrados no projeto).

> Note a **herança entre interfaces**: `UsuarioRepository extends CrudRepository<Usuario, Long>`. É herança de contrato — o repositório "herda" todos os métodos CRUD.

---

# PARTE 6 — O Banco de Dados

## 6.1 Quem cria as tabelas?

Ninguém escreve `CREATE TABLE` manualmente. No `application.properties` temos:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Ao subir a aplicação, o **Hibernate** compara as entidades (`@Entity`) com o banco e **cria/atualiza** as tabelas sozinho. `spring.jpa.show-sql=true` faz ele imprimir no console cada SQL executado (ótimo para mostrar na apresentação).

## 6.2 Tabela `usuario` (compartilhada por `Usuario` e `Admin` — SINGLE_TABLE)

| Coluna | Tipo (Postgres) | Origem no Java | Observação |
|---|---|---|---|
| `tipo` | varchar(31) | `@DiscriminatorColumn(name = "tipo")` | **Coluna discriminadora** da herança: `"USUARIO"` ou `"ADMIN"` — diz ao Hibernate qual classe instanciar para cada linha |
| `id` | bigint (PK) | `@Id @GeneratedValue(strategy = AUTO)` | Com Postgres, o Hibernate usa uma **sequence** para gerar os ids |
| `login` | varchar(255) | `String login` | Usado como "username" do sistema |
| `email` | varchar(255) | `String email` | |
| `senha` | varchar(255) | `String senha` | **Hash BCrypt** (~60 caracteres), nunca texto puro |
| `role` | smallint | `UserRole role` | ⚠️ Salvo como **número** (ordinal): `0` = ADMIN, `1` = USER — ver box abaixo |

> É **uma tabela só** para a hierarquia inteira (`Usuario` + `Admin`) — exatamente a estratégia `SINGLE_TABLE` com `@DiscriminatorColumn` exigida pelo enunciado. Se você registrar um usuário com `role: "ADMIN"`, a linha nasce com `tipo = 'ADMIN'` e, ao carregá-la, o Hibernate instancia a classe `Admin`.
>
> ⚠️ **Se você já tinha um banco criado antes desta mudança:** as linhas antigas ficam com `tipo` nulo e o Hibernate não saberá o tipo delas. Em ambiente de estudo, o mais simples é recriar o banco (`DROP DATABASE portfolio; CREATE DATABASE portfolio;`) ou rodar `UPDATE usuario SET tipo = 'USUARIO' WHERE tipo IS NULL;`. Em máquina nova, nada a fazer.

> ⚠️ **Pegadinha possível:** como o campo `role` **não** tem `@Enumerated(EnumType.STRING)`, o JPA usa o padrão `EnumType.ORDINAL` e grava a **posição** do enum (0 ou 1) no banco, não o texto "ADMIN"/"USER". Funciona, mas se alguém reordenar o enum no futuro, os dados ficam inconsistentes — por isso a boa prática seria `@Enumerated(EnumType.STRING)`. Saber explicar isso mostra domínio.

## 6.3 Tabela `curriculo`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | bigint (PK) | sequence |
| `conteudo_texto` | text | `@Column(columnDefinition = "TEXT")` — sem limite de 255 chars |
| `arquivo_pdf` | oid / bytea | `@Lob` + `byte[]` — o binário do PDF fica **dentro do banco** |
| `foto_perfil`, `imagem_fundo`, `favicon` | text | Imagens como **string base64** (data URL) |
| `tema_fundo` | varchar | id do tema (ex.: "roxo", "oceano") |
| `nome_extraido`, `email_extraido`, `linkedin_extraido`, `github_extraido`, `localizacao_extraida` | varchar | Campos curtos extraídos pela IA |
| `resumo_extraido`, `skills_extraidas`, `skills_interpessoais_extraidas`, `experiencias_extraidas`, `educacao_extraida`, `projetos_extraidos`, `idiomas_extraidos` | text | Campos longos extraídos pela IA |
| `data_upload` | timestamp | Preenchida por `@PrePersist` (ver 7.4) |
| `usuario_id` | bigint (**FK → usuario.id**) | `@JoinColumn(name = "usuario_id", nullable = false)` — **chave estrangeira**, obrigatória |

## 6.4 Tabelas `skill` e `curriculo_skill` (o N:N no banco)

| Tabela | Colunas | Papel |
|---|---|---|
| `skill` | `id` (PK), `nome` (varchar, **unique**) | Catálogo de skills — cada skill existe **uma única vez** no banco, mesmo aparecendo em vários currículos |
| `curriculo_skill` | `curriculo_id` (FK → curriculo), `skill_id` (FK → skill) | **Tabela de junção** gerada pelo `@JoinTable`: cada linha é um par "este currículo tem esta skill" |

```
curriculo                curriculo_skill               skill
┌────┬─────┐            ┌──────────────┬──────────┐   ┌────┬─────────┐
│ id │ ... │            │ curriculo_id │ skill_id │   │ id │  nome   │
├────┼─────┤            ├──────────────┼──────────┤   ├────┼─────────┤
│ 10 │ ... │◀───────────│      10      │    1     │──▶│ 1  │ Java    │
│ 11 │ ... │◀───┬───────│      10      │    2     │─┐ │ 2  │ React   │
└────┴─────┘    └───────│      11      │    1     │ └▶└────┴─────────┘
                        └──────────────┴──────────┘
        (o currículo 10 tem Java e React; o 11 também tem Java —
         a skill "Java" é UMA linha só, compartilhada pelos dois)
```

É assim que se implementa N:N em banco relacional: **nenhuma** das duas tabelas consegue guardar "vários dos dois lados" — a tabela intermediária com as duas FKs resolve.

## 6.5 O relacionamento 1:N no banco

```
usuario                          curriculo
┌────┬───────┬───────┐          ┌────┬─────────────┬────────────┐
│ id │ login │  ...  │          │ id │ usuario_id  │    ...     │
├────┼───────┼───────┤          ├────┼─────────────┼────────────┤
│ 1  │ gus   │  ...  │◀─────────│ 10 │      1      │    ...     │
│ 2  │ ana   │  ...  │◀───┬─────│ 11 │      2      │    ...     │
└────┴───────┴───────┘    └─────│ 12 │      2      │    ...     │
                                └────┴─────────────┴────────────┘
```

Em banco relacional, "1 para muitos" é implementado colocando a **chave estrangeira no lado do "muitos"**: cada linha de `curriculo` aponta para seu dono via `usuario_id`. Não existe coluna "lista de currículos" em `usuario` — a lista `List<Curriculo>` no Java é montada pelo Hibernate consultando a FK.

> **Nomenclatura JPA:** camelCase no Java vira snake_case no banco (`nomeExtraido` → `nome_extraido`). É a estratégia de nomes padrão do Spring/Hibernate.

---

# PARTE 7 — Back-end arquivo por arquivo

## 7.1 `BackendApplication.java` — o ponto de entrada

```java
@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
```

- `@SpringBootApplication` = 3 anotações em uma:
  - `@Configuration` (esta classe pode declarar beans),
  - `@EnableAutoConfiguration` (Spring configura tudo sozinho a partir das dependências do pom),
  - `@ComponentScan` (escaneia o pacote `br.unesp.backend` procurando `@Service`, `@RestController`, `@Component`, `@Repository`... e registra tudo no **container de injeção de dependências**).
- `SpringApplication.run(...)` sobe um servidor **Tomcat embutido** na porta 8080.

> **Conceito-chave: Injeção de Dependências (DI).** Em vez de cada classe criar seus objetos com `new`, o Spring cria uma instância única (um **bean**) de cada componente e "injeta" onde for pedido com `@Autowired`. Vantagens: baixo acoplamento, fácil de testar, configuração centralizada.

## 7.2 `pom.xml` — as dependências

O `pom.xml` é o "package.json do Java". Principais dependências e para que servem:

| Dependência | Para quê |
|---|---|
| `spring-boot-starter-webmvc` | Servidor web + controllers REST |
| `spring-boot-starter-data-jpa` | JPA/Hibernate + repositórios |
| `postgresql` | Driver JDBC do PostgreSQL |
| `spring-boot-starter-security` | Spring Security (filtros, BCrypt) |
| `com.auth0:java-jwt` | **A biblioteca que realmente usamos para JWT** (classes `JWT`, `Algorithm`) |
| `io.jsonwebtoken:jjwt-api` | ⚠️ Declarada no pom, mas **não é usada no código** (sobrou de testes iniciais) — a implementação efetiva é a da Auth0 |
| `spring-boot-starter-validation` + `jakarta.validation-api` | Habilita o `@Valid` nos DTOs |
| `org.apache.pdfbox:pdfbox` | Extração de texto de PDF |
| `jackson-databind` | Serialização JSON manual no `IaService` |
| `lombok` | `@Getter/@Setter/@NoArgsConstructor` |
| `spring-boot-devtools` | Hot-reload em desenvolvimento |

Também define `<java.version>21</java.version>` (Java 21).

## 7.3 `application.properties` (não versionado — está no README)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/portfolio   # onde está o banco
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update      # Hibernate cria/atualiza tabelas
spring.jpa.show-sql=true                  # imprime os SQLs no console
spring.servlet.multipart.max-file-size=10MB   # limite do upload de PDF
api.security.token.secret=...             # segredo que assina o JWT
groq.api.key=gsk_...                      # chave da API de IA
```

> **Por que não versionar?** Contém **segredos** (chave da Groq, segredo do JWT). Se fosse para o GitHub, qualquer pessoa poderia usar nossa chave e forjar tokens. Os valores entram no código via `@Value("${...}")`.

## 7.4 Camada Model

### `Usuario.java` — linha a linha

```java
@Entity                    // esta classe vira uma tabela no banco
@Getter @Setter            // Lombok gera getters/setters em compilação
@NoArgsConstructor         // Lombok gera construtor vazio (o JPA EXIGE um)
public class Usuario implements UserDetails {   // "herança" de contrato do Spring Security

    @Id                                            // chave primária
    @GeneratedValue(strategy = GenerationType.AUTO) // banco/Hibernate gera o id (sequence no Postgres)
    private Long id;

    private String login;
    private String email;
    private String senha;      // guarda o HASH BCrypt
    private UserRole role;     // enum ADMIN/USER (salvo como ordinal — ver Parte 6)

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Curriculo> curriculos;
    ...
}
```

Dissecando a linha mais importante:

- `@OneToMany` → 1 usuário : N currículos.
- `mappedBy = "usuario"` → "o dono do relacionamento é o campo `usuario` da classe `Curriculo`". Isso diz ao Hibernate que a FK está na tabela `curriculo` e que este lado é só o "espelho" (evita criar tabela de junção desnecessária).
- `cascade = CascadeType.ALL` → operações no usuário se propagam aos currículos (salvar/deletar usuário salva/deleta seus currículos).
- `orphanRemoval = true` → se um currículo for removido da lista, ele é **apagado do banco** (currículo "órfão" não sobrevive). Junto com o cascade, é o que caracteriza **composição**.
- `@JsonIgnore` → quando o `Usuario` for convertido para JSON, a lista de currículos é **omitida**. Motivo: `Curriculo` tem um `Usuario`, que tem uma lista de `Curriculo`, que têm um `Usuario`... a serialização entraria em **loop infinito** (StackOverflow). O `@JsonIgnore` corta o ciclo.

Os métodos do `UserDetails`:

```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    if (this.role == UserRole.ADMIN) {
        return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"),
                       new SimpleGrantedAuthority("ROLE_USER"));  // ADMIN também é USER
    } else {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
@Override public String getPassword() { return this.getSenha(); }  // adapta nosso campo "senha"
@Override public String getUsername() { return this.getLogin(); }  // adapta nosso campo "login"
```

- `getAuthorities()` devolve os **papéis** do usuário. Retorna uma **coleção** porque um usuário pode acumular papéis: o ADMIN carrega também o papel de USER (hierarquia). O prefixo `ROLE_` é convenção do Spring Security.
- `getPassword()`/`getUsername()` são **adaptadores**: o Spring pergunta "qual a senha?" e nós respondemos com nosso campo `senha`. É assim que o framework autentica sem conhecer nossa modelagem.

### `Curriculo.java` — pontos-chave

```java
@Column(columnDefinition = "TEXT")
private String conteudoTexto;      // TEXT: sem o limite de 255 chars do varchar padrão

@Lob
private byte[] arquivoPdf;         // LOB = Large OBject: o binário do PDF no banco

@ManyToOne                                          // MUITOS currículos → UM usuário
@JoinColumn(name = "usuario_id", nullable = false)  // nome da coluna FK; obrigatória
private Usuario usuario;

@PrePersist
protected void onCreate() {
    this.dataUpload = LocalDateTime.now();   // executado AUTOMATICAMENTE antes do INSERT
}
```

- `@ManyToOne` é o **lado dono** do relacionamento: é aqui que mora a FK.
- `@PrePersist` é um **callback de ciclo de vida do JPA**: o Hibernate chama esse método imediatamente antes de inserir a linha — carimbo de data/hora sem esforço.
- Os campos `fotoPerfil`, `imagemFundo` e `favicon` guardam imagens como **base64** (`data:image/png;base64,...`) em colunas TEXT: simples de servir ao front (o `<img src>` aceita direto), sem precisar de servidor de arquivos.

### `Admin.java` — a herança SINGLE_TABLE em código

```java
@Entity
@DiscriminatorValue("ADMIN")   // linhas desta classe recebem tipo = 'ADMIN'
@NoArgsConstructor
public class Admin extends Usuario {

    public Admin(String login, String email, String senha) {
        super(login, email, senha, UserRole.ADMIN);   // reusa o construtor do pai
    }

    @Override
    public List<? extends GrantedAuthority> getAuthorities() {
        // Sobrescrita (polimorfismo): o Admin acumula os dois papéis
        return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"),
                       new SimpleGrantedAuthority("ROLE_USER"));
    }
}
```

- `extends Usuario` → herda **tudo**: atributos, `UserDetails`, o `@OneToMany` de currículos.
- Não declara `@Id` nem colunas próprias: mora na **mesma tabela** `usuario` (estratégia `SINGLE_TABLE` declarada na superclasse), diferenciado pela coluna `tipo`.
- O `@Override` de `getAuthorities()` demonstra **polimorfismo**: o Spring Security chama o método sem saber se o objeto é `Usuario` ou `Admin` — cada um responde do seu jeito.

### `Skill.java` — o outro lado do N:N

```java
@Entity
@Getter @Setter @NoArgsConstructor
public class Skill {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true)      // "Java" existe UMA vez no banco, compartilhada
    private String nome;

    @ManyToMany(mappedBy = "skills")   // lado INVERSO: o dono é Curriculo.skills
    @JsonIgnore                        // corta o loop Curriculo→Skill→Curriculo→...
    private List<Curriculo> curriculos;
}
```

E no `Curriculo.java`, o **lado dono** do relacionamento:

```java
@ManyToMany
@JoinTable(
        name = "curriculo_skill",                                  // tabela de junção
        joinColumns = @JoinColumn(name = "curriculo_id"),          // FK deste lado
        inverseJoinColumns = @JoinColumn(name = "skill_id"))       // FK do outro lado
private List<Skill> skills = new ArrayList<>();
```

- **Quem é "dono" em N:N?** O lado que declara o `@JoinTable`. O outro lado usa `mappedBy` apontando para o campo do dono. Só o dono "escreve" na tabela de junção.
- O JSON do currículo agora inclui também `"skills": [{"id": 1, "nome": "Java"}, ...]` — campo **aditivo** (o front continua usando o texto `skillsExtraidas`; nada quebrou).

### `UserRole.java`

```java
public enum UserRole {
    ADMIN("admin"), USER("user");
    private String role;
    UserRole(String role) { this.role = role; }
    public String getRole() { return role; }
}
```

Enum com dois valores e um rótulo em minúsculas. No cadastro, o front envia `"role": "USER"` e o Jackson converte a string para o enum **pelo nome**.

### Os records (DTOs)

```java
public record AuthenticationDTO(String login, String password) {}
public record RegisterDTO(String login, String password, String email, UserRole role) {}
public record LoginResponseDTO(String token) {}
public record CurriculoDadosIA(String nome, String email, String linkedin, String github,
        String localizacao, String resumo, String skills, String skillsInterpessoais,
        String experiencias, String educacao, String projetos, String idiomas) {}
```

**Record** (Java 16+) = classe imutável de dados em uma linha: o compilador gera construtor, acessores (`data.login()`), `equals`, `hashCode` e `toString`. Perfeito para DTOs, que só transportam dados e nunca mudam depois de criados.

## 7.5 Camada Repository

### `UsuarioRepository.java`

```java
@Repository
public interface UsuarioRepository extends CrudRepository<Usuario, Long> {
    @Query("select u from Usuario u where u.login = ?1")
    Usuario findByLogin(String login);
}
```

- É uma **interface sem implementação** — o Spring Data gera a classe concreta em tempo de execução. Herdamos de `CrudRepository<Usuario, Long>` (entidade + tipo do id) e ganhamos de graça: `save`, `findAll`, `findById`, `deleteById`, `count`, `existsById`...
- `@Query` usa **JPQL** (parecido com SQL, mas sobre **classes e atributos**, não tabelas e colunas): `Usuario u`, `u.login`. O `?1` é o primeiro parâmetro do método.
- Curiosidade: só pelo **nome** `findByLogin` o Spring Data já derivaria essa consulta automaticamente (query methods); a `@Query` explícita foi usada para demonstrar JPQL.

### `CurriculoRepository.java`

```java
@Repository
public interface CurriculoRepository extends CrudRepository<Curriculo, Long> { }
```

Vazio de métodos próprios — todo o CRUD vem herdado.

### `SkillRepository.java`

```java
@Repository
public interface SkillRepository extends CrudRepository<Skill, Long> {
    Skill findByNome(String nome);   // query method: SQL derivado do NOME do método
}
```

Repare o contraste didático com o `UsuarioRepository`: lá a consulta usa `@Query` com JPQL explícita; aqui o Spring Data **deriva** a consulta só pelo nome `findByNome` (`select s from Skill s where s.nome = ?1`). São as duas formas de consulta customizada do Spring Data.

## 7.6 Camada Service

### `AuthorizationService.java` — a ponte com o Spring Security

```java
@Service
public class AuthorizationService implements UserDetailsService {
    @Autowired UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        return usuarioRepository.findByLogin(username);
    }
}
```

O Spring Security não sabe onde guardamos usuários. A interface `UserDetailsService` é o contrato: "me dê um método que, dado um username, devolve o usuário". Durante o login, o `AuthenticationManager` chama `loadUserByUsername` automaticamente — basta a classe existir como `@Service` que o Spring a encontra e usa.

### `TokenService.java` — fabrica e valida os JWT

```java
@Service
public class TokenService {
    @Value("${api.security.token.secret}")   // injeta o segredo do application.properties
    private String secret;

    public String generateToken(Usuario user) {
        Algorithm algorithm = Algorithm.HMAC256(secret);   // assinatura HMAC-SHA256 com o segredo
        return JWT.create()
                .withIssuer("auth-api")            // quem emitiu (nós)
                .withSubject(user.getLogin())      // o "dono" do token = login do usuário
                .withExpiresAt(genExpirationDate())// validade
                .sign(algorithm);                  // assina → string final do token
    }

    private Instant genExpirationDate() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
        // expira em 2 horas; -03:00 = fuso de Brasília
    }

    public String validateToken(String token) {
        try {
            return JWT.require(Algorithm.HMAC256(secret))
                    .withIssuer("auth-api")
                    .build()
                    .verify(token)      // confere assinatura + expiração; lança exceção se inválido
                    .getSubject();      // devolve o login guardado no token
        } catch (JWTVerificationException e) {
            return "";                  // token inválido/expirado → string vazia (ninguém logado)
        }
    }
}
```

Pontos para saber defender:

- **HMAC256** = assinatura simétrica: o mesmo segredo assina e verifica. Se alguém alterar 1 caractere do token, a assinatura não bate e `verify` lança exceção.
- O token **não é criptografado** — é **assinado**. Qualquer um pode ler o conteúdo (é base64), mas ninguém consegue **forjar/alterar** sem o segredo. Por isso nunca se põe senha dentro do token.
- `subject` carrega o **login**: é assim que, depois, o filtro descobre *quem* está fazendo a requisição.

### `IaService.java` — o coração do diferencial (ver Parte 9 para o fluxo completo)

Métodos:

1. **`extrairDadosDoCurriculo(byte[] pdfBytes)`** — público, orquestra os 3 passos abaixo. Se **qualquer** passo falhar (chave inválida, API fora do ar, JSON malformado), captura a exceção e devolve um `CurriculoDadosIA` com 12 strings vazias → **o upload nunca quebra por culpa da IA** (graceful degradation).

2. **`extrairTextoDoPdf`** — Apache PDFBox:
```java
try (PDDocument document = Loader.loadPDF(pdfBytes)) {   // try-with-resources: fecha sozinho
    return new PDFTextStripper().getText(document);       // varre o PDF e devolve texto puro
}
```

3. **`chamarGroq`** — monta a chamada HTTP à API da Groq:
   - **Prompt de sistema** (define o comportamento): *"Você é um analisador de currículos. Responda SOMENTE com um JSON válido... com exatamente estas 12 chaves... Se algum campo não existir, retorne string vazia."*
   - **Prompt de usuário**: instruções campo a campo + o texto do currículo colado no final.
   - Corpo montado **com Jackson** (`objectMapper.writeValueAsString`) em vez de concatenação de strings — assim aspas, quebras de linha e barras invertidas do currículo são escapadas corretamente (senão o JSON quebraria).
   - `"model": "llama-3.1-8b-instant"` e `"temperature": 0.2` → temperatura baixa = respostas **determinísticas e obedientes** (queremos extração fiel, não criatividade).
   - Envio com o `HttpClient` nativo do Java 11+: `POST` para `https://api.groq.com/openai/v1/chat/completions` com header `Authorization: Bearer <groq.api.key>`.

4. **`deserializarResposta`** — lê a resposta:
   - Se vier `{"error": ...}` (chave inválida, rate limit), lança exceção com a mensagem.
   - O texto da IA vem embrulhado em `choices[0].message.content` (formato padrão OpenAI-compatible).
   - Remove eventuais cercas de markdown (` ```json `) que o modelo às vezes adiciona.
   - `objectMapper.readTree(textoJson)` + `dados.path("nome").asText("")` → monta o record `CurriculoDadosIA` com defaults vazios para campos ausentes.

## 7.7 Camada Security (configuração) — detalhada na Parte 8

## 7.8 Camada Controller

### `AuthenticationController.java` — `/auth`

```java
@RestController                 // controller REST: retorno já vira JSON
@RequestMapping("auth")         // prefixo das rotas
public class AuthenticationController {
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private TokenService tokenService;
```

**`POST /auth/login`:**

```java
public ResponseEntity login(@RequestBody @Valid AuthenticationDTO data) {
    var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());
    var auth = this.authenticationManager.authenticate(usernamePassword);  // ← a mágica
    var token = tokenService.generateToken((Usuario) auth.getPrincipal());
    return ResponseEntity.ok(new LoginResponseDTO(token));
}
```

- `@RequestBody` = desserializa o JSON do corpo para o DTO; `@Valid` ativa validações.
- `authenticate(...)` dispara internamente: chama `AuthorizationService.loadUserByUsername(login)` → pega o usuário do banco → compara a senha digitada com o hash usando o `BCryptPasswordEncoder` → se bater, devolve o usuário autenticado (`getPrincipal()`); se não, lança exceção (cai no `catch` e devolve erro).
- Com o usuário autenticado, geramos o JWT e devolvemos `{"token": "eyJ..."}`.

**`POST /auth/register`:**

```java
if (this.usuarioRepository.findByLogin(data.login()) != null)
    return ResponseEntity.badRequest().build();          // login duplicado → 400

String encryptedPassword = new BCryptPasswordEncoder().encode(data.password()); // hash!

// Herança SINGLE_TABLE em ação: ADMIN vira instância da subclasse Admin
Usuario newUser = (data.role() == UserRole.ADMIN)
        ? new Admin(data.login(), data.email(), encryptedPassword)
        : new Usuario(data.login(), data.email(), encryptedPassword, data.role());

this.usuarioRepository.save(newUser);                    // INSERT via JPA
return ResponseEntity.ok().build();                      // 200 sem corpo
```

A senha **nunca** chega ao banco em texto puro: `encode()` gera o hash BCrypt antes do `save`. E note o **polimorfismo**: a variável é do tipo `Usuario`, mas pode receber um `Admin`; o `save()` grava os dois na mesma tabela, com `tipo` diferente.

### `UsuarioController.java` — `/usuario` (CRUD completo, rotas protegidas)

| Verbo + rota | Método | O que faz | Status |
|---|---|---|---|
| `GET /usuario/` | `getAllUsuarios` | `findAll()` → lista todos | 200 |
| `GET /usuario/{id}` | `getUsuarioById` | `findById(id)` | 200 |
| `POST /usuario/` | `saveUsuario` | `save(usuario)` cru (sem BCrypt — cadastro "oficial" é o `/auth/register`) | 200 |
| `PUT /usuario/{id}` | `updateUsuario` | Substitui login, email e senha — **só a própria conta** | 200 / 403 / 404 |
| `PATCH /usuario/{id}` | `patchUsuario` | Atualiza **só os campos não nulos** do corpo — **só a própria conta** | 200 / 403 / 404 |
| `DELETE /usuario/{id}` | `deleteUsuario` | `deleteById(id)` (cascade apaga os currículos!) — **só a própria conta** | 200 / 403 |

Padrão de todos: `@PathVariable` captura o `{id}` da URL; `Optional<Usuario>` + `isPresent()` para tratar o 404; `ResponseEntity<>(corpo, HttpStatus.X)` para montar a resposta.

**Diferença didática PUT × PATCH** (o professor pode perguntar): `PUT` substitui o recurso inteiro (manda tudo); `PATCH` altera parcialmente (só o que veio no corpo — por isso os `if (campo != null)`).

**Identidade pelo token, não pelo `{id}` da URL (Atividade 10):** o `{id}` na URL só endereça o recurso — ele **não prova** quem está fazendo a requisição. Sem uma checagem extra, qualquer usuário autenticado poderia editar ou apagar **qualquer outro** só trocando o número na URL (ex.: logado como o usuário 5, mandar `DELETE /usuario/8` e apagar a conta de outra pessoa). Por isso `updateUsuario`, `patchUsuario` e `deleteUsuario` recebem também `@AuthenticationPrincipal Usuario usuarioAutenticado` e começam com:

```java
if (!usuarioAutenticado.getId().equals(id)) {
    return new ResponseEntity<>(HttpStatus.FORBIDDEN);   // 403: só pode mexer na PRÓPRIA conta
}
```

`usuarioAutenticado` vem do token (via `SecurityFilter` → `SecurityContextHolder`); `id` vem da URL. Só prosseguimos se os dois coincidirem — ou seja, **o token manda**, a URL só serve para montar a rota REST.

### `CurriculoController.java` — `/curriculo`

| Verbo + rota | Protegida? | O que faz |
|---|---|---|
| `GET /curriculo/` | 🔒 sim | Lista todos os currículos |
| `GET /curriculo/{id}` | 🔒 sim | Busca por id (404 se não existir) |
| `GET /curriculo/publico/{login}` | 🌐 **pública** | Devolve o **último** currículo do usuário com aquele login — alimenta a página pública de portfólio |
| `POST /curriculo/` | 🔒 sim | **Upload do PDF** (multipart) + chama a IA + salva → **201 Created** |
| `PUT /curriculo/{id}` | 🔒 sim | Substitui conteúdo/pdf/usuário |
| `PATCH /curriculo/{id}` | 🔒 sim | Atualização parcial **com checagem de dono** |
| `DELETE /curriculo/{id}` | 🔒 sim | Apaga |

**O endpoint público (`/publico/{login}`)** — vale entender o stream:

```java
List<Curriculo> todos = (List<Curriculo>) curriculoRepository.findAll();
return todos.stream()
    .filter(c -> c.getUsuario() != null && login.equals(c.getUsuario().getLogin())) // só os do usuário
    .reduce((a, b) -> b)                       // fica com o ÚLTIMO (mais recente)
    .map(c -> new ResponseEntity<>(c, HttpStatus.OK))
    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));   // nenhum → 404
```

`reduce((a,b) -> b)` percorre a lista sempre descartando o acumulado e ficando com o elemento atual — no fim, sobra o último currículo enviado, que é o exibido no portfólio.

**O upload (`POST /curriculo/`)** — é o clímax da demo:

```java
@PostMapping(value = "/", consumes = "multipart/form-data", produces = "application/json")
public ResponseEntity<Curriculo> saveCurriculo(
        @RequestParam("conteudoTexto") String conteudoTexto,
        @RequestParam("arquivoPdf") MultipartFile arquivoPdf,
        @AuthenticationPrincipal Usuario usuarioAutenticado) {   // ← o dono vem do TOKEN
    ...
    curriculo.setUsuario(usuarioAutenticado);   // nunca de um id enviado pelo cliente
```

- `consumes = "multipart/form-data"`: o formato usado para **enviar arquivos** via HTTP (o corpo vai dividido em "partes": campos de texto + o binário do PDF).
- `MultipartFile` é a abstração do Spring para o arquivo recebido; `arquivoPdf.getBytes()` dá o binário.
- Fluxo interno: bytes do PDF → `iaService.extrairDadosDoCurriculo(pdfBytes)` → preenche os 12 campos `*Extraido` no `Curriculo` → **`sincronizarSkills(curriculo)`** popula a relação N:N → `save` → devolve o currículo completo com **201 Created**.
- **Identidade pelo token, não pela requisição:** esse endpoint **não recebe** `usuarioId` do cliente. O dono do currículo é sempre `@AuthenticationPrincipal Usuario usuarioAutenticado` — o mesmo objeto que o `SecurityFilter` colocou no `SecurityContextHolder` ao validar o JWT. Isso existe por um motivo de segurança concreto: antes, o endpoint recebia um `usuarioId` como campo do formulário e confiava cegamente nele — qualquer um podia trocar esse valor e criar um currículo em nome de **outro** usuário (um clássico **IDOR — Insecure Direct Object Reference**, o mesmo problema do exemplo `/add/camera/10`: usar um id vindo do cliente para decidir "de quem" é o recurso). A correção: nunca aceitar a identidade do dono via URL/body/form — sempre derivá-la do token.

**O PATCH com autorização em nível de objeto:**

```java
@PatchMapping(value = "/{id}")
public ResponseEntity<Curriculo> patchCurriculo(@PathVariable Long id,
        @RequestBody Curriculo curriculoAtualizado,
        @AuthenticationPrincipal Usuario usuarioAutenticado) {   // ← usuário do token!
    ...
    if (curriculo.getUsuario() == null ||
        !curriculo.getUsuario().getLogin().equals(usuarioAutenticado.getLogin())) {
        return new ResponseEntity<>(HttpStatus.FORBIDDEN);   // 403: não é seu!
    }
    // ... para cada campo: if (novoValor != null) aplica ...
}
```

- `@AuthenticationPrincipal` injeta o **usuário autenticado da requisição atual** — exatamente o objeto que o `SecurityFilter` colocou no `SecurityContextHolder` ao validar o JWT.
- Antes de editar, compara o dono do currículo com quem está pedindo: **um usuário não consegue editar o portfólio de outro** (retorna 403). Isso é autorização *em nível de objeto*, um degrau acima da simples autenticação.
- Quando o corpo traz `skillsExtraidas`, o PATCH também chama `sincronizarSkills` — o texto editado e a relação N:N ficam sempre coerentes.
- Repare que o `id` na URL (`/curriculo/{id}`) identifica o **currículo** (o recurso), não o usuário — isso é normal e esperado em REST. O que não pode acontecer é usar esse `id` (ou qualquer campo do corpo) para decidir **de quem** é o recurso: essa decisão vem sempre do token.
- O **mesmo padrão** (`@AuthenticationPrincipal` + comparação de login antes de agir) também foi aplicado ao `updateCurriculo` (PUT) e ao `deleteCurriculo` (DELETE) — nenhum dos três verbos de escrita confia no corpo/URL para saber quem é o dono. E nenhum deles permite **reatribuir** o dono via corpo da requisição (o campo `usuario` do JSON é sempre ignorado nessas operações) — senão um usuário poderia "transferir" o currículo de outra pessoa para si mesmo só editando o JSON enviado.

**O método `sincronizarSkills` (a "cola" entre o texto da IA e o N:N):**

```java
private void sincronizarSkills(Curriculo curriculo) {
    List<Skill> skills = new ArrayList<>();
    String texto = curriculo.getSkillsExtraidas();          // ex.: "Java, React, SQL"
    if (texto != null) {
        Arrays.stream(texto.split(","))
                .map(String::trim)                          // tira espaços
                .filter(s -> !s.isEmpty())                  // ignora vazios
                .distinct()                                 // sem duplicatas
                .forEach(nome -> {
                    Skill skill = skillRepository.findByNome(nome);   // já existe?
                    if (skill == null) skill = skillRepository.save(new Skill(nome)); // cria
                    skills.add(skill);                       // associa ao currículo
                });
    }
    curriculo.setSkills(skills);   // o save() do currículo grava a tabela curriculo_skill
}
```

É o padrão *find-or-create*: se dois usuários têm "Java" no currículo, a skill "Java" existe **uma única vez** na tabela `skill` e as duas ligações vivem na `curriculo_skill` — dados normalizados, exatamente o que o N:N proporciona.

---

# PARTE 8 — Segurança de ponta a ponta (BCrypt + JWT + filtros)

*Esta é a parte que o professor mais cobra. Leia duas vezes.*

## 8.1 Visão geral do fluxo

```
CADASTRO:  senha "123456" ──BCrypt.encode()──▶ "$2a$10$Xb9..." ──▶ banco

LOGIN:     login+senha ──▶ AuthenticationManager
                             ├─▶ AuthorizationService.loadUserByUsername() → usuário do banco
                             ├─▶ BCrypt compara "123456" com o hash salvo
                             └─▶ ok? → TokenService.generateToken() → {"token": "eyJhbGci..."}
           React salva o token no localStorage

REQUISIÇÃO PROTEGIDA:
           axios manda "Authorization: Bearer eyJhbGci..."
             ─▶ SecurityFilter: extrai token → validateToken() → login
             ─▶ busca usuário no banco → coloca no SecurityContextHolder
             ─▶ SecurityConfigurations: rota exige autenticação? tem usuário no contexto? passa!
             ─▶ Controller executa
           Sem token válido → 403 Forbidden, o controller NEM É CHAMADO
```

## 8.2 BCrypt — por que a senha nunca fica em texto puro

- **Hash** = função de mão única: fácil calcular `hash("123456")`, impossível reverter o hash para a senha.
- Se o banco vazar, o atacante vê apenas `$2a$10$N9qo8uLOickgx2ZMRZoMye...` — inútil sem quebrar.
- BCrypt ainda embute um **salt aleatório** em cada hash (duas pessoas com a mesma senha têm hashes **diferentes** — derrota ataques com tabelas prontas/rainbow tables) e é **propositalmente lento** (dificulta força bruta).
- Na verificação, o BCrypt não "descriptografa": ele re-hasheia a senha digitada com o mesmo salt e compara os resultados.
- No código: bean `PasswordEncoder` em `SecurityConfigurations`; `encode()` no registro; a comparação no login é feita por dentro do `authenticationManager.authenticate(...)`.

## 8.3 Anatomia de um JWT

Um JWT é uma string com **3 partes separadas por ponto**: `xxxxx.yyyyy.zzzzz`

| Parte | Conteúdo | No nosso caso |
|---|---|---|
| **Header** | algoritmo e tipo | `{"alg":"HS256","typ":"JWT"}` |
| **Payload** (claims) | os dados | `{"iss":"auth-api","sub":"gustavo","exp":1752634800}` — emissor, login do usuário, expiração (2h) |
| **Signature** | assinatura | `HMACSHA256(base64(header) + "." + base64(payload), segredo)` |

- Header e payload são só **base64** — qualquer um decodifica e lê (cole um token em jwt.io e veja). O que protege é a **assinatura**: alterar qualquer coisa invalida o token, e só quem tem o **segredo** (o servidor) consegue assinar.
- **Por que JWT em vez de sessão?** O servidor fica **stateless**: não guarda nada sobre quem está logado; toda informação está no próprio token, verificável matematicamente. Escala melhor (qualquer instância do servidor valida) e casa com o modelo REST.

## 8.4 `SecurityConfigurations.java` — as regras do jogo

```java
@Configuration
@EnableWebSecurity          // assumimos o controle da configuração de segurança
public class SecurityConfigurations {

    @Autowired SecurityFilter securityFilter;
    @Autowired CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
            .cors(cors -> cors.configurationSource(corsConfigurationSource))  // aplica nosso CORS
            .csrf(csrf -> csrf.disable())                                      // ver box abaixo
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()      // públicas
                .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
                .requestMatchers(HttpMethod.GET, "/curriculo/publico/**").permitAll()
                .anyRequest().authenticated()                                     // TODO O RESTO exige login
            )
            .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception {
        return c.getAuthenticationManager();   // expõe o gerente de autenticação p/ o login
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}
```

Cada decisão explicada:

- **`csrf.disable()`** — CSRF é um ataque que abusa de **cookies de sessão** enviados automaticamente pelo navegador. Como nossa API não usa cookies nem sessão (o token vai manualmente no header via axios), o vetor de ataque não existe → o filtro CSRF só atrapalharia.
- **`STATELESS`** — proíbe o Spring de criar sessão HTTP. Cada requisição se autentica sozinha pelo token.
- **Rotas públicas**: login, registro (senão ninguém conseguiria entrar!) e o portfólio público (`/curriculo/publico/**` — o `**` casa qualquer coisa depois), pois recrutadores acessam sem conta.
- **`anyRequest().authenticated()`** — política **deny-by-default**: tudo que não foi explicitamente liberado exige autenticação. É o que faz o professor ver o **403** ao testar uma rota protegida sem token.
- **`addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)`** — insere o nosso filtro JWT **antes** do filtro padrão de autenticação do Spring, para que o usuário do token já esteja no contexto quando as regras de autorização rodarem.
- Os **beans** `AuthenticationManager` e `PasswordEncoder` ficam disponíveis para injeção (o controller de login usa o primeiro; o processo de autenticação usa o segundo).

## 8.5 `SecurityFilter.java` — o pedágio de toda requisição

```java
@Component
public class SecurityFilter extends OncePerRequestFilter {   // roda 1x por requisição

    @Autowired private TokenService tokenService;
    @Autowired private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        var token = this.recoverToken(request);          // 1. pega o token do header
        if (token != null) {
            var login = tokenService.validateToken(token);        // 2. valida → login (ou "")
            UserDetails user = usuarioRepository.findByLogin(login); // 3. carrega do banco
            if (user != null) {
                var authentication = new UsernamePasswordAuthenticationToken(
                        user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication); // 4. "está logado"
            }
        }
        filterChain.doFilter(request, response);         // 5. segue para o próximo filtro
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        return authHeader.replace("Bearer ", "");        // tira o prefixo, sobra só o token
    }
}
```

Narrativa para a apresentação:

1. Chega uma requisição. O filtro tenta ler o header `Authorization` e remove o prefixo `"Bearer "`.
2. Se há token, o `TokenService` confere assinatura e validade e devolve o **login** contido no `subject`.
3. Com o login, buscamos o usuário real no banco.
4. Colocamos o usuário no **`SecurityContextHolder`** — a "memória de segurança" daquela requisição. É daqui que o `@AuthenticationPrincipal` do controller tira o usuário.
5. `filterChain.doFilter` passa o bastão adiante. **Repare: o filtro nunca bloqueia** — quem bloqueia é a regra `anyRequest().authenticated()`: se o contexto ficou vazio (sem token/ token inválido) e a rota é protegida, o Spring responde 403 antes de chegar ao controller.

> `OncePerRequestFilter` garante execução única por requisição (evita rodar 2x em forwards internos).

## 8.6 `CorsConfig.java` — por que o navegador deixaria o 5173 falar com o 8080?

**CORS (Cross-Origin Resource Sharing):** por segurança, o navegador **bloqueia** requisições JavaScript entre origens diferentes (`localhost:5173` → `localhost:8080` são origens diferentes — a porta conta!). O servidor precisa declarar explicitamente que aceita:

```java
config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));  // http://localhost:5173
config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
config.setAllowedHeaders(List.of("Authorization","Content-Type","Accept"));
config.setAllowCredentials(true);
source.registerCorsConfiguration("/**", config);   // vale para todas as rotas
```

- A origem permitida vem do `application.properties` (`cors.allowed-origins`), com default `http://localhost:5173` — configurável sem recompilar.
- `OPTIONS` na lista: antes de requisições "não simples" (ex.: com header `Authorization`), o navegador manda um **preflight** `OPTIONS` perguntando "posso?"; o servidor responde com essas permissões.
- Sem essa classe, o front receberia o famoso erro *"blocked by CORS policy"* no console.

---

# PARTE 9 — A Inteligência Artificial (PDF → Portfólio)

## 9.1 O fluxo completo

```
[React] usuário escolhe PDF → axios POST /curriculo/ (multipart/form-data, com Bearer token)
   │
[CurriculoController.saveCurriculo] recebe MultipartFile → bytes
   │
[IaService.extrairDadosDoCurriculo]
   │
   ├─ 1. extrairTextoDoPdf  → Apache PDFBox lê os bytes e devolve TEXTO PURO
   │       (LLMs não leem binário de PDF; precisam de texto)
   │
   ├─ 2. chamarGroq → POST https://api.groq.com/openai/v1/chat/completions
   │       headers: Authorization: Bearer gsk_...   (chave da Groq)
   │       body: { model: "llama-3.1-8b-instant",
   │               messages: [ {role:"system", content: "Responda SOMENTE JSON com 12 chaves..."},
   │                           {role:"user",   content: "Analise o currículo... <texto do PDF>"} ],
   │               temperature: 0.2 }
   │
   └─ 3. deserializarResposta → navega em choices[0].message.content,
           limpa ```json, parseia com Jackson → record CurriculoDadosIA
   │
[Controller] copia os 12 campos para a entidade Curriculo → save() → 201 + JSON
   │
[React] recebe o currículo processado e preenche o formulário de revisão
```

## 9.2 Decisões de projeto que valem nota

- **Por que Groq?** API gratuita, extremamente rápida (hardware especializado em inferência) e **compatível com o formato OpenAI** (mesmo formato de request/response — se um dia trocarmos de provedor, quase nada muda).
- **Prompt engineering:** o *system prompt* impõe o formato ("SOMENTE JSON válido, sem markdown, exatamente estas 12 chaves, string vazia se faltar") e o *user prompt* descreve campo a campo o que extrair. Formato previsível = parsing confiável.
- **`temperature: 0.2`:** temperatura controla a aleatoriedade do modelo. Baixa = fiel e consistente (extração de dados); alta = criativo (não queremos que ele *invente* experiências!).
- **Robustez em camadas:**
  1. JSON do request montado com Jackson (escapa caracteres especiais do currículo);
  2. resposta com `error` vira exceção explícita;
  3. limpeza de cercas markdown que o modelo às vezes adiciona;
  4. `path(...).asText("")` tolera chaves ausentes;
  5. e se tudo falhar, o `catch` devolve o record vazio — **o usuário ainda consegue preencher tudo à mão no Dashboard**. A IA é um acelerador, não um ponto único de falha.

---

# PARTE 10 — Front-end arquivo por arquivo

## 10.1 Conceitos de React que você PRECISA saber explicar

- **Componente:** função JavaScript que retorna **JSX** (HTML dentro do JS). Ex.: `export default function Login() { return <div>...</div> }`. A UI inteira é uma árvore de componentes.
- **JSX:** sintaxe que mistura marcação e lógica: `{variavel}` interpola valores, `{condicao && <X/>}` renderiza condicionalmente, `className` no lugar de `class`.
- **`useState`:** cria uma variável de **estado**. `const [erro, setErro] = useState('')` → `erro` é o valor, `setErro` a única forma de mudá-lo. **Quando o estado muda, o React re-renderiza o componente** — é assim que a tela "reage".
- **`useEffect`:** executa **efeitos colaterais** (buscar dados, timers, listeners) depois da renderização. O array de dependências controla quando roda: `[]` = uma vez ao montar; `[x]` = sempre que `x` mudar. A função retornada é o **cleanup** (ex.: `clearInterval`).
- **`.map()`:** transforma uma lista de dados em uma lista de elementos JSX — é o jeito React de renderizar listas dinâmicas: `{skills.map((s, i) => <span key={i}>{s}</span>)}`. O `key` ajuda o React a identificar cada item ao atualizar.
- **Componente controlado:** input cujo `value` vem do estado e cujo `onChange` atualiza o estado — o React é a fonte da verdade do formulário.
- **Props:** parâmetros que um componente recebe. Ex.: `PrivateRoute({ children })` — `children` é o conteúdo passado entre as tags.

## 10.2 `main.jsx` — o bootstrap (inicialização) da aplicação

```jsx
import './index.css'          // aqui entra o Tailwind (@import "tailwindcss")
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

O `index.html` tem uma única `<div id="root">`; o React "monta" toda a aplicação dentro dela (por isso SPA). `StrictMode` ativa checagens extras em desenvolvimento. O `index.css` começa com `@import "tailwindcss";`, que injeta todas as classes utilitárias do Tailwind (`flex`, `rounded-md`, `bg-[#0d6efd]`...) usadas nas páginas.

> Nota: "bootstrap da aplicação" aqui é o termo genérico de programação para **"inicialização"** (carregar e arrancar o app) — não tem relação com o **framework CSS Bootstrap**, que não é mais usado neste projeto (ver 10.1-A).

### 10.1-A Por que Tailwind CSS em vez de Bootstrap

O projeto foi migrado de Bootstrap 5 para **Tailwind CSS 4** (instalado via `@tailwindcss/vite`, que integra o Tailwind direto no build do Vite sem precisar de `tailwind.config.js` — a configuração vive em CSS, no próprio `@import "tailwindcss"`). Isso é uma mudança de framework CSS, **não** de conceitos React — `useState`, `useEffect`, `.map()`, componentes controlados etc. continuam exatamente iguais.

**A diferença de filosofia entre os dois:**

| | Bootstrap | Tailwind |
|---|---|---|
| Unidade de estilo | Componentes prontos (`.btn`, `.card`, `.alert`) já com aparência definida | Classes utilitárias atômicas (`flex`, `px-4`, `rounded-md`) que você combina você mesmo |
| Onde mora o CSS | Um arquivo `.css` gigante e genérico, importado inteiro | Gerado sob demanda: só entram no build as classes realmente usadas no JSX |
| Customizar um componente | Sobrescrever CSS ou usar variáveis Sass | Trocar a combinação de classes diretamente no elemento |

Cada classe Bootstrap tem um equivalente direto (ou uma combinação equivalente) em Tailwind — por exemplo: `d-flex` → `flex`, `btn btn-primary` → `bg-[#0d6efd] text-white rounded-md px-3 py-1.5`, `container`/`row`/`col-md-6` → `grid grid-cols-1 md:grid-cols-2 gap-4`. O **resultado visual é idêntico** ao Bootstrap original — só mudou a ferramenta usada para chegar lá.

## 10.3 `App.jsx` — rotas e proteção

```jsx
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  { path: '/',                    element: <Home /> },
  {
    element: <AuthLayout />,                 // rota-PAI: o layout fixo
    children: [                              // rotas-FILHAS: renderizam no <Outlet>
      { path: '/login',    element: <Login /> },
      { path: '/cadastro', element: <Cadastro /> },
    ],
  },
  { path: '/dashboard',           element: <PrivateRoute><Dashboard /></PrivateRoute> },
  { path: '/portfolio/:username', element: <Portfolio /> },
  { path: '*',                    element: <NotFound /> },
])

export default function App() { return <RouterProvider router={router} /> }
```

- `createBrowserRouter` (React Router 7): mapeia URLs → componentes. Navegar **não recarrega a página** — o router troca o componente e atualiza a URL via History API.
- **Rotas aninhadas + `<Outlet>`:** a rota-pai sem `path` renderiza o `AuthLayout`; quando a URL é `/login` ou `/cadastro`, a página filha aparece **dentro** do `<Outlet>` do layout (ver 10.4).
- **`PrivateRoute` é a proteção de rotas no front:** verifica se existe token no `localStorage`; se não, `<Navigate to="/login" replace />` redireciona (o `replace` impede voltar com o botão "voltar"). É a **demonstração exigida pelo professor**: usuário sem login tentando `/dashboard` é jogado para `/login`.
- `:username` é um **parâmetro dinâmico** de rota, lido na página com `useParams()`.
- `path: '*'` é o **coringa**: qualquer URL não mapeada cai na página **404 personalizada**.

> ⚠️ Importante ser honesto se perguntarem: a proteção do front é **UX**, não segurança — qualquer um pode colocar um token falso no localStorage e ver o *layout* do Dashboard. A segurança **real** está no back-end: sem token válido, toda chamada da página falha com 403. Front esconde; back-end **impede**.

## 10.4 `layouts/AuthLayout.jsx` — o template fixo com `<Outlet>`

```jsx
import { Outlet, useNavigate } from 'react-router-dom'

export default function AuthLayout() {
  const navigate = useNavigate()
  return (
    <div className="min-vh-100 d-flex flex-column bg-dark">
      {/* CABEÇALHO + NAVEGAÇÃO (fixos) */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3">
        <span onClick={() => navigate('/')}>🚀 PortfólioPro</span>
        <button onClick={() => navigate('/')}>← Voltar</button>
      </div>

      {/* CONTEÚDO (variável) — a página filha entra AQUI */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <Outlet />
      </div>

      {/* RODAPÉ (fixo) */}
      <footer>PortfólioPro — UNESP 2026 — Grupo X ...</footer>
    </div>
  )
}
```

- **`<Outlet>` é o "buraco" do template:** o layout define o que é fixo (cabeçalho com a marca e navegação de volta, fundo escuro, rodapé) e o React Router injeta no `<Outlet>` a página filha correspondente à URL (`Login` ou `Cadastro`).
- Estrutura exigida pelo enunciado: **Cabeçalho + Navegação → Conteúdo → Rodapé**.
- Benefício prático: `Login.jsx` e `Cadastro.jsx` tinham topbar e wrapper **duplicados**; agora só renderizam o card do formulário — o código repetido vive num único lugar (princípio DRY). Ao navegar entre `/login` e `/cadastro`, o layout **nem re-renderiza** — só o miolo troca.

## 10.5 `services/api.js` — axios + interceptor (3 linhas que valem ouro)

```js
const api = axios.create({ baseURL: 'http://localhost:8080' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

- `axios.create` centraliza a URL da API — as páginas chamam só `api.get('/curriculo/')`.
- O **interceptor** roda **antes de cada requisição** e injeta `Authorization: Bearer <token>` automaticamente se houver token salvo. Resultado: nenhuma página precisa lembrar de mandar o token — impossível esquecer. É o "espelho" do `SecurityFilter` do back: um põe o token, o outro lê.

## 10.6 `services/themes.js`

Array `THEMES` com 8 objetos `{ id, nome, gradient }` (gradientes CSS) + `getTheme(id)` que devolve o tema ou o primeiro como fallback. Usado pelo Dashboard (seletor) e pelo Portfolio (fundo da página).

## 10.7 `pages/Home.jsx` — a landing page

Página pública de marketing: navbar com botões **Entrar**/**Criar conta** (usam `useNavigate()` para trocar de rota), hero com título e call-to-action, e três cards de features (Upload de PDF, Extração por IA, Portfólio público) com ícones do `lucide-react`. Layout todo em classes utilitárias do Tailwind (`flex`, `grid grid-cols-1 md:grid-cols-3`, `bg-[#0d6efd]`...) — o container central usa a classe customizada `.container-bs` (definida em `index.css`), que replica exatamente os breakpoints do antigo `.container` do Bootstrap.

## 10.8 `pages/Login.jsx` e `pages/Cadastro.jsx`

Ambas renderizam **dentro do `<Outlet>` do `AuthLayout`** (só devolvem o card do formulário — cabeçalho e rodapé vêm do layout). Estrutura idêntica (explicou uma, explicou as duas):

```jsx
const [form, setForm] = useState({ login: '', password: '' })   // estado do formulário
const [erro, setErro] = useState('')
const [carregando, setCarregando] = useState(false)

function handleChange(e) {
  setForm({ ...form, [e.target.name]: e.target.value })
  // spread (...) copia o form atual; [e.target.name] atualiza SÓ o campo digitado
  // (o atributo name do input casa com a chave do estado — um handler serve p/ todos os campos)
}

async function handleSubmit(e) {
  e.preventDefault()                       // impede o reload padrão do form HTML
  const resposta = await api.post('/auth/login', form)
  localStorage.setItem('token', resposta.data.token)   // ★ salva o JWT (exigência do enunciado)
  localStorage.setItem('login', form.login)            // guarda o login p/ uso no Dashboard
  navigate('/dashboard')                   // entra na área privada
}
```

- Inputs **controlados** (`value` + `onChange`).
- Estados de UX: `carregando` desabilita o botão e troca o texto ("Entrando..."); `erro` mostra uma caixa de alerta vermelha (classes Tailwind `bg-[#f8d7da] text-[#842029] border border-[#f5c2c7]`, as mesmas cores exatas do antigo `.alert-danger` do Bootstrap).
- **Cadastro:** envia `{ login, email, password, role: 'USER' }` para `/auth/register` e redireciona para `/login` (o usuário então loga). Em erro: "login pode já estar em uso" (o back devolve 400 para duplicado).
- `localStorage` = armazenamento persistente do navegador (sobrevive a fechar a aba). É onde o token vive até o logout.

## 10.9 `pages/Dashboard.jsx` — a página privada (a mais complexa)

Responsabilidades, em ordem:

**a) Identificação e carga inicial**

```jsx
const login = localStorage.getItem('login') || 'usuário'
useEffect(() => { buscarCurriculo() }, [])   // ao montar a página

async function buscarCurriculo() {
  const resposta = await api.get('/curriculo/')                 // rota PROTEGIDA (token vai junto)
  const meus = resposta.data.filter(c => c.usuario?.login === login)
  if (meus.length > 0) preencherCampos(meus[meus.length - 1])   // o mais recente
}
```

Se o usuário já tem currículo, o formulário abre preenchido (dá para continuar editando entre sessões).

**b) Upload do PDF (o clímax)**

```jsx
const formData = new FormData()                       // corpo multipart/form-data
formData.append('arquivoPdf', arquivo)                // o ARQUIVO em si
formData.append('conteudoTexto', 'Currículo de ' + login)
const resposta = await api.post('/curriculo/', formData,
    { headers: { 'Content-Type': 'multipart/form-data' } })   // o interceptor já manda o Bearer Token
preencherCampos(resposta.data)                        // preenche o form com o que a IA extraiu
```

Enquanto isso, `enviando === true` mostra o spinner "Processando IA...". Após o upload, se o usuário já tinha foto/fundo/favicon, um `PATCH` os re-aplica ao novo registro de currículo (para não perder a personalização ao reenviar o PDF).

> **Nota (Atividade 10):** este trecho **não manda mais** `usuarioId` — antes o front fazia um `GET /usuario/` (listando todo mundo!) só para descobrir o próprio id e anexá-lo ao form-data. Isso foi removido porque o back-end passou a identificar o dono do currículo **direto pelo Bearer Token** (`CurriculoController.saveCurriculo`, ver Parte 7.8) — o front não precisa mais informar quem é o usuário, e não teria como fraudar essa informação mesmo se tentasse.

**c) Personalização visual**

- **Temas:** `THEMES.map(...)` renderiza 8 quadradinhos de gradiente clicáveis; o selecionado ganha borda branca (estado `temaSelecionado`).
- **Imagens:** `FileReader.readAsDataURL(file)` converte o arquivo escolhido em **base64** (estados `fotoBase64`, `fundoBase64`, `faviconBase64`), com preview imediato via `URL.createObjectURL`.

**d) Edição e salvamento**

Todos os 12 campos extraídos viram inputs controlados (objeto de estado `campos` + um único `handleCampo`). Skills/soft skills/idiomas têm **preview ao vivo com `.map()`**: o texto separado por vírgulas vira badges coloridas na hora, conforme o usuário digita. Salvar dispara:

```jsx
await api.patch(`/curriculo/${curriculoId}`, payload)          // atualização PARCIAL
localStorage.setItem('portfolio_updated', Date.now().toString()) // avisa a aba do portfólio
```

**e) Logout**

```jsx
localStorage.removeItem('token'); localStorage.removeItem('login'); navigate('/login')
```

Sem token no localStorage, o `PrivateRoute` volta a bloquear o `/dashboard`.

## 10.10 `pages/Portfolio.jsx` — a página pública gerada

- `const { username } = useParams()` lê o login da URL (`/portfolio/gustavo`).
- Busca `GET /curriculo/publico/${username}` (rota **pública** — funciona até em aba anônima, sem token).
- **Três mecanismos de atualização** (dá para editar no Dashboard e ver o portfólio mudar "ao vivo" na outra aba):
  1. busca inicial no mount;
  2. **polling**: `setInterval(buscar, 4000)` re-busca a cada 4 s (com `clearInterval` no cleanup);
  3. **evento de storage**: quando o Dashboard grava `portfolio_updated` no localStorage, o navegador dispara o evento `storage` nas outras abas → refresh instantâneo.
- **Três estados de tela:** carregando (spinner) → não encontrado ("usuário ainda não gerou portfólio") → portfólio completo.
- Renderização dos dados — **`.map()` intensivo**, como o enunciado pede:
  - `skillsExtraidas.split(',')` → badges azuis; soft skills → verdes; idiomas → amarelas;
  - experiências e educação: `split(',')` → um card por item;
  - projetos: `split('.')` filtrando frases curtas → grid de cards 2 colunas.
- Personalização aplicada: fundo = gradiente do tema salvo; header com imagem de fundo (com fade calculado a partir da última cor do gradiente) ou fallback; foto de perfil redonda ou avatar com a inicial do nome; `useEffect` troca o **favicon e o título da aba** dinamicamente (`document.title = "Nome | Portfólio"`).
- Estilo "glassmorphism": cards translúcidos com `backdropFilter: blur(16px)`.

## 10.11 `pages/NotFound.jsx`

Página 404 personalizada (exigência do enunciado): "404 — Página não encontrada" + botão de volta ao início. Ativada pelo `path: '*'` do router. **Demo:** digite `/qualquercoisa` na URL e mostre que a página aparece **sem recarregar** o app.

---

# PARTE 11 — Fluxos completos ponta a ponta (roteiro da live demo)

## Fluxo 1 — Cadastro

1. Usuário preenche login/email/senha em `/cadastro` → submit.
2. React: `POST /auth/register` com `{login, email, password, role:"USER"}` (rota pública).
3. Back: `findByLogin` — duplicado? → 400. Senão: `BCryptPasswordEncoder().encode(senha)` → `save` → 200.
4. Banco: linha nova em `usuario` com a senha **hasheada**.
5. React redireciona para `/login`.

## Fluxo 2 — Login

1. `POST /auth/login` com `{login, password}`.
2. `AuthenticationManager.authenticate` → `AuthorizationService.loadUserByUsername` (busca no banco) → BCrypt compara senha × hash.
3. Ok → `TokenService.generateToken` → resposta `{"token":"eyJ..."}`.
4. React: `localStorage.setItem('token', ...)` → `navigate('/dashboard')`.
5. *(Demo: abra o DevTools → Application → Local Storage e mostre o token; cole-o em jwt.io e mostre o `sub` com o login.)*

## Fluxo 3 — Tentativa de acesso sem login (o professor VAI pedir)

- **Front:** sem token no localStorage, acessar `/dashboard` → `PrivateRoute` redireciona para `/login`.
- **Back:** `GET http://localhost:8080/curriculo/` sem header Authorization (via Postman/curl) → **403 Forbidden**, o controller nem executa.

## Fluxo 4 — Upload do PDF + IA (o clímax)

1. Dashboard: usuário escolhe o PDF → submit → axios `POST /curriculo/` **multipart/form-data** (interceptor põe o Bearer token).
2. `SecurityFilter` valida o token → usuário no contexto → controller autorizado.
3. Controller: bytes do PDF → `IaService`: PDFBox extrai texto → Groq (`llama-3.1-8b-instant`) devolve JSON com 12 campos → record → entidade preenchida → `save` → **201**.
4. React preenche o formulário de revisão com os dados extraídos (spinner "Processando IA..." enquanto isso).
5. Usuário revisa, escolhe tema/foto/fundo, salva (`PATCH /curriculo/{id}` — só o dono consegue: 403 para outros).

## Fluxo 5 — Portfólio público em tempo real

1. Qualquer pessoa (sem conta!) abre `/portfolio/<login>`.
2. React busca `GET /curriculo/publico/<login>` (rota pública) → back devolve o currículo mais recente do usuário.
3. Página renderiza tudo com `.map()`: badges de skills, cards de experiências/educação/projetos, tema e imagens personalizados.
4. *(Demo matadora: duas abas lado a lado — edite uma skill no Dashboard, salve, e veja o portfólio atualizar sozinho na outra aba em ~1 s, graças ao evento de storage + polling.)*

---

# PARTE 12 — Checklist do enunciado: ✅ TODOS os critérios obrigatórios atendidos

> **Atualização importante:** as três lacunas que existiam nesta seção (`SINGLE_TABLE`, `@ManyToMany` e `<Outlet>`) **foram implementadas no código**. Esta parte agora documenta **onde** cada critério do enunciado está atendido — use-a como "mapa de defesa" na apresentação.

## 12.0 Tabela de conformidade com o enunciado

| Critério do enunciado | Status | Onde está no código |
|---|---|---|
| Arquitetura em camadas Model/Repository/Service/Controller | ✅ | Pacotes `model/`, `repository/`, `service/`, `controller/` (+ `security/`) |
| Rotas RESTful com os verbos corretos (`@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`) | ✅ | `UsuarioController` e `CurriculoController` (GET/POST/PUT/PATCH/DELETE) |
| Relacionamento **1:N** (`@OneToMany`) | ✅ | `Usuario.curriculos` ↔ `Curriculo.usuario` (`@ManyToOne` + FK `usuario_id`) |
| Relacionamento **N:N** (`@ManyToMany`) | ✅ | `Curriculo.skills` ↔ `Skill.curriculos`, tabela de junção `curriculo_skill` |
| **Herança SINGLE_TABLE com `@DiscriminatorColumn`** | ✅ | `Usuario` (raiz, `@Inheritance(SINGLE_TABLE)`, `@DiscriminatorColumn(name="tipo")`) e `Admin extends Usuario` (`@DiscriminatorValue("ADMIN")`) |
| `/auth/login` e `/auth/register` + `SecurityFilter` validando JWT | ✅ | `AuthenticationController`, `SecurityFilter`, `TokenService` |
| Senhas com `BCryptPasswordEncoder` (nunca texto puro) | ✅ | Bean em `SecurityConfigurations`; `encode()` no register |
| React Router (página principal, domínio, 404 personalizada) | ✅ | `App.jsx` (`createBrowserRouter`, rota `*` → `NotFound`) |
| **`<Outlet>` com layout fixo (cabeçalho, navegação, conteúdo, rodapé)** | ✅ | `layouts/AuthLayout.jsx` — rota-pai de `/login` e `/cadastro` |
| Login/Cadastro salvando o JWT no localStorage | ✅ | `Login.jsx` (`localStorage.setItem('token', ...)`) |
| Proteção de rotas no front (dashboard só logado) | ✅ | `PrivateRoute` em `App.jsx` |
| Axios com Bearer Token no header | ✅ | Interceptor em `services/api.js` |
| `useState` intensivo + listas com `.map()` | ✅ | `Dashboard.jsx` e `Portfolio.jsx` |
| Upload de PDF via form-data acionando IA e renderizando portfólio | ✅ | `Dashboard.jsx` → `POST /curriculo/` → `IaService` → `Portfolio.jsx` |
| Diagrama UML com Herança, Associação, Agregação/Composição | ⚠️ | Conceitos todos no código; **regerar o PDF** incluindo `Admin` e `Skill` (ver Parte 5) |
| **Front-end com HTML, CSS e Bootstrap** | ❌ | O CSS do front foi migrado de Bootstrap para **Tailwind CSS** (ver 12.5) — decisão consciente do grupo, resultado visual idêntico, mas a tecnologia nomeada no enunciado não está mais em uso |
| Identidade do usuário sempre pelo Bearer Token (nunca por id na URL/body/form) | ✅ | `@AuthenticationPrincipal` em todos os endpoints de escrita de `CurriculoController` e `UsuarioController` (ver 12.6) |

## 12.1 Herança SINGLE_TABLE com @DiscriminatorColumn — ✅ IMPLEMENTADA

- **Como foi feito:** `Usuario` é a raiz da hierarquia, anotada com `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)` e `@DiscriminatorColumn(name = "tipo")`; a subclasse `Admin extends Usuario` tem `@DiscriminatorValue("ADMIN")` e sobrescreve `getAuthorities()` (polimorfismo). O `/auth/register` instancia `Admin` quando o papel enviado é ADMIN.
- **Efeito no banco:** continua existindo **uma única tabela** `usuario`, agora com a coluna discriminadora `tipo` (`'USUARIO'` ou `'ADMIN'`) — é exatamente a estratégia de Tabela Única do enunciado.
- **Por que não mudou o funcionamento:** o front sempre cadastra com `role: "USER"`, então o fluxo normal cria `Usuario` como antes; `Admin` herda tudo e é serializado igual. A coluna `tipo` é gerenciada só pelo Hibernate.
- **Frase de defesa:** "Nossa herança é `Admin extends Usuario` com estratégia SINGLE_TABLE: as duas classes moram na mesma tabela e a coluna `tipo` diz ao Hibernate qual classe instanciar em cada linha. O Admin sobrescreve `getAuthorities()` acumulando os papéis — herança com polimorfismo de verdade, integrada ao Spring Security."
- Detalhes completos: Partes 5.2, 6.2 e 7.4.

## 12.2 @ManyToMany — ✅ IMPLEMENTADO

- **Como foi feito:** nova entidade `Skill` (nome único no banco). `Curriculo` é o lado dono: `@ManyToMany` + `@JoinTable(name = "curriculo_skill", ...)`; `Skill` é o lado inverso (`mappedBy = "skills"`, com `@JsonIgnore` para evitar loop de serialização). O método `sincronizarSkills` do `CurriculoController` converte o texto extraído pela IA ("Java, React, SQL") em registros normalizados, com *find-or-create* — a mesma skill é **compartilhada** entre currículos de usuários diferentes.
- **Por que não mudou o funcionamento:** o campo textual `skillsExtraidas` continua existindo e é ele que o front consome; a relação N:N é mantida **em paralelo** e aparece no JSON como campo aditivo `skills` (o front simplesmente ignora). A sincronização roda no upload e no PATCH — sem nenhuma mudança de tela ou de fluxo.
- **Frase de defesa:** "Um currículo tem várias skills e a mesma skill aparece em vários currículos — N:N clássico. A tabela de junção `curriculo_skill` guarda os pares de FKs; a skill 'Java' existe uma única vez no banco, compartilhada. Dá para provar no psql: `SELECT * FROM curriculo_skill;`."
- Detalhes completos: Partes 5.2, 6.4 e 7.4/7.8.

## 12.3 `<Outlet>` / layout fixo — ✅ IMPLEMENTADO

- **Como foi feito:** `layouts/AuthLayout.jsx` é um componente de layout com **cabeçalho + navegação fixos** (marca clicável e botão Voltar), **conteúdo variável** via `<Outlet />` e **rodapé fixo**. No `App.jsx`, `/login` e `/cadastro` viraram **rotas filhas** dessa rota-pai; as páginas agora renderizam só o card do formulário, dentro do Outlet.
- **Por que não mudou o funcionamento:** o cabeçalho e o fundo escuro que o layout renderiza são **exatamente os mesmos** que Login e Cadastro duplicavam antes (o código foi extraído, não recriado). Única diferença visível: essas duas telas ganharam o mesmo rodapé discreto da Home — o resto é pixel a pixel igual.
- **Bônus de qualidade:** eliminou duplicação de código (DRY) — a topbar existia copiada e colada em dois arquivos.
- **Frase de defesa:** "O `AuthLayout` é o template: header, navegação e footer fixos, e o `<Outlet>` é o 'buraco' onde o Router injeta a página filha conforme a URL. Navegando entre /login e /cadastro, o layout nem re-renderiza — só o miolo troca, sem recarregar a página."
- Detalhes completos: Partes 10.3 e 10.4.

## 12.5 Bootstrap → Tailwind CSS — ⚠️ DESVIO CONSCIENTE DO ENUNCIADO

Ao contrário dos itens 12.1-12.3 (que **fecharam** lacunas), este é um ponto em que o grupo **se afastou** de algo que o enunciado pede explicitamente: *"Front-end: React JS (com HTML, CSS e Bootstrap)"*. Seja honesto sobre isso se perguntado — é a postura que temos mantido em toda esta apostila.

- **O que foi feito:** todo o CSS do front-end foi reescrito trocando as classes do Bootstrap 5 por classes utilitárias equivalentes do **Tailwind CSS 4** (instalado via `@tailwindcss/vite`), em `AuthLayout.jsx` e nas 6 páginas (`Home`, `Login`, `Cadastro`, `NotFound`, `Dashboard`, `Portfolio`). O pacote `bootstrap` foi removido do `package.json`.
- **Por que o resultado visual não mudou:** cada classe Bootstrap foi mapeada para o equivalente exato em Tailwind — cores convertidas para o hexadecimal exato do Bootstrap (ex.: `btn-primary` → `bg-[#0d6efd]`, o azul oficial do Bootstrap), espaçamentos convertidos rem-a-rem (a escala de espaçamento do Bootstrap não é a mesma do Tailwind por padrão: `p-3` do Bootstrap = 1rem, que corresponde a `p-4` no Tailwind, não a `p-3`), e o grid `container`/`row`/`col-*` foi recriado com CSS Grid do Tailwind (`grid grid-cols-1 md:grid-cols-2`) reproduzindo os mesmos breakpoints. O resultado foi comparado visualmente (screenshots antes/depois) e não há diferença perceptível.
- **Por que o grupo decidiu isso:** preferência por Tailwind como ferramenta de estilização mais moderna e amplamente usada no mercado atual.
- **Se o professor perguntar por que não é mais Bootstrap:** a resposta honesta é "trocamos por preferência da equipe; sabemos que o enunciado pedia Bootstrap especificamente, e a arquitetura RESTful/JPA/segurança (o núcleo técnico avaliado) não foi afetada — só a camada de estilização visual." Não tente esconder a troca; ela é visível no `package.json` e no `index.css` (`@import "tailwindcss"`) na hora que o professor abrir o projeto.
- **Onde ver a implementação:** `frontend/vite.config.js` (plugin `@tailwindcss/vite`), `frontend/src/index.css` (`@import "tailwindcss"` + a classe `.container-bs` que replica o grid do Bootstrap), e o `className` de qualquer componente em `frontend/src/pages/` ou `frontend/src/layouts/`.

## 12.6 Atividade 10 (aula) — identidade sempre pelo Bearer Token, nunca por URL/body — ✅ IMPLEMENTADO

Atividade proposta pelo professor: *"em todos os controllers que requeiram autenticação, obtenha o login através do bearer token; certifique-se que você não esteja passando informações do usuário por url, como `/add/camera/10`."*

- **O problema que existia:** `CurriculoController.saveCurriculo` (POST) recebia um campo `usuarioId` enviado pelo **cliente** (form-data) e confiava nele cegamente para decidir o dono do novo currículo — exatamente o antipadrão do exemplo `/add/camera/10`. Além disso, `UsuarioController.updateUsuario/patchUsuario/deleteUsuario` deixavam qualquer usuário autenticado editar/apagar **qualquer outra conta**, só trocando o `{id}` na URL; e `CurriculoController.updateCurriculo/deleteCurriculo` (PUT/DELETE) não verificavam dono nenhum.
- **A correção, em uma frase:** todo endpoint que precisa saber "de quem é isso" usa `@AuthenticationPrincipal Usuario usuarioAutenticado` — o objeto que o `SecurityFilter` já validou a partir do JWT — e **nunca** um id vindo de `@RequestParam`, `@PathVariable` (sem checagem) ou do corpo JSON.
- **Onde foi aplicado:**
  - `CurriculoController.saveCurriculo`: removido `@RequestParam("usuarioId")`; o dono agora é `usuarioAutenticado` direto.
  - `CurriculoController.updateCurriculo` e `.deleteCurriculo`: ganharam a mesma checagem de dono que o `patchCurriculo` já tinha (compara `curriculo.getUsuario().getLogin()` com `usuarioAutenticado.getLogin()`, 403 se não bater).
  - `CurriculoController.patchCurriculo` e `.updateCurriculo`: **também pararam de aceitar reatribuição do dono** via corpo da requisição (o campo `usuario` do JSON é ignorado) — senão daria para "roubar" um currículo editando o JSON.
  - `UsuarioController.updateUsuario/patchUsuario/deleteUsuario`: ganharam `if (!usuarioAutenticado.getId().equals(id)) return FORBIDDEN;` — um usuário só mexe na própria conta.
  - `Dashboard.jsx`: como o back-end não precisa mais de `usuarioId`, removemos a chamada `GET /usuario/` que o front fazia só para descobrir o próprio id (e que, de quebra, expunha a lista de todos os usuários).
- **Testado com curl:** criamos dois usuários, A criou um currículo sem mandar `usuarioId` (o dono no banco ficou correto, do jeito automático); B tentou `PATCH`, `DELETE` no currículo de A → **403** nos dois; B tentou `PUT /usuario/{idDeA}` → **403**; A editando o próprio currículo → **200**.
- **Frase de defesa:** "O id na URL serve só para **endereçar o recurso** (REST precisa disso); a **identidade de quem está pedindo** vem sempre do token, nunca de um campo que o cliente controla. Testamos com dois usuários via curl: um não consegue mexer nos dados do outro, mesmo sabendo o id."

## 12.4 Detalhes técnicos que podem virar pergunta capciosa (melhorias conhecidas, não exigidas pelo enunciado)

| Ponto | O que dizer |
|---|---|
| **`GET /usuario/` devolve todos os usuários (com hash da senha) para qualquer logado** | "O hash BCrypt não é reversível, mas o ideal seria um DTO de resposta sem o campo senha e/ou restringir a um endpoint `/usuario/me`. O front não usa mais esse endpoint (ver 12.6), mas ele continua exposto no back-end — está no roadmap." |
| **Login errado devolve 500, não 401** | "O `catch` genérico devolve `internalServerError`. O correto seria capturar `BadCredentialsException` e devolver 401 Unauthorized." |
| **Enum salvo como ordinal** | Ver Parte 6.2 — falta `@Enumerated(EnumType.STRING)`. |
| **`jjwt-api` no pom sem uso** | Dependência residual; o JWT real é o `com.auth0:java-jwt`. |
| **PDF inteiro no banco (`@Lob`)** | "Escolha consciente para simplificar o deploy (sem servidor de arquivos). Em produção com muitos usuários, usaríamos S3/filesystem e guardaríamos só o caminho." |
| **Imagens em base64 no banco** | Mesma lógica: simplicidade > eficiência para o escopo acadêmico (base64 aumenta ~33% o tamanho). |
| **Token no localStorage** | "Prático e didático (dá para inspecionar na demo). Alternativa mais segura contra XSS seria cookie `HttpOnly`. Mitigamos não tendo inputs que renderizam HTML." |

---

# PARTE 13 — Simulado: perguntas prováveis do professor (com respostas-modelo)

> Treinem em dupla: um pergunta, o outro responde **sem olhar**.

### Bloco A — Arquitetura e conceitos

**1. "Explique a arquitetura em camadas do back-end."**
→ Controller recebe o HTTP e devolve a resposta; Service concentra regra de negócio (IA, token); Repository fala com o banco via Spring Data; Model define entidades (tabelas) e DTOs (tráfego JSON). Cada camada só conhece a de baixo — baixo acoplamento, fácil de testar e manter.

**2. "O que é injeção de dependências? Onde aparece?"**
→ O Spring cria e gerencia instâncias únicas (beans) e as entrega onde há `@Autowired`, em vez de cada classe dar `new`. Ex.: `CurriculoController` recebe `IaService` e `CurriculoRepository` prontos.

**3. "O que é REST? Sua API é RESTful por quê?"**
→ Recursos identificados por URL (`/curriculo/5`), manipulados pelos verbos HTTP corretos (GET lê, POST cria, PUT substitui, PATCH altera parcial, DELETE apaga), respostas com status codes semânticos (201 no upload, 403 sem permissão, 404 não achou) e servidor stateless (JWT em vez de sessão).

**4. "Diferença entre PUT e PATCH?"**
→ PUT substitui o recurso inteiro; PATCH altera só os campos enviados. No código: o PATCH tem `if (campo != null)` para cada campo; o PUT seta direto.

**5. "O que é um DTO e por que usar record?"**
→ Objeto que só transporta dados entre camadas/rede, desacoplando a API do banco. Record: imutável, uma linha, construtor+getters+equals/hashCode automáticos.

### Bloco B — JPA / Banco

**6. "Como o relacionamento 1:N funciona no seu banco?"**
→ `Usuario` tem `@OneToMany(mappedBy="usuario")`; `Curriculo` tem `@ManyToOne` + `@JoinColumn(name="usuario_id")`. A FK fica na tabela `curriculo` (lado N). `mappedBy` diz que o dono do relacionamento é o campo `usuario` de `Curriculo`.

**7. "O que fazem cascade = ALL e orphanRemoval = true?"**
→ Cascade propaga operações do pai para os filhos (deletar usuário deleta currículos); orphanRemoval apaga do banco o filho removido da coleção. Juntos, caracterizam **composição** UML: o currículo não vive sem o usuário.

**8. "Quem cria as tabelas? O que é ddl-auto=update?"**
→ O Hibernate, ao subir a aplicação, compara as `@Entity` com o schema e cria/altera tabelas automaticamente. `show-sql=true` mostra os SQLs no console.

**9. "Para que serve o @PrePersist?"**
→ Callback do ciclo de vida JPA: roda antes do INSERT. Usamos para carimbar `dataUpload = LocalDateTime.now()` automaticamente.

**10. "Por que @JsonIgnore na lista de currículos?"**
→ Usuario → List<Curriculo> → cada Curriculo → Usuario → ... loop infinito na serialização JSON. O @JsonIgnore corta o ciclo.

**11. "Como o id é gerado?"**
→ `@GeneratedValue(strategy = AUTO)`: o Hibernate escolhe a melhor estratégia para o banco — no PostgreSQL, usa **sequences**.

**11a. "Explique a herança SINGLE_TABLE do projeto."**
→ `Admin extends Usuario`. A raiz `Usuario` tem `@Inheritance(strategy = SINGLE_TABLE)` e `@DiscriminatorColumn(name = "tipo")`; a subclasse tem `@DiscriminatorValue("ADMIN")`. As duas classes ocupam **uma única tabela** `usuario`, e a coluna `tipo` ('USUARIO'/'ADMIN') diz ao Hibernate qual classe instanciar ao ler cada linha. Vantagem: sem JOIN, leitura simples; desvantagem: colunas específicas de subclasse teriam que aceitar NULL. O register cria `new Admin(...)` quando o papel é ADMIN, e o `Admin` sobrescreve `getAuthorities()` — polimorfismo em cima da herança.

**11b. "Como funciona o @ManyToMany? Onde está a tabela de junção?"**
→ `Curriculo.skills` é o lado **dono** (`@ManyToMany` + `@JoinTable(name = "curriculo_skill", joinColumns = curriculo_id, inverseJoinColumns = skill_id)`); `Skill.curriculos` é o lado inverso (`mappedBy = "skills"`). N:N não cabe numa FK só — a tabela `curriculo_skill` guarda os pares. O método `sincronizarSkills` faz *find-or-create* pelo nome: a skill "Java" existe uma vez na tabela `skill` e é compartilhada por todos os currículos que a possuem.

**11c. "Por que mantêm as skills como texto E como entidade?"**
→ O texto (`skillsExtraidas`) é o formato que a IA devolve e que o front consome com `split(',')` — mexer nisso quebraria a interface. A entidade `Skill` normaliza os mesmos dados no banco (N:N). A sincronização roda no upload e no PATCH, então os dois ficam sempre coerentes. É um caso real de dado desnormalizado para a UI + normalizado para o modelo relacional.

### Bloco C — Segurança

**12. "Por que a senha não pode ser salva em texto puro? Como o BCrypt resolve?"**
→ Vazamento do banco exporia todas as contas. BCrypt gera hash irreversível com salt aleatório (senhas iguais → hashes diferentes) e é lento de propósito contra força bruta. Verificação: re-hasheia a senha digitada e compara — nunca se "descriptografa".

**13. "Explique as 3 partes de um JWT."**
→ Header (algoritmo, HS256) + Payload (claims: issuer "auth-api", subject = login, expiração 2 h) + Assinatura (HMAC-SHA256 do header+payload com o segredo). Legível por qualquer um (base64), **inviolável** sem o segredo.

**14. "Caminho de uma requisição protegida, do axios ao controller?"**
→ Interceptor do axios injeta `Authorization: Bearer <token>` → `SecurityFilter` (OncePerRequestFilter) extrai e valida o token, busca o usuário e o coloca no `SecurityContextHolder` → regra `anyRequest().authenticated()` verifica o contexto: vazio → 403; preenchido → controller executa (e pode receber o usuário via `@AuthenticationPrincipal`).

**15. "Por que desabilitar CSRF?"**
→ CSRF explora cookies de sessão enviados automaticamente. Nossa API é stateless e o token vai manualmente no header — não há cookie de sessão para explorar, então o filtro só atrapalharia.

**16. "O que é CORS e por que precisaram configurar?"**
→ Navegadores bloqueiam requisições JS entre origens diferentes; 5173 e 8080 são origens distintas. O `CorsConfig` declara a origem permitida, métodos e headers (incluindo Authorization) — sem isso, o front receberia "blocked by CORS policy".

**17. "Onde o back-end compara a senha no login?"**
→ Dentro do `authenticationManager.authenticate()`: o Spring chama nosso `AuthorizationService.loadUserByUsername`, pega o `getPassword()` (hash) do `UserDetails` e compara com a senha digitada usando o bean `BCryptPasswordEncoder`.

**18. "Um usuário pode editar o portfólio de outro?"**
→ Não em nenhum verbo: PATCH, PUT e DELETE de `/curriculo/{id}` usam `@AuthenticationPrincipal` e comparam o login do dono com o do autenticado — retorna 403 se não bater. E nenhum dos três deixa reatribuir o dono via corpo da requisição.

**19. "Proteger rota no front basta?"**
→ Não. O `PrivateRoute` é UX (redireciona quem não tem token). A segurança real é o back: sem token válido, 403 em qualquer endpoint protegido. Dá para demonstrar com curl/Postman.

**19a. "Como vocês garantem que o dono de um recurso é sempre quem o token diz, e não um id que o cliente manda?"**
→ Todo endpoint de escrita recebe `@AuthenticationPrincipal Usuario usuarioAutenticado` — o Spring injeta esse objeto a partir do que o `SecurityFilter` já validou do JWT, então ele não pode ser forjado pelo cliente. No `saveCurriculo`, por exemplo, o dono do currículo é `usuarioAutenticado` direto — o endpoint nem aceita mais um `usuarioId` vindo do form-data (aceitava antes; era uma falha clássica de IDOR, corrigida). Em `UsuarioController`, `updateUsuario/patchUsuario/deleteUsuario` comparam `usuarioAutenticado.getId()` com o `{id}` da URL e barram com 403 se forem diferentes — um usuário só mexe na própria conta, mesmo sabendo o id de outra.

**19b. "Qual a diferença entre `id` na URL identificar o recurso vs identificar o usuário?"**
→ `/curriculo/{id}` — o `id` é do **currículo** (o recurso sendo manipulado); é normal e necessário em REST. O que não pode é usar esse id (ou qualquer campo do corpo) para decidir **de quem** é esse recurso — isso sempre vem do token. Já em `/usuario/{id}`, o `id` da URL representa diretamente "qual usuário" — por isso ali comparamos esse id com o id do usuário autenticado antes de agir; se forem diferentes, 403.

### Bloco D — IA

**20. "Como a IA lê o PDF?"**
→ Ela não lê o PDF: o **PDFBox** extrai o texto puro dos bytes; esse texto vai no prompt para a API da Groq (modelo llama-3.1-8b-instant), que devolve um JSON com os 12 campos; o Jackson parseia e preenchemos a entidade.

**21. "E se a IA falhar / a chave estiver errada?"**
→ O `IaService` captura qualquer exceção e devolve o record com strings vazias — o upload conclui e o usuário preenche manualmente no Dashboard. IA é acelerador, não ponto único de falha.

**22. "Por que temperature 0.2?"**
→ Temperatura baixa = saída determinística e fiel ao texto — extração de dados exige precisão, não criatividade.

**23. "Como garantem que a resposta da IA é um JSON parseável?"**
→ Prompt de sistema impõe "SOMENTE JSON válido com exatamente 12 chaves"; ainda assim removemos cercas ```json defensivamente e usamos `path().asText("")` que tolera chaves ausentes; erros caem no fallback.

### Bloco E — Front-end

**24. "O que é useState e onde usam?"**
→ Hook que cria estado reativo: mudar o estado re-renderiza o componente. Usamos em formulários (login, cadastro, os 12 campos do dashboard), flags de carregamento/erro, tema selecionado, previews de imagem.

**25. "O que é useEffect? Dê exemplos do projeto."**
→ Hook para efeitos colaterais pós-render. Exemplos: buscar o currículo ao montar o Dashboard (`[]`); no Portfolio, polling de 4 s com cleanup (`clearInterval`), listener do evento `storage`, e troca de título/favicon quando o currículo muda.

**26. "Onde usam .map()?"**
→ Portfolio: badges de skills/soft skills/idiomas, cards de experiências/educação/projetos; Dashboard: preview das badges e os 8 temas; tudo lista dinâmica de dados da API virando JSX.

**27. "Como funciona a navegação sem recarregar?"**
→ React Router intercepta a navegação, atualiza a URL pela History API e troca o componente renderizado — o navegador nunca pede uma página nova ao servidor (SPA).

**28. "Como o token é enviado ao back?"**
→ Interceptor do axios (`api.js`): antes de cada requisição, lê o token do localStorage e seta `config.headers.Authorization = 'Bearer ' + token`.

**29. "Como funciona o 'tempo real' do portfólio?"**
→ Polling a cada 4 s + evento `storage` do navegador: quando o Dashboard salva, grava `portfolio_updated` no localStorage, e outras abas do mesmo site recebem o evento e re-buscam na hora.

**30. "O que acontece se eu digitar uma URL inexistente?"**
→ A rota coringa `path: '*'` renderiza a página 404 personalizada, sem reload.

**30a. "Onde vocês usam o <Outlet>? Como funciona?"**
→ No `AuthLayout`: rota-pai sem path com `element: <AuthLayout/>` e filhas `/login` e `/cadastro`. O layout renderiza cabeçalho + navegação fixos, o `<Outlet/>` no meio (onde o Router injeta a página filha conforme a URL) e o rodapé fixo. Navegando entre login e cadastro, só o miolo troca — o layout permanece montado. Também eliminou a topbar que estava duplicada nos dois arquivos.

### Bloco F — UML

**31. "Onde estão associação, composição e herança no diagrama?"**
→ **Herança (generalização)**: `Admin ──▷ Usuario` (SINGLE_TABLE no banco). **Associação 1 ↔ 0..***: Usuario–Curriculo ("possui"), que é uma **composição** por causa do cascade ALL + orphanRemoval (a parte morre com o todo). **Associação N:N**: Curriculo ↔ Skill (0..* dos dois lados, tabela de junção). **Realização de interface**: `Usuario ---▷ UserDetails` (seta tracejada) e repositórios estendendo `CrudRepository`. Dependências "usa/chama/valida" entre controllers, services e repositories.

**32. "Diferença entre agregação e composição?"**
→ Ambas são "todo-parte". Agregação (losango vazio): a parte existe sem o todo (aluno e turma). Composição (losango preto): a parte morre com o todo — nosso caso: apagar o usuário apaga seus currículos.

---

# PARTE 14 — Glossário rápido

| Termo | Definição em uma linha |
|---|---|
| **API** | Interface que um sistema expõe para outros programas consumirem |
| **REST** | Estilo de API: recursos em URLs + verbos HTTP + stateless |
| **Endpoint / rota** | URL + verbo que executa uma operação (`POST /auth/login`) |
| **JSON** | Formato de texto para troca de dados (chave: valor) |
| **Serialização** | Converter objeto ⇄ JSON (Jackson faz isso no Spring) |
| **Bean** | Objeto criado e gerenciado pelo container do Spring |
| **@Autowired** | Pede ao Spring para injetar um bean pronto |
| **Entidade (@Entity)** | Classe Java mapeada para uma tabela |
| **ORM / JPA / Hibernate** | Técnica / especificação / implementação de mapear objetos em tabelas |
| **JPQL** | "SQL de objetos" — consulta sobre classes e atributos |
| **DTO** | Objeto que só transporta dados (nossos records) |
| **FK (chave estrangeira)** | Coluna que aponta para a PK de outra tabela (`usuario_id`) |
| **Hash** | Transformação irreversível — como guardamos senhas |
| **BCrypt** | Algoritmo de hash de senhas com salt e custo ajustável |
| **JWT** | Token assinado com header.payload.assinatura; prova quem você é |
| **Bearer token** | Esquema do header: `Authorization: Bearer <token>` |
| **Stateless** | Servidor não guarda estado de sessão entre requisições |
| **CORS** | Permissão para o front (5173) chamar o back (8080) de outra origem |
| **CSRF** | Ataque via cookies automáticos — irrelevante em API stateless |
| **Multipart/form-data** | Formato HTTP para enviar arquivos + campos juntos |
| **SPA** | Single Page Application — navegação sem recarregar |
| **Componente (React)** | Função que retorna JSX; bloco de construção da UI |
| **Hook** | Função `use*` que dá poderes ao componente (estado, efeitos) |
| **localStorage** | Armazenamento persistente do navegador (guarda nosso token) |
| **Interceptor (axios)** | Função que roda antes de cada requisição (injeta o token) |
| **LLM** | Large Language Model — o modelo da Groq que lê o currículo |
| **Prompt** | A instrução em texto enviada ao LLM |
| **Base64** | Codificação de binário em texto (nossas imagens no banco) |
| **Polling** | Perguntar periodicamente ao servidor se algo mudou |

---

## Checklist final antes da apresentação

- [ ] Todos sabem dar o **pitch** (Parte 1) em 60 segundos.
- [ ] Todos sabem apontar no UML: **herança** Admin→Usuario (SINGLE_TABLE), **composição** Usuario–Curriculo, **N:N** Curriculo–Skill, **realização** de `UserDetails`, os records/DTOs.
- [ ] **Regerar o `NovoDiagramUML.pdf`** incluindo as classes `Admin` e `Skill` (o PDF atual é anterior a elas).
- [ ] Todos sabem narrar o **fluxo do login** (BCrypt → AuthenticationManager → JWT) e o **fluxo de uma requisição com token** (interceptor → SecurityFilter → contexto → controller).
- [ ] Todos sabem narrar o **fluxo do upload** (multipart → PDFBox → Groq → JSON → banco → form de revisão).
- [ ] Demo ensaiada: 404 sem reload → bloqueio sem login (front **e** 403 no Postman) → cadastro → login (mostrar token no localStorage/jwt.io) → upload do PDF → revisão → portfólio público em aba anônima → edição "ao vivo" com duas abas.
- [ ] Tabela de conformidade da **Parte 12.0** na ponta da língua (todos os critérios do enunciado + onde cada um está no código).
- [ ] Demo extra que impressiona: `sudo -u postgres psql -d portfolio -c "SELECT * FROM curriculo_skill;"` para mostrar o N:N ao vivo, e `SELECT login, tipo, role FROM usuario;` para mostrar a coluna discriminadora da herança.
- [ ] Backend rodando (`mvn spring-boot:run`), frontend rodando (`npm run dev`), PostgreSQL ativo, chave Groq válida, **um PDF de currículo de teste salvo na área de trabalho**.

*Boa apresentação! 🚀*
