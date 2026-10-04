import hre from "hardhat";

const config = hre.network.config as any;
console.log("=== Hardhat Network Configuration ===");
console.log(`Network name: ${hre.network.name}`);
console.log(`Chain ID: ${config.chainId}`);
console.log(`RPC URL: ${config.url}`);
console.log(`Accounts configured: ${config.accounts && config.accounts.length > 0 ? "YES" : "NO (no PRIVATE_KEY)"}`);
console.log("=== Network Recognized: YES ===");
