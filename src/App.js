import "./App.css";
import { useWallet } from "./contexts/walletContext";
import { WalletTypes } from "./values/WalletTypes";

function App() {
  const {
    accountAddress,
    isConnecting,
    isConnected,
    isError,
    error,
    connect,
    disconnect,
  } = useWallet();

  if (isError) return <div>Error: {error}</div>;

  return (
    <div className="container">
      {isConnected ? (
        <div>
          {accountAddress}
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : isConnecting ? (
        <div>Connecting ...</div>
      ) : (
        <div>
          <button onClick={() => connect(WalletTypes.METAMASK)}>
            Metamask
          </button>
          <button onClick={() => connect(WalletTypes.WALLETCONNECT)}>
            Wallet Connect
          </button>
          <button onClick={() => connect(WalletTypes.TRUSTWALLET)}>
            Trust Wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
