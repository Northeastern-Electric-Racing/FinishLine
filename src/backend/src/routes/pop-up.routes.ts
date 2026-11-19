import PopUpsController from '../controllers/popUps.controllers.js';
import { createRouter } from '../utils/api-key.utils.js';

const popUpsRouter = createRouter();

popUpsRouter.get('/current-user', PopUpsController.getUserUnreadPopUps);
popUpsRouter.post('/:popUpId/remove', PopUpsController.removeUserPopUps);

export default popUpsRouter;
