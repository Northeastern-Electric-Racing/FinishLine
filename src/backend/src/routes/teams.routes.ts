import express from 'express';
import { getAllTeams, getSingleTeam, setMembers } from '../controllers/teams.controllers';

const teamsRouter = express.Router();

teamsRouter.get('/', getAllTeams);
teamsRouter.get('/:teamId', getSingleTeam);
teamsRouter.post('/:teamId/set-members', setMembers);

export default teamsRouter;
