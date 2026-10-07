# API Minha Cifra

## Configuracao

Copie `.env.example` para `.env` e preencha as credenciais do banco e de um servidor SMTP. Nunca versione o arquivo `.env`. Em producao, `PUBLIC_API_URL` deve usar HTTPS e apontar para a URL publica desta API.

Antes de iniciar uma versao existente do banco, aplique uma vez a migracao `migrations/001_email_verification.sql`. Ela mantem os usuarios atuais confirmados e exige confirmacao para novos cadastros. A migracao cria uma restricao unica para e-mail; se houver enderecos duplicados, resolva-os antes de aplica-la.

Para habilitar a redefinicao de senha por e-mail, aplique tambem uma vez a migracao `migrations/002_password_reset.sql`.

```sh
set -a
. ./.env
set +a
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < migrations/001_email_verification.sql
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < migrations/002_password_reset.sql
npm start
```

Execute esses comandos a partir de `api-node`. O `npm start` carrega `.env` automaticamente; o trecho `set -a` tambem disponibiliza as variaveis para o cliente `mysql` durante a migracao.

## Confirmacao de conta

`POST /register` cria uma conta pendente e envia um link com token aleatorio, valido por 24 horas. O banco armazena apenas o hash do token. A pagina aberta pelo link exige uma acao explicita e confirma a conta por `POST /verify-email`; acessos `GET` nao ativam a conta. `POST /resend-verification` emite um link novo para contas pendentes. Essas rotas tem limitacao de requisicoes por IP e respostas genericas para reduzir enumeracao de enderecos.