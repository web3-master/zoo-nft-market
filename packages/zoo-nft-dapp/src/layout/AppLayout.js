import { Col, Layout, Row } from 'antd'
import { Content, Footer, Header } from 'antd/lib/layout/layout'
import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Account from '../components/Account'
import { NetworkId } from '../Constants'
import Detail from '../containers/Detail'
import Market from '../containers/Market'
import Minter from '../containers/Minter'
import Profile from '../containers/profile/Profile'
import WrongNetwork from '../containers/WrongNetwork'
import logo from '../images/zoo.png'
import AppMenu from '../menu/AppMenu'
import Web3Context from '../web3/store/web3-context'

const AppLayout = () => {
  const web3Ctx = useContext(Web3Context)

  return (
    <Row>
      <Col span={24}>
        <Layout style={{ minHeight: '100vh' }}>
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
                {web3Ctx.networkId === NetworkId && <AppMenu />}
              </Col>
              <Col style={{ marginRight: 10 }}>
                <Account />
              </Col>
            </Row>
          </Header>
          <Content>
            {web3Ctx.networkId === NetworkId ? (
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
              position: 'sticky',
              bottom: 0
            }}
          >
            © 2022 All rights reserved by Daniel Armstrong.
          </Footer>
        </Layout>
      </Col>
    </Row>
  )
}

export default AppLayout
