
const { createClient } = require("redis");

const Redisclient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-12707.crce263.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 12707
    }
});





module.exports=Redisclient;