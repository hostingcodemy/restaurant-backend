import express from 'express';
import { indentHandler, allIndent, lastReqno, reqIndent } from '../controllers/indent.controller.js';

const indentRouter = express.Router();

indentRouter.get('/last-reqno', lastReqno);
indentRouter.post('/add-indent', indentHandler);
indentRouter.get('/all-indent', allIndent);
indentRouter.get('/req-indent', reqIndent);

export default indentRouter;