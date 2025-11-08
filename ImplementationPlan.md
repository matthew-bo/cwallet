# Implementation Plan: Crypto Wallet for ChatGPT Store

## Project Overview

**Goal**: Build a fully functional custodial crypto wallet integrated into the ChatGPT Store that makes cryptocurrency accessible to beginners through natural language interactions.

**References**:
- Product Requirements: `PRD.md`
- Technical Specifications: `TechDoc.md`

## 🚀 REVISED MVP APPROACH

**Timeline**: 6 weeks (vs original 16 weeks)
**Budget**: $67/month (vs $500+/month)
**Scope**: Essential features only, defer complexity

### Key Decisions Made:
1. **Infrastructure**: Vercel + DigitalOcean + Google Cloud KMS (not AWS)
2. **Framework**: Next.js 14 with TypeScript (unified frontend + API)
3. **MVP Scope**: USDC-only, Ethereum mainnet, card payments only
4. **Compliance**: Private beta with $100 limits (avoid licensing initially)
5. **Testing**: Start on Sepolia testnet, move to mainnet after validation

### What Changed:
- ❌ **Removed**: AWS ECS, CloudHSM, separate React app, Bitcoin support, ACH, withdrawals
- ✅ **Kept**: All core wallet functionality, ChatGPT integration, MCP server, security
- 📅 **Deferred to Phase 2**: Staking, off-ramp, multi-chain, advanced KYC

---

## 🤖 AI Agent Quick Start Guide

**If you're an AI agent implementing this, follow these steps in order:**

### Step 1: Verify Environment Setup (DO NOT CODE YET)
```bash
# Check if user has completed Phase 0:
✓ Google Cloud Console configured (OAuth + KMS)
✓ Infura account created
✓ DigitalOcean databases provisioned
✓ All environment variables saved

# If ANY of these are missing:
STOP and ask user to complete TechDoc.md § 2 (Third-Party Account Setup)
```

### Step 2: Start Coding (Only After Step 1)
```bash
# Initialize project:
npx create-next-app@latest crypto-wallet-gpt --typescript --tailwind --app

# Follow Phase 1 tasks in sequence
# DO NOT skip ahead or parallelize - each phase depends on previous
```

### Step 3: Critical Security Rules
```javascript
// NEVER do these things:
const FORBIDDEN = [
  "Log private keys or mnemonics",
  "Return private keys in API responses",
  "Skip KMS encryption",
  "Hardcode secrets in code",
  "Execute transactions without web confirmation",
  "Store unencrypted sensitive data"
];

// ALWAYS do these things:
const REQUIRED = [
  "Use Prisma for all database queries (prevents SQL injection)",
  "Encrypt all private keys with Google Cloud KMS",
  "Validate all user inputs with Zod schemas",
  "Implement rate limiting on all endpoints",
  "Use TypeScript strict mode",
  "Test on Sepolia testnet first"
];
```

### Step 4: MVP Feature Scope (ONLY Build These)
```typescript
const MVP_FEATURES = {
  authentication: "Gmail OAuth via NextAuth.js",
  wallet: "USDC on Ethereum only",
  transactions: "Send and receive only (no staking)",
  payments: "Buy with card only (no ACH or withdrawals)",
  limits: "$100 per month per user",
  kyc: "Email verification only (Tier 0)",
  ui: "Minimal functional design (Tailwind defaults)"
};

// If user asks for features not in MVP_FEATURES:
// Politely note it's planned for Phase 2 and focus on MVP first
```

### Step 5: Development Order (STRICT)
```
Week 1: Phase 0 + Phase 1 (Setup, Auth, Database, KMS)
Week 2: Phase 2 (Wallet generation, Balance, Transactions)
Week 3-4: Phase 4 (ChatGPT GPT, MCP Server)
Week 5: Phase 7 (Stripe payments)
Week 6: Phase 9 (Testing, Deployment)

DO NOT jump to Phase 4 before completing Phase 2!
Each phase builds on the previous one.
```

### Step 6: When You Get Stuck
```yaml
Problem: API not working
Action: 
  1. Check Vercel logs: vercel logs
  2. Check environment variables in Vercel dashboard
  3. Test locally first: npm run dev

Problem: Database connection fails
Action:
  1. Verify DATABASE_URL format includes ?sslmode=require
  2. Check DigitalOcean database is running
  3. Test connection: npx prisma db pull

Problem: KMS encryption fails
Action:
  1. Verify service account JSON is valid
  2. Check GOOGLE_APPLICATION_CREDENTIALS_JSON is set
  3. Test KMS access: run scripts/test-kms.ts

Problem: User wants more features
Action:
  1. Acknowledge feature request
  2. Explain it's Phase 2
  3. Focus on completing MVP first
  4. Document request for later
```

### Step 7: Testing Checklist (Before Deployment)
```bash
# Run these tests:
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run lint              # Code quality
npx prisma validate       # Database schema
npm run build             # Production build

# Manual testing:
✓ Sign in with Google works
✓ Wallet created automatically
✓ Can check balance (shows $0 initially)
✓ Can send transaction (on Sepolia testnet)
✓ Confirmation page works
✓ Can buy crypto with Stripe test card
```

### Step 8: Deployment (Week 6)
```bash
# Deploy to Vercel:
git push origin main
# Vercel automatically deploys

# Deploy MCP server to DigitalOcean:
ssh root@droplet-ip
cd /opt/mcp-server
git pull
pm2 restart mcp-server

# Verify deployment:
curl https://wallet.yourdomain.com/api/health
# Should return: {"status": "ok"}
```

### Step 9: Beta Launch Checklist
```markdown
- [ ] All tests passing
- [ ] Deployed to production
- [ ] Test transaction on mainnet (with your own funds)
- [ ] Invite 10 friends to test
- [ ] Monitor Vercel logs for errors
- [ ] Create support email: support@yourdomain.com
- [ ] Prepare for ChatGPT GPT submission
```

### Step 10: Remember the Goal
```
Goal: Get 10 users successfully sending USDC in 6 weeks
NOT: Build the perfect enterprise-grade system
     
Keep it simple. Ship fast. Iterate based on feedback.
AWS/CloudHSM can wait until you have actual traction.
```

---

## Phase 0: Pre-Coding Setup (Day 1 - MUST COMPLETE FIRST)

### 0.1 Third-Party Account Setup
**Reference**: TechDoc.md § 2 (Complete Account Setup Guide)

**Tasks** (Do these in order):
- [ ] **Google Cloud Console** (30 mins):
  - Create project "crypto-wallet-gpt"
  - Enable Google+ API and KMS API
  - Create OAuth 2.0 credentials
  - Create KMS key ring + wallet-key
  - Create service account for KMS access
  - Download service account JSON

- [ ] **Infura/Alchemy** (15 mins):
  - Create free account
  - Create project
  - Get Sepolia testnet endpoint
  - Save project ID

- [ ] **DigitalOcean** (30 mins):
  - Create account
  - Provision Managed PostgreSQL ($15/mo)
  - Provision Managed Redis ($15/mo)
  - Create Droplet for MCP server ($12/mo)
  - Save all connection strings

- [ ] **Vercel** (15 mins):
  - Sign up with GitHub
  - Upgrade to Pro ($20/mo)
  - Note: Don't deploy yet, will connect after code is written

- [ ] **Domain Name** (optional for Day 1):
  - Purchase domain (or use placeholder for now)
  - Will configure DNS in Week 2

**Deliverables**:
- `.env.example` file created with all required variables
- Service account JSON saved securely
- All connection strings documented

