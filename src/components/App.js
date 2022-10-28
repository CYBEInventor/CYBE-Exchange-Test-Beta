import { useEffect } from "react";
// import { ethers } from 'ethers';
// import TOKEN_ABI from '../abis/Token.json';
import { useDispatch } from "react-redux";
import config from "../config.json";
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  SubscribeToEvents,
  loadAllOrders,
} from "../store/interactions";

import Navbar from "./Navbar";
import Markets from "./Markets";
import Balance from "./Balance";
import Order from "./Order";
import OrderBook from "./OrderBook";
import PriceChart from "./PriceChart";
import Trades from "./Trades";
import Transactions from "./Transactions";
import Alert from "./Alert";

/*    OVERALL NOTES
  when the user isnt on the specific blockchain and connects their wallet, they are not prompt on the selection of blockchains.
  - ^ So i may need more coding overall for this issue. checking if they have metamask connected and on the available networks (beta V1)
  - In 'Transactions.js, Trades.js, Order.js, Navbar.js' make sure the right "img" is displayed for that token (beta V1)
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
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
    // console.log(window.ethereum)
    // if the user changes their account then the account displayed should change.
    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch);
      // I will possibly need to reload "loadBalances" as well. since when a user fills a order it doesnt update in anothe component
      // New Logic ^^ update the balances when a new order is submitted since it will be a successful order not a malfunctioning order
      // ^^^ before i thought about every true success order but thats still local to the user if THAT USER made the success order
    });
    // ^^ this is a bug so far because a user could not be logged in but the account was still displayed.
    // ^^^ FIXED
    // user is logged out when switch accounts through hot wallet ... not a big deal tho.

    // Token Smart Contract .. NOW MOVED TO REDUX: interactions.js, than reducers.js, than back here
    // const token = new ethers.Contract(config[chainId].Cybe.address, TOKEN_ABI, provider)
    // console.log(token.address);
    // const symbol = await token.symbol();
    // console.log(symbol);
    const Cybe = config[chainId].Cybe;
    const mETH = config[chainId].mETH;
    await loadTokens(provider, [Cybe.address, mETH.address], dispatch);

    // load exchange Contract
    // Load exchange smart contract
    const Exchangeconfig = config[chainId].exchange;
    const exchange = await loadExchange(
      provider,
      Exchangeconfig.address,
      dispatch
    );

    // Fetch all orders: open, filled, cancelled
    loadAllOrders(provider, exchange, dispatch);

    // Listen To Events
    // const [Deposit, Withdraw, Order, Cancel, Trade] = SubscribeToEvents(exchange, dispatch);
    // ^^ being placed here for a higher level
    // console.log(Trade)
    // if(Trade)
    //   console.log(Trade)
    // ^^ none of this stuff is working
    // ^^^ I still need to update balances when the global trade event triggers (For beta launch)
    SubscribeToEvents(exchange, dispatch);
  };

  useEffect(() => {
    loadblockchainData();
  });

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      <main className="exchange grid">
        <section className="exchange__section--left grid">
          {/* Markets */}
          <Markets />

          {/* Balance */}
          <Balance />

          {/* Order */}
          <Order />
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}
          <PriceChart />

          {/* Transactions */}
          <Transactions />

          {/* Trades */}
          <Trades />

          {/* OrderBook */}
          <OrderBook />
        </section>
      </main>
      {/* Alert */}
      <Alert />
    </div>
  );
}

export default App;
