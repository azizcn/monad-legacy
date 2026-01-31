# 🚀 Remix IDE ile Testament Contract Deploy Rehberi

## Adım 1: Remix'i Açın
https://remix.ethereum.org/ adresine gidin

## Adım 2: Contract Dosyasını Oluşturun

1. Sol menüden "File Explorer" sekmesine tıklayın
2. `contracts` klasörüne sağ tıklayıp "New File" seçin
3. Dosya adı: `Testament.sol`
4. Aşağıdaki kodu yapıştırın:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Testament is ReentrancyGuard {
    struct TestamentData {
        address beneficiary;
        uint256 amount;
        uint256 lastActivity;
        uint256 inactivityPeriod;
        bool isActive;
    }

    mapping(address => TestamentData) public testaments;

    event TestamentCreated(address indexed owner, address indexed beneficiary, uint256 inactivityPeriod);
    event Deposited(address indexed owner, uint256 amount, uint256 totalAmount);
    event Withdrawn(address indexed owner, uint256 amount, uint256 remainingAmount);
    event Pinged(address indexed owner, uint256 timestamp);
    event TestamentClaimed(address indexed beneficiary, address indexed owner, uint256 amount);
    event TestamentCancelled(address indexed owner, uint256 refundAmount);

    error TestamentAlreadyExists();
    error InvalidBeneficiary();
    error InvalidAmount();
    error InvalidInactivityPeriod();
    error NoActiveTestament();
    error NotAuthorized();
    error InactivityPeriodNotElapsed();
    error TransferFailed();
    error InsufficientBalance();

    function createTestament(address _beneficiary, uint256 _inactivityPeriod) external {
        if (testaments[msg.sender].isActive) revert TestamentAlreadyExists();
        if (_beneficiary == address(0) || _beneficiary == msg.sender) revert InvalidBeneficiary();
        if (_inactivityPeriod < 5) revert InvalidInactivityPeriod();

        testaments[msg.sender] = TestamentData({
            beneficiary: _beneficiary,
            amount: 0,
            lastActivity: block.timestamp,
            inactivityPeriod: _inactivityPeriod,
            isActive: true
        });

        emit TestamentCreated(msg.sender, _beneficiary, _inactivityPeriod);
    }

    function deposit() external payable nonReentrant {
        TestamentData storage testament = testaments[msg.sender];
        if (!testament.isActive) revert NoActiveTestament();
        if (msg.value == 0) revert InvalidAmount();

        testament.amount += msg.value;
        testament.lastActivity = block.timestamp;
        emit Deposited(msg.sender, msg.value, testament.amount);
    }

    function withdraw(uint256 _amount) external nonReentrant {
        TestamentData storage testament = testaments[msg.sender];
        if (!testament.isActive) revert NoActiveTestament();
        if (_amount == 0) revert InvalidAmount();
        if (_amount > testament.amount) revert InsufficientBalance();

        testament.amount -= _amount;
        testament.lastActivity = block.timestamp;

        (bool success, ) = msg.sender.call{value: _amount}("");
        if (!success) revert TransferFailed();
        emit Withdrawn(msg.sender, _amount, testament.amount);
    }

    function ping() external {
        TestamentData storage testament = testaments[msg.sender];
        if (!testament.isActive) revert NoActiveTestament();
        testament.lastActivity = block.timestamp;
        emit Pinged(msg.sender, block.timestamp);
    }

    function claim(address _owner) external nonReentrant {
        TestamentData storage testament = testaments[_owner];
        if (!testament.isActive) revert NoActiveTestament();
        if (msg.sender != testament.beneficiary) revert NotAuthorized();
        
        uint256 timeSinceLastActivity = block.timestamp - testament.lastActivity;
        if (timeSinceLastActivity < testament.inactivityPeriod) revert InactivityPeriodNotElapsed();

        uint256 amount = testament.amount;
        address beneficiary = testament.beneficiary;

        testament.isActive = false;
        testament.amount = 0;

        if (amount > 0) {
            (bool success, ) = beneficiary.call{value: amount}("");
            if (!success) revert TransferFailed();
        }
        emit TestamentClaimed(beneficiary, _owner, amount);
    }

    function cancel() external nonReentrant {
        TestamentData storage testament = testaments[msg.sender];
        if (!testament.isActive) revert NoActiveTestament();

        uint256 refundAmount = testament.amount;
        testament.isActive = false;
        testament.amount = 0;

        if (refundAmount > 0) {
            (bool success, ) = msg.sender.call{value: refundAmount}("");
            if (!success) revert TransferFailed();
        }
        emit TestamentCancelled(msg.sender, refundAmount);
    }

    function getTestament(address _owner) external view returns (TestamentData memory) {
        return testaments[_owner];
    }

    function canBeClaimed(address _owner) external view returns (bool) {
        TestamentData memory testament = testaments[_owner];
        if (!testament.isActive) return false;
        uint256 timeSinceLastActivity = block.timestamp - testament.lastActivity;
        return timeSinceLastActivity >= testament.inactivityPeriod;
    }

    function timeUntilClaimable(address _owner) external view returns (uint256) {
        TestamentData memory testament = testaments[_owner];
        if (!testament.isActive) return 0;
        uint256 timeSinceLastActivity = block.timestamp - testament.lastActivity;
        if (timeSinceLastActivity >= testament.inactivityPeriod) return 0;
        return testament.inactivityPeriod - timeSinceLastActivity;
    }
}
```

## Adım 3: Compile Edin

1. Sol menüden "Solidity Compiler" (3. ikon) sekmesine tıklayın
2. Compiler version: `0.8.24` seçin
3. "Compile Testament.sol" butonuna tıklayın
4. ✅ Yeşil işaret görünmeli

## Adım 4: MetaMask'ı Monad Testnet'e Bağlayın

MetaMask'ta Monad Testnet ekleyin:
- **Network Name:** Monad Testnet
- **RPC URL:** https://testnet-rpc.monad.xyz/
- **Chain ID:** 10143
- **Currency Symbol:** MON
- **Block Explorer:** https://explorer.testnet.monad.xyz

## Adım 5: Deploy Edin

1. Sol menüden "Deploy & Run Transactions" (4. ikon) sekmesine tıklayın
2. **Environment:** "Injected Provider - MetaMask" seçin
3. MetaMask bağlandığında hesabınızı onaylayın
4. **Contract:** "Testament" seçili olmalı
5. 🟠 **"Deploy"** butonuna tıklayın
6. MetaMask'ta işlemi onaylayın
7. ⏳ Deploy işleminin tamamlanmasını bekleyin

## Adım 6: Contract Adresini Kopyalayın

1. Deploy edilen contract "Deployed Contracts" altında görünecek
2. Contract adresinin yanındaki 📋 kopyala ikonuna tıklayın
3. Adresi kaydedin

## Adım 7: Frontend'i Güncelleyin

Contract adresini şuraya yapıştırın:
- Dosya: `frontend/lib/contract.ts`
- Satır: ~5
- Değiştirin:
  ```typescript
  export const CONTRACT_ADDRESS = "0xYENI_CONTRACT_ADRESINIZ" as Address;
  ```

## ✅ Tamamlandı!

Artık frontend'inizde contract'la etkileşime geçebilirsiniz!

---

**Not:** Private key'iniz güvende. Remix deploy işlemini MetaMask üzerinden yapar, private key'i görüntülemez.
