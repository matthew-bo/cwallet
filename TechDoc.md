# Technical Specification: Crypto Wallet for ChatGPT Store

## 1. System Architecture Overview

### 1.1 High-Level Architecture Components

**Build these four main systems:**

```
1. ChatGPT GPT Application (Frontend Layer)
   - Custom GPT in OpenAI's GPT Store
   - Natural language processing interface
   - MCP client integration
   
2. Wallet Backend Service (Core Layer)
   - Node.js/Python service on AWS/GCP
   - Custodial wallet management
   - Transaction orchestration
   - KYC/AML compliance engine
   
3. MCP Server (Context Bridge Layer)
   - Secure context provider
   - Session management
   - Rate limiting and security filters
   
4. Secure Web Portal (Confirmation Layer)
   - React-based web application
   - Transaction confirmation UI
   - Account management dashboard
```

### 1.2 Technology Stack Requirements (REVISED FOR MVP)

**Use these specific technologies:**
- **Backend Framework**: Next.js 14 with TypeScript (unified frontend + API routes)
- **Database**: DigitalOcean Managed PostgreSQL
- **Cache/Sessions**: DigitalOcean Managed Redis
- **Blockchain Integration**: ethers.js v6 for Ethereum
- **Authentication**: NextAuth.js with Google OAuth (no external service needed)
- **Key Management**: Google Cloud KMS (encryption only)
- **MCP Server**: Separate Node.js service on DigitalOcean Droplet
- **Hosting**: 
  - **Vercel** for Next.js app (frontend + API routes)
  - **DigitalOcean Droplets** for MCP server and transaction signer
- **CDN**: Vercel Edge Network (included) + CloudFlare (free tier for DDoS)
- **Monitoring**: Vercel Analytics (included) + Sentry (error tracking)

**Cost Breakdown:**
- Vercel Pro: $20/month
- DigitalOcean Droplet (MCP): $12/month
- DigitalOcean PostgreSQL: $15/month
- DigitalOcean Redis: $15/month
- Google Cloud KMS: ~$5/month
- **Total: $67/month** (vs $500+ with AWS)

**When to upgrade to AWS:**
- After 1,000+ active users
- Need multi-region deployment
- Require hardware HSM (CloudHSM)
- Enterprise compliance requirements

## 2. Third-Party Account Setup (Complete Before Coding)

### 2.1 Google Cloud Console Setup (REQUIRED DAY 1)

**Steps:**
1. Go to: console.cloud.google.com
2. Create new project: "crypto-wallet-gpt"
3. Enable APIs:
   - Google+ API (for OAuth)
   - Cloud Key Management Service API (for KMS)
4. Create OAuth 2.0 Credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://wallet.yourdomain.com/api/auth/callback/google` (production)
5. Create KMS Key Ring:
   - Navigate to Security → Key Management
   - Create key ring: "wallet-keyring"
   - Create key: "wallet-key" (symmetric encryption)
   - Location: "global"
6. Create Service Account for KMS access:
   - IAM & Admin → Service Accounts → Create
   - Grant role: "Cloud KMS CryptoKey Encrypter/Decrypter"
   - Download JSON key file

**Save these values:**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_KMS_PROJECT=crypto-wallet-gpt
GOOGLE_KMS_KEYRING=wallet-keyring
GOOGLE_KMS_KEY=wallet-key
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### 2.2 Infura/Alchemy Setup (REQUIRED DAY 1)

**Steps:**
1. Go to: infura.io (or alchemy.com)
2. Create free account
3. Create new project: "Crypto Wallet"
4. Get endpoints for:
   - Sepolia Testnet (development/testing)
   - Ethereum Mainnet (production)

**Save these values:**
```bash
INFURA_PROJECT_ID=your-project-id
INFURA_API_KEY=your-api-key
# Endpoints automatically constructed as:
# https://sepolia.infura.io/v3/{PROJECT_ID}
# https://mainnet.infura.io/v3/{PROJECT_ID}
```

### 2.3 Stripe Setup (WEEK 2)

**Steps:**
1. Go to: stripe.com
2. Create account
3. Activate test mode first
4. Get API keys from Dashboard → Developers → API keys

**Save these values:**
```bash
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...

# Later, for production:
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_...
STRIPE_SECRET_KEY_LIVE=sk_live_...
STRIPE_WEBHOOK_SECRET_LIVE=whsec_...
```

### 2.4 DigitalOcean Setup (REQUIRED DAY 1)

**Steps:**
1. Create account at: digitalocean.com
2. Add payment method
3. Create Managed PostgreSQL:
   - Choose region closest to users
   - Plan: Basic ($15/mo minimum)
   - Database name: "wallet"
4. Create Managed Redis:
   - Plan: Basic ($15/mo minimum)
5. Create Droplet for MCP server:
   - Image: Ubuntu 22.04 LTS
   - Plan: Basic ($12/mo - 2GB RAM)
   - Add SSH key

**Save these values:**
```bash
DATABASE_URL=postgresql://user:pass@db-postgresql-nyc3-12345.ondigitalocean.com:25060/wallet?sslmode=require
REDIS_URL=redis://user:pass@db-redis-nyc3-12345.ondigitalocean.com:25061
DROPLET_IP=123.456.789.012
```

### 2.5 Vercel Setup (REQUIRED DAY 1)

**Steps:**
1. Go to: vercel.com
2. Sign up with GitHub account
3. Upgrade to Pro plan ($20/mo for better limits)
4. Import Git repository (after creating it)
5. Configure environment variables in Vercel dashboard

**Deployment is automatic** on every git push to main branch.

### 2.6 Domain Name Setup

**Purchase domain:**
- Recommended: Namecheap, Google Domains, or Cloudflare Registrar
- Suggested names: `simplewallet.chat`, `easycrypto.chat`, `walletgpt.com`

