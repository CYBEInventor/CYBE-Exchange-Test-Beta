const { ethers } = require("hardhat");

async function main() {
  console.log(`Preparing Deployment...\n`);
  // Fetch Token Contract To Deploy
  const Token = await ethers.getContractFactory("Token");
  // Fetch Exchange Contract To Deploy
  const Exchange = await ethers.getContractFactory("Exchange");

  // Fetching accounts
  const accounts = await ethers.getSigners();
  console.log(`Accounts Fetched:\n${accounts[0].address}\n${accounts[1].address}\n`);


  // Deploy Contracts
  const dapp = await Token.deploy('Dapp University', 'DAPP', '1000000');
  await dapp.deployed();
  console.log(`DAPP Deployed To: ${dapp.address}`);

  const mETH = await Token.deploy('mETH', 'mETH', '1000000');
  await mETH.deployed();
  console.log(`mETH Deployed To: ${mETH.address}`);

  const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000');
  await mDAI.deployed();
  console.log(`mDAI Deployed To: ${mDAI.address}`);

  const exchange = await Exchange.deploy(accounts[1].address, 10);
  //                                    ^^^^ the fee account
  //                                                   ^^^^ the percentage
  await exchange.deployed();
  console.log(`Exchange Deployed To: ${exchange.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
