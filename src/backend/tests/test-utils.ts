import { Club_Accounts, Project, Reimbursement_Request, Role, User, WBS_Element_Status } from '@prisma/client';
import prisma from '../src/prisma/prisma';
import { dbSeedAllUsers } from '../src/prisma/seed-data/users.seed';
import TeamsService from '../src/services/teams.services';
import ReimbursementRequestService from '../src/services/reimbursement-requests.services';
import { ClubAccount } from 'shared';

interface CreateTestUserParams {
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  emailId?: string | null;
  googleAuthId: string;
  role: Role;
}

export const createTestUser = async ({
  firstName,
  lastName,
  email,
  emailId,
  googleAuthId,
  role
}: CreateTestUserParams): Promise<User> => {
  const createdUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      emailId,
      googleAuthId,
      role
    }
  });
  return createdUser;
};

export const resetUsers = async () => {
  await prisma.project.deleteMany();
  await prisma.work_Package.deleteMany();

  await prisma.teamType.deleteMany();
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
  await prisma.linkType.deleteMany();
  await prisma.work_Package_Template.deleteMany();
  await prisma.user_Settings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user_Secure_Settings.deleteMany();
  await prisma.user.deleteMany();
};

export const createFinanceTeamAndLead = async () => {
  const head = await prisma.user.create({
    data: dbSeedAllUsers.thomasEmrax
  });

  const lead = await prisma.user.create({
    data: dbSeedAllUsers.joeBlow
  });

  const financeMember = await prisma.user.create({
    data: dbSeedAllUsers.johnBoddy
  });

  const team = await TeamsService.createTeam(head, 'Finance Team', head.userId, 'Finance Team', '');
  setFinanceTeamId(team.teamId);

  await TeamsService.setTeamLeads(head, team.teamId, [lead.userId]);

  await TeamsService.setTeamMembers(head, team.teamId, [financeMember.userId]);
};

const setFinanceTeamId = (id: string) => {
  // Check if the last line matches the lineToAdd
  process.env['FINANCE_TEAM_ID'] = id;
};

const createTestProject = async (user: User): Promise<Project> => {
  const genesisProject = await prisma.project.create({
    data: {
      wbsElement: {
        create: {
          carNumber: 0,
          projectNumber: 0,
          workPackageNumber: 0,
          dateCreated: new Date('01/01/2023'),
          name: 'Genesis',
          status: WBS_Element_Status.INACTIVE,
          leadId: user.userId,
          managerId: user.userId
        }
      },
      summary: 'Initial Car so that we can make change requests and projects and other stuff',
      budget: 1000,
      rules: []
    }
  });

  return genesisProject;
};

export const createTestReimbursementRequest = async (): Promise<Reimbursement_Request | undefined> => {
  const user = await prisma.user.findUnique({
    where: {
      googleAuthId: '1'
    },
    include: {
      userSettings: true,
      userSecureSettings: true
    }
  });

  if (!user || !user.userSecureSettings || !user.userSettings) return undefined;

  await createTestProject(user);

  const vendor = await ReimbursementRequestService.createVendor(user, 'Tesla');

  const expenseType = await ReimbursementRequestService.createExpenseType(user, 'Equipment', 123, true, [
    Club_Accounts.CASH,
    Club_Accounts.BUDGET
  ]);

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
    expenseType.expenseTypeId,
    100
  );

  return rr;
};
