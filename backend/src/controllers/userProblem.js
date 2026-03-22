
const {getLanguageById, submitBatch , submitToken} = require("../utils/problem");
const problem = require("../models/promblem");
const submission = require("../models/submission")
const { findById, findByIdAndDelete } = require("../models/user");
const User = require("../models/user")
 //create array of object in which we have  submissions: [
    //   {
    //     language_id: 46,
    //     source_code: 'ZWNobyBoZWxsbyBmcm9tIEJhc2gK'
    //   },
    //   {
    //     language_id: 71,
    //     source_code: 'cHJpbnQoImhlbGxvIGZyb20gUHl0aG9uIikK'
    //   },
    //   {
    //     language_id: 72,
    //     source_code: 'cHV0cygiaGVsbG8gZnJvbSBSdWJ5IikK'
    //   }
    // ]

    const normalize = (str) => {
  if (!str) return str;
  return str.replace(/\\n/g, "\n");
};


const createProblem = async (req,res)=>{
   console.log("[createProblem] Request received with data:", {
     title: req.body.title,
     hasVisibleTestCases: Array.isArray(req.body.visibleTestCases),
     visibleTestCasesCount: req.body.visibleTestCases?.length,
     hasReferenceSolution: Array.isArray(req.body.referenceSolution),
     referenceSolutionCount: req.body.referenceSolution?.length,
     company: req.body.company
   });

  // API request to authenticate user:
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution, problemCreator, company
    } = req.body;
    

    try{
      // Validation
      if(!visibleTestCases || !Array.isArray(visibleTestCases) || visibleTestCases.length === 0){
        return res.status(400).json({ success: false, message: "Visible test cases are required" });
      }
      if(!referenceSolution || !Array.isArray(referenceSolution) || referenceSolution.length === 0){
        return res.status(400).json({ success: false, message: "Reference solution is required" });
      }
      if(!company || !Array.isArray(company) || company.length === 0){
        return res.status(400).json({ success: false, message: "At least one company must be selected" });
      }
       
      for(const {language,completeCode} of referenceSolution){
        console.log(`[createProblem] Processing ${language}...`);
        
        // Log visibleTestCases structure
        console.log("[createProblem] visibleTestCases type:", typeof visibleTestCases);
        console.log("[createProblem] visibleTestCases is array:", Array.isArray(visibleTestCases));
        console.log("[createProblem] visibleTestCases length:", visibleTestCases?.length);
        if(visibleTestCases && visibleTestCases.length > 0){
          console.log("[createProblem] First test case structure:", JSON.stringify(visibleTestCases[0], null, 2));
        }

        // source_code:
        // language_id:
        // stdin: 
        // expectedOutput:

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        let submissions;
        try {
          submissions = visibleTestCases.map((testcase) => {
            console.log("[createProblem] Mapping testcase:", JSON.stringify(testcase, null, 2));
            return {
              source_code: normalize(completeCode),
              language_id: languageId,
              stdin: normalize(testcase.input),
              expected_output: normalize(testcase.output)
            };
          });
        } catch (mapError) {
          console.error("[createProblem] Error mapping visibleTestCases:", mapError.message);
          console.error("[createProblem] visibleTestCases value:", visibleTestCases);
          return res.status(500).json({ 
            success: false, 
            message: "Error processing test cases: " + mapError.message 
          });
        }

        let submitResult;
        try {
          submitResult = await submitBatch(submissions);
        } catch (batchError) {
          console.error("[createProblem] Error from submitBatch:", batchError.message);
          return res.status(500).json({ 
            success: false, 
            message: "Error submitting test cases: " + batchError.message 
          });
        }
        
        if (!submitResult) {
          console.error("[createProblem] submitBatch returned undefined");
          return res.status(500).json({ 
            success: false, 
            message: "Failed to submit batch test cases" 
          });
        }

        console.log("[createProblem] submitResult received successfully");
        console.log("[createProblem] submitResult type:", typeof submitResult);
        console.log("[createProblem] submitResult is array:", Array.isArray(submitResult));
        console.log("[createProblem] submitResult structure:", JSON.stringify(submitResult, null, 2).substring(0, 500));

        let resultToken;
        try {
          resultToken = submitResult.map((value)=> {
            console.log("[createProblem] Extracting token from:", JSON.stringify(value, null, 2));
            return value.token;
          });
        } catch (mapError) {
          console.error("[createProblem] Error mapping submitResult:", mapError.message);
          console.error("[createProblem] submitResult value:", submitResult);
          return res.status(500).json({ 
            success: false, 
            message: "Error extracting tokens: " + mapError.message 
          });
        }

        // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
        
       let testResult;
       try {
         testResult = await submitToken(resultToken);
       } catch (tokenError) {
         console.error("[createProblem] Error from submitToken:", tokenError.message);
         return res.status(500).json({ 
           success: false, 
           message: "Error getting test results: " + tokenError.message 
         });
       }

       console.log("[createProblem] testResult type:", typeof testResult);
       console.log("[createProblem] testResult is array:", Array.isArray(testResult));
       console.log("[createProblem] testResult:", testResult);

       if (!Array.isArray(testResult)) {
         console.error("[createProblem] testResult is not an array:", testResult);
         return res.status(500).json({ 
           success: false, 
           message: "Invalid response from test submission" 
         });
       }

       for(const test of testResult){
        if(test.status.id!=3){
          console.log(`[createProblem] Test failed:`, test.status);
          
          const errorDetails = {
            status: test.status,
            stdout: test.stdout,
            stderr: test.stderr,
            message: test.message,
            compile_output: test.compile_output
          };
          console.error("[createProblem] Test case failed:", errorDetails);
          
          let errorMsg = "Reference solution test failed";
          if (test.status.description) {
            errorMsg += `. Status: ${test.status.description}`;
          }
          if (test.stderr) {
            errorMsg += `. Error: ${test.stderr.substring(0, 200)}`;
          }
          if (test.compile_output) {
            errorMsg += `. Compile Error: ${test.compile_output.substring(0, 200)}`;
          }
          
          return res.status(400).json({
            success: false,
            message: errorMsg,
            details: errorDetails
          });
        }
       }

      }


      // We can store it in our DB
      console.log("[createProblem] Saving problem to database with data:", {
        title: req.body.title,
        company: req.body.company,
        difficulty: req.body.difficulty,
        tags: req.body.tags
      });

    const userProblem =  await problem.create({
        ...req.body,
        problemCreator: req.user._id
      });

      console.log("[createProblem] Problem saved successfully:", {
        _id: userProblem._id,
        company: userProblem.company,
        title: userProblem.title
      });

      res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        console.error("[createProblem] Error:", err);
        const errorMsg = err.message || "Unknown error occurred";
        return res.status(500).json({
          success: false,
          message: "Error creating problem: " + errorMsg
        });
    }
} 

