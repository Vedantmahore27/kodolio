const express= require('express');
const userMiddleware = require('../middleware/userMiddleware');
const {submitCode, runCode, getSubmissions, getSubmissionById} = require("../controllers/userSubmission")

const submitRouter = express.Router();

submitRouter.post("/submit/:id", userMiddleware , submitCode);
submitRouter.post("/run/:id",userMiddleware,runCode);
submitRouter.get("/submissions/:id", userMiddleware, getSubmissions);
submitRouter.get("/submission/:submissionId", userMiddleware, getSubmissionById);

module.exports =submitRouter; 