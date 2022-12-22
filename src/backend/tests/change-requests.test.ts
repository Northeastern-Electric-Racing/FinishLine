import prisma from '../src/prisma/prisma';
import { batman, batmanSettings, superman, wonderwoman } from './test-data/users.test-data';
import {
  reviewChangeRequestParams,
  redesignWhip,
  redesignWhipWBSElement,
  solutionToRedesignWhip,
  whipWorkPackage,
  whipExpectedActivites,
  whipDeliverables,
  redesignWhipScopeCR
} from './test-data/change-requests.test-data';
import { project1 } from './test-data/projects.test-data';
import { CR_Type } from '@prisma/client';
import ChangeRequestsService from '../src/services/change-request.services';
import { AccessDeniedException, HttpException, NotFoundException } from '../src/utils/errors.utils';

describe('Change Requests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reviewChangeRequest', () => {
    const scopeCR = { ...redesignWhip, accepted: false, scopeChangeRequest: redesignWhipScopeCR };

    test('reviewer doesnt have access errors', async () => {
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(
          wonderwoman,
          reviewChangeRequestParams.crId,
          reviewChangeRequestParams.reviewNotes,
          reviewChangeRequestParams.accepted,
          '1'
        )
      ).rejects.toThrow(new AccessDeniedException());
    });

    test('change request not found errors', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(null);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(
          batman,
          reviewChangeRequestParams.crId,
          reviewChangeRequestParams.reviewNotes,
          reviewChangeRequestParams.accepted,
          '1'
        )
      ).rejects.toThrow(new NotFoundException('Change Request', reviewChangeRequestParams.crId));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('change request already reviewed', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(redesignWhip);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(
          batman,
          reviewChangeRequestParams.crId,
          reviewChangeRequestParams.reviewNotes,
          reviewChangeRequestParams.accepted,
          '1'
        )
      ).rejects.toThrow(new HttpException(400, 'This change request is already approved!'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('change request reviewer is creator', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue({ ...redesignWhip, accepted: false });
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(
          batman,
          reviewChangeRequestParams.crId,
          reviewChangeRequestParams.reviewNotes,
          reviewChangeRequestParams.accepted,
          '1'
        )
      ).rejects.toThrow(new AccessDeniedException());
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('did not select proposed solution', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(scopeCR);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(
          superman,
          reviewChangeRequestParams.crId,
          reviewChangeRequestParams.reviewNotes,
          reviewChangeRequestParams.accepted,
          null
        )
      ).rejects.toThrow(new HttpException(400, 'No proposed solution selected for scope change request'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('proposed solution id not found', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(scopeCR);
      jest
        .spyOn(prisma.proposed_Solution, 'findUnique')
        .mockResolvedValueOnce({ ...solutionToRedesignWhip, changeRequestId: 10 });
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(
          superman,
          reviewChangeRequestParams.crId,
          reviewChangeRequestParams.reviewNotes,
          reviewChangeRequestParams.accepted,
          '1'
        )
      ).rejects.toThrow(new HttpException(404, 'Proposed Solution with id: 1 not found!'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
    });

    test('work package project not found', async () => {
      const invalidWP = { ...whipWorkPackage, projectId: 100 };
      const invalidWBSElement = { ...redesignWhipWBSElement, workPackage: invalidWP, project: null };
      const invalidCR = {
        ...redesignWhip,
        wbsElement: invalidWBSElement,
        accepted: false,
        scopeChangeRequest: redesignWhipScopeCR
      };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(invalidCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      const updatedSolution = { ...solutionToRedesignWhip, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(
          superman,
          reviewChangeRequestParams.crId,
          reviewChangeRequestParams.reviewNotes,
          reviewChangeRequestParams.accepted,
          '1'
        )
      ).rejects.toThrow(new NotFoundException('Project', 100));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    });

    test('proposed solution successfully implemented for work package change', async () => {
      const validWPCR = { ...scopeCR, wbsElement: { ...redesignWhipWBSElement, workPackage: whipWorkPackage } };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(validWPCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      const updatedSolution = { ...solutionToRedesignWhip, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(project1);
      jest.spyOn(prisma.project, 'update').mockResolvedValueOnce(project1);
      jest.spyOn(prisma.user_Settings, 'findUnique').mockResolvedValueOnce(batmanSettings);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...redesignWhip, accepted: true });
      const response = await ChangeRequestsService.reviewChangeRequest(
        superman,
        reviewChangeRequestParams.crId,
        reviewChangeRequestParams.reviewNotes,
        reviewChangeRequestParams.accepted,
        '1'
      );
      expect(response).toStrictEqual(redesignWhip.crId);
      expect(prisma.user_Settings.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.project.update).toHaveBeenCalledTimes(1);
      expect(prisma.project.update).toHaveBeenCalledWith({
        data: {
          budget: 1003,
          wbsElement: {
            update: {
              changes: { create: { changeRequestId: 2, detail: 'Changed Budget from "3" to "1003"', implementerId: 2 } }
            }
          },
          workPackages: {
            update: {
              data: {
                duration: 20,
                wbsElement: {
                  update: {
                    changes: {
                      create: { changeRequestId: 2, detail: 'Changed Duration from "10" to "20"', implementerId: 2 }
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
      const myWBSElement = { ...redesignWhipWBSElement, workPackage: null, project: project1 };
      const newCR = { ...redesignWhip, wbsElement: myWBSElement, accepted: false, scopeChangeRequest: redesignWhipScopeCR };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(newCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(solutionToRedesignWhip);
      const updatedSolution = { ...solutionToRedesignWhip, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      jest.spyOn(prisma.user_Settings, 'findUnique').mockResolvedValueOnce(batmanSettings);
      jest.spyOn(prisma.project, 'update').mockResolvedValueOnce(project1);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...redesignWhip, accepted: true });
      const response = await ChangeRequestsService.reviewChangeRequest(
        superman,
        reviewChangeRequestParams.crId,
        reviewChangeRequestParams.reviewNotes,
        reviewChangeRequestParams.accepted,
        '1'
      );
      expect(response).toStrictEqual(redesignWhip.crId);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user_Settings.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.project.update).toHaveBeenCalledWith({
        data: {
          budget: 1003,
          wbsElement: {
            update: {
              changes: { create: { changeRequestId: 2, detail: 'Changed Budget from "3" to "1003"', implementerId: 2 } }
            }
          }
        },
        where: { projectId: 2 }
      });
      expect(prisma.change_Request.update).toHaveBeenCalledTimes(1);
    });

    test('Stage Gate CR has unchecked expected activities', async () => {
      const uncheckedExpectedActivities = {
        ...whipExpectedActivites,
        userCheckedId: null,
        dateTimeChecked: null
      };
      const uncheckedExpectedActivitiesWP = { ...whipWorkPackage, expectedActivities: [uncheckedExpectedActivities] };
      const uncheckedExpectedActivitesWBS = { ...redesignWhipWBSElement, workPackage: uncheckedExpectedActivitiesWP };
      const uncheckedExpectedActivitiesCR = {
        ...redesignWhip,
        wbsElement: uncheckedExpectedActivitesWBS,
        accepted: false,
        type: CR_Type.STAGE_GATE
      };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(uncheckedExpectedActivitiesCR);

      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(
          superman,
          reviewChangeRequestParams.crId,
          reviewChangeRequestParams.reviewNotes,
          reviewChangeRequestParams.accepted,
          '1'
        )
      ).rejects.toThrow(new HttpException(400, 'Work Package has unchecked expected activities'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });
    test('Stage Gate CR has unchecked deliverables', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
      const uncheckedDeliverables = {
        ...whipDeliverables,
        userCheckedId: null,
        dateTimeChecked: null
      };
      const uncheckedDeliverablesWP = {
        ...whipWorkPackage,
        expectedActivities: [whipExpectedActivites],
        deliverables: [uncheckedDeliverables]
      };
      const uncheckedDeliverablesWBS = { ...redesignWhipWBSElement, workPackage: uncheckedDeliverablesWP };
      const uncheckedDeliverablesCR = {
        ...redesignWhip,
        wbsElement: uncheckedDeliverablesWBS,
        accepted: false,
        type: CR_Type.STAGE_GATE
      };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(uncheckedDeliverablesCR);

      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(
          superman,
          reviewChangeRequestParams.crId,
          reviewChangeRequestParams.reviewNotes,
          reviewChangeRequestParams.accepted,
          '1'
        )
      ).rejects.toThrow(new HttpException(400, 'Work Package has unchecked deliverables'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Stage Gate CR Succeeds', async () => {
      const validWP = {
        ...whipWorkPackage,
        expectedActivities: [whipExpectedActivites],
        deliverables: [whipDeliverables]
      };
      const validWBS = { ...redesignWhipWBSElement, workPackage: validWP };
      const validSGCR = {
        ...redesignWhip,
        wbsElement: validWBS,
        accepted: false,
        type: CR_Type.STAGE_GATE
      };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(validSGCR);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValue({ ...redesignWhip, accepted: true });
      jest.spyOn(prisma.work_Package, 'update').mockResolvedValue(whipWorkPackage);
      jest.spyOn(prisma.user_Settings, 'findUnique').mockResolvedValue(batmanSettings);
      const response = await ChangeRequestsService.reviewChangeRequest(
        superman,
        reviewChangeRequestParams.crId,
        reviewChangeRequestParams.reviewNotes,
        reviewChangeRequestParams.accepted,
        null
      );
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.update).toHaveBeenCalledTimes(1);
      expect(prisma.work_Package.update).toHaveBeenCalledTimes(1);
      expect(prisma.user_Settings.findUnique).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual(reviewChangeRequestParams.crId);
    });
  });
});
