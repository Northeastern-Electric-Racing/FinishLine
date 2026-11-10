import { Organization } from '@prisma/client';
import prisma from '../../src/prisma/prisma.js';
import DateMarkersService from '../../src/services/date-markers.services.js';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  InvalidOrganizationException,
  NotFoundException
} from '../../src/utils/errors.utils.js';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import { flashAdmin, member, supermanAdmin } from '../test-data/users.test-data.js';

describe('Date Marker Tests', () => {
  let organization: Organization;
  let organizationId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    ({ organizationId } = organization);
  });

  afterEach(async () => {
    await resetUsers();
  });

  const createOtherOrganization = (userId: string) =>
    prisma.organization.create({ data: { name: 'Other Org', userCreated: { connect: { userId } } } });

  const designFreeze = new Date('2027-01-15');
  const competition = new Date('2027-06-10');

  describe('Get All Date Markers', () => {
    it('returns the non-deleted markers in date order', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      await DateMarkersService.createDateMarker(admin, 'Competition', competition, organization);
      await DateMarkersService.createDateMarker(admin, 'Design Freeze', designFreeze, organization);
      await DateMarkersService.createDateMarker(admin, 'Cost Report', new Date('2027-03-01'), organization);

      const [, costReport] = await DateMarkersService.getAllDateMarkers(organization);
      await DateMarkersService.deleteDateMarker(admin, costReport.dateMarkerId, organization);

      const result = await DateMarkersService.getAllDateMarkers(organization);
      expect(result.map((dateMarker) => dateMarker.name)).toEqual(['Design Freeze', 'Competition']);
      expect(result[0].date).toEqual(designFreeze);
    });

    it("does not return another organization's markers", async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      await DateMarkersService.createDateMarker(admin, 'Design Freeze', designFreeze, organization);

      const otherOrganization = await createOtherOrganization(admin.userId);

      expect(await DateMarkersService.getAllDateMarkers(otherOrganization)).toHaveLength(0);
    });
  });

  describe('Create Date Marker', () => {
    it('fails if the submitter is not an admin', async () => {
      const submitter = await createTestUser(member, organizationId);

      await expect(
        DateMarkersService.createDateMarker(submitter, 'Design Freeze', designFreeze, organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create date markers'));
    });

    it('records who created the marker', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      await DateMarkersService.createDateMarker(admin, 'Design Freeze', designFreeze, organization);

      const created = await prisma.date_Marker.findFirstOrThrow({ where: { organizationId } });
      expect(created.userCreatedId).toBe(admin.userId);
      expect(created.date).toEqual(designFreeze);
    });
  });

  describe('Edit Date Marker', () => {
    it('updates the name and date', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      await DateMarkersService.createDateMarker(admin, 'Design Freeze', designFreeze, organization);
      const [created] = await DateMarkersService.getAllDateMarkers(organization);

      await DateMarkersService.editDateMarker(admin, created.dateMarkerId, 'Comp', competition, organization);

      const [edited] = await DateMarkersService.getAllDateMarkers(organization);
      expect(edited.name).toBe('Comp');
      expect(edited.date).toEqual(competition);
    });

    it('fails if the submitter is not an admin', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const submitter = await createTestUser(member, organizationId);
      await DateMarkersService.createDateMarker(admin, 'Design Freeze', designFreeze, organization);
      const [created] = await DateMarkersService.getAllDateMarkers(organization);

      await expect(
        DateMarkersService.editDateMarker(submitter, created.dateMarkerId, 'Comp', competition, organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit date markers'));
    });

    it('fails if the marker does not exist', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);

      await expect(DateMarkersService.editDateMarker(admin, 'fake-id', 'Comp', competition, organization)).rejects.toThrow(
        new NotFoundException('Date Marker', 'fake-id')
      );
    });

    it('fails if the marker is in another organization', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      await DateMarkersService.createDateMarker(admin, 'Design Freeze', designFreeze, organization);
      const [created] = await DateMarkersService.getAllDateMarkers(organization);

      const otherOrganization = await createOtherOrganization(admin.userId);
      const otherAdmin = await createTestUser(flashAdmin, otherOrganization.organizationId);

      await expect(
        DateMarkersService.editDateMarker(otherAdmin, created.dateMarkerId, 'Comp', competition, otherOrganization)
      ).rejects.toThrow(new InvalidOrganizationException('Date Marker'));
    });
  });

  describe('Delete Date Marker', () => {
    it('soft deletes the marker and records who deleted it', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      await DateMarkersService.createDateMarker(admin, 'Design Freeze', designFreeze, organization);
      const [created] = await DateMarkersService.getAllDateMarkers(organization);

      await DateMarkersService.deleteDateMarker(admin, created.dateMarkerId, organization);

      const deleted = await prisma.date_Marker.findUniqueOrThrow({ where: { dateMarkerId: created.dateMarkerId } });
      expect(deleted.dateDeleted).not.toBeNull();
      expect(deleted.userDeletedId).toBe(admin.userId);
    });

    it('fails if the submitter is not an admin', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const submitter = await createTestUser(member, organizationId);
      await DateMarkersService.createDateMarker(admin, 'Design Freeze', designFreeze, organization);
      const [created] = await DateMarkersService.getAllDateMarkers(organization);

      await expect(DateMarkersService.deleteDateMarker(submitter, created.dateMarkerId, organization)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('delete date markers')
      );
    });

    it('fails if the marker is already deleted', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      await DateMarkersService.createDateMarker(admin, 'Design Freeze', designFreeze, organization);
      const [created] = await DateMarkersService.getAllDateMarkers(organization);
      await DateMarkersService.deleteDateMarker(admin, created.dateMarkerId, organization);

      await expect(DateMarkersService.deleteDateMarker(admin, created.dateMarkerId, organization)).rejects.toThrow(
        new DeletedException('Date Marker', created.dateMarkerId)
      );
    });
  });
});
