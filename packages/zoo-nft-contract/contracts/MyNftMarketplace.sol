// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyNftCollection.sol";

contract MyNftMarketplace {
    uint public offerCount;
    mapping (uint => _Offer) public offers;
    mapping (address => uint) public userFunds;
    MyNftCollection nftCollection;

    struct _Offer {
        uint offerId;
        uint id;
        address user;
        uint price;
        bool fulfilled;
        bool cancelled;
    }

    event Offer(
        uint offerId, uint id, address user, uint price, bool fulfilled, bool cancelled
    );
    event OfferFilled(uint offerId, uint id, address newOwner);
    event OfferCancelled(uint offerId, uint id, address owner);
    event ClaimFunds(address user, uint amount);

    constructor(address _nftCollection) {
        nftCollection = MyNftCollection(_nftCollection);
    }

    function makeOffer(uint _id, uint _price) public {
        nftCollection.transferFrom(msg.sender, address(this), _id);
        offerCount ++;
        offers[offerCount] = _Offer(offerCount, _id, msg.sender, _price, false, false);
        emit Offer(offerCount, _id, msg.sender, _price, false, false);
    }

    function fillOffer(uint _offerId) public payable {
        _Offer storage _offer = offers[_offerId];
        require(_offer.offerId == _offerId, 'The offer must exist');
        require(_offer.user != msg.sender, 'The owner of the offer cannot fill it');
        require(!_offer.fulfilled, 'An offer cannot be fulfilled twice');
        require(!_offer.cancelled, 'A cancelled offer cannot be fulfilled');
        require(msg.value == _offer.price, 'The ETH amount should match with the NFT price');
        _offer.fulfilled = true;
        userFunds[_offer.user] += msg.value;
        emit OfferFilled(_offerId, _offer.id, msg.sender);
        nftCollection.transferFrom(address(this), msg.sender, _offer.id);
    }

    function cancelOffer(uint _offerId) public {
        _Offer storage _offer = offers[_offerId];
        require(_offer.offerId == _offerId, 'The offer must exist');
        require(_offer.user == msg.sender, 'The offer can only be cancelled by the owner');
        require(_offer.fulfilled == false, 'A fulfilled offer cannot be cancelled');
        require(_offer.cancelled == false, 'A offer cannot be cancelled twice');
        _offer.cancelled = true;
        emit OfferCancelled(_offerId, _offer.id, msg.sender);
        nftCollection.transferFrom(address(this), msg.sender, _offer.id);
    }

    function claimFunds() public {
        uint userBalance = userFunds[msg.sender];
        require(userBalance > 0, 'This user has no funds to be claimed');
        emit ClaimFunds(msg.sender, userBalance);
        userFunds[msg.sender] = 0;
        payable(msg.sender).transfer(userBalance);
    }

    fallback() external {
        revert();
    }
}