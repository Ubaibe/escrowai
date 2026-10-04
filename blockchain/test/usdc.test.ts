import { expect } from "chai";
import {
  USDC_DECIMALS,
  toUSDCBaseUnits,
  fromUSDCBaseUnits,
  usdcToString,
} from "../src/usdc";

describe("USDC utilities", function () {
  describe("USDC_DECIMALS", function () {
    it("is 6", function () {
      expect(USDC_DECIMALS).to.equal(6);
    });
  });

  describe("toUSDCBaseUnits", function () {
    it("converts 50 USDC to 50000000 base units from a bigint", function () {
      expect(toUSDCBaseUnits(50n)).to.equal(50000000n);
    });

    it("converts 50 USDC to 50000000 base units from a number", function () {
      expect(toUSDCBaseUnits(50)).to.equal(50000000n);
    });

    it("converts 1 USDC to 1000000 base units", function () {
      expect(toUSDCBaseUnits(1)).to.equal(1000000n);
    });

    it("converts 0 USDC to 0 base units", function () {
      expect(toUSDCBaseUnits(0)).to.equal(0n);
    });

    it("handles large amounts", function () {
      expect(toUSDCBaseUnits(1000000n)).to.equal(1000000000000n);
    });
  });

  describe("fromUSDCBaseUnits", function () {
    it("converts 50000000 base units to 50", function () {
      expect(fromUSDCBaseUnits(50000000n)).to.equal(50n);
    });

    it("converts 0 base units to 0", function () {
      expect(fromUSDCBaseUnits(0n)).to.equal(0n);
    });

    it("truncates fractional USDC (floor division)", function () {
      expect(fromUSDCBaseUnits(50500000n)).to.equal(50n);
    });

    it("handles large amounts", function () {
      expect(fromUSDCBaseUnits(1000000000000n)).to.equal(1000000n);
    });

    it("throws on negative base units", function () {
      expect(() => fromUSDCBaseUnits(-1n)).to.throw();
    });
  });

  describe("usdcToString", function () {
    it("formats whole USDC amounts without decimals", function () {
      expect(usdcToString(50000000n)).to.equal("50");
      expect(usdcToString(0n)).to.equal("0");
    });

    it("formats amounts with fractional USDC", function () {
      expect(usdcToString(50500000n)).to.equal("50.5");
      expect(usdcToString(1000001n)).to.equal("1.000001");
    });

    it("preserves leading zeros in the fractional part", function () {
      expect(usdcToString(1000010n)).to.equal("1.00001");
    });

    it("handles large amounts", function () {
      expect(usdcToString(1000000000000n)).to.equal("1000000");
    });
  });
});
