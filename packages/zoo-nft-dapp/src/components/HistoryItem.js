import { MoneyCollectFilled } from '@ant-design/icons'
import { Col, Image, List, Row } from 'antd'
import moment from 'moment'
import React, { useContext } from 'react'
import { IpfsGateway } from '../Constants'
import CollectionContext from '../web3/store/collection-context'
import EthPrice from './EthPrice'
import PropTypes from 'prop-types'

const HistoryItem = ({ item }) => {
  const collectionCtx = useContext(CollectionContext)

  const nftId = item.returnValues.id

  //
  // [2022/05/21 16:27]token id is 0 based and collection is reversed array.
  //
  const nft =
    collectionCtx.collection[collectionCtx.collection.length - 1 - nftId]

  const getHistoryDescription = () => {
    switch (item.event) {
      case 'OfferCreated':
        return (
          <Row align="middle" gutter={6}>
            <Col>Started saling with the price of</Col>
            <Col>
              <EthPrice
                price={item.returnValues.price}
                imageSize={16}
                textSize={16}
                padding={1}
              />
            </Col>
            <Col>.</Col>
          </Row>
        )
      case 'OfferFilled':
        return 'Bought item'
      case 'OfferCancelled':
        return 'Cancelled saling'
      case 'Earned':
        return (
          <Row align="middle" gutter={6}>
            <Col>Earned </Col>
            <Col>
              <EthPrice
                price={item.returnValues.amount}
                imageSize={16}
                textSize={16}
                padding={1}
              />
            </Col>
            <Col> by saling.</Col>
          </Row>
        )
      case 'ClaimFunds':
        return (
          <Row align="middle" gutter={6}>
            <Col>Withdrawn </Col>
            <Col>
              <EthPrice
                price={item.returnValues.amount}
                imageSize={16}
                textSize={16}
                padding={1}
              />
            </Col>
            <Col> into the wallet.</Col>
          </Row>
        )
    }
  }

  return (
    <List.Item>
      <Row align="middle" gutter={20}>
        <Col>
          {nft != null && (
            <Image
              src={`${IpfsGateway}/${nft.img}`}
              preview={false}
              width={60}
              height={60}
            />
          )}
          {item.event === 'ClaimFunds' && (
            <MoneyCollectFilled style={{ fontSize: 60 }} />
          )}
        </Col>
        <Col align="start" flex={1}>
          {nft != null && (
            <div>
              <span style={{ fontSize: 16, fontWeight: '600' }}>#{nft.id}</span>
              <span style={{ marginLeft: 6, fontSize: 16, fontWeight: '600' }}>
                {nft.title}
              </span>
            </div>
          )}
          <div>{getHistoryDescription()}</div>
          <div>
            {moment
              .unix(item.returnValues.timestamp)
              .format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </Col>
      </Row>
    </List.Item>
  )
}

HistoryItem.propTypes = {
  item: PropTypes.object
}

export default HistoryItem
