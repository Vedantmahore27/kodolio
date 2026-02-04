
const jwt= require("jsonwebtoken")
const User = require("../models/user");
const Redisclient =require("../config/redis")


const userMiddleware = async (req,res,next)=>{
    try{
         const {token} =req.cookies;
         if(!token) throw new Error("Invalid Token");
         
         const payload =   jwt.verify(token,process.env.JWT_SECRET);

         const {_id}=payload;
         if(!_id) throw new Error("Invalid id");
          
         const user = await User.findById(_id);

         if(!user) throw new Error("User Doesn't Exists");

         //redis me check karo present hai kya

         const isBlocked = await Redisclient.exists(`token:${token}`);
         if(isBlocked) throw new Error("Invalid Token");

         req.user=user;

         next();
         

     }
     catch(err){
                res.send(err.message);
     }

    }

    module.exports = userMiddleware;