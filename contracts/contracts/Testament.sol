// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Testament {
    struct TestamentData {
        address beneficiary;
        uint256 amount;
        uint256 lastActivity;
        uint256 inactivityPeriod;
        bool isActive;
    }

    mapping(address => TestamentData) public testaments;
    mapping(address => address[]) public beneficiaryMap;

    uint256 public constant CLAIM_WINDOW = 60 days;
    uint256 public constant COMMISSION_RATE = 2; // 2%
    address public immutable protocolWallet;

    event TestamentCreated(address indexed owner, address indexed beneficiary, uint256 amount, uint256 inactivityPeriod);
    event TestamentClaimed(address indexed beneficiary, uint256 amount, uint256 timestamp);
    event TestamentCancelled(address indexed owner, uint256 amount);
    event ActivityRecorded(address indexed owner, uint256 timestamp);

    error NoActiveTestament();
    error InactivityPeriodNotPassed();
    error ClaimWindowExpired();
    error AlreadyExists();
    error TransferFailed();
    error NotBeneficiary();
    error InvalidAmount();
    error InvalidBeneficiary();
    error InvalidPeriod();

    constructor(address _protocolWallet) {
        protocolWallet = _protocolWallet;
    }

    function createTestament(
        address _beneficiary,
        uint256 _inactivityPeriod
    ) external payable {
        if (testaments[msg.sender].isActive) revert AlreadyExists();
        if (_beneficiary == address(0)) revert InvalidBeneficiary();
        if (msg.value == 0) revert InvalidAmount();
        if (_inactivityPeriod < 1 days) revert InvalidPeriod();

        // Calculate commission
        uint256 commission = (msg.value * COMMISSION_RATE) / 100;
        uint256 netAmount = msg.value - commission;

        // Transfer commission to protocol
        (bool success, ) = protocolWallet.call{value: commission}("");
        if (!success) revert TransferFailed();

        testaments[msg.sender] = TestamentData({
            beneficiary: _beneficiary,
            amount: netAmount,
            lastActivity: block.timestamp,
            inactivityPeriod: _inactivityPeriod,
            isActive: true
        });

        beneficiaryMap[_beneficiary].push(msg.sender);

        emit TestamentCreated(msg.sender, _beneficiary, netAmount, _inactivityPeriod);
    }

    function ping() external {
        TestamentData storage testament = testaments[msg.sender];
        if (!testament.isActive) revert NoActiveTestament();

        testament.lastActivity = block.timestamp;
        emit ActivityRecorded(msg.sender, block.timestamp);
    }

    function cancel() external {
        TestamentData storage testament = testaments[msg.sender];
        if (!testament.isActive) revert NoActiveTestament();

        uint256 amount = testament.amount;
        testament.isActive = false;
        testament.amount = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit TestamentCancelled(msg.sender, amount);
    }

    function claim(address _owner) external {
        TestamentData storage testament = testaments[_owner];

        if (!testament.isActive) revert NoActiveTestament();
        
        uint256 deadline = testament.lastActivity + testament.inactivityPeriod;
        if (block.timestamp < deadline) revert InactivityPeriodNotPassed();
        if (block.timestamp > deadline + CLAIM_WINDOW) revert ClaimWindowExpired();

        uint256 amount = testament.amount;
        address beneficiary = testament.beneficiary;
        
        testament.isActive = false;
        testament.amount = 0;

        (bool success, ) = payable(beneficiary).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit TestamentClaimed(beneficiary, amount, block.timestamp);
    }

    function getTestament(address _owner) external view returns (
        address beneficiary,
        uint256 lastActivity,
        uint256 inactivityPeriod,
        uint256 amount,
        bool isActive
    ) {
        TestamentData storage t = testaments[_owner];
        return (
            t.beneficiary,
            t.lastActivity,
            t.inactivityPeriod,
            t.amount,
            t.isActive
        );
    }

    function canBeClaimed(address _owner) external view returns (bool) {
        TestamentData storage testament = testaments[_owner];
        if (!testament.isActive) return false;
        
        uint256 deadline = testament.lastActivity + testament.inactivityPeriod;
        return block.timestamp >= deadline && block.timestamp <= deadline + CLAIM_WINDOW;
    }

    function getClaimDeadline(address _owner) external view returns (uint256) {
        TestamentData storage testament = testaments[_owner];
        if (!testament.isActive) return 0;
        return testament.lastActivity + testament.inactivityPeriod;
    }

    function getBeneficiaryTestaments(address _beneficiary) external view returns (address[] memory) {
        return beneficiaryMap[_beneficiary];
    }

    receive() external payable {}
}
