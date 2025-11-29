import mongoose from "mongoose";
const conectDB=async()=>{
    try {
        mongoose.connect(process.env.connect_url)
        console.log(`connected ${process.env.connect_url}`);
        
    }
     catch (error) {
        console.log(error);
        
    } 
} 
export default conectDB