**DNS Configuration:**
```
# Point to Vercel
wallet.yourdomain.com → CNAME → cname.vercel-dns.com

# Point to DigitalOcean Droplet (for MCP server)
mcp.yourdomain.com → A → [DROPLET_IP]
```

### 2.7 OpenAI Platform Setup (WEEK 3)

**Steps:**
1. Ensure you have ChatGPT Plus subscription
2. Go to: chat.openai.com/gpts/editor
3. Create new GPT (don't publish yet)
4. Configure actions (after API is deployed)

**Note:** Only set up after Week 3 when API is ready for testing.

## 3. GPT Store Application Setup

### 3.1 GPT Configuration

**Create the GPT with these exact settings:**

```yaml
Name: "Simple Crypto Wallet"
Description: "Send, receive, and manage crypto with natural language"
Instructions: |
  You are a friendly crypto wallet assistant that helps users manage their digital assets.
  - Use simple banking terminology instead of crypto jargon
  - Always explain actions before executing
  - Never store or display private keys
  - Require confirmation for all transactions via secure web portal
  
Actions:
  - authenticate_user
  - get_wallet_balance
  - initiate_transaction
  - check_transaction_status
  - get_staking_options
  - initiate_onramp
  - initiate_offramp
  
Knowledge Base:
  - Crypto basics explained simply
  - Safety guidelines
  - Common troubleshooting
```

### 2.2 OpenAI Action Definitions

**Configure these exact API actions in the GPT:**

```json
{
  "openapi": "3.0.0",
  "servers": [
    {
      "url": "https://api.yourwalletdomain.com/v1"
    }
  ],
  "paths": {
    "/auth/session": {
      "post": {
        "summary": "Authenticate user via Gmail OAuth",
        "operationId": "authenticate_user",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "auth_code": {"type": "string"}
                }
              }
            }
          }
        }
      }
    },
    "/wallet/balance": {
      "get": {
        "summary": "Get wallet balances",
        "operationId": "get_wallet_balance",
        "parameters": [
          {
            "name": "session_token",
            "in": "header",
            "required": true,
            "schema": {"type": "string"}
          }
        ]
      }
    },
    "/transaction/initiate": {
      "post": {
        "summary": "Start a transaction",
        "operationId": "initiate_transaction",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "type": {"enum": ["send", "stake", "unstake"]},
                  "amount": {"type": "number"},
                  "recipient": {"type": "string"},
                  "currency": {"type": "string"}
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## 3. Backend Service Implementation

### 3.1 Database Schema

**Create these exact tables in PostgreSQL:**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  gmail_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  kyc_status ENUM('pending', 'verified', 'failed'),
  kyc_tier INTEGER DEFAULT 0
);

-- Wallets table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  blockchain VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, blockchain)
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  amount DECIMAL(36,18),
  currency VARCHAR(10),
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  blockchain_tx_hash VARCHAR(255),
  confirmation_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  executed_at TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  mcp_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 API Endpoint Specifications

**Implement these exact endpoints:**

```
POST /v1/auth/session
- Input: Gmail OAuth code
- Process: Validate with Google, create/retrieve user, generate MCP token
- Output: { session_token, mcp_server_url, expires_in }

GET /v1/wallet/balance
- Headers: Authorization: Bearer {session_token}
- Process: Retrieve all wallet balances for user
- Output: { wallets: [{ blockchain, address, balances: {token: amount} }] }

POST /v1/transaction/initiate
- Headers: Authorization: Bearer {session_token}
- Input: { type, amount, recipient, currency }
- Process: 
  1. Validate request parameters
  2. Check user limits and KYC status
  3. Generate confirmation_token
  4. Return confirmation URL
- Output: { confirmation_url, expires_in, transaction_id }

GET /v1/transaction/confirm/{confirmation_token}
- Serves secure web page for transaction confirmation
- Must include 2FA if amount > $100

POST /v1/transaction/execute/{confirmation_token}
- Input: { confirmed: true, otp_code? }
- Process: Sign and broadcast transaction
- Output: { status, tx_hash }
```

### 3.3 Security Implementation

**Implement these security measures exactly:**

```javascript
// Rate Limiting Configuration
const rateLimits = {
  authentication: "5 requests per minute per IP",
  balance_check: "30 requests per minute per user",
  transaction_initiate: "10 requests per minute per user",
  transaction_execute: "5 requests per minute per user"
};

// Transaction Limits (enforce in backend)
const transactionLimits = {
  kyc_tier_0: {
    daily_limit_usd: 100,
    per_transaction_usd: 50,
    requires_2fa: false
  },
  kyc_tier_1: {
    daily_limit_usd: 1000,
    per_transaction_usd: 500,
    requires_2fa: true
  },
  kyc_tier_2: {
    daily_limit_usd: 10000,
    per_transaction_usd: 5000,
    requires_2fa: true
  }
};

// Key Management
const keyManagement = {
  master_key_storage: "AWS KMS or GCP Secret Manager",
  wallet_key_encryption: "AES-256-GCM",
  key_derivation: "HD wallet with BIP-44 standard",
  backup_strategy: "Encrypted backups to separate region"
};
```

## 4. MCP Server Implementation

### 4.1 MCP Server Configuration

**Build the MCP server with these specifications:**

```yaml
# mcp-server-config.yaml
name: crypto-wallet-mcp
version: 1.0.0
protocol: stdio

resources:
  wallet_balance:
    description: "Current wallet balances"
    uri: "wallet://balance"
    mimeType: "application/json"
    
  transaction_history:
    description: "Recent transactions"
    uri: "wallet://transactions"
    mimeType: "application/json"
    
  user_limits:
    description: "User transaction limits"
    uri: "wallet://limits"
    mimeType: "application/json"

tools:
  get_balance:
    description: "Get wallet balance"
    inputSchema:
      type: object
      properties:
        currency:
          type: string
          
  prepare_transaction:
    description: "Prepare a transaction for confirmation"
    inputSchema:
      type: object
      properties:
        type:
          type: string
          enum: ["send", "stake"]
        amount:
          type: number
        recipient:
          type: string
```

### 4.2 MCP Context Injection

**Implement this exact context injection flow:**

```python
# MCP Server Implementation Structure
class WalletMCPServer:
    def __init__(self):
        self.backend_api = "https://api.yourwalletdomain.com/v1"
        
    async def handle_resource_request(self, uri: str, token: str):
        """
        Map MCP resource requests to backend API calls
        """
        if uri == "wallet://balance":
            return await self.fetch_balance(token)
        elif uri == "wallet://transactions":
            return await self.fetch_transactions(token)
        elif uri == "wallet://limits":
            return await self.fetch_limits(token)
            
    async def handle_tool_call(self, tool: str, args: dict, token: str):
        """
        Handle tool invocations from GPT
        """
        if tool == "get_balance":
            return await self.get_filtered_balance(args, token)
        elif tool == "prepare_transaction":
            return await self.initiate_transaction(args, token)
            
    def sanitize_response(self, data: dict):
        """
        Remove sensitive data before returning to GPT
        """
        # Never include: private keys, full addresses, session tokens
        # Always include: masked addresses, balances, transaction status
        pass
```

## 5. Secure Web Portal

### 5.1 Web Portal Structure

**Build these exact pages:**

```
/confirm/{confirmation_token}
- Transaction confirmation page
- Display: amount, recipient, fees, estimated time
- Require: checkbox confirmation + submit button
- Optional: 2FA code input for high-value transactions

/dashboard
- User wallet overview
- Wallet addresses with QR codes
- Transaction history
- Settings (enable/disable staking, set limits)

/onramp
- Fiat payment integration
- Support: ACH, debit/credit cards
- Provider: Use Stripe or Plaid for compliance

/offramp
- Withdrawal to bank account
- KYC verification status
- Withdrawal limits display
```

### 5.2 Frontend Security Requirements

**Implement these security features:**

```javascript
// Content Security Policy
const CSP = {
  "default-src": "'self'",
  "script-src": "'self' 'unsafe-inline' https://js.stripe.com",
  "style-src": "'self' 'unsafe-inline'",
  "img-src": "'self' data: https:",
  "connect-src": "'self' https://api.yourwalletdomain.com"
};

// Session Management
const sessionConfig = {
  timeout: 15 * 60 * 1000, // 15 minutes
  warning: 2 * 60 * 1000,  // 2 minute warning
  autoLogout: true,
  secureOnly: true,
  sameSite: 'strict'
};

// Transaction Confirmation
const confirmationRequirements = {
  displayTime: 10, // seconds before allowing confirmation
  requireCheckbox: true,
  requireReentry: false, // true for amounts > $1000
  require2FA: false // true based on KYC tier
};
```

## 6. Compliance and Legal Requirements

### 6.1 KYC/AML Implementation

**Implement this exact KYC flow:**

```
Tier 0 (Default):
- Email verification only
- Limits: $100/day
- No fiat off-ramp

Tier 1 ($100-1000/day):
- Name, DOB, Address
- Phone verification
- Identity document upload
- Provider: Use Jumio or Onfido API

Tier 2 ($1000+/day):
- Enhanced due diligence
- Source of funds
- Video verification
- Manual review required
```

### 6.2 OpenAI Compliance

**Ensure these restrictions:**

```javascript
const openAIRestrictions = {
  // Never provide these capabilities
  prohibited: [
    "price predictions",
    "trading advice",
    "investment recommendations",
    "margin trading",
    "derivatives",
    "gambling tokens"
  ],
  
  // Always include these disclaimers
  requiredDisclosures: [
    "This is not financial advice",
    "Cryptocurrency investments carry risk",
    "Past performance doesn't guarantee future results"
  ],
  
  // Content filtering
  filterPhrases: [
    "guaranteed returns",
    "risk-free",
    "insider information",
    "pump and dump"
  ]
};
```

## 7. Deployment Instructions (REVISED: Vercel + DigitalOcean)

### 7.1 Infrastructure Setup

**Deploy in this exact order:**

```bash
# DAY 1: Database Setup (DigitalOcean)
1. Create Managed PostgreSQL database
2. Note connection string
3. Run migration scripts via psql or Prisma
4. Create Managed Redis instance

# DAY 1-2: Next.js Application Setup
1. Create Next.js project:
   npx create-next-app@latest crypto-wallet-gpt --typescript --tailwind --app
   
2. Set up project structure:
   /app
     /api              # API routes
       /auth           # NextAuth.js
       /wallet         # Wallet endpoints
       /transaction    # Transaction endpoints
     /confirm          # Confirmation pages
     /dashboard        # User dashboard
   /lib                # Utilities, database, blockchain
   /components         # React components

3. Initialize Git and push to GitHub

4. Connect to Vercel:
   - Import repository
   - Add environment variables
   - Deploy automatically

# DAY 3: MCP Server Setup (DigitalOcean Droplet)
1. SSH into droplet
2. Install Node.js:
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
3. Clone MCP server code
4. Install dependencies: npm install
5. Set up PM2 for process management:
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   pm2 save

6. Configure Nginx reverse proxy:
   sudo apt install nginx
   # Configure SSL with Let's Encrypt

# WEEK 3: GPT Configuration
1. Create GPT in OpenAI platform
2. Add API actions pointing to Vercel deployment
3. Configure OAuth callback
4. Test in preview mode
5. Submit for review (when ready)
```

### 7.2 Environment Variables (Complete List)

**Vercel Environment Variables:**
```bash
# Database & Cache
DATABASE_URL=postgresql://user:pass@db-postgresql-nyc3.ondigitalocean.com:25060/wallet?sslmode=require
REDIS_URL=redis://user:pass@db-redis-nyc3.ondigitalocean.com:25061

# NextAuth (Generate with: openssl rand -base64 32)
NEXTAUTH_URL=https://wallet.yourdomain.com
NEXTAUTH_SECRET=your-random-secret-string

# Google OAuth & KMS
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_KMS_PROJECT=crypto-wallet-gpt
GOOGLE_KMS_KEYRING=wallet-keyring  
GOOGLE_KMS_KEY=wallet-key
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account"...}'

# Blockchain
INFURA_PROJECT_ID=your-infura-project-id
INFURA_API_KEY=your-infura-api-key
ETHEREUM_NETWORK=sepolia # or mainnet

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Config
NEXT_PUBLIC_APP_URL=https://wallet.yourdomain.com
NEXT_PUBLIC_MCP_SERVER_URL=https://mcp.yourdomain.com
TRANSACTION_LIMIT_TIER_0=100 # USD per month
```

**DigitalOcean Droplet Environment Variables (.env):**
```bash
# Same database/redis/Google Cloud credentials as above
DATABASE_URL=...
REDIS_URL=...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# MCP Server Config
PORT=3001
NODE_ENV=production
MAX_CONNECTIONS=1000
```

**Note:** The original AWS-based environment variables have been replaced with the simpler Vercel + DigitalOcean + Google Cloud setup above. No AWS KMS, ECS, or CloudFormation configuration needed for MVP.

### 7.3 Monitoring and Logging

**Set up these exact monitoring points:**

```yaml
Metrics to Track:
  - API response times (p50, p95, p99)
  - Transaction success rate
  - KYC conversion funnel
  - Session duration
  - Error rates by endpoint
  
Alerts to Configure:
  - Transaction failures > 5% (critical)
  - API latency > 2s (warning)
  - Database CPU > 80% (warning)
  - Unusual transaction patterns (security)
  - KYC provider downtime (critical)
  
Logging Requirements:
  - All API requests (with redacted sensitive data)
  - Transaction lifecycle events
  - KYC decisions
  - Security events (failed auth, rate limits)
  - MCP context injections
```

## 8. Testing Requirements

### 8.1 Test Coverage

**Implement these exact test scenarios:**

```
Unit Tests (90% coverage required):
  - Wallet creation and key management
  - Transaction validation logic
  - KYC tier calculations
  - Rate limiting logic
  
Integration Tests:
  - Gmail OAuth flow
  - Blockchain transaction broadcasting
  - MCP context injection
  - Stripe payment processing
  
E2E Tests:
  - Complete user onboarding
  - Send transaction flow
  - Staking/unstaking
  - Fiat on-ramp/off-ramp
  
Security Tests:
  - SQL injection attempts
  - XSS prevention
  - Rate limit enforcement
  - Session hijacking prevention
```

### 8.2 Staging Environment

**Create exact replica with these test parameters:**

```javascript
const stagingConfig = {
  blockchain: "Sepolia Testnet",
  fiatProvider: "Stripe Test Mode",
  kycProvider: "Jumio Sandbox",
  transactionLimits: {
    multiplier: 0.01, // 1% of production limits
  },
  testUsers: [
    { email: "test-tier0@example.com", kyc: 0 },
    { email: "test-tier1@example.com", kyc: 1 },
    { email: "test-tier2@example.com", kyc: 2 }
  ]
};
```

## 9. Launch Checklist

**Complete these tasks before GPT Store submission:**

```markdown
- [ ] Legal review of terms of service
- [ ] Privacy policy published
- [ ] OpenAI GPT review submission
- [ ] Load testing (1000 concurrent users)
- [ ] Security audit completed
- [ ] KYC provider contract signed
- [ ] Customer support system ready
- [ ] Documentation website live
- [ ] Incident response plan documented
- [ ] Data backup and recovery tested
- [ ] SSL certificates configured
- [ ] WAF rules configured
- [ ] DDoS protection enabled
- [ ] Monitoring dashboards created
- [ ] On-call rotation established
```

## Critical Implementation Notes for AI Agent

**Follow these instructions exactly when coding:**

1. **Never store private keys in the GPT or MCP context** - All keys must be managed by the backend service only
2. **Always require web-based confirmation** for transactions - Never execute transactions from chat alone
3. **Implement idempotency** for all transaction endpoints using confirmation tokens
4. **Use decimal libraries** for all currency calculations to avoid floating point errors
5. **Log everything** but redact sensitive data (keys, full addresses, passwords)
6. **Validate all inputs** both in GPT actions and backend API
7. **Use prepared statements** for all database queries to prevent SQL injection
8. **Implement circuit breakers** for all external service calls
9. **Cache aggressively** but never cache sensitive data
10. **Test rollback procedures** for failed transactions before production

This specification provides the complete blueprint for building the Crypto Wallet GPT. Each component must be implemented exactly as specified to ensure compliance, security, and functionality.

# Technical Specification: Crypto Wallet for ChatGPT Store (Extended)

## 10. Frontend UI Specifications

### 10.1 ChatGPT Interface Components

**Implement these exact UI elements within ChatGPT responses:**

```javascript
// Response Templates for GPT to Use
const chatTemplates = {
  walletDisplay: `
    💰 **Your Wallet Balance**
    ━━━━━━━━━━━━━━━━━━━━
    Bitcoin: 0.0023 BTC ($95.43)
    Ethereum: 0.45 ETH ($1,082.25)
    USDC: 500.00 USDC ($500.00)
    
    📍 Receive Address: 0x7f9a...3d2e
    
    [View Full Dashboard](https://wallet.yourdomain.com/dashboard)
  `,
  
  transactionInitiated: `
    📤 **Transaction Prepared**
    ━━━━━━━━━━━━━━━━━━━━
    Sending: $50.00 USDC
    To: alice@gmail.com
    Network Fee: ~$0.25
    
    ⚠️ **Action Required:**
    Please confirm this transaction in the secure portal:
    
    [🔐 Confirm Transaction](https://wallet.yourdomain.com/confirm/{token})
    
    This link expires in 5 minutes.
  `,
  
  actionButtons: `
    **What would you like to do?**
    
    • Say "send money" to transfer funds
    • Say "add money" to buy crypto
    • Say "show balance" to see your wallet
    • Say "cash out" to withdraw to bank
    • Say "help" for more options
  `
};
```

### 10.2 Secure Web Portal UI Components

**Build these exact React components:**

```jsx
// Transaction Confirmation Page Layout
const ConfirmationPage = {
  components: {
    // Header Section
    header: {
      logo: "YourWallet Logo",
      securityBadge: "🔒 Secure Transaction",
      sessionTimer: "14:32 remaining"
    },
    
    // Transaction Details Card
    transactionCard: {
      title: "Confirm Your Transaction",
      fields: [
        { label: "From", value: "Your Wallet (****3d2e)", icon: "👤" },
        { label: "To", value: "alice@gmail.com (****8f4a)", icon: "📬" },
        { label: "Amount", value: "$50.00 USDC", style: "large-bold" },
        { label: "Network Fee", value: "~$0.25", style: "small-gray" },
        { label: "Total", value: "$50.25", style: "medium-bold" },
        { label: "Arrival Time", value: "~30 seconds", icon: "⏱️" }
      ]
    },
    
    // Security Check Section
    securityChecks: {
      checkboxes: [
        {
          id: "confirm-details",
          text: "I have verified the recipient address is correct",
          required: true
        },
        {
          id: "understand-final",
          text: "I understand this transaction cannot be reversed",
          required: true
        }
      ]
    },
    
    // 2FA Section (conditional)
    twoFactorAuth: {
      showIf: "amount > $100 OR user.securityLevel === 'high'",
      input: {
        type: "number",
        placeholder: "Enter 6-digit code",
        maxLength: 6,
        autoComplete: "one-time-code"
      },
      helpText: "Code sent to ****[email protected]"
    },
    
    // Action Buttons
    buttons: {
      primary: {
        text: "Confirm & Send",
        color: "green",
        disabled: "until all checkboxes checked AND (2FA filled if required)",
        loadingText: "Processing...",
        successText: "✓ Sent Successfully"
      },
      secondary: {
        text: "Cancel",
        color: "gray",
        action: "return to ChatGPT"
      }
    },
    
    // Footer
    footer: {
      securityNote: "This transaction will be processed on Ethereum network",
      supportLink: "Need help? Contact support"
    }
  }
};

// Dashboard Page Components
const DashboardComponents = {
  // Top Navigation Bar
  navbar: {
    elements: [
      { type: "logo", position: "left" },
      { type: "walletSelector", position: "center" },
      { type: "userMenu", position: "right", items: ["Settings", "Security", "Sign Out"] }
    ]
  },
  
  // Main Wallet Card
  walletCard: {
    balanceDisplay: {
      mainBalance: { fontSize: "48px", format: "$X,XXX.XX" },
      subBalance: { fontSize: "18px", format: "X.XXXX BTC", color: "gray" }
    },
    
    quickActions: [
      {
        id: "receive",
        icon: "📥",
        label: "Receive",
        action: "showQRModal"
      },
      {
        id: "send",
        icon: "📤",
        label: "Send",
        action: "openSendFlow"
      },
      {
        id: "buy",
        icon: "💳",
        label: "Add Money",
        action: "openOnramp"
      },
      {
        id: "sell",
        icon: "🏦",
        label: "Cash Out",
        action: "openOfframp"
      }
    ]
  },
  
  // QR Code Modal
  qrModal: {
    title: "Receive Cryptocurrency",
    tabs: ["Bitcoin", "Ethereum", "USDC"],
    content: {
      qrCode: { size: 200, errorCorrection: "M" },
      address: { 
        display: "truncated", 
        copyButton: true,
        format: "0x7f9a...3d2e"
      },
      networkWarning: "Only send [CURRENCY] to this address"
    }
  },
  
  // Transaction History Table
  transactionHistory: {
    columns: [
      { key: "type", header: "", width: "40px", icon: true },
      { key: "description", header: "Transaction", width: "40%" },
      { key: "amount", header: "Amount", width: "25%" },
      { key: "status", header: "Status", width: "20%" },
      { key: "date", header: "Date", width: "15%" }
    ],
    rowActions: {
      onClick: "expandDetails",
      contextMenu: ["View on Explorer", "Download Receipt"]
    }
  }
};

// Onramp/Buy Crypto Page
const OnrampComponents = {
  // Step 1: Amount Selection
  amountStep: {
    presetAmounts: ["$50", "$100", "$250", "$500", "$1000"],
    customInput: {
      type: "currency",
      min: 10,
      max: "based on KYC tier",
      placeholder: "Enter amount"
    },
    
    feeBreakdown: {
      display: "collapsible",
      rows: [
        { label: "Amount", value: "dynamic" },
        { label: "Processing Fee (2.9%)", value: "calculated" },
        { label: "Network Fee", value: "$2.00" },
        { label: "Total Charge", value: "sum", style: "bold" }
      ]
    }
  },
  
  // Step 2: Payment Method
  paymentStep: {
    methods: [
      {
        id: "ach",
        label: "Bank Transfer",
        subLabel: "3-5 days • 0.5% fee",
        icon: "🏦",
        recommended: true
      },
      {
        id: "debit",
        label: "Debit Card",
        subLabel: "Instant • 2.9% fee",
        icon: "💳"
      },
      {
        id: "wire",
        label: "Wire Transfer",
        subLabel: "1-2 days • $25 fee",
        icon: "📊",
        minAmount: 1000
      }
    ]
  },
  
  // Step 3: Confirmation
  confirmStep: {
    summary: {
      title: "Review Purchase",
      details: [
        { label: "You Pay", value: "$102.90" },
        { label: "You Receive", value: "0.0024 BTC" },
        { label: "Rate", value: "1 BTC = $42,875" },
        { label: "Arrives", value: "Instantly after payment clears" }
      ]
    },
    
    button: {
      text: "Complete Purchase",
      requiresTermsAcceptance: true
    }
  }
};
```

### 10.3 Mobile Responsive Design

**Implement these exact breakpoints and mobile adaptations:**

```css
/* Mobile-First Responsive Design */
.transaction-card {
  /* Mobile (default) */
  padding: 16px;
  margin: 8px;
  
  /* Tablet (768px+) */
  @media (min-width: 768px) {
    padding: 24px;
    margin: 16px auto;
    max-width: 600px;
  }
  
  /* Desktop (1024px+) */
  @media (min-width: 1024px) {
    padding: 32px;
    max-width: 720px;
  }
}

/* Mobile-Specific Components */
.mobile-optimizations {
  /* Large Touch Targets */
  button {
    min-height: 48px;
    min-width: 48px;
  }
  
  /* Sticky Confirmation Button */
  .confirm-button-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: white;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }
  
  /* Simplified Navigation */
  .mobile-nav {
    display: flex;
    justify-content: space-around;
    position: fixed;
    bottom: 0;
  }
}
```

## 11. Complete User Experience Flows

### 11.1 First-Time User Onboarding Flow

**Step-by-step user journey:**

```
1. DISCOVERY (in ChatGPT)
   User: "I want to try cryptocurrency"
   
   GPT Response:
   "Great! I can help you create a simple crypto wallet right here. 
   It's like a digital bank account for cryptocurrency. Let's get started!
   
   First, I'll need you to sign in with your Gmail account for security.
   
   [🔐 Sign in with Google]
   
   This keeps your wallet secure and makes it easy to access."

