import { initializeConnector } from "@web3-react/core";
import { WalletConnect } from "@web3-react/walletconnect";

export const [walletConnect, hooks] = initializeConnector(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: {
          1: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
        },
        bridge: "https://bridge.walletconnect.org",
        qrcode: true,
      },
    })
);
