
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
        // source_code:
        // language_id:
        // stdin: 
        // expectedOutput:

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        let submissions;
        try {
          submissions = visibleTestCases.map((testcase) => {
            return {
              source_code: normalize(completeCode),
              language_id: languageId,
              stdin: normalize(testcase.input),
              expected_output: normalize(testcase.output)
            };
          });
        } catch (mapError) {
          return res.status(500).json({ 
            success: false, 
            message: "Error processing test cases: " + mapError.message 
          });
        }

        let submitResult;
        try {
          submitResult = await submitBatch(submissions);
        } catch (batchError) {
          return res.status(500).json({ 
            success: false, 
            message: "Error submitting test cases: " + batchError.message 
          });
        }
        
        if (!submitResult) {
          return res.status(500).json({ 
            success: false, 
            message: "Failed to submit batch test cases" 
          });
        }

        let resultToken;
        try {
          resultToken = submitResult.map((value)=> {
            return value.token;
          });
        } catch (mapError) {
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
         return res.status(500).json({ 
           success: false, 
           message: "Error getting test results: " + tokenError.message 
         });
       }

       if (!Array.isArray(testResult)) {
         return res.status(500).json({ 
           success: false, 
           message: "Invalid response from test submission" 
         });
       }

       for(const test of testResult){
        if(test.status.id!=3){
          const errorDetails = {
            status: test.status,
            stdout: test.stdout,
            stderr: test.stderr,
            message: test.message,
            compile_output: test.compile_output
          };
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
      // Normalize startCode before saving
      const validLanguages = ["C++", "Java", "JavaScript"];
      const normalizedStartCode = (req.body.startCode && Array.isArray(req.body.startCode))
        ? req.body.startCode.map((item, idx) => ({
            language: item.language || validLanguages[idx] || "C++",
            initialCode: item.initialCode || ""
          }))
        : [
            { language: "C++", initialCode: "" },
            { language: "Java", initialCode: "" },
            { language: "JavaScript", initialCode: "" }
          ];

      const userProblem = await problem.create({
        ...req.body,
        startCode: normalizedStartCode,
        problemCreator: req.user._id
      });

      res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        return res.status(500).json({
          success: false,
          message: "Error creating problem: " + errorMsg
        });
    }
} 

const updateProblem = async (req,res)=>{
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
      
      // source_code:
      // language_id:
      // stdin: 
      // expectedOutput:

      const languageId = getLanguageById(language);
        if(!languageId){
           return res.status(400).json({ success: false, message: `Unsupported language: ${language}` });
        }
      
      // Log visibleTestCases structure
      
      // I am creating Batch submission
      let submissions;
      try {
        submissions = visibleTestCases.map((testcase)=>{
          return {
            source_code: normalize(completeCode),
            language_id: languageId,
            stdin: normalize(testcase.input),
            expected_output: normalize(testcase.output)
          };
        });
      } catch (mapError) {
        return res.status(500).json({ 
          success: false, 
          message: "Error processing test cases: " + mapError.message 
        });
      }


      let submitResult;
      try {
        submitResult = await submitBatch(submissions);
      } catch (batchError) {
        return res.status(500).json({ 
          success: false, 
          message: "Error submitting test cases: " + batchError.message 
        });
      }
      
      if (!submitResult) {
        return res.status(500).json({ 
          success: false, 
          message: "Failed to submit batch test cases" 
        });
      }
      
      let resultToken;
      try {
        resultToken = submitResult.map((value)=> {
          return value.token;
        });
      } catch (mapError) {
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
       return res.status(500).json({ 
         success: false, 
         message: "Error getting test results: " + tokenError.message 
       });
     }

    if (!Array.isArray(testResult)) {
      return res.status(500).json({ 
        success: false, 
        message: "Invalid response from test submission" 
      });
    }

     for(let i = 0; i < testResult.length; i++){
       const test = testResult[i];
       if(test.status.id!=3){
         const errorDetails = {
           testCaseIndex: i + 1,
           status: test.status,
           stdout: test.stdout,
           stderr: test.stderr,
           message: test.message,
           compile_output: test.compile_output
         };
         
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

    // Normalize startCode before updating
    const validLanguages = ["C++", "Java", "JavaScript"];
    const normalizedStartCode = (req.body.startCode && Array.isArray(req.body.startCode))
      ? req.body.startCode.map((item, idx) => ({
          language: item.language || validLanguages[idx] || "C++",
          initialCode: item.initialCode || ""
        }))
      : [
          { language: "C++", initialCode: "" },
          { language: "Java", initialCode: "" },
          { language: "JavaScript", initialCode: "" }
        ];

   const newProblem = await problem.findByIdAndUpdate(id , {...req.body, startCode: normalizedStartCode}, {runValidators:true, new:true});
   
  return res.status(200).json({
    success: true,
    message: "Problem updated successfully",
    problem: newProblem
  });
  }
  catch(err){
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
    return res.status(500).send("Error fetching problems: " + err.message);
  }
}
 
module.exports= { createProblem, updateProblem ,deleteProblem, getProblemById,getAllProblem,solvedAllProblembyUser , submittedProblem, getProblemsByCompany};

