import express from 'express';
import { locationMasterHandler, locationUpdate, LocationDelete, getlocation, } from '../controllers/location.controller.js'

const locationRouter = express.Router();

locationRouter.post('/location-master', locationMasterHandler);
locationRouter.route('/location-action').post(locationUpdate).put(LocationDelete);
locationRouter.get('/all-location', getlocation);

export default locationRouter;