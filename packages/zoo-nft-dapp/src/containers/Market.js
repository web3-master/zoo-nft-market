import { ControlOutlined, TableOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Radio,
  Row,
  Skeleton,
  Space
} from 'antd'
import CollapsePanel from 'antd/lib/collapse/CollapsePanel'
import { useForm } from 'antd/lib/form/Form'
import React, { useContext, useEffect, useState } from 'react'
import MarketItem from '../components/MarketItem'
import { DECIMALS } from '../helpers/utils'
import CollectionContext from '../web3/store/collection-context'
import MarketplaceContext from '../web3/store/marketplace-context'
import Web3Context from '../web3/store/web3-context'

const Market = () => {
  const web3Ctx = useContext(Web3Context)
  const collectionCtx = useContext(CollectionContext)
  const marketplaceCtx = useContext(MarketplaceContext)
  const [items, setItems] = useState([])

  const [keyword, setKeyword] = useState('')
  const [filterState, setFilterState] = useState(0) // 0: All, 1: InSale, 2: OnAuction
  const [filterPriceMin, setFilterPriceMin] = useState(0)
  const [filterPriceMax, setFilterPriceMax] = useState(0)

  const [keywordForm] = useForm()
  const [priceForm] = useForm()

  useEffect(() => {
    setItems(collectionCtx.collection)
  }, [web3Ctx, collectionCtx, marketplaceCtx])

  useEffect(() => {
    let result = []
    if (keyword === '') {
      result = collectionCtx.collection
    } else {
      result = collectionCtx.collection.filter(
        (nft) =>
          nft.title.includes(keyword) || nft.description.includes(keyword)
      )
    }

    if (filterState > 0) {
      if (filterState === 1) {
        result = result.filter(
          (nft) => marketplaceCtx.getOffer(nft.id) !== null
        )
      }
    }

    if (filterPriceMin > 0 && filterPriceMax > 0) {
      result = result.filter((nft) => {
        const offer = marketplaceCtx.getOffer(nft.id)
        if (
          offer !== null &&
          offer.price >= filterPriceMin * DECIMALS &&
          offer.price <= filterPriceMax * DECIMALS
        ) {
          return true
        } else return false
      })
    }

    setItems(result)
  }, [keyword, filterState, filterPriceMin, filterPriceMax])

  const renderItem = (nft, key) => {
    if (Object.keys(nft).length === 0) {
      return (
        <List.Item>
          <Skeleton active />
        </List.Item>
      )
    } else {
      return <MarketItem nft={nft} />
    }
  }

  const onKeywordSubmit = () => {
    setKeyword(keywordForm.getFieldValue('keyword'))
  }

  const onPriceSubmit = () => {
    const min = parseFloat(priceForm.getFieldValue('min'))
    const max = parseFloat(priceForm.getFieldValue('max'))
    if (min > max) {
      message.error('Please input correct price range!')
      return
    }
    setFilterPriceMin(min)
    setFilterPriceMax(max)
  }

  const onFilterStateChange = (e) => {
    setFilterState(e.target.value)
  }

  const renderFilterBar = () => {
    return (
      <Col span={4}>
        <Card
          title={
            <span>
              <ControlOutlined style={{ marginRight: 10 }} />
              Filter
            </span>
          }
          bodyStyle={{ padding: 0 }}
        >
          <Collapse defaultActiveKey={[1, 2, 3]}>
            <CollapsePanel header="Keyword" key={1}>
              <Form
                form={keywordForm}
                initialValues={{ keyword: '' }}
                onFinish={onKeywordSubmit}
              >
                <Row gutter={10}>
                  <Col flex={1}>
                    <Form.Item name="keyword" noStyle>
                      <Input placeholder="Keyword" />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item noStyle>
                      <Button type="primary" htmlType="submit">
                        Search
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </CollapsePanel>
            <CollapsePanel header="Status" key={2}>
              <Radio.Group value={filterState} onChange={onFilterStateChange}>
                <Space direction="vertical">
                  <Radio value={0} style={{ width: '100%' }}>
                    All
                  </Radio>
                  <Radio value={1} style={{ width: '100%' }}>
                    In Sale
                  </Radio>
                  <Radio value={2} style={{ width: '100%' }} disabled>
                    On Auction
                  </Radio>
                </Space>
              </Radio.Group>
            </CollapsePanel>
            <CollapsePanel header="Price" key={3}>
              <Form
                form={priceForm}
                initialValues={{ min: 0, max: 0 }}
                onFinish={onPriceSubmit}
              >
                <Row style={{ alignItems: 'top' }}>
                  <Col flex={1}>
                    <Form.Item name="min" noStyle>
                      <InputNumber placeholder="Min" />
                    </Form.Item>
                  </Col>
                  to
                  <Col flex={1}>
                    <Form.Item name="max" noStyle>
                      <InputNumber placeholder="Max" />
                    </Form.Item>
                  </Col>
                </Row>

                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginTop: 10 }}
                >
                  Apply
                </Button>
              </Form>
            </CollapsePanel>
          </Collapse>
        </Card>
      </Col>
    )
  }

  return (
    <Row style={{ margin: 20 }}>
      {collectionCtx.nftIsLoading && (
        <Col span={24}>
          <Alert message="Loading items..." type="info" showIcon />
        </Col>
      )}
      {!collectionCtx.nftIsLoading && marketplaceCtx.mktIsLoading && (
        <Col span={24}>
          <Alert message="Processing request..." type="info" showIcon />
        </Col>
      )}
      <Col span={24}>
        <Row gutter={10} style={{ marginTop: 10 }}>
          {renderFilterBar()}
          <Col span={20}>
            <Card
              title={
                <span>
                  <TableOutlined style={{ marginRight: 10 }} />
                  All Items
                </span>
              }
            >
              {collectionCtx.nftIsLoading ? (
                <Skeleton />
              ) : (
                <List
                  grid={{
                    gutter: 32,
                    xs: 1,
                    sm: 2,
                    md: 2,
                    lg: 4,
                    xl: 4,
                    xxl: 4
                  }}
                  locale={{ emptyText: "There's nothing to show!" }}
                  dataSource={items}
                  renderItem={renderItem}
                  pagination={{
                    position: 'bottom',
                    pageSize: 8,
                    total: items.length,
                    showTotal: (total) => `Total ${total} items`
                  }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Market