2. AUTHENTICATION REDIRECT
   → User clicks button
   → Redirects to: wallet.yourdomain.com/auth/google
   → Google OAuth consent screen
   → Returns to ChatGPT with success message

3. WALLET CREATION (automatic in background)
   GPT Response:
   "✅ Perfect! I've created your secure wallet. 
   
   Your wallet is now ready to receive cryptocurrency!
   Think of it like your account number at a bank.
   
   📍 Your wallet address: 0x7f9a...3d2e
   
   Would you like to:
   • Add some money to get started
   • Learn what you can do with crypto
   • See your wallet dashboard"

4. FIRST DEPOSIT
   User: "I want to add $50"
   
   GPT Response:
   "I'll help you add $50 to your wallet. You can pay with:
   • Bank account (lower fees, takes 3-5 days)
   • Debit card (instant, slightly higher fees)
   
   [💳 Add $50 with Debit Card] [🏦 Add $50 with Bank]
   
   Click your preferred payment method to continue securely."

5. PAYMENT COMPLETION
   → Redirects to: wallet.yourdomain.com/buy?amount=50&method=debit
   → Stripe payment form
   → Success page with animation
   → Auto-return to ChatGPT

6. SUCCESS CONFIRMATION
   GPT Response:
   "🎉 Congratulations! You now own cryptocurrency!
   
   💰 Your Balance:
   0.00116 BTC ($50.00)
   
   Your Bitcoin is safely stored and you can:
   • Send it to friends
   • Save it as an investment  
   • Use it for online purchases
   • Cash out to your bank anytime
   
   What would you like to learn about first?"
