import { Menu } from "antd";
import {
  AppstoreOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import React, { useContext, useState } from "react";
import web3 from "../web3/connection/web3";
import Web3Context from "../web3/store/web3-context";
import CollectionContext from "../web3/store/collection-context";
import MarketplaceContext from "../web3/store/marketplace-context";

const AppMenu = () => {
  const web3Ctx = useContext(Web3Context);
  const isConnected = web3 && web3Ctx.account;

  return (
    <Menu mode="horizontal">
      <Menu.Item key="market" icon={<AppstoreOutlined />}>
        Market
        <Link to="/market" />
      </Menu.Item>
      <Menu.Item key="mint" icon={<PlusOutlined />}>
        Mint
        <Link to="/mint" />
      </Menu.Item>
    </Menu>
  );
};

export default AppMenu;
