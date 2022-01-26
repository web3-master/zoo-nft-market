import { Layout, Row, Col } from "antd";
import { Content, Footer, Header } from "antd/lib/layout/layout";
import Market from "../containers/Market";
import Minter from "../containers/Minter";
import AppMenu from "../menu/AppMenu";
import Account from "../components/Account";
import logo from "../images/opensea.png";
import { Route, Routes } from "react-router-dom";
import web3 from "../web3/connection/web3";
import Web3Context from "../web3/store/web3-context";
import CollectionContext from "../web3/store/collection-context";
import MarketplaceContext from "../web3/store/marketplace-context";
import { useContext } from "react";
import Profile from "../containers/Profile";

const AppLayout = () => {
  const web3Ctx = useContext(Web3Context);
  const isConnected = web3 && web3Ctx.account;

  return (
    <Row>
      <Col span={18} offset={3}>
        <Layout style={{ minHeight: "100vh" }}>
          <Header>
            <Row align="stretch" gutter={20}>
              <Col>
                <img src={logo} width={40} height={40} />
              </Col>
              <Col>
                <h1>
                  <font color="white">NFT Market</font>
                </h1>
              </Col>
              <Col flex="auto"></Col>
              <Col>
                <AppMenu />
              </Col>
              <Col>
                <Account />
              </Col>
            </Row>
          </Header>
          <Content>
            <Routes>
              <Route path="/" element={<Market />} />
              <Route path="/market" element={<Market />} />
              <Route path="/mint" element={<Minter />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Content>
          <Footer
            style={{
              position: "sticky",
              bottom: 0,
            }}
          >
            All rights reserved by Daniel Armstrong.
          </Footer>
        </Layout>
      </Col>
    </Row>
  );
};

export default AppLayout;
