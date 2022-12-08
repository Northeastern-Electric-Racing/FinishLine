import express from 'express';
import TeamController from '../controllers/teams.controllers';

const teamsRouter = express.Router();

teamsRouter.get('/', TeamController.getAllTeams);
teamsRouter.get('/:teamId', TeamController.getSingleTeam);

export default teamsRouter;
