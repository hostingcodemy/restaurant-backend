import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import itemRouter from './routes/item.router.js';

config();
const app = express();
app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', "DELETE"],
    credentials: true
}))
app.use(express.json());
app.get('/',(_,res)=>{
    res.status(201).json({
        status:true,
        message:"Server is running"
    })
})

app.use('/api',itemRouter);

export default app;