```

### 11.2 Sending Money Flow

**Complete send transaction journey:**

```
1. INITIATION
   User: "Send $20 to my friend Sarah at sarah@gmail.com"
   
   GPT Response:
   "I'll prepare that transaction for you. Let me set that up:
   
   📤 **Transaction Details:**
   • Sending: $20.00 in USDC
   • To: sarah@gmail.com
   • Network fee: ~$0.25
   • Sarah will receive: $20.00
   
   For security, you'll need to confirm this on our secure page:
   
   [🔐 Review & Confirm Transaction]
   
   This link expires in 5 minutes for your protection."

2. CONFIRMATION PAGE
   → User clicks link
   → Opens: wallet.yourdomain.com/confirm/[token]
   
   Page displays:
   ┌─────────────────────────────────┐
   │  Confirm Transaction             │
   │                                  │
   │  To: sarah@gmail.com            │
   │  └─ New recipient ⚠️             │
   │                                  │
   │  Amount: $20.00 USDC            │
   │  Fee: $0.25                     │
   │  ─────────────                  │
   │  Total: $20.25                  │
   │                                  │
   │  ☐ I verified the email address │
   │  ☐ I understand this is final   │
   │                                  │
   │  [Cancel] [Confirm & Send →]    │
   └─────────────────────────────────┘

