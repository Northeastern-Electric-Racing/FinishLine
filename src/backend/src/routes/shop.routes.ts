import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import ShopController from '../controllers/shop.controllers';

const shopRouter = express.Router();
shopRouter.post(
  '/shop/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  validateInputs,
  ShopController.createShop
);

export default shopRouter;
