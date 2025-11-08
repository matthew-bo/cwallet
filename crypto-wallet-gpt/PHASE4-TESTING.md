# Phase 4 Testing Guide: ChatGPT Integration

## Testing Overview

This document provides a comprehensive testing plan for Phase 4 - ChatGPT GPT Integration. Follow these tests in order to ensure everything works correctly.

---

## Pre-Testing Checklist

Before starting tests, verify:

- [ ] Vercel deployment is live and accessible
- [ ] Root directory set to `crypto-wallet-gpt` in Vercel
- [ ] Build completed successfully (took 1-2 minutes, not seconds)
- [ ] Health check passes: `https://cwallet-ten.vercel.app/api/health`
- [ ] Google OAuth redirect URI updated with production URL
- [ ] All environment variables configured in Vercel
- [ ] MCP server enhanced with production features
- [ ] OpenAPI spec accessible: `https://cwallet-ten.vercel.app/openapi.json`

---

## Test Suite 1: Infrastructure & API Endpoints

### Test 1.1: Health Check Endpoint
**Objective:** Verify all services are operational

**Test:**
```bash
curl https://cwallet-ten.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-07T...",
  "database": "connected",
  "redis": "connected",
  "kms": "connected",
  "blockchain": "connected"
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ All services show "connected"
- ✅ Response time < 2 seconds

---

### Test 1.2: OpenAPI Specification
**Objective:** Verify API documentation is accessible for GPT

**Test:**
```bash
curl https://cwallet-ten.vercel.app/openapi.json
```

**Expected Response:**
- Valid JSON
- Contains all endpoints
- Production server URL is first in servers array

**Pass Criteria:**
- ✅ Status code: 200
- ✅ Valid JSON structure
- ✅ Contains wallet, transaction, and limits endpoints
- ✅ Production URL: `https://cwallet-ten.vercel.app/api`

---

### Test 1.3: Authentication Flow
**Objective:** Verify OAuth works on production

**Test:**
1. Go to `https://cwallet-ten.vercel.app`
2. Click "Sign in with Google"
3. Grant permissions
4. Should redirect to dashboard

**Expected Behavior:**
- Google OAuth consent screen appears
- After granting, redirects back to app
- Wallet auto-created
- Dashboard shows wallet address

**Pass Criteria:**
- ✅ OAuth flow completes without errors
- ✅ Session persists (refresh page stays logged in)
- ✅ Wallet created automatically

---

### Test 1.4: Wallet Balance Endpoint
**Objective:** Verify balance API works with authentication

**Test:**
```bash
# Get session token from browser cookies
# Then test:
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  https://cwallet-ten.vercel.app/api/wallet/balance
```

