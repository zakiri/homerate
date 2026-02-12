# 🔐 Private Key Security Best Practices

## ❌ ASLA YAPMAYINIZ!

```javascript
// ❌ WRONG - Private key in code
const privateKey = "2ce58fca99c476b9877b1a7e08c0a1e553a53aa104052f708ddf767aacec404e";

// ❌ WRONG - Private key in git
git commit -m "add master account" -a
# .env dosyasında private key varsa push'lanır!

// ❌ WRONG - Private key in logs
console.log("Private key:", privateKey);
console.error("Account:", privateKey);

// ❌ WRONG - Private key in request/response
app.get('/api/account', (req, res) => {
  res.json({ privateKey: "..." }); // NEVER!
});

// ❌ WRONG - Private key in database
db.accounts.insertOne({ 
  address: "0x...",
  privateKey: "..."  // NEVER!
});
```

---

## ✅ DOĞRU YÖNTEMLER

### Method 1: Environment Variables (Local Development)

```bash
# .env (NEVER COMMIT)
ETH_MASTER_PRIVATE_KEY=2ce58fca99c476b9877b1a7e08c0a1e553a53aa104052f708ddf767aacec404e

# Code
const privateKey = process.env.ETH_MASTER_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey);

# .gitignore
.env
.env.local
.env.*.local
```

### Method 2: Vault (Production)

```javascript
// HashiCorp Vault, AWS Secrets Manager, etc.
import vault from 'node-vault';

const client = vault({ endpoint: process.env.VAULT_ADDR });
const secret = await client.read('secret/data/homerate/eth-key');
const privateKey = secret.data.data.key;
```

### Method 3: Hardware Wallet (Maximum Security)

```javascript
// Ledger, Trezor, etc.
const transport = Transport('path-to-device');
const wallet = new LedgerEthereumProvider(transport);
```

---

## 📋 Security Checklist

### Immediate (Before Running)

- [ ] `.env` file created LOCALLY ONLY
- [ ] `.env` NEVER committed to git
- [ ] `.gitignore` contains `.env`
- [ ] Private key in `.env` only, nowhere else
- [ ] Private key is 64 hex characters (no 0x prefix)
- [ ] No logs contain private key
- [ ] No database contains private key
- [ ] No API response contains private key

### Development

- [ ] `.env` excluded from IDE git integration
- [ ] IDE doesn't show private keys in .env
- [ ] Terminal history doesn't contain private key
- [ ] Browser DevTools don't expose private key
- [ ] Local MongoDB secure (auth enabled for production)
- [ ] API endpoints require authentication (except health)

### Before Deployment

- [ ] Private key removed from local .env
- [ ] New private key generated for production
- [ ] Production private key in Vault/Secrets Manager
- [ ] Audit trail enabled for key access
- [ ] Key rotation policy established
- [ ] Backup keys created and stored securely
- [ ] CI/CD doesn't log sensitive variables
- [ ] Production database isolated and encrypted

---

## 🔄 Key Rotation Process

### Every 6 Months

```bash
# 1. Generate new key
openssl rand -hex 32

# 2. Update Vault/Secrets Manager
aws secretsmanager update-secret --secret-id eth-key --secret-string "new-key"

# 3. Deploy new version
git pull && npm install && npm run deploy

# 4. Verify switch
curl /api/blockchain/master-account/info

# 5. Revoke old key
# - Transfer remaining balance
# - Update all references
# - Archive old key securely
```

---

## 🚨 If Key is Compromised

**IMMEDIATE ACTIONS:**

1. **Revoke the key:**
   ```bash
   # Transfer all funds to new address
   # Revoke permissions
   # Delete from all systems
   ```

2. **Generate new key:**
   ```bash
   # Use secure methods (hardware wallet, airgapped machine)
   # Never online/connected
   ```

3. **Update everywhere:**
   ```bash
   # Update secrets manager
   # Rotate in code
   # Update backups
   # Notify team
   ```

4. **Audit:**
   ```bash
   # Check transaction history
   # Monitor for unauthorized transactions
   # Review access logs
   ```

---

## 🔍 Verification Commands

### Private Key Format Check

```bash
# Valid: 64 hex characters (no 0x)
$ ETH_PRIVATE_KEY="2ce58fca99c476b9877b1a7e08c0a1e553a53aa104052f708ddf767aacec404e"

# Check length
$ echo -n "$ETH_PRIVATE_KEY" | wc -c
64  # ✅ Correct

# Check characters
$ echo "$ETH_PRIVATE_KEY" | grep -E '^[0-9a-f]{64}$'
2ce58fca... # ✅ Valid

# Generate address (verify it matches)
$ node -e "const ethers = require('ethers'); const w = new ethers.Wallet('0x$ETH_PRIVATE_KEY'); console.log(w.address);"
0x... # Should match ETH_MASTER_ADDRESS
```

### Git Safety Check

```bash
# Verify .env is ignored
$ git check-ignore .env
.env  # ✅ Ignored

# Verify nothing sensitive is tracked
$ git grep "PRIVATE_KEY" -- . ':(exclude).env*'
# Should return nothing

# Check git history for accidents
$ git log -S "PRIVATE_KEY" --oneline
# Should show nothing
```

### Runtime Safety Check

```javascript
// Add to backend startup
if (process.env.NODE_ENV === 'production') {
  if (process.env.ETH_MASTER_PRIVATE_KEY) {
    console.warn('⚠️  WARNING: Private key in environment!');
    console.warn('   Use Vault/Secrets Manager instead!');
  }
}
```

---

## 🛡️ Logging Guidelines

### Safe Logging

```javascript
// ✅ GOOD
console.log('Master account initialized');
console.log(`ETH Address: ${wallet.address}`);

// ✅ GOOD
logger.info('Account status', {
  ethAddress: wallet.address,
  osmoAddress: wallet.osmoAddress,
  verified: true
  // NO private key!
});
```

### Unsafe Logging

```javascript
// ❌ BAD
console.log('Private key:', privateKey);
console.log('Wallet:', wallet); // Contains privateKey property!
console.error(error, { privateKey }); // Error context
logger.debug('Full wallet', wallet); // Debug mode still logs

// ❌ BAD - Accidental exposure
try {
  await wallet.sendTransaction(...);
} catch(e) {
  console.error(e); // Error might contain key
  throw e; // Stack trace might contain key
}
```

### Redacting Logs

```javascript
// Sensitive data redacter
function redactSensitive(data) {
  return JSON.stringify(data)
    .replace(/0x[a-fA-F0-9]{64}/g, '0x...REDACTED...')
    .replace(/[0-9a-f]{64}/g, '...REDACTED...');
}

console.log(redactSensitive({
  privateKey: "2ce58fca...",
  address: "0x..."
}));
// {"privateKey":"...REDACTED...","address":"0x..."}
```

---

## 📚 Resources

- [OWASP: Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Ethers.js: Wallet Guide](https://docs.ethers.org/v6/api/wallet/)
- [CosmJS: Key Management](https://github.com/cosmos/cosmjs)
- [HashiCorp Vault](https://www.vaultproject.io/)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)

---

## ✅ Compliance Checklist

- [ ] No credentials in source code
- [ ] No credentials in configuration files (except .env.example)
- [ ] No credentials in git history
- [ ] No credentials in logs
- [ ] No credentials in error messages
- [ ] Keys rotated regularly
- [ ] Access audit logged
- [ ] Principle of least privilege
- [ ] Encrypted at rest
- [ ] Encrypted in transit
- [ ] Secure key derivation
- [ ] Strong entropy source

---

**Last Updated:** 11 Şubat 2026  
**Status:** Critical Security Document
