import express from 'express';
import TeamsController from '../controllers/teams.controllers';

const teamsRouter = express.Router();

teamsRouter.get('/', TeamsController.getAllTeams);
teamsRouter.get('/:teamId', TeamsController.getSingleTeam);
teamsRouter.post('/:teamId/set-members', TeamsController.setTeamMembers);

export default teamsRouter;
