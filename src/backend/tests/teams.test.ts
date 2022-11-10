import request from 'supertest';
import express from 'express';
import teamsRouter from '../src/routes/teams.routes';
import prisma from '../src/prisma/prisma';

const app = express();
app.use(express.json());
app.use('/', teamsRouter);

describe('Teams', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getAllTeams', async () => {
        jest.spyOn(prisma.team, 'findMany').mockResolvedValue(bruh);
    })
    
})