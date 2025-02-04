import multer from "multer";

const storage=multer.diskStorage({
    filename:function(req,files,cb){
        cb(null,files.originalname)
    }
})
const upload=multer({storage:storage})
export {upload}