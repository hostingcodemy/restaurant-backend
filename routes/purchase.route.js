import express from 'express';
import { purchaseHandler, allPurchase, lastOrderno, reqPurchase } from '../controllers/purchase.controller.js';

const purchaseRouter = express.Router();

purchaseRouter.get('/last-orderno', lastOrderno);
purchaseRouter.post('/add-purchase', purchaseHandler);
purchaseRouter.get('/all-purchase', allPurchase);
purchaseRouter.get('/req-purchase', reqPurchase);

export default purchaseRouter;