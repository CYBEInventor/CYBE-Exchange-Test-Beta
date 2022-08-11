// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import this file to use console.log
import "hardhat/console.sol";

contract Token {
    string public name; // a type of state variable
    string public symbol;
    // Decimals .. 18 decimals
    uint256 public decimals = 18;
    // Total Supply
    uint256 public totalSupply;

    // Track Balances
    mapping(address => uint256) public balanceOf;
    // mapping is a data structure to allow me to store info as a key value pair
    // Send Tokens

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply){
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
        //      ^^^ update balance by messager address
    }
}
