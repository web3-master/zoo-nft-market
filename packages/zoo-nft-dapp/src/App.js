import { notification } from 'antd'
import React, { useContext, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { NetworkId } from './Constants'
import ZooNftContractsLocal from './contract-abis/localhost/zoo-nft-contracts.json'
import ZooNftContractsGoerli from './contract-abis/goerli/zoo-nft-contracts.json'
import AppLayout from './layout/AppLayout'
import web3 from './web3/connection/web3'
import CollectionContext from './web3/store/collection-context'
import MarketplaceContext from './web3/store/marketplace-context'
import Web3Context from './web3/store/web3-context'

function App() {
  const web3Ctx = useContext(Web3Context)
  const collectionCtx = useContext(CollectionContext)
  const marketplaceCtx = useContext(MarketplaceContext)

  useEffect(() => {
    if (!web3) {
      notification.warning({
        message: 'Warning',
        description:
          'Non-Ethereum browser detected. You should consider trying MetaMask!'
      })
      return
    }

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload()
    })

    const initWeb3 = async () => {
      try {
        await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error
        })
      }

      const ZooNftContracts =
        NetworkId === 5 ? ZooNftContractsGoerli : ZooNftContractsLocal
      const account = await web3Ctx.loadAccount(web3)
      const networkId = await web3Ctx.loadNetworkId(web3)
      if (ZooNftContracts.chainId !== networkId.toString()) {
        notification.error({
          message: 'Error',
          description: `This network is not supported. Please connect to ${ZooNftContracts.name} in MetaMask!`
        })
        return
      }

      const NFTCollection = ZooNftContracts.contracts.ZooNftCollection
      const nftContract = collectionCtx.loadContract(web3, NFTCollection)

      const NFTMarketplace = ZooNftContracts.contracts.ZooNftMarketplace
      const mktContract = marketplaceCtx.loadContract(web3, NFTMarketplace)

      if (nftContract) {
        const totalSupply = await collectionCtx.loadTotalSupply(nftContract)

        collectionCtx.loadCollection(nftContract, totalSupply)

        nftContract.events
          .Transfer()
          .on('data', (event) => {
            collectionCtx.updateCollection(
              nftContract,
              event.returnValues.tokenId,
              event.returnValues.to
            )
            collectionCtx.setNftIsLoading(false)
          })
          .on('error', (error) => {
            notification.error({
              message: 'Error',
              description: error
            })
          })
      } else {
        window.alert('NFTCollection contract not deployed to detected network.')
      }

      if (mktContract) {
        const offerCount = await marketplaceCtx.loadOfferCount(mktContract)

        marketplaceCtx.loadOffers(mktContract, offerCount)

        account && marketplaceCtx.loadUserFunds(mktContract, account)

        mktContract.events
          .OfferFilled()
          .on('data', (event) => {
            marketplaceCtx.updateOffer(event.returnValues.offerId)
            collectionCtx.updateOwner(
              event.returnValues.id,
              event.returnValues.user
            )
            marketplaceCtx.setMktIsLoading(false)
          })
          .on('error', (error) => {
            notification.error({
              message: 'Error',
              description: error
            })
          })

        mktContract.events
          .OfferCreated()
          .on('data', (event) => {
            marketplaceCtx.addOffer(event.returnValues)
            marketplaceCtx.setMktIsLoading(false)
          })
          .on('error', (error) => {
            notification.error({
              message: 'Error',
              description: error
            })
          })

        mktContract.events
          .OfferCancelled()
          .on('data', (event) => {
            marketplaceCtx.updateOffer(event.returnValues.offerId)
            collectionCtx.updateOwner(
              event.returnValues.id,
              event.returnValues.user
            )
            marketplaceCtx.setMktIsLoading(false)
          })
          .on('error', (error) => {
            notification.error({
              message: 'Error',
              description: error
            })
          })

        mktContract.events
          .ClaimFunds()
          .on('data', (event) => {
            if (event.returnValues.user === account) {
              marketplaceCtx.loadUserFunds(mktContract, account)
              marketplaceCtx.setMktIsLoading(false)
            }
          })
          .on('error', (error) => {
            notification.error({
              message: 'Error',
              description: error
            })
          })
      } else {
        window.alert(
          'NFTMarketplace contract not deployed to detected network.'
        )
      }

      collectionCtx.setNftIsLoading(false)
      marketplaceCtx.setMktIsLoading(false)

      window.ethereum.on('accountsChanged', (accounts) => {
        web3Ctx.loadAccount(web3)
        accounts[0] && marketplaceCtx.loadUserFunds(mktContract, accounts[0])
      })
    }

    initWeb3()
  }, [])

  return (
    <BrowserRouter>
      <div className="App">
        <AppLayout />
      </div>
    </BrowserRouter>
  )
}

export default App
