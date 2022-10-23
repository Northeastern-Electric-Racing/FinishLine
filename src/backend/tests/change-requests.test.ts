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
import { someProject } from './test-data/projects.test-data';

const app = express();
app.use(express.json());
app.use('/', changeRequestsRouter);

describe('Change-Requests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('reviewerWithIdDoesNotExist', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
    const response = await request(app).post('/review').send(changeBatmobile);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({ message: `User with id #${changeBatmobile.reviewerId} not found` });
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
  test('proposedSolutionIdNotFound', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
    jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
    jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(null);
    const psId = 100;
    const response = await request(app)
      .post('/review')
      .send({ ...redesignWhip, psId: '100' });
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
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
    jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
    jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
    jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(solutionToRedesignWhip);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(null);
    const response = await request(app)
      .post('/review')
      .send({ ...redesignWhip, psId: solutionToRedesignWhip.proposedSolutionId });
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
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
    jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
    jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
    const updatedSolution = { ...solutionToRedesignWhip, accepted: true };
    jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
    const invalidWP = { ...whipWorkPackage, projectId: 100 };
    const invalidWBSElement = { ...redesignWhipWBSElement, workPackage: invalidWP };
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(invalidWBSElement);
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);
    const response = await request(app)
      .post('/review')
      .send({ ...redesignWhip, psId: '1' });
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      message: `Work package project not found`
    });
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
  });
  test('proposedSolutionSuccessfullyImplementedForWorkPackageChange', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
    jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
    jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
    jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
    const updatedSolution = {...solutionToRedesignWhip, accepted: true };
    jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(redesignWhipWBSElement);

    const myProject = {...someProject.project, googleDriveFolderLink: 'https://drive.google.com/drive/folders/1', slideDeckLink: 'https://docs.google.com/presentation/d/1', bomLink: 'https://docs.google.com/spreadsheets/d/1', taskListLink: 'https://docs.google.com/spreadsheets/d/1', teamId: "1"};

    jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(myProject);
    jest.spyOn(prisma.work_Package, 'update').mockResolvedValueOnce(whipWorkPackage);
    jest.spyOn(prisma.project, 'update').mockResolvedValueOnce(myProject);
    jest.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...redesignWhip, accepted: true });
    jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(redesignWhipWBSElement);
    const response = await request(app)
      .post('/review')
      .send({ ...redesignWhip, psId: '1' });
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      message: `Change request #${redesignWhip.crId} successfully reviewed.`
    });
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.project.update).toHaveBeenCalledTimes(1);
    expect(prisma.project.update).toHaveBeenCalledWith({
      data: {
        budget: 1003,
        wbsElement: {
          update: {
            changes: { create: { changeRequestId: 2, detail: 'Changed Budget from "3" to "1003"', implementerId: 1 } }
          }
        },
        workPackages: {
          update: {
            data: {
              duration: 20,
              wbsElement: {
                update: {
                  changes: { create: { changeRequestId: 2, detail: 'Changed Duration from "10" to "20"', implementerId: 1 } }
                }
              }
            },
            where: { workPackageId: 1 }
          }
        }
      },
      where: { projectId: 1 }
    });
    expect(prisma.change_Request.update).toHaveBeenCalledTimes(1);
  });
    
    test('proposedSolutionSuccessfullyImplementedForProject', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
      jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      const updatedSolution = { ...solutionToRedesignWhip, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      const myProject = {...someProject.project, googleDriveFolderLink: 'https://drive.google.com/drive/folders/1', slideDeckLink: 'https://docs.google.com/presentation/d/1', bomLink: 'https://docs.google.com/spreadsheets/d/1', taskListLink: 'https://docs.google.com/spreadsheets/d/1', teamId: "1"};

      const myWBSElement = {...redesignWhipWBSElement, workPackage: null, project: myProject};
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(myWBSElement);
      jest.spyOn(prisma.project, 'update').mockResolvedValueOnce(myProject);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...redesignWhip, accepted: true });
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(redesignWhipWBSElement);

      const response = await request(app)
        .post('/review')
        .send({ ...redesignWhip, psId: '1' });
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        message: `Change request #${redesignWhip.crId} successfully reviewed.`
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.project.update).toHaveBeenCalledTimes(1);
      expect(prisma.project.update).toHaveBeenCalledWith({
        data: {
          budget: 1003,
          wbsElement: {
            update: {
              changes: { create: { changeRequestId: 2, detail: 'Changed Budget from "3" to "1003"', implementerId: 1 } }
            }
          }
        },
        where: { projectId: 2 }
      });
      expect(prisma.change_Request.update).toHaveBeenCalledTimes(1);

    });
});
