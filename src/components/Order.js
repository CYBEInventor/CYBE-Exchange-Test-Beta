import { useState, useRef } from "react";
import { makeBuyOrder, makeSellOrder } from "../store/interactions";
import { useSelector, useDispatch } from "react-redux";

/*         NOTES
8/26/2022 - getting errors will continue tomorrow
    KEEP GOING FOR TRUE PEACE
10/19/2022 - when a user doesnt have their wallet connected and they attempt a buy/sell order, it gets a litttle janky 
*/

const Order = () => {
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0);
    const [IsBuy, setIsBuy] = useState(true);
    const buyRef = useRef(null);
    const sellRef = useRef(null);

    const exchange = useSelector(state => state.exchange.contract);
    const tokens = useSelector(state => state.tokens.contracts);
    const provider = useSelector(state => state.provider.connection);

    const dispatch = useDispatch();

    const tabHandler = (e) => {
        if(e.target.className !== buyRef.current.className){
            e.target.className = 'tab tab--active';
            buyRef.current.className = 'tab';
            setIsBuy(false);
        } else {
            e.target.className = 'tab tab--active';
            sellRef.current.className = 'tab';
            setIsBuy(true);
        }
    } 
    const buyHandler = (e) => {
        e.preventDefault();
        console.log('buy handler '+e)
        makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch)
        setAmount(0);
        setPrice(0);
    } 

    const sellHandler = (e) => {
        e.preventDefault();
        console.log('sell handler '+e)
        makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch)
        setAmount(0);
        setPrice(0);
    } 

    return (
      <div className="component exchange__orders">
        <div className='component__header flex-between'>
          <h2>New Order</h2>
          <div className='tabs'>
            <button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
            <button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>
          </div>
        </div>
  
        <form onSubmit={IsBuy ? buyHandler : sellHandler}>
            {IsBuy ? (
                <label htmlFor="amount">Buy Amount</label>
                ) : (
                    <label htmlFor="amount">Sell Amount</label>
                )}
          <input 
            type="text" 
            id='amount' 
            placeholder='0.0000' 
            onChange={(e) => setAmount(e.target.value)}
            value={amount === 0 ? '' : amount} 
        />
          {IsBuy ? (
                <label htmlFor="price">Buy Price</label>
                ) : (
                    <label htmlFor="price">Sell Price</label>
                )} 
          <input 
            type="text" 
            id='price' 
            placeholder='0.0000' 
            onChange={(e) => setPrice(e.target.value)}
            value={price === 0 ? '' : price} 
        />
  
          <button className='button button--filled' type='submit'>
                {IsBuy ? (
                <span>Buy Order</span>
                ) : (
                    <span>Sell Order</span>
                )}
          </button>
        </form>
      </div>
    );
  }
  
  export default Order;