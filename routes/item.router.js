import express from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { itemGroupHandler,allItemGroup,itemSubGroupHandler,allItemSubGroup,itemUOMHandler,getItemUOM, locationMasterHandler, getlocation, taxMasterHandler,getTax } from '../controllers/item.controller.js';

const itemRouter = express.Router();

itemRouter.post('/item-group', itemGroupHandler);
itemRouter.get('/all-item-group', allItemGroup);
itemRouter.post('/item-subgroup', itemSubGroupHandler);
itemRouter.get('/all-item-subgroup', allItemSubGroup);
itemRouter.post('/item-uom', itemUOMHandler);
itemRouter.get('/all-uom', getItemUOM);
itemRouter.post('/location-master', locationMasterHandler);
itemRouter.get('/all-location', getlocation);
itemRouter.post('/tax-master', taxMasterHandler);
itemRouter.get('/all-tax', getTax);

export default itemRouter;