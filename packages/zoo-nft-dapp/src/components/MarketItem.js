import { Badge, Card, Image, List } from 'antd'
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { IpfsGateway } from '../Constants'
import MarketplaceContext from '../web3/store/marketplace-context'
import './MarketItem.css'
import PropTypes from 'prop-types'

const MarketItem = ({ nft }) => {
  const marketplaceCtx = useContext(MarketplaceContext)
  const navigate = useNavigate()
  const offer = marketplaceCtx.getOffer(nft.id)

  const onClick = () => {
    navigate('/detail/' + nft.id)
  }

  const renderItemBody = () => {
    return (
      <Card
        hoverable
        cover={
          <div style={{ height: '240px', overflow: 'hidden' }}>
            <Image src={`${IpfsGateway}/${nft.img}`} preview={false} />
          </div>
        }
        bodyStyle={{ paddingLeft: 10, paddingRight: 10, paddingTop: 20 }}
      >
        <Card.Meta
          title={nft.title}
          description={
            <div className="Meta-description">{nft.description}</div>
          }
        />
      </Card>
    )
  }

  return (
    <List.Item onClick={onClick}>
      {offer === null ? (
        renderItemBody()
      ) : (
        <Badge.Ribbon text="In Sale" color="green">
          {renderItemBody()}
        </Badge.Ribbon>
      )}
    </List.Item>
  )
}

MarketItem.propTypes = {
  nft: PropTypes.shape({
    id: PropTypes.string,
    img: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string
  })
}

export default MarketItem
