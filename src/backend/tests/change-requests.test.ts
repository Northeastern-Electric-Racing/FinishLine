import request from 'supertest';
import express from 'express';
import prisma from '../src/prisma/prisma';
import { batman, superman, wonderwoman } from './test-data/users.test-data';
import changeRequestsRouter from '../src/routes/change-requests.routes';
import {
  changeBatmobile,
  redesignWhip,
  redesignWhipScopeCR,
  redesignWhipWBSElement,
  solutionToRedesignWhip,
  whipWorkPackage
} from './test-data/change-requests.test-data';
import { createWorkPackagePayload } from './test-data/work-packages.test-data';

const app = express();
app.use(express.json());
app.use('/', changeRequestsRouter);

describe('Projects', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('reviewerWithIdDoesNotExist', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
    const cr = { ...changeBatmobile, reviewerId: 100 };
    const response = await request(app).post('/review').send(cr);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({ message: `User with id #${cr.reviewerId} not found` });
  });
  test('reviewerDoesNotHaveAccess', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(wonderwoman);
    const response = await request(app).post('/review').send(changeBatmobile);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({ message: 'Access Denied' });
  });
  test('changeRequestNotFound', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(null);
    const response = await request(app).post('/review').send(changeBatmobile);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({ message: `Change request with id #${changeBatmobile.crId} not found` });
  });
  test('changeRequestAlreadyReviewed', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...changeBatmobile, accepted: true });
    const response = await request(app).post('/review').send(changeBatmobile);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({ message: 'This change request is already approved!' });
  });
  test('changeRequestReviewerIsCreator', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(batman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...changeBatmobile, accepted: false });
    const response = await request(app).post('/review').send(changeBatmobile);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({ message: 'Access Denied' });
  });
  test('didNotSelectProposedSolution', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
    jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);

    const response = await request(app).post('/review').send(redesignWhip);
    expect(response.status).toBe(400);

    expect(response.body).toStrictEqual({ message: 'No proposed solution selected for scope change request' });
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
  });
  test('noProposedSolutionSelected', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
    jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
    jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(null);
    const response = await request(app).post('/review').send(redesignWhip);
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      message: `No proposed solution selected for scope change request`
    });
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
  });
  test('proposedSolutionIdNotFound', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false});
      jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      const psId = 100;
      const response = await request(app).post('/review').send({...redesignWhip, psId: "100"});
      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
         message: `Proposed solution with id #${psId} not found for change request #${redesignWhip.crId}`
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
   });
   test('wbsElementNotFound', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false});
      jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(solutionToRedesignWhip);
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(null);
      const response = await request(app).post('/review').send({...redesignWhip, psId: solutionToRedesignWhip.proposedSolutionId});
      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
         message: `WBS element with id #${redesignWhip.wbsElementId} not found`
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
   });
   test('workPackageProjectNotFound', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false});
      jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(solutionToRedesignWhip);
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(redesignWhipWBSElement);
      jest.spyOn(prisma.work_Package, 'findUnique').mockResolvedValueOnce({...whipWorkPackage, projectId: 100});
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);
      const response = await request(app).post('/review').send({...redesignWhip, psId: solutionToRedesignWhip.proposedSolutionId});
      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
         message: `Work package project not found`
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.work_Package.findUnique).toHaveBeenCalledTimes(1);
   });
});