3. SECURITY CHECK (for first-time recipient)
   Additional screen:
   ┌─────────────────────────────────┐
   │  ⚠️ First Time Sending to Sarah  │
   │                                  │
   │  Please double-check:           │
   │  sarah@gmail.com                │
   │                                  │
   │  [← Back] [Yes, this is correct]│
   └─────────────────────────────────┘

4. PROCESSING
   → Loading animation (3-5 seconds)
   → Blockchain transaction broadcast
   → Real-time status updates

5. SUCCESS
   Success page:
   ┌─────────────────────────────────┐
   │  ✅ Sent Successfully!           │
   │                                  │
   │  $20.00 sent to Sarah           │
   │  Transaction ID: 0xabc...def    │
   │                                  │
   │  Sarah will receive an email    │
   │  with instructions to claim     │
   │                                  │
   │  [View Details] [Back to Chat]  │
   └─────────────────────────────────┘

6. RETURN TO CHAT
   GPT Response:
   "✅ Success! I've sent $20 to Sarah.
   
   Transaction Summary:
   • Sent: $20.00 USDC
   • To: sarah@gmail.com  
   • Status: Completed
   • Transaction ID: ...def
   
   Sarah will receive an email with instructions to 
   claim the money. If she's new to crypto, I'll help 
   her set up a wallet too!
   
   Your remaining balance: $30.00"
