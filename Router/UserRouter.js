import express from 'express'
import {
    contactUpdate, getMsg, login, signup, user, deleteMsg,
    contracted, work, updateComplete, updateContract, workers,
    workersJob
} from '../controller/UserController.js'

const UserRouter = express.Router()

UserRouter.post('/', user)
UserRouter.get("/", getMsg)
UserRouter.post('/login', login)
UserRouter.post('/signup', signup)
UserRouter.patch('/:id', contactUpdate)
UserRouter.delete('/:id', deleteMsg)
UserRouter.get('/contract', contracted)
UserRouter.get('/work/:work', work)
UserRouter.patch('/complete/:id', updateComplete)
UserRouter.patch('/contract/:id', updateContract)
UserRouter.get('/workers', workers)
UserRouter.get('/workersjob/:work',workersJob)

export default UserRouter