import { expect } from "chai";
import { getArcConfig, ARC_CHAIN_ID, DEFAULT_USDC_ADDRESS, ARC_RPC_URL, ARC_EXPLORER } from "../src/config";

describe("Deployment Configuration", function () {
  it("has correct Arc chain ID", function () {
    expect(ARC_CHAIN_ID).to.equal(5042);
  });

  it("has correct default USDC address", function () {
    expect(DEFAULT_USDC_ADDRESS).to.equal("0x3600000000000000000000000000000000000000");
  });

  it("has correct Arc RPC URL", function () {
    expect(ARC_RPC_URL).to.equal("https://rpc.mainnet.arc.io");
  });

  it("has correct Arc explorer URL", function () {
    expect(ARC_EXPLORER).to.equal("https://explorer.arc.io");
  });

  it("getArcConfig returns correct defaults without env vars", function () {
    delete process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS;
    delete process.env.ARC_USDC_ADDRESS;
    delete process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
    delete process.env.ESCROW_CONTRACT_ADDRESS;
    delete process.env.NEXT_PUBLIC_ARC_RPC_URL;
    delete process.env.ARC_RPC_URL;

    const config = getArcConfig();
    expect(config.chainId).to.equal(5042);
    expect(config.usdcAddress).to.equal(DEFAULT_USDC_ADDRESS);
    expect(config.rpcUrl).to.equal(ARC_RPC_URL);
    expect(config.explorer).to.equal(ARC_EXPLORER);
    expect(config.nativeCurrency.symbol).to.equal("USDC");
    expect(config.nativeCurrency.decimals).to.equal(6);
  });

  it("getArcConfig validates escrow contract address format", function () {
    process.env.ESCROW_CONTRACT_ADDRESS = "0x84141727973c3A74844a51c058f199A82F12464f";
    let config = getArcConfig();
    expect(config.escrowContractAddress).to.equal("0x84141727973c3A74844a51c058f199A82F12464f");

    process.env.ESCROW_CONTRACT_ADDRESS = "invalid-address";
    config = getArcConfig();
    expect(config.escrowContractAddress).to.be.undefined;

    delete process.env.ESCROW_CONTRACT_ADDRESS;
  });

  it("getArcConfig accepts custom USDC address from env", function () {
    process.env.ARC_USDC_ADDRESS = "0x0000000000000000000000000000000000000001";
    const config = getArcConfig();
    expect(config.usdcAddress).to.equal("0x0000000000000000000000000000000000000001");
    delete process.env.ARC_USDC_ADDRESS;
  });

  it("deployment address is valid Ethereum address", function () {
    const DEPLOYED_ADDRESS = "0x84141727973c3A74844a51c058f199A82F12464f";
    expect(DEPLOYED_ADDRESS).to.match(/^0x[0-9a-fA-F]{40}$/);
  });

  it("deployment transaction hash is valid", function () {
    const DEPLOY_TX = "0x22d73c0fddf101d1b677911bee596d903a1d675e5f3086e86bfebe0fb7004f7b";
    expect(DEPLOY_TX).to.match(/^0x[0-9a-fA-F]{64}$/);
  });
});
