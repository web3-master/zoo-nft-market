import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Web3Provider from './web3/store/Web3Provider'
import CollectionProvider from './web3/store/CollectionProvider'
import MarketplaceProvider from './web3/store/MarketplaceProvider'
import App from './App'
import reportWebVitals from './reportWebVitals'

ReactDOM.render(
  <React.StrictMode>
    <Web3Provider>
      <CollectionProvider>
        <MarketplaceProvider>
          <App />
        </MarketplaceProvider>
      </CollectionProvider>
    </Web3Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
