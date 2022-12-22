import {
  ShoppingCartOutlined,
  WalletOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  InputNumber,
  notification,
  Result,
  Row,
  Skeleton
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EthPrice from '../components/EthPrice'
import { IpfsGateway } from '../Constants'
import ethImage from '../images/eth.png'
import web3 from '../web3/connection/web3'
import CollectionContext from '../web3/store/collection-context'
import MarketplaceContext from '../web3/store/marketplace-context'
import Web3Context from '../web3/store/web3-context'
import './Details.css'

const Detail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [createSaleForm] = useForm()
  const web3Ctx = useContext(Web3Context)
  const collectionCtx = useContext(CollectionContext)
  const marketplaceCtx = useContext(MarketplaceContext)
  const [nft, setNft] = useState(null)
  const [offer, setOffer] = useState(null)
  const [invalidId, setInvalidId] = useState(false)
  const [burnProcessing, setBurnProcessing] = useState(false)

  const loadNft = async () => {
    const contract = collectionCtx.contract
    if (contract == null) {
      return
    }

    try {
      const hash = await contract.methods.tokenURI(id).call()
      const response = await fetch(`${IpfsGateway}/${hash}?clear`)
      if (!response.ok) {
        throw new Error('Something went wrong')
      }

      const metadata = await response.json()
      const owner = await contract.methods.ownerOf(id).call()

      setNft({
        id,
        title: metadata.properties.name.description,
        description: metadata.properties.description.description,
        img: metadata.properties.image.description,
        owner
      })
    } catch (error) {
      setInvalidId(true)
    }
  }

  const loadOffer = () => {
    const offer = marketplaceCtx.getOffer(id)
    setOffer(offer)
  }

  useEffect(() => {
    if (burnProcessing === true) {
      return
    }

    loadNft()
    loadOffer()
  }, [web3Ctx, collectionCtx, marketplaceCtx])

  const owner = offer == null ? (nft != null ? nft.owner : '') : offer.user

  if (!collectionCtx.nftIsLoading && invalidId) {
    return (
      <Result
        status="warning"
        title="Sorry, the item you visited does not exist."
        extra={
          <Button
            type="primary"
            key="console"
            onClick={() => navigate('/market')}
          >
            Go Market
          </Button>
        }
      />
    )
  }

  const renderBuy = () => {
    return (
      <Card title="Sale" style={{ marginBottom: 10 }}>
        <EthPrice price={offer.price} />
        <Button
          icon={<WalletOutlined />}
          type="primary"
          style={{ marginTop: 10 }}
          onClick={buy}
        >
          Buy
        </Button>
      </Card>
    )
  }

  const buy = async () => {
    if (web3Ctx.account == null) {
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
      return
    }

    marketplaceCtx.contract.methods
      .fillOffer(offer.offerId)
      .send({
        from: web3Ctx.account,
        value: offer.price
      })
      .on('transactionHash', (hash) => {
        marketplaceCtx.setMktIsLoading(true)
      })
      .on('error', (error) => {
        notification.error({
          message: 'Error',
          description: 'Something went wrong when pushing to the blockchain'
        })
        marketplaceCtx.setMktIsLoading(false)
        console.log(error)
      })
  }

  const renderMySale = () => {
    return (
      <Card title="Sale" style={{ marginBottom: 10 }}>
        <EthPrice price={offer.price} />
        <Button
          type="primary"
          onClick={cancelOffer}
          style={{ marginTop: 10, background: 'red', borderColor: 'red' }}
        >
          Cancel
        </Button>
      </Card>
    )
  }

  const cancelOffer = () => {
    marketplaceCtx.contract.methods
      .cancelOffer(offer.offerId)
      .send({ from: web3Ctx.account })
      .on('transactionHash', (hash) => {
        marketplaceCtx.setMktIsLoading(true)
      })
      .on('error', (error) => {
        notification.error({
          message: 'Error',
          description: 'Something went wrong when pushing to the blockchain'
        })
        marketplaceCtx.setMktIsLoading(false)
        console.log(error)
      })
  }

  const renderCreateSale = () => {
    return (
      <Card title="Create Sale" style={{ marginBottom: 20 }}>
        <Form form={createSaleForm} layout="inline" onFinish={createSale}>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please input price!' }]}
          >
            <InputNumber
              addonBefore={<img src={ethImage} width={14} height={14} />}
              placeholder="0.0"
            />
          </Form.Item>

          <Form.Item>
            <Button
              icon={<ShoppingCartOutlined />}
              type="primary"
              htmlType="submit"
              style={{ background: 'green', borderColor: 'green' }}
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </Card>
    )
  }

  const createSale = (values) => {
    const { price } = values
    const enteredPrice = web3.utils.toWei(price.toString(), 'ether')

    collectionCtx.contract.methods
      .approve(marketplaceCtx.contract.options.address, nft.id)
      .send({ from: web3Ctx.account })
      .on('transactionHash', (hash) => {
        marketplaceCtx.setMktIsLoading(true)
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        if (confirmationNumber === 0) {
          marketplaceCtx.contract.methods
            .makeOffer(nft.id, enteredPrice)
            .send({ from: web3Ctx.account })
            .on('error', (error) => {
              notification.error({
                message: 'Error',
                description:
                  'Something went wrong when pushing to the blockchain'
              })
              marketplaceCtx.setMktIsLoading(false)
              console.log(error)
            })
        }
      })
  }

  const renderBurnButton = () => {
    return (
      <Button
        icon={<DeleteOutlined />}
        type="primary"
        style={{ background: 'red', borderColor: 'red', marginTop: 30 }}
        onClick={onBurn}
      >
        Delete this item
      </Button>
    )
  }

  const onBurn = () => {
    collectionCtx.contract.methods
      .burn(nft.id)
      .send({ from: web3Ctx.account })
      .on('transactionHash', (hash) => {
        setBurnProcessing(true)
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        if (confirmationNumber === 0) {
          setBurnProcessing(false)
          notification.success({
            message: 'Delete success',
            description: 'NFT item deleted!'
          })
          navigate('/market')
        }
      })
      .on('error', (error) => {
        notification.error({
          message: 'Error',
          description: 'Something went wrong when pushing to the blockchain'
        })
        setBurnProcessing(false)
        console.log(error)
      })
  }

  return (
    <Row style={{ margin: 20 }}>
      <Col span={16} offset={4} style={{ marginTop: 10 }}>
        {nft == null && <Skeleton active />}
        {nft != null && (
          <>
            {marketplaceCtx.mktIsLoading && (
              <Alert message="Processing..." type="info" showIcon />
            )}
            {burnProcessing && (
              <Alert message="Deleting..." type="info" showIcon />
            )}
            <Card title={'Zoo NFT #' + nft.id} style={{ marginTop: 10 }}>
              <Row gutter={20}>
                <Col span={12}>
                  <img src={`${IpfsGateway}/${nft.img}`} className="Image" />
                </Col>
                <Col span={12}>
                  {offer != null &&
                    offer.user !== web3Ctx.account &&
                    renderBuy()}
                  {offer != null &&
                    offer.user === web3Ctx.account &&
                    renderMySale()}
                  {offer == null &&
                    nft.owner === web3Ctx.account &&
                    renderCreateSale()}

                  <Collapse defaultActiveKey={['1', '2', '3']}>
                    <Collapse.Panel header="Title" key="1">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'start'
                        }}
                      >
                        {nft.title}
                      </div>
                    </Collapse.Panel>
                    <Collapse.Panel header="Description" key="2">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'start'
                        }}
                      >
                        {nft.description}
                      </div>
                    </Collapse.Panel>
                    <Collapse.Panel header="Owner" key="3">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'start'
                        }}
                      >
                        {owner}
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                </Col>
              </Row>
            </Card>
            {offer == null &&
              nft.owner === web3Ctx.account &&
              renderBurnButton()}
          </>
        )}
      </Col>
    </Row>
  )
}

export default Detail
