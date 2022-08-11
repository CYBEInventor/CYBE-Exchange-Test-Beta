const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (N) => ethers.utils.parseUnits(N.toString(), 'ether');

describe("Token", function () {
  let token;
  let deployer;
  let accounts;
  beforeEach(async () => {
    // Code Goes Here...
    // Fetch Token From Blockchain
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy('Dapp University', 'DAPP', '1000000');
    accounts = await ethers.getSigners();
    deployer = accounts[0];
  });

  describe('Deployment', () => {
        const name = "Dapp University";
        const symbol = "DAPP";
        const decimals = "18";
        const totalSupply = tokens('1000000')

      // Tests Go Inside Of Here...
      it("Has Correct Name", async function () {
        expect(await token.name()).to.equal(name);
      });
    
      it("Has Correct Symbol", async function () {
        expect(await token.symbol()).to.equal(symbol);
      });
    
      it("Has Correct Decimals", async function () {
        expect(await token.decimals()).to.equal(decimals);
      });
    
      it("Has Correct Total Supply", async function () {
        expect(await token.totalSupply()).to.equal(totalSupply);
      });

      it("assigns total supply to deployer", async function () {
        expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
      });

  })

});
