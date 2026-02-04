const mongoose= require("mongoose");

const {Schema}=mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum : ['Easy','Medium','Hard'],
        required:true
    },
     tags:{
        type:String,
        enum : ['array','binary-search','linkedlist','stack','recursion','queues','Dynamic Programming','two pointer','sliding window','graph'],
        required:true
    },
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            },
            explanation : {
                type:String,
                required:true,
            }
        }
    ],
    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            },
            explanation : {
                type:String,
               
            }
        }
    ],
    startCode : [
        {
           language :{
               type:String,
               required:true
           },
           initialCode :{
                type:String,
                required:true
           },
        }
    ],
    referenceSolution : [
        {
           language :{
               type:String,
               required:true
           },
           completeCode :{
                type:String,
                required:true
           },
        }
    ],
    problemCreator:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
})

const problem = mongoose.model('problem',problemSchema);

module.exports=problem;