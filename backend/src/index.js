require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const Redisclient = require("./config/redis")
const main = require("./config/db");
const cookieparser = require("cookie-parser");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:['http://localhost:5173',
    "https://kodolio.vercel.app"],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  }
});

const authRouter = require("./routes/userAuth")
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const discussionRouter = require("./routes/discussion")
const cors = require('cors')

app.use(cors({
   origin: [
    "http://localhost:5173",
    "https://kodolio.vercel.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());
app.use(cookieparser());

app.use('/user', authRouter)
app.use('/problem', problemRouter)
app.use('/submission', submitRouter)
app.use('/discussion', discussionRouter)

// Socket.io event handlers
require("./socket/discussionSocket")(io);

const InitializeConnection = async () => {
  try {
    await main();
    console.log("MongoDB Connected");

    // Try to connect Redis, but don't fail if it doesn't connect
    try {
      await Redisclient.connect();
      console.log("Redis Connected");
    } catch (redisErr) {
      console.error("Redis connection failed (app will continue without Redis):", redisErr.message);
      // Continue without Redis - the app can function without it
    }

    server.listen(process.env.PORT, () => {
      console.log("Server listening at port number " + process.env.PORT);
    });
  }
  catch (err) {
    console.log("Fatal error during initialization:", err);
    process.exit(1);
  }
}

InitializeConnection();

// main()
// .then(async ()=>{
//    app.listen(process.env.PORT, ()=>{
//    console.log("server listening at port number "+process.env.PORT);
//   }) 
// })
// .catch(err=> console.log(err))



