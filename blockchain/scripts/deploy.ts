import dotenv from "dotenv";
import path from "node:path";
import { ethers } from "hardhat";
import {
  ARC_CHAIN_ID,
  DEFAULT_USDC_ADDRESS,
  ARC_EXPLORER,
} from "../src/config";
import {
  validateDeploymentEnvironment,
  readDeploymentEnv,
} from "../src/deploy";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const isLocal = network.chainId === 31337n;
  const deployMockUsdc = process.env.DEPLOY_MOCK_USDC === "true";

  const env = readDeploymentEnv({
    connectedChainId: BigInt(network.chainId),
    deployerAddress: deployer?.address,
  });

  const networkIsArcMainnet = env.connectedChainId === BigInt(ARC_CHAIN_ID);

  if (networkIsArcMainnet) {
    const validation = validateDeploymentEnvironment(env);
    if (!validation.valid) {
      console.error("Deployment safety checks failed:");
      for (const error of validation.errors) {
        console.error(`  - ${error}`);
      }
      throw new Error(
        "Arc Mainnet deployment blocked. Review the safety checks above and provide all required environment variables.",
      );
    }
  }

  let usdcAddress = process.env.USDC_TOKEN_ADDRESS;
  if (!usdcAddress) {
    if (isLocal && deployMockUsdc) {
      const MockUSDC = await ethers.getContractFactory("MockUSDC");
      const mockUsdc = await MockUSDC.deploy();
      await mockUsdc.waitForDeployment();
      usdcAddress = await mockUsdc.getAddress();
      console.log(`MockUSDC deployed at ${usdcAddress}`);
    } else {
      usdcAddress = DEFAULT_USDC_ADDRESS;
    }
  }

  const networkName = network.name;
  const chainId = network.chainId.toString();
  const deployerAddress = deployer?.address ?? "not configured";

  console.log("=== EscrowAI Deployment ===");
  console.log(`Network: ${networkName}`);
  console.log(`Chain ID: ${chainId}`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`USDC token: ${usdcAddress}`);

  const EscrowAI = await ethers.getContractFactory("EscrowAI");
  const escrow = await EscrowAI.deploy(usdcAddress);
  const deployTx = escrow.deploymentTransaction();
  await escrow.waitForDeployment();

  const deployedAddress = await escrow.getAddress();
  const txHash = deployTx?.hash ?? "unknown";
  const block = deployTx ? await deployTx.getBlock() : null;
  const blockNumber = block ? block.number : 0;
  const explorerUrl = `${ARC_EXPLORER}/address/${deployedAddress}`;

  console.log(`EscrowAI: ${deployedAddress}`);
  console.log(`Transaction hash: ${txHash}`);
  console.log(`Block number: ${blockNumber}`);
  console.log(`Explorer: ${explorerUrl}`);
  console.log("=== Deployment Complete ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
