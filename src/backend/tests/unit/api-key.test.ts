import fs from 'fs';
import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { body } from 'express-validator';
import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import { batmanAppAdmin } from '../test-data/users.test-data.js';
import ApiTokenService from '../../src/services/api-tokens.services.js';
import { ApiKey, authenticate, createRouter } from '../../src/utils/api-key.utils.js';
import { getUserAndOrganization } from '../../src/utils/auth.utils.js';
import { getCurrentCar } from '../../src/utils/car.utils.js';
import { errorHandler } from '../../src/utils/errors.utils.js';
import { validateInputs } from '../../src/utils/validation.utils.js';
import agentRouter from '../../src/routes/agent.routes.js';
import teamsRouter from '../../src/routes/teams.routes.js';

/** A stand in controller: one method opted in, one not, both reporting who called. */
class ProbeController {
  @ApiKey
  static async openWrite(req: Request, res: Response, _next: NextFunction) {
    res.status(200).json({ userId: req.currentUser.userId, viaApiKey: req.authenticatedWithApiKey ?? false });
  }

  static async closedWrite(req: Request, res: Response, _next: NextFunction) {
    res.status(200).json({ userId: req.currentUser.userId });
  }
}

const probeRouter = createRouter();
probeRouter.post('/open', ProbeController.openWrite);
probeRouter.post('/closed', body('name').isString(), validateInputs, ProbeController.closedWrite);
probeRouter.get('/inline', (_req, res) => {
  res.status(200).json({ reached: true });
});

describe('API key access', () => {
  let organization: Organization;
  let user: User;
  let token: string;
  let app: express.Express;

  beforeEach(async () => {
    organization = await createTestOrganization();
    user = await createTestUser(batmanAppAdmin, organization.organizationId);
    token = (await ApiTokenService.generateApiToken(user, organization)).token;

    // the same middleware order index.ts uses
    app = express();
    app.use(express.json());
    app.use(authenticate(false));
    app.use(getUserAndOrganization);
    app.use(getCurrentCar);
    app.use('/probe', probeRouter);
    app.use('/agent', agentRouter);
    app.use('/teams', teamsRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await resetUsers();
  });

  const withKey = (req: request.Test, key = token) => req.set('x-api-key', key);
  // the dev login: the user id in the authorization header, standing in for the session cookie
  const withSession = (req: request.Test) =>
    req.set('authorization', user.userId).set('organizationid', organization.organizationId);

  describe('with an API key', () => {
    it('reaches a decorated endpoint, writes included, as the token user', async () => {
      const res = await withKey(request(app).post('/probe/open'));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ userId: user.userId, viaApiKey: true });
    });

    it('is refused by an endpoint without the decorator', async () => {
      const res = await withKey(request(app).post('/probe/closed').send({ name: 'x' }));

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('not available with an API key');
    });

    it("is refused before the route's validators run", async () => {
      // an invalid body would be a 400 if the validators ran first
      expect((await withKey(request(app).post('/probe/closed').send({ name: 7 }))).status).toBe(403);
    });

    it('is refused by a route ending in an inline handler, which cannot be decorated', async () => {
      expect((await withKey(request(app).get('/probe/inline'))).status).toBe(403);
    });

    it('is refused by the normal app routes, which have not opted in', async () => {
      expect((await withKey(request(app).get('/teams'))).status).toBe(403);
    });

    it('reaches the /agent routes', async () => {
      const res = await withKey(request(app).get('/agent/health'));

      expect(res.status).toBe(200);
      expect(res.body.user.userId).toBe(user.userId);
    });

    it('rejects an invalid key outright', async () => {
      expect((await withKey(request(app).post('/probe/open'), 'not-a-real-token')).status).toBe(401);
    });

    it('rejects a revoked key outright', async () => {
      await ApiTokenService.generateApiToken(user, organization); // generating a new token revokes the old one

      expect((await withKey(request(app).post('/probe/open'))).status).toBe(401);
    });
  });

  describe('with the session', () => {
    it('reaches endpoints with and without the decorator', async () => {
      expect((await withSession(request(app).post('/probe/open'))).body.viaApiKey).toBe(false);
      expect((await withSession(request(app).post('/probe/closed').send({ name: 'x' }))).status).toBe(200);
      expect((await withSession(request(app).get('/probe/inline'))).status).toBe(200);
    });

    it('reaches the /agent routes like any other route', async () => {
      expect((await withSession(request(app).get('/agent/health'))).status).toBe(200);
    });
  });

  it('is required for every routes file, so no router skips the guard', () => {
    const routesDir = path.resolve(__dirname, '../../src/routes');
    const unguarded = fs
      .readdirSync(routesDir)
      .filter((file) =>
        /\bRouter\(\)/.test(fs.readFileSync(path.join(routesDir, file), 'utf8').replace(/createRouter\(\)/g, ''))
      );

    expect(unguarded).toEqual([]);
  });
});
