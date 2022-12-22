import { WalletOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import web3 from '../web3/connection/web3'
import Web3Context from '../web3/store/web3-context'

const Account = () => {
  const web3Ctx = useContext(Web3Context)
  const isConnected = web3 && web3Ctx.account
  const navigate = useNavigate()

  const onConnect = () => {
    if (isConnected) {
      navigate('/profile')
    } else {
      navigate('/market')
      window.location.reload()
    }
  }

  return (
    <Button icon={<WalletOutlined />} ghost onClick={onConnect}>
      {isConnected ? web3Ctx.account.substring(0, 6) : 'Connect'}
    </Button>
  )
}

export default Account