---

## Phase 1: Foundation & Core Setup (Week 1)

### 1.1 Next.js Project Initialization
**Reference**: TechDoc.md § 7.1 (Revised Deployment)

**Tasks**:
- [ ] Create Next.js project with TypeScript:
  ```bash
  npx create-next-app@latest crypto-wallet-gpt --typescript --tailwind --app
  cd crypto-wallet-gpt
  ```

- [ ] Set up project structure:
  ```
  /app
    /api                    # API routes (serverless functions)
      /auth
        /[...nextauth]/route.ts    # NextAuth.js config
      /wallet
        /balance/route.ts    # GET balance
        /create/route.ts     # POST create wallet
      /transaction
        /initiate/route.ts   # POST start transaction
        /execute/route.ts    # POST execute transaction
    /confirm
      /[token]/page.tsx      # Transaction confirmation page
    /dashboard/page.tsx      # User dashboard
    layout.tsx               # Root layout
    page.tsx                 # Landing page
  /lib
    /db                      # Database client (Prisma)
    /kms                     # Google Cloud KMS wrapper
    /blockchain              # ethers.js utilities
    /auth                    # NextAuth configuration
  /components                # React components
  /prisma
    schema.prisma            # Database schema
  ```

- [ ] Install dependencies:
  ```bash
  npm install next-auth @auth/prisma-adapter
  npm install prisma @prisma/client
  npm install ethers@6
  npm install @google-cloud/kms
  npm install @stripe/stripe-js stripe
  npm install redis ioredis
  npm install zod  # validation
  npm install @tanstack/react-query  # data fetching
  ```

- [ ] Configure environment variables (create `.env.local`)
- [ ] Initialize Git:
  ```bash
  git init
  git add .
  git commit -m "Initial Next.js setup"
  git remote add origin [your-github-repo]
  git push -u origin main
  ```

**Deliverables**:
- Next.js app running locally on `localhost:3000`
- Clean project structure
- Git repository created and pushed to GitHub

---

### 1.2 Database Schema & Prisma Setup
**Reference**: TechDoc.md § 3.1 Database Schema

**Tasks**:
- [ ] Initialize Prisma:
  ```bash
  npx prisma init
  ```

