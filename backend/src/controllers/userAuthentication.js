const validate = require("../utils/validator")
const User = require("../models/user")
const bcrypt = require("bcrypt");
const jwt =  require("jsonwebtoken")
const Redisclient=require("../config/redis")
const submission = require("../models/submission")

const register = async(req,res)=>{
    try{
    // validate the data
    validate(req.body);
    console.log(req.body);
    const{firstName, emailId , password} =req.body;
    const existingUser = await User.findOne({ emailId });

    if (existingUser) {
      throw new Error("User Already exist")
      }
    req.body.password = await bcrypt.hash(password,10);
    // const ans =await User.exists({emailId}); no jarurat crate karnge tb hi error throw kar dega
     req.body.role = "user";//koi bhi aye wo as a user hi jayega kisiko admin banana hai to dusra route bna do admin k liye
    const user = await User.create(req.body);
    const token =jwt.sign({_id:user._id,emailId:user.emailId, role:"user"},process.env.JWT_SECRET,{expiresIn : 60*60})
     const reply ={
            firstName: user.firstName,
            emailId: user.emailId,
            _id : user._id,
            role : user.role
        }
    res.cookie('token',token,{maxAge : 60*60*100})
  
    res.status(201).json({
            user:reply,
            message:"User Created Successfully"
        })
                  
     

    }
   catch(err){
   res.status(400).json({
      error: err.message
   });
}

}

// to generate random key 
//-e "console.log(require('crypto').randomBytes(32).toString('hex'))"

const login = async (req, res)=>{

    try{
        const {emailId , password,role}= req.body;
        if(!emailId) throw new Error("Invalid Credentials");
        if(!password) throw new Error("Invalid Credentials");
        console.log(role)
        const user = await User.findOne({emailId});
         if (!user) return res.status(401).send("Invalid Credentials");
         if(user.role!= role){
            throw new Error("Please Select Valid Role");
           
         }

        const match =await bcrypt.compare(password,user.password);

        if(!match) throw new Error("Invalid Credentials");
        
        const reply ={
            firstname: user.firstname,
            emailId: user.emailId,
            _id : user._id,
            role : user.role
        }
        console.log("role :" +user.role);
        const token =jwt.sign({_id:user._id,emailId:user.emailId, role:user.role},process.env.JWT_SECRET,{expiresIn : 60*60})
           
        res.cookie('token',token,{maxAge : 60*60*1000})
        res.status(200).json({
            user:reply,
            message:"Login Successful"
        })
    }
      
   catch(err){
   res.status(400).json({
      error: err.message
   });
  }
 }


const logout =async (req,res)=>{

    try {
         
        //cookies ko invalid kar do  or redis ko use kar sakte ho
        // token add kar dunga redis me means blocklist me 
        
        //1)validate token --> middleware bana do  --> using usermiddleware
        //2)redis me add kar do

        const {token}=req.cookies;
    
        const payload = jwt.decode(token);
         console.log(token)
        // remaining time of token
        
        await Redisclient.set(`token:${token}`, "blocked");
        await Redisclient.expireAt(`token:${token}`, payload.exp);
       
        res.clearCookie("token");
        res.status(200).send("Logged out successfully");


 
    } catch (err) {
        res.send("Error"+err);
    }
}

const adminRegister = async(req,res)=>{

      try{
    // validate the data
    validate(req.body);
    const{firstname, emailId , password} =req.body;
    req.body.password = await bcrypt.hash(password,10);
   
    const user = await User.create(req.body);
    const token =jwt.sign({_id:user._id,emailId:user.emailId,role:user.role},process.env.JWT_SECRET,{expiresIn : 60*60})
     
    res.cookie('token',token,{maxAge : 60*60*100})
    res.status(201).send("Admin Created Successfully")
   
    }
    catch(err){
        res.status(400).send("Error "+err)
    }
}

const deleteProfile = async(req,res)=>{
    try{
        const userId = req.user._id;
        await  User.findByIdAndDelete(userId); //delete

        //delete from submission also 
        //delete karne ke liye ya to niche wala karo nahi to hamne sceme me post method use kiya hai 
        //await submission.deleteMany({userId})

        res.status(200).send("Profile Deleted Successfully")

    }
    catch(err){
        res.status(500).send(err+"Server Error")
    }
}





module.exports={register , login, logout , adminRegister, deleteProfile};