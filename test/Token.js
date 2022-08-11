const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (N) => ethers.utils.parseUnits(N.toString(), 'ether');

describe("Token", function () {
  let token;
  let deployer;
  let accounts, receiver;
  beforeEach(async () => {
    // Code Goes Here...
    // Fetch Token From Blockchain
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy('Dapp University', 'DAPP', '1000000');
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
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

      it("Assigns total supply to deployer", async function () {
        expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
      });

  })

  describe('Sending Token', () => {
    let amount, transaction, result;

    describe('Success', () => {
      beforeEach(async () => {
        amount = tokens(100)
        // transfer tokens
        transaction = await token.connect(deployer).transfer(receiver.address, amount);
        result = await transaction.wait();
      });
  
      it('Transfers token balances', async () => {
        // ensure that tokens were transfered (balance change)
        expect( await token.balanceOf(deployer.address)).to.equal(tokens(999900));
        expect( await token.balanceOf(receiver.address)).to.equal(amount);
      });
  
      it('Emits a Transfer event', async () => {
        const event = result.events[0];
        expect(event.event).to.equal('Transfer');
        const args = event.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.value).to.equal(amount);
      });
    })

    describe('Failure', () => {
      it('Rejects insufficient balances', async () => {
        // Transfer more tokens than deployer has - 10M
        const invalidAmount = await tokens(100000000);
        await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted;

      })

      it('Rejects invalid recipent', async () => {
        // Transfer more tokens than deployer has - 10M
        const TestAmount = await tokens(100);
        await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', TestAmount)).to.be.reverted;

      })
    })
  })

});
