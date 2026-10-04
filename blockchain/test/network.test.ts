import { expect } from "chai";
import {
  isArcMainnet,
  isUSDCAddress,
  isDefaultUSDCAddress,
  hasEscrowContract,
} from "../src/network";
import { DEFAULT_USDC_ADDRESS } from "../src/config";

describe("Network safety utilities", function () {
  const originalUsdc = process.env.ARC_USDC_ADDRESS;
  const originalEscrow = process.env.ESCROW_CONTRACT_ADDRESS;

  afterEach(function () {
    if (originalUsdc !== undefined) process.env.ARC_USDC_ADDRESS = originalUsdc;
    else delete process.env.ARC_USDC_ADDRESS;
    if (originalEscrow !== undefined) process.env.ESCROW_CONTRACT_ADDRESS = originalEscrow;
    else delete process.env.ESCROW_CONTRACT_ADDRESS;
  });

  describe("isArcMainnet", function () {
    it("returns true for Arc Mainnet chain ID (5042)", function () {
      expect(isArcMainnet(5042)).to.be.true;
      expect(isArcMainnet(5042n)).to.be.true;
    });

    it("returns false for Ethereum mainnet (1)", function () {
      expect(isArcMainnet(1)).to.be.false;
    });

    it("returns false for Hardhat local network (31337)", function () {
      expect(isArcMainnet(31337)).to.be.false;
    });

    it("returns false for arbitrary chain IDs", function () {
      expect(isArcMainnet(8453)).to.be.false;
      expect(isArcMainnet(0)).to.be.false;
    });
  });

  describe("isDefaultUSDCAddress", function () {
    it("returns true for the Arc Mainnet USDC address", function () {
      expect(isDefaultUSDCAddress(DEFAULT_USDC_ADDRESS)).to.be.true;
      expect(
        isDefaultUSDCAddress("0x3600000000000000000000000000000000000000"),
      ).to.be.true;
    });

    it("returns true regardless of case", function () {
      const upper = DEFAULT_USDC_ADDRESS.toUpperCase();
      expect(isDefaultUSDCAddress(upper)).to.be.true;
    });

    it("returns false for a different address", function () {
      expect(isDefaultUSDCAddress("0x0000000000000000000000000000000000000001")).to.be.false;
    });

    it("returns false for the zero address", function () {
      expect(isDefaultUSDCAddress("0x0000000000000000000000000000000000000000")).to.be.false;
    });
  });

  describe("isUSDCAddress", function () {
    it("returns true when ARC_USDC_ADDRESS matches the default", function () {
      delete process.env.ARC_USDC_ADDRESS;
      expect(isUSDCAddress(DEFAULT_USDC_ADDRESS)).to.be.true;
    });

    it("returns true when ARC_USDC_ADDRESS is a custom address and matches", function () {
      const customAddr = "0x1234567890123456789012345678901234567890";
      process.env.ARC_USDC_ADDRESS = customAddr;
      expect(isUSDCAddress(customAddr)).to.be.true;
    });

    it("returns false when the address does not match the configured USDC", function () {
      delete process.env.ARC_USDC_ADDRESS;
      expect(isUSDCAddress("0x0000000000000000000000000000000000000001")).to.be.false;
    });
  });

  describe("hasEscrowContract", function () {
    it("returns false when ESCROW_CONTRACT_ADDRESS is not set", function () {
      delete process.env.ESCROW_CONTRACT_ADDRESS;
      expect(hasEscrowContract()).to.be.false;
    });

    it("returns false when ESCROW_CONTRACT_ADDRESS is empty", function () {
      process.env.ESCROW_CONTRACT_ADDRESS = "";
      expect(hasEscrowContract()).to.be.false;
    });

    it("returns false when ESCROW_CONTRACT_ADDRESS is an invalid address", function () {
      process.env.ESCROW_CONTRACT_ADDRESS = "not-an-address";
      expect(hasEscrowContract()).to.be.false;
    });

    it("returns true when ESCROW_CONTRACT_ADDRESS is a valid address", function () {
      process.env.ESCROW_CONTRACT_ADDRESS = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
      expect(hasEscrowContract()).to.be.true;
    });
  });
});
