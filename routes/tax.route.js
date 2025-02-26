import express from 'express';
import { taxMasterHandler, taxUpdate, taxDelete, getTax, } from '../controllers/tax.contoller.js'

const taxRouter = express.Router();

taxRouter.post('/tax-master', taxMasterHandler);
taxRouter.route('/tax-action').post(taxUpdate).put(taxDelete);
taxRouter.get('/all-tax', getTax);

export default taxRouter