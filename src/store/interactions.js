import { ethers } from "ethers";
import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exchange.json';
// import { exchange } from "./reducers";
// import { provider } from "./reducers";

/*      NOTES
    - I will use the SubscribeToEvents to look at all events fromt the exchange (DONE)
*/

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({ type: 'PROVIDER_LOADED', connection });
    // ^^ blockchain connection
    return connection;
};

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork();
    dispatch({ type: 'NETWORK_LOADED', chainId});

    return chainId;
};

export const loadAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0]);
    //                                         ^^^^ from localhost node in testing
    dispatch({ type: 'ACCOUNT_LOADED', account });
    // ^^ in providers reducer
    let balance = await provider.getBalance(account);
    balance = ethers.utils.formatEther(balance);
    dispatch({ type: 'ETHER_BALANCE_LOADED', balance});
    // ^^ in providers reducer

    return account;
    // ^^^ what you mainly need out of the function
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol;
    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
    symbol = await token.symbol();
    dispatch({ type: 'TOKEN_1_LOADED', token, symbol });
   
    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
    symbol = await token.symbol();
    dispatch({ type: 'TOKEN_2_LOADED', token, symbol });

    return token;
}

export const loadExchange = async(provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
    dispatch({ type: 'EXCHANGE_LOADED', exchange });

    return exchange
}

// Subscribe To Events
export const SubscribeToEvents = (exchange, dispatch) => {
    // let Deposit = false, Withdraw = false, Order = false, Cancel = false, Trade = false;
    // ^^ not working
    exchange.on('Deposit', (token, user ,amount ,balance, event) => {
    // [] Step 4: Notify app that transfer was successful
        dispatch({ type: 'TRANSFER_SUCCESS', event })
        console.log("Deposit Went Off")
        // Deposit = true;
        // ^^ not working
    });

    exchange.on('Withdraw', (token, user ,amount ,balance, event) => {
    // [] Step 4: Notify app that transfer was successful
        dispatch({ type: 'TRANSFER_SUCCESS', event })
        console.log("Withdraw Went Off")
        // Withdraw = true;
        // ^^ not working
    });
    
    exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args;
        dispatch({ type: 'NEW_ORDER_SUCCESS', order, event })
        console.log("Order Went Off")
        // Order = true;
        // ^^ not working
    });

    exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args;
        dispatch({ type: 'ORDER_CANCEL_SUCCESS', order, event })
        console.log("Cancel Went Off")
        // Cancel = true;
        // ^^ not working
    });

    exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp, event) => {
        const order = event.args;
        dispatch({ type: 'ORDER_FILL_SUCCESS', order, event })
        console.log("Trades Went Off")
        // Trade = true;
        // ^^ not working
    });
    // return [Deposit, Withdraw, Order, Cancel, Trade]
}

// LOAD USER BALANCES (WALLET & EXCHANGE BALANCES)
export const loadBalances = async(exchange, tokens, account, dispatch) => {
    // const balance = await tokens[0].balanceOf(account);
    // balance = ethers.utils.formatUnits(balance, 18)
    // ^^^ two lines
    let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18);
    dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance });

    // await exchange.balanceOf(tokens[0].address, account);
    // ^^^ reformatting
    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
    dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance });

    balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18);
    dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance });

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
    dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance });
}

// LOAD ALL ORDERS
export const loadAllOrders = async (provider, exchange, dispatch) => {
    const block = await provider.getBlockNumber();

    // Fetch cancelled orders
    const cancelStream = await exchange.queryFilter('Cancel', 0, block)
    const cancelledOrders = cancelStream.map(event => event.args)

    dispatch({ type: 'CANCELLED_ORDERS_LOADED', cancelledOrders });

    // Fetch filled orders
    const tradeStream = await exchange.queryFilter('Trade', 0, block);
    const filledOrders = tradeStream.map(event => event.args);

    dispatch({ type: 'FILLED_ORDERS_LOADED', filledOrders })

    // Fetch All Orders .. second parameter could be from the block creation timestamp
    const orderStream = await exchange.queryFilter('Order', 0, block);
    const allOrders = orderStream.map(event => event.args);

    dispatch({ type: 'ALL_ORDERS_LOADED', allOrders });
}

