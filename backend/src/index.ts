import express from "express";
const app = express();
app.use(express.json());

import { SEED_PHRASE } from "./config.js";
import { createETHWallet } from "./eth-helpers.js";
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

app.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    await client.query("BEGIN");

    const insertResult = await client.query(
      `INSERT INTO users (username, password)
       VALUES ($1, $2)
       RETURNING userId`,
      [username, password]
    );

    const userId = insertResult.rows[0].userid;

    const { publicKey, privateKey } = createETHWallet(userId);

    await client.query(
      `UPDATE users 
       SET private_key = $1, deposit_address = $2
       WHERE userid = $3`,
      [privateKey, publicKey, userId]
    );

    await client.query("COMMIT");

    res.send({ publicKey });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).send({ error: "Signup failed" });
  }
});

app.get("/depositAddress/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);
    const result = await client.query(
      "SELECT deposit_address from users where userid=$1",
      [userId]
    );
    if (result.rows.length > 0) {
      res.send(result.rows[0].deposit_address);
    }
  } catch (error) {
    res.status(404).send("No user found");
  }
});

async function main() {
  await client.connect();
  app.listen(3000, () => {
    console.log("server is listening at 3000");
  });
}

main();
