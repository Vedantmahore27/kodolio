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
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

const authRouter = require("./routes/userAuth")
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const discussionRouter = require("./routes/discussion")
const cors = require('cors')

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
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
    await Promise.all([
      main(),
      Redisclient.connect()
    ]);

    console.log("DB Connected");

    server.listen(process.env.PORT, () => {
      console.log("Server listening at port number " + process.env.PORT);
    });
  }
  catch (err) {
    console.log("Error" + err);
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



