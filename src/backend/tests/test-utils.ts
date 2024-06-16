import {
  Club_Accounts,
  Organization,
  Project,
  Schedule_Settings,
  User,
  User_Secure_Settings,
  User_Settings,
  WBS_Element_Status
} from '@prisma/client';
import prisma from '../src/prisma/prisma';
import { dbSeedAllUsers } from '../src/prisma/seed-data/users.seed';
import TeamsService from '../src/services/teams.services';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import { ClubAccount, RoleEnum } from 'shared';
import {
  aquamanLeadership,
  batmanAppAdmin,
  batmanScheduleSettings,
  batmanSecureSettings,
  batmanSettings
} from './test-data/users.test-data';
import { getWorkPackageTemplateQueryArgs } from '../src/prisma-query-args/work-package-template.query-args';
import DesignReviewsService from '../src/services/design-reviews.services';

export interface CreateTestUserParams {
  firstName: string;
  lastName: string;
  email: string;
  emailId?: string | null;
  googleAuthId: string;
  role: RoleEnum;
}

export const createTestUser = async (
  { firstName, lastName, email, emailId, googleAuthId, role }: CreateTestUserParams,
  organizationId: string,
  userSettings?: User_Settings,
  userSecureSettings?: User_Secure_Settings,
  scheduleSettings?: Schedule_Settings
): Promise<User> => {
  const createdUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      emailId,
      googleAuthId,
      roles: {
        create: {
          roleType: role,
          organizationId
        }
      }
    }
  });

  if (userSettings) {
    await prisma.user_Settings.create({
      data: {
        ...userSettings,
        userId: createdUser.userId
      }
    });
  }

  if (userSecureSettings) {
    await prisma.user_Secure_Settings.create({
      data: {
        ...userSecureSettings,
        userId: createdUser.userId
      }
    });
  }

  if (scheduleSettings) {
    await prisma.schedule_Settings.create({
      data: {
        ...scheduleSettings,
        userId: createdUser.userId
      }
    });
  }

  return createdUser;
};

export const resetUsers = async () => {
  await prisma.work_Package.deleteMany();
  await prisma.project.deleteMany();
  await prisma.team_Type.deleteMany();
  await prisma.material.deleteMany();
  await prisma.manufacturer.deleteMany();
  await prisma.material_Type.deleteMany();
  await prisma.assembly.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user_Secure_Settings.deleteMany();
  await prisma.reimbursement_Product.deleteMany();
  await prisma.reimbursement_Status.deleteMany();
  await prisma.reimbursement_Request.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.account_Code.deleteMany();
  await prisma.car.deleteMany();
  await prisma.wBS_Element.deleteMany();
  await prisma.task.deleteMany();
  await prisma.stage_Gate_CR.deleteMany();
  await prisma.activation_CR.deleteMany();
  await prisma.change.deleteMany();
  await prisma.proposed_Solution.deleteMany();
  await prisma.scope_CR_Why.deleteMany();
  await prisma.scope_CR.deleteMany();
  await prisma.change_Request.deleteMany();
  await prisma.link.deleteMany();
  await prisma.link_Type.deleteMany();
  await prisma.work_Package_Template.deleteMany();
  await prisma.user_Settings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user_Secure_Settings.deleteMany();
  await prisma.schedule_Settings.deleteMany();
  await prisma.role.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
};

export const createFinanceTeamAndLead = async (organization?: Organization) => {
  if (!organization) organization = await createTestOrganization();
  const head = await createTestUser(
    { ...batmanAppAdmin, googleAuthId: 'financeHead', role: RoleEnum.APP_ADMIN },
    organization.organizationId,
    batmanSettings,
    batmanSecureSettings,
    batmanScheduleSettings
  );

  const lead = await createTestUser(
    { ...dbSeedAllUsers.aang, googleAuthId: 'financeLead', role: RoleEnum.LEADERSHIP },
    organization.organizationId
  );

  const financeMember = await createTestUser(
    { ...dbSeedAllUsers.johnBoddy, googleAuthId: 'financeMember', role: RoleEnum.MEMBER },
    organization.organizationId
  );

  const team = await TeamsService.createTeam(
    head,
    'Finance Team',
    head.userId,
    'Finance Team',
    '',
    true,
    organization.organizationId
  );

  await TeamsService.setTeamLeads(head, team.teamId, [lead.userId], organization.organizationId);

  await TeamsService.setTeamMembers(head, team.teamId, [financeMember.userId], organization.organizationId);
};

