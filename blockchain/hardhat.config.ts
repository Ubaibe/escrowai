import "@nomicfoundation/hardhat-toolbox";
import path from "node:path";
import dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { ARC_RPC_URL, ARC_CHAIN_ID } from "./src/config";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const arcRpcUrl = process.env.ARC_MAINNET_RPC_URL ?? process.env.ARC_RPC_URL ?? ARC_RPC_URL;
const arcChainId = Number(process.env.ARC_MAINNET_CHAIN_ID ?? process.env.ARC_CHAIN_ID ?? ARC_CHAIN_ID);
const privateKey = process.env.PRIVATE_KEY;
const normalizedPrivateKey = privateKey
  ? privateKey.startsWith("0x") ? privateKey : "0x" + privateKey
  : undefined;

if (!Number.isInteger(arcChainId)) {
  throw new Error("ARC_MAINNET_CHAIN_ID must be an integer");
}

const networks: NonNullable<HardhatUserConfig["networks"]> = {
  hardhat: {
    chainId: 31337,
  },
  arcMainnet: {
    url: arcRpcUrl,
    chainId: arcChainId,
    accounts: normalizedPrivateKey ? [normalizedPrivateKey] : [],
  },
};

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks,
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
