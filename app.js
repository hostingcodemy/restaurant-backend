import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import itemRouter from './routes/item.router.js';
import indentRouter from './routes/indent.route.js';
import purchaseRouter from './routes/purchase.route.js';
import locationRouter from './routes/location.route.js';
import taxRouter from './routes/tax.route.js';

config();
const app = express();
app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', "DELETE"],
    credentials: true
}))
app.use(express.json());
app.get('/', (_, res) => {
    res.status(201).json({
        status: true,
        message: "Server is running"
    })
})

app.use('/api', itemRouter);
app.use('/api', indentRouter);
app.use('/api', purchaseRouter);
app.use('/api', locationRouter);
app.use('/api', taxRouter);

export default app;