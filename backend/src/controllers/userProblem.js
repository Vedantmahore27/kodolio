
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
   console.log("request received");
  // API request to authenticate user:
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution, problemCreator
    } = req.body;
    

    try{
       
      for(const {language,completeCode} of referenceSolution){
         

        // source_code:
        // language_id:
        // stdin: 
        // expectedOutput:

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        const submissions = visibleTestCases.map((testcase) => ({
  source_code: normalize(completeCode),
  language_id: languageId,
  stdin: normalize(testcase.input),
  expected_output: normalize(testcase.output)
}));



        const submitResult = await submitBatch(submissions);
        // console.log(submitResult);

        const resultToken = submitResult.map((value)=> value.token);

        // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
        
       const testResult = await submitToken(resultToken);


       console.log(testResult);

       for(const test of testResult){
        if(test.status.id!=3){
        
         return res.status(400).send("Error Occured");
         
        }
       }

      }


      // We can store it in our DB

    const userProblem =  await problem.create({
        ...req.body,
        problemCreator: req.user._id
      });

      res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
        console.log(err);
    }
} 

  


const updateProblem = async (req,res)=>{
    
  const {id} = req.params;
  const {title,description,difficulty,tags,
    visibleTestCases,hiddenTestCases,startCode,
    referenceSolution, problemCreator
   } = req.body;

  try{
    if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) {
      return res.status(400).send("referenceSolution must be a non-empty array");
    }
     if(!id){
      return res.status(400).send("Missing ID Field");
     }

    const DsaProblem =  await problem.findById(id);
    if(!DsaProblem)
    {
      return res.status(404).send("ID is not persent in server");
    }
      
    for(const {language,completeCode} of referenceSolution){
         

      // source_code:
      // language_id:
      // stdin: 
      // expectedOutput:

      const languageId = getLanguageById(language);
        if(!languageId){
           return res.status(400).send(`Unsupported language: ${language}`)
        }
      // I am creating Batch submission
      const submissions = visibleTestCases.map((testcase)=>({
          source_code:completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output
      }));


      const submitResult = await submitBatch(submissions);
      // console.log(submitResult);

      const resultToken = submitResult.map((value)=> value.token);

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
      
     const testResult = await submitToken(resultToken);

    //  console.log(testResult);

     for(const test of testResult){
      if(test.status.id!=3){
       return res.status(400).send("Error Occured");
      }
     }

    }


  const newProblem = await problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
   
  res.status(200).send(newProblem);
  }
  catch(err){
      res.status(500).send("Error: "+err);
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
       if(!id) res.status(400).send("Id is missing");
       console.log("problem api called")
       const dsaProblem = await problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');
       //select all  fields except :   -hiddenTestCase
       if(!dsaProblem){
        res.status(404).send("Problem is missing");
       }
       res.status(200).send(dsaProblem);
   }
   catch(err){
    throw new Error(err);
   }
}

const getAllProblem = async(req,res)=>{

try{
 
  const allProblem = await problem.find({}).select('_id title difficulty tags');
  //pagenation ek sath sub na lakar 10-10 ke set me lana
   
  if(allProblem.length==0){
    res.status(404).send("all problem are missing");
  }
  res.status(200).send({
    problems:allProblem
  });
}
catch(err){
  throw new Error(err);
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
          select:"_id title difficulty tags"
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
 
module.exports= { createProblem, updateProblem ,deleteProblem, getProblemById,getAllProblem,solvedAllProblembyUser , submittedProblem};

