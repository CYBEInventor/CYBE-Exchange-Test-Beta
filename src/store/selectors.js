import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy, minBy } from "lodash";
import { ethers } from "ethers";
import moment from "moment";

/*      NOTES
    - 
*/

const tokens = state => get(state, 'tokens.contracts');
const account = state => get(state, 'provider.account');
const allOrders = state => get(state, 'exchange.allOrders.data', []);
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', []);
const filledOrders = state => get(state, 'exchange.filledOrders.data', []);
const GREEN = '#25CE8F';
const RED = '#F45353';
const events = state => get(state, 'exchange.events')
// ^^ getting all events from state ^^
const openOrders = state => {
    const all = allOrders(state);
    const filled = filledOrders(state);
    const cancelled = cancelledOrders(state);
    
    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.id.toString() === order.id.toString());
        const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString());
        return (orderFilled || orderCancelled)
    })

    return openOrders
}

// --------------------------------------------------------------------------
// MY EVENTS
export const myEventsSelector = createSelector(account, events, (account, events) => {
    events = events.filter((e) => e.args.user === account)
    // console.log(events)
    return events
})

// --------------------------------------------------------------------------
// ALL EVENTS - ALL EVENTS IS IN THE "interactions.js" file

// --------------------------------------------------------------------------
// MY OPEN ORDERS
export const myOpenOrdersSelector = createSelector(account, tokens, openOrders, (account, tokens, orders) => {
    if(!tokens[0] || !tokens[1]) { return }

    // Filter orders created by current account
    orders = orders.filter((o) => o.user === account)

    // Filter orders by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    orders = decorateMyOpenOrders(orders, tokens)

    // Sort orders by date ascending to compare history
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    // console.log(orders)

    return orders
})

const decorateMyOpenOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyOpenOrder(order, tokens)
            return(order)
        })
    )
}

const decorateMyOpenOrder = (order, tokens) => {
    let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';

    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED)
    })
}

const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount;

    // NOTE: Dapp should be considered token0, mETH is considered token1
    // Example: Giving mETH in exchange for Dapp
    if (order.tokenGive === tokens[1].address) {
        token0Amount = order.amountGive // The amount of Dapp we are giving
        token1Amount = order.amountGet // The amount of mETH we want...
    } else {
        token0Amount = order.amountGet // The amount of Dapp we want
        token1Amount = order.amountGive //The amount of mETH we are giving...
    }

    const precision = 100000;
    let tokenPrice = (token1Amount / token0Amount);
    tokenPrice = Math.round(tokenPrice * precision) / precision;

    return ({
        ...order,
        foo: 'MANG',
        token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
        token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
        tokenPrice: tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

// --------------------------------------------------------------------------
// ALL FILLED ORDERS
export const filledOrdersSelector = createSelector(filledOrders, tokens, (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }

    // Filter orders by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // [x] Step 1: sort orders by time ascending
    // [x] Step 2: apply order colors (decorate orders)
    // [x] Step 3: sort orders by time descending for UI

    // Sort orders by date ascending to compare history
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    // Decorate the orders
    orders = decorateFilledOrders(orders, tokens)

    // Sort orders by date ascending to compare history
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    // console.log(orders)

    return orders;
})

const decorateFilledOrders = (orders, tokens) => {
    // Track previous order to compare history
    let previousOrder = orders[0]

    return(
        orders.map((order) => {
        // decorate each individual order
        order = decorateOrder(order, tokens)
        order = decorateFilledOrder(order, previousOrder)
        previousOrder = order // Update the previous order once its decorated
        return order
     })
    )
}

const decorateFilledOrder = (order, previousOrder) => {
    return({
        ...order,
        tokenPriceClass: (tokenPriceClass(order.tokenPrice, order.id, previousOrder))
    })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    // Show green if only one order exists
    if(previousOrder.id === orderId){
        return GREEN
    }
    
    // Show green price if prder price higher than previous order
    // Show red price if prder price lower than previous order
    if(previousOrder.tokenPrice <= tokenPrice){
        return GREEN // success
    } else {
        return RED // danger
    }
}

// --------------------------------------------------------------------------
// MY FILLED ORDERS
export const myFilledOrdersSelector = createSelector(account, tokens, filledOrders, (account, tokens, orders) => {
    if(!tokens[0] || !tokens[1]) { return }

    // Find Our Orders
    orders = orders.filter((o) => o.user === account || o.creator === account)

    // Filter orders by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // Sort by date descending
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    // Decorate Orders - add dispaly attributes
    orders = decorateMyFilledOrders(orders, account, tokens)

    // console.log(orders)

    return orders
})

const decorateMyFilledOrders = (orders, account, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyFilledOrder(order, account, tokens)
            return(order)
        })
    )
}

