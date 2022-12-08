import request from 'supertest';
import express from 'express';
import prisma from '../src/prisma/prisma';
import { batman, batmanSettings, superman, wonderwoman } from './test-data/users.test-data';
import changeRequestsRouter from '../src/routes/change-requests.routes';
import {
  whipPayloadObject,
  redesignWhip,
  redesignWhipScopeCR,
  redesignWhipWBSElement,
  solutionToRedesignWhip,
  whipWorkPackage
} from './test-data/change-requests.test-data';
import { project1 } from './test-data/projects.test-data';
import { CR_Type } from '@prisma/client';

const app = express();
app.use(express.json());
app.use('/', changeRequestsRouter);

describe('Change Requests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('reviewChangeRequest', () => {
    test('reviewer not found errors', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const response = await request(app).post('/review').send(whipPayloadObject);

      expect(response.body).toStrictEqual({ message: `User with id #${whipPayloadObject.reviewerId} not found` });
      expect(response.status).toBe(404);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    test('reviewer doesnt have access errors', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(wonderwoman);
      const response = await request(app)
        .post('/review')
        .send({ ...whipPayloadObject, accepted: false });
      expect(response.body).toStrictEqual({ message: 'Access Denied' });
      expect(response.status).toBe(403);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    test('change request not found errors', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(batman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(null);
      const response = await request(app).post('/review').send(whipPayloadObject);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({ message: `Change request with id #${whipPayloadObject.crId} not found` });
    });

    test('change request already reviewed', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(batman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(redesignWhip);
      const response = await request(app).post('/review').send(whipPayloadObject);
      expect(response.body).toStrictEqual({ message: 'This change request is already approved!' });
      expect(response.status).toBe(400);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('change request reviewer is creator', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
      jest
        .spyOn(prisma.change_Request, 'findUnique')
        .mockResolvedValue({ ...redesignWhip, accepted: false, submitterId: 1 });
      const response = await request(app).post('/review').send(whipPayloadObject);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ message: 'Access Denied' });
      expect(response.status).toBe(403);
    });

    test('did not select proposed solution', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });

      const response = await request(app).post('/review').send(whipPayloadObject);

      expect(response.body).toStrictEqual({ message: 'No proposed solution selected for scope change request' });
      expect(response.status).toBe(400);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('proposed solution id not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: null });
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(null);
      const psId = 100;
      const response = await request(app)
        .post('/review')
        .send({ ...whipPayloadObject, psId: '100' });
      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        message: `Proposed solution with id #${psId} not found for change request #${redesignWhip.crId}`
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
    });

    test('work package project not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
      const invalidWP = { ...whipWorkPackage, projectId: 100 };
      const invalidWBSElement = { ...redesignWhipWBSElement, workPackage: invalidWP, project: null };
      const invalidCR = { ...redesignWhip, wbsElement: invalidWBSElement, accepted: false };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(invalidCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      const updatedSolution = { ...solutionToRedesignWhip, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);
      const response = await request(app)
        .post('/review')
        .send({ ...whipPayloadObject, psId: '1' });
      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        message: `Work package project not found`
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    });

    test('proposed solution successfully implemented for work package change', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      const updatedSolution = { ...solutionToRedesignWhip, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(project1);
      jest.spyOn(prisma.project, 'update').mockResolvedValueOnce(project1);
      jest.spyOn(prisma.user_Settings, 'findUnique').mockResolvedValueOnce(batmanSettings);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...redesignWhip, accepted: true });
      const response = await request(app)
        .post('/review')
        .send({ ...whipPayloadObject, psId: '1' });
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        message: `Change request #${redesignWhip.crId} successfully reviewed.`
      });
      expect(prisma.user_Settings.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
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
                    changes: {
                      create: { changeRequestId: 2, detail: 'Changed Duration from "10" to "20"', implementerId: 1 }
                    }
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

    test('proposed solution successfully implemented for project', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(batman);
      const myWBSElement = { ...redesignWhipWBSElement, workPackage: null, project: project1 };
      const newCR = { ...redesignWhip, wbsElement: myWBSElement, accepted: false };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(newCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      const updatedSolution = { ...solutionToRedesignWhip, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      jest.spyOn(prisma.user_Settings, 'findUnique').mockResolvedValueOnce(batmanSettings);
      jest.spyOn(prisma.project, 'update').mockResolvedValueOnce(project1);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...redesignWhip, accepted: true });
      const response = await request(app)
        .post('/review')
        .send({ ...whipPayloadObject, psId: '1' });
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        message: `Change request #${redesignWhip.crId} successfully reviewed.`
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user_Settings.findUnique).toHaveBeenCalledTimes(1);
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

    test('Stage Gate CR has unchecked expected activities', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
      const uncheckedExpectedActivities = {
        ...whipWorkPackage.expectedActivities[0],
        userCheckedId: null,
        dateTimeChecked: null
      };
      const uncheckedExpectedActivitiesWP = { ...whipWorkPackage, expectedActivities: [uncheckedExpectedActivities] };
      const uncheckedExpectedActivitesWBS = { ...redesignWhipWBSElement, workPackage: uncheckedExpectedActivitiesWP };
      const uncheckedExpectedActivitiesCR = { ...redesignWhip, wbsElement: uncheckedExpectedActivitesWBS, accepted: false, type: CR_Type.STAGE_GATE, scopeChangeRequest: null };
      jest
        .spyOn(prisma.change_Request, 'findUnique')
        .mockResolvedValue(uncheckedExpectedActivitiesCR);

      const response = await request(app).post('/review').send(whipPayloadObject);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ message: 'Work Package has unchecked expected activities' });
      expect(response.status).toBe(400);
    });
  });
  test('Stage Gate CR has unchecked deliverables', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    const uncheckedDeliverables = {
      ...whipWorkPackage.deliverables[0],
      userCheckedId: null,
      dateTimeChecked: null
    };
    const uncheckedDeliverablesWP = { ...whipWorkPackage, deliverables: [uncheckedDeliverables] };
    const uncheckedDeliverablesWBS = { ...redesignWhipWBSElement, workPackage: uncheckedDeliverablesWP };
    const uncheckedDeliverablesCR = {
      ...redesignWhip,
      wbsElement: uncheckedDeliverablesWBS,
      accepted: false,
      type: CR_Type.STAGE_GATE,
      scopeChangeRequest: null
    };
    jest
      .spyOn(prisma.change_Request, 'findUnique')
      .mockResolvedValue(uncheckedDeliverablesCR);

    const response = await request(app).post('/review').send(whipPayloadObject);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual({ message: 'Work Package has unchecked deliverables' });
    expect(response.status).toBe(400);
  });

  test('Stage Gate CR Succeeds', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
    const validStageGateCR = { ...redesignWhip, accepted: false, type: CR_Type.STAGE_GATE, scopeChangeRequest: null };
    jest
      .spyOn(prisma.change_Request, 'findUnique')
      .mockResolvedValue(validStageGateCR);
    jest.spyOn(prisma.change_Request, 'update').mockResolvedValue({ ...redesignWhip, accepted: true });
    jest.spyOn(prisma.work_Package, 'update').mockResolvedValue(whipWorkPackage);
    jest.spyOn(prisma.user_Settings, 'findUnique').mockResolvedValue(batmanSettings);
    const response = await request(app).post('/review').send(whipPayloadObject);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.change_Request.update).toHaveBeenCalledTimes(1);
    expect(prisma.work_Package.update).toHaveBeenCalledTimes(1);
    expect(prisma.user_Settings.findUnique).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual({ message: 'Change request #2 successfully reviewed.' });
    expect(response.status).toBe(200);
  });
});
