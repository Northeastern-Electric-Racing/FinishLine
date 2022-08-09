import express from 'express';
import { getAllTeams, getSingleTeam } from '../controllers/teams.controllers';

const teamsRouter = express.Router();

teamsRouter.get('/', getAllTeams);
teamsRouter.get('/:teamId', getSingleTeam);

export default teamsRouter;