```

### 11.3 Daily Active User Flow

**Returning user experience:**

```
1. GREETING
   User: "Hi, what's my balance?"
   
   GPT Response:
   "Welcome back! Here's your wallet:
   
   💰 Total Balance: $247.83
   • Bitcoin: 0.00234 BTC ($95.43)
   • Ethereum: 0.0645 ETH ($152.40)
   
   📈 24h Change: +$3.21 (+1.3%)
   
   You have 2 pending stakes earning ~5.2% APY
   
   Quick actions:
   • Say 'send' to transfer money
   • Say 'history' to see recent transactions
   • Say 'add money' to buy more crypto"

2. QUICK SEND (to saved contact)
   User: "Send $30 to Mom"
   
   GPT Response:
   "Sending $30 to Mom (saved contact: mom@email.com)
   
   [🔐 Quick Confirm - Slide to Send]
   
   Using your default: USDC with $0.25 fee"

3. ONE-CLICK CONFIRM
   → Simplified page for known recipients
   → Biometric authentication on mobile
   → Instant confirmation
```

## 12. Private Key Management Architecture

### 12.1 Key Generation and Storage

**Implement this exact key management system:**

```javascript
// Key Architecture Overview
const keyManagementSystem = {
  // NEVER store keys in:
  never: [
    "GPT conversation context",
    "MCP messages",
    "Browser localStorage",
    "Unencrypted database fields",
    "Log files",
    "Error messages"
  ],
  
  // Key Generation Flow
  keyGeneration: {
    trigger: "User completes Gmail OAuth",
    process: [
      "1. Generate entropy using crypto.randomBytes(32)",
      "2. Create HD wallet seed (BIP-39 mnemonic)",
      "3. Derive keys for each blockchain (BIP-44)",
      "4. Encrypt seed with AWS KMS master key",
      "5. Store encrypted seed in database",
      "6. Never display seed phrase to user (custodial)"
    ]
  },
  
  // Multi-Layer Encryption
  encryptionLayers: {
    layer1: {
      name: "Application Layer",
      method: "AES-256-GCM",
      keySource: "Environment variable (rotated monthly)"
    },
    layer2: {
      name: "Database Layer", 
      method: "PostgreSQL pgcrypto",
      keySource: "Database master key"
    },
    layer3: {
      name: "Infrastructure Layer",
      method: "AWS KMS / GCP Cloud KMS",
      keySource: "Hardware Security Module (HSM)"
    }
  }
};

