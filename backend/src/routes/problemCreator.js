//create
//fetch
//update
//delete

const express = require("express");
const adminMiddleware=require("../middleware/adminMiddleware")
const userMiddleware = require("../middleware/userMiddleware")
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem , solvedAllProblembyUser,submittedProblem}=require("../controllers/userProblem")
const problemRouter= express.Router();

problemRouter.post("/create",adminMiddleware, createProblem);//controller ke andar dal do
problemRouter.put("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);
// problemRouter.get("/user/check",)


problemRouter.get("/getProblemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem)
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblembyUser)
problemRouter.get("/submittedProblem/:id",userMiddleware,submittedProblem)

module.exports=problemRouter;