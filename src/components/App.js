import { useEffect } from "react";
// import { ethers } from 'ethers';
// import TOKEN_ABI from '../abis/Token.json';
import { useDispatch } from 'react-redux'
import config from '../config.json';
import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens,
  loadExchange,
  SubscribeToEvents,
  loadAllOrders
} from '../store/interactions';

import Navbar from "./Navbar";
import Markets from "./Markets";
import Balance from "./Balance";
import Order from "./Order";
import OrderBook from "./OrderBook";

/*    OVERALL NOTES
  when the user isnt on the specific blockchain and connects their wallet, they are not prompt on the selection of blockchains.
*/

function App() {
const dispatch = useDispatch();

  const loadblockchainData = async () => {
    // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    // console.log(accounts[0]);
    // MOVED ACCOUNTS OVER TO INTERACTIONS
    // const account = await loadAccount(dispatch);
    // console.log(account)
    // Connect Ethers to blockchain .. connect to blockchain
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // dispatch({ type: 'PROVIDER_LOADED', connection: provider })
    // MOVED PROVIDER OVER TO INTERACTIONS.JS
    const provider = loadProvider(dispatch);
    // const network = await provider.getNetwork();
    // console.log(network.chainId)
    //  OR
    // const { chainId } = await provider.getNetwork();
    // console.log(chainId)
    // MOVED CHAINID OVER TO INTERACTIONS.JS
    // Fetch current netowork's chainId (e.g. hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch);
    //  Fetch current account & balance from Metamask
    // await loadAccount(provider, dispatch);

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    })

    // if the user changes their account then the account displayed should change.
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch);
    });
    // ^^ this is a bug so far because a user could not be logged in but the account was still displayed.
    // ^^^ FIXED
    // user is logged out when switch accounts through hot wallet ... not a big deal tho.

    // Token Smart Contract .. NOW MOVED TO REDUX: interactions.js, than reducers.js, than back here
    // const token = new ethers.Contract(config[chainId].Dapp.address, TOKEN_ABI, provider)
    // console.log(token.address);
    // const symbol = await token.symbol();
    // console.log(symbol);
    const Dapp = config[chainId].Dapp;
    const mETH = config[chainId].mETH;
    await loadTokens(provider, [Dapp.address, mETH.address], dispatch);

    // load exchange Contract
    // Load exchange smart contract
    const Exchangeconfig = config[chainId].exchange
    const exchange = await loadExchange(provider, Exchangeconfig.address, dispatch);

    // Fetch all orders: open, filled, cancelled
    loadAllOrders(provider, exchange, dispatch);

    // Listen To Events
    SubscribeToEvents(exchange, dispatch);
    // ^^ being placed here for a higher level use
  }

  useEffect(() => {
    loadblockchainData();
  })

  return (
    <div>

      {/* Navbar */}
      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}
          <Markets />

          {/* Balance */}
          <Balance />

          {/* Order */}
          <Order />

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
          <OrderBook />

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
