import { useEffect, useState, useRef } from 'react';
import Cybe from '../assets/Temp-CYBE-Small.png';
// import Cybe from '../assets/dapp.svg';
// import Cybe from '../assets/Cybe.svg';
import eth from '../assets/eth.svg';
import { useDispatch, useSelector } from 'react-redux';
import { loadBalances, transferTokens } from '../store/interactions';

/*      NOTES
    The front end crashes when changing markets (Becuse of options that arent ready)
    - I need to make sure the balances are updates when a successful order (beta V1)
*/

const Balance = () => {
const dispatch = useDispatch();
const [isDeposit, setIsDeposit] = useState(true);
const [token1TransferAmount, setToken1TransferAmount] = useState(0);
const [token2TransferAmount, setToken2TransferAmount] = useState(0);

const symbols = useSelector(state => state.tokens.symbols);
const exchange = useSelector(state => state.exchange.contract);
const tokens = useSelector(state => state.tokens.contracts);
const account = useSelector(state => state.provider.account);
const tokenBalances = useSelector(state => state.tokens.balances);
const exchangenBalances = useSelector(state => state.exchange.balances);
const transferInProgress = useSelector(state => state.exchange.transferInProgress);
const provider = useSelector(state => state.provider.connection);
// const isSuccessful = useSelector(state => state.exchange.transaction.isSUccessful);

    const depositRef = useRef(null);
    const withdrawRef = useRef(null);

const tabHandler = (e) => {
    if(e.target.className !== depositRef.current.className){
        e.target.className = 'tab tab--active';
        // ^^ the withdraw
        depositRef.current.className = 'tab';
        setIsDeposit(false);
    } else {
        e.target.className = 'tab tab--active';
        // ^^ the deposit
        withdrawRef.current.className = 'tab';
        setIsDeposit(true);
    }
}

const amountHandler = (e, token) => {
    if (token.address === tokens[0].address){
        setToken1TransferAmount(e.target.value);
    } else {
        setToken2TransferAmount(e.target.value);
    }
}

/*          FURTHER NOTES ON AMOUNT AND DEPOSIT HANDLING
    [x] Step 1: Do Transfer
    [x] Step 2: Notify app that transfer is pending .. not fully done yet (presentation.. 8/24/2022)
    [x] Step 3: Get confirmation from blockchain that transfer was successful
    [x] Step 4: Notify app that transfer was successful
    [x] Step 5: Handle transfer fails - notify app
*/

const depositHandler = (e, token) => {
    e.preventDefault()
    if (token.address === tokens[0].address){
      transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch)
      setToken1TransferAmount(0);
    } else {
        transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount, dispatch);
        setToken2TransferAmount(0);
    }
}
// if a uncaught error of message "[ethjs-query] while formatting outputs from RPC" happens, reset the account being used.

const withdrawHandler = (e, token) => {
    e.preventDefault()
    if (token.address === tokens[0].address){
      transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount, dispatch)
      setToken1TransferAmount(0);
    } else {
        transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount, dispatch);
        setToken2TransferAmount(0);
    }
    // console.log("withdrawing tokens")
}

useEffect(() => {
    if(exchange && tokens[0] && tokens[1] && account){
        loadBalances(exchange, tokens, account, dispatch);
        //      ^^^^ getting everything with slices to the store (useSelector)
    }
}, [exchange, tokens, account, transferInProgress, dispatch]);
useEffect(() => {
  // if(AllEvents){
  //   console.log("A trade happened")
  // }
  // AllEvents.filter((z) => {
  //   if(z.event == 'Trade'){
  //     console.log("A trade happened")
  //   }
  // })
  
}, [])
    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
            <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (DApp) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={Cybe} alt="Token Logo" />{symbols && symbols[0]}</p>
            <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
            <p><small>Exchange</small><br />{exchangenBalances && exchangenBalances[0]}</p>
          </div>
  
          <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[0]) : (e) => withdrawHandler(e, tokens[0])}>
            <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
            <input 
            type="text" 
            id='token0' 
            placeholder='0.0000' 
            value={token1TransferAmount === 0 ? '' : token1TransferAmount} 
            onChange={(e) => amountHandler(e, tokens[0])}/>
  
            <button className='button' type='submit'>
                {isDeposit ? 
                    <span>Deposit</span> 
                            : 
                    <span>Withdraw</span>
                }
              
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (mETH) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={eth} alt="Token Logo" />{symbols && symbols[1]}</p>
            <p><small>Wallet</small><br />{tokenBalances && tokenBalances[1]}</p>
            <p><small>Exchange</small><br />{exchangenBalances && exchangenBalances[1]}</p>
          </div>
                    {/* START HERE ... LOGIC ERROR HERE */}
          <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[1]) : (e) => withdrawHandler(e, tokens[1])}>
          <label htmlFor="token1">{symbols && symbols[1]} Amount</label>
            <input 
            type="text" 
            id='token1' 
            placeholder='0.0000' 
            value={token2TransferAmount === 0 ? '' : token2TransferAmount} 
            onChange={(e) => amountHandler(e, tokens[1])}/>
  
            <button className='button' type='submit'>
            {isDeposit ? 
                    <span>Deposit</span> 
                            : 
                    <span>Withdraw</span>
                }
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;