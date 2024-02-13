import prisma from '../src/prisma/prisma';
import {
  aquaman,
  batman,
  batmanSettings,
  greenlantern,
  superman,
  wonderwoman,
  supermanWithUserSettings,
  batmanWithUserSettings
} from './test-data/users.test-data';
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
import { prismaProject1 } from './test-data/projects.test-data';
import { CR_Type } from '@prisma/client';
import ChangeRequestsService from '../src/services/change-requests.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  AccessDeniedGuestException,
  AccessDeniedMemberException,
  HttpException,
  NotFoundException,
  DeletedException
} from '../src/utils/errors.utils';
import * as changeRequestTransformer from '../src/transformers/change-requests.transformer';
import * as changeRequestUtils from '../src/utils/change-requests.utils';

describe('Change Requests', () => {
  beforeEach(() => {
    vi.spyOn(changeRequestTransformer, 'default').mockReturnValue(sharedChangeRequest);
    vi.spyOn(changeRequestUtils, 'sendSlackCRReviewedNotification').mockImplementation(async (_slackId, _crId) => {
      return undefined;
    });
    vi.spyOn(changeRequestUtils, 'sendSlackChangeRequestNotification').mockImplementation(async (_slackId, _crId) => {
      return [];
    });
    vi.spyOn(changeRequestUtils, 'updateBlocking').mockImplementation(async () => {});
    vi.spyOn(prisma.user_Settings, 'findUnique').mockResolvedValueOnce(batmanSettings);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getChangeRequestByID', () => {
    test('it works when the change request exists', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);

      const res = await ChangeRequestsService.getChangeRequestByID(1);

      expect(res).toStrictEqual(sharedChangeRequest);
    });

    test('it errors if the change request is not found', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(null);

      const crId = 1;

      await expect(() => ChangeRequestsService.getChangeRequestByID(crId)).rejects.toThrow(
        new NotFoundException('Change Request', crId)
      );
    });
  });

  describe('getAllChangeRequests', () => {
    test('it works when there are change requests', async () => {
      vi.spyOn(prisma.change_Request, 'findMany').mockResolvedValue([]);

      const res = await ChangeRequestsService.getAllChangeRequests();

      expect(prisma.change_Request.findMany).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual([]);
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
      ).rejects.toThrow(new AccessDeniedMemberException('review change requests'));
    });

    test('change request not found errors', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(null);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(batman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new NotFoundException('Change Request', crId));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('change request already reviewed', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce({ ...changeRequest, accepted: true });
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new HttpException(400, 'This change request is already approved!'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('change request reviewer is creator', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeRequest);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(batman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new AccessDeniedException());
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('did not select proposed solution', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(changeRequest);
      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, null)
      ).rejects.toThrow(new HttpException(400, 'No proposed solution selected for scope change request'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('proposed solution id not found', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(changeRequest);
      vi.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(null);
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
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(invalidCR);
      vi.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(prismaProposedSolution1);
      const updatedSolution = { ...prismaProposedSolution1, accepted: true };
      vi.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      vi.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);
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
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(validWPCR);
      vi.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(prismaProposedSolution1);
      const updatedSolution = { ...prismaProposedSolution1, accepted: true };
      vi.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      vi.spyOn(prisma.project, 'findUnique').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.project, 'update').mockResolvedValue(prismaProject1);
      vi.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...prismaChangeRequest1, accepted: true });
      vi.spyOn(prisma.change, 'create').mockResolvedValue({
        changeId: 1,
        changeRequestId: 2,
        detail: 'Changed Duration from "10" to "20"',
        implementerId: 2,
        wbsElementId: 65,
        dateImplemented: new Date()
      });
      const response = await ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1');
      expect(response).toStrictEqual(prismaChangeRequest1.crId);
      expect(prisma.user_Settings.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.project.update).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.update).toHaveBeenCalledTimes(1);
    });

    test('proposed solution successfully implemented for project', async () => {
      const myWBSElement = { ...prismaWbsElement1, workPackage: null, project: prismaProject1 };
      const newCR = {
        ...changeRequest,
        wbsElement: myWBSElement,
        accepted: false
      };
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValueOnce(newCR);
      vi.spyOn(prisma.proposed_Solution, 'findUnique').mockResolvedValueOnce(prismaProposedSolution1);
      const updatedSolution = { ...prismaProposedSolution1, accepted: true };
      vi.spyOn(prisma.proposed_Solution, 'update').mockResolvedValueOnce(updatedSolution);
      vi.spyOn(prisma.project, 'update').mockResolvedValueOnce(prismaProject1);
      vi.spyOn(prisma.change_Request, 'update').mockResolvedValueOnce({ ...prismaChangeRequest1, accepted: true });
      const response = await ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1');
      expect(response).toStrictEqual(prismaChangeRequest1.crId);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user_Settings.findUnique).toHaveBeenCalledTimes(1);
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
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(uncheckedExpectedActivitiesCR);

      await expect(() =>
        ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, '1')
      ).rejects.toThrow(new HttpException(400, 'Work Package has unchecked expected activities'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Stage Gate CR has unchecked deliverables', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
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
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(uncheckedDeliverablesCR);

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
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(validSGCR);
      vi.spyOn(prisma.change_Request, 'update').mockResolvedValue({ ...prismaChangeRequest1, accepted: true });
      vi.spyOn(prisma.work_Package, 'update').mockResolvedValue(prismaWorkPackage1);
      await ChangeRequestsService.reviewChangeRequest(superman, crId, reviewNotes, accepted, null);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.update).toHaveBeenCalledTimes(1);
      expect(prisma.work_Package.update).toHaveBeenCalledTimes(1);
      expect(prisma.user_Settings.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('add Proposed Solution', () => {
    const crId = 1;
    const budgetImpact = 100;
    const timelineImpact = 10;
    const scopeImpact = 'huge';
    const description = 'Change Color from Orange to Black';

    test('change request not found error', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        ChangeRequestsService.addProposedSolution(superman, crId, budgetImpact, description, timelineImpact, scopeImpact)
      ).rejects.toThrow(new NotFoundException('Change Request', crId));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('user access denied', async () => {
      await expect(() =>
        ChangeRequestsService.addProposedSolution(wonderwoman, crId, budgetImpact, description, timelineImpact, scopeImpact)
      ).rejects.toThrow(new AccessDeniedGuestException('add proposed solutions'));
    });

    test('change request deleted', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue({
        ...prismaChangeRequest1,
        dateDeleted: new Date('1/1/2023')
      });
      await expect(() =>
        ChangeRequestsService.addProposedSolution(greenlantern, crId, budgetImpact, description, timelineImpact, scopeImpact)
      ).rejects.toThrow(new DeletedException('Change Request', crId));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('already accepted change request', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue({ ...prismaChangeRequest1, accepted: true });
      await expect(() =>
        ChangeRequestsService.addProposedSolution(aquaman, crId, budgetImpact, description, timelineImpact, scopeImpact)
      ).rejects.toThrow(new HttpException(400, 'Cannot create proposed solutions on a reviewed change request!'));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('scope CR not found', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
      vi.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        ChangeRequestsService.addProposedSolution(aquaman, crId, budgetImpact, description, timelineImpact, scopeImpact)
      ).rejects.toThrow(new NotFoundException('Change Request', crId));
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
    });

    test('accepted new Proposed Solution', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
      vi.spyOn(prisma.scope_CR, 'findUnique').mockResolvedValue(prismaScopeChangeRequest1);
      vi.spyOn(prisma.proposed_Solution, 'create').mockResolvedValue(prismaProposedSolution1);
      const response = await ChangeRequestsService.addProposedSolution(aquaman, crId, 1000, description, 10, 'huge');
      expect(response).toStrictEqual({ ...prismaProposedSolution1, id: prismaProposedSolution1.proposedSolutionId });
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.scope_CR.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.proposed_Solution.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Delete Change Request', () => {
    test('User does not have permissions', async () => {
      await expect(() => ChangeRequestsService.deleteChangeRequest(wonderwoman, 1)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('delete change requests')
      );
    });

    test('Change Request does not exist', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(null);
      await expect(() => ChangeRequestsService.deleteChangeRequest(superman, 1)).rejects.toThrow(
        new NotFoundException('Change Request', 1)
      );
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Change request already deleted', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue({ ...prismaChangeRequest1, dateDeleted: new Date() });
      await expect(() => ChangeRequestsService.deleteChangeRequest(superman, 1)).rejects.toThrow(
        new DeletedException('Change Request', 1)
      );
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Change request already reviewed', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue({ ...prismaChangeRequest1, reviewerId: 1 });
      await expect(() => ChangeRequestsService.deleteChangeRequest(superman, 1)).rejects.toThrow(
        new HttpException(400, 'Cannot delete a reviewed change request!')
      );
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Change request successfully deleted', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
      vi.spyOn(prisma.change_Request, 'update').mockResolvedValue({
        ...prismaChangeRequest1,
        dateDeleted: new Date(),
        deletedByUserId: superman.userId
      });
      await ChangeRequestsService.deleteChangeRequest(superman, 1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('Request reviewers to change request', () => {
    test('The submitter of the request does not match to cr submitter', async () => {
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(prismaChangeRequest1);
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([]);

      await expect(() => ChangeRequestsService.requestCRReview(superman, [], 1)).rejects.toThrow(
        new AccessDeniedException(`Only the author of this change request can request a reviewer`)
      );
    });

    test('One or more reviewer does not exist', async () => {
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([superman, batman]);

      await expect(() => ChangeRequestsService.requestCRReview(batman, [1, 2, 123], 1)).rejects.toThrow(
        new HttpException(404, 'User(s) with the following ids not found: 123')
      );
    });

    test('One or more reviewer is not at least in leadership role', async () => {
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([superman, batman, wonderwoman]);

      await expect(() => ChangeRequestsService.requestCRReview(batman, [1, 2, 3], 1)).rejects.toThrow(
        new AccessDeniedException('The following user(s) are not leadership: Wonder Woman')
      );
    });

    test('One or more reviewer has no user settings', async () => {
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([superman, batmanWithUserSettings]);

      await expect(() => ChangeRequestsService.requestCRReview(batman, [1, 2], 1)).rejects.toThrow(
        new AccessDeniedException('The following user(s) have no slackId: Clark Kent')
      );
    });

    test('Change Request does not exist', async () => {
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([supermanWithUserSettings, batmanWithUserSettings]);
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(null);

      await expect(() => ChangeRequestsService.requestCRReview(batman, [1, 2], 1)).rejects.toThrow(
        new NotFoundException('Change Request', 1)
      );
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Change request already deleted', async () => {
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([supermanWithUserSettings, batmanWithUserSettings]);
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue({ ...prismaChangeRequest1, dateDeleted: new Date() });
      await expect(() => ChangeRequestsService.requestCRReview(batman, [1, 2], 1)).rejects.toThrow(
        new DeletedException('Change Request', 1)
      );
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Change request already reviewed', async () => {
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([supermanWithUserSettings, batmanWithUserSettings]);
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue({ ...prismaChangeRequest1, reviewerId: 1 });
      await expect(() => ChangeRequestsService.requestCRReview(batman, [1, 2], 1)).rejects.toThrow(
        new HttpException(400, 'Cannot request a review on an already reviewed change request')
      );
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
    });

    const changeRequest = { ...prismaChangeRequest1, requestedReviewers: [] };
    test('Change request successfully assigned reviewers', async () => {
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([batmanWithUserSettings]);
      vi.spyOn(prisma.change_Request, 'findUnique').mockResolvedValue(changeRequest);
      vi.spyOn(prisma.change_Request, 'update').mockResolvedValue(prismaChangeRequest1);

      await ChangeRequestsService.requestCRReview(batman, [1], 1);
      expect(prisma.change_Request.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.change_Request.update).toHaveBeenCalledTimes(1);
    });
  });
});