const updateProblem = async (req,res)=>{
  console.log("[updateProblem] Request received with ID:", req.params.id);
  console.log("[updateProblem] Request data:", {
    title: req.body.title,
    hasVisibleTestCases: Array.isArray(req.body.visibleTestCases),
    visibleTestCasesCount: req.body.visibleTestCases?.length,
    hasReferenceSolution: Array.isArray(req.body.referenceSolution),
    referenceSolutionCount: req.body.referenceSolution?.length,
    company: req.body.company
  });
    
  const {id} = req.params;
  const {title,description,difficulty,tags,
    visibleTestCases,hiddenTestCases,startCode,
    referenceSolution, problemCreator, company
   } = req.body;

  try{
    // Validation
    if(!id){
      return res.status(400).json({ success: false, message: "Missing ID Field" });
    }
    if(!visibleTestCases || !Array.isArray(visibleTestCases) || visibleTestCases.length === 0){
      return res.status(400).json({ success: false, message: "Visible test cases are required" });
    }
    if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) {
      return res.status(400).json({ success: false, message: "referenceSolution must be a non-empty array" });
    }
    if(!company || !Array.isArray(company) || company.length === 0){
      return res.status(400).json({ success: false, message: "At least one company must be selected" });
    }

    const DsaProblem =  await problem.findById(id);
    if(!DsaProblem)
    {
      return res.status(404).json({ success: false, message: "ID is not present in server" });
    }
      
    for(const {language,completeCode} of referenceSolution){
      console.log(`[updateProblem] Processing ${language}...`);
      
      // source_code:
      // language_id:
      // stdin: 
      // expectedOutput:

      const languageId = getLanguageById(language);
        if(!languageId){
           return res.status(400).json({ success: false, message: `Unsupported language: ${language}` });
        }
      
      // Log visibleTestCases structure
      console.log("[updateProblem] visibleTestCases type:", typeof visibleTestCases);
      console.log("[updateProblem] visibleTestCases is array:", Array.isArray(visibleTestCases));
      console.log("[updateProblem] visibleTestCases length:", visibleTestCases?.length);
      if(visibleTestCases && visibleTestCases.length > 0){
        console.log("[updateProblem] First test case structure:", JSON.stringify(visibleTestCases[0], null, 2));
      }
      
      // I am creating Batch submission
      let submissions;
      try {
        submissions = visibleTestCases.map((testcase)=>{
          console.log("[updateProblem] Mapping testcase:", JSON.stringify(testcase, null, 2));
          return {
            source_code: normalize(completeCode),
            language_id: languageId,
            stdin: normalize(testcase.input),
            expected_output: normalize(testcase.output)
          };
        });
      } catch (mapError) {
        console.error("[updateProblem] Error mapping visibleTestCases:", mapError.message);
        console.error("[updateProblem] visibleTestCases value:", visibleTestCases);
        return res.status(500).json({ 
          success: false, 
          message: "Error processing test cases: " + mapError.message 
        });
      }


      let submitResult;
      try {
        submitResult = await submitBatch(submissions);
      } catch (batchError) {
        console.error("[updateProblem] Error from submitBatch:", batchError.message);
        return res.status(500).json({ 
          success: false, 
          message: "Error submitting test cases: " + batchError.message 
        });
      }
      
      if (!submitResult) {
        console.error("[updateProblem] submitBatch returned undefined");
        return res.status(500).json({ 
          success: false, 
          message: "Failed to submit batch test cases" 
        });
      }

      console.log("[updateProblem] submitResult received successfully");
      console.log("[updateProblem] submitResult type:", typeof submitResult);
      console.log("[updateProblem] submitResult is array:", Array.isArray(submitResult));
      console.log("[updateProblem] submitResult structure:", JSON.stringify(submitResult, null, 2).substring(0, 500));
      
      let resultToken;
      try {
        resultToken = submitResult.map((value)=> {
          console.log("[updateProblem] Extracting token from:", JSON.stringify(value, null, 2));
          return value.token;
        });
      } catch (mapError) {
        console.error("[updateProblem] Error mapping submitResult:", mapError.message);
        console.error("[updateProblem] submitResult value:", submitResult);
        return res.status(500).json({ 
          success: false, 
          message: "Error extracting tokens: " + mapError.message 
        });
      }

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
      
     let testResult;
     try {
       testResult = await submitToken(resultToken);
     } catch (tokenError) {
       console.error("[updateProblem] Error from submitToken:", tokenError.message);
       return res.status(500).json({ 
         success: false, 
         message: "Error getting test results: " + tokenError.message 
       });
     }

    console.log("[updateProblem] Test results for language " + language + ":", testResult);
    console.log("[updateProblem] testResult type:", typeof testResult);
    console.log("[updateProblem] testResult is array:", Array.isArray(testResult));

    if (!Array.isArray(testResult)) {
      console.error("[updateProblem] testResult is not an array:", testResult);
      return res.status(500).json({ 
        success: false, 
        message: "Invalid response from test submission" 
      });
    }

     for(let i = 0; i < testResult.length; i++){
       const test = testResult[i];
       console.log(`[updateProblem] Test case ${i+1} status:`, test.status);
       console.log(`[updateProblem] Test case ${i+1} full response:`, JSON.stringify(test, null, 2));
       if(test.status.id!=3){
         const errorDetails = {
           testCaseIndex: i + 1,
           status: test.status,
           stdout: test.stdout,
           stderr: test.stderr,
           message: test.message,
           compile_output: test.compile_output
         };
         console.error("[updateProblem] Test case failed:", errorDetails);
         
         let errorMsg = `${language} reference solution failed at Test case ${i+1}`;
         if (test.status.description) {
           errorMsg += `. Status: ${test.status.description}`;
         }
         if (test.stderr) {
           errorMsg += `. Error: ${test.stderr.substring(0, 200)}`;
         }
         if (test.compile_output) {
           errorMsg += `. Compile Error: ${test.compile_output.substring(0, 200)}`;
         }
         
         return res.status(400).json({ 
           success: false, 
           message: errorMsg,
           details: errorDetails
         });
       }
     }

    }

  console.log("[updateProblem] Updating problem with data:", {
    id: id,
    title: req.body.title,
    company: req.body.company,
    difficulty: req.body.difficulty
  });

  const newProblem = await problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
   
  console.log("[updateProblem] Successfully updated problem:", {
    _id: newProblem._id,
    company: newProblem.company,
    title: newProblem.title
  });
  return res.status(200).json({
    success: true,
    message: "Problem updated successfully",
    problem: newProblem
  });
  }
  catch(err){
      console.error("[updateProblem] Error:", err);
      return res.status(500).json({
        success: false,
        message: "Error updating problem: " + err.message,
        error: err.message
      });
  }
}

