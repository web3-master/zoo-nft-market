import React, { useReducer } from 'react'
import { IpfsGateway } from '../../Constants'
import PropTypes from 'prop-types'

import CollectionContext from './collection-context'

const defaultCollectionState = {
  contract: null,
  totalSupply: null,
  collection: [],
  nftIsLoading: true
}

const collectionReducer = (state, action) => {
  if (action.type === 'CONTRACT') {
    return {
      contract: action.contract,
      totalSupply: state.totalSupply,
      collection: state.collection,
      nftIsLoading: state.nftIsLoading
    }
  }

  if (action.type === 'LOADSUPPLY') {
    return {
      contract: state.contract,
      totalSupply: action.totalSupply,
      collection: state.collection,
      nftIsLoading: state.nftIsLoading
    }
  }

  if (action.type === 'LOADCOLLECTION') {
    return {
      contract: state.contract,
      totalSupply: state.totalSupply,
      collection: action.collection,
      nftIsLoading: state.nftIsLoading
    }
  }

  if (action.type === 'UPDATECOLLECTION') {
    const index = state.collection.findIndex((NFT) => NFT.id === action.NFT.id)
    let collection = []

    if (index === -1) {
      collection = [action.NFT, ...state.collection]
    } else {
      collection = [...state.collection]
    }

    return {
      contract: state.contract,
      totalSupply: state.totalSupply,
      collection,
      nftIsLoading: state.nftIsLoading
    }
  }

  if (action.type === 'UPDATEOWNER') {
    const index = state.collection.findIndex((NFT) => NFT.id === action.id)
    const collection = [...state.collection]
    if (index > -1) {
      collection[index].owner = action.newOwner
    }

    return {
      contract: state.contract,
      totalSupply: state.totalSupply,
      collection,
      nftIsLoading: state.nftIsLoading
    }
  }

  if (action.type === 'DELETEITEM') {
    const collection = state.collection.filter((NFT) => NFT.id !== action.id)

    return {
      contract: state.contract,
      totalSupply: collection.length,
      collection,
      nftIsLoading: state.nftIsLoading
    }
  }

  if (action.type === 'LOADING') {
    return {
      contract: state.contract,
      totalSupply: state.totalSupply,
      collection: state.collection,
      nftIsLoading: action.loading
    }
  }

  return defaultCollectionState
}

const CollectionProvider = (props) => {
  const [CollectionState, dispatchCollectionAction] = useReducer(
    collectionReducer,
    defaultCollectionState
  )

  const loadContractHandler = (web3, NFTCollection) => {
    const contract = new web3.eth.Contract(
      NFTCollection.abi,
      NFTCollection.address
    )
    dispatchCollectionAction({ type: 'CONTRACT', contract })
    return contract
  }

  const loadTotalSupplyHandler = async (contract) => {
    const totalSupply = await contract.methods.totalSupply().call()
    dispatchCollectionAction({ type: 'LOADSUPPLY', totalSupply })
    return totalSupply
  }

  const loadCollectionHandler = async (contract, totalSupply) => {
    let collection = []
    // for (let i = 0; i < totalSupply; i++) {
    //   collection.push({})
    // }
    // dispatchCollectionAction({
    //   type: 'LOADCOLLECTION',
    //   collection
    // })

    // collection = []

    for (let i = 0; i < totalSupply; i++) {
      try {
        const tokenId = await contract.methods.tokenByIndex(i).call()
        const hash = await contract.methods.tokenURI(tokenId).call()
        const response = await fetch(`${IpfsGateway}/${hash}?clear`)
        if (!response.ok) {
          throw new Error('Something went wrong')
        }

        const metadata = await response.json()
        const owner = await contract.methods.ownerOf(tokenId).call()

        collection = [
          {
            id: tokenId,
            title: metadata.properties.name.description,
            description: metadata.properties.description.description,
            img: metadata.properties.image.description,
            owner
          },
          ...collection
        ]
      } catch {
        console.error('Something went wrong')
      }
    }
    dispatchCollectionAction({
      type: 'LOADCOLLECTION',
      collection
    })
  }

  const updateCollectionHandler = async (contract, id, owner) => {
    /**
     * This handler is called when a token is burned with zero address value of owner.
     */
    if (owner.toString() === '0x0000000000000000000000000000000000000000') {
      dispatchCollectionAction({
        type: 'DELETEITEM',
        id
      })
      return
    }

    let NFT
    const hash = await contract.methods.tokenURI(id).call()
    try {
      const response = await fetch(`${IpfsGateway}/${hash}?clear`)
      if (!response.ok) {
        throw new Error('Something went wrong')
      }

      const metadata = await response.json()

      NFT = {
        id,
        title: metadata.properties.name.description,
        description: metadata.properties.description.description,
        img: metadata.properties.image.description,
        owner
      }
    } catch {
      console.error('Something went wrong')
    }
    dispatchCollectionAction({ type: 'UPDATECOLLECTION', NFT })
  }

  const updateOwnerHandler = (id, newOwner) => {
    dispatchCollectionAction({
      type: 'UPDATEOWNER',
      id,
      newOwner
    })
  }

  const setNftIsLoadingHandler = (loading) => {
    dispatchCollectionAction({ type: 'LOADING', loading })
  }

  const collectionContext = {
    contract: CollectionState.contract,
    totalSupply: CollectionState.totalSupply,
    collection: CollectionState.collection,
    nftIsLoading: CollectionState.nftIsLoading,
    loadContract: loadContractHandler,
    loadTotalSupply: loadTotalSupplyHandler,
    loadCollection: loadCollectionHandler,
    updateCollection: updateCollectionHandler,
    updateOwner: updateOwnerHandler,
    setNftIsLoading: setNftIsLoadingHandler
  }

  return (
    <CollectionContext.Provider value={collectionContext}>
      {props.children}
    </CollectionContext.Provider>
  )
}

CollectionProvider.propTypes = {
  children: PropTypes.element.isRequired
}

export default CollectionProvider
