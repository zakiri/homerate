import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';

const CHAIN_ID = process.env.REACT_APP_OSMO_CHAIN_ID || 'osmosis-1';
const RPC_URL = process.env.REACT_APP_OSMO_RPC_URL;
const GAS_PRICE_STR = process.env.GAS_PRICE || '0.025';

export const OsmoService = {
  async connectWallet(walletClient) {
    try {
      const chainId = CHAIN_ID;
      const signer = walletClient.getOfflineSigner(chainId);
      const accounts = await signer.getAccounts();

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];

      const gasPrice = GasPrice.fromString(`${GAS_PRICE_STR}uosmo`);

      const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, signer, {
        gasPrice
      });

      return {
        client,
        signer,
        account,
        chainId
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  },

  async executeContract(client, signer, contractAddress, message, funds = []) {
    try {
      const accounts = await signer.getAccounts();
      const account = accounts[0];

      const result = await client.execute(
        account.address,
        contractAddress,
        message,
        'auto',
        undefined,
        funds
      );

      return result;
    } catch (error) {
      console.error('Error executing contract:', error);
      throw error;
    }
  },

  async queryContract(client, contractAddress, query) {
    try {
      const result = await client.queryContractSmart(contractAddress, query);
      return result;
    } catch (error) {
      console.error('Error querying contract:', error);
      throw error;
    }
  },

  async transferTokens(client, signer, recipient, amount) {
    try {
      const accounts = await signer.getAccounts();
      const account = accounts[0];

      const result = await client.sendTokens(
        account.address,
        recipient,
        [{ denom: 'uosmo', amount }],
        'auto'
      );

      return result;
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  },

  async getBalance(client, address) {
    try {
      const balance = await client.getBalance(address, 'uosmo');
      return balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }
};
