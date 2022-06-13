const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");
const { BigNumber } = require("ethers");

describe("Auction Create tests", function () {
  let nft;
  let auction;
  let seller;

  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("ZooNftCollection");
    nft = await NFT.deploy();
    await nft.deployed();
    // console.log("nft address:", nft.address);

    const Auction = await ethers.getContractFactory("ZooNftAuction");
    auction = await Auction.deploy(nft.address);
    await auction.deployed();
    // console.log("auction address:", auction.address);

    [seller] = await ethers.getSigners();
    // console.log("seller: ", seller.address);

    await nft.connect(seller).safeMint("");
    const tokenOwner = await nft.ownerOf(0);
    // console.log("minted token 0 owner: ", tokenOwner);
    await nft.connect(seller).approve(auction.address, 0);
  });

  it("Failure test on invalid start, end time", async function () {
    try {
      await auction.connect(seller).createAuction(1, 1, 0, 0);
      assert(false, "Auction create should be failed but not.");
    } catch (err) {
      expect(err.toString()).contains("Auction end time is invalid.");
    }
  });

  it("Success test", async function () {
    try {
      const startTime = Math.trunc(new Date().getTime() / 1000);
      const endTime = startTime + 3600;
      await auction
        .connect(seller)
        .createAuction(0, ethers.utils.parseEther("1"), startTime, endTime);

      const auctionCount = await auction.auctionCount();
      // console.log("auctionCount:", auctionCount.toNumber());
      expect(auctionCount.toNumber()).equals(1);

      const createdAuction = await auction.auctions(0);
      // console.log("createdAuction", createdAuction);
      expect(createdAuction.id.toNumber()).equals(0);
      expect(createdAuction.user).equals(seller.address);
      expect(createdAuction.startTime.toNumber()).equals(startTime);
      expect(createdAuction.endTime.toNumber()).equals(endTime);

      const tokenOwner = await nft.ownerOf(0);
      expect(tokenOwner).equals(auction.address);
      // console.log("token owner:", tokenOwner);
    } catch (err) {
      // console.log(err);
      assert(false, "Auction create should success");
    }
  });
});

describe("Auction Bid tests", function () {
  let nft;
  let auction;
  let seller;
  let bidder;
  let bidder2;

  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("ZooNftCollection");
    nft = await NFT.deploy();
    await nft.deployed();
    // console.log("nft address:", nft.address);

    const Auction = await ethers.getContractFactory("ZooNftAuction");
    auction = await Auction.deploy(nft.address);
    await auction.deployed();
    // console.log("auction address:", auction.address);

    [seller, bidder, bidder2] = await ethers.getSigners();
    // console.log("seller: ", seller.address);
    // console.log("bidder: ", bidder.address);
    // console.log("bidder2: ", bidder2.address);

    await nft.connect(seller).safeMint("");
    const tokenOwner = await nft.ownerOf(0);
    // console.log("minted token 0 owner: ", tokenOwner);
    await nft.connect(seller).approve(auction.address, 0);

    const startTime = Math.trunc(new Date().getTime() / 1000);
    const endTime = startTime + 3600;
    await auction
      .connect(seller)
      .createAuction(0, ethers.utils.parseEther("1"), startTime, endTime);
  });

  it("Auction owner can't bid.", async function () {
    try {
      await auction.connect(seller).makeBid(0);
      assert(false);
    } catch (err) {
      expect(err.toString()).contains("The owner of the auction cannot bid");
    }
  });

  it("Bidder's price is not enough.", async function () {
    try {
      await auction
        .connect(bidder)
        .makeBid(0, { value: ethers.utils.parseEther("0.1") });
      assert(false, "Make bid should be failed because bid price is too low");
    } catch (err) {
      expect(err.toString()).contains(
        "Your bid is lower than the start bid price."
      );
    }
  });

  it("Success test", async function () {
    try {
      await auction
        .connect(bidder)
        .makeBid(0, { value: ethers.utils.parseEther("1.5") });

      const bidedAuction = await auction.auctions(0);
      // console.log("bidedAuction", bidedAuction);

      expect(bidedAuction.highestBidder).equals(bidder.address);
      expect(bidedAuction.highestBid).equals(ethers.utils.parseEther("1.5"));
    } catch (err) {
      console.log(err);
      assert(false, "Auction bid should success");
    }
  });

  it("Bidder's price is lower than the highest.", async function () {
    try {
      await auction
        .connect(bidder)
        .makeBid(0, { value: ethers.utils.parseEther("1.5") });

      await auction
        .connect(bidder2)
        .makeBid(0, { value: ethers.utils.parseEther("1.1") });

      assert(
        false,
        "Make bid should be failed because bid price is lower than the highest."
      );
    } catch (err) {
      expect(err.toString()).contains(
        "Your bid is lower than the highest bid."
      );
    }
  });

  it("Success over bid.", async function () {
    try {
      await auction
        .connect(bidder)
        .makeBid(0, { value: ethers.utils.parseEther("1.5") });

      await auction
        .connect(bidder2)
        .makeBid(0, { value: ethers.utils.parseEther("1.7") });

      const bidedAuction = await auction.auctions(0);
      // console.log("bidedAuction", bidedAuction);

      expect(bidedAuction.highestBidder).equals(bidder2.address);
      expect(bidedAuction.highestBid).equals(ethers.utils.parseEther("1.7"));
    } catch (err) {
      console.log(err);
      assert(false, "Auction over bid should success");
    }
  });
});