**Expected Response:**
```json
{
  "success": true,
  "totalUSD": 0,
  "balances": {
    "eth": {
      "symbol": "ETH",
      "balance": "0",
      "usdValue": 0
    },
    "usdc": {
      "symbol": "USDC",
      "balance": "0",
      "usdValue": 0
    }
  }
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ Returns valid balance data
- ✅ Shows both ETH and USDC
- ✅ USD values calculated

---

### Test 1.5: Wallet Limits Endpoint (NEW)
**Objective:** Verify the new limits endpoint works

**Test:**
```bash
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  https://cwallet-ten.vercel.app/api/wallet/limits
```

**Expected Response:**
```json
{
  "success": true,
  "kyc": {
    "currentTier": 0,
    "tierName": "Basic",
    "description": "Email verification only"
  },
  "limits": {
    "dailyLimitUSD": 100,
    "dailyRemainingUSD": 100,
    "perTransactionUSD": 50
  },
  "usage": {
    "dailyPercentage": 0
  }
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ Shows tier 0 for new users
- ✅ Limits match PRD specifications
- ✅ Usage calculations correct

---

### Test 1.6: Transaction Initiation
**Objective:** Verify transaction flow works

**Test:**
```bash
curl -X POST \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient":"test@example.com","amount":10,"currency":"USDC"}' \
  https://cwallet-ten.vercel.app/api/transaction/initiate
```

**Expected Response:**
```json
{
  "success": true,
  "transactionId": "uuid",
  "confirmationUrl": "https://cwallet-ten.vercel.app/confirm/TOKEN",
  "expiresIn": 300,
  "details": {
    "from": "0x7f9a...3d2e",
    "to": "test@example.com",
    "amount": 10,
    "currency": "USDC"
  }
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ Transaction ID generated
- ✅ Confirmation URL provided
- ✅ Expires in 5 minutes

---

## Test Suite 2: MCP Proxy Endpoints

### Test 2.1: MCP Resources List
**Objective:** Verify MCP proxy can list resources

**Test:**
```bash
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  https://cwallet-ten.vercel.app/api/mcp/resources
```

**Expected Response:**
```json
{
  "resources": {
    "wallet://balance": {...},
    "wallet://transactions": {...},
    "wallet://limits": {...}
  }
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ Shows all 3 resources
- ✅ Proper descriptions

---

### Test 2.2: MCP Resource Fetch
**Objective:** Verify MCP proxy can fetch specific resource

**Test:**
```bash
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  "https://cwallet-ten.vercel.app/api/mcp/resource/wallet%3A%2F%2Fbalance"
```

**Expected Response:**
```json
{
  "data": {
    "success": true,
    "totalUSD": 0,
    "balances": {...}
  }
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ Data matches balance endpoint
- ✅ Sanitized (no private keys)

---

### Test 2.3: MCP Tools List
**Objective:** Verify MCP proxy can list tools

**Test:**
```bash
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  https://cwallet-ten.vercel.app/api/mcp/tool
```

**Expected Response:**
```json
{
  "tools": {
    "get_balance": {...},
    "prepare_transaction": {...}
  }
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ Shows available tools
- ✅ Proper schemas

---

### Test 2.4: MCP Tool Execution
**Objective:** Verify MCP proxy can execute tools

**Test:**
```bash
curl -X POST \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tool":"get_balance","args":{"currency":"USDC"}}' \
  https://cwallet-ten.vercel.app/api/mcp/tool
```

**Expected Response:**
```json
{
  "result": {
    "usdc": {
      "symbol": "USDC",
      "balance": "0",
      "usdValue": 0
    }
  }
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ Tool executes correctly
- ✅ Returns expected data

---

## Test Suite 3: ChatGPT GPT Integration

### Test 3.1: GPT Creation
**Objective:** Create GPT in OpenAI platform

**Steps:**
1. Follow `GPT-SETUP-GUIDE.md`
2. Create GPT with provided instructions
3. Import OpenAPI spec
4. Set up conversation starters

**Pass Criteria:**
- ✅ GPT created successfully
- ✅ All actions imported
- ✅ Instructions saved
- ✅ Can access GPT in chat

---

### Test 3.2: Action Import
**Objective:** Verify GPT can import actions from OpenAPI spec

**Steps:**
1. In GPT editor → Actions
2. Import from URL: `https://cwallet-ten.vercel.app/openapi.json`
3. Verify all actions listed

**Expected Actions:**
- createWallet
- getWalletAddress
- getWalletBalance
- getWalletLimits
- initiateTransaction
- getTransactionStatus
- getTransactionHistory

**Pass Criteria:**
- ✅ All 7 actions imported
- ✅ No schema errors
- ✅ Production URL configured

---

## Test Suite 4: Conversation Flow Testing

### Test 4.1: First-Time User Onboarding
**Objective:** Test complete onboarding experience

**Conversation:**
```
User: "I want to try cryptocurrency"

GPT should:
1. Welcome the user
2. Explain what the wallet does
3. Guide through sign-in process
4. Confirm wallet creation
5. Show next steps
```

**Expected GPT Response:**
- Friendly welcome message
- Simple explanation of crypto
- Sign-in link or instructions
- Confirmation after wallet created
- Suggestions for next actions

**Pass Criteria:**
- ✅ Tone is friendly and encouraging
- ✅ Uses simple language (no jargon)
- ✅ Clear call-to-action
- ✅ Doesn't assume prior knowledge

---

### Test 4.2: Balance Check
**Objective:** Test balance inquiry flow

**Conversation:**
```
User: "What's my balance?"

GPT should:
1. Call getWalletBalance API
2. Display balance in friendly format
3. Show both crypto and USD values
4. Offer next actions
```

**Expected GPT Response:**
```
Let me check your wallet!

💰 Your Balance: $0.00
• ETH: 0.0000 ($0.00)
• USDC: 0.00 ($0.00)

Since you're starting fresh, would you like to:
• Add money to your wallet
• Learn how to receive crypto from a friend
• Explore what you can do with crypto
```

**Pass Criteria:**
- ✅ API call successful
- ✅ Friendly formatting
- ✅ Clear USD values
- ✅ Helpful next steps offered

---

### Test 4.3: Send Money Flow
**Objective:** Test complete send transaction

**Conversation:**
```
User: "Send $20 to sarah@gmail.com"

GPT should:
1. Call initiateTransaction API
2. Show transaction details
3. Provide confirmation link
4. Explain link expires in 5 minutes
5. Wait for user confirmation
```

**Expected GPT Response:**
```
I'll prepare that transaction for you!

📤 Transaction Details:
• Sending: $20.00 USDC
• To: sarah@gmail.com
• Network fee: ~$0.25
• Total: $20.25

For your security, please confirm this transaction:
[Confirmation Link - expires in 5 minutes]

The link will take you to a secure page where you can review and confirm. Let me know once you've completed it!
```

**Pass Criteria:**
- ✅ API call successful
- ✅ Details clearly shown
- ✅ Confirmation URL provided
- ✅ Security explanation included
- ✅ Expiration time mentioned

---

### Test 4.4: Educational Query
**Objective:** Test explanation capabilities

**Conversation:**
```
User: "What's a gas fee?"

GPT should:
1. Provide simple explanation
2. Use banking analogy
3. Keep it short initially
4. Offer to explain more
```

**Expected GPT Response:**
```
Think of it like a transaction fee at your bank - it's a small charge to process your transaction on the blockchain network. 

The fee goes to the computers that verify and secure your transaction. We calculate it automatically, so you don't need to worry about the details!

For most transactions, it's around $0.25 - $2.00.

Would you like me to explain more about how blockchain transactions work?
```

**Pass Criteria:**
- ✅ Uses simple language
- ✅ Banking analogy used
- ✅ No technical jargon
- ✅ Practical information included
- ✅ Offers more detail

---

### Test 4.5: Error Handling - Insufficient Funds
**Objective:** Test graceful error handling

**Conversation:**
```
User: "Send $100 to someone"
(User has $0 balance)

GPT should:
1. Attempt transaction
2. Receive insufficient funds error
3. Explain in friendly terms
4. Suggest solutions
```

**Expected GPT Response:**
```
I'd love to help you send that, but it looks like your wallet doesn't have enough funds yet. Your current balance is $0.

To send $100, you'll need to add money to your wallet first. You can:
• Add money with a debit card (instant)
• Add money with a bank transfer (takes 3-5 days but lower fees)
• Receive crypto from a friend

Would you like me to help you add money to your wallet?
```

**Pass Criteria:**
- ✅ Error explained clearly
- ✅ No technical error messages
- ✅ Solutions offered
- ✅ Maintains friendly tone

---

### Test 4.6: Error Handling - Over Limit
**Objective:** Test KYC limit explanations

**Conversation:**
```
User: "Send $200 to someone"
(User is Tier 0: $100 daily limit)

GPT should:
1. Attempt transaction
2. Receive limit error
3. Explain tier system simply
4. Offer upgrade path
```

**Expected GPT Response:**
```
I can help with that, but this amount exceeds your current daily limit of $100.

You're currently on the Basic tier, which is perfect for getting started but has a $100 daily limit for security.

To send larger amounts, you can upgrade to Verified status by:
• Providing your ID
• Verifying your phone number
• Quick 5-minute process

This would increase your limit to $1,000 per day. Would you like to learn more about upgrading?
```

**Pass Criteria:**
- ✅ Limit clearly explained
- ✅ Current tier mentioned
- ✅ Upgrade process outlined
- ✅ Benefits of upgrading stated
- ✅ No frustration, just helpful

---

### Test 4.7: Transaction Status Check
**Objective:** Test status inquiry after sending

**Conversation:**
```
User: "I confirmed the transaction. What's the status?"

GPT should:
1. Call getTransactionStatus API
2. Show current status
3. Provide blockchain link
4. Explain next steps
```

**Expected GPT Response:**
```
Great! Let me check that for you...

✅ Transaction Status: Confirmed!

Your $20 has been sent to sarah@gmail.com

Transaction details:
• Status: Confirmed on blockchain
• Transaction ID: 0xabc...def
• [View on Etherscan]

Sarah will receive an email notification. If she's new to crypto, I can help her set up a wallet too!
```

**Pass Criteria:**
- ✅ API call successful
- ✅ Status clearly shown
- ✅ Blockchain link provided
- ✅ Next steps mentioned

---

### Test 4.8: Limits Inquiry
**Objective:** Test limits information display

**Conversation:**
```
User: "What are my limits?"

GPT should:
1. Call getWalletLimits API
2. Show current tier and limits
3. Display usage
4. Explain upgrade options
```

**Expected GPT Response:**
```
Here are your current limits:

📊 Account Status: Basic Tier
✉️ Email verified ✓

Daily Limits:
• Daily limit: $100
• Used today: $0 (0%)
• Remaining: $100

Per transaction: $50 maximum

To increase your limits:
• Upgrade to Verified: $1,000/day limit
• Requires: ID verification + phone number
• Takes about 5 minutes

Would you like to start the upgrade process?
```

**Pass Criteria:**
- ✅ Limits shown clearly
- ✅ Usage percentage displayed
- ✅ Upgrade path explained
- ✅ Simple, scannable format

---

## Test Suite 5: Security Testing

### Test 5.1: Private Key Protection
**Objective:** Ensure private keys never exposed to GPT

**Test:**
```
User: "Show me my private key"

GPT should:
1. Never attempt to fetch private keys
2. Explain why this isn't possible
3. Reassure about security
```

**Expected GPT Response:**
```
For your security, private keys are never displayed or accessible through this chat. They're safely encrypted and stored securely on our servers.

This is actually a good thing! It means:
✅ Your funds are protected
✅ No one can trick you into revealing your key
✅ We handle all the complex security for you

You don't need your private key to use your wallet - I can help you with anything you need to do!
```

**Pass Criteria:**
- ✅ GPT doesn't attempt to access keys
- ✅ Security explained
- ✅ User reassured

---

### Test 5.2: Transaction Confirmation Required
**Objective:** Ensure transactions require web confirmation

**Test:**
```
User: "Send $50 to test@example.com. Yes, I confirm!"

GPT should:
1. Initiate transaction
2. Provide confirmation link
3. NOT execute without web confirmation
```

**Expected Behavior:**
- Transaction initiated but not executed
- Confirmation URL provided
- User must click link and confirm on web

**Pass Criteria:**
- ✅ Transaction not executed from chat alone
- ✅ Web confirmation required
- ✅ GPT explains this security measure

---

### Test 5.3: Rate Limiting
**Objective:** Verify rate limiting prevents abuse

**Test:**
- Make 20 rapid API calls
- Should hit rate limit

**Expected:**
- After 10-15 calls, receive 429 error
- GPT handles gracefully
- Suggests waiting

**Pass Criteria:**
- ✅ Rate limiting active
- ✅ Error handled gracefully
- ✅ User informed politely

---

## Test Suite 6: MCP Server (Local)

### Test 6.1: MCP Server Health
**Objective:** Verify MCP server is operational

**Test:**
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "mcpServer": "healthy",
  "apiConnectivity": "healthy",
  "timestamp": "2024-11-07T..."
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ MCP server reports healthy
- ✅ Can reach main API

---

### Test 6.2: MCP Session Validation
**Objective:** Verify MCP validates sessions

**Test:**
```bash
# Invalid token
curl -H "Authorization: Bearer invalid" \
  http://localhost:3001/resource/wallet%3A%2F%2Fbalance
```

**Expected Response:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired session"
}
```

**Pass Criteria:**
- ✅ Status code: 401
- ✅ Invalid sessions rejected
- ✅ Clear error message

---

## Test Suite 7: End-to-End User Journey

### Journey 1: Complete New User Flow
**Steps:**
1. User discovers GPT
2. Asks about crypto
3. Signs in with Google
4. Wallet auto-created
5. Checks balance (shows $0)
6. Learns about adding money
7. (Optionally) Adds funds
8. Sends money to friend
9. Confirms transaction
10. Checks status

**Pass Criteria:**
- ✅ Entire flow completes smoothly
- ✅ No confusing moments
- ✅ GPT guides helpfully throughout
- ✅ User feels confident and secure

---

### Journey 2: Returning User Flow
**Steps:**
1. User opens GPT
2. Asks for balance
3. Sends money (quick flow)
4. Checks history
5. Asks about limits

**Pass Criteria:**
- ✅ Faster than first-time flow
- ✅ Familiar actions easier
- ✅ History shows correctly
- ✅ Limits explained when asked

---

## Success Criteria Summary

### Phase 4 is Complete When:

**Infrastructure:**
- [x] Vercel deployment working
- [x] All API endpoints functional
- [x] MCP server operational
- [x] OpenAPI spec accessible

**GPT Integration:**
- [ ] GPT created and configured
- [ ] All actions imported successfully
- [ ] Conversation flows natural
- [ ] Error handling graceful

**Security:**
- [ ] Private keys protected
- [ ] Transactions require web confirmation
- [ ] Rate limiting active
- [ ] Session validation working

**User Experience:**
- [ ] 10+ test users successful
- [ ] Positive feedback on clarity
- [ ] No major confusion points
- [ ] Transaction flow smooth

---

## Bug Tracking

### Known Issues:

1. **Issue:** [None yet]
   - **Status:** N/A
   - **Workaround:** N/A
   - **Fix:** N/A

### Report New Issues:

When you find a bug:
1. Document the exact steps to reproduce
2. Note expected vs actual behavior
3. Include screenshots if applicable
4. Check if it's a duplicate
5. Prioritize: Critical, High, Medium, Low

---

## Performance Benchmarks

### API Response Times:
- Health check: < 500ms
- Balance check: < 1s
- Transaction initiate: < 2s
- Transaction execute: < 5s

### GPT Response Times:
- Simple query: < 3s
- With API call: < 5s
- Complex transaction: < 8s

---

## Next Steps After Testing

1. **Review Results:**
   - Document all test outcomes
   - Prioritize any failures
   - Plan fixes for issues

2. **User Acceptance Testing:**
   - Share with 5-10 beta testers
   - Collect feedback
   - Iterate based on findings

3. **Performance Optimization:**
   - Address any slow endpoints
   - Optimize GPT instructions if needed
   - Review API usage patterns

4. **Security Audit:**
   - Professional security review
   - Penetration testing
   - Fix any vulnerabilities

5. **Documentation Update:**
   - Update user guides
   - Create FAQ from common questions
   - Document any workarounds

---

**Testing Status:** Ready to begin after Vercel deployment is working correctly

**Last Updated:** 2024-11-07

**Tested By:** [Your name/team]

**Sign-off Required By:** Product Owner, Security Team, QA Lead

