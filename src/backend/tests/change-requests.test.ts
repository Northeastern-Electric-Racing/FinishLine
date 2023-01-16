import prisma from '../src/prisma/prisma';
import { batman, batmanSettings, superman, wonderwoman } from './test-data/users.test-data';
import {
  prismaProposedSolution1,
  whipExpectedActivites,
  whipDeliverables,
  prismaScopeChangeRequest1,
  prismaChangeRequest1,
  sharedChangeRequest
} from './test-data/change-requests.test-data';
import { prismaWbsElement1 } from './test-data/wbs-element.test-data';
import { prismaWorkPackage1 } from './test-data/work-packages.test-data';
import { project1 } from './test-data/projects.test-data';
import { CR_Type } from '@prisma/client';
import ChangeRequestsService from '../src/services/change-request.services';
import { AccessDeniedException, HttpException, NotFoundException } from '../src/utils/errors.utils';
import * as changeRequestTransformer from '../src/transformers/change-requests.transformer';
import * as changeRequestUtils from '../src/utils/change-requests.utils';

describe('Change Requests', () => {
  beforeEach(() => {
    jest.spyOn(changeRequestTransformer, 'default').mockReturnValue(sharedChangeRequest);
    jest.spyOn(changeRequestUtils, 'sendSlackCRReviewedNotification').mockImplementation(async (_slackId, _crId) => {
      return undefined;
    });
    jest.spyOn(changeRequestUtils, 'sendSlackChangeRequestNotification').mockImplementation(async (_slackId, _crId) => {
      return undefined;
    });
    jest.spyOn(changeRequestUtils, 'updateDependencies').mockImplementation(async () => {});
    jest.spyOn(prisma.user_Settings, 'findUnique').mockResolvedValueOnce(batmanSettings);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getChangeRequestByID', () => {
    test('it works when the change request exists', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);

      const res = await ChangeRequestsService.getChangeRequestByID(1);

      expect(res).toStrictEqual(sharedChangeRequest);
    });

    test('it errors if the change request is not found', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(null);

      const crId = 1;

      await expect(() => ChangeRequestsService.getChangeRequestByID(crId)).rejects.toThrow(
        new NotFoundException('Change Request', crId)
      );
    });
  });

  describe('reviewChangeRequest', () => {
    const crId = 2;
    const reviewNotes = 'reviewNotes';
    const accepted = true;

    const changeRequest = {
      ...prismaChangeRequest1,
      scopeChangeRequest: prismaScopeChangeRequest1,
      wbsElement: prismaWbsElement1
    };

    test('reviewer doesnt have access errors', async () => {
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(wonderwoman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new AccessDeniedException());
    });

    test('change request not found errors', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(null);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(batman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new NotFoundException('Change Request', crId));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('change request already reviewed', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...changeRequest, accepted: true });
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new HttpException(400, 'This change request is already approved!'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('change request reviewer is creator', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeRequest);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(batman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new AccessDeniedException());
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('did not select proposed solution', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(changeRequest);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, null)
      ).rejects.toThrow(new HttpException(400, 'No proposed solution selected for scope change request'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('proposed solution id not found', async () => {
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(changeRequest);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(null);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new HttpException(404, 'Proposed Solution with id: 1 not found!'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
    });

    test('work package project not found', async () => {
      const invalidWP = { ...prismaWorkPackage1, projectId: 100 };
      const invalidWBSElement = { ...prismaWbsElement1, workPackage: invalidWP, project: null };
      const invalidCR = {
        ...changeRequest,
        wbsElement: invalidWBSElement,
        accepted: false
      };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(invalidCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(prismaProposedSolution1);
      const updatedSolution = { ...prismaProposedSolution1, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new NotFoundException('Project', 100));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
    });

    test('proposed solution successfully implemented for work package change', async () => {
      const validWPCR = {
        ...changeRequest,
        wbsElement: { ...prismaWbsElement1, workPackage: prismaWorkPackage1 }
      };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(validWPCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(prismaProposedSolution1);
      const updatedSolution = { ...prismaProposedSolution1, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(project1);
      jest.spyOn(prisma.project, 'update').mockResolvedValue(project1);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...prismaChangeRequest1, accepted: true });
      const response = await ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1');
      expect(response).toStrictEqual(prismaChangeRequest1.crId);
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
      const myWBSElement = { ...prismaWbsElement1, workPackage: null, project: project1 };
      const newCR = {
        ...changeRequest,
        wbsElement: myWBSElement,
        accepted: false
      };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(newCR);
      jest.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(prismaProposedSolution1);
      const updatedSolution = { ...prismaProposedSolution1, accepted: true };
      jest.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      jest.spyOn(prisma.project, 'update').mockResolvedValueOnce(project1);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...prismaChangeRequest1, accepted: true });
      const response = await ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1');
      expect(response).toStrictEqual(prismaChangeRequest1.crId);
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
      const uncheckedExpectedActivitiesWP = { ...prismaWorkPackage1, expectedActivities: [uncheckedExpectedActivities] };
      const uncheckedExpectedActivitesWBS = {
        ...prismaWbsElement1,
        workPackage: uncheckedExpectedActivitiesWP
      };
      const uncheckedExpectedActivitiesCR = {
        ...prismaChangeRequest1,
        wbsElement: uncheckedExpectedActivitesWBS,
        accepted: false,
        type: CR_Type.STAGE_GATE
      };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(uncheckedExpectedActivitiesCR);

      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1')
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
        ...prismaWorkPackage1,
        expectedActivities: [whipExpectedActivites],
        deliverables: [uncheckedDeliverables]
      };
      const uncheckedDeliverablesWBS = { ...prismaWbsElement1, workPackage: uncheckedDeliverablesWP };
      const uncheckedDeliverablesCR = {
        ...prismaChangeRequest1,
        wbsElement: uncheckedDeliverablesWBS,
        accepted: false,
        type: CR_Type.STAGE_GATE
      };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(uncheckedDeliverablesCR);

      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new HttpException(400, 'Work Package has unchecked deliverables'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Stage Gate CR Succeeds', async () => {
      const validWP = {
        ...prismaWorkPackage1,
        expectedActivities: [whipExpectedActivites],
        deliverables: [whipDeliverables]
      };
      const validWBS = { ...prismaWbsElement1, workPackage: validWP };
      const validSGCR = {
        ...prismaChangeRequest1,
        wbsElement: validWBS,
        accepted: false,
        type: CR_Type.STAGE_GATE
      };
      jest.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(validSGCR);
      jest.spyOn(prisma.change_Request, 'update').mockResolvedValue({ ...prismaChangeRequest1, accepted: true });
      jest.spyOn(prisma.work_Package, 'update').mockResolvedValue(prismaWorkPackage1);
      await ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, null);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.update).toHaveBeenCalledTimes(1);
      expect(prisma.work_Package.update).toHaveBeenCalledTimes(1);
      expect(prisma.user_Settings.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
