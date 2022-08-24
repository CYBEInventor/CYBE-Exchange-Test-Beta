// function counterReducer(state = { value: 0 }, action) {
//     switch (action.type) {
//       case 'counter/incremented':
//         return { value: state.value + 1 }
//       case 'counter/decremented':
//         return { value: state.value - 1 }
//       default:
//         return state
//     }
//   }
//   REFERENCE^^^^^

export const provider = (state = {}, action) => {
    switch(action.type){
        case 'PROVIDER_LOADED':
            return {
                ...state,
                connection: action.connection
            }
        case 'NETWORK_LOADED':
            return {
                ...state,
                chainId: action.chainId
            }
        case 'ACCOUNT_LOADED':
            return {
                ...state, 
                account: action.account
            }
        case 'ETHER_BALANCE_LOADED':
            return {
                ...state, 
                balance: action.balance
            }
        default:
            return state;
    }
};

const DEFAULT_TOKENS_STATE = { loaded: false, contracts: [], symbols: [] };

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {
    switch(action.type){
        case 'TOKEN_1_LOADED':
            return {
                ...state,
                loaded: true,
                contracts: [action.token],
                symbols: [action.symbol]
            }
        case 'TOKEN_2_LOADED':
            return {
                ...state,
                loaded: true,
                contracts: [...state.contracts, action.token],
                symbols: [...state.symbols, action.symbol]
            }
        default:
            return state;
    }
}

const DEFAULT_EXCHANGE_STATE = { loaded: false, contract: {} }

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
    switch(action.type){
        case 'EXCHANGE_LOADED':
            return {
                ...state,
                loaded: true,
                contract: action.exchange
            }

        default:
            return state;
    }
}
