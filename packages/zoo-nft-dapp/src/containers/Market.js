import {
  Button,
  Card,
  Form,
  Input,
  Upload,
  Row,
  Col,
  List,
  notification,
  Image,
  Skeleton,
  Alert,
} from "antd";
import { createRef, useContext, useRef, useState } from "react";
import MarketItem from "../components/MarketItem";
import web3 from "../web3/connection/web3";
import CollectionContext from "../web3/store/collection-context";
import MarketplaceContext from "../web3/store/marketplace-context";
import Web3Context from "../web3/store/web3-context";

const Market = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);

  const priceRefs = useRef([]);
  if (priceRefs.current.length !== collectionCtx.collection.length) {
    priceRefs.current = Array(collectionCtx.collection.length)
      .fill()
      .map((_, i) => priceRefs.current[i] || createRef());
  }

  const renderItem = (nft, key) => {
    if (Object.keys(nft).length == 0) {
      return (
        <List.Item>
          <Skeleton active />
        </List.Item>
      );
    } else {
      return <MarketItem nft={nft} />;
    }
  };

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
      <Col span={24} style={{ marginTop: 10 }}>
        <Card title={"All NFT Items"}>
          {collectionCtx.nftIsLoading ? (
            <Skeleton />
          ) : (
            <List
              grid={{ gutter: 32, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
              locale={{ emptyText: "There's nothing to show!" }}
              dataSource={collectionCtx.collection}
              renderItem={renderItem}
              pagination={{ position: "bottom", pageSize: 8 }}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default Market;
