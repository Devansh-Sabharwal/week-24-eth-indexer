import { mnemonicToSeedSync } from "bip39";
import { HDNodeWallet, Wallet } from "ethers";
import { SEED_PHRASE } from "./config.js";

function deriveEthereumWallet(seed: Buffer, derivationPath: string): Wallet {
  const privateKey = deriveEthereumPrivateKey(seed, derivationPath);
  return new Wallet(privateKey);
}

function deriveEthereumPrivateKey(
  seed: Buffer,
  derivationPath: string
): string {
  const hdNode = HDNodeWallet.fromSeed(seed);
  const child = hdNode.derivePath(derivationPath);
  return child.privateKey;
}
export const createETHWallet = (currIndex: number) => {
  const mnemonic = SEED_PHRASE!;
  const seed = mnemonicToSeedSync(mnemonic);
  const path = `m/44'/60'/${currIndex}'/0'`;
  const wallet = deriveEthereumWallet(seed, path);
  const publicKey = wallet.address;
  const privateKey = wallet.privateKey;
  return { publicKey, privateKey };
};