- [ ] Create Prisma schema (`prisma/schema.prisma`):
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  model User {
    id          String   @id @default(uuid())
    email       String   @unique
    gmailId     String   @unique
    kycTier     Int      @default(0)
    createdAt   DateTime @default(now())
    wallets     Wallet[]
    transactions Transaction[]
    sessions    Session[]
  }

  model Wallet {
    id              String   @id @default(uuid())
    userId          String
    blockchain      String   // "ethereum"
    address         String
    encryptedSeed   String   @db.Text  // Triple-encrypted
    kmsKeyId        String
    createdAt       DateTime @default(now())
    user            User     @relation(fields: [userId], references: [id])
    @@unique([userId, blockchain])
  }

  model Transaction {
    id                String    @id @default(uuid())
    userId            String
    type              String    // "send", "receive", "buy"
    status            String    // "pending", "confirmed", "failed"
    amount            Decimal   @db.Decimal(36, 18)
    currency          String    // "USDC"
    fromAddress       String?
    toAddress         String?
    blockchainTxHash  String?
    confirmationToken String?   @unique
    createdAt         DateTime  @default(now())
    confirmedAt       DateTime?
    executedAt        DateTime?
    user              User      @relation(fields: [userId], references: [id])
  }

  model Session {
    id          String   @id @default(uuid())
    userId      String
    mcpToken    String   @unique
    expiresAt   DateTime
    createdAt   DateTime @default(now())
    user        User     @relation(fields: [userId], references: [id])
  }
  ```

- [ ] Run migrations:
  ```bash
  npx prisma migrate dev --name init
  npx prisma generate
  ```

- [ ] Create database client (`lib/db/client.ts`):
  ```typescript
  import { PrismaClient } from '@prisma/client'
  
  const globalForPrisma = global as unknown as { prisma: PrismaClient }
  
  export const prisma = globalForPrisma.prisma || new PrismaClient()
  
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```

**Deliverables**:
- Database schema created and migrated
- Prisma Client configured
- Type-safe database queries available

---

### 1.3 Google Cloud KMS Integration
**Reference**: TechDoc.md § 12.1 Key Management

**Tasks**:
- [ ] Create KMS wrapper (`lib/kms/index.ts`):
  ```typescript
  import { KeyManagementServiceClient } from '@google-cloud/kms';
  
  const credentials = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}'
  );
  
  const kmsClient = new KeyManagementServiceClient({ credentials });
  
  const keyName = kmsClient.cryptoKeyPath(
    process.env.GOOGLE_KMS_PROJECT!,
    'global',
    process.env.GOOGLE_KMS_KEYRING!,
    process.env.GOOGLE_KMS_KEY!
  );
  
  export async function encryptData(plaintext: Buffer): Promise<string> {
    const [result] = await kmsClient.encrypt({
      name: keyName,
      plaintext,
    });
    return Buffer.from(result.ciphertext!).toString('base64');
  }
  
  export async function decryptData(ciphertext: string): Promise<Buffer> {
    const [result] = await kmsClient.decrypt({
      name: keyName,
      ciphertext: Buffer.from(ciphertext, 'base64'),
    });
    return Buffer.from(result.plaintext!);
  }
  ```

- [ ] Test KMS encryption/decryption:
  ```typescript
  // Create test script: scripts/test-kms.ts
  const testData = Buffer.from('test-secret-data');
  const encrypted = await encryptData(testData);
  const decrypted = await decryptData(encrypted);
  console.log('KMS Test:', testData.equals(decrypted) ? 'PASS' : 'FAIL');
  ```

**Deliverables**:
- KMS wrapper working
- Encryption/decryption tested
- No plaintext keys ever logged

---

### 1.4 NextAuth.js Setup (Gmail OAuth)
**Reference**: TechDoc.md § 2.1 Google OAuth Setup

**Tasks**:
- [ ] Create NextAuth configuration (`app/api/auth/[...nextauth]/route.ts`):
  ```typescript
  import NextAuth from "next-auth"
  import GoogleProvider from "next-auth/providers/google"
  import { PrismaAdapter } from "@auth/prisma-adapter"
  import { prisma } from "@/lib/db/client"
  
  export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    callbacks: {
      async session({ session, user }) {
        // Add user ID to session
        session.user.id = user.id;
        return session;
      },
    },
  }
  
  const handler = NextAuth(authOptions)
  export { handler as GET, handler as POST }
  ```

- [ ] Create sign-in page (`app/page.tsx`):
  ```typescript
  import { signIn } from "next-auth/react"
  
  export default function Home() {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <button
          onClick={() => signIn('google')}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          Sign in with Google
        </button>
      </main>
    )
  }
  ```

- [ ] Test OAuth flow locally

**Deliverables**:
- Gmail OAuth working
- Users can sign in
- Session persisted in database

---

## Phase 2: Secure Key Management (Weeks 3-4)

### 2.1 Private Key Generation System
**Reference**: TechDoc.md § 12.1 Key Generation and Storage

**Tasks**:
- [ ] Install HD wallet library (ethers.js HDNode)
- [ ] Implement key generation service (isolated module):
  ```javascript
  async function generateUserWallet(userId) {
    // 1. Generate 256-bit entropy
    // 2. Create BIP-39 mnemonic (24 words)
    // 3. Derive BIP-44 keys for:
    //    - Bitcoin (m/44'/0'/0'/0/0)
    //    - Ethereum (m/44'/60'/0'/0/0)
    //    - Polygon (m/44'/60'/0'/0/0)
    // 4. Return public addresses + encrypted seed
  }
  ```
- [ ] **CRITICAL**: Never log or return private keys/mnemonics
- [ ] Trigger wallet creation automatically after Gmail OAuth (PRD.md line 67)
- [ ] Support multi-chain wallet generation:
  - Ethereum (for ETH, USDC, staking)
  - Bitcoin (optional for Phase 1)

**Deliverables**:
- Key generation service with 100% test coverage
- Generated wallets stored encrypted in database
- Public addresses returned to API clients

---

### 2.2 Triple-Layer Encryption
**Reference**: TechDoc.md § 12.1 Multi-Layer Encryption

**Tasks**:
- [ ] Implement Layer 1: Application-level AES-256-GCM
  ```javascript
  const cipher = crypto.createCipheriv('aes-256-gcm', appKey, iv);
  const encrypted = cipher.update(seed, 'utf8', 'hex');
  ```
- [ ] Implement Layer 2: PostgreSQL pgcrypto
  ```sql
  INSERT INTO encrypted_wallets (encrypted_seed)
  VALUES (pgp_sym_encrypt($1, $2));
  ```
- [ ] Implement Layer 3: KMS envelope encryption
  ```javascript
  const kmsEncrypted = await kms.encrypt({
    KeyId: process.env.KMS_KEY_ID,
    Plaintext: Buffer.from(encrypted)
  });
  ```
- [ ] Create decryption service that reverses all three layers
- [ ] Implement secure memory cleanup after decryption (overwrite buffers)

**Deliverables**:
- Encryption/decryption functions tested
- Encrypted data unreadable without all three keys
- Memory cleanup verified with debugger

---

### 2.3 Transaction Signing Service
**Reference**: TechDoc.md § 12.3 Transaction Signing Service

**Tasks**:
- [ ] Create isolated signing service (separate container/process)
- [ ] Configure network policy: no outbound except KMS
- [ ] Implement signing flow:
  1. Validate transaction request
  2. Check rate limits (TechDoc.md § 3.3: 5/min per user)
  3. Verify KYC limits (TechDoc.md § 6.1)
  4. Decrypt key in-memory only
  5. Sign transaction with ethers.js
  6. Clear sensitive data from memory
  7. Return signed transaction hex
- [ ] Add multi-signature requirement for transactions > $10,000
- [ ] Implement audit logging for every signature (who, what, when)

**Deliverables**:
- Signing service deployable as separate container
- All private key operations happen only in this service
- Audit logs streaming to CloudWatch/Stackdriver

---

### 2.4 HSM Integration (Production-Grade)
**Reference**: TechDoc.md § 12.2 Hardware Security Module

**Tasks**:
- [ ] Provision AWS CloudHSM cluster (2 instances for HA)
- [ ] Perform key ceremony to generate root key (TechDoc.md § 12.2)
  - 3-person participation
  - Video recorded
  - Key shards stored in separate locations
- [ ] Generate wallet encryption key in HSM
- [ ] Configure HSM client library in signing service
- [ ] Test HSM failover (remove one instance, verify operations continue)

**Note**: For development/staging, KMS is acceptable. HSM required for production.

**Deliverables**:
- HSM cluster operational
- Root key generated and secured
- Key ceremony documented

---

## Phase 3: Core Wallet Functions (Weeks 5-6)

### 3.1 Wallet Creation Flow
**Reference**: PRD.md lines 66-69, TechDoc.md § 11.1 (lines 1022-1035)

**Tasks**:
- [ ] Build complete onboarding endpoint:
  ```
  POST /v1/wallet/create
  Headers: Authorization: Bearer {session_token}
  Response: { wallets: [{blockchain, address, qr_code_data}] }
  ```
- [ ] Automatic trigger after Gmail OAuth completes
- [ ] Generate wallets for:
  - Ethereum (primary for USDC, staking)
  - Polygon (optional, lower fees)
- [ ] Generate QR codes for receiving (TechDoc.md § 10.2 lines 842-854)
- [ ] Return wallet addresses to user (masked: "0x7f9a...3d2e")
- [ ] Set default KYC tier = 0 (PRD.md § 6.1: $100/day limit)

**Deliverables**:
- New users automatically get wallets
- Wallet addresses viewable in dashboard
- QR codes generated for easy receiving

---

### 3.2 Balance Checking
**Reference**: TechDoc.md § 2.2 (lines 107-120), PRD.md lines 98-99 (MCP context)

**Tasks**:
- [ ] Integrate with blockchain nodes:
  - Infura (Ethereum/Polygon RPC)
  - Or Alchemy (alternative)
- [ ] Implement balance fetching:
  ```javascript
  async function getWalletBalance(address) {
    const ethBalance = await provider.getBalance(address);
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    const usdcBalance = await usdcContract.balanceOf(address);
    return { ETH: ethBalance, USDC: usdcBalance };
  }
  ```
- [ ] Cache balances in Redis (5-minute TTL)
- [ ] Convert crypto amounts to USD using price oracle (CoinGecko API)
- [ ] Build endpoint:
  ```
  GET /v1/wallet/balance
  Headers: Authorization: Bearer {session_token}
  Response: {
    total_usd: 247.83,
    wallets: [{
      blockchain: "ethereum",
      balances: {
        ETH: { amount: "0.045", usd: 95.43 },
        USDC: { amount: "152.40", usd: 152.40 }
      }
    }]
  }
  ```

**Deliverables**:
- Real-time balance updates
- Multi-token support (ETH, USDC, staked tokens)
- USD conversion accurate

---

### 3.3 Send/Receive Functionality
**Reference**: PRD.md lines 70-74, TechDoc.md § 11.2 (complete send flow)

**Tasks**:

#### 3.3.1 Receiving (Simple)
- [ ] Display wallet address + QR code
- [ ] No action needed (automatically receives)
- [ ] Monitor incoming transactions (webhook or polling)
- [ ] Send email notification on receive

#### 3.3.2 Sending (Complex)
- [ ] Build transaction initiation endpoint:
  ```
  POST /v1/transaction/initiate
  Body: {
    type: "send",
    amount: 20.00,
    currency: "USDC",
    recipient: "sarah@gmail.com" OR "0x..."
  }
  ```
- [ ] Validation steps:
  1. Check user has sufficient balance
  2. Verify KYC limits not exceeded (TechDoc.md § 3.3)
  3. Lookup recipient (email → wallet address mapping)
  4. Estimate gas fees
  5. Generate confirmation token (UUID)
- [ ] Store pending transaction in database (status="pending")
- [ ] Generate confirmation URL: `https://wallet.domain.com/confirm/{token}`
- [ ] Return URL to caller (expires in 5 minutes)
- [ ] **NEVER execute transaction without web confirmation** (PRD.md line 74)

**Deliverables**:
- Users can send crypto to emails or wallet addresses
- Email-based wallet discovery (PRD.md line 72: "name other people's wallets")
- Confirmation required before execution

---

### 3.4 Transaction History
**Reference**: TechDoc.md § 10.2 (lines 857-870)

**Tasks**:
- [ ] Build endpoint:
  ```
  GET /v1/transactions/history?limit=50&offset=0
  ```
- [ ] Return transaction data:
  - Type (send/receive/stake/unstake/buy/sell)
  - Amount + currency
  - From/to addresses (masked)
  - Status (pending/confirmed/failed)
  - Timestamp
  - Blockchain explorer link
