import express from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { itemMasterHandler, itemMasterDelete, getItems, itemGroupHandler, itemGroupUpdate, itemGroupDelete, allItemGroup, itemSubGroupHandler, itemSubGroupUpdate, itemSubGroupDelete, allItemSubGroup, itemUOMHandler, itemUOMUpdate, itemUOMDelete, getItemUOM, supplierPricelistHandler, supplierPriceListUpdate, supplierPriceListDelete, getSupplierPriceList, itemCategoryHandler, itemCategoryUpdate, itemCategoryDelete, allItemCategory, itemSubCategoryHandler, itemSubCategoryUpdate, itemSubCategoryDelete, allItemSubCategory, itemMasterUpdate } from '../controllers/item.controller.js';

const itemRouter = express.Router();

itemRouter.post('/item-master', itemMasterHandler);
itemRouter.route('/item-master-action').post(itemMasterUpdate).put(itemMasterDelete);
itemRouter.get('/all-item', getItems);

itemRouter.post('/item-group', itemGroupHandler);
itemRouter.route('/item-group-action').post(itemGroupUpdate).put(itemGroupDelete);
itemRouter.get('/all-item-group', allItemGroup);

itemRouter.post('/item-subgroup', itemSubGroupHandler);
itemRouter.route('/item-subgroup-action').post(itemSubGroupUpdate).put(itemSubGroupDelete);
itemRouter.get('/all-item-subgroup', allItemSubGroup);

itemRouter.post('/item-category', itemCategoryHandler);
itemRouter.route('/item-category-action').post(itemCategoryUpdate).put(itemCategoryDelete);
itemRouter.get('/all-item-category', allItemCategory);

itemRouter.post('/item-subcategory', itemSubCategoryHandler);
itemRouter.route('/item-subcategory-action').post(itemSubCategoryUpdate).put(itemSubCategoryDelete);
itemRouter.get('/all-item-subcategory', allItemSubCategory);

itemRouter.post('/item-uom', itemUOMHandler);
itemRouter.route('/item-uom-action').post(itemUOMUpdate).put(itemUOMDelete);
itemRouter.get('/all-uom', getItemUOM);

itemRouter.post('/supplier-price', supplierPricelistHandler);
itemRouter.route('/supplier-action').post(supplierPriceListUpdate).put(supplierPriceListDelete);
itemRouter.get('/all-supplier-pricelist', getSupplierPriceList);

export default itemRouter;