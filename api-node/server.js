require("dotenv").config();

const express = require("express");
const knex = require("knex");
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const nodemailer = require("nodemailer");
const { rateLimit } = require("express-rate-limit");

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cors());

if (!process.env.DB_USER) {
  throw new Error("Defina DB_USER no ambiente antes de iniciar a API.");
}

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "minhacifra",
  },
  pool: { min: 0, max: 10 },
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const verificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const isValidEmail = (email) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createVerificationToken = () => crypto.randomBytes(32).toString("base64url");

const hashVerificationToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const sendVerificationEmail = async (email, token) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM, PUBLIC_API_URL } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !EMAIL_FROM || !PUBLIC_API_URL) {
    throw new Error("Configuração de e-mail incompleta.");
  }

  const apiUrl = new URL(PUBLIC_API_URL);
  const isLocalHttp =
    apiUrl.protocol === "http:" && ["localhost", "127.0.0.1"].includes(apiUrl.hostname);

  if (apiUrl.protocol !== "https:" && !isLocalHttp) {
    throw new Error("PUBLIC_API_URL deve usar HTTPS fora do ambiente local.");
  }

  const verificationUrl = new URL("/verify-email", apiUrl);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    tls: { minVersion: "TLSv1.2" },
  });

  verificationUrl.searchParams.set("token", token);

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: "Confirme seu e-mail - Minha Cifra",
    text: `Para confirmar seu e-mail, abra este link e confirme a solicitação: ${verificationUrl.toString()}\nO link expira em 24 horas.`,
    html: `<!doctype html><html lang="pt-BR"><body><p>Confirme seu endereço de e-mail para ativar sua conta no Minha Cifra.</p><p><a href="${verificationUrl.toString()}">Revisar confirmação de e-mail</a></p><p>O link expira em 24 horas. Se você não solicitou a criação da conta, ignore esta mensagem.</p></body></html>`,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM, PUBLIC_API_URL } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !EMAIL_FROM || !PUBLIC_API_URL) {
    throw new Error("Configuração de e-mail incompleta.");
  }

  const apiUrl = new URL(PUBLIC_API_URL);
  const isLocalHttp =
    apiUrl.protocol === "http:" && ["localhost", "127.0.0.1"].includes(apiUrl.hostname);

  if (apiUrl.protocol !== "https:" && !isLocalHttp) {
    throw new Error("PUBLIC_API_URL deve usar HTTPS fora do ambiente local.");
  }

  const resetUrl = new URL("/reset-password", apiUrl);
  resetUrl.searchParams.set("token", token);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    tls: { minVersion: "TLSv1.2" },
  });

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: "Redefina sua senha - Minha Cifra",
    text: `Para criar uma nova senha, abra este link: ${resetUrl.toString()}\nO link expira em 1 hora. Se você não solicitou a redefinição, ignore esta mensagem.`,
    html: `<!doctype html><html lang="pt-BR"><body><p>Recebemos uma solicitação para redefinir sua senha do Minha Cifra.</p><p><a href="${resetUrl.toString()}">Criar nova senha</a></p><p>O link expira em 1 hora. Se você não solicitou a redefinição, ignore esta mensagem.</p></body></html>`,
  });
};

const issueVerificationEmail = async (userId, email) => {
  const token = createVerificationToken();
  const updatedRows = await db("Users")
    .where({ pk_users_id: userId, email_verified: 0 })
    .update({
      email_verification_token_hash: hashVerificationToken(token),
      email_verification_expires_at: db.raw("DATE_ADD(NOW(), INTERVAL 24 HOUR)"),
    });

  if (updatedRows === 1) {
    await sendVerificationEmail(email, token);
  }
};

const genericRegistrationResponse = {
  message: "Se o endereço puder ser cadastrado, enviaremos um link de confirmação.",
};

