require("dotenv").config();
const express = require("express");

const Redisclient = require("./config/redis")

const main =require("./config/db");

const cookieparser = require("cookie-parser");

const app = express();
const authRouter= require("./routes/userAuth")
const problemRouter=require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const cors= require('cors')

app.use(cors({
  origin:'http://localhost:5173',// origin:'*' koi bhi use kar sakta hai star se,
  credentials:true
}))

app.use(express.json());
app.use(cookieparser());

app.use('/user',authRouter )
app.use('/problem',problemRouter)
app.use('/submission',submitRouter)
const InitializeConnection = async ()=> {
  try {
    await Promise.all([
      main(),                  
      Redisclient.connect()    
    ]);   // parallel wait

    console.log("DB Connected");
  

    app.listen(process.env.PORT, ()=> {
      console.log("server listening at port number " + process.env.PORT);
    });
  }
  catch(err){
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



