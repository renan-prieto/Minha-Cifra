const {
  after,
  beforeEach,
  describe,
  it,
} = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const request = require("supertest");

const { createFakeDatabase } = require("./helpers/fakeDatabase");

process.env.NODE_ENV = "test";
process.env.DB_USER = "test";
process.env.DB_PASSWORD = "test";
process.env.DB_NAME = "minhacifra_test";
process.env.SMTP_HOST = "smtp.test";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = "smtp-user";
process.env.SMTP_PASSWORD = "smtp-password";
process.env.EMAIL_FROM = "Minha Cifra <no-reply@test.com>";
process.env.PUBLIC_API_URL = "http://localhost:3000";
process.env.CORS_ORIGINS = "";
delete process.env.GEMINI_API_KEY;
delete process.env.GEMINI_MODEL;

const { database, knexFactory } = createFakeDatabase();
const knexPath = require.resolve("knex");
require.cache[knexPath] = {
  id: knexPath,
  filename: knexPath,
  loaded: true,
  exports: knexFactory,
  children: [],
  paths: [],
};

const app = require("../server");

const originalCreateTransport = nodemailer.createTransport;
const originalFetch = global.fetch;

let sentMails = [];
let fetchMock = null;

function createToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function extractToken(mail) {
  const match = mail.text.match(/token=([A-Za-z0-9_-]{43})/);
  return match?.[1];
}

async function seedUser({
  email = "user@example.com",
  password = "password123",
  verified = true,
  name = "Usuario",
} = {}) {
  const record = {
    pk_users_id: database.nextUserId(),
    name,
    email,
    password: await bcrypt.hash(password, 4),
    created_at: new Date(),
    email_verified: verified ? 1 : 0,
    email_verification_token_hash: null,
    email_verification_expires_at: null,
    password_reset_token_hash: null,
    password_reset_expires_at: null,
  };

  database.tables.Users.push(record);
  return record;
}