const deleteProblem = async(req,res)=>{
  const id = req.params.id;
  try{
    if(!id){
      return res.send("Invalid Id")
    }
    const deletedProblem =  await problem.findByIdAndDelete(id);
 if (!deletedProblem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    return res.status(200).json({ message: "Problem deleted successfully" });

  } catch (error) {
    console.error("Delete Problem Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const getProblemById= async(req,res)=>{
   
   try{
       const id = req.params.id;
       if(!id) return res.status(400).send("Id is missing");
   
       const dsaProblem = await problem.findById(id).select('_id title description difficulty tags company visibleTestCases hiddenTestCases startCode referenceSolution');
       //select all  fields
       if(!dsaProblem){
        return res.status(404).send("Problem is missing");
       }
       return res.status(200).send(dsaProblem);
   }
   catch(err){
    console.error("getProblemById error:", err);
    return res.status(500).send("Error fetching problem: " + err.message);
   }
}

const getAllProblem = async(req,res)=>{

try{
 
  const allProblem = await problem.find({}).select('_id title difficulty tags company');
  //pagenation ek sath sub na lakar 10-10 ke set me lana
   
  if(allProblem.length==0){
    return res.status(404).send("all problem are missing");
  }
  return res.status(200).send({
    problems:allProblem
  });
}
catch(err){
  console.error("getAllProblem error:", err);
  return res.status(500).send("Error fetching problems: " + err.message);
}
}

const solvedAllProblembyUser = async(req,res)=>{
  try{  
        //  const count = req.user.problemSolved.length;
        //  res.status(200).send(count);

         const userId = req.user._id;
        //  const allProblem = await User.findById(userId).populate("problemSolved"); ye pure ko lekar ayega hame selected field chahiya
         const allProblem = await User.findById(userId).populate({
          path:"problemSolved",
          select:"_id title difficulty tags company"
        });  
        const count = allProblem.problemSolved.length
         res.status(200).send({"count" : count , "solvedProblem" : allProblem.problemSolved})
        
  }
  catch(err){
    res.status(500).send("Server Error");
  }
}

const submittedProblem= async(req,res)=>{
      
  try{
        const userId = req.user._id;
        const problemId = req.params.id;

        const ans = await submission.find({userId , problemId});
        
        if(ans.length==0)res.status(200).send("No Submission")
        res.status(200).send(ans);

  }
  catch(err){
      res.status(500).send(err);
  }
}

const getProblemsByCompany = async(req,res)=>{
  try{
    let company = req.params.company;
    if(!company){
      return res.status(400).send("Company name is required");
    }
    
    // Capitalize first letter for case-insensitive search
    company = company.charAt(0).toUpperCase() + company.slice(1);
    
    const problems = await problem.find({company: company});
    
    if(problems.length === 0){
      return res.status(404).send("No problems found for this company");
    }
    
    return res.status(200).send({
      success: true,
      company: company,
      count: problems.length,
      problems: problems
    });
  }
  catch(err){
    console.error("getProblemsByCompany error:", err);
    return res.status(500).send("Error fetching problems: " + err.message);
  }
}
 
module.exports= { createProblem, updateProblem ,deleteProblem, getProblemById,getAllProblem,solvedAllProblembyUser , submittedProblem, getProblemsByCompany};

