/* eslint-disable prefer-destructuring */
import {
  Club_Accounts,
  Organization,
  Project,
  Schedule_Settings,
  Task_Priority,
  Task_Status,
  User,
  User_Secure_Settings,
  User_Settings,
  WBS_Element_Status
} from '@prisma/client';
import prisma from '../src/prisma/prisma';
import { dbSeedAllUsers } from '../src/prisma/seed-data/users.seed';
import TeamsService from '../src/services/teams.services';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import { ClubAccount, Permission, RoleEnum } from 'shared';
import {
  batmanAppAdmin,
  batmanScheduleSettings,
  batmanSecureSettings,
  batmanSettings,
  supermanAdmin
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
  permissions?: string[];
}

export const createTestUser = async (
  { firstName, lastName, email, emailId, googleAuthId, role, permissions }: CreateTestUserParams,
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
      },
      additionalPermissions: permissions
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
  await prisma.frequentlyAskedQuestion.deleteMany();
  await prisma.work_Package.deleteMany();
  await prisma.project.deleteMany();
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
  await prisma.design_Review.deleteMany();
  await prisma.team_Type.deleteMany();
  await prisma.wBS_Element.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.frequentlyAskedQuestion.deleteMany();
  await prisma.graph.deleteMany();
  await prisma.graph_Collection.deleteMany();
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
    {
      ...dbSeedAllUsers.aang,
      googleAuthId: 'financeLead',
      role: RoleEnum.LEADERSHIP,
      permissions: dbSeedAllUsers.aang.additionalPermissions as Permission[]
    },
    organization.organizationId
  );

  const financeMember = await createTestUser(
    {
      ...dbSeedAllUsers.johnBoddy,
      googleAuthId: 'financeMember',
      role: RoleEnum.MEMBER,
      permissions: dbSeedAllUsers.aang.additionalPermissions as Permission[]
    },
    organization.organizationId
  );

  const team = await TeamsService.createTeam(head, 'Finance Team', head.userId, 'Finance Team', '', true, organization);

  await TeamsService.setTeamLeads(head, team.teamId, [lead.userId], organization);

  await TeamsService.setTeamMembers(head, team.teamId, [financeMember.userId], organization);
};

export const createTestFAQ = async (orgId: string, faqId: string) => {
  const user = await prisma.user.create({
    data: {
      firstName: 'ADMIN',
      lastName: 'FAQ',
      email: 'FAQCREATOR@gmail.com',
      googleAuthId: 'FAQCREATOR'
    }
  });

  return await prisma.frequentlyAskedQuestion.create({
    data: {
      faqId,
      question: 'Joe mama',
      answer: 'Joe mama`s organization',
      userCreated: {
        connect: {
          userId: user.userId
        }
      },
      organization: {
        connect: {
          organizationId: orgId
        }
      }
    }
  });
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
      description: 'Joe mama`s organization',
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

export const createTestFaq = async (user: User, organizationId: string) => {
  if (!organizationId) organizationId = await createTestOrganization().then((org) => org.organizationId);
  if (!organizationId) throw new Error('Failed to create organization');

  const faq = await prisma.frequentlyAskedQuestion.create({
    data: {
      question: 'Who is Chief Software Engineer of NER?',
      answer: 'Peyton McKee!',
      organizationId,
      userCreatedId: user.userId
    }
  });
  return faq;
};

export const createTestMilestone = async (user: User, organizationId: string) => {
  if (!organizationId) organizationId = await createTestOrganization().then((org) => org.organizationId);
  if (!organizationId) throw new Error('Failed to create organization');

  const milestone = await prisma.milestone.create({
    data: {
      name: 'Milestone 1',
      description: 'Description',
      dateOfEvent: new Date('03/03/2024'),
      organizationId,
      userCreatedId: user.userId
    }
  });
  return milestone;
};

export const createTestLinkType = async (user: User, organizationId?: string) => {
  if (!organizationId) organizationId = await createTestOrganization().then((org) => org.organizationId);
  if (!organizationId) throw new Error('Failed to create organization');

  const linkType = await prisma.link_Type.create({
    data: {
      name: 'Link type 1',
      dateCreated: new Date('03/25/2024'),
      iconName: 'youtube icon',
      required: true,
      creatorId: user.userId,
      organizationId
    }
  });

  return linkType;
};

export const createTestCar = async (orgId?: string, userIdentification?: string) => {
  if (!orgId) orgId = (await createTestOrganization()).organizationId;
  if (!userIdentification) userIdentification = (await createTestUser(supermanAdmin, orgId)).userId;

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
          leadId: userIdentification,
          managerId: userIdentification,
          organizationId: orgId
        }
      }
    }
  });

  return car;
};

