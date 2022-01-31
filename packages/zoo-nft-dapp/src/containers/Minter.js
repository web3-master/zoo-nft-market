import {
  Button,
  Card,
  Form,
  Input,
  Upload,
  Row,
  Col,
  notification,
  Alert,
  Result,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useForm } from "antd/lib/form/Form";
import { InboxOutlined } from "@ant-design/icons";
import { useContext, useState } from "react";
import Web3Context from "../web3/store/web3-context";
import CollectionContext from "../web3/store/collection-context";
import MarketplaceContext from "../web3/store/marketplace-context";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

const Minter = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  let navigate = useNavigate();

  const [form] = useForm();
  const [imageFileBuffer, setImageFileBuffer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);

  const onFileSelected = (file) => {
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setImageFileBuffer(Buffer(reader.result));
    };
    return false;
  };

  const onCreate = async (values) => {
    if (web3Ctx.account == null) {
      try {
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });
      } catch (error) {
        notification["error"]({
          message: "Error",
          description: error,
        });
      }
      return;
    }

    let { name, description } = values;

    setUploading(true);
    const fileAdded = await ipfs.add(imageFileBuffer);
    setUploading(false);

    if (!fileAdded) {
      notification["error"]({
        message: "Error",
        description: "Something went wrong when updloading the file",
      });
      return;
    }

    const metadata = {
      title: "Asset Metadata",
      type: "object",
      properties: {
        name: {
          type: "string",
          description: name,
        },
        description: {
          type: "string",
          description: description,
        },
        image: {
          type: "string",
          description: fileAdded.path,
        },
      },
    };

    setUploading(true);
    const metadataAdded = await ipfs.add(JSON.stringify(metadata));
    setUploading(false);
    if (!metadataAdded) {
      notification["error"]({
        message: "Error",
        description: "Something went wrong when creating metadata",
      });
      return;
    }

    setMinting(true);
    collectionCtx.contract.methods
      .safeMint(metadataAdded.path)
      .send({ from: web3Ctx.account })
      .on("transactionHash", (hash) => {
        collectionCtx.setNftIsLoading(true);
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        if (confirmationNumber == 0) {
          setMinting(false);
          setMintSuccess(true);
        }
      })
      .on("error", (e) => {
        setMinting(false);
        notification["error"]({
          message: "Error",
          description: "Something went wrong when pushing to the blockchain",
        });
        collectionCtx.setNftIsLoading(false);
      });
  };

  const onMintAgain = () => {
    setMintSuccess(false);
    form.resetFields();
  };

  if (mintSuccess) {
    return (
      <Result
        style={{ marginTop: 60 }}
        status="success"
        title="Successfully minted new NFT!"
        subTitle="You can check this new NFT in market page or profile page."
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={() => navigate("/market")}
          >
            Go Market
          </Button>,
          <Button key="buy" onClick={onMintAgain}>
            Mint Again
          </Button>,
        ]}
      />
    );
  }

  return (
    <Row style={{ margin: 60 }}>
      {minting && (
        <Col span={12} offset={6}>
          <Alert message="Minting..." type="info" showIcon />
        </Col>
      )}
      {uploading && (
        <Col span={12} offset={6}>
          <Alert message="Uploading image..." type="info" showIcon />
        </Col>
      )}
      <Col span={12} offset={6} style={{ marginTop: 10 }}>
        <Card title="Create New NFT">
          <Form
            form={form}
            layout="vertical"
            labelCol={8}
            wrapperCol={16}
            onFinish={onCreate}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please input name!" }]}
            >
              <Input placeholder="Input nft name here." />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please input description!" }]}
            >
              <Input.TextArea placeholder="Input nft description here." />
            </Form.Item>

            <Form.Item
              label="Image"
              name="image"
              rules={[{ required: true, message: "Please select image!" }]}
            >
              <Upload.Dragger
                name="image"
                beforeUpload={onFileSelected}
                maxCount={1}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">Support for a singe image.</p>
              </Upload.Dragger>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 12 }}>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default Minter;
