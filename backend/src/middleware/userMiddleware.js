
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

         //redis me check karo present hai kya (with error handling)
         try {
            if (Redisclient.isOpen) {
                const isBlocked = await Redisclient.exists(`token:${token}`);
                if(isBlocked) throw new Error("Invalid Token");
            }
         } catch (redisErr) {
            console.error("[MIDDLEWARE] Redis error during token check:", redisErr.message);
            // Continue without Redis check - don't block the user
         }

         req.user=user;

         next();
         

     }
     catch(err){
                res.status(401).json({ error: err.message });
     }

    }

    module.exports = userMiddleware;