describe("Auction Cancel tests", function () {
  let nft;
  let auction;
  let seller;
  let bidder;

  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("ZooNftCollection");
    nft = await NFT.deploy();
    await nft.deployed();
    // console.log("nft address:", nft.address);

    const Auction = await ethers.getContractFactory("ZooNftAuction");
    auction = await Auction.deploy(nft.address);
    await auction.deployed();
    // console.log("auction address:", auction.address);

    [seller, bidder, bidder2] = await ethers.getSigners();
    // console.log("seller: ", seller.address);
    // console.log("bidder: ", bidder.address);

    await nft.connect(seller).safeMint("");
    const tokenOwner = await nft.ownerOf(0);
    // console.log("minted token 0 owner: ", tokenOwner);
    await nft.connect(seller).approve(auction.address, 0);

    const startTime = Math.trunc(new Date().getTime() / 1000);
    const endTime = startTime + 50;
    await auction
      .connect(seller)
      .createAuction(0, ethers.utils.parseEther("1"), startTime, endTime);
  });

  it("Non owner can't cancel.", async function () {
    try {
      await auction.connect(bidder).cancelAuction(0);
      assert(false, "cancelAuction should be failed.");
    } catch (err) {
      expect(err.toString()).contains(
        "The auction can only be cancelled by the owner"
      );
    }
  });

  it("Already cancelled auction.", async function () {
    await auction.connect(seller).cancelAuction(0);
    try {
      await auction.connect(seller).cancelAuction(0);
      assert(false, "cancelAuction should be failed.");
    } catch (err) {
      expect(err.toString()).contains("An auction cannot be cancelled twice");
    }
  });

  it("Already completed auction.", function (done) {
    setTimeout(() => {
      (async () => {
        try {
          await auction.connect(seller).cancelAuction(0);
          assert(false, "cancelAuction should be failed.");
        } catch (err) {
          expect(err.toString()).contains("Auction already completed!");
          done();
        }
      })();
    }, 60 * 1000);
  });

  it("Cancel success", async function () {
    try {
      await auction.connect(seller).cancelAuction(0);

      const bidedAuction = await auction.auctions(0);
      // console.log("bidedAuction", bidedAuction);

      expect(bidedAuction.cancelled).equals(true);

      const tokenOwner = await nft.ownerOf(0);
      expect(tokenOwner).equals(seller.address);
      // console.log("token owner:", tokenOwner);
    } catch (err) {
      console.log(err);
      assert(false, "Auction bid should success");
    }
  });
});

