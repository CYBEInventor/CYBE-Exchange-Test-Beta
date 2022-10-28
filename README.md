# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

# Add Ons To The CYBE Exchange
- Implement, Test, Final Deploy for my upgradeable exchange and tokens OR I will make maintainence pages to communicate to the users of the exchange that upgrades will happen. Now when on the testnets, if the address of the token changes its not bad ting. On the live networks that will be really bad since people wont have access to the upgraded to the new token unless addressed correctly. Same goes for the exchange. The upgradeable smart contracts is more preferred. (skipping for now on the testnets 10/23/2022)
- When the upgradeable smart contracts is 100%, Than buld a specific script to re deploy on the correct proxy when changes need to be made. (skipping for now on the testnets 10/23/2022)
- Add popular tokens and unpopular tokens for trading. Add, Test, Attempt To Break, Final Deploy. Make sure these well-known tokens are tradable with no errors and horrible pump-n-dumps. (For mainnets)
- Once everything runs smooth without extreme changes, change the main color scheme, this with the deployment steps should be enough for a non-upgradeable exchange. Just to catch people interest. So this means im non-upgradeable token & exchange. so the addresses will be different on the official upgradeable tokens
- Add a testnet scripts for your exchange after upgradeable logic is added. Also testnet scripts for non-upgradeable
- In a logically sense, when a order isnt filled because it was filled by someone else. Notify that to the other end user
- Logic add on, if exchange is loading the balance use a loading gif in place of that until loading is done
- Logic add on, Some kind of unique symbol to indicate which order is which users in the order book


# Final Touches and Deployment Notes
- Program my own email domain for Cyber Connect and my own.
- Rinkeby, Ropsten, and Kovan testnets from the Infura API on October 5th, 2022. So my first network will be Goerli
- My CYBE Exchange will be on the testnets for now. I will grow a more consistent audience for more users of my Dapps (Decentralized Applications). Than this will grow my existing conglomerate since i will be attaching more Dapps to my main website
- I will have the test and non-test networks included in my config.json and hardhat.config.js
- without any added steps for deployment the other networks
- CYBE Exchange will have my official token with added code from this demostration file.
- In coding my token into the test networks and blockchains, i will change the color or overall design of the svg
- Also i will change the symbol of eth to polygon for the munbai network (polygon test network)
- The official exchange will be connected to the official website of CYBE Exchange
- The final CYBE Exchange wont have "LocalHost" as a network option but the test beta will.
- Make the github repository private only to you and your team!
- Later on when my exchange will get traffic, i can make more tokens in the ERC-20 format to be traded