const { ethers } = require("hardhat");

async function main() {
  // Fetch Contract To Deploy
  const Token = await ethers.getContractFactory("Token");

  // Deploy Contract
  const token = await Token.deploy();
  // fetching token
  await token.deployed();
  console.log(`Token Deployed To: ${token.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
