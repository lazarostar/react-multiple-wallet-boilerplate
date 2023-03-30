import React from "react";
import { useWeb3React } from "@web3-react/core";

import { metaMask } from "../connectors/metaMask";
import { walletConnect } from "../connectors/walletConnect";
import { trustWallet } from "../connectors/trustWallet";

import { WalletTypes } from "../values/WalletTypes";

const WalletContext = React.createContext();

const useWallet = () => {
  const value = React.useContext(WalletContext);
  if (!value) {
    throw new Error("useWallet must be used inside WalletContext");
  }
  return value;
};

const WalletProvider = ({ children }) => {
  const { account, isActive, isActivating } = useWeb3React();

  const [walletType, setWalletType] = React.useState();
  const [error, setError] = React.useState("");

  const connect = React.useCallback((walletType) => {
    try {
      switch (walletType) {
        case WalletTypes.METAMASK:
          metaMask.activate();
          break;
        case WalletTypes.WALLETCONNECT:
          walletConnect.activate();
          break;
        case WalletTypes.TRUSTWALLET:
          trustWallet.activate();
          break;
        default:
          throw new Error(`Not supported wallet type: ${walletType}`);
      }
    } catch (e) {
      setError(e.message);
    }
    setWalletType(walletType);
  }, []);

  const disconnect = React.useCallback(() => {
    try {
      switch (walletType) {
        case WalletTypes.METAMASK:
          metaMask.resetState();
          break;
        case WalletTypes.WALLETCONNECT:
          walletConnect.resetState();
          break;
        case WalletTypes.TRUSTWALLET:
          trustWallet.resetState();
          break;
        default:
          throw new Error(`Not supported wallet type: ${walletType}`);
      }
    } catch (e) {
      setError(e.message);
    }
  }, [walletType]);

  const value = React.useMemo(
    () => ({
      walletType,
      accountAddress: account,
      error,
      isConnecting: isActivating,
      isConnected: isActive,
      isError: !!error,
      connect,
      disconnect,
    }),
    [account, connect, disconnect, error, isActivating, isActive, walletType]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export { WalletProvider, useWallet };
