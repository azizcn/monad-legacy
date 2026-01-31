// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LegacyToken is ERC20, Ownable {
    constructor() ERC20("Legacy Token", "LGCY") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    // Faucet for testing
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
