import { createPublicClient, http, getContract, parseAbi } from "viem";
import { arcMainnet, DEFAULT_USDC_ADDRESS, ARC_CHAIN_ID, ARC_RPC_URL } from "../src/config";

const DEPLOYED_ADDRESS = "0x84141727973c3A74844a51c058f199A82F12464f" as `0x${string}`;
const DEPLOY_TX = "0x22d73c0fddf101d1b677911bee596d903a1d675e5f3086e86bfebe0fb7004f7b" as `0x${string}`;
const DEPLOY_BLOCK = 23855776;

const VERIFICATION_ABI = parseAbi([
  "function usdcToken() view returns (address)",
  "function getEscrow(uint256) view returns (uint256, address, address, uint256, uint256, uint256, uint8)",
  "function isRefundable(uint256) view returns (bool)",
]);

async function main() {
  console.log("=== EscrowAI Post-Deployment Verification (Read-Only) ===\n");

  const client = createPublicClient({
    chain: arcMainnet,
    transport: http(ARC_RPC_URL),
  });

  // 1. Verify chain ID
  console.log("1. Chain Verification");
  const chainId = await client.getChainId();
  console.log(`   Connected chain ID: ${chainId}`);
  console.log(`   Expected chain ID: ${ARC_CHAIN_ID}`);
  console.log(`   Chain matches: ${chainId === ARC_CHAIN_ID ? "YES" : "NO"}`);

  // 2. Verify bytecode
  console.log("\n2. Bytecode Verification");
  const code = await client.getBytecode({ address: DEPLOYED_ADDRESS });
  const hasCode = code !== "0x" && code !== "0x0" && code && code.length > 10;
  console.log(`   Address: ${DEPLOYED_ADDRESS}`);
  console.log(`   Bytecode present: ${hasCode ? "YES" : "NO"}`);
  console.log(`   Bytecode length: ${code?.length ?? 0} chars`);

  // 3. Verify usdcToken()
  console.log("\n3. Constructor Configuration (usdcToken)");
  const escrow = getContract({
    address: DEPLOYED_ADDRESS,
    abi: VERIFICATION_ABI,
    client,
  });
  const usdcToken = await escrow.read.usdcToken();
  console.log(`   usdcToken(): ${usdcToken}`);
  console.log(`   Expected: ${DEFAULT_USDC_ADDRESS}`);
  console.log(`   Match: ${usdcToken.toLowerCase() === DEFAULT_USDC_ADDRESS.toLowerCase() ? "YES" : "NO"}`);

  // 4. Verify getEscrow for nonexistent ID (should revert with EscrowNotFound)
  console.log("\n4. Escrow Lookup for Nonexistent ID");
  try {
    await escrow.read.getEscrow([1n]);
    console.log("   Result: No revert (unexpected — escrow may already exist at ID 1)");
  } catch (e: any) {
    const errorMsg = (e?.message || String(e)).replace(/\n/g, " ");
    console.log("   Reverted as expected: YES");
    console.log(`   Error: ${errorMsg.slice(0, 200)}`);
  }

  // 5. Verify isRefundable for nonexistent ID
  console.log("\n5. isRefundable for Nonexistent ID");
  try {
    const result = await escrow.read.isRefundable([1n]);
    console.log(`   isRefundable(1): ${result}`);
    console.log(`   Expected: false (no escrow exists)`);
    console.log(`   Consistent: ${result === false ? "YES" : "NO"}`);
  } catch (e: any) {
    const errorMsg = (e?.message || String(e)).replace(/\n/g, " ");
    console.log(`   Reverted with: ${errorMsg.slice(0, 200)}`);
  }

  // 6. Verify deployment transaction
  console.log("\n6. Deployment Transaction Verification");
  try {
    const tx = await client.getTransaction({ hash: DEPLOY_TX });
    console.log("   Transaction exists: YES");
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Block number: ${tx.blockNumber}`);
    console.log(`   Block matches expected: ${tx.blockNumber === BigInt(DEPLOY_BLOCK) ? "YES" : "NO"}`);
    console.log(`   From: ${tx.from}`);
    console.log(`   To: ${tx.to ?? "(contract creation)"}`);

    const receipt = await client.getTransactionReceipt({ hash: DEPLOY_TX });
    console.log(`   Receipt status: ${receipt?.status}`);
    console.log(`   Contract address in receipt: ${receipt?.contractAddress}`);
    console.log(`   Contract address matches: ${receipt?.contractAddress?.toLowerCase() === DEPLOYED_ADDRESS.toLowerCase() ? "YES" : "NO"}`);
  } catch (e) {
    console.log(`   ERROR: Transaction not found or RPC error: ${e}`);
  }

  console.log("\n=== Verification Complete ===");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
