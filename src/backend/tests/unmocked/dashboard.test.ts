import { flashAdmin, supermanAdmin } from '../test-data/users.test-data.js';
import { AccessDeniedException, DeletedException, NotFoundException } from '../../src/utils/errors.utils.js';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import DashboardService from '../../src/services/dashboards.services.js';
import { Organization } from '@prisma/client';

describe('Dashboard Tests', () => {
  let organization: Organization;
  let organizationId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    ({ organizationId } = organization);
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('creates a dashboard that shows up in the user’s dashboards', async () => {
    const user = await createTestUser(supermanAdmin, organizationId);

    const created = await DashboardService.createDashboard(user, organization, 'My View', '/tasks?cars=1');

    expect(created.name).toBe('My View');
    expect(created.link).toBe('/tasks?cars=1');

    const dashboards = await DashboardService.getUserDashboards(user, organization);
    expect(dashboards).toHaveLength(1);
    expect(dashboards[0].dashboardId).toBe(created.dashboardId);
  });

  it('does not return another user’s dashboards', async () => {
    const owner = await createTestUser(supermanAdmin, organizationId);
    const other = await createTestUser(flashAdmin, organizationId);

    await DashboardService.createDashboard(owner, organization, 'Owner View', '/tasks?teams=abc');

    const ownerDashboards = await DashboardService.getUserDashboards(owner, organization);
    const otherDashboards = await DashboardService.getUserDashboards(other, organization);

    expect(ownerDashboards).toHaveLength(1);
    expect(otherDashboards).toHaveLength(0);
  });

  it('edits the link (saved filters) of a dashboard', async () => {
    const user = await createTestUser(supermanAdmin, organizationId);
    const created = await DashboardService.createDashboard(user, organization, 'My View', '/tasks?cars=1');

    const edited = await DashboardService.editDashboard(user, organization, created.dashboardId, '/tasks?cars=2&labels=x');

    expect(edited.link).toBe('/tasks?cars=2&labels=x');
    expect(edited.name).toBe('My View');
  });

  it('soft-deletes a dashboard so it is hidden but still in the database', async () => {
    const user = await createTestUser(supermanAdmin, organizationId);
    const created = await DashboardService.createDashboard(user, organization, 'My View', '/tasks?cars=1');

    await DashboardService.deleteDashboard(user, organization, created.dashboardId);

    const dashboards = await DashboardService.getUserDashboards(user, organization);
    expect(dashboards).toHaveLength(0);

    const row = await prisma.dashboard.findUnique({ where: { dashboardId: created.dashboardId } });
    expect(row).not.toBeNull();
    expect(row?.dateDeleted).not.toBeNull();
  });

  it('throws when editing a dashboard the user does not own', async () => {
    const owner = await createTestUser(supermanAdmin, organizationId);
    const other = await createTestUser(flashAdmin, organizationId);
    const created = await DashboardService.createDashboard(owner, organization, 'Owner View', '/tasks?cars=1');

    await expect(DashboardService.editDashboard(other, organization, created.dashboardId, '/tasks?cars=2')).rejects.toThrow(
      AccessDeniedException
    );
  });

  it('throws when deleting a dashboard the user does not own', async () => {
    const owner = await createTestUser(supermanAdmin, organizationId);
    const other = await createTestUser(flashAdmin, organizationId);
    const created = await DashboardService.createDashboard(owner, organization, 'Owner View', '/tasks?cars=1');

    await expect(DashboardService.deleteDashboard(other, organization, created.dashboardId)).rejects.toThrow(
      AccessDeniedException
    );
  });

  it('throws NotFoundException when editing a nonexistent dashboard', async () => {
    const user = await createTestUser(supermanAdmin, organizationId);

    await expect(DashboardService.editDashboard(user, organization, 'does-not-exist', '/tasks')).rejects.toThrow(
      NotFoundException
    );
  });

  it('throws DeletedException when deleting an already-deleted dashboard', async () => {
    const user = await createTestUser(supermanAdmin, organizationId);
    const created = await DashboardService.createDashboard(user, organization, 'My View', '/tasks?cars=1');
    await DashboardService.deleteDashboard(user, organization, created.dashboardId);

    await expect(DashboardService.deleteDashboard(user, organization, created.dashboardId)).rejects.toThrow(
      DeletedException
    );
  });
});
