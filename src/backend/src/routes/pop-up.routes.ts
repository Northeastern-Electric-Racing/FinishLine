import express from 'express';
import PopUpsController from '../controllers/popUps.controllers';

const popUpsRouter = express.Router();

popUpsRouter.get('/current-user', PopUpsController.getUserUnreadPopUps);
popUpsRouter.post('/:popUpId/remove', PopUpsController.removeUserPopUps);

export default popUpsRouter;
