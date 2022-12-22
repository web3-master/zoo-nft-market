import { InboxOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  notification,
  Result,
  Row,
  Upload
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { Blob, File, NFTStorage } from 'nft.storage'
import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NetworkId, NFT_STORAGE_TOKEN } from '../Constants'
import CollectionContext from '../web3/store/collection-context'
import Web3Context from '../web3/store/web3-context'

const nftStorageClient = new NFTStorage({ token: NFT_STORAGE_TOKEN })

const Minter = () => {
  const web3Ctx = useContext(Web3Context)
  const collectionCtx = useContext(CollectionContext)
  const navigate = useNavigate()

  const [form] = useForm()
  const [imageFileBuffer, setImageFileBuffer] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [minting, setMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)

  const onFileSelected = (file) => {
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      setImageFileBuffer(Buffer.from(reader.result))
    }
    return false
  }

  const onCreate = async (values) => {
    if (web3Ctx.account == null) {
      try {
        await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error
        })
      }
      return
    }

    if (web3Ctx.networkId !== NetworkId) {
      notification.error({
        message: 'Error',
        description:
          'This network is not supported. Please connect to Goerli network in MetaMask!'
      })
      return
    }

    const { name, description } = values

    setUploading(true)
    const imageFileBlob = new File([imageFileBuffer], 'image.jpg', {
      type: 'image/jpg'
    })
    const fileAddedCid = await nftStorageClient.storeBlob(imageFileBlob)
    setUploading(false)

    if (!fileAddedCid) {
      notification.error({
        message: 'Error',
        description: 'Something went wrong when updloading the file'
      })
      return
    }

    const metadata = {
      title: 'Asset Metadata',
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: name
        },
        description: {
          type: 'string',
          description
        },
        image: {
          type: 'string',
          description: fileAddedCid
        }
      }
    }

    setUploading(true)
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'text/plain;charset=utf-8'
    })
    const metadataAddedCid = await nftStorageClient.storeBlob(metadataBlob)
    setUploading(false)

    if (!metadataAddedCid) {
      notification.error({
        message: 'Error',
        description: 'Something went wrong when creating metadata'
      })
      return
    }

    setMinting(true)
    collectionCtx.contract.methods
      .safeMint(metadataAddedCid)
      .send({ from: web3Ctx.account })
      .on('transactionHash', (hash) => {
        collectionCtx.setNftIsLoading(true)
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        if (confirmationNumber === 0) {
          setMinting(false)
          setMintSuccess(true)
        }
      })
      .on('error', (e) => {
        setMinting(false)
        notification.error({
          message: 'Error',
          description: 'Something went wrong when pushing to the blockchain'
        })
        collectionCtx.setNftIsLoading(false)
      })
  }

  const onMintAgain = () => {
    setMintSuccess(false)
    form.resetFields()
  }

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
            onClick={() => navigate('/market')}
          >
            Go Market
          </Button>,
          <Button key="buy" onClick={onMintAgain}>
            Mint Again
          </Button>
        ]}
      />
    )
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
              rules={[{ required: true, message: 'Please input name!' }]}
            >
              <Input placeholder="Input nft name here." />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please input description!' }]}
            >
              <Input.TextArea placeholder="Input nft description here." />
            </Form.Item>

            <Form.Item
              label="Image"
              name="image"
              rules={[{ required: true, message: 'Please select image!' }]}
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
  )
}

export default Minter
