import { CR_Type, Organization, Scope_CR_Why_Type, User, WBS_Element_Status } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import ChangeRequestsService from '../../src/services/change-requests.services';
import { supermanAdmin } from '../test-data/users.test-data';
import { ProjectProposedChangesCreateArgs, WorkPackageProposedChangesCreateArgs } from 'shared';
import prisma from '../../src/prisma/prisma';

describe('Change Request Tests', () => {
  let orgId: string;
  let organization: Organization;
  let user: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(supermanAdmin, orgId);
    await prisma.wBS_Element.create({
      data: {
        carNumber: 12,
        projectNumber: 13,
        workPackageNumber: 14,
        name: 'test wbs',
        organizationId: orgId,
        status: WBS_Element_Status.INACTIVE
      }
    });
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Change Request', () => {
    it('create change request on an inactive project - project changes', async () => {
      const projPropChanges: ProjectProposedChangesCreateArgs = {
        name: 'Project name changes',
        descriptionBullets: [],
        links: [],
        budget: 10,
        summary: 'Summary',
        teamIds: [],
        workPackageProposedChanges: []
      };

      const cr = await ChangeRequestsService.createStandardChangeRequest(
        user,
        12,
        13,
        14,
        CR_Type.DEFINITION_CHANGE,
        'What',
        [
          {
            type: Scope_CR_Why_Type.COMPETITION,
            explain: 'Explaining'
          }
        ],
        [],
        organization,
        projPropChanges,
        null
      );

      expect(cr.submitter.userId).toEqual(user.userId);
      expect(cr.wbsNum?.carNumber).toEqual(12);
      expect(cr.wbsNum?.projectNumber).toEqual(13);
      expect(cr.wbsNum?.workPackageNumber).toEqual(14);

      expect(cr.type).toEqual(CR_Type.DEFINITION_CHANGE);
      expect(cr.what).toEqual('What');
      expect(cr.proposedSolutions).toHaveLength(0);

      expect(cr.wbsNum).toBeDefined();
      expect(cr.wbsNum).not.toBeNull();

      const wbsElement = await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        }
      });

      expect(wbsElement?.status).toEqual(WBS_Element_Status.INACTIVE);
      expect(wbsElement?.carNumber).toEqual(12);
      expect(wbsElement?.projectNumber).toEqual(13);
      expect(wbsElement?.workPackageNumber).toEqual(14);
    });
    it('create change request does not make active project inactive - project changes', async () => {
      await prisma.wBS_Element.update({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        },
        data: {
          status: WBS_Element_Status.ACTIVE
        }
      });

      const wpPropChanges: WorkPackageProposedChangesCreateArgs = {
        name: 'wp',
        descriptionBullets: [],
        links: [],
        duration: 3,
        startDate: '2025-09-13',
        blockedBy: [],
        leadId: user.userId,
        managerId: user.userId
      };

      await ChangeRequestsService.createStandardChangeRequest(
        user,
        12,
        13,
        14,
        CR_Type.DEFINITION_CHANGE,
        'What',
        [
          {
            type: Scope_CR_Why_Type.COMPETITION,
            explain: 'Explaining'
          }
        ],
        [],
        organization,
        null,
        wpPropChanges
      );

      const wbsElement = await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        }
      });

      expect(wbsElement?.status).toEqual(WBS_Element_Status.ACTIVE);
      expect(wbsElement?.carNumber).toEqual(12);
      expect(wbsElement?.projectNumber).toEqual(13);
      expect(wbsElement?.workPackageNumber).toEqual(14);
    });
    it('create change request does not make active project inactive - work package changes', async () => {
      await prisma.wBS_Element.update({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        },
        data: {
          status: WBS_Element_Status.ACTIVE
        }
      });

      const wpPropChanges: WorkPackageProposedChangesCreateArgs = {
        name: 'wp',
        descriptionBullets: [],
        links: [],
        duration: 3,
        startDate: '2025-09-13',
        blockedBy: [],
        leadId: user.userId,
        managerId: user.userId
      };

      const cr = await ChangeRequestsService.createStandardChangeRequest(
        user,
        12,
        13,
        14,
        CR_Type.DEFINITION_CHANGE,
        'What',
        [
          {
            type: Scope_CR_Why_Type.COMPETITION,
            explain: 'Explaining'
          }
        ],
        [],
        organization,
        null,
        wpPropChanges
      );

      const wbsElement = await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        }
      });
      expect(cr.submitter.userId).toEqual(user.userId);
      expect(cr.wbsNum?.carNumber).toEqual(12);
      expect(cr.wbsNum?.projectNumber).toEqual(13);
      expect(cr.wbsNum?.workPackageNumber).toEqual(14);

      expect(cr.type).toEqual(CR_Type.DEFINITION_CHANGE);
      expect(cr.what).toEqual('What');
      expect(cr.proposedSolutions).toHaveLength(0);

      expect(cr.wbsNum).toBeDefined();
      expect(cr.wbsNum).not.toBeNull();

      expect(wbsElement?.status).toEqual(WBS_Element_Status.ACTIVE);
      expect(wbsElement?.carNumber).toEqual(12);
      expect(wbsElement?.projectNumber).toEqual(13);
      expect(wbsElement?.workPackageNumber).toEqual(14);
    });
    it('create change request on an inactive project - work package changes', async () => {
      await prisma.wBS_Element.update({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        },
        data: {
          status: WBS_Element_Status.INACTIVE
        }
      });

      const wpPropChanges: WorkPackageProposedChangesCreateArgs = {
        name: 'wp',
        descriptionBullets: [],
        links: [],
        duration: 3,
        startDate: '2025-09-13',
        blockedBy: [],
        leadId: user.userId,
        managerId: user.userId
      };

      await ChangeRequestsService.createStandardChangeRequest(
        user,
        12,
        13,
        14,
        CR_Type.DEFINITION_CHANGE,
        'What',
        [
          {
            type: Scope_CR_Why_Type.COMPETITION,
            explain: 'Explaining'
          }
        ],
        [],
        organization,
        null,
        wpPropChanges
      );

      const wbsElement = await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            carNumber: 12,
            projectNumber: 13,
            workPackageNumber: 14,
            organizationId: organization.organizationId
          }
        }
      });

      expect(wbsElement?.status).toEqual(WBS_Element_Status.INACTIVE);
      expect(wbsElement?.carNumber).toEqual(12);
      expect(wbsElement?.projectNumber).toEqual(13);
      expect(wbsElement?.workPackageNumber).toEqual(14);
    });
  });
});
