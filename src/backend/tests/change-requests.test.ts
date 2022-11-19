import request from 'supertest';
import express from 'express';
import prisma from '../src/prisma/prisma';
import { batman, superman, wonderwoman } from './test-data/users.test-data';
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
      jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);

      const response = await request(app).post('/review').send(whipPayloadObject);

      expect(response.body).toStrictEqual({ message: 'No proposed solution selected for scope change request' });
      expect(response.status).toBe(400);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
    });

    test('proposed solution id not found', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: null });
      jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
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
      expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
    });

    test('wbs element not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
      jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(solutionToRedesignWhip);
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(null);
      const response = await request(app)
        .post('/review')
        .send({ ...whipPayloadObject, psId: solutionToRedesignWhip.proposedSolutionId });
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

    test('work package project not found', async () => {
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
        .send({ ...whipPayloadObject, psId: '1' });
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

    test('proposed solution successfully implemented for work package change', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
      jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      const updatedSolution = { ...solutionToRedesignWhip, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(redesignWhipWBSElement);
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(project1);
      jest.spyOn(prisma.work_Package, 'update').mockResolvedValueOnce(whipWorkPackage);
      jest.spyOn(prisma.project, 'update').mockResolvedValueOnce(project1);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...redesignWhip, accepted: true });
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(redesignWhipWBSElement);
      jest.spyOn(prisma.work_Package, 'findUnique').mockResolvedValueOnce(whipWorkPackage);
      const response = await request(app)
        .post('/review')
        .send({ ...whipPayloadObject, psId: '1' });
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
      expect(prisma.work_Package.findUnique).toHaveBeenCalledTimes(1);
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
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...redesignWhip, accepted: false });
      jest.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValueOnce(redesignWhipScopeCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      const updatedSolution = { ...solutionToRedesignWhip, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);

      const myWBSElement = { ...redesignWhipWBSElement, workPackage: null, project: project1 };
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(myWBSElement);
      jest.spyOn(prisma.project, 'update').mockResolvedValueOnce(project1);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...redesignWhip, accepted: true });
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValueOnce(redesignWhipWBSElement);
      jest.spyOn(prisma.work_Package, 'findUnique').mockResolvedValueOnce(whipWorkPackage);
      const response = await request(app)
        .post('/review')
        .send({ ...whipPayloadObject, psId: '1' });
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        message: `Change request #${redesignWhip.crId} successfully reviewed.`
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.work_Package.findUnique).toHaveBeenCalledTimes(1);
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
});
