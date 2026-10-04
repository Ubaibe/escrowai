// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {EscrowAI} from "../EscrowAI.sol";

interface ReentrantReceiver {
    function onTokenTransfer() external;
}

contract ReentrantUSDC is ERC20 {
    address public reentryTarget;

    constructor() ERC20("Reentrant Mock USD Coin", "rmUSDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setReentryTarget(address target) external {
        reentryTarget = target;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        bool success = super.transferFrom(from, to, amount);
        address target = reentryTarget;
        if (success && target != address(0)) {
            (success, ) = target.call(abi.encodeWithSelector(ReentrantReceiver.onTokenTransfer.selector));
            require(success, "reentry failed");
        }
        return success;
    }
}

contract ReentrantBuyer {
    EscrowAI public immutable escrow;
    IERC20 public immutable token;
    uint256 public escrowId;
    bool public attacking;
    uint256 public reentryAttempts;

    constructor(EscrowAI escrow_, IERC20 token_) {
        escrow = escrow_;
        token = token_;
    }

    function createEscrow(address seller, uint256 amount, uint256 deadline) external returns (uint256) {
        return escrow.createEscrow(seller, amount, deadline);
    }

    function fund(uint256 id) external {
        escrowId = id;
        (, , , uint256 amount, , , ) = escrow.getEscrow(id);
        token.approve(address(escrow), amount);
        attacking = true;
        escrow.fundEscrow(id);
        attacking = false;
    }

    function onTokenTransfer() external {
        if (attacking) {
            reentryAttempts++;
            try escrow.releaseEscrow(escrowId) {} catch {}
        }
    }
}
