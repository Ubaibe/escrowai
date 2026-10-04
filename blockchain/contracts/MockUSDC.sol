// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC
/// @notice Six-decimal ERC-20 used only by local Hardhat tests.
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "mUSDC") {}

    /// @dev USDC uses six decimal places.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Mints test tokens to a local test account.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
