import express from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { itemMasterHandler, getItems, itemGroupHandler, allItemGroup, itemSubGroupHandler, allItemSubGroup, itemUOMHandler, getItemUOM, locationMasterHandler, getlocation, taxMasterHandler, getTax, supplierPricelistHandler, getSupplierPriceList, itemCategoryHandler, allItemCategory, itemSubCategoryHandler, allItemSubCategory } from '../controllers/item.controller.js';

const itemRouter = express.Router();

itemRouter.post('/item-master', itemMasterHandler);
itemRouter.get('/all-item', getItems);
itemRouter.post('/item-group', itemGroupHandler);
itemRouter.get('/all-item-group', allItemGroup);
itemRouter.post('/item-subgroup', itemSubGroupHandler);
itemRouter.get('/all-item-subgroup', allItemSubGroup);

itemRouter.post('/item-category', itemCategoryHandler);
itemRouter.get('/all-item-category', allItemCategory);
itemRouter.post('/item-subcategory', itemSubCategoryHandler);
itemRouter.get('/all-item-subcategory', allItemSubCategory);

itemRouter.post('/item-uom', itemUOMHandler);
itemRouter.get('/all-uom', getItemUOM);
itemRouter.post('/location-master', locationMasterHandler);
itemRouter.get('/all-location', getlocation);
itemRouter.post('/tax-master', taxMasterHandler);
itemRouter.get('/all-tax', getTax);
itemRouter.post('/supplier-price', supplierPricelistHandler);
itemRouter.get('/all-supplier-pricelist', getSupplierPriceList);

export default itemRouter;