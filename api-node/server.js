const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "admin",
  password: "",
  database: "minhacifra",
  
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const name = email.split("@")[0];

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const sql =
      "INSERT INTO Users (name, email, password, created_at) VALUES (?, ?, ?, NOW())";

    db.query(sql, [name, email, passwordHash], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "E-mail já cadastrado." });
      }
      return res.status(201).json({ message: "Usuário criado!" });
    });
  } catch (error) {
    res.status(500).send("Erro no servidor.");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = "SELECT * FROM Users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error("Erro ao buscar usuário:", err);
        return res.status(500).json({ error: "Erro interno no servidor." });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "E-mail ou senha incorretos." });
      }

      const user = results[0];

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "E-mail ou senha incorretos." });
      }

      return res.status(200).json({
        message: "Login realizado com sucesso!",
        user: {
          id: user.pk_users_id,
          name: user.name,
          email: user.email,
        },
      });
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
    db.query(
      "UPDATE Users SET name = ? WHERE pk_users_id = ?",
      [trimmedName, id],
      (err, result) => {
        if (err) {
          console.error("Erro ao atualizar nome:", err);
          return res.status(500).json({ error: "Erro ao atualizar nome." });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Usuário não encontrado." });
        }

        return res.status(200).json({
          message: "Nome atualizado com sucesso!",
          user: { id, name: trimmedName },
        });
      }
    );
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
    const selectSql =
      "SELECT * FROM Users WHERE pk_users_id = ?";

    db.query(selectSql, [id], async (err, results) => {
      if (err) {
        console.error("Erro ao buscar usuário:", err);

        return res.status(500).json({
          error: "Erro interno no servidor.",
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          error: "Usuário não encontrado.",
        });
      }

      const user = results[0];

      const passwordMatch = await bcrypt.compare(
        password,
        user.password,
      );

      if (!passwordMatch) {
        return res.status(401).json({
          error: "Senha incorreta.",
        });
      }

      const deleteSql =
        "DELETE FROM Users WHERE pk_users_id = ?";

      db.query(deleteSql, [id], (deleteErr) => {
        if (deleteErr) {
          console.error(
            "Erro ao deletar usuário:",
            deleteErr,
          );

          return res.status(500).json({
            error: "Erro ao deletar a conta.",
          });
        }

        return res.status(200).json({
          message: "Conta deletada com sucesso!",
        });
      });
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
