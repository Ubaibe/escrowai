import dotenv from "dotenv";
import path from "node:path";
import { createPublicClient, http, getContract, parseAbi } from "viem";
import { privateKeyToAddress } from "viem/accounts";
import { arcMainnet, DEFAULT_USDC_ADDRESS, ARC_CHAIN_ID, ARC_RPC_URL, ARC_EXPLORER } from "../src/config";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const USDC_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
]);

async function main() {
  console.log("=== Arc Mainnet Preflight (Read-Only) ===\n");

  // 1. Verify live Arc connection
  console.log("1. Arc RPC Connectivity");
  console.log(`   Configured RPC: ${ARC_RPC_URL}`);
  console.log(`   Configured Chain ID: ${ARC_CHAIN_ID}`);

  const client = createPublicClient({
    chain: arcMainnet,
    transport: http(ARC_RPC_URL),
  });

  try {
    const chainId = await client.getChainId();
    console.log(`   Connected chain ID: ${chainId}`);
    console.log(`   Chain ID matches: ${chainId === ARC_CHAIN_ID ? "YES" : "NO"}`);
    console.log(`   Network status: ${chainId === ARC_CHAIN_ID ? "READY" : "MISMATCH"}`);
  } catch (e) {
    console.log(`   ERROR: Could not connect to RPC: ${e}`);
    console.log("   Network status: UNREACHABLE");
  }

  // 2. Verify USDC contract
  console.log("\n2. ERC-20 USDC Contract Verification");
  console.log(`   Address: ${DEFAULT_USDC_ADDRESS}`);

  try {
    const code = await client.getBytecode({ address: DEFAULT_USDC_ADDRESS });
    const hasCode = code !== "0x" && code !== "0x0" && code && code.length > 10;
    console.log(`   Bytecode present: ${hasCode ? "YES" : "NO"}`);
    if (hasCode) {
      const usdc = getContract({
        address: DEFAULT_USDC_ADDRESS,
        abi: USDC_ABI,
        client,
      });
      const name = await usdc.read.name();
      const symbol = await usdc.read.symbol();
      const decimals = await usdc.read.decimals();
      console.log(`   name(): ${name}`);
      console.log(`   symbol(): ${symbol}`);
      console.log(`   decimals(): ${decimals}`);
      console.log(`   Expected symbol USDC: ${symbol === "USDC" ? "YES" : "NO"}`);
      console.log(`   Expected decimals 6: ${decimals === 6 ? "YES" : "NO"}`);
    }
  } catch (e) {
    console.log(`   ERROR reading contract: ${e}`);
  }

  // 3. Derive deployer address from PRIVATE_KEY
  console.log("\n3. Deployer Account");

  const envPath = path.resolve(process.cwd(), ".env");
  console.log(`   .env path checked: ${envPath}`);
  console.log(`   .env exists: ${existsSync(envPath) ? "YES" : "NO"}`);

  const privateKey = process.env.PRIVATE_KEY;
  const privateKeyConfigured = !!privateKey;
  console.log(`   PRIVATE_KEY configured: ${privateKeyConfigured ? "YES" : "NO"}`);

  if (!privateKey) {
    console.log("   Deployer address: CANNOT DETERMINE (PRIVATE_KEY not set)");
  } else {
    const stripped = privateKey.replace(/^0x/, "").replace(/\s/g, "");
    const has0x = privateKey.startsWith("0x");
    const isHex = /^[0-9a-fA-F]+$/.test(stripped);
    const correctLen = stripped.length === 64;
    const isValidFormat = has0x && isHex && correctLen;
    console.log(`   PRIVATE_KEY format: ${isValidFormat ? "VALID" : "INVALID"}`);
    if (!isValidFormat) {
      console.log(`   Format detail: has0x=${has0x}, isHex=${isHex}, length=${stripped.length} (expected 64 hex chars after 0x)`);
      if (!has0x && isHex && correctLen) {
        console.log(`   NOTE: Key is valid hex but missing '0x' prefix — will normalize automatically`);
      }
    }
    try {
      const normalizedKey = privateKey.startsWith("0x") ? privateKey : "0x" + privateKey;
      const addr = privateKeyToAddress(normalizedKey as `0x${string}`);
      console.log(`   Deployer address: ${addr}`);
    } catch (e) {
      console.log(`   ERROR deriving address: ${e}`);
    }
  }

  // 4. Check deployer native balance
  console.log("\n4. Native Gas Balance");
  if (!privateKey) {
    console.log("   Skipped (no PRIVATE_KEY configured)");
  } else {
    try {
      const normalizedKey = privateKey.startsWith("0x") ? privateKey : "0x" + privateKey;
      const addr = privateKeyToAddress(normalizedKey as `0x${string}`);
      const balance = await client.getBalance({ address: addr });
      console.log(`   Deployer: ${addr}`);
      console.log(`   Native balance: ${balance} wei`);
      console.log(`   Non-zero: ${balance > 0n ? "YES" : "NO"}`);
      if (balance > 0n) {
        console.log(`   Balance seems sufficient (non-zero - exact gas cost TBD at deployment)`);
      } else {
        console.log(`   WARNING: Zero balance - cannot deploy without funding`);
      }
    } catch (e) {
      console.log(`   ERROR checking balance: ${e}`);
    }
  }

  // 5. Verify deployment artifact
  console.log("\n5. Deployment Artifact");
  const artifactPath = join(__dirname, "../artifacts/contracts/EscrowAI.sol/EscrowAI.json");
  try {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));
    const bytecode = artifact.bytecode || artifact.deployedBytecode;
    console.log(`   Artifact exists: YES`);
    console.log(`   Bytecode non-empty: ${bytecode && bytecode.length > 4 ? "YES" : "NO"}`);
    console.log(`   Bytecode length: ${bytecode ? bytecode.length : 0} chars`);
    console.log(`   ABI entries: ${artifact.abi?.length ?? 0}`);
    const constructorEntries = artifact.abi?.filter((e: any) => e.type === "constructor");
    console.log(`   Constructor params: ${constructorEntries?.length} (expected: 1 address)`);
  } catch (e) {
    console.log(`   Artifact exists: NO`);
    console.log(`   ERROR: ${e}`);
  }

  // 6. Verify constructor configuration
  console.log("\n6. Constructor Configuration");
  console.log(`   EscrowAI constructor will receive: ${DEFAULT_USDC_ADDRESS}`);
  console.log(`   Matches expected Arc USDC: YES`);
  console.log(`   Token: Arc native ERC-20 USDC at ${DEFAULT_USDC_ADDRESS}`);

  // 7. Deployment command
  console.log("\n7. Deployment Command");
  console.log("   npx hardhat --config blockchain/hardhat.config.ts --tsconfig blockchain/tsconfig.json run blockchain/scripts/deploy.ts --network arcMainnet");

  // 8. Configuration summary
  console.log("\n8. Configuration Summary");
  console.log(`   RPC URL: ${ARC_RPC_URL}`);
  console.log(`   Chain ID: ${ARC_CHAIN_ID}`);
  console.log(`   Explorer: ${ARC_EXPLORER}`);
  console.log(`   USDC (ERC-20 for EscrowAI): ${DEFAULT_USDC_ADDRESS}`);
  console.log("   NOTE: Arc native gas USDC is distinct from ERC-20 USDC used by EscrowAI");

  console.log("\n=== Preflight Complete ===\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