function seedSession(userId, { expiresAt = new Date(Date.now() + 86_400_000) } = {}) {
  const token = createToken();

  database.tables.Sessions.push({
    id: database.nextSessionId(),
    session_token_hash: hashToken(token),
    user_id: userId,
    created_at: new Date(),
    expires_at: expiresAt,
  });

  return token;
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

function findUser(email) {
  return database.tables.Users.find((user) => user.email === email);
}

function setEmailSuccess() {
  nodemailer.createTransport = () => ({
    sendMail: async (mail) => {
      sentMails.push(mail);
      return { messageId: "test-message" };
    },
  });
}

function setEmailFailure() {
  nodemailer.createTransport = () => ({
    sendMail: async () => {
      const error = new Error("SMTP indisponível");
      error.code = "SMTP_ERROR";
      throw error;
    },
  });
}

function setGeminiResponse(response) {
  fetchMock = async () => response;
  global.fetch = fetchMock;
}

beforeEach(() => {
  database.reset();
  sentMails = [];
  fetchMock = null;
  setEmailSuccess();
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;
});

after(() => {
  nodemailer.createTransport = originalCreateTransport;
  global.fetch = originalFetch;
});

describe("API Minha Cifra - integração", () => {
  describe("cabeçalhos e autenticação", () => {
    it("responde 401 sem token e adiciona cabeçalhos de segurança", async () => {
      const response = await request(app).get("/auth/verify");

      assert.equal(response.status, 401);
      assert.match(response.body.error, /Sessão inválida/);
      assert.equal(response.headers["x-content-type-options"], "nosniff");
      assert.equal(response.headers["x-frame-options"], "DENY");
      assert.equal(response.headers["referrer-policy"], "no-referrer");
      assert.equal(response.headers["x-powered-by"], undefined);
    });

    it("rejeita esquema de autorização inválido", async () => {
      const response = await request(app)
        .get("/auth/verify")
        .set("Authorization", "Basic token");

      assert.equal(response.status, 401);
    });

    it("aceita um token de sessão válido", async () => {
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);

      const response = await request(app)
        .get("/auth/verify")
        .set(bearer(token));

      assert.equal(response.status, 200);
      assert.deepEqual(response.body.user, {
        id: user.pk_users_id,
        name: user.name,
        email: user.email,
      });
    });

    it("rejeita token expirado", async () => {
      const user = await seedUser();
      const token = seedSession(user.pk_users_id, {
        expiresAt: new Date(Date.now() - 1000),
      });

      const response = await request(app)
        .get("/auth/verify")
        .set(bearer(token));

      assert.equal(response.status, 401);
      assert.equal(response.body.code, "SESSION_EXPIRED");
    });
  });

  describe("cadastro e confirmação de e-mail", () => {
    it("valida e-mail e senha", async () => {
      const invalidEmail = await request(app)
        .post("/register")
        .send({ email: "sem-arroba", password: "password123" });
      const missingPassword = await request(app)
        .post("/register")
        .send({ email: "user@example.com" });
      const shortPassword = await request(app)
        .post("/register")
        .send({ email: "user@example.com", password: "1234567" });
      const longPassword = await request(app)
        .post("/register")
        .send({ email: "user@example.com", password: "a".repeat(73) });

      assert.equal(invalidEmail.status, 400);
      assert.equal(missingPassword.status, 400);
      assert.equal(shortPassword.status, 400);
      assert.equal(longPassword.status, 400);
    });

    it("cria conta pendente, confirma o e-mail e permite login", async () => {
      const register = await request(app)
        .post("/register")
        .send({ email: "  NEW@Example.com ", password: "password123" });

      assert.equal(register.status, 202);
      assert.match(register.body.message, /link de confirmação/);
      assert.equal(sentMails.length, 1);
      assert.match(sentMails[0].subject, /Confirme seu e-mail/);

      const user = findUser("new@example.com");
      assert.ok(user);
      assert.equal(user.email_verified, 0);
      assert.notEqual(user.password, "password123");
      assert.equal(user.email_verification_token_hash.length, 64);

      const token = extractToken(sentMails[0]);
      assert.equal(typeof token, "string");

      const confirmationPage = await request(app)
        .get("/verify-email")
        .query({ token });

      assert.equal(confirmationPage.status, 200);
      assert.match(confirmationPage.text, /Confirmar meu e-mail/);
      assert.match(confirmationPage.text, new RegExp(token));
      assert.match(confirmationPage.headers["content-security-policy"], /default-src 'none'/);
      assert.equal(confirmationPage.headers["cache-control"], "no-store");

      const confirmation = await request(app)
        .post("/verify-email")
        .send({ token });

      assert.equal(confirmation.status, 200);
      assert.match(confirmation.text, /E-mail confirmado/);
      assert.equal(user.email_verified, 1);
      assert.equal(user.email_verification_token_hash, null);

      const login = await request(app)
        .post("/login")
        .send({ email: "new@example.com", password: "password123" });

      assert.equal(login.status, 200);
      assert.equal(login.body.token.length, 43);
      assert.deepEqual(login.body.user, {
        id: user.pk_users_id,
        name: user.name,
        email: user.email,
      });

      const authenticated = await request(app)
        .get("/auth/verify")
        .set(bearer(login.body.token));
      assert.equal(authenticated.status, 200);

      const logout = await request(app)
        .post("/auth/logout")
        .set(bearer(login.body.token));
      assert.equal(logout.status, 200);

      const afterLogout = await request(app)
        .get("/auth/verify")
        .set(bearer(login.body.token));
      assert.equal(afterLogout.status, 401);
    });

    it("não revela se um e-mail verificado já existe", async () => {
      await seedUser({ email: "existing@example.com" });

      const response = await request(app)
        .post("/register")
        .send({ email: "existing@example.com", password: "password123" });

      assert.equal(response.status, 202);
      assert.match(response.body.message, /Se o endereço puder ser cadastrado/);
      assert.equal(database.tables.Users.length, 1);
      assert.equal(sentMails.length, 0);
    });

    it("reenvia a confirmação para uma conta ainda pendente", async () => {
      const user = await seedUser({
        email: "pending@example.com",
        verified: false,
      });
      const previousHash = "hash-antigo";
      user.email_verification_token_hash = previousHash;

      const response = await request(app)
        .post("/register")
        .send({ email: "pending@example.com", password: "password123" });

      assert.equal(response.status, 202);
      assert.equal(sentMails.length, 1);
      assert.notEqual(user.email_verification_token_hash, previousHash);
    });

    it("informa falha de e-mail mesmo com a conta criada", async () => {
      setEmailFailure();

      const response = await request(app)
        .post("/register")
        .send({ email: "smtp@example.com", password: "password123" });

      assert.equal(response.status, 503);
      assert.equal(response.body.code, "EMAIL_SEND_FAILED");
      assert.ok(findUser("smtp@example.com"));
    });

    it("rejeita links de confirmação inválidos", async () => {
      const page = await request(app)
        .get("/verify-email")
        .query({ token: "curto" });
      const post = await request(app)
        .post("/verify-email")
        .send({ token: "curto" });

      assert.equal(page.status, 400);
      assert.equal(post.status, 400);
    });

    it("rejeita confirmação expirada ou já utilizada", async () => {
      const user = await seedUser({
        email: "expired@example.com",
        verified: false,
      });
      const token = createToken();
      user.email_verification_token_hash = hashToken(token);
      user.email_verification_expires_at = new Date(Date.now() - 1000);

      const expired = await request(app)
        .post("/verify-email")
        .send({ token });
      assert.equal(expired.status, 400);

      user.email_verification_expires_at = new Date(Date.now() + 60_000);
      const first = await request(app).post("/verify-email").send({ token });
      const second = await request(app).post("/verify-email").send({ token });

      assert.equal(first.status, 200);
      assert.equal(second.status, 400);
    });
  });

  describe("reenvio de confirmação", () => {
    it("valida o e-mail", async () => {
      const response = await request(app)
        .post("/resend-verification")
        .send({ email: "inválido" });

      assert.equal(response.status, 400);
    });

    it("responde de forma genérica para e-mail desconhecido", async () => {
      const response = await request(app)
        .post("/resend-verification")
        .send({ email: "unknown@example.com" });

      assert.equal(response.status, 202);
      assert.equal(sentMails.length, 0);
    });

    it("reenvia para uma conta pendente", async () => {
      await seedUser({ email: "pending@example.com", verified: false });

      const response = await request(app)
        .post("/resend-verification")
        .send({ email: "pending@example.com" });

      assert.equal(response.status, 202);
      assert.equal(sentMails.length, 1);
    });

    it("não envia para conta já verificada", async () => {
      await seedUser({ email: "verified@example.com", verified: true });

      const response = await request(app)
        .post("/resend-verification")
        .send({ email: "verified@example.com" });

      assert.equal(response.status, 202);
      assert.equal(sentMails.length, 0);
    });

    it("informa falha do SMTP", async () => {
      await seedUser({ email: "pending@example.com", verified: false });
      setEmailFailure();

      const response = await request(app)
        .post("/resend-verification")
        .send({ email: "pending@example.com" });

      assert.equal(response.status, 503);
      assert.equal(response.body.code, "EMAIL_SEND_FAILED");
    });
  });

  describe("login", () => {
    it("valida os campos", async () => {
      const invalidEmail = await request(app)
        .post("/login")
        .send({ email: "inválido", password: "password123" });
      const missingPassword = await request(app)
        .post("/login")
        .send({ email: "user@example.com" });

      assert.equal(invalidEmail.status, 400);
      assert.equal(missingPassword.status, 400);
    });

    it("rejeita usuário inexistente e senha incorreta", async () => {
      const unknown = await request(app)
        .post("/login")
        .send({ email: "unknown@example.com", password: "password123" });

      await seedUser({ email: "user@example.com", password: "password123" });
      const wrongPassword = await request(app)
        .post("/login")
        .send({ email: "user@example.com", password: "errada" });

      assert.equal(unknown.status, 401);
      assert.equal(wrongPassword.status, 401);
    });

    it("bloqueia conta não confirmada", async () => {
      await seedUser({ email: "pending@example.com", verified: false });

      const response = await request(app)
        .post("/login")
        .send({ email: "pending@example.com", password: "password123" });

      assert.equal(response.status, 403);
      assert.equal(response.body.code, "EMAIL_NOT_VERIFIED");
    });

    it("normaliza o e-mail e cria uma sessão", async () => {
      const user = await seedUser();

      const response = await request(app)
        .post("/login")
        .send({ email: "  USER@EXAMPLE.COM ", password: "password123" });

      assert.equal(response.status, 200);
      assert.equal(response.body.message, "Login realizado com sucesso!");
      assert.equal(response.body.user.id, user.pk_users_id);
      assert.equal(database.tables.Sessions.length, 1);
      assert.equal(
        database.tables.Sessions[0].session_token_hash,
        hashToken(response.body.token),
      );
    });
  });

  describe("redefinição de senha", () => {
    it("valida o e-mail", async () => {
      const response = await request(app)
        .post("/request-password-reset")
        .send({ email: "inválido" });

      assert.equal(response.status, 400);
    });

    it("responde de forma genérica para e-mail desconhecido", async () => {
      const response = await request(app)
        .post("/request-password-reset")
        .send({ email: "unknown@example.com" });

      assert.equal(response.status, 202);
      assert.equal(sentMails.length, 0);
    });

    it("envia o link e redefine a senha, encerrando sessões", async () => {
      const user = await seedUser();
      seedSession(user.pk_users_id);

      const requestReset = await request(app)
        .post("/request-password-reset")
        .send({ email: "user@example.com" });

      assert.equal(requestReset.status, 202);
      assert.match(requestReset.body.message, /Se houver uma conta ativa/);
      assert.equal(sentMails.length, 1);
      assert.match(sentMails[0].subject, /Redefina sua senha/);
      assert.equal(user.password_reset_token_hash.length, 64);

      const token = extractToken(sentMails[0]);
      const page = await request(app)
        .get("/reset-password")
        .query({ token });

      assert.equal(page.status, 200);
      assert.match(page.text, /Salvar nova senha/);
      assert.match(page.headers["content-security-policy"], /form-action 'self'/);

      const shortPassword = await request(app)
        .post("/reset-password")
        .send({ token, password: "curta" });
      assert.equal(shortPassword.status, 400);

      const reset = await request(app)
        .post("/reset-password")
        .send({ token, password: "novaSenha123" });

      assert.equal(reset.status, 200);
      assert.match(reset.text, /Senha atualizada/);
      assert.equal(await bcrypt.compare("novaSenha123", user.password), true);
      assert.equal(user.password_reset_token_hash, null);
      assert.equal(database.tables.Sessions.length, 0);

      const reuse = await request(app)
        .post("/reset-password")
        .send({ token, password: "outraSenha123" });
      assert.equal(reuse.status, 400);

      const newLogin = await request(app)
        .post("/login")
        .send({ email: "user@example.com", password: "novaSenha123" });
      const oldLogin = await request(app)
        .post("/login")
        .send({ email: "user@example.com", password: "password123" });

      assert.equal(newLogin.status, 200);
      assert.equal(oldLogin.status, 401);
    });

    it("rejeita tokens inválidos e expirados", async () => {
      const invalidPage = await request(app)
        .get("/reset-password")
        .query({ token: "curto" });
      const invalidPost = await request(app)
        .post("/reset-password")
        .send({ token: "curto", password: "password123" });

      const user = await seedUser();
      const token = createToken();
      user.password_reset_token_hash = hashToken(token);
      user.password_reset_expires_at = new Date(Date.now() - 1000);

      const expired = await request(app)
        .post("/reset-password")
        .send({ token, password: "password123" });

      assert.equal(invalidPage.status, 400);
      assert.equal(invalidPost.status, 400);
      assert.equal(expired.status, 400);
    });

    it("mantém a resposta genérica quando o envio falha", async () => {
      const user = await seedUser();
      setEmailFailure();

      const response = await request(app)
        .post("/request-password-reset")
        .send({ email: "user@example.com" });

      assert.equal(response.status, 202);
      assert.equal(user.password_reset_token_hash, null);
      assert.equal(user.password_reset_expires_at, null);
    });
  });

  describe("atualização do usuário", () => {
    it("exige autenticação", async () => {
      const response = await request(app)
        .put("/user/1")
        .send({ name: "Novo", password: "password123" });

      assert.equal(response.status, 401);
    });

    it("valida id, propriedade e campos", async () => {
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);

      const invalidId = await request(app)
        .put("/user/abc")
        .set(bearer(token))
        .send({ name: "Novo", password: "password123" });
      const otherId = await request(app)
        .put("/user/999")
        .set(bearer(token))
        .send({ name: "Novo", password: "password123" });
      const emptyName = await request(app)
        .put(`/user/${user.pk_users_id}`)
        .set(bearer(token))
        .send({ name: "  ", password: "password123" });
      const longName = await request(app)
        .put(`/user/${user.pk_users_id}`)
        .set(bearer(token))
        .send({ name: "a".repeat(81), password: "password123" });
      const missingPassword = await request(app)
        .put(`/user/${user.pk_users_id}`)
        .set(bearer(token))
        .send({ name: "Novo" });

      assert.equal(invalidId.status, 400);
      assert.equal(otherId.status, 403);
      assert.equal(emptyName.status, 400);
      assert.equal(longName.status, 400);
      assert.equal(missingPassword.status, 400);
    });

    it("rejeita senha incorreta", async () => {
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);

      const response = await request(app)
        .put(`/user/${user.pk_users_id}`)
        .set(bearer(token))
        .send({ name: "Novo", password: "errada" });

      assert.equal(response.status, 401);
    });

    it("atualiza o nome", async () => {
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);

      const response = await request(app)
        .put(`/user/${user.pk_users_id}`)
        .set(bearer(token))
        .send({ name: "  Renan  ", password: "password123" });

      assert.equal(response.status, 200);
      assert.deepEqual(response.body.user, {
        id: String(user.pk_users_id),
        name: "Renan",
      });
      assert.equal(user.name, "Renan");
    });
  });

  describe("exclusão do usuário", () => {
    it("exige autenticação e valida o id", async () => {
      const unauthenticated = await request(app)
        .delete("/user/1")
        .send({ password: "password123" });
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);

      const invalidId = await request(app)
        .delete("/user/abc")
        .set(bearer(token))
        .send({ password: "password123" });
      const otherId = await request(app)
        .delete("/user/999")
        .set(bearer(token))
        .send({ password: "password123" });

      assert.equal(unauthenticated.status, 401);
      assert.equal(invalidId.status, 400);
      assert.equal(otherId.status, 403);
    });

    it("exige e valida a senha", async () => {
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);

      const missing = await request(app)
        .delete(`/user/${user.pk_users_id}`)
        .set(bearer(token))
        .send({});
      const wrong = await request(app)
        .delete(`/user/${user.pk_users_id}`)
        .set(bearer(token))
        .send({ password: "errada" });

      assert.equal(missing.status, 400);
      assert.equal(wrong.status, 401);
    });

    it("exclui a conta e as sessões", async () => {
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);

      const response = await request(app)
        .delete(`/user/${user.pk_users_id}`)
        .set(bearer(token))
        .send({ password: "password123" });

      assert.equal(response.status, 200);
      assert.equal(response.body.message, "Conta deletada com sucesso!");
      assert.equal(database.tables.Users.length, 0);
      assert.equal(database.tables.Sessions.length, 0);
    });
  });

  describe("assistente financeiro", () => {
    it("exige autenticação na rota principal", async () => {
      const response = await request(app)
        .post("/chat")
        .send({ messages: [{ role: "user", content: "Olá" }] });

      assert.equal(response.status, 401);
    });

    it("valida o formato da conversa", async () => {
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);
      const invalidBodies = [
        {},
        { messages: [] },
        { messages: [{ role: "assistant", content: "Oi" }] },
        { messages: [{ role: "system", content: "Oi" }] },
        { messages: [{ role: "user", content: "   " }] },
        { messages: [{ role: "user", content: "a".repeat(1001) }] },
        {
          messages: Array.from({ length: 21 }, () => ({
            role: "user",
            content: "Oi",
          })),
        },
      ];

      for (const body of invalidBodies) {
        const response = await request(app)
          .post("/chat")
          .set(bearer(token))
          .send(body);
        assert.equal(response.status, 400);
      }
    });

    it("informa quando a chave do Gemini não está configurada", async () => {
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);

      const authenticated = await request(app)
        .post("/chat")
        .set(bearer(token))
        .send({ messages: [{ role: "user", content: "Olá" }] });
      const guest = await request(app)
        .post("/chat/guest")
        .send({ messages: [{ role: "user", content: "Olá" }] });

      assert.equal(authenticated.status, 503);
      assert.equal(guest.status, 503);
    });

    it("responde com o Gemini e envia o contexto recuperado", async () => {
      process.env.GEMINI_API_KEY = "test-key";
      process.env.GEMINI_MODEL = "modelo-de-teste";
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);
      let captured;

      setGeminiResponse({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "  Resposta  " }] } }],
        }),
      });
      const originalMock = global.fetch;
      global.fetch = async (url, options) => {
        captured = { url, options };
        return originalMock(url, options);
      };

      const response = await request(app)
        .post("/chat")
        .set(bearer(token))
        .send({
          messages: [
            { role: "assistant", content: "Olá!" },
            { role: "user", content: "Como montar uma reserva de emergência?" },
          ],
        });

      assert.equal(response.status, 200);
      assert.deepEqual(response.body, { reply: "Resposta" });
      assert.match(captured.url, /modelo-de-teste:generateContent/);
      assert.equal(captured.options.headers["x-goog-api-key"], "test-key");

      const payload = JSON.parse(captured.options.body);
      assert.equal(payload.contents[0].role, "model");
      assert.equal(payload.contents[1].role, "user");
      assert.equal(payload.generationConfig.maxOutputTokens, 700);
      assert.match(
        payload.systemInstruction.parts[0].text,
        /Material de referência recuperado/,
      );
      assert.match(
        payload.systemInstruction.parts[0].text,
        /despesas essenciais/i,
      );
    });

    it("permite chat de visitante sem sessão", async () => {
      process.env.GEMINI_API_KEY = "test-key";
      setGeminiResponse({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "Olá, visitante!" }] } }],
        }),
      });

      const response = await request(app)
        .post("/chat/guest")
        .send({ messages: [{ role: "user", content: "Oi" }] });

      assert.equal(response.status, 200);
      assert.deepEqual(response.body, { reply: "Olá, visitante!" });
    });

    it("traduz os erros do provedor", async () => {
      process.env.GEMINI_API_KEY = "test-key";
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);

      setGeminiResponse({
        ok: false,
        status: 429,
        json: async () => ({ error: { status: "RESOURCE_EXHAUSTED" } }),
      });
      const quota = await request(app)
        .post("/chat")
        .set(bearer(token))
        .send({ messages: [{ role: "user", content: "Oi" }] });

      setGeminiResponse({
        ok: false,
        status: 500,
        json: async () => ({ error: { status: "INTERNAL" } }),
      });
      const providerError = await request(app)
        .post("/chat")
        .set(bearer(token))
        .send({ messages: [{ role: "user", content: "Oi" }] });

      assert.equal(quota.status, 429);
      assert.match(quota.body.error, /cota gratuita/);
      assert.equal(providerError.status, 502);
    });

    it("rejeita resposta vazia e falha de rede", async () => {
      process.env.GEMINI_API_KEY = "test-key";
      const user = await seedUser();
      const token = seedSession(user.pk_users_id);

      setGeminiResponse({
        ok: true,
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [] } }] }),
      });
      const empty = await request(app)
        .post("/chat")
        .set(bearer(token))
        .send({ messages: [{ role: "user", content: "Oi" }] });

      global.fetch = async () => {
        throw new Error("sem rede");
      };
      const networkError = await request(app)
        .post("/chat")
        .set(bearer(token))
        .send({ messages: [{ role: "user", content: "Oi" }] });

      assert.equal(empty.status, 502);
      assert.equal(networkError.status, 502);
    });
  });

  describe("tratamento de erros", () => {
    it("responde JSON inválido com 400", async () => {
      const response = await request(app)
        .post("/login")
        .set("Content-Type", "application/json")
        .send('{"email":');

      assert.equal(response.status, 400);
      assert.equal(response.body.error, "JSON inválido.");
    });

    it("responde corpo grande com 413", async () => {
      const response = await request(app)
        .post("/login")
        .set("Content-Type", "application/json")
        .send(JSON.stringify({ email: "a@b.com", password: "a".repeat(11_000) }));

      assert.equal(response.status, 413);
      assert.equal(response.body.error, "Requisição muito grande.");
    });
  });
});
