import express from 'express';
import { getAllTeams, getSingleTeam, getAllProjectsByTeam } from '../controllers/teams.controllers';

const teamsRouter = express.Router();

teamsRouter.get('/', getAllTeams);
teamsRouter.get('/:teamId', getSingleTeam);
teamsRouter.get('/:teamId/projects', getAllProjectsByTeam);

export default teamsRouter;
