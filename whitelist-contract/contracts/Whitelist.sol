// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Whitelist {

    // max number of address which can be whitelisted
    uint8 public maxWhitelistedAddress;

    // to keep track of number of addresses whitelisted till now
    uint8 public numAddressesWhitelisted;

    constructor(uint8 _maxWhitelistedAddress){
        maxWhitelistedAddress= _maxWhitelistedAddress;
    }

    mapping(address => bool) public whitelistedAddresses;

    function addAddressToWhitelist() public {
        require(!whitelistedAddresses[msg.sender],"You are already whitelisted");
        require(numAddressesWhitelisted < maxWhitelistedAddress,"Maximum number reached");
        whitelistedAddresses[msg.sender]=true;
        numAddressesWhitelisted++;
    }
}
