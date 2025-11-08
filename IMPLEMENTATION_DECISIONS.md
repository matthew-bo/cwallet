# Implementation Decisions Summary

**Last Updated**: November 7, 2025
**Status**: Ready to Begin Development

This document consolidates all critical decisions made for the Crypto Wallet ChatGPT Store MVP.

---

## 🎯 Core Decisions

### Technology Stack
- **Framework**: Next.js 14 with TypeScript (App Router)
- **Database**: DigitalOcean Managed PostgreSQL + Redis
- **Blockchain**: ethers.js v6 (Ethereum + Sepolia testnet)
- **Authentication**: NextAuth.js with Google OAuth
- **Key Management**: Google Cloud KMS (not AWS)
- **Payments**: Stripe (cards only)
- **Hosting**: Vercel ($20/mo) + DigitalOcean ($42/mo)

### Why Not AWS?
- **Too complex** for MVP (100+ services)
- **Unpredictable costs** (surprise bills common)
- **Slow setup** (days vs hours)
- **Overkill** for <1000 users
- **Decision**: Use AWS only after 1000+ users or funding secured

---

## 💰 Budget & Timeline

### MVP Costs (Monthly)
```
Vercel Pro:                    $20
DigitalOcean Droplet:          $12
DigitalOcean PostgreSQL:       $15
DigitalOcean Redis:            $15
Google Cloud KMS:              ~$5
─────────────────────────────────
Total:                         $67/month
```

### Timeline
- **Original Plan**: 16 weeks, $500+/month
- **Revised MVP**: 6 weeks, $67/month
- **Savings**: 10 weeks faster, 87% cheaper

---

## 🚀 MVP Scope (6 Weeks)

### ✅ Included in MVP
1. Gmail OAuth authentication
2. USDC wallet creation (Ethereum only)
3. Send/receive USDC
4. Check balance (real-time)
5. Buy crypto with debit card (Stripe)
6. ChatGPT GPT integration
7. MCP server for context
8. Transaction confirmation UI
9. Basic dashboard
10. $100/month per-user limit (Tier 0 KYC)

### ❌ Deferred to Phase 2
- Bitcoin support
- Polygon/L2 chains
- Staking/yield generation
- Fiat off-ramp (withdrawals)
- ACH/bank transfers
- Advanced KYC (Tier 1-2)
- Contact management
- Complex fraud detection

---

## 🔐 Security Architecture

### Key Management
- **Encryption**: Google Cloud KMS (not AWS KMS/HSM)
- **Storage**: Triple-layer encryption
  1. Application layer (AES-256-GCM)
  2. Database layer (PostgreSQL pgcrypto)
  3. KMS layer (envelope encryption)
- **Signing**: Isolated service on DigitalOcean Droplet
- **Policy**: NEVER expose private keys to frontend, logs, or API responses

### Custodial Approach
- **MVP**: Fully custodial (no seed phrase shown to users)
- **Phase 2**: Optional seed phrase export for power users
- **Reasoning**: Simpler security model, better UX for beginners

---

## ⚖️ Regulatory Strategy

### Private Beta Approach
```
Phase 1 (Months 1-3):
  - 100 invited users
  - $100/month limit per user
  - $10,000 total monthly volume
  - Compliance: Terms of Service only
  - Goal: Product validation

Phase 2 (Months 4-6):
  - 1,000 users
  - $500/month limit
  - Compliance: Federal MSB registration
  - Goal: Scale testing

Phase 3 (Month 7+):
  - Public launch
  - Full KYC tiers
  - Compliance: State money transmitter licenses
  - Goal: Growth
```

### Why This Works
- Stays under regulatory thresholds initially
- Time to secure proper licensing
- Validates product-market fit before heavy legal costs
- Beta disclaimer: "This is a beta service with transaction limits. Not FDIC insured."

---

## 📋 Third-Party Accounts Required

### Day 1 Setup (Before Coding)
1. **Google Cloud Console** (30 mins)
   - OAuth credentials
   - KMS key ring
   - Service account for KMS

2. **Infura** (15 mins)
   - Sepolia testnet endpoint
   - Ethereum mainnet endpoint

3. **DigitalOcean** (30 mins)
   - Managed PostgreSQL
   - Managed Redis
   - Droplet for MCP server

4. **Vercel** (15 mins)
   - Connect with GitHub
   - Upgrade to Pro plan

5. **Domain Name** (optional Day 1)
   - Suggested: simplewallet.chat, easycrypto.chat
   - Can use placeholder initially

### Week 2 Setup
6. **Stripe** (for payments)
   - Test mode first
   - Production keys after testing

### Week 6 Setup (If Ready)
7. **OpenAI Platform**
   - Create GPT
   - Configure actions

---

## 🏗️ Project Structure

```
crypto-wallet-gpt/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── wallet/
│   │   │   ├── balance/route.ts
│   │   │   └── create/route.ts
│   │   └── transaction/
│   │       ├── initiate/route.ts
│   │       └── execute/route.ts
│   ├── confirm/
│   │   └── [token]/page.tsx   # Transaction confirmation
│   ├── dashboard/page.tsx      # User dashboard
│   └── page.tsx                # Landing/sign-in
├── lib/
│   ├── db/                     # Prisma client
│   ├── kms/                    # Google Cloud KMS wrapper
│   ├── blockchain/             # ethers.js utilities
│   └── auth/                   # NextAuth config
├── components/                 # React components
├── prisma/
│   └── schema.prisma           # Database schema
└── .env.local                  # Environment variables

Separate Repository:
mcp-server/                     # Deployed to DigitalOcean Droplet
├── src/
│   ├── server.ts
│   └── signer.ts
└── package.json
```

---

## 🧪 Testing Strategy

