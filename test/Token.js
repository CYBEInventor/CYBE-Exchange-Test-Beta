const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (N) => ethers.utils.parseUnits(N.toString(), 'ether');

describe("Token", function () {
  let token;
  let deployer, exchange;
  let accounts, receiver;
  beforeEach(async () => {
    // Code Goes Here...
    // Fetch Token From Blockchain
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy('Cyber Connect', 'CYBE', '1000000');
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
    exchange = accounts[2];
  });

  describe('Deployment', () => {
        const name = "Cyber Connect";
        const symbol = "CYBE";
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
  });

  describe('Approving Tokens', () => {
    let amount, transaction, result;

    beforeEach(async () => {
      amount = tokens(100)
      // transfer tokens
      transaction = await token.connect(deployer).approve(exchange.address, amount);
      result = await transaction.wait();
    });

    describe('Success', () => {
      it('Allocates an allowance for delegated token spending', async () => {
        expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount);
      });

      it('Emits a Approval event', async () => {
        const event = result.events[0];
        expect(event.event).to.equal('Approval');
        const args = event.args;
        expect(args.owner).to.equal(deployer.address);
        expect(args.spender).to.equal(exchange.address);
        expect(args.value).to.equal(amount);
      });

    describe('Failure', () => {
      it('Rejects invalid spenders', async () => {
        await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
      })
    })
    })
  });

  describe('Delegated Token Transfers', () => {
    let amount, transaction, result;

    beforeEach(async () => {
      amount = tokens(100)
      // transfer tokens
      transaction = await token.connect(deployer).approve(exchange.address, amount);
      result = await transaction.wait();
    });

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount);
        result = await transaction.wait();
      });
      it('Transfers token balances', async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(ethers.utils.parseUnits('999900', 'ether'));
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
      });

      it('Resets the allowance', async () => {
        expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)
      });

      it('Emits a Transfer event', async () => {
        const event = result.events[0];
        expect(event.event).to.equal('Transfer');
        const args = event.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.value).to.equal(amount);
      });

    });

    describe('Failure', () => {
      // Attempt to transfer too many tokens
      it('Rejects insufficient amounts', async () => {
        const invalidAmount = tokens(100000000);
        await expect(token.connect(exchange)
        .transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted;
      });
    })
  })

});
