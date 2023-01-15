import express from 'express';
import { body } from 'express-validator';
import { getAllTeams, getSingleTeam, editDescription } from '../controllers/teams.controllers';
import { intMinZero } from '../utils/validation.utils';

const teamsRouter = express.Router();

teamsRouter.get('/', TeamsController.getAllTeams);
teamsRouter.get('/:teamId', TeamsController.getSingleTeam);
teamsRouter.post(
  '/edit-description',
  body('teamId').isString,
  body('newDescription').isString,
  intMinZero(body('userId')),
  editDescription
);

export default teamsRouter;
