import { Layout, Row, Col } from "antd";
import { Content, Footer, Header } from "antd/lib/layout/layout";
import Market from "../containers/Market";
import Minter from "../containers/Minter";
import AppMenu from "../menu/AppMenu";
import Account from "../components/Account";
import logo from "../images/zoo.png";
import { Route, Routes } from "react-router-dom";
import web3 from "../web3/connection/web3";
import Web3Context from "../web3/store/web3-context";
import CollectionContext from "../web3/store/collection-context";
import MarketplaceContext from "../web3/store/marketplace-context";
import { useContext } from "react";
import Profile from "../containers/profile/Profile";
import Detail from "../containers/Detail";
import WrongNetwork from "../containers/WrongNetwork";
import { NetworkId } from "../Constants";

const AppLayout = () => {
  const web3Ctx = useContext(Web3Context);
  const isConnected = web3 && web3Ctx.account;

  return (
    <Row>
      <Col span={24}>
        <Layout style={{ minHeight: "100vh" }}>
          <Header>
            <Row align="stretch" gutter={20}>
              <Col>
                <img src={logo} width={40} height={40} />
              </Col>
              <Col>
                <h1>
                  <font color="white">Zoo NFT Market</font>
                </h1>
              </Col>
              <Col flex="auto"></Col>
              <Col span={7}>
                {web3Ctx.networkId == NetworkId && <AppMenu />}
              </Col>
              <Col style={{ marginRight: 10 }}>
                <Account />
              </Col>
            </Row>
          </Header>
          <Content>
            {web3Ctx.networkId == NetworkId ? (
              <Routes>
                <Route path="/" element={<Market />} />
                <Route path="/market" element={<Market />} />
                <Route path="/mint" element={<Minter />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/detail/:id" element={<Detail />} />
              </Routes>
            ) : (
              <WrongNetwork />
            )}
          </Content>
          <Footer
            style={{
              position: "sticky",
              bottom: 0,
            }}
          >
            © 2022 All rights reserved by Daniel Armstrong.
          </Footer>
        </Layout>
      </Col>
    </Row>
  );
};

export default AppLayout;