export const createTestProject = async (
  user: User,
  organizationId?: string,
  teamId?: string,
  carId?: string,
  projectNumber: number = 1,
  dateDeleted?: Date
): Promise<Project> => {
  if (!organizationId) organizationId = (await createTestOrganization()).organizationId as string;
  if (!carId) carId = (await createTestCar(organizationId, user.userId)).carId;

  const genesisProject = await prisma.project.create({
    data: {
      wbsElement: {
        create: {
          carNumber: 0,
          projectNumber,
          workPackageNumber: 0,
          dateCreated: new Date('01/01/2023'),
          name: 'Genesis',
          status: WBS_Element_Status.INACTIVE,
          leadId: user.userId,
          managerId: user.userId,
          organizationId,
          dateDeleted: dateDeleted ?? null
        }
      },
      car: {
        connect: {
          carId
        }
      },
      summary: 'Initial Car so that we can make change requests and projects and other stuff',
      budget: 1000
    }
  });

  if (teamId) {
    await prisma.project.update({
      where: {
        projectId: genesisProject.projectId
      },
      data: {
        teams: {
          connect: {
            teamId
          }
        }
      }
    });
  }

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

  const project = await createTestProject(user, organization.organizationId);

  const vendor = await ReimbursementRequestService.createVendor(user, 'Tesla', organization);

  const accountCode = await ReimbursementRequestService.createAccountCode(
    user,
    'Equipment',
    123,
    true,
    [Club_Accounts.CASH, Club_Accounts.BUDGET],
    organization
  );

  const rr = await ReimbursementRequestService.createReimbursementRequest(
    user,
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
    organization,
    new Date()
  );

  if (!rr) throw new Error('Failed to create reimbursement request');

  return { rr, organization, vendor, accountCode, project, user };
};

// Always creates a new design review
export const createTestDesignReview = async () => {
  const organization = await createTestOrganization();
  const head = await createTestUser(
    { ...batmanAppAdmin, googleAuthId: 'financeHead', role: RoleEnum.APP_ADMIN },
    organization.organizationId
  );
  const lead = await createTestUser(
    {
      ...dbSeedAllUsers.aang,
      googleAuthId: 'financeLead',
      role: RoleEnum.LEADERSHIP,
      permissions: dbSeedAllUsers.aang.additionalPermissions as Permission[]
    },
    organization.organizationId
  );
  if (!head) throw new Error('Failed to find user');
  if (!lead) throw new Error('Failed to find user');
  await createTestProject(head, organization.organizationId);

  const teamType = await TeamsService.createTeamType(head, 'Team1', 'Software', 'Software team', organization);

  const { designReviewId } = await DesignReviewsService.createDesignReview(
    lead,
    '03/25/2027',
    teamType.teamTypeId,
    [lead.userId],
    [],
    {
      carNumber: 0,
      projectNumber: 0,
      workPackageNumber: 0
    },
    [0, 1],
    organization
  );

  const dr = await prisma.design_Review.findUnique({
    where: {
      designReviewId
    },
    include: {
      userCreated: true
    }
  });

  if (!dr) throw new Error('Failed to create design review');

  const orgId = organization.organizationId;
  return { dr, organization, orgId };
};

export const createTestTeamType = async (organizationId?: string) => {
  let orgId = organizationId;
  if (!organizationId) {
    orgId = (await createTestOrganization()).organizationId;
  }

  return await prisma.team_Type.create({
    data: {
      name: 'aTeam',
      description: 'aDescription',
      iconName: 'gear',
      organizationId: orgId!
    }
  });
};

export const createTestTeam = async (headId?: string, divId?: string, orgId?: string) => {
  if (!divId) {
    const division = await createTestTeamType(orgId);
    divId = division.teamTypeId;
    orgId = division.organizationId;
  } else if (!orgId) {
    orgId = (await createTestOrganization()).organizationId;
  }

  if (!headId) {
    headId = (await createTestUser(supermanAdmin, orgId)).userId;
  }

  const team = await prisma.team.create({
    data: {
      teamName: 'aTeamName',
      slackId: 'aSlackId',
      description: 'aDescription',
      financeTeam: false,
      headId: headId!,
      teamTypeId: divId,
      organizationId: orgId
    }
  });

  return team;
};

export const createTestTask = async (
  user: User,
  title: string,
  notes: string,
  assignees: User[],
  priority: Task_Priority,
  status: Task_Status,
  organizationId?: string,
  deadline?: Date
) => {
  if (!organizationId) organizationId = (await createTestOrganization().then((org) => org.organizationId)) as string;
  const task = await prisma.task.create({
    data: {
      taskId: '0000000001',
      title,
      notes,
      deadline,
      assignees: {
        connect: assignees.map((user) => ({ userId: user.userId }))
      },
      priority,
      status,
      dateCreated: new Date(),
      createdBy: {
        connect: { userId: user.userId }
      },
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
  return task;
};
