// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title EscrowAI
/// @notice Non-custodial ERC-20 escrow for a buyer, a seller, and one payment token.
/// @dev The supported state machine is:
///      CREATED -> FUNDED -> RELEASED
///                        -> REFUNDED after the deadline
contract EscrowAI is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Status {
        CREATED,
        FUNDED,
        RELEASED,
        REFUNDED
    }

    struct Escrow {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        uint256 createdAt;
        uint256 deadline;
        Status status;
    }

    IERC20 public immutable usdcToken;

    mapping(uint256 => Escrow) private _escrows;
    uint256 private _nextEscrowId = 1;

    error BuyerEqualsSeller();
    error DeadlineNotReached();
    error EscrowNotFound();
    error InvalidAmount();
    error InvalidDeadline();
    error InvalidSeller();
    error InvalidStatus();
    error InvalidTokenAddress();
    error Unauthorized();

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 deadline
    );
    event EscrowFunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);
    event EscrowReleased(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount
    );
    event EscrowRefunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);

    /// @param usdcToken_ The ERC-20 token used for all escrow payments.
    constructor(address usdcToken_) {
        if (usdcToken_ == address(0)) revert InvalidTokenAddress();
        usdcToken = IERC20(usdcToken_);
    }

    /// @notice Creates an unfunded escrow. No tokens are transferred.
    /// @param seller The account that receives the payment on release.
    /// @param amount The exact token amount to escrow.
    /// @param deadline The first timestamp at which the buyer may request a refund.
    /// @return escrowId The newly assigned escrow identifier.
    function createEscrow(address seller, uint256 amount, uint256 deadline)
        external
        returns (uint256 escrowId)
    {
        if (seller == address(0)) revert InvalidSeller();
        if (seller == msg.sender) revert BuyerEqualsSeller();
        if (amount == 0) revert InvalidAmount();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        escrowId = _nextEscrowId++;
        _escrows[escrowId] = Escrow({
            id: escrowId,
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            createdAt: block.timestamp,
            deadline: deadline,
            status: Status.CREATED
        });

        emit EscrowCreated(escrowId, msg.sender, seller, amount, deadline);
    }

    /// @notice Transfers the configured amount from the buyer into escrow.
    /// @param escrowId The escrow to fund.
    function fundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = _getEscrow(escrowId);
        if (msg.sender != escrow.buyer) revert Unauthorized();
        if (escrow.status != Status.CREATED) revert InvalidStatus();

        escrow.status = Status.FUNDED;
        usdcToken.safeTransferFrom(msg.sender, address(this), escrow.amount);

        emit EscrowFunded(escrowId, msg.sender, escrow.amount);
    }

    /// @notice Releases the held payment to the seller.
    /// @param escrowId The escrow to release.
    function releaseEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = _getEscrow(escrowId);
        if (msg.sender != escrow.buyer) revert Unauthorized();
        if (escrow.status != Status.FUNDED) revert InvalidStatus();

        escrow.status = Status.RELEASED;
        usdcToken.safeTransfer(escrow.seller, escrow.amount);

        emit EscrowReleased(escrowId, msg.sender, escrow.seller, escrow.amount);
    }

    /// @notice Refunds an expired, funded escrow to its buyer.
    /// @param escrowId The escrow to refund.
    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = _getEscrow(escrowId);
        if (msg.sender != escrow.buyer) revert Unauthorized();
        if (escrow.status != Status.FUNDED) revert InvalidStatus();
        if (block.timestamp < escrow.deadline) revert DeadlineNotReached();

        escrow.status = Status.REFUNDED;
        usdcToken.safeTransfer(msg.sender, escrow.amount);

        emit EscrowRefunded(escrowId, msg.sender, escrow.amount);
    }

    /// @notice Returns all stored data for an escrow.
    /// @param escrowId The escrow identifier.
    function getEscrow(uint256 escrowId)
        external
        view
        returns (
            uint256 id,
            address buyer,
            address seller,
            uint256 amount,
            uint256 createdAt,
            uint256 deadline,
            Status status
        )
    {
        Escrow storage escrow = _getEscrow(escrowId);
        return (
            escrow.id,
            escrow.buyer,
            escrow.seller,
            escrow.amount,
            escrow.createdAt,
            escrow.deadline,
            escrow.status
        );
    }

    /// @notice Reports whether a funded escrow is currently eligible for refund.
    /// @param escrowId The escrow identifier.
    function isRefundable(uint256 escrowId) external view returns (bool) {
        Escrow storage escrow = _getEscrow(escrowId);
        return escrow.status == Status.FUNDED && block.timestamp >= escrow.deadline;
    }

    function _getEscrow(uint256 escrowId) private view returns (Escrow storage escrow) {
        escrow = _escrows[escrowId];
        if (escrow.id != escrowId) revert EscrowNotFound();
    }
}
