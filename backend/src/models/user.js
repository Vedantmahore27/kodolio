const mongoose = require("mongoose");

const {Schema}= mongoose;
const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20
    },
    emailId:{
        type:String,
         required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true
    },
    age:{
        type:Number,
        min :6,
        max:80
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    username: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        trim: true,
        maxLength: 240
    },
    location: {
        type: String,
        trim: true,
        maxLength: 80
    },
    github: {
        type: String,
        trim: true
    },
    linkedin: {
        type: String,
        trim: true
    },
    portfolio: {
        type: String,
        trim: true
    },
    shareProfile: {
        type: String,
        trim: true
    },
    goalTarget: {
        type: Number,
        default: 500,
        min: 1,
        max: 10000
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        default: []
    },
    password:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

userSchema.post('findOneAndDelete', async function(user_info){
    if(user_info){
        await mongoose.model('submission').deleteMany({userId : user_info._id});
    }
})

const User =mongoose.model("user",userSchema);

module.exports= User;