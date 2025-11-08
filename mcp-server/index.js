/**
 * Production MCP Server for Crypto Wallet
 * 
 * Provides wallet context and tools to ChatGPT
 * Production-ready with error handling, logging, and health checks
 */

import axios from 'axios';
import * as http from 'http';
import * as url from 'url';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const PORT = process.env.MCP_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Structured logging with timestamps
 */
function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    environment: NODE_ENV,
    ...meta
  };
  
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * MCP Resources - Context that can be provided to the model
 */
const resources = {
  'wallet://balance': {
    name: 'Wallet Balance',
    description: 'Current wallet balances for all tokens',
    mimeType: 'application/json'
  },
  'wallet://transactions': {
    name: 'Recent Transactions',
    description: 'Last 10 transactions',
    mimeType: 'application/json'
  },
  'wallet://limits': {
    name: 'Transaction Limits',
    description: 'User KYC limits and remaining capacity',
    mimeType: 'application/json'
  }
};

/**
 * MCP Tools - Actions that can be executed
 */
const tools = {
  'get_balance': {
    name: 'Get Balance',
    description: 'Get wallet balance for a specific token',
    inputSchema: {
      type: 'object',
      properties: {
        currency: {
          type: 'string',
          description: 'Currency symbol (e.g., ETH, USDC)'
        }
      }
    }
  },
  'prepare_transaction': {
    name: 'Prepare Transaction',
    description: 'Prepare a transaction for confirmation',
    inputSchema: {
      type: 'object',
      required: ['recipient', 'amount', 'currency'],
      properties: {
        recipient: {
          type: 'string',
          description: 'Recipient email or address'
        },
        amount: {
          type: 'number',
          description: 'Amount to send'
        },
        currency: {
          type: 'string',
          description: 'Currency to send (USDC)'
        }
      }
    }
  }
};

/**
 * Validate session token
 */
async function validateSession(sessionToken) {
  if (!sessionToken) {
    return { valid: false, error: 'No session token provided' };
  }
  
  try {
    // Test the session by making a request to the API
    const response = await axios.get(`${API_BASE_URL}/wallet/address`, {
      headers: {
        'Cookie': `next-auth.session-token=${sessionToken}`
      },
      timeout: 5000
    });
    
    return { valid: response.status === 200 };
  } catch (error) {
    log('warn', 'Session validation failed', { 
      error: error.message,
      status: error.response?.status 
    });
    return { valid: false, error: 'Invalid or expired session' };
  }
}

/**
 * Fetch resource data from the main API
 */
