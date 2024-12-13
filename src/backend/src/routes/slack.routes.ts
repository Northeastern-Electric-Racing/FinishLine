import express from 'express';
import slackController from '../controllers/slack.controllers';

const slackRouter = express.Router();

slackRouter.post('/', slackController.handleEvent);

export default slackRouter;
