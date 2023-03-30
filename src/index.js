import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { WalletProvider } from "./contexts/walletContext";

import { hooks as metaMaskHooks, metaMask } from "./connectors/metaMask";
import {
  hooks as walletConnectHooks,
  walletConnect,
} from "./connectors/walletConnect";
import {
  hooks as trustWalletHooks,
  trustWallet,
} from "./connectors/trustWallet";
import { Web3ReactProvider } from "@web3-react/core";

const connectors = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [trustWallet, trustWalletHooks],
];

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Web3ReactProvider connectors={connectors}>
      <WalletProvider>
        <App />
      </WalletProvider>
    </Web3ReactProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
