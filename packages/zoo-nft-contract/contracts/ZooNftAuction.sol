// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ZooNftCollection.sol";
import "hardhat/console.sol";

contract ZooNftAuction {
    uint public auctionCount;
    mapping (uint => _Auction) public auctions;
    ZooNftCollection nftCollection;

    struct _Auction {
        uint auctionId;
        uint id;
        address user;
        uint startPrice;
        uint startTime;
        uint endTime;
        address highestBidder;
        uint highestBid;
        bool fundClaimed;
        bool cancelled;
    }

    event AuctionCreated(
        address indexed user,
        uint indexed auctionId,
        uint indexed id,
        uint startPrice,
        uint startTime,
        uint endTime,
        uint timestamp
    );

    event BidCreated(
        address indexed user,
        uint indexed auctionId,
        uint indexed id,
        uint price,
        uint timestamp
    );

    event AuctionCancelled(
        address indexed user,
        uint indexed auctionId,
        uint indexed id,
        uint timestamp
    );

    event FundClaimed(
        address indexed user,
        uint amount,
        uint timestamp
    );

    event NftClaimed(
        address indexed user,
        uint indexed auctionId,
        uint indexed id,
        uint timestamp
    );

    constructor(address _nftCollection) {
        nftCollection = ZooNftCollection(_nftCollection);
    }

    function createAuction(uint _id, uint _startPrice, uint _startTime, uint _endTime) external {
        //console.log("startTime: %d, block.timestamp: %d, block.number: %d", _startTime, block.timestamp, block.number);
        require(_endTime > block.timestamp, 'Auction end time is invalid.');
        require(_endTime > _startTime, 'Auction end time should be later than start time.');

        nftCollection.transferFrom(msg.sender, address(this), _id);

        uint auctionId = auctionCount ++;
        auctions[auctionId] = _Auction(auctionId, _id, msg.sender, _startPrice, _startTime, _endTime, address(0), 0, false, false);
        
        emit AuctionCreated(msg.sender, auctionId, _id, _startPrice, _startTime, _endTime, block.timestamp);
    }

    function makeBid(uint _auctionId) external payable {
        _Auction storage _auction = auctions[_auctionId];

        require(_auction.auctionId == _auctionId, 'The auction must exist');
        require(!_auction.cancelled, 'Auction is cancelled.');
        require(_auction.user != msg.sender, 'The owner of the auction cannot bid');
        require(block.timestamp > _auction.startTime, 'Auction not started yet!');
        require(block.timestamp < _auction.endTime, 'Auction already completed!');
        require(msg.value > _auction.startPrice, 'Your bid is lower than the start bid price.');
        require(msg.value > _auction.highestBid, 'Your bid is lower than the highest bid.');

        if (_auction.highestBid > 0) {
            payable(_auction.highestBidder).transfer(_auction.highestBid);
        }

        _auction.highestBidder = msg.sender;
        _auction.highestBid = msg.value;

        emit BidCreated(msg.sender, _auctionId, _auction.id, msg.value, block.timestamp);
    }

    function cancelAuction(uint _auctionId) external {
        _Auction storage _auction = auctions[_auctionId];

        require(_auction.auctionId == _auctionId, 'The auction must exist');
        require(_auction.user == msg.sender, 'The auction can only be cancelled by the owner');
        require(_auction.cancelled == false, 'An auction cannot be cancelled twice');
        require(block.timestamp < _auction.endTime, 'Auction already completed!');

        _auction.cancelled = true;

        if (_auction.highestBid > 0) {
            payable(_auction.highestBidder).transfer(_auction.highestBid);
        }

        emit AuctionCancelled(msg.sender, _auctionId, _auction.id, block.timestamp);

        nftCollection.transferFrom(address(this), msg.sender, _auction.id);
    }

    function claimFund(uint _auctionId) external {
        _Auction storage _auction = auctions[_auctionId];

        require(_auction.auctionId == _auctionId, 'The auction must exist');
        require(_auction.user == msg.sender, 'The auction can only be claimed by the owner');
        require(block.timestamp > _auction.endTime, 'Auction not completed yet!');
        require(_auction.cancelled == false, 'Cancelled auction cannot be claimed!');
        require(_auction.fundClaimed == false, 'Auction fund is already claimed!');
        require(_auction.highestBid > 0, 'There is no fund to claim!');

        _auction.fundClaimed = true;

        emit FundClaimed(msg.sender, _auction.highestBid, block.timestamp);

        payable(msg.sender).transfer(_auction.highestBid);
    }

    function claimNft(uint _auctionId) external {
        _Auction storage _auction = auctions[_auctionId];

        require(_auction.auctionId == _auctionId, 'The auction must exist');
        require(block.timestamp > _auction.endTime, 'Auction not completed yet!');
        require(_auction.cancelled == false, 'Cancelled auction cannot be claimed!');
        require(_auction.highestBidder == msg.sender, 'Only highest bidder can claim NFT!');

        _auction.highestBidder = address(0);
        _auction.highestBid = 0;

        nftCollection.transferFrom(address(this), msg.sender, _auction.id);

        emit NftClaimed(msg.sender, _auctionId, _auction.id, block.timestamp);
    }

    fallback() external {
        revert();
    }
}