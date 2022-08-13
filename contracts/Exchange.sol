// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import this file to use console.log
import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    // Your fee account that you control
    address public feeAccount;
    uint256 public feePercent;
    mapping(address => mapping(address => uint256)) public tokens;
    // Orders Mapping
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCancelled; // true or false (boolean / bool)
    mapping(uint256 => bool) public orderFilled; // true or false (boolean / bool)

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    event Order (
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    event Cancel (
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

      event Trade (
        uint256 id,
        address user, 
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address creator,
        uint256 timestamp
    );
    
    // in a way, its treated as a generic database
    struct _Order { 
        // Attributes of an order
        uint256 id; // Unique identifier for order
        address user; // User who made order
        address tokenGet; // Address of the token they receive
        uint256 amountGet; //Amount they receive
        address tokenGive; // Address of token they give
        uint256 amountGive; // Amount they give
        uint256 timestamp; // When order was created
    }

    constructor(address _feeAccount, uint256 _feePercent){
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // -------------
    // DEPOSIT & WITHDRAW TOKEN
    // Deposit Tokens
    function depositToken(address _token, uint256 _amount) public {
        // Transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        // "address(this)" is how you get the current address of the current smart contract
        // Update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount; 
        //     ^^^ token level ^^ user level
        // Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        // Transfer tokens to user
        require(tokens[_token][msg.sender] >= _amount);
        
        // Transfer tokens to user
        require(Token(_token).transfer(msg.sender, _amount));
        // Update user balance
         tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount; 
        // Emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Check Balances
    function balanceOf(address _token, address _user) public view 
        returns (uint256){
            return tokens[_token][_user];
    }

    // ---------------
    // MAKE & CANCEL ORDERS
    // Token Give (the token they want to spend) - which token, and how much?
    // token Get (the token they want to receive) - which token, and how much?
    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        // Token Give (the token they want to spend) - which token, and how much?
        // token Get (the token they want to receive) - which token, and how much?
        // Require token balance .. Prevent orders if tokens aren't on exchange
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive);
        // Instantiate a new order
        // orderCount = orderCount + 1;
        //  OR
        orderCount++;

        orders[orderCount] = _Order(
            orderCount, //id - 1, 2, 3 ...
            msg.sender, // user
            _tokenGet, // tokenGet
            _amountGet, // amountGet
            _tokenGive, // tokenGive
            _amountGive, // amountGive
            block.timestamp // timestamp .. 1893507958
        );

            // Emit event
        emit Order(
            orderCount, //id - 1, 2, 3 ...
            msg.sender, // user
            _tokenGet, // tokenGet
            _amountGet, // amountGet
            _tokenGive, // tokenGive
            _amountGive, // amountGive
            block.timestamp // timestamp .. 1893507958
        );
    }

    function cancelOrder(uint256 _id) public {
        // Fetch Order
        _Order storage _order = orders[_id];
        // Ensure the caller of the function is the owner of the owner
        require(address(_order.user) == msg.sender);

        // Order must exist
        require(_order.id == _id);

        // Cancel the order
        orderCancelled[_id] = true;

        // Emit event
        emit Cancel(
            _order.id, //id - 1, 2, 3 ...
            msg.sender, // user
            _order.tokenGet, // tokenGet
            _order.amountGet, // amountGet
            _order.tokenGive, // tokenGive
            _order.amountGive, // amountGive
            block.timestamp // timestamp .. 1893507958
        );
    }

    function fillOrder(uint256 _id) public {
        // 1. Must be valid orderId
        require(_id > 0 && _id <= orderCount, "Order does not exist");
        // 2. Order cant be filled
        require(!orderFilled[_id]);
        // 3. Order cant be cancelled
        require(!orderCancelled[_id]);

        // Fetch Order
        _Order storage _order = orders[_id];

        // Swap Tokens (Trading) .. Execute the trade
        _trade(_order.id, 
        _order.user, 
        _order.tokenGet, 
        _order.amountGet, 
        _order.tokenGive, 
        _order.amountGive);

        // Mark order as filled
        orderFilled[_order.id] = true;
    }

    function _trade(
    uint256 _orderId, 
    address _user, 
    address _tokenGet,
    uint256 _amountGet,
    address _tokenGive,
    uint256 _amountGive 
    ) internal {
        // Fee is paid by the user who filled the order (msg.sender)
        // Fee is deducted from _amountGet
        uint256 _feeAmount = (_amountGet * feePercent) /100;
        // cant multiple by fractions in solidity 

        // Do trade here ...
        // from sender
        tokens[_tokenGet][msg.sender] = 
            tokens[_tokenGet][msg.sender] - 
            (_amountGet + _feeAmount);
        
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;

        // Charge fees
        tokens[_tokenGet][feeAccount] = 
            tokens[_tokenGet][feeAccount] + 
            _feeAmount;
        //                  ^^^ fee account will be my account

        // from user 
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;
        tokens[_tokenGive][msg.sender] = 
            tokens[_tokenGive][msg.sender] + 
            _amountGive;

        emit Trade(
            _orderId, //id - 1, 2, 3 ...
            msg.sender, // user
            _tokenGet, // tokenGet
            _amountGet, // amountGet
            _tokenGive, // tokenGive
            _amountGive, // amountGive
            _user,
            block.timestamp // timestamp .. 1893507958
        );
    }
}