app.post("/register", registrationLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!isValidEmail(email) || typeof password !== "string") {
    return res.status(400).json({ error: "Informe um e-mail e uma senha válidos." });
  }

  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({
      error: "A senha deve ter ao menos 8 caracteres e no máximo 72 bytes.",
    });
  }

  try {
    const name = email.split("@")[0];
    const passwordHash = await bcrypt.hash(password, 12);
    const token = createVerificationToken();
    const tokenHash = hashVerificationToken(token);
    try {
      await db("Users").insert({
        name,
        email,
        password: passwordHash,
        created_at: db.fn.now(),
        email_verified: 0,
        email_verification_token_hash: tokenHash,
        email_verification_expires_at: db.raw("DATE_ADD(NOW(), INTERVAL 24 HOUR)"),
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        const existingUser = await db("Users")
          .select("pk_users_id", "email_verified")
          .where({ email })
          .first();

        if (existingUser && !existingUser.email_verified) {
          try {
            await issueVerificationEmail(existingUser.pk_users_id, email);
          } catch (emailError) {
            console.error(
              "Falha ao reenviar confirmação de cadastro:",
              emailError.code || "SMTP_ERROR",
              emailError.message,
            );
            return res.status(503).json({
              error: "A conta foi criada, mas não foi possível enviar o e-mail de confirmação. Tente reenviar.",
              code: "EMAIL_SEND_FAILED",
            });
          }
        }

        return res.status(202).json(genericRegistrationResponse);
      }
      throw error;
    }

    try {
      await sendVerificationEmail(email, token);
    } catch (error) {
      console.error(
        "Falha ao enviar confirmação de cadastro:",
        error.code || "SMTP_ERROR",
        error.message,
      );
      return res.status(503).json({
        error: "A conta foi criada, mas não foi possível enviar o e-mail de confirmação. Tente reenviar.",
        code: "EMAIL_SEND_FAILED",
      });
    }

    return res.status(202).json(genericRegistrationResponse);
  } catch (error) {
    console.error("Erro ao iniciar cadastro:", error.code || "UNKNOWN");
    return res.status(503).json({ error: "Não foi possível processar o cadastro agora." });
  }
});

app.post("/resend-verification", resendLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Informe um e-mail válido." });
  }

  try {
    const user = await db("Users")
      .select("pk_users_id", "email_verified")
      .where({ email })
      .first();

    if (user && !user.email_verified) {
      try {
        await issueVerificationEmail(user.pk_users_id, email);
      } catch (error) {
        console.error(
          "Falha ao reenviar confirmação:",
          error.code || "SMTP_ERROR",
          error.message,
        );
        return res.status(503).json({
          error: "Não foi possível enviar o e-mail de confirmação. Tente novamente mais tarde.",
          code: "EMAIL_SEND_FAILED",
        });
      }
    }

    return res.status(202).json(genericRegistrationResponse);
  } catch (error) {
    console.error("Erro ao reenviar confirmação:", error.code || "UNKNOWN");
    return res.status(503).json({ error: "Não foi possível processar a solicitação agora." });
  }
});

app.get("/verify-email", verificationLimiter, (req, res) => {
  const token = req.query.token;

  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return res.status(400).type("html").send("<p>Link de confirmação inválido ou expirado.</p>");
  }

  res.set("Cache-Control", "no-store");
  res.set("Referrer-Policy", "no-referrer");
  res.set("Content-Security-Policy", "default-src 'none'; form-action 'self'; style-src 'unsafe-inline'");
  return res.type("html").send(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Confirmar e-mail</title><body><main><h1>Confirmar e-mail</h1><p>Confirme que você solicitou a criação da conta Minha Cifra.</p><form method="post" action="/verify-email"><input type="hidden" name="token" value="${token}"><button type="submit">Confirmar meu e-mail</button></form></main></body></html>`);
});

app.post("/verify-email", verificationLimiter, async (req, res) => {
  const token = req.body?.token;

  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return res.status(400).type("html").send("<p>Link de confirmação inválido ou expirado.</p>");
  }

  try {
    const affectedRows = await db("Users")
      .where({
        email_verification_token_hash: hashVerificationToken(token),
        email_verified: 0,
      })
      .where("email_verification_expires_at", ">", db.fn.now())
      .update({
        email_verified: 1,
        email_verification_token_hash: null,
        email_verification_expires_at: null,
      });

    if (affectedRows !== 1) {
      return res.status(400).type("html").send("<p>Link de confirmação inválido ou expirado.</p>");
    }

    return res.status(200).type("html").send("<p>E-mail confirmado. Sua conta está ativa e você já pode entrar no Minha Cifra.</p>");
  } catch (error) {
    console.error("Erro ao confirmar e-mail:", error.message);
    return res.status(500).type("html").send("<p>Não foi possível confirmar o e-mail agora.</p>");
  }
});

const passwordResetResponse = {
  message: "Se houver uma conta ativa para esse endereço, enviaremos um link para redefinir a senha.",
};

app.post("/request-password-reset", passwordResetLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Informe um e-mail válido." });
  }

  try {
    const user = await db("Users")
      .select("pk_users_id")
      .where({ email, email_verified: 1 })
      .first();

    if (user) {
      const token = createVerificationToken();
      await db("Users").where({ pk_users_id: user.pk_users_id }).update({
        password_reset_token_hash: hashVerificationToken(token),
        password_reset_expires_at: db.raw("DATE_ADD(NOW(), INTERVAL 1 HOUR)"),
      });

      try {
        await sendPasswordResetEmail(email, token);
      } catch (error) {
        console.error(
          "Falha ao enviar redefinição de senha:",
          error.code || "SMTP_ERROR",
          error.message,
        );
        await db("Users").where({ pk_users_id: user.pk_users_id }).update({
          password_reset_token_hash: null,
          password_reset_expires_at: null,
        });
      }
    }

    return res.status(202).json(passwordResetResponse);
  } catch (error) {
    console.error("Erro ao solicitar redefinição de senha:", error.code || "UNKNOWN");
    return res.status(503).json({ error: "Não foi possível processar a solicitação agora." });
  }
});

app.get("/reset-password", passwordResetLimiter, (req, res) => {
  const token = req.query.token;

  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return res.status(400).type("html").send("<p>Link de redefinição inválido ou expirado.</p>");
  }

  res.set("Cache-Control", "no-store");
  res.set("Referrer-Policy", "no-referrer");
  res.set("Content-Security-Policy", "default-src 'none'; form-action 'self'; style-src 'unsafe-inline'");
  return res.type("html").send(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Redefinir senha</title><body><main><h1>Redefinir senha</h1><form method="post" action="/reset-password"><input type="hidden" name="token" value="${token}"><label for="password">Nova senha</label><input id="password" name="password" type="password" minlength="8" maxlength="72" autocomplete="new-password" required><button type="submit">Salvar nova senha</button></form><p>A senha deve ter ao menos 8 caracteres.</p></main></body></html>`);
});

