import {
  CreateSponsorTask,
  isAdmin,
  isHead,
  ReimbursementRequestData,
  SpendingBarData,
  Sponsor,
  SponsorTask,
  SponsorTier,
  wbsPipe,
  User
} from 'shared';
import { Organization, Sponsor_Task, Reimbursement_Status_Type, Sponsor_Value_Type } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils.js';
import {
  getSponsorQueryArgs,
  getSponsorTaskQueryArgs,
  getSponsorTierQueryArgs
} from '../prisma-query-args/sponsor.query.args.js';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import prisma from '../prisma/prisma.js';
import { sponsorTransformer } from '../transformers/finance.transformer.js';
import sponsorTaskTransformer from '../transformers/sponsor-task.transformer.js';
import {
  computeRRTotals,
  getProjectSegmentedWhereInput,
  getReimbursementRequestWhereInput
} from '../utils/finance.utils.js';
import { notifySponsorTaskAssignee } from '../utils/slack.utils.js';
import { isUserFinanceTeamOrHead } from '../utils/reimbursement-requests.utils.js';

export default class FinanceServices {
  /**
   * Creates a new sponsor for the given organization and assigns associated tasks.
   *
   * @param submitter The user submitting the request, who must have appropriate permissions to create a sponsor.
   * @param name The name of the sponsor.
   * @param activeStatus The status indicating whether the sponsor is active or not.
   * @param sponsorValue The financial value associated with the sponsor.
   * @param joinDate The date when the sponsor joins.
   * @param activeYears An array of years indicating the sponsor's active period.
   * @param sponsorTierId The ID of the sponsor's tier.
   * @param taxExempt Boolean indicating if the sponsor is tax-exempt.
   * @param discountCode The discount code associated with the sponsor.
   * @param sponsorNotes Additional notes about the sponsor.
   * @param contactName The name of the sponsor contact.
   * @param contactEmail The email of the sponsor contact.
   * @param contactPhone The phone of the sponsor contact.
   * @param contactPosition The position of the sponsor contact.
   * @param sponsorTasks An array of sponsor tasks associated with the sponsor.
   * @param organization The organization for which the sponsor is being created.
   *
   * @returns The created sponsor object, including associated tasks.
   *
   * @throws AccessDeniedAdminOnlyException If the submitter does not have permission to create a sponsor.
   */
  static async createSponsor(
    submitter: User,
    name: string,
    activeStatus: boolean,
    valueTypes: Sponsor_Value_Type[],
    joinDate: Date,
    activeYears: number[],
    sponsorTierId: string | undefined,
    taxExempt: boolean,
    contactName: string,
    sponsorTasks: CreateSponsorTask[],
    organization: Organization,
    sponsorValue?: number,
    discountCode?: string,
    sponsorNotes?: string,
    contactEmail?: string,
    contactPhone?: string,
    contactPosition?: string,
    stockDescription?: string,
    discountDescription?: string
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead)))
      throw new AccessDeniedException('Only heads can create a sponsor');

    if (!contactEmail && !contactPhone) {
      throw new HttpException(400, 'At least one of contact email or contact phone is required');
    }

    const existingSponsor = await prisma.sponsor.findFirst({
      where: {
        name,
        organizationId: organization.organizationId
      }
    });

    if (existingSponsor) {
      throw new HttpException(400, `A sponsor with the name "${name}" already exists.`);
    }

    const contact = await prisma.sponsor_Contact.create({
      data: { name: contactName, email: contactEmail, phone: contactPhone, position: contactPosition }
    });

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        activeStatus,
        valueTypes,
        sponsorValue,
        stockDescription,
        discountDescription,
        joinDate,
        activeYears,
        sponsorTierId,
        taxExempt,
        discountCode,
        sponsorNotes,
        contactId: contact.sponsorContactId,
        sponsorTasks: {
          create: sponsorTasks.map((task) => ({
            dueDate: task.dueDate,
            notifyDate: task.notifyDate,
            assigneeUserId: task.assigneeUserId,
            notes: task.notes
          }))
        },
        organizationId: organization.organizationId
      },
      ...getSponsorQueryArgs(organization.organizationId)
    });

    sponsorTasks.forEach(async (sponsorTask) => {
      if (!sponsorTask.assigneeUserId) return;

      const assignee = await prisma.user.findUnique({
        where: { userId: sponsorTask.assigneeUserId },
        include: { userSettings: true }
      });
      if (!assignee) return;

      await notifySponsorTaskAssignee(assignee, sponsorTask, sponsor.name);
    });

    return sponsorTransformer(sponsor);
  }

  /**
   * Returns all the sponsors in the database
   * @param organization The organization the user is currently in
   * @returns All the sponsors in the database
   */
  static async getAllSponsors(organization: Organization) {
    const allSponsors = await prisma.sponsor.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      ...getSponsorQueryArgs(organization.organizationId)
    });

    return allSponsors.map(sponsorTransformer);
  }

  /**
   * Soft deletes a given sponsor
   * @param sponsorId the id of the sponsor that is getting deleted
   * @param deleter the person deleting the sponsor
   * @param organization the organization the person deleting belongs to
   * @returns the deleted sponsor
   */
  static async deleteSponsor(sponsorId: string, deleter: User, organization: Organization): Promise<Sponsor> {
    const sponsor = await prisma.sponsor.findUnique({
      where: {
        sponsorId
      }
    });

    if (!(await userHasPermission(deleter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads can delete sponsors.');
    }

    if (!sponsor) throw new NotFoundException('Sponsor', sponsorId);
    if (sponsor.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Sponsor');
    if (sponsor.dateDeleted) throw new DeletedException('Sponsor', sponsorId);

    const deletedSponsor = await prisma.sponsor.update({
      where: { sponsorId },
      data: { dateDeleted: new Date() },
      ...getSponsorQueryArgs(organization.organizationId)
    });

    return sponsorTransformer(deletedSponsor);
  }

  /**
   * Creates a sponsor tier.
   * @param submitter current user creating the sponsor tier
   * @param name tier name
   * @param organization current organization of the current user
   * @param colorHexCode tier color
   * @param minSupportValue minimum support value for the tier
   * @returns newly created sponsor tier
   */
  static async createSponsorTier(
    submitter: User,
    name: string,
    organization: Organization,
    colorHexCode: string,
    minSupportValue: number
  ): Promise<SponsorTier> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead)))
      throw new AccessDeniedException('Only heads can create a sponsor tier');

    const sponsorTier = await prisma.sponsor_Tier.create({
      data: {
        name,
        organizationId: organization.organizationId,
        colorHexCode,
        minSupportValue
      },
      include: {
        organization: true
      }
    });

    return sponsorTier;
  }

  /**
   * Edits a sponsor task
   * @param submitter the user submitting
   * @param org the org of the submitter
   * @param sponsorTaskId the id of the sponsor task we are updating
   * @param dueDate the updated dueDate
   * @param notifyDate the updated notify date
   * @param assignee the updated assignee
   * @param notes the updated notes
   * @returns the updated sponsorTask
   */

  static async editSponsorTask(
    submitter: User,
    org: Organization,
    sponsorTaskId: string,
    dueDate: Date,
    notes: string,
    notifyDate?: Date,
    assigneeUserId?: string,
    done?: boolean
  ): Promise<Sponsor_Task> {
    if (!(await isUserFinanceTeamOrHead(submitter, org.organizationId))) {
      throw new AccessDeniedException('Only finance team members or heads can edit sponsor tasks');
    }

    const oldSponsorTask = await prisma.sponsor_Task.findFirst({
      where: {
        sponsorTaskId,
        OR: [
          { sponsor: { organizationId: org.organizationId } },
          { prospectiveSponsor: { organizationId: org.organizationId } }
        ]
      }
    });

    if (!oldSponsorTask) throw new NotFoundException('SponsorTask', sponsorTaskId);

    let assignee;

    if (assigneeUserId) {
      assignee = await prisma.user.findUnique({
        where: {
          userId: assigneeUserId,
          organizations: {
            some: {
              organizationId: org.organizationId
            }
          }
        },
        include: { userSettings: true }
      });

      if (!assignee) {
        throw new NotFoundException('User', assigneeUserId);
      }
    }

    const updatedSponsorTask = await prisma.sponsor_Task.update({
      where: { sponsorTaskId: oldSponsorTask.sponsorTaskId },
      data: {
        notifyDate,
        assigneeUserId,
        dueDate,
        notes,
        done: done ?? undefined
      }
    });

    if (assignee && oldSponsorTask.assigneeUserId !== assigneeUserId) {
      // Get sponsor or prospective sponsor name for notification
      let sponsorName: string | undefined;
      if (updatedSponsorTask.sponsorId) {
        const sponsor = await prisma.sponsor.findUnique({
          where: { sponsorId: updatedSponsorTask.sponsorId }
        });
        sponsorName = sponsor?.name;
      } else if (updatedSponsorTask.prospectiveSponsorId) {
        const prospectiveSponsor = await prisma.prospective_Sponsor.findUnique({
          where: { prospectiveSponsorId: updatedSponsorTask.prospectiveSponsorId }
        });
        sponsorName = prospectiveSponsor?.organizationName;
      }

      if (sponsorName && assignee) {
        await notifySponsorTaskAssignee(assignee, updatedSponsorTask, sponsorName);
      }
    }

    return updatedSponsorTask;
  }

  /*
   * Gets the sponsor tasks for the given sponsor Id
   * @param sponsorId the id of the sponsor these tasks are tied to
   * @param organizationId the organization the user is in
   * @returns all the sponsor tasks for the sponsor
   */
  static async getSponsorTasks(sponsorId: string, organizationId: string) {
    const sponsor = await prisma.sponsor.findUnique({
      where: { dateDeleted: null, sponsorId },
      ...getSponsorQueryArgs(organizationId)
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor', sponsorId);
    }

    const sponsorTasks = await prisma.sponsor_Task.findMany({
      where: {
        sponsorId,
        dateDeleted: null
      },
      ...getSponsorTaskQueryArgs(organizationId)
    });

    return sponsorTasks.map(sponsorTaskTransformer);
  }

  /**
   * Soft deletes the sponsor task with the given id.
   * @param sponsorTaskId id of the sponsor task to delete
   * @param deleter user submitting the delete request
   * @param organization current organization
   * @returns the deleted sponsor task
   */
  static async deleteSponsorTask(sponsorTaskId: string, deleter: User, organization: Organization) {
    const sponsorTask = await prisma.sponsor_Task.findUnique({
      where: { sponsorTaskId, dateDeleted: null }
    });

    if (!sponsorTask) throw new NotFoundException('SponsorTask', sponsorTaskId);

    const hasHeadPermission = await userHasPermission(deleter.userId, organization.organizationId, isHead);
    const isAssignee = sponsorTask.assigneeUserId === deleter.userId;

    // Heads can delete any task. Assignees can delete their own tasks.
    // Others cannot delete tasks (especially tasks assigned to someone else).
    if (!hasHeadPermission && !isAssignee) {
      throw new AccessDeniedException('Only heads or the task assignee can delete sponsor tasks');
    }

    const deletedSponsorTask = await prisma.sponsor_Task.update({
      where: { sponsorTaskId },
      data: { dateDeleted: new Date() }
    });

    return deletedSponsorTask;
  }

  /**
   * Creates a sponsor task for the given sponsorId.
   * @param submitter current user creating the sponsor task
   * @param organization current organization of the user
   * @param dueDate sponsor task's due date
   * @param notes notes for the sponsor task
   * @param sponsorId the sponsor associated with this sponsor task
   * @param notifyDate notification date for this sponsor tasks
   * @param assigneeUserId assignee of this sponsor task
   * @returns newly created sponsor task, and the given sponsor updated with this sponsor task added
   * @throws AccessDeniedAdminOnlyException if the user lacks permissions.
   * @throws NotFoundException if the sponsor or assignee is not found.
   * @throws DeletedException if the sponsor is marked as deleted.
   */
  static async createSponsorTask(
    submitter: User,
    organization: Organization,
    dueDate: Date,
    notes: string,
    sponsorId: string,
    notifyDate?: Date,
    assigneeUserId?: string,
    done?: boolean
  ): Promise<SponsorTask> {
    if (!(await isUserFinanceTeamOrHead(submitter, organization.organizationId))) {
      throw new AccessDeniedException('Only finance team members or heads can create a sponsor task');
    }

    const sponsor = await prisma.sponsor.findUnique({ where: { sponsorId, organizationId: organization.organizationId } });
    if (!sponsor) throw new NotFoundException('Sponsor', sponsorId);
    if (sponsor.dateDeleted) throw new DeletedException('Sponsor', sponsorId);

    if (assigneeUserId) {
      const assignee = await prisma.user.findUnique({ where: { userId: assigneeUserId } });
      if (!assignee) throw new NotFoundException('User', assigneeUserId);
    }

    const createdSponsorTask = await prisma.sponsor_Task.create({
      data: {
        dueDate,
        notifyDate,
        assignee: assigneeUserId ? { connect: { userId: assigneeUserId } } : undefined,
        notes,
        done: done ?? false,
        sponsor: { connect: { sponsorId } }
      },
      ...getSponsorTaskQueryArgs(organization.organizationId)
    });

    if (createdSponsorTask.assigneeUserId) {
      const assignee = await prisma.user.findUnique({
        where: { userId: createdSponsorTask.assigneeUserId },
        include: { userSettings: true }
      });
      if (!assignee) throw new NotFoundException('User', createdSponsorTask.assigneeUserId);

      await notifySponsorTaskAssignee(assignee, createdSponsorTask, sponsor.name);
    }

    return sponsorTaskTransformer(createdSponsorTask);
  }

  static async getReimbursementRequestProjectData(
    organization: Organization,
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReimbursementRequestData> {
    const { organizationId } = organization;
    const project = await prisma.project.findFirst({
      where: {
        projectId,
        wbsElement: {
          organizationId,
          dateDeleted: null
        }
      }
    });

    if (!project) throw new NotFoundException('Project', projectId);

    const reimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: {
        dateDeleted: null,
        reimbursementProducts: {
          some: {
            reimbursementProductReason: {
              wbsElement: {
                project: {
                  projectId
                }
              }
            }
          }
        },
        reimbursementStatuses: {
          none: {
            type: Reimbursement_Status_Type.DENIED
          }
        },
        ...getReimbursementRequestWhereInput(startDate, endDate)
      },
      select: {
        reimbursementStatuses: true,
        totalCost: true,
        reimbursementProducts: {
          where: {
            dateDeleted: null,
            reimbursementProductReason: {
              wbsElement: {
                project: {
                  projectId
                }
              }
            }
          },
          select: {
            cost: true
          }
        }
      }
    });

    const { approved, pendingApproval, addedToSabo, reimbursed } = computeRRTotals(reimbursementRequests);

    const totalBalance =
      reimbursementRequests.reduce((acc, curr) => {
        const projectProductsCost = curr.reimbursementProducts.reduce((prodAcc, prod) => prodAcc + prod.cost, 0);
        return acc + projectProductsCost;
      }, 0) / 100;

    const available = project.budget - totalBalance;

    const data: ReimbursementRequestData = {
      totalBudget: project.budget,
      approved,
      pendingApproval,
      addedToSabo,
      reimbursed,
      available
    };
    return data;
  }

  static async getReimbursementRequestTeamData(
    organization: Organization,
    teamId: string,
    startDate?: Date,
    endDate?: Date,
    carNumber?: number
  ): Promise<ReimbursementRequestData> {
    const { organizationId } = organization;
    const team = await prisma.team.findUnique({
      where: {
        organizationId,
        dateArchived: null,
        teamId
      },
      include: {
        projects: {
          ...getProjectSegmentedWhereInput(organizationId, startDate, endDate, carNumber),
          include: {
            wbsElement: true
          }
        }
      }
    });

    if (!team) throw new NotFoundException('Team', teamId);

    const reimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: {
        reimbursementProducts: {
          some: {
            reimbursementProductReason: {
              wbsElement: {
                project: {
                  teams: {
                    some: {
                      teamId
                    }
                  }
                }
              }
            }
          }
        },
        reimbursementStatuses: {
          none: {
            type: Reimbursement_Status_Type.DENIED
          }
        },
        ...getReimbursementRequestWhereInput(startDate, endDate, carNumber)
      },
      select: {
        reimbursementStatuses: true,
        totalCost: true,
        reimbursementProducts: {
          where: {
            dateDeleted: null,
            reimbursementProductReason: {
              wbsElement: {
                project: {
                  teams: {
                    some: {
                      teamId
                    }
                  }
                }
              }
            }
          },
          select: {
            cost: true
          }
        }
      }
    });

    const totalBudget = team.projects.reduce((acc, curr) => acc + curr.budget, 0);

    const { approved, pendingApproval, addedToSabo, reimbursed } = computeRRTotals(reimbursementRequests);

    const totalBalance =
      reimbursementRequests.reduce((acc, curr) => {
        const teamProductsCost = curr.reimbursementProducts.reduce((prodAcc, prod) => prodAcc + prod.cost, 0);
        return acc + teamProductsCost;
      }, 0) / 100;

    const available = totalBudget - totalBalance;

    const data: ReimbursementRequestData = {
      totalBudget,
      approved,
      pendingApproval,
      addedToSabo,
      reimbursed,
      available
    };
    return data;
  }

  static async getReimbursementRequestTeamTypeData(
    organization: Organization,
    teamTypeId: string,
    startDate?: Date,
    endDate?: Date,
    carNumber?: number
  ): Promise<ReimbursementRequestData> {
    const { organizationId } = organization;
    const division = await prisma.team_Type.findUnique({
      where: {
        organizationId,
        teamTypeId
      },
      include: {
        teams: {
          where: {
            dateArchived: null
          },
          include: {
            projects: {
              ...getProjectSegmentedWhereInput(organizationId, startDate, endDate, carNumber),
              include: {
                wbsElement: true
              }
            }
          }
        }
      }
    });

    if (!division) throw new NotFoundException('Team Type', teamTypeId);

    const projectsById = new Map<string, { budget: number }>();
    for (const team of division.teams) {
      for (const project of team.projects) {
        if (!projectsById.has(project.projectId)) {
          projectsById.set(project.projectId, { budget: project.budget });
        }
      }
    }
    const totalBudget = [...projectsById.values()].reduce((acc, p) => acc + p.budget, 0);
    const divisionProjectIds = [...projectsById.keys()];

    const reimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: {
        dateDeleted: null,
        reimbursementProducts: {
          some: {
            dateDeleted: null,
            reimbursementProductReason: {
              wbsElement: {
                project: {
                  projectId: { in: divisionProjectIds }
                }
              }
            }
          }
        },
        reimbursementStatuses: {
          none: {
            type: Reimbursement_Status_Type.DENIED
          }
        },
        ...getReimbursementRequestWhereInput(startDate, endDate, carNumber)
      },
      select: {
        reimbursementStatuses: true,
        totalCost: true,
        reimbursementProducts: {
          where: {
            dateDeleted: null,
            reimbursementProductReason: {
              wbsElement: {
                project: {
                  projectId: { in: divisionProjectIds }
                }
              }
            }
          },
          select: {
            cost: true
          }
        }
      }
    });

    const { approved, pendingApproval, addedToSabo, reimbursed } = computeRRTotals(reimbursementRequests);

    const totalBalance =
      reimbursementRequests.reduce((acc, curr) => {
        const teamProductsCost = curr.reimbursementProducts.reduce((prodAcc, prod) => prodAcc + prod.cost, 0);
        return acc + teamProductsCost;
      }, 0) / 100;

    const available = totalBudget - totalBalance;

    const data: ReimbursementRequestData = {
      totalBudget,
      approved,
      pendingApproval,
      addedToSabo,
      reimbursed,
      available
    };
    return data;
  }

  static async getSpendingBarTeamData(
    organization: Organization,
    teamId: string,
    startDate?: Date,
    endDate?: Date,
    carNumber?: number
  ): Promise<SpendingBarData> {
    const { organizationId } = organization;
    const team = await prisma.team.findUnique({
      where: {
        organizationId,
        dateArchived: null,
        teamId
      },
      include: {
        projects: {
          ...getProjectSegmentedWhereInput(organizationId, startDate, endDate, carNumber),
          include: {
            wbsElement: true
          }
        }
      }
    });

    if (!team) throw new NotFoundException('Team', teamId);

    const spendingInfoPromises = team.projects.map((project) =>
      this.getReimbursementRequestProjectData(organization, project.projectId, startDate, endDate)
    );

    const spendingInfos = await Promise.all(spendingInfoPromises);

    const data: SpendingBarData = {
      title: `${team.teamName}`,
      data: team.projects.map((project, index) => ({
        title: `${wbsPipe(project.wbsElement)} - ${project.wbsElement.name}`,
        spendingInfo: spendingInfos[index]
      }))
    };
    return data;
  }

  static async getSpendingBarTeamTypeData(
    organization: Organization,
    teamTypeId: string,
    startDate?: Date,
    endDate?: Date,
    carNumber?: number
  ): Promise<SpendingBarData[]> {
    const { organizationId } = organization;
    const division = await prisma.team_Type.findUnique({
      where: {
        organizationId,
        teamTypeId
      },
      include: {
        teams: {
          where: {
            dateArchived: null,
            teamTypeId
          },
          include: {
            projects: {
              ...getProjectSegmentedWhereInput(organizationId, startDate, endDate, carNumber),
              include: {
                wbsElement: true
              }
            }
          }
        }
      }
    });

    if (!division) throw new NotFoundException('Team Type', teamTypeId);

    const teamDataPromises = division.teams.map(async (team) => {
      const spendingInfoPromises = team.projects.map((project) =>
        this.getReimbursementRequestProjectData(organization, project.projectId, startDate, endDate)
      );
      const spendingInfos = await Promise.all(spendingInfoPromises);

      return {
        title: `${team.teamName}`,
        data: team.projects.map((project, index) => ({
          title: `${wbsPipe(project.wbsElement)} - ${project.wbsElement.name}`,
          spendingInfo: spendingInfos[index]
        }))
      };
    });

    const data: SpendingBarData[] = await Promise.all(teamDataPromises);

    return data;
  }

  static async getAllReimbursementRequestData(
    organization: Organization,
    startDate?: Date,
    endDate?: Date,
    carNumber?: number
  ): Promise<ReimbursementRequestData[]> {
    const { organizationId } = organization;
    const cashReimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: {
        dateDeleted: null,
        accountCode: { organizationId },
        indexCode: { organizationId, name: 'CASH', code: '830667' },
        reimbursementStatuses: {
          none: {
            type: Reimbursement_Status_Type.DENIED
          }
        },
        ...getReimbursementRequestWhereInput(startDate, endDate, carNumber)
      },
      select: {
        reimbursementStatuses: true,
        totalCost: true
      }
    });

    const budgetReimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: {
        dateDeleted: null,
        accountCode: { organizationId },
        indexCode: { organizationId, name: 'BUDGET', code: '800462' },
        reimbursementStatuses: {
          none: {
            type: Reimbursement_Status_Type.DENIED
          }
        },
        ...getReimbursementRequestWhereInput(startDate, endDate, carNumber)
      },
      select: {
        reimbursementStatuses: true,
        totalCost: true
      }
    });

    const allReimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: {
        dateDeleted: null,
        accountCode: { organizationId },
        indexCode: { organizationId },
        reimbursementStatuses: {
          none: {
            type: Reimbursement_Status_Type.DENIED
          }
        },
        ...getReimbursementRequestWhereInput(startDate, endDate, carNumber)
      },
      select: {
        reimbursementStatuses: true,
        totalCost: true
      }
    });

    const teams = await prisma.team.findMany({
      where: { dateArchived: null, organizationId },
      select: {
        projects: {
          where: {
            wbsElement: {
              ...(carNumber !== undefined && { carNumber }),
              dateCreated: {
                ...(startDate && {
                  gte: startDate
                }),
                ...(endDate && {
                  lte: endDate
                })
              }
            }
          }
        }
      }
    });

    // project budgets no longer double counted if in multiple teams
    const projectsById = new Map<string, { budget: number }>();
    for (const team of teams) {
      for (const project of team.projects) {
        if (!projectsById.has(project.projectId)) {
          projectsById.set(project.projectId, { budget: project.budget });
        }
      }
    }
    const allTotalBudget = [...projectsById.values()].reduce((acc, p) => acc + p.budget, 0);

    const cashTotalBudget =
      cashReimbursementRequests.reduce((reqAcc, rr) => {
        return reqAcc + rr.totalCost;
      }, 0) / 100;

    const budgetTotalBudget =
      budgetReimbursementRequests.reduce((reqAcc, rr) => {
        return reqAcc + rr.totalCost;
      }, 0) / 100;

    const {
      approved: allApproved,
      pendingApproval: allPendingApproval,
      addedToSabo: allAddedToSabo,
      reimbursed: allReimbursed
    } = computeRRTotals(allReimbursementRequests);

    const allTotalBalance = allReimbursementRequests.reduce((acc, curr) => acc + curr.totalCost, 0) / 100;

    const allAvailable = allTotalBudget - allTotalBalance;

    const {
      approved: cashApproved,
      pendingApproval: cashPendingApproval,
      addedToSabo: cashAddedToSabo,
      reimbursed: cashReimbursed
    } = computeRRTotals(cashReimbursementRequests);

    const cashTotalBalance = cashReimbursementRequests.reduce((acc, curr) => acc + curr.totalCost, 0) / 100;

    const cashAvailable = cashTotalBudget - cashTotalBalance;

    const {
      approved: budgetApproved,
      pendingApproval: budgetPendingApproval,
      addedToSabo: budgetAddedToSabo,
      reimbursed: budgetReimbursed
    } = computeRRTotals(budgetReimbursementRequests);

    const budgetTotalBalance = budgetReimbursementRequests.reduce((acc, curr) => acc + curr.totalCost, 0) / 100;

    const budgetAvailable = budgetTotalBudget - budgetTotalBalance;

    const allData: ReimbursementRequestData = {
      totalBudget: allTotalBudget,
      approved: allApproved,
      pendingApproval: allPendingApproval,
      addedToSabo: allAddedToSabo,
      reimbursed: allReimbursed,
      available: allAvailable
    };

    const cashData: ReimbursementRequestData = {
      totalBudget: cashTotalBudget,
      approved: cashApproved,
      pendingApproval: cashPendingApproval,
      addedToSabo: cashAddedToSabo,
      reimbursed: cashReimbursed,
      available: cashAvailable
    };

    const budgetData: ReimbursementRequestData = {
      totalBudget: budgetTotalBudget,
      approved: budgetApproved,
      pendingApproval: budgetPendingApproval,
      addedToSabo: budgetAddedToSabo,
      reimbursed: budgetReimbursed,
      available: budgetAvailable
    };

    const data: ReimbursementRequestData[] = [allData, budgetData, cashData];

    return data;
  }

  static async getReimbursementRequestCategoryData(
    otherReasonId: string,
    organization: Organization,
    startDate?: Date,
    endDate?: Date,
    carNumber?: number
  ): Promise<ReimbursementRequestData> {
    const { organizationId } = organization;

    //if a car is specified but not the date ranges, use the car to determine the date ranges
    if (carNumber !== undefined) {
      const car = await prisma.car.findFirst({
        where: {
          wbsElement: {
            carNumber
          }
        }
      });

      if (!car) {
        throw new HttpException(404, `Could not find car with car number: ${carNumber}`);
      }

      const nextCar = await prisma.car.findFirst({
        where: {
          wbsElement: {
            carNumber: carNumber + 1
          }
        }
      });

      //use latest of start date and car creation date for intersection
      if (!startDate || startDate.valueOf() < car.dateCreated.valueOf()) {
        startDate = car.dateCreated;
      }

      //use earliest of end date and next car creation date for intersection
      if (nextCar && (!endDate || endDate.valueOf() > nextCar.dateCreated.valueOf())) {
        endDate = nextCar.dateCreated;
      }
    }

    const reimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: {
        dateDeleted: null,
        accountCode: { organizationId },
        reimbursementStatuses: {
          none: {
            type: Reimbursement_Status_Type.DENIED
          }
        },
        reimbursementProducts: {
          some: {
            reimbursementProductReason: {
              otherReasonId
            }
          }
        },
        ...getReimbursementRequestWhereInput(startDate, endDate)
      },
      select: {
        reimbursementStatuses: true,
        totalCost: true,
        reimbursementProducts: {
          where: {
            dateDeleted: null,
            reimbursementProductReason: {
              otherReasonId
            }
          },
          select: {
            cost: true
          }
        }
      }
    });

    const category = await prisma.reimbursement_Product_Other_Reason.findUnique({
      where: {
        otherReimbursementProductReasonId: otherReasonId
      }
    });

    if (!category) throw new NotFoundException('Reimbursement Product Other Reason', otherReasonId);

    const totalBudget = category.budget;

    const { approved, pendingApproval, addedToSabo, reimbursed } = computeRRTotals(reimbursementRequests);

    const totalBalance =
      reimbursementRequests.reduce((acc, curr) => {
        const categoryProductsCost = curr.reimbursementProducts.reduce((prodAcc, prod) => prodAcc + prod.cost, 0);
        return acc + categoryProductsCost;
      }, 0) / 100;

    const available = totalBudget - totalBalance;

    const data: ReimbursementRequestData = {
      totalBudget,
      approved,
      pendingApproval,
      addedToSabo,
      reimbursed,
      available
    };

    return data;
  }

  static async getAllSpendingBarData(
    organization: Organization,
    startDate?: Date,
    endDate?: Date,
    carNumber?: number
  ): Promise<SpendingBarData[]> {
    const { organizationId } = organization;
    const teams = await prisma.team.findMany({
      where: {
        organizationId,
        dateArchived: null
      },
      include: {
        projects: {
          ...getProjectSegmentedWhereInput(organizationId, startDate, endDate, carNumber),
          include: {
            wbsElement: true
          }
        }
      }
    });

    const teamDataPromises = teams.map(async (team) => {
      const spendingInfoPromises = team.projects.map((project) =>
        this.getReimbursementRequestProjectData(organization, project.projectId, startDate, endDate)
      );
      const spendingInfos = await Promise.all(spendingInfoPromises);

      return {
        title: `${team.teamName}`,
        data: team.projects.map((project, index) => ({
          title: `${wbsPipe(project.wbsElement)} - ${project.wbsElement.name}`,
          spendingInfo: spendingInfos[index]
        }))
      };
    });

    const data: SpendingBarData[] = await Promise.all(teamDataPromises);

    return data;
  }

  static async getSpendingBarCategoryData(
    organization: Organization,
    startDate?: Date,
    endDate?: Date,
    carNumber?: number
  ): Promise<SpendingBarData> {
    const { organizationId } = organization;
    const otherReasons = await prisma.reimbursement_Product_Other_Reason.findMany({
      where: {
        dateDeleted: null,
        indexCode: {
          organizationId
        }
      }
    });

    const spendingInfoPromises = otherReasons.map((r) =>
      this.getReimbursementRequestCategoryData(
        r.otherReimbursementProductReasonId,
        organization,
        startDate,
        endDate,
        carNumber
      )
    );
    const spendingInfos = await Promise.all(spendingInfoPromises);

    const data: SpendingBarData = {
      title: `Club Categories`,
      data: otherReasons.map((r, index) => ({
        title: r.name,
        spendingInfo: spendingInfos[index]
      }))
    };

    return data;
  }

  /**
   * Edits a sponsor.
   * @param submitter The user submitting the request, who must have appropriate permissions to create a sponsor.
   * @param sponsorId the id of the sponsor to be edited
   * @param name The name of the sponsor.
   * @param activeStatus The status indicating whether the sponsor is active or not.
   * @param sponsorValue The financial value associated with the sponsor.
   * @param joinDate The date when the sponsor joins.
   * @param activeYears An array of years indicating the sponsor's active period.
   * @param sponsorTierId The ID of the sponsor's tier.
   * @param taxExempt Boolean indicating if the sponsor is tax-exempt.
   * @param discountCode The discount code associated with the sponsor.
   * @param sponsorNotes Additional notes about the sponsor.
   * @param contactName The name of the sponsor contact.
   * @param contactEmail The email of the sponsor contact.
   * @param contactPhone The phone of the sponsor contact.
   * @param contactPosition The position of the sponsor contact.
   * @param sponsorTasks An array of sponsor tasks associated with the sponsor.
   * @param organization The organization for which the sponsor is being edited.
   * @returns the edited sponsor.
   */

  static async editSponsor(
    submitter: User,
    organization: Organization,
    sponsorId: string,
    name: string,
    activeStatus: boolean,
    valueTypes: Sponsor_Value_Type[],
    joinDate: Date,
    activeYears: number[],
    sponsorTierId: string | undefined,
    contactName: string,
    taxExempt: boolean,
    sponsorTasks: CreateSponsorTask[],
    sponsorValue?: number,
    discountCode?: string,
    sponsorNotes?: string,
    contactEmail?: string,
    contactPhone?: string,
    contactPosition?: string,
    stockDescription?: string,
    discountDescription?: string
  ): Promise<Sponsor> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead)))
      throw new AccessDeniedException('Only heads can edit sponsors.');

    if (!contactEmail && !contactPhone) {
      throw new HttpException(400, 'At least one of contact email or contact phone is required');
    }

    const oldSponsor = await prisma.sponsor.findUnique({
      where: {
        sponsorId,
        organizationId: organization.organizationId
      },
      include: {
        sponsorTasks: true
      }
    });

    if (!oldSponsor) throw new NotFoundException('Sponsor', sponsorId);

    // Determine which tasks to update, create, or delete
    const incomingTaskIds = new Set(sponsorTasks.filter((t) => t.sponsorTaskId).map((t) => t.sponsorTaskId!));
    const tasksToDelete = oldSponsor.sponsorTasks.filter((t) => !incomingTaskIds.has(t.sponsorTaskId));
    const tasksToUpdate = sponsorTasks.filter((t) => t.sponsorTaskId);
    const tasksToCreate = sponsorTasks.filter((t) => !t.sponsorTaskId);

    // Delete removed tasks
    if (tasksToDelete.length > 0) {
      await prisma.sponsor_Task.deleteMany({
        where: { sponsorTaskId: { in: tasksToDelete.map((t) => t.sponsorTaskId) } }
      });
    }

    // Update existing tasks
    await Promise.all(
      tasksToUpdate.map((t) =>
        prisma.sponsor_Task.update({
          where: { sponsorTaskId: t.sponsorTaskId! },
          data: {
            dueDate: t.dueDate,
            notifyDate: t.notifyDate,
            assigneeUserId: t.assigneeUserId || null,
            notes: t.notes,
            done: t.done ?? false
          }
        })
      )
    );

    // Create new tasks
    await Promise.all(
      tasksToCreate.map((t) =>
        this.createSponsorTask(
          submitter,
          organization,
          t.dueDate,
          t.notes,
          sponsorId,
          t.notifyDate,
          t.assigneeUserId,
          t.done
        )
      )
    );

    if (sponsorTierId) {
      const tier = await prisma.sponsor_Tier.findUnique({
        where: {
          sponsorTierId,
          organizationId: organization.organizationId
        }
      });

      if (!tier) throw new NotFoundException('Sponsor Tier', sponsorTierId);
    }

    if (name !== oldSponsor.name) {
      const existingSponsor = await prisma.sponsor.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          },
          organizationId: organization.organizationId
        }
      });

      if (existingSponsor) {
        throw new HttpException(400, `A sponsor with the name "${name}" already exists.`);
      }
    }

    await prisma.sponsor_Contact.update({
      where: { sponsorContactId: oldSponsor.contactId },
      data: { name: contactName, email: contactEmail, phone: contactPhone, position: contactPosition }
    });

    const updatedSponsor = await prisma.sponsor.update({
      where: { sponsorId: oldSponsor.sponsorId },
      data: {
        name,
        activeStatus,
        valueTypes,
        sponsorValue,
        stockDescription,
        discountDescription,
        joinDate,
        activeYears,
        tier: sponsorTierId ? { connect: { sponsorTierId } } : { disconnect: true },
        taxExempt,
        discountCode,
        sponsorNotes
      },
      ...getSponsorQueryArgs(organization.organizationId)
    });

    return sponsorTransformer(updatedSponsor);
  }

  /**
   * Toggles the done status of a sponsor task
   * @param submitter The user toggling the task
   * @param organization The organization the task belongs to
   * @param sponsorTaskId The id of the sponsor task to toggle
   * @returns The updated sponsor task
   */
  static async toggleSponsorTaskDone(
    submitter: User,
    organization: Organization,
    sponsorTaskId: string
  ): Promise<SponsorTask> {
    const sponsorTask = await prisma.sponsor_Task.findFirst({
      where: {
        sponsorTaskId,
        dateDeleted: null,
        OR: [
          { sponsor: { organizationId: organization.organizationId } },
          { prospectiveSponsor: { organizationId: organization.organizationId } }
        ]
      },
      ...getSponsorTaskQueryArgs(organization.organizationId)
    });

    if (!sponsorTask) throw new NotFoundException('SponsorTask', sponsorTaskId);

    // Allow finance team, heads, or the task assignee to toggle done status
    const isAssignee = sponsorTask.assigneeUserId === submitter.userId;
    const isFinanceOrHead = await isUserFinanceTeamOrHead(submitter, organization.organizationId);

    if (!isAssignee && !isFinanceOrHead) {
      throw new AccessDeniedException('Only finance team members, heads, or the task assignee can toggle task status');
    }

    const updatedSponsorTask = await prisma.sponsor_Task.update({
      where: { sponsorTaskId },
      data: { done: !sponsorTask.done },
      ...getSponsorTaskQueryArgs(organization.organizationId)
    });

    return sponsorTaskTransformer(updatedSponsorTask);
  }

  /**
   * Gets all sponsor tiers
   * @param organization organization sponsor tiers belong to
   * @returns all sponsor tiers
   */
  static async getAllSponsorTiers(organization: Organization): Promise<SponsorTier[]> {
    const allSponsorTiers = await prisma.sponsor_Tier.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      orderBy: { minSupportValue: 'asc' },
      ...getSponsorTierQueryArgs(organization.organizationId)
    });

    return allSponsorTiers;
  }

  /**
   * Soft deletes a given sponsor tier
   * @param sponsorTierId the id of the sponsor tier that is getting deleted
   * @param deleter the person deleting the sponsor tier
   * @param organization the organization the person deleting belongs to
   * @returns the deleted sponsor tier
   */
  static async deleteSponsorTier(sponsorTierId: string, deleter: User, organization: Organization): Promise<SponsorTier> {
    const sponsorTier = await prisma.sponsor_Tier.findUnique({
      where: { sponsorTierId }
    });

    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete a sponsor tier');
    }

    if (!sponsorTier) throw new NotFoundException('Sponsor Tier', sponsorTierId);
    if (sponsorTier.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Sponsor Tier');
    if (sponsorTier.dateDeleted) throw new DeletedException('Sponsor Tier', sponsorTierId);

    const associatedSponsors = await prisma.sponsor.count({
      where: { sponsorTierId: sponsorTier.sponsorTierId, dateDeleted: null }
    });

    if (associatedSponsors > 0) {
      throw new HttpException(
        400,
        `Cannot delete Sponsor Tier "${sponsorTier.name}" because it is associated with existing sponsors.`
      );
    }

    const deletedSponsorTier = await prisma.sponsor_Tier.update({
      where: { sponsorTierId },
      data: { dateDeleted: new Date(), deleter: { connect: { userId: deleter.userId } } },
      ...getSponsorTierQueryArgs(organization.organizationId)
    });

    return deletedSponsorTier;
  }

  /**
   * Edits a sponsor tier.
   * @param submitter current user editing the sponsor tier
   * @param organization current organization of the current user
   * @param sponsorTierId id of the sponsor tier to be edited
   * @param name updated tier name
   * @param colorHexCode updated tier color
   * @param minSupportValue updated minimum support value for the tier
   * @returns the updated sponsor tier
   * @throws AccessDeniedAdminOnlyException if the user lacks permissions.
   * @throws NotFoundException if the sponsor tier is not found.
   */
  static async editSponsorTier(
    submitter: User,
    organization: Organization,
    sponsorTierId: string,
    name: string,
    colorHexCode: string,
    minSupportValue: number
  ): Promise<SponsorTier> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('edit a sponsor tier');

    const oldSponsorTier = await prisma.sponsor_Tier.findUnique({
      where: {
        sponsorTierId,
        organizationId: organization.organizationId
      }
    });

    if (!oldSponsorTier) throw new NotFoundException('Sponsor Tier', sponsorTierId);
    if (oldSponsorTier.dateDeleted) throw new DeletedException('Sponsor Tier', sponsorTierId);

    const updatedSponsorTier = await prisma.sponsor_Tier.update({
      where: { sponsorTierId: oldSponsorTier.sponsorTierId },
      data: {
        name,
        colorHexCode,
        minSupportValue
      },
      ...getSponsorTierQueryArgs(organization.organizationId)
    });

    return updatedSponsorTier;
  }
}
