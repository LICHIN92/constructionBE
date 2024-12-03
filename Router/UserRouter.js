import express from 'express'
import { user } from '../controller/UserController.js'

const UserRouter= express.Router()

UserRouter.post('/',user)

export default UserRouter