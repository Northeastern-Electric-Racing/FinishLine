import express from 'express';
import TeamsController from '../controllers/teams.controllers';
import { body } from 'express-validator';
import { validateInputs } from '../utils/utils';
import { intMinZero, nonEmptyString } from '../utils/validation.utils';

const teamsRouter = express.Router();

teamsRouter.get('/', TeamsController.getAllTeams);
teamsRouter.get('/:teamId', TeamsController.getSingleTeam);
teamsRouter.post(
  '/:teamId/set-members',
  body('userIds').isArray(),
  intMinZero(body('userIds.*')),
  validateInputs,
  TeamsController.setTeamMembers
);
teamsRouter.post(
  '/:teamId/set-leads',
  body('userIds').isArray(),
  intMinZero(body('userIds.*')),
  validateInputs,
  TeamsController.setTeamLeads
);
teamsRouter.post(
  '/:teamId/edit-description',
  body('newDescription').isString(),
  validateInputs,
  TeamsController.editDescription
);
teamsRouter.post('/:teamId/set-head', intMinZero(body('userId')), validateInputs, TeamsController.setTeamHead);
teamsRouter.post('/:teamId/delete', TeamsController.deleteTeam);
teamsRouter.post(
  '/create',
  nonEmptyString(body('teamName')),
  intMinZero(body('headId')),
  nonEmptyString(body('slackId')),
  nonEmptyString(body('description')),
  TeamsController.createTeam
);

export default teamsRouter;
