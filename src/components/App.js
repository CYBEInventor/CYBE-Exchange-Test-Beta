import { useEffect } from "react";
import { ethers } from 'ethers';
import TOKEN_ABI from '../abis/Token.json';
import "../App.css";
import config from '../config.json';

function App() {

  const loadblockchainData = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    console.log(accounts[0]);

    // Connect Ethers to blockchain .. connect to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const network = await provider.getNetwork();
    // console.log(network.chainId)
    //  OR
    const { chainId } = await provider.getNetwork();
    console.log(chainId)

    console.log()
    
    // Token Smart Cotract
    const token = new ethers.Contract(config[chainId].Dapp.address, TOKEN_ABI, provider)
    console.log(token.address);
    const symbol = await token.symbol();
    // ERROR HERE NOT GETTING THE SYMBOL.. mainly because im calling a address that isnt a contract
    console.log(symbol);
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
