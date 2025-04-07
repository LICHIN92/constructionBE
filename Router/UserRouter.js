import express from 'express'
import {
    contactUpdate, getMsg, login, signup, user, deleteMsg,
    contracted, work, updateComplete, updateContract, workers,
    workersJob,
    addImage,getImage,deletePic,
    deleteWorker
} from '../controller/UserController.js'
import { adminAuth } from '../middlewaRE/adminAuth.js'
import { upload } from '../middlewaRE/upload.js'

const UserRouter = express.Router()

UserRouter.post('/', user)
UserRouter.get("/", getMsg)
UserRouter.post('/login', login)
UserRouter.post('/signup', signup)
UserRouter.patch('/:id', contactUpdate)
UserRouter.delete('/:id', deleteMsg)
UserRouter.get('/contract',adminAuth, contracted)
UserRouter.get('/work/:work', work)
UserRouter.patch('/complete/:id', updateComplete)
UserRouter.patch('/contract/:id', updateContract)
UserRouter.get('/workers', workers)
UserRouter.get('/workersjob/:work',workersJob)
UserRouter.post('/addpics',adminAuth, upload.array('pic'), addImage);
UserRouter.get('/getpic',getImage)
UserRouter.delete('/delete/:id',adminAuth,deletePic)
UserRouter.delete('/worker/:id',deleteWorker)
 


export default UserRouter