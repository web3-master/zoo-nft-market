import { List, Skeleton } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import HistoryItem from '../../components/HistoryItem'
import CollectionContext from '../../web3/store/collection-context'
import MarketplaceContext from '../../web3/store/marketplace-context'
import Web3Context from '../../web3/store/web3-context'

const History = () => {
  const web3Ctx = useContext(Web3Context)
  const collectionCtx = useContext(CollectionContext)
  const marketplaceCtx = useContext(MarketplaceContext)

  const [historyItems, setHistoryItems] = useState([])

  useEffect(() => {
    loadHistory()
  }, [web3Ctx, collectionCtx, marketplaceCtx])

  const renderItem = (item, key) => {
    if (Object.keys(item).length === 0) {
      return (
        <List.Item>
          <Skeleton active />
        </List.Item>
      )
    } else {
      return <HistoryItem item={item} />
    }
  }

  const loadHistory = async () => {
    if (marketplaceCtx.contract != null) {
      const eventNames = [
        'OfferCreated',
        'OfferFilled',
        'OfferCancelled',
        'Earned',
        'ClaimFunds'
      ]

      const allEventsOfMePromises = eventNames.map((eventName) =>
        marketplaceCtx.contract.getPastEvents(eventName, {
          fromBlock: 0,
          toBlock: 'latest',
          filter: {
            user: web3Ctx.account
          }
        })
      )
      const allEventsOfMe = (await Promise.all(allEventsOfMePromises)).flat(1)

      const sortedEvents = allEventsOfMe.sort(
        (a, b) => b.blockNumber - a.blockNumber
      )

      setHistoryItems(sortedEvents)
    }
  }

  return (
    <List
      locale={{ emptyText: 'No history yet!' }}
      dataSource={historyItems}
      renderItem={renderItem}
      pagination={{
        position: 'bottom',
        pageSize: 5,
        total: historyItems.length,
        showTotal: (total) => `Total ${total} items`
      }}
    />
  )
}

export default History
