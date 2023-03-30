import { initializeConnector } from "@web3-react/core";
import { Connector } from "@web3-react/types";

class TrustWallet extends Connector {
  get connected() {
    return !!this.provider?.isConnected();
  }

  constructor({ actions, onError }) {
    super(actions, onError);
  }

  activate(desiredChainIdOrChainParameters) {
    this.isomorphicInitialize();

    if (!this.provider) {
      window.open("https://trustwallet.com/browser-extension/", "_blank");
      return;
    }

    const desiredChainId =
      typeof desiredChainIdOrChainParameters === "number"
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId;

    if (
      this.connected &&
      desiredChainId &&
      desiredChainId === this.parseChainId(this.provider.chainId)
    ) {
      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;

      return this.provider
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: desiredChainIdHex }],
        })
        .catch(async (error) => {
          if (
            error.code === 4902 &&
            typeof desiredChainIdOrChainParameters !== "number"
          ) {
            // if we're here, we can try to add a new network
            return this.provider?.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  ...desiredChainIdOrChainParameters,
                  chainId: desiredChainIdHex,
                },
              ],
            });
          }

          throw error;
        });
    }

    return Promise.all([
      this.provider.request({ method: "eth_chainId" }),
      this.provider.request({ method: "eth_requestAccounts" }),
    ]).then(([chainId, accounts]) => {
      const receivedChainId = this.parseChainId(chainId);

      if (!desiredChainId || desiredChainId === receivedChainId) {
        return this.actions.update({ chainId: receivedChainId, accounts });
      }

      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;

      return this.provider
        ?.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: desiredChainIdHex }],
        })
        .catch(async (error) => {
          if (
            error.code === 4902 &&
            typeof desiredChainIdOrChainParameters !== "number"
          ) {
            // if we're here, we can try to add a new network
            return this.provider?.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  ...desiredChainIdOrChainParameters,
                  chainId: desiredChainIdHex,
                },
              ],
            });
          }

          throw error;
        });
    });
  }

  /** {@inheritdoc Connector.connectEagerly} */
  async connectEagerly() {
    this.isomorphicInitialize();

    if (!this.provider) return;

    return Promise.all([
      this.provider.request({ method: "eth_chainId" }),
      this.provider.request({ method: "eth_accounts" }),
    ])
      .then(([chainId, accounts]) => {
        if (accounts.length) {
          this.actions.update({
            chainId: this.parseChainId(chainId),
            accounts,
          });
        } else {
          throw new Error("No accounts returned");
        }
      })
      .catch((error) => {
        console.debug("Could not connect eagerly", error);
        this.actions.resetState();
      });
  }

  detectProvider() {
    this.provider =
      this.isTrust(window.ethereum) ||
      window.trustwallet ||
      window.ethereum?.providers?.find(
        (provider) => provider.isTrust || provider.isTrustWallet
      );

    if (this.provider) {
      return this.provider;
    }
  }

  isTrust(ethereum) {
    const isTrustWallet = !!ethereum?.isTrust || !!ethereum?.isTrustWallet;
    if (!isTrustWallet) return;
    return ethereum;
  }

  isomorphicInitialize() {
    const provider = this.detectProvider();
    if (provider) {
      provider.on("connect", ({ chainId }) => {
        this.actions.update({ chainId: this.parseChainId(chainId) });
      });

      provider.on("disconnect", (error) => {
        this.provider?.request({ method: "PUBLIC_disconnectSite" });

        this.actions.resetState();
        this.onError?.(error);
      });

      provider.on("chainChanged", (chainId) => {
        this.actions.update({ chainId: Number(chainId) });
      });

      provider.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          // handle this edge case by disconnecting
          this.actions.resetState();
        } else {
          this.actions.update({ accounts });
        }
      });
    }
  }

  parseChainId(chainId) {
    return Number.parseInt(chainId, 16);
  }
}

export const [trustWallet, hooks] = initializeConnector(
  (actions) =>
    new TrustWallet({
      actions,
    })
);
