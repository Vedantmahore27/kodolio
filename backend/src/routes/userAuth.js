const express = require("express");
const {login ,register, logout , adminRegister,deleteProfile }= require("../controllers/userAuthentication")

const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware= require("../middleware/adminMiddleware")
const authRouter= express.Router();

// Register Login Logout get profile

authRouter.post("/register", register);//controller ke andar dal do
authRouter.post("/login", login);
authRouter.post("/logout",userMiddleware ,logout);
// authRouter.get("/getprofile", getprofile); 
authRouter.post("/admin/register",adminMiddleware ,adminRegister);

authRouter.delete("/profile",userMiddleware,deleteProfile);

authRouter.get("/check", userMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      firstName: req.user.firstName,
      emailId: req.user.emailId,
      role: req.user.role   
    }
  });
});


module.exports=authRouter; 