const decorateMyFilledOrder = (order, account, tokens) => {
    const myOrder = order.creator === account;

    let orderType
    if(myOrder){
        orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    } else {
        orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'
    }

    return({
        ...order,
        orderType,
        orderClass: (orderType === 'buy' ? GREEN : RED),
        orderSign: (orderType === 'buy' ? '+' : '-')
    })
}
// --------------------------------------------------------------------------
// ORDER BOOK
export const orderBookSelector = createSelector(openOrders, tokens, (orders, tokens) => {
    // console.log("Order Book Selector", orders, tokens);
    if (!tokens[0] || !tokens[1]) { return }

    // Filter orders by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // Decorate Orders
    orders = decorateOrderBookOrders(orders, tokens)

    // organizing the order by types
    orders = groupBy(orders, 'orderType');

    // Fetch buy orders
    const buyOrders = get(orders, 'buy', []);

    // Sort buy orders by token price
    orders = {
        ...orders,
        buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

     // Fetch buy orders
     const sellOrders = get(orders, 'sell', []);
    
    // Sort sell orders by token price
    orders = {
        ...orders,
        sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    // console.log(orders)
    return orders;
  
});

const decorateOrderBookOrders = (orders, tokens) => {
    return (
          // Decorate Book Orders
        orders.map((order) => {
        order = decorateOrder(order, tokens)
        order = decorateOrderBookOrder(order, tokens)
        return (order)
     })
    )
}

const decorateOrderBookOrder = (order, tokens) => {
    // tokens[0] is what the user has so they would that & tokens[1] is what the user doesnt have so they would buy that
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';

    return ({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    })
}

// --------------------------------------------------------------------------
// PRICE CHART
export const priceChartSelector = createSelector(filledOrders, tokens, (orders, tokens) => {
    // console.log("Order Book Selector", orders, tokens);
    if (!tokens[0] || !tokens[1]) { return }

     // Filter orders by selected tokens
     orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
     orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // Sort orders by date ascending to compare history
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    //  Decorate orders - add display attributes
    orders = orders.map((o) => decorateOrder(o, tokens))

    // Parallel Assignments START
    let secondLastOrder, lastOrder; 
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
    // Parallel Assignments END

    // EXAMPLE OF PARALLEL ASSIGNMENTS
   /* let a, b
    [a, b] = ['a', 'b']
    */
//    get last order price
    const lastPrice = get(lastOrder, 'tokenPrice', 0);

    // get second last order price
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0);

     return ({
        lastPrice,
        lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
        series: [{
            data: buildGraphData(orders)
        }]

     })
})

const buildGraphData = (orders) => {

    // Group the orders by hour for the graph .. Formatting by a time measurement 
    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

    //  console.log(orders)

    // Get each hour where data exists
     const hours = Object.keys(orders)

    //  Build the graph series
    const graphData = hours.map((hour) => {
        // Fetch all orders from current hour
        const group = orders[hour]

        // Calculate price values: open, high, low, close
        const open = group[0] // first order
        const high = maxBy(group, "tokenPrice") // high price
        const low = minBy(group, "tokenPrice") // low price
        const close = group[group.length - 1] // last order

        return({
            x: new Date(hour),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
        })
     })

     return graphData;
}