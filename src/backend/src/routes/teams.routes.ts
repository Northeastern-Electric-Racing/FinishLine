import express from 'express';
import TeamsController from '../controllers/teams.controllers';
import { body } from 'express-validator';
import { validateInputs } from '../utils/utils';

const teamsRouter = express.Router();

teamsRouter.get('/', TeamsController.getAllTeams);
teamsRouter.get('/:teamId', TeamsController.getSingleTeam);
teamsRouter.post('/:teamId/set-members', TeamsController.setTeamMembers);
teamsRouter.post(
  '/:teamId/edit-description',
  body('newDescription').isString(),
  validateInputs,
  TeamsController.editDescription
);

export default teamsRouter;
