import express from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { itemMasterHandler, itemMasterDelete, getItems, itemGroupHandler, itemGroupDelete, allItemGroup, itemSubGroupHandler, itemSubGroupDelete, allItemSubGroup, itemUOMHandler, getItemUOM, locationMasterHandler, getlocation, taxMasterHandler, getTax, supplierPricelistHandler, getSupplierPriceList, itemCategoryHandler, allItemCategory, itemSubCategoryHandler, allItemSubCategory } from '../controllers/item.controller.js';

const itemRouter = express.Router();

itemRouter.route('/item-master').post(itemMasterHandler).put(itemMasterDelete);
itemRouter.get('/all-item', getItems);
itemRouter.route('/item-group').post(itemGroupHandler).put(itemGroupDelete);
itemRouter.get('/all-item-group', allItemGroup);
itemRouter.post('/item-subgroup', itemSubGroupHandler);
itemRouter.route('/item-subgroup').post(itemSubGroupHandler).put(itemSubGroupDelete);
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