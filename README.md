# Portfolio-Generator
Um webapp em Springboot Java + React, capaz de gerar portfólios simples e atualizáveis a partir de informações básicas. Adicionalmente, com Inteligência Artificial para escanear currículos em PDF.

[Nova estrutura do Backend - Explicação no commit](NovoDiagramUML.pdf)
 Guia de Instalação — PortfólioPro

> Sistema operacional alvo: **Ubuntu 20.04 LTS**
---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Clonar o repositório](#2-clonar-o-repositório)
3. [Configurar o banco de dados (PostgreSQL)](#3-configurar-o-banco-de-dados-postgresql)
4. [Configurar o back-end (Spring Boot)](#4-configurar-o-back-end-spring-boot)
5. [Rodar o back-end](#5-rodar-o-back-end)
6. [Configurar e rodar o front-end (React)](#6-configurar-e-rodar-o-front-end-react)
7. [Acessar a aplicação](#7-acessar-a-aplicação)
8. [Solução de problemas comuns](#8-solução-de-problemas-comuns)

---

## 1. Pré-requisitos

Instale as ferramentas abaixo na ordem indicada.

### Java 21

O back-end exige Java 21. Ubuntu 20.04 não vem com ele por padrão — use o repositório da Adoptium:

```bash
sudo apt update
sudo apt install -y wget apt-transport-https gnupg

wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo apt-key add -
echo "deb https://packages.adoptium.net/artifactory/deb focal main" | sudo tee /etc/apt/sources.list.d/adoptium.list

sudo apt update
sudo apt install -y temurin-21-jdk
```

Verifique:

```bash
java -version
# Esperado: openjdk version "21.x.x" ...
```

### Maven

```bash
sudo apt install -y maven
```

Verifique:

```bash
mvn -version
# Esperado: Apache Maven 3.x.x ...
```

### Node.js 20+

O front-end usa Vite 8, que exige Node.js 20 ou superior:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifique:

```bash
node -v   # Esperado: v20.x.x
npm -v    # Esperado: 10.x.x
```

### PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 2. Clonar o repositório

```bash
git clone <URL-DO-REPOSITORIO>
cd Portfolio-Generator
```

> Substitua `<URL-DO-REPOSITORIO>` pela URL real do seu repositório Git.
---

## 3. Configurar o banco de dados (PostgreSQL)

### Criar o banco e configurar o usuário

```bash
sudo -u postgres psql
```

Dentro do prompt do PostgreSQL, execute:

```sql
CREATE DATABASE portfolio;
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

> Se quiser usar outro nome de banco, usuário ou senha, lembre-se de atualizar o `application.properties` na etapa seguinte.
### Verificar conexão

```bash
psql -U postgres -d portfolio -h localhost
# Se conectar sem erro, está pronto. Saia com \q
```

---

## 4. Configurar o back-end (Spring Boot)

### Criar o arquivo de configuração

O arquivo `application.properties` **não está versionado** por segurança (contém chaves de API). Você precisa criá-lo manualmente:

```bash
nano backend/src/main/resources/application.properties
```

Cole o conteúdo abaixo, substituindo os valores onde indicado:

```properties
# Banco de dados
spring.datasource.url=jdbc:postgresql://localhost:5432/portfolio
spring.datasource.username=postgres
spring.datasource.password=postgres

# JPA / Hibernate — cria/atualiza tabelas automaticamente
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Upload de arquivos
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Segredo JWT — pode ser qualquer string longa e aleatória
api.security.token.secret=troque-por-uma-chave-secreta-forte-aqui

# Chave da API Groq (IA para processar o PDF)
# Obtenha gratuitamente em: https://console.groq.com
groq.api.key=COLOQUE_SUA_CHAVE_GROQ_AQUI
```

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`.

> **Como obter a chave Groq:**
> 1. Acesse [console.groq.com](https://console.groq.com)
> 2. Crie uma conta gratuita
> 3. Vá em **API Keys** → **Create API Key**
> 4. Copie a chave gerada (começa com `gsk_...`) e cole no campo acima
---

## 5. Rodar o back-end

```bash
cd backend
mvn spring-boot:run
```

Na primeira execução, o Maven vai baixar todas as dependências (pode demorar alguns minutos).

**O back-end está pronto quando você ver:**

```
Started BackendApplication in X.XXX seconds
```

> O back-end ficará rodando na porta **8080**. Deixe este terminal aberto.
---

## 6. Configurar e rodar o front-end (React)

Abra um **novo terminal** (não feche o do back-end).

### Instalar dependências

```bash
cd frontend
npm install
```

### Rodar em modo desenvolvimento

```bash
npm run dev
```

**O front-end está pronto quando você ver:**

```
  VITE v8.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

> O front-end ficará rodando na porta **5173**. Deixe este terminal aberto também.
---

## 7. Acessar a aplicação

Com os dois terminais rodando, abra o navegador:

| O quê | URL |
|---|---|
| Aplicação (front-end) | http://localhost:5173 |
| API (back-end) | http://localhost:8080 |

### Fluxo completo para testar

1. Acesse `http://localhost:5173`
2. Clique em **Cadastrar** e crie uma conta
3. Faça **login** com as credenciais criadas
4. No Dashboard, faça o **upload de um PDF** com seu currículo
5. Aguarde a IA processar (alguns segundos)
6. Revise os dados extraídos e clique em **Salvar**
7. Acesse seu portfólio público em `http://localhost:5173/portfolio/SEU_LOGIN`

---

## 8. Solução de problemas comuns

### Erro: `Connection refused` na porta 5432

O PostgreSQL não está rodando. Inicie-o:

```bash
sudo systemctl start postgresql
```

### Erro: `password authentication failed for user "postgres"`

A senha do usuário `postgres` no banco não corresponde ao `application.properties`. Redefina:

```bash
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### Erro CORS no navegador (requisições bloqueadas)

Verifique se o back-end está rodando na porta **8080** e o front-end na **5173**. A configuração CORS já está preparada para esse par. Se usar outras portas, edite `backend/src/main/java/br/unesp/backend/security/CorsConfig.java` e ajuste a propriedade `cors.allowed-origins` no `application.properties`:

```properties
cors.allowed-origins=http://localhost:5173
```

### Erro: `java: error: release version 21 not supported`

O Maven está usando uma versão antiga do Java. Verifique qual Java está ativo:

```bash
java -version
update-alternatives --config java   # selecione a versão 21
```

### Erro: `Could not find or load main class` ao rodar `mvn spring-boot:run`

Certifique-se de estar dentro da pasta `backend/` antes de rodar o Maven:

```bash
cd Portfolio-Generator/backend
mvn spring-boot:run
```

### A IA não extrai dados do PDF

A chave Groq está inválida ou ausente. Verifique o `application.properties` e confirme que a chave começa com `gsk_`. Gere uma nova em [console.groq.com](https://console.groq.com) se necessário.

### Porta já em uso (8080 ou 5173)

Identifique e encerre o processo que está ocupando a porta:

```bash
# Verificar quem usa a porta 8080
sudo lsof -i :8080
# Encerrar pelo PID listado
kill -9 <PID>
```

---

## Resumo dos comandos (após configuração inicial)

Para subir o projeto nas próximas vezes, basta abrir dois terminais e rodar:

**Terminal 1 — Back-end:**
```bash
cd Portfolio-Generator/backend
mvn spring-boot:run
```

**Terminal 2 — Front-end:**
```bash
cd Portfolio-Generator/frontend
npm run dev
```
