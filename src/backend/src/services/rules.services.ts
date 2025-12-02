import { Organization, Rule, Rule_Completion } from '@prisma/client';
import { isAdmin, isLeadership, ProjectRule, RulesetType, notGuest, RulesetPreview, User, Rule as SharedRule } from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedGuestException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import {
  getProjectRuleQueryArgs,
  getRulesetQueryArgs,
  getRulesetPreviewQueryArgs,
  getRulePreviewQueryArgs
} from '../prisma-query-args/rules.query-args';
import {
  ruleTransformer,
  projectRuleTransformer,
  rulesetTransformer,
  rulesetTypeTransformer,
  rulesetPreviewTransformer
} from '../transformers/rules.transformer';

export default class RulesService {
  /**
   * Creates a new rule in the database
   *
   * @param user The user creating the rule, must be a member or above
   * @param ruleCode The unique code identifier for the rule (e.g., "T.1.1.1")
   * @param ruleContent The text content of the rule
   * @param rulesetId The ID of the ruleset this rule belongs to
   * @param organization The organization the rule belongs to
   * @param parentRuleId Optional ID of the parent rule if this is a sub-rule
   * @param referencedRuleIds Optional array of rule IDs that this rule references
   * @param imageFileIds Optional array of Google Drive file IDs for images
   * @returns The created rule
   */
  static async createRule(
    user: User,
    ruleCode: string,
    ruleContent: string,
    rulesetId: string,
    organization: Organization,
    parentRuleId?: string,
    referencedRuleIds: string[] = [],
    imageFileIds: string[] = []
  ) {
    // Check user has permission (members and above)
    if (!(await userHasPermission(user.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedException('Only members and above can create rules');
    }

    // Verify ruleset exists and belongs to organization
    const ruleset = await prisma.ruleset.findUnique({
      where: { rulesetId },
      include: {
        car: {
          include: {
            wbsElement: true
          }
        }
      }
    });

    if (!ruleset) {
      throw new NotFoundException('Ruleset', rulesetId);
    }

    if (ruleset.deletedByUserId) {
      throw new DeletedException('Ruleset', rulesetId);
    }

    if (ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new AccessDeniedException('Cannot create rule in a ruleset from another organization');
    }

    // Check for duplicate rule code within the same ruleset
    const existingRule = await prisma.rule.findUnique({
      where: {
        rulesetId_ruleCode: {
          rulesetId,
          ruleCode
        }
      }
    });

    if (existingRule) {
      throw new HttpException(400, `Rule with code ${ruleCode} already exists in this ruleset`);
    }

    // Verify parent rule exists if provided
    if (parentRuleId) {
      const parentRule = await prisma.rule.findUnique({
        where: { ruleId: parentRuleId }
      });

      if (!parentRule) {
        throw new NotFoundException('Parent Rule', parentRuleId);
      }

      if (parentRule.dateDeleted) {
        throw new DeletedException('Parent Rule', parentRuleId);
      }

      if (parentRule.rulesetId !== rulesetId) {
        throw new HttpException(400, 'Parent rule must be in the same ruleset');
      }
    }

    // Verify referenced rules exist
    if (referencedRuleIds.length > 0) {
      const referencedRules = await prisma.rule.findMany({
        where: {
          ruleId: { in: referencedRuleIds }
        }
      });

      if (referencedRules.length !== referencedRuleIds.length) {
        throw new NotFoundException('Referenced Rule', 'provided IDs');
      }

      const deletedReferencedRule = referencedRules.find((rule) => rule.dateDeleted !== null);
      if (deletedReferencedRule) {
        throw new DeletedException('Referenced Rule', deletedReferencedRule.ruleId);
      }
    }

    // Create the rule
    const rule = await prisma.rule.create({
      data: {
        ruleCode,
        ruleContent,
        imageFileIds,
        ruleset: { connect: { rulesetId } },
        createdBy: { connect: { userId: user.userId } },
        ...(parentRuleId && { parentRule: { connect: { ruleId: parentRuleId } } }),
        ...(referencedRuleIds.length > 0 && {
          referencedRule: {
            connect: referencedRuleIds.map((id) => ({ ruleId: id }))
          }
        })
      },
      ...getRulePreviewQueryArgs()
    });

    return ruleTransformer(rule);
  }

  /**
   * Creates new ruleset type with the given information
   * @param submitter a user who is making this request
   * @param name the name of the ruleset type
   * @param organizationId the organization ID for permission check
   * @returns A newly created ruleset type
   */
  static async createRulesetType(submitter: User, name: string, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership)))
      throw new AccessDeniedException('only leadership and above can create ruleset types!');

