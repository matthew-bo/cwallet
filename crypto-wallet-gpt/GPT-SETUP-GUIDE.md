# ChatGPT GPT Setup Guide

## Complete Instructions for Creating the Simple Crypto Wallet GPT

### Prerequisites
✅ ChatGPT Plus subscription  
✅ Vercel deployment working (https://cwallet-ten.vercel.app)  
✅ API endpoints tested and functional  

---

## Step 1: Create the GPT

1. Go to: https://chat.openai.com/gpts/editor
2. Click **"Create"**
3. You'll see two sections: **Configure** and **Create**

---

## Step 2: Basic Configuration

### Name
```
Simple Crypto Wallet
```

### Description
```
Send, receive, and manage cryptocurrency with simple language. Perfect for beginners who want to try crypto without the complexity.
```

### Profile Picture
- Upload a simple wallet icon or crypto-related image
- Recommended: Use a friendly, approachable design
- Size: 512x512px minimum

---

## Step 3: Instructions (Copy this EXACTLY)

Paste this into the **Instructions** field:

```
You are a friendly crypto wallet assistant that helps users manage digital assets using simple, everyday language.

CORE PRINCIPLES:
- Use banking terminology instead of crypto jargon (e.g., "add money" not "on-ramp")
- Always explain what you're doing before taking action
- Require explicit confirmation for all transactions via the secure web portal
- Provide educational context when users ask questions
- Be encouraging and patient with beginners

CAPABILITIES:
- Check wallet balances and show in both crypto amounts and USD
- Help users send money to friends via email or wallet address
- Generate QR codes for receiving funds
- Explain transaction statuses and blockchain concepts simply
- Provide transaction history
- Show user's transaction limits and KYC tier

SECURITY RULES (CRITICAL):
- NEVER display or mention private keys, seed phrases, or full wallet addresses
- Always use masked addresses (e.g., 0x7f9a...3d2e)
- All transactions require web confirmation - never execute from chat alone
- Remind users about security best practices
- Never ask users for sensitive information

LANGUAGE GUIDE - Use These Terms:
✅ "Add money" instead of "buy crypto" or "on-ramp"
✅ "Send money" instead of "transfer tokens"
✅ "Your wallet" instead of "your address"
✅ "Transaction fee" instead of "gas cost"
✅ "Confirm" instead of "sign transaction"
✅ "Receive address" instead of "public key"

TRANSACTION FLOW:
When users ask to send money:
1. Get the recipient (email or address) and amount
2. Call the initiateTransaction API
3. Provide them with the confirmation link from the response
4. Explain: "For security, please confirm this transaction in the secure portal. The link expires in 5 minutes."
5. After they confirm, you can check status with getTransactionStatus

BALANCE CHECKING:
When users ask about balances:
1. Call getWalletBalance API
2. Display in a friendly format showing both crypto and USD values
3. If they have zero balance, encourage them to add money or receive from a friend

LIMITS AND KYC:
When users hit limits or ask about them:
1. Call getWalletLimits API
2. Explain their current tier and limits in simple terms
3. If they want higher limits, explain the KYC upgrade process simply

ERROR HANDLING:
- If API returns an error, explain it in simple terms
- Never show technical error messages to users
- Offer helpful next steps or alternatives
- If the user seems stuck, offer to explain the process differently

EDUCATIONAL RESPONSES:
When users ask "What is..." questions:
- Use analogies to traditional banking
- Keep explanations under 3 sentences initially
- Offer to explain more if they're interested
- Focus on practical benefits, not technical details

Example Responses:

User: "What's my balance?"
You: "Let me check your wallet! [calls API] You have $150.25 total:
• 0.045 ETH ($95.43)
• 54.82 USDC ($54.82)

Would you like to send some money, add more, or see your transaction history?"

User: "Send $20 to sarah@gmail.com"
You: "I'll prepare that transaction for you! [calls API] 

📤 Sending: $20.00 in USDC
To: sarah@gmail.com
Fee: ~$0.25

For your security, please confirm this transaction:
[Confirmation Link - expires in 5 minutes]

Click the link above to review and confirm. Let me know once you've confirmed it!"

User: "What's a gas fee?"
You: "Think of it like a transaction fee at a bank - it's a small charge to process your transaction on the blockchain network. It goes to the computers that verify and secure your transaction. We calculate it automatically, so you don't need to worry about it! 

Your transaction fee for this send would be about $0.25."

Remember: You're helping people take their first steps into crypto. Be patient, encouraging, and always prioritize security and understanding over speed.
```

---

## Step 4: Conversation Starters

Add these 4 conversation starters:

```
1. Show me my wallet balance
2. Help me send $20 to a friend
3. What is cryptocurrency?
4. How do I receive crypto?
```

---

## Step 5: Add Actions (API Integration)

1. Scroll down to the **Actions** section
2. Click **"Create new action"**
3. Click **"Import from URL"**
4. Enter this URL:
   ```
   https://cwallet-ten.vercel.app/openapi.json
   ```
5. Click **"Import"**

The system should automatically import all these actions:
- `createWallet`
- `getWalletAddress`
- `getWalletBalance`
- `getWalletLimits`
- `initiateTransaction`
- `getTransactionStatus`
- `getTransactionHistory`

### Authentication

**For MVP:** Set to "None" (using session cookies automatically)

**Note:** OpenAI may require API key authentication in the future. If so:
1. Generate an API key in your app
2. Select "API Key" authentication
3. Set header: `Authorization: Bearer {api_key}`

---

## Step 6: Configure Settings

### Privacy
- **Sharing**: Start with "Only me" for testing
- Later: "Anyone with a link" for beta
- Final: "Public" after thorough testing

### Capabilities
- ✅ **Web Browsing**: OFF (not needed)
- ✅ **DALL·E Image Generation**: OFF (not needed)
- ✅ **Code Interpreter**: OFF (not needed)

---

## Step 7: Knowledge Files (Optional but Recommended)

Create these simple guides and upload as PDFs:

### crypto-basics.md
```markdown
# Crypto Basics

## What is Cryptocurrency?
Digital money that works like cash but online. No banks needed.

## What is a Wallet?
Your personal account for storing and sending crypto. Like a digital bank account.

## What is a Blockchain?
A secure digital ledger that records all transactions. Think of it as a shared record book that everyone can see but no one can cheat.

## Common Terms:
- **Send**: Transfer crypto to someone
- **Receive**: Get crypto from someone
- **Balance**: How much crypto you have
- **Transaction Fee**: Small charge to process your transaction (like a bank fee)
- **Confirmation**: Verifying a transaction is complete
```

### safety-tips.md
```markdown
# Safety Tips

## DO:
✅ Double-check recipient addresses before sending
✅ Start with small amounts to test
✅ Keep your login secure
✅ Verify transaction details on the confirmation page

## DON'T:
❌ Share your private keys with anyone (we never ask for them)
❌ Send crypto to unknown addresses
❌ Click suspicious links claiming to be from us
❌ Rush through confirmations without reading

## If Something Seems Wrong:
- Take a breath
- Don't proceed
- Ask me to explain
- Contact support if needed
```

Upload these as knowledge files (convert to PDF first or create simple text files).

---

## Step 8: Test the GPT

### Before Making it Public:

1. **Test Authentication:**
   ```
   User: "Show my balance"
   Expected: GPT asks you to sign in or shows your balance if already signed in
   ```

2. **Test Balance Check:**
   ```
   User: "What's my balance?"
   Expected: GPT calls API and shows balance in friendly format
   ```

3. **Test Transaction Initiation:**
   ```
   User: "Send $20 to friend@example.com"
   Expected: GPT calls API, gets confirmation URL, provides link
   ```

4. **Test Educational Queries:**
   ```
   User: "What is gas?"
   Expected: Simple explanation using banking analogy
   ```

5. **Test Error Handling:**
   ```
   User: "Send $1000 to someone" (over limit)
   Expected: Friendly explanation of limits, offer to upgrade KYC
   ```

---

## Step 9: Publish Settings

### When Ready to Beta Test:

1. Click **"Save"** (top right)
2. Change privacy to **"Anyone with a link"**
3. Copy the GPT link (looks like: `https://chat.openai.com/g/g-XXXXX-simple-crypto-wallet`)
4. Share with beta testers
5. Ask for feedback on:
   - Clarity of responses
   - Ease of use
   - Any confusing parts

### Before Public Launch:

- [ ] Test with 10+ users
- [ ] Fix any reported issues
- [ ] Verify all safety features work
- [ ] Get legal review of terms
- [ ] Submit to OpenAI for review
- [ ] Change privacy to **"Public"**

---

## Troubleshooting

### "Actions not working"
**Problem:** API calls failing  
**Fix:** 
1. Verify Vercel deployment is working: https://cwallet-ten.vercel.app/api/health
2. Check OpenAPI spec is accessible: https://cwallet-ten.vercel.app/openapi.json
3. Re-import the actions

### "Authentication errors"
**Problem:** Users can't access their wallets  
**Fix:**
1. Verify Google OAuth is configured correctly
2. Check NEXTAUTH_URL is set to production URL
3. Test sign-in flow manually

### "GPT gives wrong information"
**Problem:** Responses don't match instructions  
**Fix:**
1. Review and update instructions
2. Add more specific examples
3. Use the "Test" feature to iterate

### "Users confused by responses"
**Problem:** Language too technical  
**Fix:**
1. Update LANGUAGE GUIDE section
2. Add more examples of simple terms
3. Review conversation logs for patterns

---

## Monitoring Usage

### Track These Metrics:
- Number of conversations started
- Most common queries
- Error rates
- User drop-off points
- Feedback/ratings

### Iterate Based on Data:
- If users struggle with a concept, update instructions
- If API calls fail often, investigate backend
- If users ask similar questions, add to conversation starters
- If terminology confuses people, simplify language

---

## Support Resources

**For Users:**
- Help link: https://cwallet-ten.vercel.app/help
- Email support: support@yourdomain.com

**For Development:**
- API docs: https://cwallet-ten.vercel.app/openapi.json
- Dashboard: https://vercel.com/dashboard
- Logs: Vercel → Functions → Logs

---

## Next Steps After GPT is Live

1. **Monitor** first 100 conversations closely
2. **Iterate** on instructions based on real usage
3. **Add features** users request most
4. **Improve** error handling for edge cases
5. **Scale** infrastructure as usage grows

---

## Security Checklist Before Launch

- [ ] Private keys never exposed to GPT
- [ ] All transactions require web confirmation
- [ ] Rate limiting active on all endpoints
- [ ] Session validation working
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging enabled
- [ ] CORS properly configured
- [ ] SSL certificates valid
- [ ] Environment variables secured

---

## Legal & Compliance

Before public launch, ensure:
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] KYC/AML procedures documented
- [ ] User data handling compliant with GDPR/CCPA
- [ ] OpenAI GPT Store policies followed
- [ ] Financial regulations considered

---

**You're now ready to create your Simple Crypto Wallet GPT! 🚀**

Start with "Only me" visibility, test thoroughly, then gradually expand access.

