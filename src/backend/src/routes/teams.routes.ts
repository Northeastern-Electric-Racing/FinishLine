import express from 'express';
import { body } from 'express-validator';
import { intMinZero } from '../utils/validation.utils';
import TeamsController from '../controllers/teams.controllers';

const teamsRouter = express.Router();

teamsRouter.get('/', TeamsController.getAllTeams);
teamsRouter.get('/:teamId', TeamsController.getSingleTeam);
teamsRouter.post(
  '/edit-description',
  body('teamId').isString,
  body('newDescription').isString,
  intMinZero(body('userId')),
  TeamsController.editDescription
);

export default teamsRouter;
