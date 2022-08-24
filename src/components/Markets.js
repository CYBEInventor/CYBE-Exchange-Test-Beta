import config from '../config.json';
import { useDispatch, useSelector } from 'react-redux';
import { loadTokens } from '../store/interactions';
const Markets = () => {
    const chainId = useSelector(state => state.provider.chainId);
    const provider = useSelector(state => state.provider.connection);
    const dispatch = useDispatch();
    const marketHandler = async (e) => {
        loadTokens(provider, (e.target.value).split(','), dispatch);
        // spliting this into indexes^^^ with the split method
    }
    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Select Market</h2>
        </div>

        {chainId && config[chainId] ? 
            <select name="markets" id="markets" onChange={marketHandler}>
                <option value={`${config[chainId].Dapp.address},${config[chainId].mETH.address}`}>Dapp / mETH</option>
                <option value={`${config[chainId].Dapp.address},${config[chainId].mDAI.address}`}>Dapp / mDAI</option>
                {/*                          ^^^^^ no space causes a error ^^^^^^ */}
            </select>
        : <div><p>Not Deployed To Network</p></div> }
        <hr />
      </div>
    )
  }
  
  export default Markets;