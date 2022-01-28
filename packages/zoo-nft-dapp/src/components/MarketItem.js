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
} from "antd";
import { PayCircleOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useContext } from "react";
import CollectionContext from "../web3/store/collection-context";
import MarketplaceContext from "../web3/store/marketplace-context";
import Web3Context from "../web3/store/web3-context";
import web3 from "../web3/connection/web3";
import { formatPrice } from "../helpers/utils";
import "./MarketItem.css";

const MarketItem = ({ nft }) => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);

  const index = marketplaceCtx.offers
    ? marketplaceCtx.offers.findIndex((offer) => offer.id === nft.id)
    : -1;
  const owner = index === -1 ? nft.owner : marketplaceCtx.offers[index].user;
  const price =
    index !== -1
      ? formatPrice(marketplaceCtx.offers[index].price).toFixed(2)
      : null;

  const makeOfferHandler = (values) => {
    const enteredPrice = web3.utils.toWei(values.price, "ether");

    collectionCtx.contract.methods
      .approve(marketplaceCtx.contract.options.address, nft.id)
      .send({ from: web3Ctx.account })
      .on("transactionHash", (hash) => {
        marketplaceCtx.setMktIsLoading(true);
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        if (confirmationNumber == 0) {
          marketplaceCtx.contract.methods
            .makeOffer(nft.id, enteredPrice)
            .send({ from: web3Ctx.account })
            .on("error", (error) => {
              notification["error"]({
                message: "Error",
                description:
                  "Something went wrong when pushing to the blockchain",
              });
              marketplaceCtx.setMktIsLoading(false);
            });
        }
      });
  };

  const buyHandler = () => {
    marketplaceCtx.contract.methods
      .fillOffer(marketplaceCtx.offers[index].offerId)
      .send({
        from: web3Ctx.account,
        value: marketplaceCtx.offers[index].price,
      })
      .on("transactionHash", (hash) => {
        marketplaceCtx.setMktIsLoading(true);
      })
      .on("error", (error) => {
        notification["error"]({
          message: "Error",
          description: "Something went wrong when pushing to the blockchain",
        });
        marketplaceCtx.setMktIsLoading(false);
      });
  };

  const cancelHandler = () => {
    marketplaceCtx.contract.methods
      .cancelOffer(marketplaceCtx.offers[index].offerId)
      .send({ from: web3Ctx.account })
      .on("transactionHash", (hash) => {
        marketplaceCtx.setMktIsLoading(true);
      })
      .on("error", (error) => {
        notification["error"]({
          message: "Error",
          description: "Something went wrong when pushing to the blockchain",
        });
        marketplaceCtx.setMktIsLoading(false);
      });
  };

  return (
    <List.Item>
      <Card
        hoverable
        cover={
          <div style={{ height: "200px", overflow: "hidden" }}>
            <Image src={`https://ipfs.infura.io/ipfs/${nft.img}`} />
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
        {/* {index !== -1 ? (
          owner !== web3Ctx.account ? (
            <Row>
              <Col flex={1}>
                <Button type="primary" onClick={buyHandler}>
                  Buy
                </Button>
              </Col>
              <Col flex={1}>{price}</Col>
            </Row>
          ) : (
            <Row>
              <Col flex={1}>
                <Button type="primary" onClick={cancelHandler}>
                  Cancel
                </Button>
              </Col>
              <Col flex={1}>{price}</Col>
            </Row>
          )
        ) : owner === web3Ctx.account ? (
          <Form layout="inline" onFinish={makeOfferHandler}>
            <Form.Item
              name="price"
              rules={[{ required: true, message: "Please input price!" }]}
            >
              <Input
                prefix={<PayCircleOutlined className="site-form-item-icon" />}
                placeholder="Price"
                style={{ width: "90px" }}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<ShoppingCartOutlined />}
            >
              Offer
            </Button>
          </Form>
        ) : (
          <p></p>
        )} */}
      </Card>
    </List.Item>
  );
};

export default MarketItem;
