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
import { useNavigate } from "react-router-dom";

const MarketItem = ({ nft }) => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);
  let navigate = useNavigate();

  const onClick = () => {
    navigate("/detail/" + nft.id);
  };

  return (
    <List.Item onClick={onClick}>
      <Card
        hoverable
        cover={
          <div style={{ height: "200px", overflow: "hidden" }}>
            <Image
              src={`https://ipfs.infura.io/ipfs/${nft.img}`}
              preview={false}
            />
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
    </List.Item>
  );
};

export default MarketItem;
