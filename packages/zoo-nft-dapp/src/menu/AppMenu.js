import { AppstoreOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { Menu } from 'antd'
import { Link } from 'react-router-dom'

import React from 'react'

const AppMenu = () => {
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
      <Menu.Item key="profile" icon={<UserOutlined />}>
        My Page
        <Link to="/profile" />
      </Menu.Item>
    </Menu>
  )
}

export default AppMenu