app.post("/reset-password", passwordResetLimiter, async (req, res) => {
  const token = req.body?.token;
  const password = req.body?.password;

  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return res.status(400).type("html").send("<p>Link de redefinição inválido ou expirado.</p>");
  }

  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).type("html").send("<p>A senha deve ter ao menos 8 caracteres e no máximo 72 bytes. Volte e tente novamente.</p>");
  }

  try {
    const user = await db("Users")
      .select("pk_users_id")
      .where({ password_reset_token_hash: hashVerificationToken(token) })
      .where("password_reset_expires_at", ">", db.fn.now())
      .first();

    if (!user) {
      return res.status(400).type("html").send("<p>Link de redefinição inválido ou expirado.</p>");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const affectedRows = await db("Users")
      .where({ pk_users_id: user.pk_users_id, password_reset_token_hash: hashVerificationToken(token) })
      .where("password_reset_expires_at", ">", db.fn.now())
      .update({
        password: passwordHash,
        password_reset_token_hash: null,
        password_reset_expires_at: null,
      });

    if (affectedRows !== 1) {
      return res.status(400).type("html").send("<p>Link de redefinição inválido ou expirado.</p>");
    }

    return res.status(200).type("html").send("<p>Senha atualizada. Você já pode entrar no Minha Cifra com a nova senha.</p>");
  } catch (error) {
    console.error("Erro ao redefinir senha:", error.code || "UNKNOWN");
    return res.status(500).type("html").send("<p>Não foi possível atualizar a senha agora.</p>");
  }
});

app.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!isValidEmail(email) || typeof password !== "string") {
    return res.status(400).json({ error: "E-mail ou senha incorretos." });
  }

  try {
    const user = await db("Users").where({ email }).first();

    if (!user) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        error: "Confirme seu e-mail antes de entrar. Você também pode solicitar um novo link de confirmação.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.pk_users_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erro na rota de login:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const trimmedName = typeof name === "string" ? name.trim() : "";

  if (!trimmedName) {
    return res.status(400).json({ error: "Nome obrigatório." });
  }

  if (!id || id === "undefined") {
    return res.status(400).json({
      error: "ID do usuário não informado.",
    });
  }

  try {
    const affectedRows = await db("Users")
      .where({ pk_users_id: id })
      .update({ name: trimmedName });

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.status(200).json({
      message: "Nome atualizado com sucesso!",
      user: { id, name: trimmedName },
    });
  } catch (error) {
    console.error("Erro na rota de atualização do nome:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      error: "A senha é obrigatória para confirmar a exclusão.",
    });
  }

  if (!id || id === "undefined") {
    return res.status(400).json({
      error: "ID do usuário não informado.",
    });
  }

  try {
    const user = await db("Users").where({ pk_users_id: id }).first();

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    await db("Users").where({ pk_users_id: id }).delete();

    return res.status(200).json({
      message: "Conta deletada com sucesso!",
    });
  } catch (error) {
    console.error(
      "Erro na rota de exclusão:",
      error,
    );

    return res.status(500).json({
      error: "Erro interno no servidor.",
    });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor rodando na porta 3000');
});
