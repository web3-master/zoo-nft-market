import { Button, Card, Form, Input, Upload, Row, Col } from "antd";
import { useForm } from "antd/lib/form/Form";
import { UploadOutlined } from "@ant-design/icons";
import { useContext } from "react";
import Web3Context from "../web3/store/web3-context";

const Profile = () => {
  const web3Ctx = useContext(Web3Context);
  return (
    <Row style={{ margin: 60 }}>
      <Col span={24}>
        <Card title="My Profile">
          <Row justify="center">
            <Col span={4}>My Address</Col>
            <Col span={10}>{web3Ctx.account}</Col>
          </Row>
        </Card>
      </Col>
      <Col span={24} style={{ marginTop: 20 }}>
        <Card title="My NFT">
          <Row justify="center"></Row>
        </Card>
      </Col>
    </Row>
  );
};

export default Profile;
