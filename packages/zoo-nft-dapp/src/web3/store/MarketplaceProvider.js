import React, { useReducer } from 'react'
import PropTypes from 'prop-types'

import MarketplaceContext from './marketplace-context'

const defaultMarketplaceState = {
  contract: null,
  offerCount: null,
  offers: [],
  userFunds: null,
  mktIsLoading: true
}

const marketplaceReducer = (state, action) => {
  if (action.type === 'CONTRACT') {
    return {
      contract: action.contract,
      offerCount: state.offerCount,
      offers: state.offers,
      userFunds: state.userFunds,
      mktIsLoading: state.mktIsLoading
    }
  }

  if (action.type === 'LOADOFFERCOUNT') {
    return {
      contract: state.contract,
      offerCount: action.offerCount,
      offers: state.offers,
      userFunds: state.userFunds,
      mktIsLoading: state.mktIsLoading
    }
  }

  if (action.type === 'LOADOFFERS') {
    return {
      contract: state.contract,
      offerCount: state.offerCount,
      offers: action.offers,
      userFunds: state.userFunds,
      mktIsLoading: state.mktIsLoading
    }
  }

  if (action.type === 'UPDATEOFFER') {
    const offers = state.offers.filter(
      (offer) => offer.offerId !== action.offerId
    )

    return {
      contract: state.contract,
      offerCount: state.offerCount,
      offers,
      userFunds: state.userFunds,
      mktIsLoading: state.mktIsLoading
    }
  }

  if (action.type === 'ADDOFFER') {
    const index = state.offers.findIndex(
      (offer) => offer.offerId === action.offer.offerId
    )
    let offers = []

    if (index === -1) {
      offers = [
        ...state.offers,
        {
          offerId: action.offer.offerId,
          id: action.offer.id,
          user: action.offer.user,
          price: action.offer.price,
          fulfilled: false,
          cancelled: false
        }
      ]
    } else {
      offers = [...state.offers]
    }

    return {
      contract: state.contract,
      offerCount: state.offerCount,
      offers,
      userFunds: state.userFunds,
      mktIsLoading: state.mktIsLoading
    }
  }

  if (action.type === 'LOADFUNDS') {
    return {
      contract: state.contract,
      offerCount: state.offerCount,
      offers: state.offers,
      userFunds: action.userFunds,
      mktIsLoading: state.mktIsLoading
    }
  }

  if (action.type === 'LOADING') {
    return {
      contract: state.contract,
      offerCount: state.offerCount,
      offers: state.offers,
      userFunds: state.userFunds,
      mktIsLoading: action.loading
    }
  }

  return defaultMarketplaceState
}

const MarketplaceProvider = (props) => {
  const [MarketplaceState, dispatchMarketplaceAction] = useReducer(
    marketplaceReducer,
    defaultMarketplaceState
  )

  const loadContractHandler = (web3, NFTMarketplace) => {
    const contract = new web3.eth.Contract(
      NFTMarketplace.abi,
      NFTMarketplace.address
    )
    dispatchMarketplaceAction({ type: 'CONTRACT', contract })
    return contract
  }

  const loadOfferCountHandler = async (contract) => {
    const offerCount = await contract.methods.offerCount().call()
    dispatchMarketplaceAction({
      type: 'LOADOFFERCOUNT',
      offerCount
    })
    return offerCount
  }

  const loadOffersHandler = async (contract, offerCount) => {
    let offers = []
    for (let i = 0; i < offerCount; i++) {
      const offer = await contract.methods.offers(i + 1).call()
      offers.push(offer)
    }
    offers = offers.filter(
      (offer) => offer.fulfilled === false && offer.cancelled === false
    )
    dispatchMarketplaceAction({ type: 'LOADOFFERS', offers })
  }

  const updateOfferHandler = (offerId) => {
    dispatchMarketplaceAction({ type: 'UPDATEOFFER', offerId })
  }

  const addOfferHandler = (offer) => {
    dispatchMarketplaceAction({ type: 'ADDOFFER', offer })
  }

  const loadUserFundsHandler = async (contract, account) => {
    const userFunds = await contract.methods.userFunds(account).call()
    dispatchMarketplaceAction({ type: 'LOADFUNDS', userFunds })
    return userFunds
  }

  const setMktIsLoadingHandler = (loading) => {
    dispatchMarketplaceAction({ type: 'LOADING', loading })
  }

  const getOfferHandler = (nftId) => {
    let offer = MarketplaceState.offers
      ? MarketplaceState.offers.find((offer) => offer.id === nftId)
      : null

    //
    // [2022/12/23]MarketplaceState.offers.find() return 'undefined' for not existing item. And getOffer() is expected to return 'null' for not existing item.
    //
    if (offer === undefined) offer = null
    return offer
  }

  const marketplaceContext = {
    contract: MarketplaceState.contract,
    offerCount: MarketplaceState.offerCount,
    offers: MarketplaceState.offers,
    userFunds: MarketplaceState.userFunds,
    mktIsLoading: MarketplaceState.mktIsLoading,
    loadContract: loadContractHandler,
    loadOfferCount: loadOfferCountHandler,
    loadOffers: loadOffersHandler,
    updateOffer: updateOfferHandler,
    addOffer: addOfferHandler,
    loadUserFunds: loadUserFundsHandler,
    setMktIsLoading: setMktIsLoadingHandler,
    getOffer: getOfferHandler
  }

  return (
    <MarketplaceContext.Provider value={marketplaceContext}>
      {props.children}
    </MarketplaceContext.Provider>
  )
}

MarketplaceProvider.propTypes = {
  children: PropTypes.element.isRequired
}

export default MarketplaceProvider
