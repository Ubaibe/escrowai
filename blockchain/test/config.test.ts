import { expect } from "chai";
import {
  ARC_CHAIN_ID,
  ARC_RPC_URL,
  ARC_EXPLORER,
  DEFAULT_USDC_ADDRESS,
  ARC_NATIVE_CURRENCY,
  getArcConfig,
  arcMainnet,
} from "../src/config";

describe("Arc configuration", function () {
  describe("constants", function () {
    it("exposes the correct Arc Mainnet chain ID", function () {
      expect(ARC_CHAIN_ID).to.equal(5042);
    });

    it("exposes the correct Arc Mainnet RPC URL", function () {
      expect(ARC_RPC_URL).to.equal("https://rpc.mainnet.arc.io");
    });

    it("exposes the correct Arc explorer URL", function () {
      expect(ARC_EXPLORER).to.equal("https://explorer.arc.io");
    });

    it("exposes the Arc Mainnet USDC address", function () {
      expect(DEFAULT_USDC_ADDRESS).to.equal(
        "0x3600000000000000000000000000000000000000",
      );
    });

    it("exposes the correct native currency metadata", function () {
      expect(ARC_NATIVE_CURRENCY.name).to.equal("USDC");
      expect(ARC_NATIVE_CURRENCY.symbol).to.equal("USDC");
      expect(ARC_NATIVE_CURRENCY.decimals).to.equal(6);
    });
  });

  describe("getArcConfig", function () {
    const originalUsdc = process.env.ARC_USDC_ADDRESS;
    const originalRpc = process.env.ARC_RPC_URL;
    const originalEscrow = process.env.ESCROW_CONTRACT_ADDRESS;
    const originalNextPublicEscrow = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;

    beforeEach(function () {
      delete process.env.ARC_USDC_ADDRESS;
      delete process.env.ARC_RPC_URL;
      delete process.env.ESCROW_CONTRACT_ADDRESS;
      delete process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
    });

    afterEach(function () {
      if (originalUsdc !== undefined) process.env.ARC_USDC_ADDRESS = originalUsdc;
      else delete process.env.ARC_USDC_ADDRESS;
      if (originalRpc !== undefined) process.env.ARC_RPC_URL = originalRpc;
      else delete process.env.ARC_RPC_URL;
      if (originalEscrow !== undefined) process.env.ESCROW_CONTRACT_ADDRESS = originalEscrow;
      else delete process.env.ESCROW_CONTRACT_ADDRESS;
      if (originalNextPublicEscrow !== undefined) process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS = originalNextPublicEscrow;
      else delete process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
    });

    it("returns correct default values when no env vars are set", function () {
      delete process.env.ARC_USDC_ADDRESS;
      delete process.env.ARC_RPC_URL;
      delete process.env.ESCROW_CONTRACT_ADDRESS;
      delete process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;

      const config = getArcConfig();
      expect(config.chainId).to.equal(5042);
      expect(config.rpcUrl).to.equal("https://rpc.mainnet.arc.io");
      expect(config.explorer).to.equal("https://explorer.arc.io");
      expect(config.usdcAddress).to.equal(DEFAULT_USDC_ADDRESS);
      expect(config.escrowContractAddress).to.be.undefined;
    });

    it("returns custom values when env vars are set", function () {
      process.env.ARC_USDC_ADDRESS = "0x1234567890123456789012345678901234567890";
      process.env.ARC_RPC_URL = "https://custom.rpc.url";
      process.env.ESCROW_CONTRACT_ADDRESS = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

      const config = getArcConfig();
      expect(config.usdcAddress).to.equal("0x1234567890123456789012345678901234567890");
      expect(config.rpcUrl).to.equal("https://custom.rpc.url");
      expect(config.escrowContractAddress).to.equal(
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      );
    });

    it("leaves escrowContractAddress undefined for an invalid address", function () {
      process.env.ESCROW_CONTRACT_ADDRESS = "not-an-address";

      const config = getArcConfig();
      expect(config.escrowContractAddress).to.be.undefined;
    });

    it("leaves escrowContractAddress undefined for an empty value", function () {
      process.env.ESCROW_CONTRACT_ADDRESS = "";

      const config = getArcConfig();
      expect(config.escrowContractAddress).to.be.undefined;
    });
  });

  describe("arcMainnet chain definition", function () {
    it("defines the chain with id 5042", function () {
      expect(arcMainnet.id).to.equal(5042);
    });

    it("defines the chain name as Arc Mainnet", function () {
      expect(arcMainnet.name).to.equal("Arc Mainnet");
    });
  });
});