    const rulesetType = await prisma.ruleset_Type.create({
      data: {
        name,
        createdByUserId: submitter.userId,
        organizationId: organization.organizationId
      }
    });

    return rulesetType;
  }

  /**
   * Deletes a rule
   * @param ruleId id of a rule to be deleted
   * @param deleter user deleting the rule
   * @param org the org of the user deleting the rule
   * @returns the deleted rule
   */
  static async deleteRule(ruleId: string, deleter: User, org: Organization): Promise<Rule> {
    const rule = await prisma.rule.findUnique({
      where: { ruleId },
      include: {
        ruleset: {
          include: {
            car: {
              include: {
                wbsElement: true
              }
            }
          }
        }
      }
    });

    if (!(await userHasPermission(deleter.userId, org.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete rules');
    }

    if (!rule) throw new NotFoundException('Rule', ruleId);
    if (rule.dateDeleted) throw new DeletedException('Rule', ruleId);

    if (rule.ruleset?.car?.wbsElement?.organizationId !== org.organizationId) throw new InvalidOrganizationException('Rule');

    await prisma.$transaction(async (tx) => {
      const deleteParentChildReferencing = async (currRuleId: string): Promise<void> => {
        const referencingRules = await tx.rule.findMany({
          where: {
            referencedRule: {
              some: { ruleId: currRuleId }
            },
            dateDeleted: null
          },
          select: { ruleId: true }
        });

        for (const referencingRule of referencingRules) {
          await tx.rule.update({
            where: { ruleId: referencingRule.ruleId },
            data: {
              referencedRule: {
                disconnect: { ruleId: currRuleId }
              }
            }
          });
        }

        const childRules = await tx.rule.findMany({
          where: {
            parentRuleId: currRuleId,
            dateDeleted: null
          }
        });
        for (const childRule of childRules) {
          await deleteParentChildReferencing(childRule.ruleId);
        }

        await tx.rule.update({
          where: { ruleId: currRuleId },
          data: {
            dateDeleted: new Date(),
            deletedByUserId: deleter.userId
          }
        });
      };

      await deleteParentChildReferencing(ruleId);
    });

    const deletedRule = await prisma.rule.findUnique({
      where: { ruleId }
    });

    return deletedRule!;
  }

  /**
   * Add a preexisting rule to a specific project
   *
   * @param submitter The user creating the project rule
   * @param organization The organization the project rule is being created in
   * @param ruleId The rule ID being added to the project
   * @param projectId The project ID to add the rule to
   * @returns The created project rule
   */
  static async createProjectRule(
    submitter: User,
    organization: Organization,
    ruleId: string,
    projectId: string
  ): Promise<ProjectRule> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('You do not have permissions to assign rules to projects');
    }

    const rule = await prisma.rule.findUnique({
      where: { ruleId },
      include: {
        subRules: true,
        ruleset: { select: { car: { include: { wbsElement: { select: { organizationId: true } } } } } }
      }
    });

    if (!rule) {
      throw new NotFoundException('Rule', ruleId);
    }
    if (rule.ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Rule');
    }

    if (rule.dateDeleted) throw new DeletedException('Rule', ruleId);

    const project = await prisma.project.findUnique({
      where: { projectId },
      include: { wbsElement: true }
    });

    if (!project) {
      throw new NotFoundException('Project', projectId);
    }
    if (project.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Project');
    }

    if (project.wbsElement.dateDeleted) throw new DeletedException('Project', projectId);

    // Checks if this rule was already assigned to this project
    const existingProjectRule = await prisma.project_Rule.findUnique({
      where: { ruleId_projectId: { ruleId, projectId } }
    });

    if (existingProjectRule) {
      throw new HttpException(400, 'This rule is already associated with the project');
    }

    const projectRule = await prisma.project_Rule.create({
      data: {
        ruleId,
        projectId,
        currentStatus: Rule_Completion.REVIEW,
        createdByUserId: submitter.userId
      },
      ...getProjectRuleQueryArgs()
    });

    return projectRuleTransformer(projectRule);
  }

  /**
   * Given a ruleset id, retrieves the ruleset and throws errors if
   * it does not exist or is already deleted
   * @param rulesetId the id of the ruleset
   * @param organizationId the id of the organization the ruleset is being deleted in
   * @returns the ruleset with query args
   */
  static async getRulesetWithQueryArgs(rulesetId: string, organizationId: string) {
    const ruleset = await prisma.ruleset.findUnique({
      where: { rulesetId },
      ...getRulesetQueryArgs(organizationId)
    });

    if (!ruleset) throw new NotFoundException('Ruleset', rulesetId);
    if (ruleset.deletedByUserId) throw new DeletedException('Ruleset', rulesetId);

    return ruleset;
  }

  /**
   * Deletes a specific Ruleset
   * @param rulesetId the id of the ruleset to be deleted
   * @param deleterId the id of the user deleting the ruleset
   * @param organizationID the id of the organization the ruleset is being deleted in
   * @returns the deleted Ruleset
   */
  static async deleteRuleset(rulesetId: string, deleterId: string, organizationId: string) {
    const ruleset = await RulesService.getRulesetWithQueryArgs(rulesetId, organizationId);

    const hasPermission =
      (await userHasPermission(deleterId, organizationId, isAdmin)) || deleterId === ruleset.createdByUserId;

    if (!hasPermission) throw new AccessDeniedException('Only admins can delete a ruleset.');

    const deletedRuleset = await prisma.ruleset.update({
      where: { rulesetId },
      data: { deletedBy: { connect: { userId: deleterId } } },
      ...getRulesetQueryArgs(organizationId)
    });

    return rulesetTransformer(deletedRuleset);
  }

  static async getAllRulesetTypes(organization: Organization): Promise<RulesetType[]> {
    const rulesets = await prisma.ruleset_Type.findMany({
      where: {
        organizationId: organization.organizationId,
        deletedBy: null
      }
    });
    return rulesets.map(rulesetTypeTransformer);
  }

  /**
   * Gets rulesets for a given ruleset type
   * @param rulesetTypeId id of ruleset type
   * @param organizationId id of organization
   * @returns rulesets associated with provided ruleset type
   */
  static async getRulesetsByRulesetType(rulesetTypeId: string, organizationId: string): Promise<RulesetPreview[]> {
    const rulesets = await prisma.ruleset.findMany({
      where: {
        rulesetTypeId,
        deletedBy: null,
        rulesetType: {
          organizationId
        }
      },
      ...getRulesetPreviewQueryArgs()
    });

    return rulesets.map(rulesetPreviewTransformer);
  }

  /**
   * Updates the status of a project rule
   * Such as changing a project rule from INCOMPLETE to COMPLETED
   * @param submitter the user updating the status
   * @param organization the organization of the rule
   * @param projectRuleId the id of the project rule to update
   * @param newStatus the new status of the project rule
   * @returns the project rule with updated status
   */
  static async editProjectRuleStatus(
    submitter: User,
    organization: Organization,
    projectRuleId: string,
    newStatus: Rule_Completion
  ): Promise<ProjectRule> {
    // Ensure new satus is a valid Rule_Completion value
    if (!Object.values(Rule_Completion).includes(newStatus as Rule_Completion)) {
      throw new HttpException(400, `status must be one of: ${Object.values(Rule_Completion).join(', ')}`);
    }

    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('You do not have permissions to update a project rule status');
    }

    const projectRule = await prisma.project_Rule.findUnique({
      where: { projectRuleId },
      include: { rule: { include: { ruleset: { include: { car: { include: { wbsElement: true } } } } } } }
    });

    if (!projectRule) {
      throw new NotFoundException('Project Rule', projectRuleId);
    }

    if (projectRule.rule.ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Project Rule');
    }

    // If the status does not change, simply return the project rule
    if (projectRule.currentStatus === newStatus) {
      const originalProjectRule = await prisma.project_Rule.findUnique({
        where: { projectRuleId },
        ...getProjectRuleQueryArgs()
      });
      return projectRuleTransformer(originalProjectRule);
    }

    const newStatusHistory = {
      createdByUserId: submitter.userId,
      newStatus,
      note: `${submitter.firstName} ${submitter.lastName} marked as ${newStatus}`
    };

    const updatedProjectRule = await prisma.project_Rule.update({
      where: { projectRuleId },
      data: { currentStatus: newStatus, statusHistory: { create: newStatusHistory } },
      ...getProjectRuleQueryArgs()
    });

    return projectRuleTransformer(updatedProjectRule);
  }

  /**
   * Assigns a rule to a team. If the team already is assigned to the
   * rule, removes the team from the rule.
   * @param ruleId The ruleId of the rule to be added to
   * @param teamIds The team to be added to the rule
   * @param user The user adding the team to the rule
   * @param org The organization the rule belongs to
   * @returns the updated rule
   * @throws If the user is a guest, the rule does not exist or
   *         is deleted, or a team does not exist, is in the wrong
   *         organization, or is archived.
   *
   */
  static async toggleRuleTeam(ruleId: string, teamId: string, user: User, org: Organization) {
    // Checks that the user is not a guest
    if (!(await userHasPermission(user.userId, org.organizationId, notGuest))) {
      throw new AccessDeniedGuestException('Toggle Rule Team');
    }

    // Checks that the rule exists and is not deleted
    const rule = await prisma.rule.findUnique({
      where: { ruleId },
      include: {
        teams: true,
        ruleset: { select: { car: { include: { wbsElement: { select: { organizationId: true } } } } } }
      }
    });
    if (!rule) {
      throw new NotFoundException('Rule', ruleId);
    }
    if (rule.deletedByUserId) {
      throw new DeletedException('Rule', ruleId);
    }
    if (rule.ruleset.car.wbsElement.organizationId !== org.organizationId) {
      throw new InvalidOrganizationException('Rule');
    }

    // Checks based on the team
    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) throw new NotFoundException('Team', teamId);
    if (team.organizationId !== org.organizationId) throw new InvalidOrganizationException('Rule');
    if (team.dateArchived) throw new HttpException(400, 'Cannot toggle an archived team.');

    // We add the team to the rule if it is not already in the rule
    // If the rule is not in this team, add the team to the rule
    // If the rule is already in this team, remove the team from the rule
    if (!rule.teams.some((currTeam) => currTeam.teamId === teamId)) {
      await prisma.rule.update({
        where: { ruleId: rule.ruleId },
        data: {
          teams: {
            connect: {
              teamId
            }
          }
        }
      });
    } else {
      await prisma.rule.update({
        where: { ruleId: rule.ruleId },
        data: {
          teams: {
            disconnect: {
              teamId
            }
          }
        }
      });
    }

    // retrieve and return the updated rule
    const newRule = await prisma.rule.findUnique({
      where: { ruleId },
      ...getRulePreviewQueryArgs()
    });

    return ruleTransformer(newRule!);
  }

  static async createRuleset(
    submitter: User,
    organization: Organization,
    name: string,
    rulesetTypeId: string,
    carNumber: number,
    active: boolean,
    fileId: string
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership)))
      throw new AccessDeniedException('only leadership and above can create ruleset!');

    const rulesetType = await prisma.ruleset_Type.findUnique({
      where: {
        rulesetTypeId,
        deletedBy: null,
        organizationId: organization.organizationId
      }
    });

    if (!rulesetType) {
      throw new NotFoundException('Ruleset Type', rulesetTypeId);
    }

    const car = await prisma.car.findFirst({
      where: {
        wbsElement: {
          carNumber,
          organizationId: organization.organizationId,
          dateDeleted: null
        }
      },
      include: { wbsElement: true }
    });

    if (!car) {
      throw new NotFoundException('Car', carNumber);
    }

    const ruleset = await prisma.ruleset.create({
      data: {
        fileId,
        rulesetTypeId,
        name,
        carId: car.carId,
        active,
        createdByUserId: submitter.userId
      },
      ...getRulesetQueryArgs(organization.organizationId)
    });

    return rulesetTransformer(ruleset);
  }

  /**
   * Deletes a ruleset type and all the rulesets in the ruleset type's revision files.
   *
   * @param user The user who is deleting the ruleset type
   * @param rulesetTypeId The ruleset type to be deleted
   * @param organization The organization that the ruleset is being deleted for
   */
  static async deleteRulesetType(deleter: User, id: string, organization: Organization): Promise<RulesetType> {
    // check if user is admin
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete ruleset types');
    }

    const rulesetType = await prisma.ruleset_Type.findUnique({
      where: { rulesetTypeId: id, organizationId: organization.organizationId },
      include: {
        revisionFiles: true
      }
    });

    if (!rulesetType) {
      throw new NotFoundException('Ruleset Type', id);
    }
    if (rulesetType.deletedByUserId) {
      throw new DeletedException('Ruleset Type', id);
    }

    await prisma.$transaction(async (tx) => {
      // delete all rulesets in revision files
      for (const ruleset of rulesetType.revisionFiles) {
        await tx.ruleset.update({
          where: { rulesetId: ruleset.rulesetId },
          data: { deletedByUserId: deleter.userId }
        });
      }

      // delete the actual ruleset type itself
      await tx.ruleset_Type.update({
        where: { rulesetTypeId: id },
        data: { deletedByUserId: deleter.userId }
      });
    });

    const deletedRule = await prisma.ruleset_Type.findUnique({
      where: { rulesetTypeId: id },
      include: {
        revisionFiles: true
      }
    });

    return rulesetTypeTransformer(deletedRule);
  }

  /**
   * Deletes a project rule and its associated rule status changes
   * @param projectRuleId The ID of the project rule to delete
   * @param deleter The user deleting the project rule (must be admin)
   * @param organization The organization the project rule belongs to
   * @returns The deleted project rule
   */
  static async deleteProjectRule(projectRuleId: string, deleter: User, organization: Organization): Promise<ProjectRule> {
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete project rules');
    }

    const projectRule = await prisma.project_Rule.findUnique({
      where: { projectRuleId },
      include: {
        project: {
          include: {
            wbsElement: true
          }
        },
        rule: {
          include: {
            ruleset: {
              include: {
                car: {
                  include: {
                    wbsElement: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!projectRule) {
      throw new NotFoundException('Project Rule', projectRuleId);
    }

    if (projectRule.project.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Project Rule');
    }

    if (projectRule.rule.ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Project Rule');
    }

    if (projectRule.dateDeleted) {
      throw new DeletedException('Project Rule', projectRuleId);
    }

    const deletedProjectRule = await prisma.$transaction(async (tx) => {
      await tx.rule_Status_Change.updateMany({
        where: { projectRuleId, dateDeleted: null },
        data: { dateDeleted: new Date(), deletedByUserId: deleter.userId }
      });

      return await tx.project_Rule.update({
        where: { projectRuleId },
        data: {
          dateDeleted: new Date(),
          deletedByUserId: deleter.userId
        },
        ...getProjectRuleQueryArgs()
      });
    });

    return projectRuleTransformer(deletedProjectRule);
  }

  /**
   * Gets all unassigned rules (rules with no team assignments) for a given ruleset
   * @param rulesetId the id of the ruleset
   * @param organization the organization the ruleset belongs to
   * @returns an array of rules with no team assignments, ordered by ruleCode ascending
   */
  static async getUnassignedRules(rulesetId: string, organization: Organization): Promise<SharedRule[]> {
    const ruleset = await prisma.ruleset.findUnique({
      where: { rulesetId },
      include: {
        car: {
          include: {
            wbsElement: true
          }
        }
      }
    });

    if (!ruleset) {
      throw new NotFoundException('Ruleset', rulesetId);
    }

    if (ruleset.deletedByUserId) {
      throw new DeletedException('Ruleset', rulesetId);
    }

    if (ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Ruleset');
    }

    const rules = await prisma.rule.findMany({
      where: {
        rulesetId,
        dateDeleted: null,
        teams: {
          none: {}
        }
      },
      orderBy: {
        ruleCode: 'asc'
      },
      ...getRulePreviewQueryArgs()
    });

    return rules.map(ruleTransformer);
  }
}
