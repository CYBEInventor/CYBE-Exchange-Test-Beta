import config from "../config.json";
import { useDispatch, useSelector } from "react-redux";
import { loadTokens } from "../store/interactions";

/*    NOTES
  - Define mutiple pairs (beta V1)
  - make sure you get real-world data through the front-end (beta V1)
*/

const Markets = () => {
  const chainId = useSelector((state) => state.provider.chainId);
  const provider = useSelector((state) => state.provider.connection);
  const dispatch = useDispatch();
  const marketHandler = async (e) => {
    loadTokens(provider, e.target.value.split(","), dispatch);
    // spliting this into indexes^^^ with the split method
  };
  return (
    <div className="component exchange__markets">
      <div className="component__header">
        <h2>Select Market</h2>
      </div>

      {chainId && config[chainId] ? (
        <select name="markets" id="markets" onChange={marketHandler}>
          <option
            value={`${config[chainId].Cybe.address},${config[chainId].mETH.address}`}
          >
            CYBE / mETH
          </option>
          <option
            value={`${config[chainId].Cybe.address},${config[chainId].mDAI.address}`}
          >
            CYBE / mDAI
          </option>
          {/*                          ^^^^^ no space causes a error ^^^^^^ */}
          {/* ^^^^^ This is where i can put multiple pairs by the networks chainId ^^^^^ */}
        </select>
      ) : (
        <div>
          <p>Not Deployed To Network</p>
        </div>
      )}
      <hr />
    </div>
  );
};

export default Markets;
