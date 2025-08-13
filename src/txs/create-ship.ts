import dotenv from "dotenv";
import { Client, CreateShipParams } from "../bindings/protocol";
import signTx, { setupBlaze } from "../utils/sign-tx";

export async function run() {
  dotenv.config();

  const blaze = await setupBlaze();

  // These are the default values for the Tx3 backend server running on Demeter. It has a free tier that you
  // can use. Feel free to use your own if you need more throughput. More info on https://docs.tx3.io/tx3 .
  const DEFAULT_TRP_ENDPOINT = "http://localhost:8000";
  const DEFAULT_TRP_API_KEY = "trp1lrnhzcax5064cgxsaup";

  const client = new Client({
    endpoint: process.env.TRP_ENDPOINT || DEFAULT_TRP_ENDPOINT,
    headers: {
      "dmtr-api-key": process.env.TRP_API_KEY || DEFAULT_TRP_API_KEY,
    },
  });

  const playerAddress = blaze.wallet.address.toBech32();
  const positionX = 26; // Replace with your desired start X position
  const positionY = 26; // Replace with your desired start Y position
  const shipName = "SHIP10"; // Replace 0 with the next ship number
  const pilotName = "PILOT10"; // Replace 0 with the next ship number
  const tipSlot = Math.floor(blaze.provider.unixToSlot(Date.now()));
  const lastMoveTimestamp = Date.now() + 300_000;

  console.log("-- PARAMS");
  console.log({
    playerAddress,
    positionX,
    positionY,
    shipName,
    pilotName,
    tipSlot,
  });

  const args: CreateShipParams = {
    player: playerAddress,
    pPosX: positionX,
    pPosY: positionY,
    pilotName: new TextEncoder().encode(pilotName),
    shipName: new TextEncoder().encode(shipName),
    tipSlot: tipSlot + 240, // 4 minutes from last block
    lastMoveTimestamp,
  };

  const response = await client.createShipTx(args);

  console.log("-- RESOLVE");
  console.log(response);

  await signTx(response.tx);

  console.log("-- SIGN TX");
}

run().catch((error) => {
  console.error("-- ERROR");
  console.error("Error running transaction:", error);
  process.exit(1);
});
