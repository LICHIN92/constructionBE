import mongoose from "mongoose";
const schema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Mobile: {
        type: String,
        required: true
    },
    Place: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        required: true
    },
    Connect:{
        type:Boolean,
        default:false
    },
    Contracted:{
        type:Boolean,
        default:false
    }
},
    {
        timestamps: true 
    }
)
const USER=mongoose.model("user",schema)
export default USER    