async function fetchResource(resourceUri, sessionToken) {
  const startTime = Date.now();
  
  try {
    let endpoint;
    
    switch (resourceUri) {
      case 'wallet://balance':
        endpoint = `${API_BASE_URL}/wallet/balance`;
        break;
      case 'wallet://transactions':
        endpoint = `${API_BASE_URL}/transaction/history?limit=10`;
        break;
      case 'wallet://limits':
        endpoint = `${API_BASE_URL}/wallet/limits`;
        break;
      default:
        log('warn', 'Unknown resource requested', { resourceUri });
        return { error: 'Unknown resource' };
    }
    
    log('info', 'Fetching resource', { resourceUri, endpoint });
    
    const response = await axios.get(endpoint, {
      headers: {
        'Cookie': `next-auth.session-token=${sessionToken}`
      },
      timeout: 10000
    });
    
    const duration = Date.now() - startTime;
    log('info', 'Resource fetched successfully', { 
      resourceUri, 
      duration,
      status: response.status 
    });
    
    return sanitizeData(response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    log('error', 'Failed to fetch resource', {
      resourceUri,
      duration,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    return { 
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Execute tool action
 */
async function executeTool(toolName, args, sessionToken) {
  const startTime = Date.now();
  
  try {
    log('info', 'Executing tool', { toolName, args: Object.keys(args) });
    
    switch (toolName) {
      case 'get_balance': {
        const response = await axios.get(`${API_BASE_URL}/wallet/balance`, {
          headers: {
            'Cookie': `next-auth.session-token=${sessionToken}`
          },
          timeout: 10000
        });
        
        const data = response.data;
        if (args.currency) {
          const currency = args.currency.toLowerCase();
          const result = {
            [currency]: data.balances[currency]
          };
          
          const duration = Date.now() - startTime;
          log('info', 'Tool executed successfully', { toolName, duration });
          return result;
        }
        
        const duration = Date.now() - startTime;
        log('info', 'Tool executed successfully', { toolName, duration });
        return sanitizeData(data);
      }
      
      case 'prepare_transaction': {
        const response = await axios.post(
          `${API_BASE_URL}/transaction/initiate`,
          {
            recipient: args.recipient,
            amount: args.amount,
            currency: args.currency
          },
          {
            headers: {
              'Cookie': `next-auth.session-token=${sessionToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        
        const duration = Date.now() - startTime;
        log('info', 'Tool executed successfully', { 
          toolName, 
          duration,
          transactionId: response.data.transactionId 
        });
        
        return sanitizeData(response.data);
      }
      
      default:
        log('warn', 'Unknown tool requested', { toolName });
        return { error: 'Unknown tool' };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    log('error', 'Failed to execute tool', {
      toolName,
      duration,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    return { 
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Sanitize data to remove sensitive information
 * NEVER include private keys, full addresses, or session tokens
 */
function sanitizeData(data) {
  if (!data) return data;
  
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Remove or truncate sensitive fields
  const truncateAddress = (addr) => {
    if (!addr || typeof addr !== 'string') return addr;
    if (addr.length > 20) {
      return `${addr.substring(0, 10)}...${addr.substring(addr.length - 8)}`;
    }
    return addr;
  };
  
  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    for (const key in obj) {
      if (key.includes('address') || key.includes('Address')) {
        obj[key] = truncateAddress(obj[key]);
      } else if (key.includes('token') || key.includes('Token') || key.includes('key') || key.includes('Key')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
    
    return obj;
  };
  
  return sanitizeObject(sanitized);
}

/**
 * Health check - verify server and API connectivity
 */
async function healthCheck() {
  const checks = {
    mcpServer: 'healthy',
    apiConnectivity: 'unknown',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Test API connectivity
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      checks.apiConnectivity = 'healthy';
      checks.apiDetails = response.data;
    } else {
      checks.apiConnectivity = 'unhealthy';
    }
  } catch (error) {
    checks.apiConnectivity = 'unhealthy';
    checks.apiError = error.message;
    log('error', 'Health check failed - API unreachable', { error: error.message });
  }
  
  return checks;
}

/**
 * HTTP request handler
 */
async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const requestId = Math.random().toString(36).substring(7);
  
  // Log incoming request
  log('info', 'Incoming request', {
    requestId,
    method: req.method,
    pathname,
    userAgent: req.headers['user-agent']
  });
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Request-ID', requestId);
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Get session token from Authorization header
  const authHeader = req.headers.authorization;
  const sessionToken = authHeader?.replace('Bearer ', '');
  
  try {
    // Health check endpoint (no auth required)
    if (pathname === '/health') {
      const health = await healthCheck();
      const statusCode = health.apiConnectivity === 'healthy' ? 200 : 503;
      
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(health));
      return;
    }
    
    // All other endpoints require session validation
    if (pathname !== '/resources' && pathname !== '/tools') {
      const validation = await validateSession(sessionToken);
      if (!validation.valid) {
        log('warn', 'Unauthorized request', { requestId, pathname });
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Unauthorized',
          message: validation.error || 'Invalid or missing session token'
        }));
        return;
      }
    }
    
    if (pathname === '/resources') {
      // List available resources
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ resources }));
      
    } else if (pathname === '/tools') {
      // List available tools
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ tools }));
      
    } else if (pathname?.startsWith('/resource/')) {
      // Fetch specific resource
      const resourceUri = decodeURIComponent(pathname.substring(10));
      const data = await fetchResource(resourceUri, sessionToken);
      
      const statusCode = data.error ? (data.status || 500) : 200;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data }));
      
    } else if (pathname === '/tool' && req.method === 'POST') {
      // Execute tool
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { tool, args } = JSON.parse(body);
          const result = await executeTool(tool, args, sessionToken);
          
          const statusCode = result.error ? (result.status || 500) : 200;
          res.writeHead(statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ result }));
        } catch (parseError) {
          log('error', 'Failed to parse tool request', { 
            requestId, 
            error: parseError.message 
          });
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
        }
      });
      
    } else {
      log('warn', 'Route not found', { requestId, pathname });
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    
  } catch (error) {
    log('error', 'Request handler error', {
      requestId,
      pathname,
      error: error.message,
      stack: error.stack
    });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      requestId 
    }));
  }
}

/**
 * Start MCP server
 */
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  log('info', '🚀 MCP Server started', {
    port: PORT,
    apiBaseUrl: API_BASE_URL,
    environment: NODE_ENV
  });
  console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
  console.log(`   API Base URL: ${API_BASE_URL}`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   Health check: /health`);
  console.log(`   Resources: /resources`);
  console.log(`   Tools: /tools`);
});

// Error handling
server.on('error', (error) => {
  log('error', 'Server error', { error: error.message, code: error.code });
  
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Graceful shutdown
function gracefulShutdown(signal) {
  log('info', `${signal} received, shutting down gracefully...`);
  
  server.close(() => {
    log('info', 'Server closed, exiting process');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    log('error', 'Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log('error', 'Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  log('error', 'Unhandled promise rejection', {
    reason: reason,
    promise: promise
  });
});

