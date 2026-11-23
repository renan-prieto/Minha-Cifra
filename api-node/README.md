# API Minha Cifra

## Configuracao

Copie `.env.example` para `.env` e preencha as credenciais do banco e de um servidor SMTP. Nunca versione o arquivo `.env`. Em producao, `PUBLIC_API_URL` deve usar HTTPS e apontar para a URL publica desta API.

O chat usa a Gemini API. Crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey) e configure `GEMINI_API_KEY` no `.env` desta pasta. O modelo padrao e `gemini-3.5-flash-lite`; ele pode ser alterado com `GEMINI_MODEL`. A chave fica apenas no servidor e nunca deve ser configurada no app Expo. O nivel gratuito possui cotas de uso, que podem variar por projeto e modelo.

O endpoint `/chat` recupera ate quatro trechos relevantes da base local `knowledge/financial-guidance.md` usando BM25 e os envia ao Gemini como material de referencia. Para ampliar ou corrigir o conhecimento, edite esse arquivo usando secoes Markdown iniciadas por `##`; cada paragrafo e indexado como um trecho. A recuperacao nao inclui dados pessoais do usuario e nao substitui a verificacao de regras financeiras ou tributarias atuais em fontes oficiais.

Antes de iniciar uma versao existente do banco, aplique uma vez a migracao `migrations/001_email_verification.sql`. Ela mantem os usuarios atuais confirmados e exige confirmacao para novos cadastros. A migracao cria uma restricao unica para e-mail; se houver enderecos duplicados, resolva-os antes de aplica-la.

Para habilitar a redefinicao de senha por e-mail, aplique tambem uma vez a migracao `migrations/002_password_reset.sql`.

A autenticacao da API usa sessoes opacas (token aleatorio com hash no banco). Aplique `migrations/003_sessions.sql` para criar a tabela `Sessions`; sem ela, o login nao conseguira emitir sessao.

```sh
set -a
. ./.env
set +a
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < migrations/001_email_verification.sql
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < migrations/002_password_reset.sql
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < migrations/003_sessions.sql
npm start
```

Execute esses comandos a partir de `api-node`. O `npm start` carrega `.env` automaticamente; o trecho `set -a` tambem disponibiliza as variaveis para o cliente `mysql` durante a migracao.

## Sessoes

`POST /login` devolve um token Bearer valido por 30 dias. As rotas `/auth/verify`, `/auth/logout`, `/user/:id` e `/chat` exigem esse token. As rotas de atualizacao e exclusao tambem conferem se o ID da URL pertence ao usuario autenticado, impedindo alteracoes em outras contas. O app envia o token automaticamente pelo header `Authorization`.

O modo visitante do app usa `POST /chat/guest`, que aceita conversas sem sessao para testes, com limite de 10 requisicoes por IP a cada hora. A rota autenticada `/chat` continua restrita a contas reais.

## Confirmacao de conta

`POST /register` cria uma conta pendente e envia um link com token aleatorio, valido por 24 horas. O banco armazena apenas o hash do token. A pagina aberta pelo link exige uma acao explicita e confirma a conta por `POST /verify-email`; acessos `GET` nao ativam a conta. `POST /resend-verification` emite um link novo para contas pendentes. Essas rotas tem limitacao de requisicoes por IP e respostas genericas para reduzir enumeracao de enderecos.

## Testes

A API usa o test runner nativo do Node (`node --test`) com **supertest**. Os testes ficam em `test/`:

* `test/server.integration.test.js` exercita as rotas reais (cadastro, confirmacao de e-mail, login, sessoes, redefinicao de senha, usuario e chat).
* `test/rag.test.js` cobre a recuperacao de trechos da base de conhecimento.
* `test/helpers/fakeDatabase.js` implementa um banco em memoria compativel com o subconjunto do Knex usado pelo servidor.

Os testes injetam o banco fake, substituem o transporte de e-mail e o `fetch` do Gemini, e desativam os rate limits, portanto nao precisam de MariaDB, SMTP ou `GEMINI_API_KEY`.

```sh
npm test
```

A partir da raiz do projeto, `npm run test:all` executa tanto os testes do app quanto os desta API.