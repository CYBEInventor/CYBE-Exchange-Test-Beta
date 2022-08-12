const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (N) => ethers.utils.parseUnits(N.toString(), 'ether');

describe("Exchange", function () {
  let deployer, feeAccount, exchange;
  const feePercent = 10;
  beforeEach(async () => {
    // Fetch Exchange From Blockchain
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    const Exchange = await ethers.getContractFactory("Exchange");
    exchange = await Exchange.deploy(feeAccount.address, feePercent);
  });

  describe('Deployment', () => {

      // Tests Go Inside Of Here...
      it("Tracks the fee account", async function () {
        expect(await exchange.feeAccount()).to.equal(feeAccount.address);
      });  

      it("Tracks the fee percent", async function () {
        expect(await exchange.feePercent()).to.equal(feePercent);
      });  

  })

});
