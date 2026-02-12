/**
 * Master Blockchain Account Service
 * ETH ve OSMO ağlarında ana borsyıalı account yönetişi
 * ⚠️  ASLA private key'leri log etmeyin!
 */

import dotenv from 'dotenv';
import ethers from 'ethers';
import { SigningStargateClient } from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

dotenv.config();

class MasterBlockchainAccount {
  constructor() {
    this.ethWallet = null;
    this.osmoWallet = null;
    this.ethProvider = null;
    this.osmoClient = null;
    
    this.initialized = false;
    this.accounts = {
      eth: {
        address: null,
        network: 'ethereum',
        chainId: process.env.ETH_CHAIN_ID || '1',
        rpcUrl: process.env.ETH_NETWORK_URL
      },
      osmo: {
        address: null,
        network: 'osmosis',
        chainId: process.env.OSMO_CHAIN_ID || 'osmosis-1',
        rpcUrl: process.env.OSMO_RPC_URL
      }
    };
  }

  /**
   * Master account'ı başlat
   */
  async initialize() {
    try {
      if (!process.env.MASTER_ACCOUNT_ENABLED || process.env.MASTER_ACCOUNT_ENABLED === 'false') {
        console.log('⏭️  Master account disabled');
        return false;
      }

      console.log('\n🔐 Initializing Master Blockchain Account...');

      // Ethereum Wallet Configuration
      if (process.env.ETH_MASTER_PRIVATE_KEY) {
        await this.initializeEthereumWallet();
      }

      // Osmosis Wallet Configuration
      if (process.env.OSMO_MASTER_PRIVATE_KEY) {
        await this.initializeOsmosisWallet();
      }

      this.initialized = true;
      console.log('✅ Master account initialized successfully\n');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize master account:', error.message);
      return false;
    }
  }

  /**
   * Ethereum wallet'ı başlat
   */
  async initializeEthereumWallet() {
    try {
      const privateKey = process.env.ETH_MASTER_PRIVATE_KEY;

      if (!privateKey || privateKey.length !== 64) {
        throw new Error('Invalid ETH private key format (must be 64 hex characters)');
      }

      // Provider oluştur
      this.ethProvider = new ethers.JsonRpcProvider(
        process.env.ETH_NETWORK_URL || 'https://eth.llamarpc.com'
      );

      // Wallet oluştur
      this.ethWallet = new ethers.Wallet(privateKey, this.ethProvider);

      // Bilgileri baskala
      this.accounts.eth.address = this.ethWallet.address;

      console.log('✅ Ethereum Wallet initialized');
      console.log(`   Address: ${this.ethWallet.address}`);
      console.log(`   Network: ${process.env.ETH_NETWORK_URL || 'Default RPC'}`);
    } catch (error) {
      console.error('❌ Ethereum wallet initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Osmosis wallet'ı başlat
   */
  async initializeOsmosisWallet() {
    try {
      const privateKey = process.env.OSMO_MASTER_PRIVATE_KEY;

      if (!privateKey) {
        throw new Error('OSMO_MASTER_PRIVATE_KEY not provided');
      }

      // Cosmos wallet oluştur (Mnemonic veya hex olabilir)
      let wallet;

      if (privateKey.split(' ').length === 12 || privateKey.split(' ').length === 24) {
        // Mnemonic
        wallet = await DirectSecp256k1HdWallet.fromMnemonic(
          privateKey,
          { prefix: 'osmo' }
        );
      } else {
        // Hex private key handle (simpler çalışti)
        console.warn('⚠️  For Osmosis, mnemonic format is recommended over hex key');
        throw new Error('For now, please use mnemonic format for Osmosis');
      }

      // Account bilgisini al
      const [account] = await wallet.getAccounts();
      this.accounts.osmo.address = account.address;

      console.log('✅ Osmosis Wallet initialized');
      console.log(`   Address: ${account.address}`);
      console.log(`   Network: ${process.env.OSMO_RPC_URL || 'Default RPC'}`);
    } catch (error) {
      console.error('❌ Osmosis wallet initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Ethereum balancesı getir
   */
  async getEthereumBalance() {
    try {
      if (!this.ethWallet) {
        throw new Error('Ethereum wallet not initialized');
      }

      const balance = await this.ethProvider.getBalance(this.ethWallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching ETH balance:', error.message);
      throw error;
    }
  }

  /**
   * Osmosis account'ı getir (read-only)
   */
  getOsmosisAccount() {
    if (!this.osmoWallet) {
      throw new Error('Osmosis wallet not initialized');
    }

    return this.accounts.osmo;
  }

  /**
   * Ethereum işlem gönder
   */
  async sendEthereumTransaction(toAddress, amount) {
    try {
      if (!this.ethWallet) {
        throw new Error('Ethereum wallet not initialized');
      }

      // Amount'ı wei'ye çevir
      const amountWei = ethers.parseEther(amount.toString());

      // Transaction
      const tx = await this.ethWallet.sendTransaction({
        to: toAddress,
        value: amountWei,
        gasLimit: 21000
      });

      console.log('📤 Ethereum transaction sent:', tx.hash);
      return tx;
    } catch (error) {
      console.error('Error sending Ethereum transaction:', error.message);
      throw error;
    }
  }

  /**
   * Master account bilgisini getir
   */
  getMasterAccountInfo() {
    return {
      enabled: this.initialized,
      name: process.env.MASTER_ACCOUNT_NAME || 'HomerateExchange',
      accounts: {
        ethereum: {
          address: this.accounts.eth.address,
          network: this.accounts.eth.network,
          chainId: this.accounts.eth.chainId,
          initialized: this.ethWallet !== null
        },
        osmosis: {
          address: this.accounts.osmo.address,
          network: this.accounts.osmo.network,
          chainId: this.accounts.osmo.chainId,
          initialized: this.osmoWallet !== null
        }
      }
    };
  }

  /**
   * Sağlık kontrolü
   */
  async healthCheck() {
    try {
      const status = {
        ethereum: false,
        osmosis: false
      };

      // ETH kontrolü
      if (this.ethWallet && this.ethProvider) {
        try {
          const balance = await this.getEthereumBalance();
          status.ethereum = {
            connected: true,
            address: this.ethWallet.address,
            balance: `${balance} ETH`
          };
        } catch (err) {
          status.ethereum = { connected: false, error: err.message };
        }
      }

      return status;
    } catch (error) {
      console.error('Health check failed:', error.message);
      throw error;
    }
  }
}

export default new MasterBlockchainAccount();