### Testnet First
- **Week 1-2**: Sepolia testnet only (free, safe testing)
- **Week 3-4**: Soft mainnet launch (invited users, low limits)
- **Week 5+**: Public mainnet (after validation)

### Test Coverage
- **Critical paths** (key management, signing): 100% coverage, TDD
- **Regular features** (API endpoints, UI): 80% coverage, test after
- **Integration tests**: Run before each deployment
- **Manual testing**: All user journeys tested by team

---

## 📊 Success Metrics

### MVP Launch Goals (Week 6)
- 50+ beta users signed up
- 10+ successful transactions per day
- <2s API response times (p95)
- Zero security incidents
- <5% support ticket rate
- 99%+ uptime

### Business Metrics
- Cost per user: <$10
- Weekly active users: >50% of signups
- Transaction success rate: >95%
- OpenAI GPT approval achieved (or fallback ready)

---

## 🚨 Critical Security Rules

### NEVER Do These
```javascript
const FORBIDDEN = [
  "Log private keys or mnemonics",
  "Return private keys in API responses",
  "Skip KMS encryption for keys",
  "Hardcode secrets in code",
  "Execute transactions without web confirmation",
  "Store unencrypted sensitive data",
  "Use ${} template strings in SQL queries"
];
```

### ALWAYS Do These
```javascript
const REQUIRED = [
  "Use Prisma for all database queries",
  "Encrypt all private keys with Google Cloud KMS",
  "Validate all inputs with Zod schemas",
  "Implement rate limiting on all endpoints",
  "Use TypeScript strict mode",
  "Test on Sepolia testnet first",
  "Require web confirmation for all transactions"
];
```

---

## 🎯 Development Order (STRICT SEQUENCE)

```
Phase 0 (Day 1):
  - Set up all third-party accounts
  - Save all API keys and credentials
  - Create .env.example

Week 1 - Phase 1:
  - Initialize Next.js project
  - Set up Prisma + database
  - Implement NextAuth (Gmail OAuth)
  - Integrate Google Cloud KMS
  - Test encryption/decryption

Week 2 - Phase 2:
  - Build wallet generation (ethers.js)
  - Implement balance checking (Infura)
  - Create transaction signing service
  - Test on Sepolia testnet

Week 3-4 - Phase 4:
  - Create ChatGPT GPT
  - Build MCP server (DigitalOcean)
  - Implement MCP resources & tools
  - Test conversation flows

Week 5 - Phase 7:
  - Integrate Stripe Elements
  - Build buy crypto flow
  - Test payment processing
  - Add $100 limit enforcement

Week 6 - Phase 9:
  - Write unit + integration tests
  - Fix bugs and polish UX
  - Deploy to Vercel + DigitalOcean
  - Invite first 10 beta users
```

**Important**: DO NOT skip phases or work out of order. Each phase builds on the previous.

---

## 🔄 When to Scale to AWS

### Triggers for AWS Migration
- Over 1,000 active users
- Need multi-region deployment
- Regulatory requires hardware HSM
- Enterprise customers demand it
- Raising Series A funding

### What to Upgrade
- DigitalOcean → AWS RDS + ElastiCache
- Google Cloud KMS → AWS CloudHSM
- Vercel → AWS ECS/Fargate
- Manual scaling → Auto-scaling groups

### Cost Impact
- Current: $67/month
- After AWS: $500-1,000/month
- **Wait until revenue justifies the increase**

---

## 📞 Support & Operations

### Day 1-30 (Internal Testing)
- Support: Slack/Discord with team
- Monitoring: Vercel logs
- Uptime: Manual checks

### Month 2-3 (Private Beta)
- Support: Email (support@yourdomain.com)
- Monitoring: Sentry for errors
- Uptime: BetterUptime (free tier)

### Month 4+ (Public Beta)
- Support: Intercom/Zendesk
- Monitoring: Sentry + Vercel Analytics
- Uptime: Paid monitoring with alerts

---

## ✅ Pre-Launch Checklist

### Technical
- [ ] All tests passing (90%+ coverage)
- [ ] Security audit completed (or scheduled)
- [ ] Load testing (100 concurrent users)
- [ ] Deployed to production
- [ ] SSL/HTTPS working
- [ ] Monitoring configured
- [ ] Backups automated

### Legal
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Beta disclaimer prominent
- [ ] Support email functional

### Product
- [ ] ChatGPT GPT created (and approved OR fallback ready)
- [ ] Transaction confirmation flow tested
- [ ] $100 limit enforced
- [ ] Test transactions on mainnet successful
- [ ] Dashboard showing real data

### Marketing
- [ ] Landing page live
- [ ] Help documentation ready
- [ ] Beta invite list prepared
- [ ] Social media accounts created

---

## 🎓 Key Lessons for Implementation

1. **Start simple**: USDC-only gets you to market 10x faster
2. **Testnet first**: Always test on Sepolia before mainnet
3. **Limit early**: $100 limits avoid regulatory headaches
4. **Vercel > AWS**: For <1000 users, simpler is better
5. **Security first**: Triple-encrypt keys, never log them
6. **MVP mindset**: Ship in 6 weeks, iterate based on feedback

---

## 📚 Reference Documents

- **PRD.md**: Product requirements and user personas
- **TechDoc.md**: Complete technical specifications
- **ImplementationPlan.md**: Phase-by-phase development plan
- **This file**: Quick decision reference

---

## 🚀 Ready to Start?

**Next Action**: Complete Phase 0 (third-party account setup) in TechDoc.md § 2

**Questions before starting?**
- Infrastructure decisions: ✅ Finalized
- Tech stack: ✅ Finalized
- Budget: ✅ Approved
- Timeline: ✅ Set (6 weeks)
- Scope: ✅ Defined (MVP only)

**Let's build! 🎉**