export const createTestOrganization = async () => {
  const user = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: '',
      googleAuthId: 'organizationCreator'
    }
  });

  return await prisma.organization.create({
    data: {
      name: 'Joe mama',
      userCreated: {
        connect: {
          userId: user.userId
        }
      }
    }
  });
};

export const createTestWorkPackageTemplate = async (user: User, organizationId?: string) => {
  if (!organizationId) organizationId = await createTestOrganization().then((org) => org.organizationId);
  if (!organizationId) throw new Error('Failed to create organization');

  const workPackageTemplate = await prisma.work_Package_Template.create({
    data: {
      workPackageName: 'Work Package 1',
      templateName: 'Template 1',
      templateNotes: 'This is a new work package template',
      dateCreated: new Date('03/25/2024'),
      userCreatedId: user.userId,
      organizationId
    },
    ...getWorkPackageTemplateQueryArgs(organizationId)
  });

  return workPackageTemplate;
};

export const createTestProject = async (user: User, organizationId?: string): Promise<Project> => {
  if (!organizationId) organizationId = (await createTestOrganization().then((org) => org.organizationId)) as string;
  const car = await prisma.car.create({
    data: {
      wbsElement: {
        create: {
          carNumber: 0,
          projectNumber: 0,
          workPackageNumber: 0,
          dateCreated: new Date('01/01/2023'),
          name: 'Car',
          status: WBS_Element_Status.INACTIVE,
          leadId: user.userId,
          managerId: user.userId,
          organizationId
        }
      }
    }
  });

  const genesisProject = await prisma.project.create({
    data: {
      wbsElement: {
        create: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0,
          dateCreated: new Date('01/01/2023'),
          name: 'Genesis',
          status: WBS_Element_Status.INACTIVE,
          leadId: user.userId,
          managerId: user.userId,
          organizationId
        }
      },
      car: {
        connect: {
          carId: car.carId
        }
      },
      summary: 'Initial Car so that we can make change requests and projects and other stuff',
      budget: 1000
    }
  });

  return genesisProject;
};

export const createTestReimbursementRequest = async () => {
  const organization = await createTestOrganization();
  await createFinanceTeamAndLead(organization);
  const user = await prisma.user.findUnique({
    where: {
      googleAuthId: 'financeHead'
    },
    include: {
      userSettings: true,
      userSecureSettings: true
    }
  });

  if (!user || !user.userSecureSettings || !user.userSettings) throw new Error('Failed to find user');

  await createTestProject(user, organization.organizationId);

  const vendor = await ReimbursementRequestService.createVendor(user, 'Tesla', organization.organizationId);

  const accountCode = await ReimbursementRequestService.createAccountCode(
    user,
    'Equipment',
    123,
    true,
    [Club_Accounts.CASH, Club_Accounts.BUDGET],
    organization.organizationId
  );

  const rr = await ReimbursementRequestService.createReimbursementRequest(
    user,
    new Date(),
    vendor.vendorId,
    ClubAccount.CASH,
    [],
    [
      {
        name: 'GLUE',
        reason: {
          carNumber: 0,
          projectNumber: 0,
          workPackageNumber: 0
        },
        cost: 200000
      }
    ],
    accountCode.accountCodeId,
    100,
    organization.organizationId
  );

  if (!rr) throw new Error('Failed to create reimbursement request');

  return { rr, organization };
};

// DRAFT FOR DESIGN REVIEW UNMOCKED TEST
export const createTestDesignReview = async () => {
  const organization = await createTestOrganization();
  await createFinanceTeamAndLead(organization);
  const lead = await prisma.user.findUnique({
    where: {
      googleAuthId: 'financeLead'
    }
  });
  if (!lead) throw new Error('Failed to find user');
  const teamType = await TeamsService.createTeamType(lead, 'Team1', 'Software', organization.organizationId);
  const dr = await DesignReviewsService.createDesignReview(
    lead,
    '03/25/2024',
    teamType.teamTypeId,
    [lead.userId],
    [],
    {
      carNumber: 0,
      projectNumber: 1,
      workPackageNumber: 0
    },
    [],
    organization.organizationId
  );

  if (!dr) throw new Error('Failed to create design review');

  return { dr, organization };
};