// TRANSFER TOKENS (DEPOSIT & WITHDRAWS)
export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
    let transaction;
    dispatch({ type: 'TRANSFER_REQUEST' });
    try {
    const signer = await provider.getSigner()
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);
    if(transferType === 'Deposit'){
        transaction = await token.connect(signer).approve(exchange.address, amountToTransfer);
        await transaction.wait()
        transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer);
    } else {
        transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer);
    }
    
    await transaction.wait()
} catch(error){
    dispatch({ type: 'TRANSFER_FAIL' });
}
}

// ORDERS (BUY & SELL)
export const makeBuyOrder = async (provider, exchange, tokens, order, dispatch) => {
    /* address _tokenGet, 
       uint256 _amountGet, 
       address _tokenGive, 
       uint256 _amountGive (OrderAmount * OrderPrice)

                        -->NOTES<--
            - In hardhat, there is an error when having multiple instance of the same object which conflict with redux. 
            (This will probably be fixed in later versions)

            - Also so far from 23. Make order i can make order while not logged in.. (potential error overall error course wise)
            - Depending on fan feedback, i will make sell/buy orders where you have to be connected or show the alert functionality correctly
    */

        const tokenGet = tokens[0].address;
        const amountGet = ethers.utils.parseUnits(order.amount, 18);
        const tokenGive = tokens[1].address;
        const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18);

        dispatch({ type: 'NEW_ORDER_REQUEST' });
        try{
            const signer = await provider.getSigner();
            const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive);
            await transaction.wait();
        } catch(error){
            dispatch({ type: 'NEW_ORDER_FAIL' });
        }
        // subscribe to emit function (IS IN "loadExchange" since its being loaded everytime something changes)


}

export const makeSellOrder = async (provider, exchange, tokens, order, dispatch) => {
    /* address _tokenGet, 
       uint256 _amountGet, 
       address _tokenGive, 
       uint256 _amountGive (OrderAmount * OrderPrice)

                        -->NOTES<--
            - In hardhat, there is an error when having multiple instance of the same object which conflict with redux. 
            (This will probably be fixed in later versions)

            - Also so far from 23. Make order i can make order while the wallet is not connected.. (potential error overall error course wise)
            - its janky, because a few times the wallet wouldn't be notified of a transaction... 10/19/2022
            - Depending on fan feedback, i will make sell/buy orders where you have to be connected or show the alert functionality correctly
    */

        const tokenGet = tokens[1].address;
        const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18);
        const tokenGive = tokens[0].address;
        const amountGive = ethers.utils.parseUnits(order.amount, 18);

        dispatch({ type: 'NEW_ORDER_REQUEST' });
        try{
            const signer = await provider.getSigner();
            const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive);
            await transaction.wait();
        } catch(error){
            dispatch({ type: 'NEW_ORDER_FAIL' });
        }
        // subscribe to emit function (IS IN "loadExchange" since its being loaded everytime something changes)


}

// --------------------------------------------------------------------------
// CANCEL ORDER
export const cancelOrder = async (provider, exchange, order, dispatch) => {

    dispatch({ type: 'ORDER_CANCEL_REQUEST' });
        try{
            const signer = await provider.getSigner();
            const transaction = await exchange.connect(signer).cancelOrder(order.id)
            await transaction.wait();
        } catch(error){
            dispatch({ type: 'ORDER_CANCEL_FAIL' });
        }
}

// --------------------------------------------------------------------------
// FILL ORDER
export const fillOrder = async (provider, exchange, order, dispatch) => {

    dispatch({ type: 'ORDER_FILL_REQUEST' });
        try{
            const signer = await provider.getSigner();
            const transaction = await exchange.connect(signer).fillOrder(order.id)
            await transaction.wait();
        } catch(error){
            dispatch({ type: 'ORDER_FILL_FAIL' });
        }
}