import { useNavigate } from "react-router-dom";
import { WalletOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { useContext, useState } from "react";
import web3 from "../web3/connection/web3";
import Web3Context from "../web3/store/web3-context";
import CollectionContext from "../web3/store/collection-context";
import MarketplaceContext from "../web3/store/marketplace-context";

const Account = () => {
  const web3Ctx = useContext(Web3Context);
  const isConnected = web3 && web3Ctx.account;
  let navigate = useNavigate();

  const onConnect = () => {
    if (isConnected) {
      navigate("/profile");
    } else {
      window.location.reload();
    }
  };

  return (
    <Button icon={<WalletOutlined />} ghost onClick={onConnect}>
      {isConnected ? web3Ctx.account.substring(0, 6) : "Connect"}
    </Button>
  );
};

export default Account;