describe("Claim funds tests", function () {
  let nft;
  let auction;
  let seller;
  let bidder;

  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("ZooNftCollection");
    nft = await NFT.deploy();
    await nft.deployed();
    // console.log("nft address:", nft.address);

    const Auction = await ethers.getContractFactory("ZooNftAuction");
    auction = await Auction.deploy(nft.address);
    await auction.deployed();
    // console.log("auction address:", auction.address);

    [seller, bidder] = await ethers.getSigners();
    // console.log("seller: ", seller.address);
    // console.log("bidder: ", bidder.address);

    await nft.connect(seller).safeMint("");
    const tokenOwner = await nft.ownerOf(0);
    // console.log("minted token 0 owner: ", tokenOwner);
    await nft.connect(seller).approve(auction.address, 0);

    const startTime = Math.trunc(new Date().getTime() / 1000);
    const endTime = startTime + 50;
    await auction
      .connect(seller)
      .createAuction(0, ethers.utils.parseEther("1"), startTime, endTime);

    await auction
      .connect(bidder)
      .makeBid(0, { value: ethers.utils.parseEther("1.5") });
  });

  it("Not completed yet", async function () {
    try {
      await auction.connect(seller).claimFund(0);
      assert(false, "claim should be failed.");
    } catch (err) {
      expect(err.toString()).contains("Auction not completed yet!");
    }
  });

  it("Cancelled auction", function (done) {
    auction
      .connect(seller)
      .cancelAuction(0)
      .then(() => {
        setTimeout(async () => {
          try {
            await auction.connect(seller).claimFund(0);
            assert(false, "claim should be failed.");
          } catch (err) {
            expect(err.toString()).contains(
              "Cancelled auction cannot be claimed!"
            );
            done();
          }
        }, 60 * 1000);
      });
  });

  it("Non owner claim", function (done) {
    setTimeout(async () => {
      try {
        await auction.connect(bidder).claimFund(0);
      } catch (err) {
        expect(err.toString()).contains(
          "The auction can only be claimed by the owner"
        );
        done();
      }
    }, 60 * 1000);
  });

  it("Duplicated claim", function (done) {
    setTimeout(async () => {
      await auction.connect(seller).claimFund(0);
      try {
        await auction.connect(seller).claimFund(0);
      } catch (err) {
        expect(err.toString()).contains("Auction fund is already claimed!");
        done();
      }
    }, 60 * 1000);
  });

  it("Claim success", function (done) {
    setTimeout(async () => {
      const sellerBalanceBeforeClaim = await waffle.provider.getBalance(
        seller.address
      );
      await auction.connect(seller).claimFund(0);
      const claimedAuction = await auction.auctions(0);

      const sellerBalance = await waffle.provider.getBalance(seller.address);
      const claimedFund = sellerBalance.sub(sellerBalanceBeforeClaim);

      try {
        expect(claimedAuction.fundClaimed).equals(true);
        expect(parseFloat(ethers.utils.formatEther(claimedFund))).to.be.closeTo(
          1.5,
          0.01,
          "Claimed fund value is not correct!"
        );
        done();
      } catch (err) {
        done(err);
      }
    }, 60 * 1000);
  });
});

describe("Claim nft tests", function () {
  let nft;
  let auction;
  let seller;
  let bidder;
  let bidder2;

  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("ZooNftCollection");
    nft = await NFT.deploy();
    await nft.deployed();
    // console.log("nft address:", nft.address);

    const Auction = await ethers.getContractFactory("ZooNftAuction");
    auction = await Auction.deploy(nft.address);
    await auction.deployed();
    // console.log("auction address:", auction.address);

    [seller, bidder, bidder2] = await ethers.getSigners();
    // console.log("seller: ", seller.address);
    // console.log("bidder: ", bidder.address);
    // console.log("bidder2: ", bidder2.address);

    await nft.connect(seller).safeMint("");
    const tokenOwner = await nft.ownerOf(0);
    // console.log("minted token 0 owner: ", tokenOwner);
    await nft.connect(seller).approve(auction.address, 0);

    const startTime = Math.trunc(new Date().getTime() / 1000);
    const endTime = startTime + 50;
    await auction
      .connect(seller)
      .createAuction(0, ethers.utils.parseEther("1"), startTime, endTime);

    await auction
      .connect(bidder)
      .makeBid(0, { value: ethers.utils.parseEther("1.5") });

    await auction
      .connect(bidder2)
      .makeBid(0, { value: ethers.utils.parseEther("1.8") });
  });

  it("Not completed yet", async function () {
    try {
      await auction.connect(bidder2).claimNft(0);
      assert(false, "claim should be failed.");
    } catch (err) {
      expect(err.toString()).contains("Auction not completed yet!");
    }
  });

  it("Cancelled auction", function (done) {
    auction
      .connect(seller)
      .cancelAuction(0)
      .then(() => {
        setTimeout(async () => {
          try {
            await auction.connect(bidder2).claimNft(0);
            assert(false, "claim should be failed.");
          } catch (err) {
            expect(err.toString()).contains(
              "Cancelled auction cannot be claimed!"
            );
            done();
          }
        }, 60 * 1000);
      });
  });

  it("Not a highest bidder", function (done) {
    setTimeout(async () => {
      try {
        await auction.connect(bidder).claimNft(0);
      } catch (err) {
        expect(err.toString()).contains("Only highest bidder can claim NFT!");
        done();
      }
    }, 60 * 1000);
  });

  it("Claim success", function (done) {
    setTimeout(async () => {
      await auction.connect(bidder2).claimNft(0);
      const claimedAuction = await auction.auctions(0);
      const nftOwner = await nft.ownerOf(0);

      try {
        // console.log(
        //   "highestBid",
        //   ethers.utils.formatEther(claimedAuction.highestBid)
        // );
        // console.log("highestBidder", claimedAuction.highestBidder);
        // console.log("nftOwner", nftOwner);

        expect(
          parseFloat(ethers.utils.formatEther(claimedAuction.highestBid))
        ).equals(0.0);
        expect(claimedAuction.highestBidder).equals(
          ethers.constants.AddressZero
        );
        expect(nftOwner).equals(bidder2.address);
        done();
      } catch (err) {
        done(err);
      }
    }, 60 * 1000);
  });
});
