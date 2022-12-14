import logo from '../assets/Temporary-CYBE-Logo.png';
// import logo from '../assets/logo.png';
import eth from '../assets/eth.svg';
import { useSelector, useDispatch } from 'react-redux';
import Blockies from 'react-blockies';
import { loadAccount } from '../store/interactions';
import config from '../config.json';

/*    NOTES
  - Take away the "LocalHost" option in the official beta (beta V1)
  - Get the users current hot wallet image if they have one to replace the Blockies component (beta V1)
*/

const Navbar = () => {
    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);
    const account = useSelector(state => state.provider.account);
    const balance = useSelector(state => state.provider.balance);

    const dispatch = useDispatch();
    
    const connectHandler = async () => {
        await loadAccount(provider, dispatch);
        // possibly a sound effect here.
    }

    const networkHandler = async (e) => {
       console.log(e.target.value); 
       await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: e.target.value }]
       })
    }
    return(
      <div className='exchange__header grid'>
        {/* ^^^ This Attribute has to be "className" instead of "class" for React since its a name clash */}
        <div className='exchange__header--brand flex'>
            <img src={logo} className='logo' alt='Dapp Logo'></img>
           <h1>Cybe Token Exchange</h1>
        </div>
  
        <div className='exchange__header--networks flex'>
          <img src={eth} alt='ETH logo' className='Eth Logo' />

          {chainId && (
          <select name='networks' id='networks' value={config[chainId] ? `0x${chainId.toString(16)}` : `0`} onChange={networkHandler}>
             <option value="0" disabled>Select Network</option>
             <option value="0x7A69" >Localhost</option>
             <option value="0x5" >Goerli</option>
          </select>
          )}
        </div>

  
        <div className='exchange__header--account flex'>
           {balance ? <p><small>My Balance</small>{Number(balance).toFixed(4)}</p> 
           : <p><small>My Balance</small>0 ETH</p>}
           {account ?
           <a href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`} 
           target='_blank'
           rel='noreferrer'>
            {account.slice(0,5) + '...' + account.slice(38, 42)} 
            <Blockies
              seed={account}
              className='identicon'
              size={10}
              scale={3}
              color="#2187D0"
              bgColor="F1F2F9"
              spotColor='#767F92'
           /> 
            </a>
           : <button className='button' onClick={connectHandler}>Connect</button>
           }
        </div>
      </div>
    )
  }
  
  export default Navbar;