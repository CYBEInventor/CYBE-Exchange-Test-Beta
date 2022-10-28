import { useSelector } from 'react-redux';

import Banner from './Banner';
import Chart from 'react-apexcharts';

import { options, defaultSeries, series } from './PriceChart.config';
import { priceChartSelector } from '../store/selectors';

import arrowDown from '../assets/down-arrow.svg';
import arrowUp from '../assets/up-arrow.svg';

/*    NOTES
  - Improve the Price Chart since by my opinon its hard to conrtrol and see any trades (DONE)
  - Most likely going to change the chart. Maybe trading view (Beta V1)
*/

const PriceChart = () => {
    const account = useSelector(state => state.provider.account);
    const symbols = useSelector(state => state.tokens.symbols);
    const chainId = useSelector(state => state.provider.chainId);
    const priceChart = useSelector(priceChartSelector);
    console.log(symbols.length)
    return (
      <div className="component exchange__chart">
        <div className='component__header flex-between'>
          <div className='flex'>
            {symbols.length !== 0 ? 
              <h2>{symbols && `${symbols[0]}/${symbols[1]}`}</h2>
            :<h3>🤷🏿‍♀️ There Isn't Any Data For This Network Yet 🤷🏿</h3>}
            {priceChart && (
                <div className='flex'>
                {priceChart.lastPriceChange === '+' ? (
                    <img src={arrowUp} alt="Arrow up" />
                ) : (
                    <img src={arrowDown} alt="Arrow down" />
                )}
                <span className='up'>{priceChart.lastPrice}</span>
            </div>
            )}

          </div>
        </div>
  
        {/* Price chart goes here */}
        {!account ? (
            <Banner text={"Please Connect Metamask"}/>
        ) : (
            <Chart
             type="candlestick"
             options={options}
            //  series={series} //testing data
             series={priceChart ? priceChart.series : defaultSeries}
             width="100%"
             height="100%"
            />
        )}
  
      </div>
    );
  }
  
  export default PriceChart;