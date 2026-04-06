
const { createClient } = require("redis");

const Redisclient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-12707.crce263.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 12707,
        connectTimeout: 10000,
        keepAlive: 30000, // Keep-alive every 30 seconds
        noDelay: true
    },
    // Reconnection strategy with exponential backoff
    reconnectStrategy: (retries) => {
        const delay = Math.min(retries * 100, 10000); // Max 10 seconds
        console.log(`[Redis] Retrying connection (attempt ${retries + 1}) in ${delay}ms`);
        return delay;
    }
});

// Handle connection events
Redisclient.on('connect', () => {
    console.log('[Redis] Connected successfully');
});

Redisclient.on('reconnecting', () => {
    console.log('[Redis] Attempting to reconnect...');
});

Redisclient.on('ready', () => {
    console.log('[Redis] Client ready');
});

Redisclient.on('error', (err) => {
    console.error('[Redis] Error:', err.message);
    // Don't crash the app on Redis error
});

Redisclient.on('end', () => {
    console.log('[Redis] Connection closed');
});

module.exports=Redisclient;