- [ ] Implement pagination (50 transactions per page)
- [ ] Add filtering by type, date range, currency

**Deliverables**:
- Complete transaction history viewable
- Export to CSV option

---

## Phase 4: ChatGPT GPT Integration (Weeks 7-8)

### 4.1 Create GPT in OpenAI Platform
**Reference**: TechDoc.md § 2.1 GPT Configuration (lines 50-73)

**Tasks**:
- [ ] Sign up for ChatGPT Plus (required for GPT Store access)
- [ ] Go to GPT Builder: chat.openai.com/gpts/editor
- [ ] Configure GPT settings:
  - **Name**: "Simple Crypto Wallet"
  - **Description**: "Send, receive, and manage crypto with natural language"
  - **Instructions**: Paste TechDoc.md § 2.1 instructions
  - **Conversation starters**:
    - "Show my wallet balance"
    - "Help me send $20 to a friend"
    - "How do I add money?"
    - "What is cryptocurrency?"
- [ ] Upload knowledge base documents:
  - Crypto basics for beginners
  - Safety guidelines (avoiding scams)
  - Troubleshooting guide

**Deliverables**:
- GPT created and accessible in preview mode
- Custom instructions working

---

### 4.2 Configure GPT Actions (API Integration)
**Reference**: TechDoc.md § 2.2 OpenAI Action Definitions (lines 79-144)

**Tasks**:
- [ ] Create OpenAPI 3.0 specification file (`openapi.yaml`)
- [ ] Define actions in GPT settings → Actions → Import from URL
- [ ] Configure authentication: OAuth 2.0 with Gmail
- [ ] Add API endpoints:
  - `POST /v1/auth/session` - User authentication
  - `GET /v1/wallet/balance` - Balance checking
  - `POST /v1/transaction/initiate` - Start transaction
  - `GET /v1/transaction/status/{id}` - Check status
  - `GET /v1/staking/options` - Staking info
  - `POST /v1/onramp/initiate` - Buy crypto
  - `POST /v1/offramp/initiate` - Sell crypto
- [ ] Configure CORS to allow requests from `chat.openai.com`
- [ ] Test each action in GPT playground

**Deliverables**:
- All API actions callable from GPT
- OAuth flow working (user signs in with Gmail from ChatGPT)
- Responses formatted for chat display

---

### 4.3 Build MCP Server
**Reference**: PRD.md lines 87-89 (MCP Context Binding), TechDoc.md § 4 (MCP Implementation)

**Tasks**:
- [ ] Understand MCP specification: modelcontextprotocol.io
- [ ] Create MCP server (separate service from main API)
- [ ] Implement MCP protocol:
  ```python
  class WalletMCPServer:
      async def list_resources(self):
          return ["wallet://balance", "wallet://transactions", "wallet://limits"]
      
      async def read_resource(self, uri, token):
          if uri == "wallet://balance":
              return await self.fetch_balance(token)
  ```
- [ ] Configure resources (TechDoc.md § 4.1):
  - `wallet://balance` - Current balances
  - `wallet://transactions` - Recent 10 transactions
  - `wallet://limits` - KYC limits remaining
- [ ] Configure tools:
  - `get_balance` - Fetch specific currency balance
  - `prepare_transaction` - Prepare send/stake transaction
- [ ] Sanitize all responses: NEVER include private keys, full addresses, or session tokens
- [ ] Deploy MCP server with WebSocket support

**Deliverables**:
- MCP server running and accessible
- GPT can fetch wallet context dynamically
- Sensitive data never exposed to model

---

### 4.4 Test Conversation Flows
**Reference**: TechDoc.md § 11 (Complete User Experience Flows)

**Tasks**:
- [ ] Test first-time onboarding (TechDoc.md § 11.1):
  - User: "I want to try cryptocurrency"
  - GPT guides through Gmail sign-in
  - Wallet created automatically
  - Welcome message with balance
- [ ] Test sending money (TechDoc.md § 11.2):
  - User: "Send $20 to sarah@gmail.com"
  - GPT creates transaction, returns confirmation link
  - User confirms on web portal
  - Success message in chat
- [ ] Test balance checking:
  - User: "What's my balance?"
  - GPT fetches real-time data via MCP
  - Displays formatted balance
- [ ] Test educational queries:
  - User: "What's gas?"
  - GPT explains in simple terms (banking language)
- [ ] Test error handling:
  - User tries to send more than they have
  - GPT politely explains insufficient balance

**Deliverables**:
- All conversation flows working smoothly
- GPT uses simple language (PRD.md lines 56-60: banking terms)
- Edge cases handled gracefully

---

## Phase 5: Secure Web Portal (Weeks 9-10)

### 5.1 Transaction Confirmation Page
**Reference**: TechDoc.md § 10.2 Confirmation Page (lines 722-794), § 11.2 (lines 1092-1114)

**Tasks**:
- [ ] Initialize React app (Create React App or Vite)
- [ ] Install dependencies:
  - React Router (navigation)
  - Axios (API calls)
  - react-qr-code (QR generation)
  - Tailwind CSS (styling)
- [ ] Build confirmation page: `/confirm/:token`
- [ ] Page sections:
  1. **Header**: Logo, security badge, session timer
  2. **Transaction Details Card**:
     - From/to addresses (masked)
     - Amount (large, bold)
     - Network fee estimate
     - Total cost
     - Estimated arrival time
  3. **Security Checkboxes**:
     - "I verified the recipient address"
     - "I understand this cannot be reversed"
  4. **2FA Input** (if amount > $100):
     - 6-digit code field
     - Sent via email to user
  5. **Action Buttons**:
     - "Cancel" (gray)
     - "Confirm & Send" (green, disabled until checks completed)
- [ ] Implement 10-second cooldown before allowing confirmation (TechDoc.md § 5.2 line 422)
- [ ] Show loading animation during transaction broadcast
- [ ] Success page with transaction ID and blockchain explorer link
- [ ] Auto-redirect back to ChatGPT after 5 seconds

**Deliverables**:
- Fully functional confirmation flow
- Mobile responsive (TechDoc.md § 10.3)
- Works on iOS/Android browsers

---

### 5.2 User Dashboard
**Reference**: TechDoc.md § 10.2 Dashboard Components (lines 797-870)

**Tasks**:
- [ ] Build dashboard page: `/dashboard`
- [ ] Require authentication (check session token)
- [ ] Top navigation bar:
  - Logo
  - Wallet selector (if multi-chain)
  - User menu (Settings, Security, Sign Out)
- [ ] Main wallet card:
  - Total balance in USD (large)
  - Individual token balances
  - 24h change percentage
  - Quick action buttons:
    - 📥 Receive (opens QR modal)
    - 📤 Send (opens send flow)
    - 💳 Add Money (opens onramp)
    - 🏦 Cash Out (opens offramp)
- [ ] QR Code Modal for receiving:
  - Tabs for each currency (BTC, ETH, USDC)
  - QR code (200x200px)
  - Address display (truncated + copy button)
  - Network warning: "Only send ETH to this address"
- [ ] Transaction history table:
  - Last 50 transactions
  - Columns: Type icon, Description, Amount, Status, Date
  - Click to expand details
  - "View on Etherscan" link

**Deliverables**:
- Dashboard showing real wallet data
- QR codes functional (tested with mobile wallet apps)
- Transaction history accurate

---

### 5.3 Content Security Policy & Security Headers
**Reference**: TechDoc.md § 5.2 Frontend Security (lines 402-427)

