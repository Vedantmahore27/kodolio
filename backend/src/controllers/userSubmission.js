const problem = require("../models/promblem");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problem");
const User = require("../models/user");


const submitCode = async (req, res) => {
  try {
    console.log("submit called")
    const userId = req.user._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !code || !language) {
      return res.status(400).send("some field missing");
    }

    // fetch problem
    const Problem = await problem.findById(problemId);

    if (!Problem) {
      return res.status(404).send("Problem not found");
    }

    // store submission first
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesPassed: 0,
      testCasesTotal: Problem.hiddenTestCases.length
    });

    // send to judge0
    const languageId = getLanguageById(language);

    if (!languageId) {
      return res.status(400).send("Invalid language");
    }

    const submissions = Problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map(v => v.token);

    const testResult = await submitToken(resultToken);

    // evaluate result
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime += parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        status = test.status_id == 4 ? "error" : "wrong";
        errorMessage = test.stderr;
      }
    }

    // update DB
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.memory = memory;
    submittedResult.runtime = runtime;

    await submittedResult.save();

    //abhi hame check karna hai current problem is already solved or we have to solve
    // problemId ko inset karo problem solved me 

    if(!req.user.problemSolved.includes(problemId)){
        await req.user.problemSolved.push(problemId);
        await req.user.save();
    }
    


    res.status(201).json(submittedResult.toObject());

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

const runCode = async (req, res) => {
  try {
     
    const userId = req.user._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !code || !language) {
      return res.status(400).send("some field missing");
    }

    // fetch problem
    const Problem = await problem.findById(problemId);

    if (!Problem) {
      return res.status(404).send("Problem not found");
    }

    // no need to store in db 
    // const submittedResult = await Submission.create({
    //   userId,
    //   problemId,
    //   code,
    //   language,
    //   status: "pending",
    //   testCasesPassed: 0,
    //   testCasesTotal: Problem.hiddenTestCases.length
    // });

    // send to judge0
    const languageId = getLanguageById(language);

    if (!languageId) {
      return res.status(400).send("Invalid language");
    }

    const submissions = Problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map(v => v.token);

    const testResult = await submitToken(resultToken);

    // // evaluate result
    // let testCasesPassed = 0;
    // let runtime = 0;
    // let memory = 0;
    // let status = "accepted";
    // let errorMessage = null;

    // for (const test of testResult) {
    //   if (test.status_id == 3) {
    //     testCasesPassed++;
    //     runtime += parseFloat(test.time);
    //     memory = Math.max(memory, test.memory);
    //   } else {
    //     status = test.status_id == 4 ? "error" : "wrong";
    //     errorMessage = test.stderr;
    //   }
    // }

    // update DB
    // submittedResult.status = status;
    // submittedResult.testCasesPassed = testCasesPassed;
    // submittedResult.errorMessage = errorMessage;
    // submittedResult.memory = memory;
    // submittedResult.runtime = runtime;

    // await submittedResult.save();

    //abhi hame check karna hai current problem is already solved or we have to solve
    // problemId ko inset karo problem solved me 
    
    //user ne aaj tak problem solve kiya hai kya
    // if(!req.user.problemSolved.includes(problemId)){
    //     await req.user.problemSolved.push(problemId);
    //     await req.user.save();
    // }
    


    res.status(201).json(testResult);

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
}

// const mysubmission = async(res,req)=>{
         
//      const userId=req.body._id;
//      const problemId =
// }

module.exports = {submitCode, runCode };
