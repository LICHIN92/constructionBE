import mongoose from "mongoose";

const schema = new mongoose.Schema({
    FullName: {
        type: String,
        required: true
    },
    Place: {
        type: String,
        required: true
    },
    Mobile: {
        type: String,
        required: true
    },
    Job: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    Admin:{
        type:Boolean,
        default:0,
        // 0=workers
        // 1=admin
    }
},
    {
        timestamps: true
    }
)
const WORKERS=mongoose.model('workers',schema)
export default WORKERS