// Database Storage Schema for Keys
CREATE TABLE encrypted_wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  encrypted_seed TEXT NOT NULL, -- Triple encrypted
  kms_key_id VARCHAR(255) NOT NULL, -- Which KMS key was used
  encryption_version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP,
  
  -- Security audit fields
  access_count INTEGER DEFAULT 0,
  last_ip_accessed VARCHAR(45),
  requires_2fa BOOLEAN DEFAULT false
);

// Key Access Pattern
async function signTransaction(userId, transaction) {
  // Step 1: Authenticate request
  await verifyUserSession(userId);
  
  // Step 2: Retrieve encrypted seed from database
  const encryptedSeed = await db.query(
    'SELECT encrypted_seed FROM encrypted_wallets WHERE user_id = $1',
    [userId]
  );
  
  // Step 3: Decrypt with KMS (happens in memory only)
  const seed = await kms.decrypt({
    CiphertextBlob: encryptedSeed,
    KeyId: process.env.KMS_KEY_ID
  });
  
  // Step 4: Derive specific key for blockchain
  const hdWallet = ethers.utils.HDNode.fromSeed(seed);
  const privateKey = hdWallet.derivePath("m/44'/60'/0'/0/0").privateKey;
  
  // Step 5: Sign transaction in memory
  const signedTx = await wallet.signTransaction(transaction);
  
  // Step 6: Clear sensitive data from memory immediately
  seed.fill(0);
  privateKey.fill(0);
  
  // Step 7: Return only the signed transaction
  return signedTx;
}
```

### 12.2 Hardware Security Module (HSM) Integration

**Configure HSM for production:**

```yaml
# AWS CloudHSM Configuration
hsm_configuration:
  cluster_id: "cluster-xxxxx"
  hsm_instances: 2  # For high availability
  
  key_hierarchy:
    root_key:
      type: "RSA-4096"
      usage: "Master key encryption only"
      rotation: "Annual"
      
    wallet_encryption_key:
      type: "AES-256"
      usage: "Encrypt wallet seeds"
      rotation: "Quarterly"
      
    transaction_signing_key:
      type: "ECDSA-secp256k1"
      usage: "Sign blockchain transactions"
      rotation: "Never (derived per-wallet)"

# Key Ceremony Process (for root key generation)
key_ceremony:
  participants: 3  # Minimum number of people
  location: "Secure facility"
  requirements:
    - "Video recording of entire process"
    - "Two-person integrity (TPI) at all times"
    - "Tamper-evident bags for key shards"
    - "Separate secure storage locations"
```

### 12.3 Transaction Signing Service

**Build isolated signing service:**

```javascript
// Isolated Transaction Signing Service
// This runs in a separate, highly secured container
class TransactionSigningService {
  constructor() {
    this.kmsClient = new AWS.KMS({
      region: process.env.AWS_REGION,
      endpoint: process.env.KMS_ENDPOINT // VPC endpoint
    });
    
    // No external network access except KMS
    this.networkPolicy = {
      ingress: ["internal-vpc-only"],
      egress: ["kms.amazonaws.com"]
    };
  }
  
