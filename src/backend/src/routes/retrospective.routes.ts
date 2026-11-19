import RetrospectiveController from '../controllers/retrospectives.controllers.js';
import { createRouter } from '../utils/api-key.utils.js';

const retrospectiveRouter = createRouter();

retrospectiveRouter.get('/timelines', RetrospectiveController.getRetrospectiveTimelines);

export default retrospectiveRouter;
