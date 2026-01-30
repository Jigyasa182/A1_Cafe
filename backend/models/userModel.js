import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    cartData:{
        type:Object,
        default:{},
    },
    cartArray:{
        type:Array,
        default:[],
    }
},{minimize:false})

const userModel = mongoose.models.user || mongoose.model("user",userSchema);

export default userModel;