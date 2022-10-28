import { useSelector } from "react-redux";
import { useRef, useEffect } from "react";

import { myEventsSelector } from "../store/selectors";

import config from '../config.json';

/*    NOTES
  - This component will make the window not configure correctly when it acts as a pop up (FIXED)

*/

const Alert = () => {
    const alertRef = useRef(null);

    const network = useSelector(state => state.provider.network);
    const isPending = useSelector(state => state.exchange.transaction.isPending);
    const account = useSelector(state => state.provider.account);
    const isError = useSelector(state => state.exchange.transaction.isError);

    const events = useSelector(myEventsSelector);
    
    const removeHandler = async (e) => {
        alertRef.current.className = 'alert--remove'
    } 


    useEffect(() => {
        if((events[0] || isPending || isError) && account)
            alertRef.current.className = 'alert'
    }, [events, isPending, isError, account])

    return (
        <div className="alert--flex">
          {isPending ? (
            <div className="alert alert--remove" ref={alertRef} onClick={removeHandler}>
              <h1>Transaction Pending...</h1>
            </div>
          ) : isError ? (
            <div className="alert alert--remove" ref={alertRef} onClick={removeHandler}>
                <h1>Transaction Will Fail</h1>
            </div>
          ) : !isPending && events[0] ? (
            <div className="alert alert--remove" ref={alertRef} onClick={removeHandler}>
                <h1>Transaction Successful</h1>
                <a
                    href={config[network] ? `${config[network].explorerURL}/tx/${events[0].transactionHash}` : '#'}
                    target='_blank'
                    rel='noreferrer'
                >
                    {events[0].transactionHash.slice(0, 6) + '...' + events[0].transactionHash.slice(60, 66)}
                </a>
            </div>
          ) : (
              <div className="alert alert--remove" ref={alertRef} onClick={removeHandler}></div>
          )
          }
        
      </div>
      
    );
  }
  
  export default Alert;