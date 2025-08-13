import dotenv from "dotenv";
import { ArgValue, SubmitParams, BytesEnvelope } from "tx3-sdk/trp";
import { Client, MoveShipParams } from "../bindings/protocol";
import signTx, { setupBlaze } from "../utils/sign-tx";

export async function run() {
  dotenv.config();

  if (!process.env.PLAYER_PRIVATE_KEY) {
    throw new Error("PLAYER_PRIVATE_KEY environment variable is not set");
  }

  if (!process.env.PLAYER_ADDRESS) {
    throw new Error("PLAYER_ADDRESS environment variable is not set");
  }

  const DEFAULT_TRP_ENDPOINT = "https://cardano-mainnet.trp-m1.demeter.run";
  const DEFAULT_TRP_API_KEY = "trp1lrnhzcax5064cgxsaup";
  const client = new Client({
    endpoint: "https://cardano-preview.trp-m1.demeter.run",
    headers: {
      "dmtr-api-key": "trp1x3mstdsucqrsshrspk4",
    },
  });

  const blaze = await setupBlaze();

  const playerAddress = blaze.wallet.address.toBech32();
  const deltaX = 1; // Replace with your desired X movement units
  const deltaY = 1; // Replace with your desired Y movement units
  const requiredFuel = 2; // Replace with the required fuel for the movement
  const shipName = "SHIP9"; // Replace with your ship name
  const pilotName = "PILOT9"; // Replace with your pilot name
  const tipSlot = Math.floor(blaze.provider.unixToSlot(Date.now()));
  const lastMoveTimestamp = Date.now() + 300_000_000;

  console.log("-- PARAMS");
  console.log({
    playerAddress,
    deltaX,
    deltaY,
    requiredFuel,
    shipName,
    pilotName,
    tipSlot,
    lastMoveTimestamp,
  });

  const args: MoveShipParams = {
    player: playerAddress,
    pDeltaX: deltaX,
    pDeltaY: deltaY,
    requiredFuel: requiredFuel,
    pilotName: new TextEncoder().encode(pilotName),
    shipName: new TextEncoder().encode(shipName),
    tipSlot: tipSlot, // 4 minutes from last block
    lastMoveTimestamp,
  };

  const response = await client.moveShipTx(args);

  console.log("-- RESOLVE");
  console.log(response);

  await signTx(response.tx);

  //const submitParams: SubmitParams = {
  //  tx: {
  //    content: response.tx,
  //    encoding: "hex",
  //  } as BytesEnvelope,
  //  witnesses,
  //};

  //console.log("-- SUBMIT");
  //console.log(submitParams);

  //try {
  //  await client.submit(submitParams);
  //  console.log("-- DONE");
  //} catch (error) {
  //  console.error("-- SUBMIT ERROR");
  //  console.error("Failed to submit transaction:", error);
  //}
}

run().catch((error) => {
  console.error("-- ERROR");
  console.error("Error running transaction:", error);
  process.exit(1);
});