**Tasks**:
- [ ] Configure CSP headers in web server (Nginx/CloudFront):
  ```
  Content-Security-Policy:
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.yourwalletdomain.com;
  ```
- [ ] Add security headers:
  - `X-Frame-Options: DENY` (prevent clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security: max-age=31536000`
- [ ] Configure session management:
  - 15-minute timeout (TechDoc.md § 5.2 line 413)
  - 2-minute warning modal
  - Auto-logout on timeout
- [ ] Secure cookies:
  - `HttpOnly` flag (no JavaScript access)
  - `Secure` flag (HTTPS only)
  - `SameSite=Strict` (CSRF protection)

**Deliverables**:
- Security headers verified with securityheaders.com
- Session timeout working
- XSS/CSRF protections in place

---

## Phase 6: Compliance & KYC (Weeks 11-12)

### 6.1 KYC Provider Integration
**Reference**: PRD.md lines 111-115 (KYC/AML), TechDoc.md § 6.1 (lines 433-452)

**Tasks**:
- [ ] Choose provider: Jumio or Onfido (both support global KYC)
- [ ] Sign contract and get API credentials
- [ ] Implement KYC tiers (TechDoc.md § 6.1):
  
  **Tier 0 (Default)**:
  - Email verification only
  - Limits: $100/day, $50/transaction
  - No fiat off-ramp allowed
  
  **Tier 1 ($100-1000/day)**:
  - Name, DOB, address
  - Phone verification (SMS code)
  - Government ID upload (passport/driver's license)
  - Jumio/Onfido automated verification
  
  **Tier 2 ($1000+/day)**:
  - Enhanced due diligence
  - Source of funds documentation
  - Video verification call
  - Manual review by compliance team

- [ ] Build KYC flow pages:
  - `/kyc/start` - Tier selection
  - `/kyc/tier1` - Personal info form
  - `/kyc/upload` - Document upload (Jumio SDK)
  - `/kyc/pending` - Verification in progress
  - `/kyc/approved` - Success page
  - `/kyc/rejected` - Rejection with appeal option

- [ ] Implement verification webhook:
  ```
  POST /v1/kyc/webhook
  Body: { user_id, tier, status: "approved/rejected", reason }
  ```
- [ ] Update user record with new KYC tier
- [ ] Send email notification on status change

**Deliverables**:
- Users can upgrade KYC tier
- Limits enforced at transaction time
- Compliance audit trail maintained

---

### 6.2 Transaction Limits Enforcement
**Reference**: TechDoc.md § 3.3 (lines 249-266)

**Tasks**:
- [ ] Implement limit checking middleware:
  ```javascript
  async function checkTransactionLimits(userId, amount) {
    const user = await db.query('SELECT kyc_tier FROM users WHERE id = $1', [userId]);
    const limits = TIER_LIMITS[user.kyc_tier];
    
    // Check per-transaction limit
    if (amount > limits.per_transaction_usd) {
      throw new Error(`Transaction exceeds $${limits.per_transaction_usd} limit`);
    }
    
    // Check daily limit
    const todayTotal = await getTodayTransactionTotal(userId);
    if (todayTotal + amount > limits.daily_limit_usd) {
      throw new Error(`Daily limit of $${limits.daily_limit_usd} reached`);
    }
    
    return true;
  }
  ```
- [ ] Cache daily totals in Redis for performance
- [ ] Reset daily totals at midnight UTC
- [ ] Display remaining limits in dashboard
- [ ] Prompt KYC upgrade if user hits limit

**Deliverables**:
- Transaction limits enforced 100% of the time
- Users see clear error messages
- KYC upgrade path obvious

---

### 6.3 Rate Limiting
**Reference**: TechDoc.md § 3.3 (lines 242-247)

**Tasks**:
- [ ] Install `express-rate-limit` or `fastapi-limiter`
- [ ] Configure rate limits per endpoint:
  - Authentication: 5 requests/min per IP
  - Balance check: 30 requests/min per user
  - Transaction initiate: 10 requests/min per user
  - Transaction execute: 5 requests/min per user
- [ ] Use Redis for distributed rate limiting (multiple API servers)
- [ ] Return 429 status code with `Retry-After` header
- [ ] Log rate limit violations for abuse detection

**Deliverables**:
- Rate limits prevent API abuse
- Legitimate users not impacted

---

### 6.4 Fraud Detection & Monitoring
**Reference**: TechDoc.md § 12.5 Security Monitoring (lines 1460-1508)

**Tasks**:
- [ ] Implement anomaly detection:
  - Unusual transaction size (3x user's average)
  - Rapid successive transactions (>5 in 1 hour)
  - New recipient address (first time sending)
  - Access from new IP/device
  - After-hours activity (outside user's normal times)
- [ ] Build alert system:
  - Low risk: Log for daily review
  - Medium risk: Require 2FA
  - High risk: Block transaction, manual review
- [ ] Create admin review dashboard:
  - Flagged transactions queue
  - User risk score
  - Approve/reject controls
- [ ] Integrate with email/SMS for 2FA challenges

**Deliverables**:
- Fraud detection catching suspicious activity
- False positive rate < 5%
- Admin tools for manual review

---

## Phase 7: Payment Rails (Weeks 13-14)

### 7.1 Fiat On-Ramp (Buying Crypto)
**Reference**: PRD.md lines 79-82, TechDoc.md § 10.2 Onramp Components (lines 873-938)

**Tasks**:
- [ ] Integrate Stripe for payments
- [ ] Create Stripe account and get API keys
- [ ] Build onramp flow:
  
  **Step 1: Amount Selection** (`/buy/amount`)
  - Preset buttons: $50, $100, $250, $500, $1000
  - Custom amount input
  - Fee breakdown:
    - Amount: $X
    - Processing fee (2.9%): $Y
    - Network fee: $2.00
    - Total charge: $Z
  
  **Step 2: Payment Method** (`/buy/payment`)
  - ACH (bank transfer): 3-5 days, 0.5% fee
  - Debit card: Instant, 2.9% fee
  - Wire transfer: 1-2 days, $25 fee (min $1000)
  - Integrate Stripe Payment Element
  
  **Step 3: Review & Confirm** (`/buy/confirm`)
  - Summary: You pay $X, you receive Y BTC
  - Current exchange rate
  - Terms of service checkbox
  - "Complete Purchase" button
  
  **Step 4: Processing**
  - Stripe payment processing
  - Wait for payment confirmation
  - Execute crypto purchase on exchange (Coinbase/Kraken API)
  - Transfer crypto to user's wallet
  
  **Step 5: Success**
  - "You now own X BTC!" message
  - Transaction receipt
  - Return to dashboard

- [ ] Handle payment webhooks from Stripe:
  ```
  POST /v1/stripe/webhook
  Event: payment_intent.succeeded → buy crypto
  Event: payment_intent.failed → notify user
  ```

**Deliverables**:
- Users can buy crypto with debit card/ACH
- Crypto delivered to wallet after payment clears
- Receipt emailed to user

---

### 7.2 Fiat Off-Ramp (Selling Crypto)
**Reference**: PRD.md lines 79-82, TechDoc.md § 5.1 (line 391)

**Tasks**:
- [ ] Integrate bank account linking (Plaid or Stripe Connect)
- [ ] Build offramp flow:
  
  **Step 1: Link Bank Account** (`/withdraw/link-bank`)
  - Plaid Link integration
  - Verify micro-deposits (if needed)
  
  **Step 2: Withdrawal Amount** (`/withdraw/amount`)
  - Show available balance
  - Enter USD amount to withdraw
  - Calculate crypto to sell
  - Show exchange rate + fees
  
  **Step 3: Confirm Withdrawal** (`/withdraw/confirm`)
  - From: Wallet (X BTC)
  - To: Bank account (...1234)
  - Amount: $Y USD
  - Arrival: 3-5 business days
  - 2FA required (email code)
  
  **Step 4: Processing**
  - Sell crypto on exchange
  - Initiate ACH transfer via Stripe/Plaid
  - Update transaction status
  
  **Step 5: Complete**
  - "Withdrawal initiated" message
  - Track transfer status
  - Email when funds arrive

- [ ] Enforce KYC requirements:
  - Tier 0: Cannot withdraw (must upgrade to Tier 1)
  - Tier 1+: Withdrawals allowed within limits

**Deliverables**:
- Users can cash out to their bank account
- Withdrawals comply with KYC/AML requirements
- ACH transfers working

---

### 7.3 Exchange Integration for Liquidity
**Reference**: TechDoc.md § 7 (implicit need for exchange to buy/sell crypto)

**Tasks**:
- [ ] Choose exchange: Coinbase Pro, Kraken, or Binance
- [ ] Create business account and get API keys
- [ ] Implement exchange client:
  ```javascript
  class ExchangeClient {
    async buyUsdc(usdAmount) {
      // Place market order to buy USDC
      const order = await this.exchange.createMarketBuyOrder('USDC/USD', usdAmount);
      return order;
    }
    
    async sellUsdc(usdcAmount) {
      // Place market order to sell USDC for USD
      const order = await this.exchange.createMarketSellOrder('USDC/USD', usdcAmount);
      return order;
    }
  }
  ```
- [ ] Maintain exchange account balance (pre-fund with $10k for initial liquidity)
- [ ] Build reconciliation system (daily balance checks)
- [ ] Handle slippage (price changes during execution)

**Deliverables**:
- Backend can buy/sell crypto on user's behalf
- Liquidity sufficient for initial launch
- Automated reconciliation working

---

## Phase 8: Staking Feature (Week 13-14)

### 8.1 Staking Implementation
**Reference**: PRD.md lines 75-78, TechDoc.md § 2.2 (lines 64-67)

**Tasks**:
- [ ] Research staking options:
  - Ethereum staking (via Lido or Rocket Pool)
  - Polygon staking
  - Stablecoin yield (via Aave or Compound)
- [ ] Choose beginner-friendly option: **USDC lending on Aave**
  - Simple concept: "Earn interest on your dollars"
  - APY: ~3-5% (variable)
  - Low risk (stablecoin + audited protocol)
- [ ] Integrate with Aave v3:
  ```javascript
  async function stakeUsdc(amount) {
    const lendingPool = new ethers.Contract(AAVE_POOL_ADDRESS, ABI, signer);
    await lendingPool.deposit(USDC_ADDRESS, amount, userAddress, 0);
    // User receives aUSDC tokens representing staked amount
  }
  ```
- [ ] Build staking endpoints:
  - `GET /v1/staking/options` - Show available staking (APY, risk level)
  - `POST /v1/staking/initiate` - Start staking
  - `POST /v1/staking/withdraw` - Unstake
  - `GET /v1/staking/earnings` - Show earnings to date
- [ ] Display staking in dashboard:
  - "Earning ~5.2% APY" badge
  - Current staked amount
  - Total earnings
  - "Stake More" / "Unstake" buttons
- [ ] Educational content in GPT:
  - "Staking is like a savings account"
  - "Your crypto earns interest"
  - "You can unstake anytime"

**Deliverables**:
- Users can stake USDC to earn yield
- Earnings calculated and displayed
- Simple language used (no "liquidity pools")

---

## Phase 9: Testing & Quality Assurance (Weeks 15-16)

### 9.1 Unit Tests
**Reference**: TechDoc.md § 8.1 (90% coverage required)

**Tasks**:
- [ ] Set up testing framework:
  - Jest (Node.js) or PyTest (Python)
  - Supertest (API endpoint testing)
- [ ] Write unit tests for:
  - Wallet generation (verify addresses are valid)
  - Encryption/decryption (round-trip test)
  - Transaction validation (limits, balance checks)
  - KYC tier calculations
  - Rate limiting logic
  - Balance fetching (mock blockchain calls)
- [ ] Achieve 90%+ code coverage
- [ ] Run tests in CI/CD pipeline (GitHub Actions)

**Deliverables**:
- Test suite with 90%+ coverage
- All tests passing
- CI/CD running tests on every commit

---

### 9.2 Integration Tests
**Reference**: TechDoc.md § 8.1

**Tasks**:
- [ ] Test complete flows end-to-end:
  
  **Test 1: User Onboarding**
  - Gmail OAuth → wallet creation → dashboard loads
  
  **Test 2: Buy Crypto**
  - Navigate to onramp → enter amount → Stripe payment → crypto received
  
  **Test 3: Send Transaction**
  - Initiate send in ChatGPT → confirm on web → transaction broadcasts
  
  **Test 4: KYC Upgrade**
  - Submit Tier 1 KYC → webhook received → limits updated
  
  **Test 5: Staking**
  - Stake USDC → Aave deposit confirmed → dashboard shows staked amount

- [ ] Use Sepolia testnet for blockchain testing
- [ ] Use Stripe test mode for payments
- [ ] Mock external services (Jumio, email)

**Deliverables**:
- All critical user journeys tested
- Test scripts documented
- Integration tests run nightly

---

### 9.3 Security Audit
**Reference**: TechDoc.md § 9 Launch Checklist (line 636)

**Tasks**:
- [ ] Hire security firm (Trail of Bits, Kudelski, or similar)
- [ ] Scope of audit:
  - Smart contract review (if using custom contracts)
  - Key management architecture
  - API security (auth, rate limiting, injection attacks)
  - Web portal security (XSS, CSRF, clickjacking)
  - Infrastructure (VPC, IAM, KMS configuration)
- [ ] Fix all critical and high-severity findings
- [ ] Document medium/low findings for future sprints
- [ ] Obtain security audit report (required for OpenAI review)

**Deliverables**:
- Security audit completed
- Critical vulnerabilities fixed
- Audit report available

---

### 9.4 Load Testing
**Reference**: TechDoc.md § 9 Launch Checklist (line 635)

**Tasks**:
- [ ] Install load testing tool (k6, Locust, or JMeter)
- [ ] Create test scenarios:
  - 100 concurrent users checking balances
  - 50 concurrent users initiating transactions
  - 1000 requests/second to balance endpoint
- [ ] Run tests against staging environment
- [ ] Measure performance metrics:
  - P50, P95, P99 response times (target: <500ms, <2s, <5s)
  - Error rate (target: <0.1%)
  - Database CPU/memory usage
  - KMS request latency
- [ ] Configure auto-scaling (min: 2, max: 10 instances)
- [ ] Test failover scenarios (kill one database instance)

**Deliverables**:
- System handles 1000 concurrent users
- Auto-scaling working
- No performance degradation under load

---

### 9.5 Penetration Testing
**Reference**: TechDoc.md § 8.1 Security Tests (lines 600-605)

**Tasks**:
- [ ] Test for common vulnerabilities:
  - SQL injection (all database queries)
  - XSS (all user input fields)
  - CSRF (all state-changing endpoints)
  - Broken authentication (session hijacking)
  - Rate limit bypass attempts
  - Prompt injection (GPT trying to execute unauthorized actions)
- [ ] Use automated tools:
  - OWASP ZAP (web app scanner)
  - Burp Suite (manual testing)
- [ ] Manual testing by security team
- [ ] Fix all vulnerabilities before launch

**Deliverables**:
- Penetration test report
- All vulnerabilities remediated
- Re-test confirms fixes

---

## Phase 10: Deployment & Launch (Week 16)

### 10.1 Production Infrastructure
**Reference**: TechDoc.md § 7.1 (lines 493-519)

**Tasks**:
- [ ] Deploy in this order:
  
  **1. Database Setup**
  - PostgreSQL RDS with Multi-AZ
  - Read replica in secondary region
  - Automated backups (7-day retention)
  
  **2. Backend API**
  - Deploy to ECS (Fargate) or Cloud Run
  - Configure auto-scaling (min: 2, max: 10)
  - Set up Application Load Balancer
  - Configure SSL certificate (Let's Encrypt or ACM)
  - Point custom domain: `api.yourwalletdomain.com`
  
  **3. Transaction Signing Service**
  - Deploy as separate ECS task
  - No public internet access (VPC-only)
  - High CPU priority (crypto signing intensive)
  
  **4. MCP Server**
  - Deploy to Cloud Run or Lambda
  - WebSocket support enabled
  - Point domain: `mcp.yourwalletdomain.com`
  
  **5. Web Portal**
  - Build React app: `npm run build`
  - Deploy to S3 + CloudFront OR Vercel
  - Configure CDN caching rules
  - Point domain: `wallet.yourwalletdomain.com`
  - Configure CSP headers

- [ ] Set up monitoring (DataDog or New Relic)
- [ ] Configure alerting (PagerDuty for on-call)
- [ ] Create runbooks for common issues

**Deliverables**:
- All services running in production
- DNS configured
- HTTPS working
- Monitoring dashboards live

---

### 10.2 Environment Variables Configuration
**Reference**: TechDoc.md § 7.2 (lines 525-546)

**Tasks**:
- [ ] Set production environment variables (use AWS Secrets Manager):
  ```
  # Database
  DATABASE_URL=postgresql://user:pass@prod-db.amazonaws.com:5432/wallet
  REDIS_URL=redis://prod-redis.amazonaws.com:6379
  
  # Encryption
  KMS_KEY_ID=arn:aws:kms:us-east-1:123456789:key/abcd-1234
  APP_ENCRYPTION_KEY=[32-byte random key, rotated monthly]
  
  # OAuth
  GMAIL_CLIENT_ID=[from Google Cloud Console]
  GMAIL_CLIENT_SECRET=[from Google Cloud Console]
  GMAIL_REDIRECT_URI=https://wallet.yourwalletdomain.com/auth/callback
  
  # Payment Providers
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  
  # KYC Provider
  JUMIO_API_TOKEN=[from Jumio dashboard]
  JUMIO_API_SECRET=[from Jumio dashboard]
  
  # Blockchain
  INFURA_PROJECT_ID=[from Infura]
  INFURA_PROJECT_SECRET=[from Infura]
  ETHEREUM_NETWORK=mainnet
  
  # Exchange
  COINBASE_API_KEY=[from Coinbase Pro]
  COINBASE_API_SECRET=[from Coinbase Pro]
  
  # Monitoring
  SENTRY_DSN=https://...@sentry.io/...
  DATADOG_API_KEY=[from DataDog]
  ```
- [ ] Rotate all keys from staging
- [ ] Never commit secrets to Git
- [ ] Document secret rotation schedule

**Deliverables**:
- All secrets stored securely
- Environment variables loaded correctly
- Rotation schedule documented

---

### 10.3 Submit GPT to OpenAI Store
**Reference**: TechDoc.md § 9 Launch Checklist, PRD.md lines 112-113 (OpenAI compliance)

**Tasks**:
- [ ] Complete pre-submission checklist:
  - [x] Security audit completed
  - [x] Privacy policy published at `/privacy`
  - [x] Terms of service published at `/terms`
  - [x] OpenAI usage policies reviewed (TechDoc.md § 6.2)
  - [x] No prohibited content (price predictions, trading advice)
  - [x] Required disclaimers in all responses
  - [x] Content filtering active
- [ ] Prepare submission materials:
  - GPT name, description, icon
  - Demo video (2-minute walkthrough)
  - Documentation link
  - Support email address
- [ ] Submit GPT for review in OpenAI platform
- [ ] Respond to OpenAI feedback (typical: 1-2 weeks review)
- [ ] Make requested changes
- [ ] Get approval and publish to GPT Store

**Deliverables**:
- GPT live in OpenAI Store
- Searchable by all ChatGPT users
- Installation link: `chat.openai.com/g/your-gpt-id`

---

### 10.4 Launch Checklist
**Reference**: TechDoc.md § 9 (lines 632-647)

**Final checks before going live**:

- [ ] **Legal**
  - [ ] Terms of service reviewed by lawyer
  - [ ] Privacy policy compliant with GDPR/CCPA
  - [ ] Money transmitter licenses filed (varies by state/country)

- [ ] **Technical**
  - [ ] All production services healthy
  - [ ] SSL certificates valid (not expired)
  - [ ] DNS resolving correctly
  - [ ] Monitoring dashboards showing green
  - [ ] Backups running daily
  - [ ] Disaster recovery tested

- [ ] **Security**
  - [ ] WAF rules configured (CloudFlare/AWS WAF)
  - [ ] DDoS protection enabled
  - [ ] Rate limiting active
  - [ ] Audit logging working
  - [ ] HSM keys generated and secured

- [ ] **Compliance**
  - [ ] KYC provider contract signed
  - [ ] Transaction monitoring active
  - [ ] AML procedures documented
  - [ ] Sanctions list screening enabled

- [ ] **Operations**
  - [ ] Customer support system ready (Zendesk/Intercom)
  - [ ] Support team trained
  - [ ] On-call rotation established (24/7 coverage)
  - [ ] Incident response plan documented
  - [ ] Communication templates prepared (outage, security)

- [ ] **Marketing**
  - [ ] Documentation website live
  - [ ] Help articles published
  - [ ] Social media accounts created
  - [ ] Launch announcement ready

---

## Phase 11: Post-Launch Operations

### 11.1 Monitoring & Alerting
**Reference**: TechDoc.md § 7.3 (lines 552-573)

**Configure these alerts**:

**Critical (Page immediately)**:
- Transaction success rate < 95%
- API error rate > 5%
- Database CPU > 90%
- KYC provider downtime
- HSM heartbeat failure
- Any unauthorized key access

**Warning (Email/Slack)**:
- API latency p95 > 2 seconds
- Database CPU > 80%
- Transaction volume spike (>3x normal)
- Failed login attempts > 10/min
- Large transactions (>$10k)

**Info (Daily digest)**:
- Total transactions processed
- New user signups
- KYC conversion rate
- Average transaction size
- Top errors

**Deliverables**:
- 24/7 on-call rotation
- Incident response playbooks
- Average resolution time < 1 hour

---

### 11.2 Customer Support
**Reference**: PRD.md lines 29-37 (user needs)

**Support channels**:
- [ ] In-app chat (Intercom)
- [ ] Email: support@yourwalletdomain.com
- [ ] Help center with FAQs
- [ ] Video tutorials (YouTube)

**Common support issues**:
1. "I can't sign in" → OAuth troubleshooting
2. "Where's my crypto?" → Transaction status lookup
3. "How do I cash out?" → KYC upgrade guide
4. "What's a gas fee?" → Educational article
5. "Is this a scam?" → Reassurance + security tips

**Support metrics**:
- First response time: <1 hour
- Resolution time: <24 hours
- Customer satisfaction: >90%

---

### 11.3 Success Metrics Tracking
**Reference**: PRD.md lines 118-121

**Track these KPIs daily**:

**User Growth**:
- New wallets created
- Daily active users (DAU)
- Monthly active users (MAU)
- Retention rate (7-day, 30-day)

**Transaction Metrics**:
- Total transaction volume (USD)
- Average transaction size
- Transactions per user
- Transaction success rate

**Revenue Metrics**:
- Onramp volume (buying crypto)
- Offramp volume (cashing out)
- Fee revenue
- Staking TVL (total value locked)

**Engagement**:
- ChatGPT sessions per user
- Messages per session
- Feature usage (send, stake, buy)
- Help article views

**Deliverables**:
- Analytics dashboard (Mixpanel/Amplitude)
- Weekly metrics report
- Monthly board deck

---

## Risk Mitigation

### Security Risks
**Reference**: PRD.md lines 109-117 (Potential Issues)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Private key theft | Medium | Critical | Triple-layer encryption + HSM, no keys in GPT/MCP |
| Phishing attack | High | High | Email verification for new recipients, 2FA for large amounts |
| SQL injection | Low | High | Parameterized queries only, security audit |
| OpenAI policy violation | Medium | Critical | Content filtering, prohibited phrases list, compliance review |
| KYC bypass | Medium | High | Server-side limit enforcement, transaction monitoring |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low user adoption | Medium | High | Strong onboarding UX, educational content, referral program |
| High support burden | High | Medium | Comprehensive FAQs, chatbot for simple questions |
| Liquidity issues | Low | High | Maintain 2x expected daily volume on exchange |
| Regulatory changes | Medium | Critical | Legal counsel on retainer, monitor FinCEN/SEC updates |

---

## Definition of Done

A feature is "done" when:
- [ ] Code written and peer reviewed
- [ ] Unit tests written (90%+ coverage)
- [ ] Integration tests passing
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Deployed to staging and tested
- [ ] Product owner approved
- [ ] Deployed to production
- [ ] Monitoring configured
- [ ] Support team trained

---

## Technical Debt Policy

**Allowed in early phases** (must fix before launch):
- Mock KYC provider in development
- Single database instance (no replica)
- Manual transaction review instead of automated fraud detection
- Test credit cards only (no real payments)

**Never acceptable** (even in development):
- Unencrypted private keys
- SQL injection vulnerabilities
- Missing authentication checks
- Hardcoded secrets
- Disabled security features

---

## Appendix: Key Technologies Summary (REVISED FOR MVP)

### Unified Full-Stack
- **Framework**: Next.js 14 with App Router (TypeScript)
- **Styling**: Tailwind CSS
- **Database**: DigitalOcean Managed PostgreSQL
- **ORM**: Prisma
- **Cache/Sessions**: DigitalOcean Managed Redis
- **Authentication**: NextAuth.js with Google OAuth
- **API**: Next.js API Routes (serverless)

### Blockchain Stack
- **Library**: ethers.js v6
- **Network**: Ethereum mainnet (Sepolia for testing)
- **RPC Provider**: Infura (free tier → growth plan)
- **Contracts**: USDC token only for MVP
- **Explorer**: Etherscan API

### Security & Encryption
- **Key Management**: Google Cloud KMS
- **Key Storage**: Triple-layer encryption (app + DB + KMS)
- **Session Management**: NextAuth + Redis
- **Rate Limiting**: Upstash Rate Limit
- **DDoS Protection**: Cloudflare (free tier)

### Payments
- **Provider**: Stripe (cards only for MVP)
- **Integration**: Stripe Elements
- **Webhooks**: Next.js API routes
- **KYC**: Manual review for first 100 users → Onfido later

### Hosting & Deployment
- **Frontend + API**: Vercel ($20/mo)
- **MCP Server**: DigitalOcean Droplet ($12/mo)
- **Database**: DigitalOcean Managed PostgreSQL ($15/mo)
- **Cache**: DigitalOcean Managed Redis ($15/mo)
- **CDN**: Vercel Edge Network (included)
- **SSL**: Automatic via Vercel
- **Total Cost**: $67/month

### Monitoring & Observability
- **Analytics**: Vercel Analytics (included)
- **Errors**: Sentry (free tier → $29/mo)
- **Logs**: Vercel Logs (included)
- **Uptime**: BetterUptime or UptimeRobot (free tier)

### DevOps
- **CI/CD**: Vercel (automatic deployment on git push)
- **Version Control**: GitHub
- **Testing**: Jest + Playwright
- **Linting**: ESLint + Prettier
- **Type Safety**: TypeScript strict mode

---

## Conclusion

This **REVISED** implementation plan provides a fast, lean path to building a production-ready crypto wallet for the ChatGPT Store MVP. Every requirement from the PRD and TechDoc has been translated into actionable tasks, with complexity deferred to Phase 2.

### Revised Estimates

**Timeline**: 6 weeks (vs 16 weeks original)
**Team**: 1-2 full-stack engineers (vs 3-5 specialists)
**Infrastructure**: $67/month (vs $500+/month)
**Total Budget**: $2,000-5,000 for MVP (vs $50k-100k)

### Critical Path Items (MVP)

1. ✅ Key management with Google Cloud KMS (Week 1)
2. ✅ Wallet creation and USDC transactions (Week 2)
3. ✅ ChatGPT GPT + MCP integration (Week 3-4)
4. ✅ Web confirmation flow (Week 4)
5. ✅ Stripe payments for buying crypto (Week 5)
6. ✅ Private beta with $100 limits (Week 6)

### Deferred to Phase 2 (Month 3-6)

- Staking/yield generation
- Fiat off-ramp (withdrawals)
- ACH/bank transfers
- Bitcoin support
- Polygon/L2 networks
- Advanced KYC (Tier 1-2)
- Complex fraud detection

### Why This Approach Works

1. **Faster validation**: 6 weeks to test product-market fit
2. **Lower risk**: $400/month burn rate vs $5k+/month
3. **Simpler stack**: Next.js handles frontend + API in one codebase
4. **Easier debugging**: 2 services (Vercel + DO) vs 10+ AWS services
5. **Regulatory safety**: $100 limits avoid money transmitter licensing initially

### Next Steps (IN ORDER)

**Day 1 (TODAY)**:
1. Complete Phase 0 (third-party account setup)
2. Save all API keys and credentials

**Week 1**:
3. Initialize Next.js project
4. Set up database with Prisma
5. Implement Google OAuth and KMS

**Week 2**:
6. Build wallet generation
7. Implement USDC balance checking
8. Create transaction signing service

**Week 3-4**:
9. Build ChatGPT GPT
10. Implement MCP server
11. Create transaction confirmation UI

**Week 5**:
12. Integrate Stripe payments
13. Build buy crypto flow
14. Add rate limiting and security

**Week 6**:
15. Testing and bug fixes
16. Deploy to Vercel + DigitalOcean
17. Invite first 10 beta users

### Success Criteria for MVP Launch

- ✅ 50+ beta users signed up
- ✅ 10+ successful transactions per day
- ✅ <2s API response times
- ✅ Zero security incidents
- ✅ <5% support ticket rate
- ✅ OpenAI GPT approved (or fallback working)

**Let's build the easiest crypto wallet in the world! 🚀**

**Remember**: Start simple, validate fast, scale when needed. AWS/CloudHSM can wait until you have 1,000+ users and actual revenue.