  async signTransaction(request) {
    // Validate request structure
    this.validateRequest(request);
    
    // Check rate limits
    await this.checkRateLimit(request.userId);
    
    // Verify transaction limits
    await this.verifyTransactionLimits(request);
    
    // Multi-signature check for high-value transactions
    if (request.amount > 10000) {
      await this.requireMultiSig(request);
    }
    
    // Decrypt key in secure enclave
    const key = await this.decryptKey(request.userId);
    
    // Sign transaction
    const signed = await this.performSigning(key, request.transaction);
    
    // Audit log
    await this.auditLog({
      userId: request.userId,
      action: 'transaction_signed',
      amount: request.amount,
      timestamp: Date.now()
    });
    
    // Clean up
    this.secureDelete(key);
    
    return signed;
  }
  
  secureDelete(data) {
    // Overwrite memory multiple times
    crypto.randomFillSync(data);
    crypto.randomFillSync(data);
    data.fill(0);
  }
}
```

### 12.4 Key Recovery and Backup

**Implement recovery system:**

```javascript
// Backup and Recovery System
const recoverySystem = {
  // Automated Encrypted Backups
  backup: {
    frequency: "Every transaction + daily",
    destinations: [
      "AWS S3 (primary region)",
      "AWS S3 (secondary region)",
      "Cold storage (monthly)"
    ],
    encryption: "Customer-managed KMS key",
    retention: "7 years"
  },
  
  // Recovery Process (for disaster recovery only)
  disasterRecovery: {
    authorization: "Requires 2 of 3 executives",
    process: [
      "1. Verify identity of requesters",
      "2. Retrieve encrypted backups",
      "3. Decrypt with cold storage HSM",
      "4. Restore to new infrastructure",
      "5. Verify integrity with checksums",
      "6. Mandatory security audit"
    ]
  },
  
  // User Account Recovery (no key access)
  userRecovery: {
    methods: [
      {
        type: "email",
        process: "Magic link to registered email"
      },
      {
        type: "support",
        process: "Video verification + ID check"
      }
    ],
    note: "User recovery NEVER exposes private keys"
  }
};
```

### 12.5 Security Monitoring and Alerts

**Configure these exact security monitors:**

```javascript
// Security Monitoring Configuration
const securityMonitors = {
  // Key Access Monitoring
  keyAccessAlerts: {
    unusualAccess: {
      trigger: "Access from new IP or device",
      action: "Email alert + require 2FA"
    },
    rapidAccess: {
      trigger: "More than 10 key accesses in 1 minute",
      action: "Block access + page on-call"
    },
    afterHours: {
      trigger: "Key access outside business hours",
      action: "Log + daily security review"
    }
  },
  
  // Transaction Monitoring  
  transactionAlerts: {
    largeTransaction: {
      trigger: "Transaction > $10,000",
      action: "Manual review required"
    },
    unusualPattern: {
      trigger: "Deviation from normal user behavior",
      action: "Flag for review + possible 2FA"
    },
    rapidTransactions: {
      trigger: "More than 5 transactions in 1 hour",
      action: "Temporary hold + verification"
    }
  },
  
  // System Monitoring
  systemAlerts: {
    hsmFailure: {
      trigger: "HSM heartbeat missed",
      action: "Immediate page to security team"
    },
    decryptionFailure: {
      trigger: "KMS decryption error",
      action: "Block transaction + investigate"
    },
    auditLogFailure: {
      trigger: "Unable to write audit log",
      action: "Halt all operations"
    }
  }
};
```

## 13. Emergency Response Procedures

### 13.1 Key Compromise Response

**If private keys are potentially compromised:**

```bash
# IMMEDIATE ACTIONS (within 5 minutes)
1. Execute emergency key rotation script:
   ./scripts/emergency-key-rotation.sh --all-users

2. Pause all transaction processing:
   kubectl scale deployment transaction-service --replicas=0

3. Notify users via email and in-app:
   ./scripts/send-emergency-notification.sh

4. Move all funds to new addresses:
   ./scripts/emergency-fund-migration.sh

5. Enable heightened security mode:
   - Require 2FA for all transactions
   - Reduce transaction limits by 90%
   - Require manual approval for withdrawals

# INVESTIGATION (within 1 hour)
- Review all access logs
- Identify compromise vector
- Document affected users
- Prepare incident report

# RECOVERY (within 24 hours)  
- Generate new keys for all users
- Re-enable services with new security measures
- Provide detailed user communication
- File required regulatory reports
```

## 14. Implementation Priority Order

**Build components in this exact sequence:**

```
Week 1-2: Foundation
1. Set up PostgreSQL database with schema
2. Create basic Node.js/Python API structure  
3. Implement Gmail OAuth flow
4. Set up AWS KMS for key encryption

Week 3-4: Key Management
5. Build key generation system
6. Implement triple-layer encryption
7. Create transaction signing service
8. Set up HSM integration (or KMS if HSM not ready)

Week 5-6: Core Wallet Functions
9. Build wallet creation flow
10. Implement balance checking
11. Create send/receive functionality
12. Add transaction history

Week 7-8: ChatGPT Integration
13. Create GPT in OpenAI platform
14. Configure API endpoints for GPT actions
15. Build MCP server
16. Test conversation flows

Week 9-10: Web Portal
17. Build confirmation page UI
18. Create dashboard
19. Implement QR code generation
20. Add transaction history view

Week 11-12: Compliance & Security
21. Integrate KYC provider (Jumio/Onfido)
22. Set up rate limiting
23. Implement transaction limits
24. Add fraud detection

Week 13-14: Payment Rails
25. Integrate Stripe for fiat on-ramp
26. Build ACH connection flow
27. Implement withdrawal (off-ramp)
28. Add fee calculation

Week 15-16: Testing & Launch Prep
29. Complete security audit
30. Load testing
31. Disaster recovery testing
32. Submit to OpenAI for review
```

This completes the comprehensive technical specification with detailed frontend components, complete user journeys, and thorough private key management architecture. Every aspect has been designed for security, compliance, and ease of implementation by an AI coding agent.