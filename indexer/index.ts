import { JsonRpcProvider } from "ethers";
import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();
const provider = new JsonRpcProvider("https://eth.llamarpc.com");
const BLOCK_NUMBER = 23887896;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
async function main() {
  await client.connect();

  //fetch deposit_address from the db
  const result = await client.query("SELECT deposit_address from users");
  const interestedAddress = result.rows.map((row) => {
    return row.deposit_address;
  });

  const blockNumber = 23887896; //for testing purposes

  //get full tx
  const block = await provider.send("eth_getBlockByNumber", [
    "0x" + blockNumber.toString(16), // hex block number
    true, // <— return full transactions
  ]);

  //we only need from,to,value in wei
  const tx = block.transactions.map((t) => {
    return {
      to: t.to?.toLowerCase(),
      from: t.from?.toLowerCase(),
      value: t.value,
    };
  });
  console.log(tx);

  //filter it with our db addresses
  const filteredTx = tx.filter((t) => {
    return interestedAddress.includes(t.to);
  });
  console.log(filteredTx);

  //update
  for (const tx of filteredTx) {
    const wei = BigInt(tx.value);
    await updateBal(tx.to!, wei);
  }

  console.log("Done");
}
main();
async function updateBal(to: string, formatted: bigint) {
  try {
    await client.query(
      "UPDATE users SET balance = balance + $1 WHERE deposit_address=$2",
      [formatted.toString(), to]
    );
  } catch (e) {
    console.log("db tx failed");
  }
}
