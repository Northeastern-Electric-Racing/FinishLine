import express from 'express';
import { getAllTeams, getSingleTeam, editDescription } from '../controllers/teams.controllers';

const teamsRouter = express.Router();

teamsRouter.get('/', getAllTeams);
teamsRouter.get('/:teamId', getSingleTeam);
teamsRouter.post('/teams/:teamId/edit-description', editDescription);

export default teamsRouter;
