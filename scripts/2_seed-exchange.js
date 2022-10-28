const config = require('../src/config.json');
const { ethers } = require("hardhat");
const tokens = (N) => ethers.utils.parseUnits(N.toString(), 'ether');
// ^^ could be from a common file

// Waiting in real time function
const wait = (seconds) => {
    const milliseconds = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/*          NOTES
    - The address could reset but hardhat can remember them in memory but its good to have a solid backup
    - hardhat uses "31337" as a network ID by default
    - From looking at getContractAt i should be able to copy the well-known token address and use it in my exchange
*/

async function main() {
    // Fetch accounts from wallet 
    const accounts = await ethers.getSigners();

    // Fetch network
    const { chainId } = await ethers.provider.getNetwork();
    console.log("Using chainId:", chainId);
    // make sure the chainId is the same as the network Id number. 

    const Cybe = await ethers.getContractAt('Token', config[chainId].Cybe.address);
    console.log(`Cybe Fetched To: ${Cybe.address}\n`);
    // const mETH = await ethers.getContractAt('Token', '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9');
    const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address);
    console.log(`mETH Fetched To: ${mETH.address}\n`);
    // const mDAI = await ethers.getContractAt('Token', '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707');
    const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address);
    console.log(`mDAI Fetched To: ${mDAI.address}\n`);

    // ^^^^^^ make sure the addresses are the same as src/config.json address ^^^^^^
    /* From research, i will interact with my address from the blockchain with my front-end application 
     for users to experience more of what they know or might not know! I could do it with ethers or web3
    */
    // Fetch the deployed exchange
    // const exchange = await ethers.getContractAt('Exchange', '0x0165878A594ca255338adfa4d48449f69242Eb8F');
    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address);
    console.log(`Exchange Fetched To: ${exchange.address}`);

    // Give tokens to account[1]
    const sender = accounts[0];
    const receiver = accounts[1];
    let amount = tokens(10000);
    
    // user1 tranfers 10,000 ETH ...
    let transaction, result;
    transaction = await mETH.connect(sender).transfer(receiver.address, amount);
    console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`);

    // ------------ set up users ------------
    // Set up exchange users .. 
    const user1 = accounts[0];
    const user2 = accounts[1];
    amount = tokens(10000);

    // ------------ Distribute tokens ------------
    //user1 approves 10,000 Cybe ...
    transaction = await Cybe.connect(user1).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Approved ${amount} tokens from ${user1.address}`);

    // ------------ Deposit tokens to exchange ------------
    // user1 deposits 10,000 Cybe ...
    transaction = await exchange.connect(user1).depositToken(Cybe.address, amount);
    await transaction.wait();
    console.log(`Deposited ${amount} Ether from ${user1.address}\n`);

     // ------------ Distribute tokens ------------
    //user2 approves mETH ...
    transaction = await mETH.connect(user2).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Approved ${amount} tokens from ${user2.address}`);

     // ------------ Deposit tokens to exchange ------------
     // user2 deposits mETH ...
    transaction = await exchange.connect(user2).depositToken(mETH.address, amount);
    await transaction.wait();
    console.log(`Deposited ${amount} Ether from ${user2.address}\n`);


    // ------------ Make orders ------------
    let orderId;
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Cybe.address, tokens(5));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`);
    // ------------ Cancel orders ------------
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user1).cancelOrder(orderId);
    result = await transaction.wait()
    console.log(`Cancelled order from ${user1.address}\n`);
    // AWAITING ... TEE HEE ... wait 1 second
    await wait(1);

    // ------------ Fill orders ------------
    // User 1 makes order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Cybe.address, tokens(10));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`);

    // User 2 fills order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`);

    // AWAITING ... TEE HEE ... wait 1 second
    await wait(1);

    // User 1 makes ANOTHER order
    transaction = await exchange.makeOrder(mETH.address, tokens(50), Cybe.address, tokens(15));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`);

    // User 2 fills ANOTHER order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`);

    // AWAITING ... TEE HEE ... wait 1 second
    await wait(1);

    // User 1 makes FINAL order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), Cybe.address, tokens(20));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`);

    // User 2 fills FINAL order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`);

    // AWAITING ... TEE HEE ... wait 1 second
    await wait(1);

    // ------------ Open orders ------------
    
    // User 1 makes orders
    for(let x = 1; x <= 10; x++){
        exchange.connect(user1).makeOrder(mETH.address, tokens(10 * x), Cybe.address, tokens(10));
        result = await transaction.wait();
        console.log(`Made order from ${user1.address}`);
        await wait(1);
    }

    for(let x = 1; x <= 10; x++){
        exchange.connect(user2).makeOrder(Cybe.address, tokens(10), mETH.address, tokens(10 * x));
        result = await transaction.wait();
        console.log(`Made order from ${user2.address}`);
        await wait(1);
    }

 
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
