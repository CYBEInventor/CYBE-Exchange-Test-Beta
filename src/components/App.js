import { useEffect } from "react";
// import { ethers } from 'ethers';
// import TOKEN_ABI from '../abis/Token.json';
import { useDispatch } from 'react-redux'
import config from '../config.json';
import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadToken
} from '../store/interactions';

function App() {
const dispatch = useDispatch();

  const loadblockchainData = async () => {
    // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    // console.log(accounts[0]);
    // MOVED ACCOUNTS OVER TO INTERACTIONS
    const account = await loadAccount(dispatch);
    console.log(account)
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
    const chainId = await loadNetwork(provider, dispatch);

    // Token Smart Contract .. NOW MOVED TO REDUX: interactions.js, than reducers.js, than back here
    // const token = new ethers.Contract(config[chainId].Dapp.address, TOKEN_ABI, provider)
    // console.log(token.address);
    // const symbol = await token.symbol();
    // console.log(symbol);
    await loadToken(provider, config[chainId].Dapp.address, dispatch);
  }

  useEffect(() => {
    loadblockchainData();
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
