/**
 * PM2 Ecosystem Configuration for MCP Server
 * 
 * Used for production deployment on DigitalOcean droplet
 * To start: pm2 start ecosystem.config.js
 * To monitor: pm2 monit
 * To view logs: pm2 logs mcp-server
 */

module.exports = {
  apps: [{
    name: 'mcp-server',
    script: './index.js',
    
    // Process management
    instances: 1,
    exec_mode: 'fork',
    
    // Auto-restart configuration
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      MCP_PORT: 3001,
      API_BASE_URL: 'http://localhost:3000/api' // Update this in production
    },
    
    // Logging
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Advanced features
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Source map support
    source_map_support: true,
    
    // Cron restart (optional - restart daily at 3 AM)
    // cron_restart: '0 3 * * *',
  }]
};

