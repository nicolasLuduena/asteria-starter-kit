import {
  Bip32PrivateKey,
  mnemonicToEntropy,
  NetworkId,
  Transaction,
  TxCBOR,
  wordlist,
} from "@blaze-cardano/core";
import { Blaze, Blockfrost, HotWallet } from "@blaze-cardano/sdk";

export async function setupBlaze() {
  const seed =
  const entropy = mnemonicToEntropy(seed, wordlist);
  const masterkey = Bip32PrivateKey.fromBip39Entropy(Buffer.from(entropy), "");
  // const provider = new U5C({
  //   url: "http://localhost:50051",
  //   network: NetworkId.Testnet,
  // });
  const provider = new Blockfrost({
    projectId: "",
    network: "cardano-preview",
  });
  const wallet = await HotWallet.fromMasterkey(
    masterkey.hex(),
    provider,
    NetworkId.Testnet
  );
  const blaze = await Blaze.from(provider, wallet);
  return blaze;
}

export default async function signTx(cbor: string) {
  const blaze = await setupBlaze();
  const tx = await blaze.signTransaction(Transaction.fromCbor(TxCBOR(cbor)));
  console.log("Signed transaction:", tx.toCbor());
  const txHash = await blaze.submitTransaction(tx);
  console.log("Transaction submitted with hash:", txHash);
}
