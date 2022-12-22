import { Row } from 'antd'
import PropTypes from 'prop-types'
import React from 'react'
import { formatPrice } from '../helpers/utils'
import ethImage from '../images/eth.png'

const EthPrice = ({ price, imageSize = 30, textSize = 40, padding = 10 }) => {
  return (
    <Row justify="center" align="middle">
      <img src={ethImage} width={imageSize} height={imageSize} />
      <span
        style={{
          fontSize: textSize,
          fontWeight: '600',
          marginLeft: padding
        }}
      >
        {formatPrice(price)}
      </span>
    </Row>
  )
}

EthPrice.propTypes = {
  price: PropTypes.string,
  imageSize: PropTypes.number,
  textSize: PropTypes.number,
  padding: PropTypes.number
}

export default EthPrice
