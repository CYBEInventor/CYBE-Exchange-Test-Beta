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
    mapping(address => mapping(address => uint256)) public allowance;
    // Send Tokens
    event Transfer(
        address indexed from, 
        address indexed to, 
        uint256 value
    );

    event Approval(
        address indexed owner, 
        address indexed spender, 
        uint256 value
    );

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _totalSupply){
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
        //      ^^^ update balance by messager address
    }

    function transfer(address _to, uint256 _value) 
        public returns (bool success){
        // Require that sender has enough tokens to spend
        require(balanceOf[msg.sender] >= _value);
       
       _transfer(msg.sender, _to, _value);
        
        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) 
        internal {
         require(_to != address(0));

        // Deduct tokens from spender 
        balanceOf[_from] = balanceOf[_from] - _value;
        // Credit tokens to receiver
        balanceOf[_to] = balanceOf[_to] + _value;

        // Emit Event
        emit Transfer(_from, _to, _value); 
    }

    function approve(address _spender, uint256 _value) 
        public returns(bool success){
             require(_spender != address(0));
            allowance[msg.sender][_spender] = _value;
            emit Approval(msg.sender, _spender, _value);
            return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) 
        public returns (bool success) {
            // Check approval
            require(_value <= balanceOf[_from]);
            require(_value <= allowance[_from][msg.sender]);
            // Reset Allowance 
            allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;
            // Spend tokens
            _transfer(_from, _to, _value);
            return true;
    }
}
