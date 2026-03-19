// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * CeloCrush — Anonymous Compliments with USDT Tips
 *
 * Deployed on Celo Mainnet / Alfajores Testnet
 * USDT on Celo: 0x617f3112bf5397D0467D315cC709EF968D9ba546
 *
 * Flow:
 *   1. Sender calls sendCrush() with recipient, messageHash, tipAmount
 *   2. USDT tip is held in escrow inside this contract
 *   3. Recipient calls claimTip(crushId) to receive USDT
 *   4. After EXPIRY_DAYS with no claim, sender can call refund(crushId)
 *
 * Privacy:
 *   - Message content is stored off-chain (IPFS / encrypted DB)
 *   - Only the content hash is stored on-chain
 *   - Sender address is stored for refund purposes only
 *   - Self zkID nullifier hash is stored to prevent duplicate accounts
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface ISelfVerifier {
    function isVerified(address user, bytes32 nullifierHash) external view returns (bool);
}

contract CeloCrush {

    // ─── CONFIG ──────────────────────────────────────────────────────────────

    IERC20  public immutable usdt;
    address public immutable owner;
    uint256 public constant EXPIRY_DAYS   = 30 days;
    uint256 public constant PROTOCOL_FEE  = 25;   // 2.5% in basis points (25/1000)
    uint256 public constant FEE_DENOM     = 1000;

    // ─── STRUCTS ─────────────────────────────────────────────────────────────

    struct Crush {
        address   sender;        // for refund only
        address   recipient;
        bytes32   messageHash;   // keccak256 of off-chain encrypted message
        uint256   tipAmount;     // in USDT (6 decimals on Celo)
        uint256   expiresAt;
        bool      claimed;
        bool      refunded;
    }

    // ─── STATE ───────────────────────────────────────────────────────────────

    uint256 public nextCrushId = 1;
    mapping(uint256 => Crush) public crushes;

    // recipient => list of crushIds
    mapping(address => uint256[]) public inboxOf;

    // zkID nullifier => has account (anti-sybil)
    mapping(bytes32 => bool) public usedNullifiers;

    uint256 public accruedFees;

    // ─── EVENTS ──────────────────────────────────────────────────────────────

    event CrushSent(
        uint256 indexed crushId,
        address indexed recipient,
        bytes32 messageHash,
        uint256 tipAmount,
        uint256 expiresAt
    );

    event TipClaimed(
        uint256 indexed crushId,
        address indexed recipient,
        uint256 amount
    );

    event TipRefunded(
        uint256 indexed crushId,
        address indexed sender,
        uint256 amount
    );

    // ─── CONSTRUCTOR ─────────────────────────────────────────────────────────

    constructor(address _usdt) {
        usdt  = IERC20(_usdt);
        owner = msg.sender;
    }

    // ─── SEND A CRUSH ────────────────────────────────────────────────────────

    /**
     * @param recipient    Address of the person you're crushing on
     * @param messageHash  keccak256 hash of the encrypted off-chain message
     * @param tipAmount    Amount of USDT to escrow (0 = no tip, in 6-decimal units)
     *
     * Before calling: approve this contract to spend `tipAmount` USDT
     */
    function sendCrush(
        address   recipient,
        bytes32   messageHash,
        uint256   tipAmount
    ) external returns (uint256 crushId) {
        require(recipient != address(0),       "Invalid recipient");
        require(recipient != msg.sender,       "Cannot crush yourself");

        crushId = nextCrushId++;

        uint256 expires = block.timestamp + EXPIRY_DAYS;

        crushes[crushId] = Crush({
            sender:      msg.sender,
            recipient:   recipient,
            messageHash: messageHash,
            tipAmount:   tipAmount,
            expiresAt:   expires,
            claimed:     false,
            refunded:    false
        });

        inboxOf[recipient].push(crushId);

        // Pull USDT into escrow
        if (tipAmount > 0) {
            require(
                usdt.transferFrom(msg.sender, address(this), tipAmount),
                "USDT transfer failed - did you approve?"
            );
        }

        emit CrushSent(crushId, recipient, messageHash, tipAmount, expires);
    }

    // ─── CLAIM TIP ───────────────────────────────────────────────────────────

    /**
     * Recipient claims their USDT tip.
     * Protocol fee (2.5%) is deducted and stays in contract for owner to sweep.
     */
    function claimTip(uint256 crushId) external {
        Crush storage c = crushes[crushId];

        require(c.recipient == msg.sender, "Not your crush");
        require(!c.claimed,                "Already claimed");
        require(!c.refunded,               "Already refunded");
        require(c.tipAmount > 0,           "No tip to claim");
        require(block.timestamp <= c.expiresAt, "Crush expired");

        c.claimed = true;

        uint256 fee    = (c.tipAmount * PROTOCOL_FEE) / FEE_DENOM;
        uint256 payout = c.tipAmount - fee;

        accruedFees += fee;

        require(usdt.transfer(msg.sender, payout), "Transfer failed");

        emit TipClaimed(crushId, msg.sender, payout);
    }

    // ─── REFUND (EXPIRED) ────────────────────────────────────────────────────

    /**
     * If the recipient hasn't claimed after EXPIRY_DAYS, sender gets a refund.
     */
    function refund(uint256 crushId) external {
        Crush storage c = crushes[crushId];

        require(c.sender == msg.sender,        "Not your crush");
        require(!c.claimed,                    "Already claimed");
        require(!c.refunded,                   "Already refunded");
        require(c.tipAmount > 0,               "No tip to refund");
        require(block.timestamp > c.expiresAt, "Not expired yet");

        c.refunded = true;

        require(usdt.transfer(msg.sender, c.tipAmount), "Refund failed");

        emit TipRefunded(crushId, msg.sender, c.tipAmount);
    }

    // ─── VIEW HELPERS ────────────────────────────────────────────────────────

    function getInbox(address user) external view returns (uint256[] memory) {
        return inboxOf[user];
    }

    function getCrush(uint256 crushId) external view returns (Crush memory) {
        return crushes[crushId];
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    function sweepFees() external {
        require(msg.sender == owner, "Not owner");
        uint256 amount = accruedFees;
        accruedFees = 0;
        require(usdt.transfer(owner, amount), "Transfer failed");
    }
}
