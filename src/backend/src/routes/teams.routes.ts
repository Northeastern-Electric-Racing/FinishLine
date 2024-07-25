import express from 'express';
import TeamsController from '../controllers/teams.controllers';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import multer, { memoryStorage } from 'multer';

const teamsRouter = express.Router();
const upload = multer({ limits: { fileSize: 30000000 }, storage: memoryStorage() });

teamsRouter.get('/', TeamsController.getAllTeams);
teamsRouter.get('/:teamId', TeamsController.getSingleTeam);
teamsRouter.post(
  '/:teamId/set-members',
  body('userIds').isArray(),
  nonEmptyString(body('userIds.*')),
  validateInputs,
  TeamsController.setTeamMembers
);
teamsRouter.post(
  '/:teamId/set-leads',
  body('userIds').isArray(),
  nonEmptyString(body('userIds.*')),
  validateInputs,
  TeamsController.setTeamLeads
);
teamsRouter.post(
  '/:teamId/edit-description',
  body('newDescription').isString(),
  validateInputs,
  TeamsController.editDescription
);

teamsRouter.post('/:teamId/set-head', nonEmptyString(body('userId')), validateInputs, TeamsController.setTeamHead);
teamsRouter.post('/:teamId/delete', TeamsController.deleteTeam);
teamsRouter.post(
  '/create',
  nonEmptyString(body('teamName')),
  nonEmptyString(body('headId')),
  nonEmptyString(body('slackId')),
  nonEmptyString(body('description')),
  body('isFinanceTeam').isBoolean(),
  validateInputs,
  TeamsController.createTeam
);
teamsRouter.post('/:teamId/archive');

/**************** Team Type Section ****************/

teamsRouter.get('/teamType/all', TeamsController.getAllTeamTypes);

teamsRouter.get('/teamType/:teamTypeId/single', TeamsController.getSingleTeamType);

teamsRouter.post(
  '/teamType/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('iconName')),
  nonEmptyString(body('description')),
  validateInputs,
  TeamsController.createTeamType
);

teamsRouter.post(
  '/teamType/:teamTypeId/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('iconName')),
  nonEmptyString(body('description')),
  validateInputs,
  TeamsController.editTeamType
);

teamsRouter.post('/teamType/:teamTypeId/edit-image', upload.single('image'), TeamsController.setTeamTypeImage);

teamsRouter.post('/:teamId/set-team-type', nonEmptyString(body('teamTypeId')), validateInputs, TeamsController.setTeamType);

export default teamsRouter;
