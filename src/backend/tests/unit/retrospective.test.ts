import { Organization, User } from '@prisma/client';
import {
  createTestCar,
  createTestOrganization,
  createTestProject,
  createTestUser,
  createTestWorkPackage,
  resetUsers
} from '../test-utils.js';
import { batmanAppAdmin } from '../test-data/users.test-data.js';
import RetrospectiveService from '../../src/services/retrospective.services.js';

describe('Retrospective Tests', () => {
  let organization: Organization;
  let orgId: string;
  let user: User;
  let carId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(batmanAppAdmin, orgId);
    ({ carId } = await createTestCar(orgId, user.userId, 1));
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get Retrospective Timelines', () => {
    it('excludes deleted projects', async () => {
      const project = await createTestProject(user, orgId, undefined, carId, 1, 1);
      await createTestProject(user, orgId, undefined, carId, 1, 2, new Date());

      const timelines = await RetrospectiveService.getRetrospectiveTimelines(orgId);

      expect(timelines).toHaveLength(1);
      expect(timelines[0].id).toBe(project.projectId);
    });

    it('returns work packages with their original start date and duration', async () => {
      const project = await createTestProject(user, orgId, undefined, carId, 1, 1);
      const workPackage = await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 1);

      const [timeline] = await RetrospectiveService.getRetrospectiveTimelines(orgId);

      expect(timeline.workPackages).toHaveLength(1);
      expect(timeline.workPackages[0].id).toBe(workPackage.workPackageId);
      // with no duration or start date changes, the originals match the current values
      expect(timeline.workPackages[0].originalDuration).toBe(workPackage.duration);
      expect(timeline.workPackages[0].originalStartDate).toEqual(workPackage.startDate);
    });
  });
});
