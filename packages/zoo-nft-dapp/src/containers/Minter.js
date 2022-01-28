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
} from "antd";
import { useForm } from "antd/lib/form/Form";
import { UploadOutlined } from "@ant-design/icons";
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
  const marketplaceCtx = useContext(MarketplaceContext);

  const [form] = useForm();
  const [imageFileBuffer, setImageFileBuffer] = useState(null);

  const onFileSelected = (file) => {
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setImageFileBuffer(Buffer(reader.result));
    };
    return false;
  };

  const onCreate = async (values) => {
    let { name, description } = values;

    // Add file to the IPFS
    const fileAdded = await ipfs.add(imageFileBuffer);
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

    const metadataAdded = await ipfs.add(JSON.stringify(metadata));
    if (!metadataAdded) {
      notification["error"]({
        message: "Error",
        description: "Something went wrong when updloading the file",
      });
      return;
    }

    collectionCtx.contract.methods
      .safeMint(metadataAdded.path)
      .send({ from: web3Ctx.account })
      .on("transactionHash", (hash) => {
        collectionCtx.setNftIsLoading(true);
      })
      .on("error", (e) => {
        notification["error"]({
          message: "Error",
          description: "Something went wrong when pushing to the blockchain",
        });
        collectionCtx.setNftIsLoading(false);
      });
  };

  return (
    <Row style={{ margin: 60 }}>
      {collectionCtx.nftIsLoading && (
        <Col span={24}>
          <Alert message="Minting..." type="info" showIcon />
        </Col>
      )}
      <Col span={24} style={{ marginTop: 10 }}>
        <Card title="Create your own NFT!">
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
              <Upload name="image" beforeUpload={onFileSelected}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
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
