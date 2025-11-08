# MCP Server for Crypto Wallet

Production-ready MCP (Model Context Protocol) server that provides wallet context and tools to ChatGPT.

## Features

- ✅ Structured JSON logging with timestamps
- ✅ Health check endpoint for monitoring
- ✅ Session validation and authentication
- ✅ Comprehensive error handling
- ✅ Request/response logging for audit
- ✅ Graceful shutdown handling
- ✅ Production-ready with PM2 support

## Local Development Setup

1. **Install dependencies:**
```bash
cd mcp-server
npm install
```

2. **Configure environment:**
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Edit `.env`:
```
MCP_PORT=3001
API_BASE_URL=http://localhost:3000/api
NODE_ENV=development
```

3. **Start the server:**

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## Production Deployment (DigitalOcean)

### Prerequisites
- DigitalOcean droplet with Node.js 18+ installed
- PM2 installed globally: `npm install -g pm2`
- SSH access to the droplet

### Deployment Steps

1. **Copy files to droplet:**
```bash
# From your local machine
scp -r mcp-server root@your-droplet-ip:/opt/
```

Or clone via Git:
```bash
ssh root@your-droplet-ip
cd /opt
git clone <your-repo-url>
cd <your-repo>/mcp-server
```

2. **Install dependencies:**
```bash
ssh root@your-droplet-ip
cd /opt/mcp-server
npm install --production
```

3. **Create production environment file:**
```bash
cat > .env << EOF
MCP_PORT=3001
API_BASE_URL=https://your-vercel-app.vercel.app/api
NODE_ENV=production
EOF
```

4. **Create logs directory:**
```bash
mkdir -p logs
```

5. **Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

6. **Verify it's running:**
```bash
pm2 status
pm2 logs mcp-server
curl http://localhost:3001/health
```

### PM2 Commands

```bash
# View status
pm2 status

# View logs (live)
pm2 logs mcp-server

# Monitor resources
pm2 monit

# Restart
pm2 restart mcp-server

# Stop
pm2 stop mcp-server

# View detailed info
pm2 show mcp-server
```

### Optional: Nginx Reverse Proxy

If you want to expose the MCP server with SSL:

```nginx
server {
    listen 80;
    server_name mcp.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then add SSL with Let's Encrypt:
```bash
certbot --nginx -d mcp.yourdomain.com
```

## Available Endpoints

### Health Check (No Authentication Required)
```bash
GET /health
```

Response:
```json
{
  "mcpServer": "healthy",
  "apiConnectivity": "healthy",
  "timestamp": "2024-11-07T12:00:00.000Z",
  "apiDetails": {
    "status": "ok",
    "database": "connected",
    "redis": "connected"
  }
}
```

### List Resources (No Authentication Required)
```bash
GET /resources
```

Returns available context resources:
- `wallet://balance` - Current wallet balances
- `wallet://transactions` - Recent 10 transactions
- `wallet://limits` - User KYC limits and remaining capacity

### Fetch Resource (Authentication Required)
```bash
GET /resource/wallet%3A%2F%2Fbalance
Authorization: Bearer <session-token>
```

Example:
```bash
curl -H "Authorization: Bearer your-session-token" \
  http://localhost:3001/resource/wallet%3A%2F%2Fbalance
```

Response:
```json
{
  "data": {
    "success": true,
    "totalUSD": 150.25,
    "balances": {
      "eth": {
        "symbol": "ETH",
        "balance": "0.045",
        "usdValue": 95.43
      },
      "usdc": {
        "symbol": "USDC",
        "balance": "54.82",
        "usdValue": 54.82
      }
    }
  }
}
```

### List Tools (No Authentication Required)
```bash
GET /tools
```

### Execute Tool (Authentication Required)
```bash
POST /tool
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "tool": "get_balance",
  "args": {
    "currency": "USDC"
  }
}
```

Example:
```bash
curl -X POST \
  -H "Authorization: Bearer your-session-token" \
  -H "Content-Type: application/json" \
  -d '{"tool":"prepare_transaction","args":{"recipient":"friend@example.com","amount":20,"currency":"USDC"}}' \
  http://localhost:3001/tool
```

## Security

- ✅ Session validation on all authenticated endpoints
- ✅ All sensitive data sanitized before returning
- ✅ Private keys and session tokens NEVER included in responses
- ✅ Wallet addresses truncated for display (e.g., `0x7f9a...3d2e`)
- ✅ Request/response logging for audit trail
- ✅ CORS configured for production
- ✅ Timeouts on all external requests
- ✅ Graceful error handling

## Integration with ChatGPT

The MCP server acts as a bridge between ChatGPT and the wallet API:

1. **ChatGPT requests context** (e.g., wallet balance via GPT Action)
2. **MCP server validates session** token from user
3. **MCP server fetches data** from the main API
4. **Data is sanitized** - removes private keys, truncates addresses
5. **MCP server returns** clean data to ChatGPT
6. **ChatGPT uses context** to provide informed, personalized responses

```
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│   ChatGPT   │──────▶│ MCP Server  │──────▶│  Wallet API │
│  (OpenAI)   │◀──────│(DigitalOcean│◀──────│  (Vercel)   │
└─────────────┘        └─────────────┘        └─────────────┘
     User                 Bridge                Backend
  Interface            (Sanitizes Data)     (Secure Logic)
```

## Monitoring

### View Logs
```bash
# Real-time logs
pm2 logs mcp-server

# Specific lines
pm2 logs mcp-server --lines 100

# Error logs only
pm2 logs mcp-server --err

# View log files directly
tail -f logs/output.log
tail -f logs/error.log
```

### Metrics
```bash
# Resource usage
pm2 monit

# Process info
pm2 show mcp-server
```

## Troubleshooting

### MCP Server Won't Start
```bash
# Check if port is in use
lsof -i :3001

# Check logs
pm2 logs mcp-server --lines 50

# Verify environment variables
cat .env

# Test Node.js installation
node --version  # Should be 18+
```

### API Connectivity Issues
```bash
# Test health endpoint
curl http://localhost:3001/health

# Check if API is reachable
curl https://your-vercel-app.vercel.app/api/health

# Verify API_BASE_URL in .env
cat .env | grep API_BASE_URL
```

### Session Validation Failing
- Ensure the session token is valid and not expired
- Verify the main API is accessible from the droplet
- Check CORS settings if accessing from browser
- Confirm NextAuth session cookie format

### High Memory Usage
```bash
# Check current usage
pm2 show mcp-server

# Restart if needed
pm2 restart mcp-server

# Adjust max_memory_restart in ecosystem.config.js if needed
```

## Development Tips

1. **Use structured logging:**
   - All logs are JSON formatted for easy parsing
   - Include `requestId` for tracing requests
   
2. **Test health check regularly:**
   ```bash
   watch -n 5 'curl -s http://localhost:3001/health | jq'
   ```

3. **Monitor API calls:**
   ```bash
   pm2 logs mcp-server | grep "Fetching resource"
   ```

4. **Debug session issues:**
   ```bash
   pm2 logs mcp-server | grep "Session validation"
   ```

