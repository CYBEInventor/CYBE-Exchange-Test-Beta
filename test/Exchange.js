const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (N) => ethers.utils.parseUnits(N.toString(), 'ether');

describe("Exchange", function () {
  let deployer, feeAccount, exchange, token1, token2, accounts, user1, user2;
  const feePercent = 10;
  beforeEach(async () => {
    // Fetch Exchange From Blockchain
    const Exchange = await ethers.getContractFactory("Exchange");
    const Token = await ethers.getContractFactory("Token");
    
    token1 = await Token.deploy('Cyber Connect', 'CYBE', '1000000');
    token2 = await Token.deploy('Mock Dai', 'mDAI', '1000000');

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    user1 = accounts[2];
    user2 = accounts[3];
    let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100));
    await transaction.wait();
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

  });

  describe('Depositing tokens', () => {
    let transaction, result;
    let amount = tokens(10);
    describe('Success', () => {
        beforeEach(async () => {
            // Approve Token
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait();
            // Deposit Token
            transaction = await exchange.connect(user1).depositToken(token1.address, amount);
            result = await transaction.wait();
        });
        // REMEMBER that before each will run when it has something to test with.
        it('tracks the token deposit', async () => {
            expect(await token1.balanceOf(exchange.address)).to.equal(amount)
            expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
            expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
        });

        it('Emits a Deposit event', async () => {
            const event = result.events[1]; // 2 events are emitted
            expect(event.event).to.equal('Deposit');
            const args = event.args;
            expect(args.token).to.equal(token1.address);
            expect(args.user).to.equal(user1.address);
            expect(args.amount).to.equal(amount);
            expect(args.balance).to.equal(amount);
          });

    })

    describe('Failure', () => {
        it('Fails when no tokens are approved', async () => {
            await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted;
        })
    })
  });

  describe('Withdrawing tokens', () => {
    let transaction, result;
    let amount = tokens(10);
    
    describe('Success', () => {
        beforeEach(async () => {
            // Deposit token before withdrawing
            // Approve Token
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait();
            // Deposit Token
            transaction = await exchange.connect(user1).depositToken(token1.address, amount);
            result = await transaction.wait();

            // Now withdraw tokens
            transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
            result = await transaction.wait()
        });
        // REMEMBER that before each will run when it has something to test with.
        it('withdraws token funds', async () => {
            expect(await token1.balanceOf(exchange.address)).to.equal(0)
            expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
            expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
        });

        it('Emits a Withdraw event', async () => {
            const event = result.events[1]; // 2 events are emitted
            expect(event.event).to.equal('Withdraw');
            const args = event.args;
            expect(args.token).to.equal(token1.address);
            expect(args.user).to.equal(user1.address);
            expect(args.amount).to.equal(amount);
            expect(args.balance).to.equal(0);
          });

    })

    describe('Failure', () => {
        it('Fails for insufficient balances', async () => {
            // Attempt to withdraw tokens without depositing
            await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted;
        });
    })
  });

  describe('Checking Balances', () => {
    let transaction, result;
    let amount = tokens(1);
    beforeEach(async () => {
        // Approve Token
        transaction = await token1.connect(user1).approve(exchange.address, amount);
        result = await transaction.wait();
        // Deposit Token
        transaction = await exchange.connect(user1).depositToken(token1.address, amount);
        result = await transaction.wait();
    });
    // REMEMBER that before each will run when it has something to test with.
    it('returns user balance', async () => {
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
    });

  });

  describe('Making Orders', () => {
    let transaction, result;
    let amount = tokens(1);
    describe('Success', async () => {
    beforeEach(async () => {
        // Deposit tokens before making order

        // Approve Token
        transaction = await token1.connect(user1).approve(exchange.address, amount);
        result = await transaction.wait();
        // Deposit Token
        transaction = await exchange.connect(user1).depositToken(token1.address, amount);
        result = await transaction.wait();

        // Make Order
        transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
        result = await transaction.wait();
        // ^^ REMEMBER TO WAIT FOR TRANSACTIONS
    });
    // REMEMBER that before each will run when it has something to test with.
    it('Tracks the newly created order', async () => {
        expect(await exchange.orderCount()).to.equal(1)
    });

    
    it('Emits a Order event', async () => {
      const event = result.events[0];
      expect(event.event).to.equal('Order');
      const args = event.args;
      expect(args.id).to.equal(1);
      expect(args.user).to.equal(user1.address);
      expect(args.tokenGet).to.equal(token2.address);
      expect(args.amountGet).to.equal(tokens(1));
      expect(args.tokenGive).to.equal(token1.address);
      expect(args.amountGive).to.equal(tokens(1));
      expect(args.timestamp).to.at.least(1);
    });

  });

  describe('Failure', async () => {
    it('Rejects with no balance', async () => {
      await expect(exchange.connect(user1)
      .makeOrder(
        token2.address, tokens(1), token1.address, tokens(1))
        ).to.be.reverted;
    })
  });
  });

  describe('Order Actions', async () => {
    let transaction, result;
    let amount = tokens(1);
    beforeEach(async () => {
      // user1 Deposits Token .. for cancelling & filling
      transaction = await token1.connect(user1).approve(exchange.address, amount);
      result = await transaction.wait();
      // Deposit Token
      transaction = await exchange.connect(user1).depositToken(token1.address, amount);
      result = await transaction.wait();

       // Give tokens to user2 .. for filling 
       transaction = await token2.connect(deployer).transfer(user2.address, tokens(100));
       result = await transaction.wait();

       // Give tokens to user2 .. for filling 
       transaction = await token2.connect(user2).approve(exchange.address, tokens(2));
       result = await transaction.wait();
      
       // deposit token to exchange .. for filling 
       transaction = await exchange.connect(user2).depositToken(token2.address, tokens(2));
       result = await transaction.wait();

      // Make Order
      transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
      result = await transaction.wait();
      // ^^ REMEMBER TO WAIT FOR TRANSACTIONS
  });

    describe('Cancelling Orders', async () => {
      describe('Success', async () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user1).cancelOrder(1)
          result = await transaction.wait();
        });

        it('Updates cancelled order', async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true);
        });

        it('Emits a Cancel event', async () => {
          const event = result.events[0];
          expect(event.event).to.equal('Cancel');
          const args = event.args;
          expect(args.id).to.equal(1);
          expect(args.user).to.equal(user1.address);
          expect(args.tokenGet).to.equal(token2.address);
          expect(args.amountGet).to.equal(tokens(1));
          expect(args.tokenGive).to.equal(token1.address);
          expect(args.amountGive).to.equal(tokens(1));
          expect(args.timestamp).to.at.least(1);
        });
        
      });

      describe('Failure', async () => {
        beforeEach(async () => {
          // user1 Deposits Token
          transaction = await token1.connect(user1).approve(exchange.address, amount);
          result = await transaction.wait();
          // Deposit Token
          transaction = await exchange.connect(user1).depositToken(token1.address, amount);
          result = await transaction.wait();

          // Make Order
          transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
          result = await transaction.wait();
          // ^^ REMEMBER TO WAIT FOR TRANSACTIONS
        })
        it('Rejects invalid order ids', async () => {
          // Check invalid order
          const invalidOrderId = 99999;
          await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted;
        });

        it('Rejects unauthorized cancelations', async () => {
          await expect(exchange.connect(user2).cancelOrder(1)
          ).to.be.reverted;
        })
      });
    });

    describe('Filling Orders', async () => {
      describe('Success', () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user2).fillOrder('1')
          result = await transaction.wait();
        });
        
        it('Executes the trade and charge fees', async () => {
          // Ensure trade happens... Token Give
          expect(await exchange.balanceOf(token1.address, user1.address))
          .to.equal(tokens(0));
          expect(await exchange.balanceOf(token1.address, user2.address))
          .to.equal(tokens(1));
          expect(await exchange.balanceOf(token1.address, feeAccount.address))
          .to.equal(tokens(0));

          // Token Get
          expect(await exchange.balanceOf(token2.address, user1.address))
          .to.equal(tokens(1));
          expect(await exchange.balanceOf(token2.address, user2.address))
          .to.equal(tokens(0.9));
          expect(await exchange.balanceOf(token2.address, feeAccount.address))
          .to.equal(tokens(0.1));
        });

        it('Updates filled orders', async () => {
          expect(await exchange.orderFilled(1)).to.equal(true);
        })

        it('Emits a Trade event', async () => {
          const event = result.events[0];
          expect(event.event).to.equal('Trade');
          const args = event.args;
          expect(args.id).to.equal(1);
          expect(args.user).to.equal(user2.address);
          expect(args.tokenGet).to.equal(token2.address);
          expect(args.amountGet).to.equal(tokens(1));
          expect(args.tokenGive).to.equal(token1.address);
          expect(args.amountGive).to.equal(tokens(1));
          expect(args.creator).to.equal(user1.address);
          expect(args.timestamp).to.at.least(1);
        });
        
      });

      describe('Failure', () => {
        // beforeEach(async () => {
        //   // user1 Deposits Token
        //   transaction = await token1.connect(user1).approve(exchange.address, amount);
        //   result = await transaction.wait();
        //   // Deposit Token
        //   transaction = await exchange.connect(user1).depositToken(token1.address, amount);
        //   result = await transaction.wait();

        //   // Make Order
        //   transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
        //   result = await transaction.wait();
        //   // ^^ REMEMBER TO WAIT FOR TRANSACTIONS
        // })
        it('Rejects invalid order ids', async () => {
          // Check invalid order
          const invalidOrderId = 99999;
          await expect(exchange.connect(user2)
          .fillOrder(invalidOrderId)).to.be.reverted;
        });

        it('Rejects already filled orders', async () => {
          transaction = await exchange.connect(user2).fillOrder(1)
          await transaction.wait();

          await expect(exchange.connect(user2).fillOrder(1)
          ).to.be.reverted;
        });

        it('Rejects canceled orders', async () => {
          transaction = await exchange.connect(user1).cancelOrder(1)
          await transaction.wait();

          await expect(exchange.connect(user2).fillOrder(1)
          ).to.be.reverted;
        });
      });
    });


  });

});
