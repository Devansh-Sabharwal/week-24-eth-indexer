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
  console.log("username", username);
  console.log("password", password);
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
  res.send({ publicKey, privateKey });
});
app.get("/depositAddress/:userId", (req, res) => {});

async function main() {
  await client.connect();
  app.listen(3000, () => {
    console.log("server is listening at 3000");
  });
}

main();
