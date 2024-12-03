import express from 'express'
import 'dotenv/config'
import conectDB from './config/connectDb.js'
import cors from 'cors'
import UserRouter from './Router/UserRouter.js'
conectDB()
const app= express()

const corsOption = {
    origin: ['http://localhost:5173','https://construction-eosin.vercel.app/'], // Add your front-end URL
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Corrected from "Credential"
};
app.use(cors(corsOption))
app.options('*',cors(corsOption))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/',UserRouter)

app.listen(process.env.port,()=>{
    console.log(`app running at ${process.env.port}`); 
    
})   