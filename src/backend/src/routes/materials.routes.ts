import express from 'express';
import MaterialsController from '../controllers/materials.controllers';

const materialsRouter = express.Router();

materialsRouter.post('/:materialId/delete', MaterialsController.deleteMaterial);

export default materialsRouter;
