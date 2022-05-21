// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ZooNftCollection.sol";

contract ZooNftMarketplace {
    uint public offerCount;
    mapping (uint => _Offer) public offers;
    mapping (address => uint) public userFunds;
    ZooNftCollection nftCollection;

    struct _Offer {
        uint offerId;
        uint id;
        address user;
        uint price;
        bool fulfilled;
        bool cancelled;
    }

    event OfferCreated(
        address indexed user,
        uint indexed offerId,
        uint indexed id,
        uint price,
        bool fulfilled,
        bool cancelled,
        uint timestamp
    );

    event OfferFilled(
        address indexed user,
        uint indexed offerId,
        uint indexed id,
        uint timestamp
    );

    event Earned(
        address indexed user,
        uint indexed offerId,
        uint indexed id,
        uint amount,
        uint timestamp
    );

    event OfferCancelled(
        address indexed user,
        uint indexed offerId,
        uint indexed id,
        uint timestamp
    );

    event ClaimFunds(
        address indexed user,
        uint amount,
        uint timestamp
    );

    constructor(address _nftCollection) {
        nftCollection = ZooNftCollection(_nftCollection);
    }

    function makeOffer(uint _id, uint _price) external {
        nftCollection.transferFrom(msg.sender, address(this), _id);

        uint offerId = offerCount ++;
        offers[offerId] = _Offer(offerId, _id, msg.sender, _price, false, false);
        
        emit OfferCreated(msg.sender, offerId, _id, _price, false, false, block.timestamp);
    }

    function fillOffer(uint _offerId) external payable {
        _Offer storage _offer = offers[_offerId];

        require(_offer.offerId == _offerId, 'The offer must exist');
        require(_offer.user != msg.sender, 'The owner of the offer cannot fill it');
        require(!_offer.fulfilled, 'An offer cannot be fulfilled twice');
        require(!_offer.cancelled, 'A cancelled offer cannot be fulfilled');
        require(msg.value == _offer.price, 'The ETH amount should match with the NFT price');

        _offer.fulfilled = true;
        userFunds[_offer.user] += msg.value;

        emit OfferFilled(msg.sender, _offerId, _offer.id, block.timestamp);
        emit Earned(_offer.user, _offerId, _offer.id, _offer.price, block.timestamp);

        nftCollection.transferFrom(address(this), msg.sender, _offer.id);
    }

    function cancelOffer(uint _offerId) external {
        _Offer storage _offer = offers[_offerId];

        require(_offer.offerId == _offerId, 'The offer must exist');
        require(_offer.user == msg.sender, 'The offer can only be cancelled by the owner');
        require(_offer.fulfilled == false, 'A fulfilled offer cannot be cancelled');
        require(_offer.cancelled == false, 'A offer cannot be cancelled twice');

        _offer.cancelled = true;

        emit OfferCancelled(msg.sender, _offerId, _offer.id, block.timestamp);

        nftCollection.transferFrom(address(this), msg.sender, _offer.id);
    }

    function claimFunds() external {
        uint userBalance = userFunds[msg.sender];

        require(userBalance > 0, 'This user has no funds to be claimed');

        userFunds[msg.sender] = 0;

        emit ClaimFunds(msg.sender, userBalance, block.timestamp);

        payable(msg.sender).transfer(userBalance);
    }

    fallback() external {
        revert();
    }
}