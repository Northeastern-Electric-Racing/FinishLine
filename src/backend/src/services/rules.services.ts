import { Organization, Rule } from '@prisma/client';
import {
  isAdmin,
  isLeadership,
  ProjectRule,
  RulesetType,
  notGuest,
  User,
  Rule as SharedRule,
  isHead,
  Ruleset
} from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedGuestException,
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';
import {
  getProjectRuleQueryArgs,
  getRulesetQueryArgs,
  getRulePreviewQueryArgs
} from '../prisma-query-args/rules.query-args.js';
import {
  ruleTransformer,
  projectRuleTransformer,
  rulesetTransformer,
  rulesetTypeTransformer
} from '../transformers/rules.transformer.js';
import { ParsedRule, parseRulesFromPdf } from '../utils/parse.utils.js';
import { uploadFile, downloadFile } from '../utils/google-integration.utils.js';

export default class RulesService {
  /**
   * Gets the active ruleset for the given ruleset type ID
   * @param user a user who is requesting for the active ruleset
   * @param rulesetTypeId the given ruleset type id
   * @param organization the organization for permission check
   * @returns a ruleset with the given id if it exists, otherwise throws an error
   */
  static async getActiveRuleset(user: User, rulesetTypeId: string, organization: Organization) {
    if (!(await userHasPermission(user.userId, organization.organizationId, notGuest)))
      throw new AccessDeniedException('only members and above can view ruleset types!');

    const rulesetType = await prisma.ruleset_Type.findUnique({
      where: { rulesetTypeId, organizationId: organization.organizationId }
    });

    if (!rulesetType) {
      throw new NotFoundException('Ruleset Type', rulesetTypeId);
    }

    if (rulesetType?.deletedByUserId != null) {
      throw new DeletedException('Ruleset Type', rulesetTypeId);
    }

    const activeRuleset = await prisma.ruleset.findFirst({
      where: { rulesetTypeId, deletedByUserId: null, active: true },
      ...getRulesetQueryArgs()
    });

    if (!activeRuleset) {
      throw new NotFoundException('Active Ruleset for given Ruleset Type', rulesetTypeId);
    }

    return rulesetTransformer(activeRuleset);
  }

  /**
   * Gets a single ruleset by its ID
   * @param rulesetId  The ID of the ruleset to retrieve
   * @param organizationId The ID of the organization the ruleset belongs to
   * @returns The ruleset if found, otherwise throws an error
   */
  static async getRulesetById(rulesetId: string, organizationId: string): Promise<Ruleset> {
    const ruleset = await prisma.ruleset.findFirst({
      where: {
        rulesetId,
        deletedByUserId: null,
        rulesetType: {
          organizationId
        }
      },
      ...getRulesetQueryArgs()
    });

    if (!ruleset) {
      throw new NotFoundException('Ruleset', rulesetId);
    }

    return rulesetTransformer(ruleset);
  }

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

    // Walk up the parent chain to assign all ancestors of a rule to the project as well.
    // visited guards against cycles, which editRule does not currently prevent.
    const ancestorIds: string[] = [];
    const visited = new Set<string>([ruleId]);
    let currentParentId = rule.parentRuleId;

    while (currentParentId && !visited.has(currentParentId)) {
      visited.add(currentParentId);
      const parent = await prisma.rule.findUnique({
        where: { ruleId: currentParentId },
        select: { parentRuleId: true, dateDeleted: true }
      });
      // Stop if the ancestor is missing or deleted - deleted rules should not be assigned to projects
      if (!parent || parent.dateDeleted) break;
      ancestorIds.push(currentParentId);
      currentParentId = parent.parentRuleId;
    }

    // Only create ancestors that aren't already assigned to the project to avoid duplicate assignment issues
    const existingAncestors = await prisma.project_Rule.findMany({
      where: { projectId, ruleId: { in: ancestorIds }, dateDeleted: null },
      select: { ruleId: true }
    });
    const existingAncestorIds = new Set(existingAncestors.map((projectRule) => projectRule.ruleId));
    const ancestorsToCreate = ancestorIds.filter((id) => !existingAncestorIds.has(id));

    await prisma.$transaction([
      ...ancestorsToCreate.map((ancestorId) =>
        prisma.project_Rule.create({
          data: {
            ruleId: ancestorId,
            projectId,
            createdByUserId: submitter.userId
          }
        })
      ),
      prisma.project_Rule.create({
        data: {
          ruleId,
          projectId,
          createdByUserId: submitter.userId
        }
      })
    ]);

    const projectRule = await prisma.project_Rule.findUnique({
      where: { ruleId_projectId: { ruleId, projectId } },
      ...getProjectRuleQueryArgs()
    });

    return projectRuleTransformer(projectRule);
  }

  /**
   * Edits a rule with the given id
   * @param submitter a user who is making this request
   * @param ruleContent the rule content to edit
   * @param ruleId The rule ID being edited
   * @param ruleCode The rule code to update (optional, keeps existing if not provided)
   * @param imageFileIds The image files to update (optional, keeps existing if not provided)
   * @param parentRuleId The parent rule ID to update
   * @param organization the organization the rule belongs to
   * @returns the edited rule
   */
  static async editRule(
    submitter: User,
    ruleContent: string,
    ruleId: string,
    ruleCode: string | undefined,
    imageFileIds: string[] | undefined,
    organization: Organization,
    parentRuleId?: string
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('edit a rule');

    const currentRule = await prisma.rule.findUnique({
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

    if (!currentRule) {
      throw new NotFoundException('Rule', ruleId);
    }

    if (currentRule.dateDeleted) {
      throw new DeletedException('Rule', ruleId);
    }

    if (currentRule.ruleset?.car?.wbsElement?.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Rule');

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
    }

    const updatedRule = await prisma.rule.update({
      where: {
        ruleId
      },
      data: {
        ruleContent,
        ...(ruleCode !== undefined && { ruleCode }),
        ...(imageFileIds !== undefined && { imageFileIds }),
        ...(parentRuleId && { parentRuleId }),
        dateUpdated: new Date(),
        updatedByUserId: submitter.userId
      },
      ...getRulePreviewQueryArgs()
    });

    return ruleTransformer(updatedRule);
  }

  /**
   * Given a ruleset id, retrieves the ruleset and throws errors if
   * it does not exist or is already deleted
   * @param rulesetId the id of the ruleset
   * @param organizationId the id of the organization the ruleset is being deleted in
   * @returns the ruleset with query args
   */
  static async getRulesetWithQueryArgs(rulesetId: string) {
    const ruleset = await prisma.ruleset.findUnique({
      where: { rulesetId },
      ...getRulesetQueryArgs()
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
    const ruleset = await RulesService.getRulesetWithQueryArgs(rulesetId);

    const hasPermission =
      (await userHasPermission(deleterId, organizationId, isAdmin)) || deleterId === ruleset.createdByUserId;

    if (!hasPermission) throw new AccessDeniedException('Only admins can delete a ruleset.');

    if (ruleset.active) {
      throw new HttpException(400, 'Cannot delete an active ruleset. Please deactivate it first.');
    }

    const deletedRuleset = await prisma.ruleset.update({
      where: { rulesetId },
      data: { deletedBy: { connect: { userId: deleterId } }, active: false },
      ...getRulesetQueryArgs()
    });

    return rulesetTransformer(deletedRuleset);
  }

  static async getAllRulesetTypes(organization: Organization): Promise<RulesetType[]> {
    const rulesets = await prisma.ruleset_Type.findMany({
      where: {
        organizationId: organization.organizationId,
        deletedByUserId: null
      },
      include: {
        revisionFiles: true
      }
    });
    return rulesets.map(rulesetTypeTransformer);
  }

  /**
   * Gets a ruleset type for a given ruleset type ID
   * @param rulesetTypeId id of ruleset type
   * @param organizationId id of organization
   * @returns ruleset type associated with provided ruleset type ID
   */
  static async getRulesetType(rulesetTypeId: string, organizationId: string): Promise<RulesetType> {
    const rulesetType = await prisma.ruleset_Type.findUnique({
      where: {
        rulesetTypeId,
        organizationId,
        deletedBy: null
      },
      include: {
        revisionFiles: true
      }
    });

    if (!organizationId) {
      throw new NotFoundException('Organization', organizationId);
    }

    if (!rulesetType) {
      throw new NotFoundException('Ruleset Type', rulesetTypeId);
    }

    return rulesetTypeTransformer(rulesetType);
  }

  /**
   * Gets rulesets for a given ruleset type
   * @param rulesetTypeId id of ruleset type
   * @param organizationId id of organization
   * @returns rulesets associated with provided ruleset type
   */
  static async getRulesetsByRulesetType(rulesetTypeId: string, organizationId: string): Promise<Ruleset[]> {
    const rulesets = await prisma.ruleset.findMany({
      where: {
        rulesetTypeId,
        deletedByUserId: null,
        rulesetType: {
          organizationId
        }
      },
      orderBy: {
        dateCreated: 'desc'
      },
      ...getRulesetQueryArgs()
    });

    return rulesets.map(rulesetTransformer);
  }

  /**
   * Gets all rules assigned to a team that are in the active ruleset of a given ruleset type
   * @param teamId id of the team
   * @param rulesetTypeId id of ruleset type
   * @param organization the organization
   * @returns array of rule previews
   */
  static async getTeamRulesInRulesetType(teamId: string, rulesetTypeId: string, organization: Organization) {
    const team = await prisma.team.findUnique({
      where: { teamId, dateArchived: null }
    });

    if (!team) {
      throw new NotFoundException('Team', teamId);
    }

    if (team.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Team');
    }

    const rulesetType = await prisma.ruleset_Type.findUnique({
      where: { rulesetTypeId }
    });

    if (!rulesetType) {
      throw new NotFoundException('Ruleset Type', rulesetTypeId);
    }

    if (rulesetType.deletedByUserId) {
      throw new DeletedException('Ruleset Type', rulesetTypeId);
    }

    if (rulesetType.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Ruleset Type');
    }

    const activeRuleset = await prisma.ruleset.findFirst({
      where: {
        rulesetTypeId,
        active: true,
        deletedByUserId: null
      },
      ...getRulesetQueryArgs()
    });

    if (!activeRuleset) {
      throw new NotFoundException('Active Ruleset for given Ruleset Type', rulesetTypeId);
    }

    const rules = await prisma.rule.findMany({
      where: {
        rulesetId: activeRuleset.rulesetId,
        dateDeleted: null,
        teams: {
          some: {
            teamId
          }
        }
      },
      ...getRulePreviewQueryArgs()
    });

    return rules.map(ruleTransformer);
  }

  /**
   * Sets the completion of a rule. Completion is global to the rule, so marking it complete
   * (or incomplete) is reflected everywhere the rule appears.
   * @param submitter the user updating the completion
   * @param organization the organization of the rule
   * @param ruleId the id of the rule to update
   * @param isComplete whether the rule is complete
   * @param projectId the project the rule was completed from (optional - omitted for general view)
   * @returns the rule with updated completion
   */
  static async setRuleCompletion(
    submitter: User,
    organization: Organization,
    ruleId: string,
    isComplete: boolean,
    projectId?: string
  ): Promise<SharedRule> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('You do not have permissions to update a rule completion');
    }

    const rule = await prisma.rule.findUnique({
      where: { ruleId },
      include: { ruleset: { include: { car: { include: { wbsElement: true } } } } }
    });

    if (!rule) {
      throw new NotFoundException('Rule', ruleId);
    }

    if (rule.dateDeleted) {
      throw new DeletedException('Rule', ruleId);
    }

    if (rule.ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Rule');
    }

    const updatedRule = await prisma.rule.update({
      where: { ruleId },
      data: isComplete
        ? { isComplete: true, completedByUserId: submitter.userId, completedInProjectId: projectId ?? null }
        : { isComplete: false, completedByUserId: null, completedInProjectId: null },
      ...getRulePreviewQueryArgs()
    });

    return ruleTransformer(updatedRule);
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
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('only leadership and above can create ruleset!');
    }

    const rulesetType = await prisma.ruleset_Type.findUnique({
      where: {
        rulesetTypeId
      }
    });

    if (!rulesetType) {
      throw new NotFoundException('Ruleset Type', rulesetTypeId);
    }
    if (rulesetType.dateDeleted !== null) {
      throw new DeletedException('Ruleset Type', rulesetTypeId);
    }

    if (rulesetType.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Ruleset Type');

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
      ...getRulesetQueryArgs()
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
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isHead))) {
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

    const deletedProjectRule = await prisma.project_Rule.update({
      where: { projectRuleId },
      data: {
        dateDeleted: new Date(),
        deletedByUserId: deleter.userId
      },
      ...getProjectRuleQueryArgs()
    });

    return projectRuleTransformer(deletedProjectRule);
  }

  /**
   * Updates a rulesets status
   * @param submitter user updating the ruleset
   * @param organizationId organization of ruleset being updated
   * @param rulesetId id of ruleset being updated
   * @param status new status of ruleset
   * @returns
   */
  static async updateRuleset(submitter: User, organizationId: string, rulesetId: string, name: string, isActive: boolean) {
    if (!(await userHasPermission(submitter.userId, organizationId, isHead))) {
      throw new AccessDeniedException('You do not have permissions to update ruleset status');
    }

    const rulesetExists = await prisma.ruleset.findUnique({
      where: {
        rulesetId,
        rulesetType: {
          organizationId
        },
        deletedByUserId: null
      }
    });

    if (!rulesetExists) {
      throw new NotFoundException('Ruleset', rulesetId);
    }

    if (!rulesetExists.active && isActive) {
      const activeRuleset = await prisma.ruleset.findFirst({
        where: {
          active: true,
          rulesetType: {
            rulesetTypeId: rulesetExists.rulesetTypeId,
            organizationId
          },
          deletedByUserId: null
        }
      });

      if (activeRuleset) {
        throw new HttpException(400, 'There is already an active ruleset for this ruleset type');
      }
    }
    const ruleset = await prisma.ruleset.update({
      where: {
        rulesetId,
        rulesetType: {
          organizationId
        }
      },
      data: {
        name,
        active: isActive
      },
      ...getRulesetQueryArgs()
    });

    return rulesetTransformer(ruleset);
  }

  /**
   * Gets all subrules of a specific rule.
   * @param ruleId the ID of the parent rule
   * @param organization the organization the rule belongs to
   * @returns an array of all child rules (the Rule object)
   */
  static async getChildRules(ruleId: string, organization: Organization): Promise<SharedRule[]> {
    // Verify the parent rule exists and belongs to the organization
    const parentRule = await prisma.rule.findUnique({
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

    if (!parentRule) {
      throw new NotFoundException('Rule', ruleId);
    }

    if (parentRule.dateDeleted) {
      throw new DeletedException('Rule', ruleId);
    }

    if (parentRule.ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Rule');
    }

    const subRules = await prisma.rule.findMany({
      where: {
        parentRuleId: ruleId,
        dateDeleted: null
      },
      ...getRulePreviewQueryArgs()
    });
    return subRules.map((rule) => ruleTransformer(rule));
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

  /**
   * Gets team rules that are unassigned to a project
   * @param rulesetId ruleset the rules are in
   * @param teamId team that rules are assigned to
   * @param organizationId the organization id
   * @returns the rules in this team that do not have an associated project rule
   */
  static async getUnassignedRulesForRuleset(rulesetId: string, teamId: string, organizationId: string) {
    const ruleset = await prisma.ruleset.findUnique({
      where: { rulesetId },
      select: {
        dateDeleted: true,
        rulesetType: {
          select: {
            organizationId: true
          }
        }
      }
    });

    if (!ruleset) {
      throw new NotFoundException('Ruleset', rulesetId);
    }

    if (ruleset.dateDeleted) {
      throw new DeletedException('Ruleset', rulesetId);
    }

    if (ruleset.rulesetType.organizationId !== organizationId) {
      throw new InvalidOrganizationException('Ruleset');
    }

    const team = await prisma.team.findUnique({
      where: { teamId },
      select: {
        organizationId: true
      }
    });

    if (!team) {
      throw new NotFoundException('Team', teamId);
    }

    if (team.organizationId !== organizationId) {
      throw new InvalidOrganizationException('Team');
    }

    const rules = await prisma.rule.findMany({
      where: {
        rulesetId,
        teams: {
          some: {
            teamId,
            organizationId
          }
        },
        projects: {
          none: {}
        },
        deletedByUserId: null
      },
      ...getRulePreviewQueryArgs(),
      orderBy: {
        ruleCode: 'asc'
      }
    });
    return rules.map(ruleTransformer);
  }

  /**
   * Gets all rules associated with a specific project and ruleset
   * @param rulesetId the id of the ruleset
   * @param projectId the id of the project
   * @param organization the organization the project and ruleset belong to
   * @returns Array of ProjectRule objects
   */
  static async getProjectRules(rulesetId: string, projectId: string, organization: Organization): Promise<ProjectRule[]> {
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

    const project = await prisma.project.findUnique({
      where: { projectId },
      include: {
        wbsElement: true
      }
    });

    if (!project) {
      throw new NotFoundException('Project', projectId);
    }

    if (project.wbsElement.dateDeleted) {
      throw new DeletedException('Project', projectId);
    }

    if (project.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Project');
    }

    const projectRules = await prisma.project_Rule.findMany({
      where: {
        projectId,
        rule: {
          rulesetId,
          dateDeleted: null
        },
        dateDeleted: null
      },
      ...getProjectRuleQueryArgs()
    });

    return projectRules.map(projectRuleTransformer);
  }

  /**
   * Gets all rules with no parent id
   * @param rulesetId id of ruleset
   * @returns an array of rules with no parent Id
   */
  static async getTopLevelRules(rulesetId: string, organizationId: string) {
    const ruleset = await prisma.ruleset.findUnique({
      where: { rulesetId },
      select: {
        dateDeleted: true,
        rulesetType: {
          select: {
            organizationId: true
          }
        }
      }
    });

    if (!ruleset) {
      throw new NotFoundException('Ruleset', rulesetId);
    }

    if (ruleset.dateDeleted) {
      throw new DeletedException('Ruleset', rulesetId);
    }

    if (ruleset.rulesetType.organizationId !== organizationId) {
      throw new InvalidOrganizationException('Ruleset');
    }

    const rules = await prisma.rule.findMany({
      where: {
        rulesetId,
        dateDeleted: null,
        parentRuleId: null
      },
      ...getRulePreviewQueryArgs()
    });

    return rules.map(ruleTransformer);
  }

  /**
   * Parses a PDF ruleset file and saves the extracted rules to the database.
   * Extracts rules based on parser type (FSAE or FHE).
   * Creates all rules in the database and then sets up parent-child relationships
   * @param user user who uploaded the ruleset pdf
   * @param organizationId organization id of the ruleset
   * @param fileId google drive file id of the ruleset pdf
   * @param rulesetId id of the ruleset to save the parsed rules into
   * @param parserType type of parser to use (FSAE or FHE)
   * @returns array of saved rules with parent relationships established
   * @throws AccessDeniedException if user lacks permissions or ruleset belongs to another organization
   * @throws NotFoundException if ruleset doesn't exist
   * @throws DeletedException if ruleset has been deleted
   * @throws HttpException(400) if file is not a PDF or contains no rules
   * @throws HttpException(500) if PDF parsing fails
   */
  static async parseRuleset(
    user: User,
    organizationId: string,
    fileId: string,
    rulesetId: string,
    parserType: 'FSAE' | 'FHE'
  ): Promise<SharedRule[]> {
    if (!(await userHasPermission(user.userId, organizationId, isLeadership))) {
      throw new AccessDeniedException('You do not have permissions to upload and parse rulesets');
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
    if (ruleset.car.wbsElement.organizationId !== organizationId) {
      throw new AccessDeniedException('Cannot parse rules into a ruleset from another organization');
    }

    // get file from Google Drive
    const { buffer, type } = await downloadFile(fileId);

    // ensure the file is a PDF
    if (type !== 'application/pdf') {
      throw new HttpException(400, 'Ruleset File must be a PDF');
    }
    let parsedRules: ParsedRule[];
    try {
      parsedRules = await parseRulesFromPdf(buffer, parserType);
      if (parsedRules.length === 0) {
        throw new HttpException(400, 'No rules found in provided file');
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (process.env && process.env.NODE_ENV === 'development') {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new HttpException(500, `Error parsing rules from PDF file: ${message}`);
      }
      throw new HttpException(500, 'Error parsing rules from PDF file');
    }

    await prisma.$transaction(async (tx) => {
      await tx.rule.createMany({
        data: parsedRules.map((rule) => ({
          ruleCode: rule.ruleCode,
          ruleContent: rule.ruleContent,
          imageFileIds: [],
          rulesetId,
          createdByUserId: user.userId
        }))
      });

      const createdRules = await tx.rule.findMany({
        where: { rulesetId },
        select: {
          ruleId: true,
          ruleCode: true
        }
      });

      const ruleMap = new Map<string, string>();
      createdRules.forEach((rule) => {
        ruleMap.set(rule.ruleCode, rule.ruleId);
      });

      // update parent relationships
      const parentUpdates = parsedRules
        .filter((rule) => rule.parentRuleCode)
        .map((rule) => {
          const parentId = ruleMap.get(rule.parentRuleCode!);
          const ruleId = ruleMap.get(rule.ruleCode);

          if (!parentId || !ruleId) return null;

          return tx.rule.update({
            where: { ruleId },
            data: { parentRuleId: parentId }
          });
        })
        .filter(Boolean);

      await Promise.all(parentUpdates);
    });

    const savedRules = await prisma.rule.findMany({
      where: { rulesetId },
      ...getRulePreviewQueryArgs()
    });

    return savedRules.map(ruleTransformer);
  }

  static async uploadRulesetFile(file: Express.Multer.File, uploader: User, organization: Organization) {
    if (!(await userHasPermission(uploader.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('Only leadership and above can upload ruleset files');
    }
    const data = await uploadFile(file);
    return data.id;
  }

  /**
   * Gets a single ruleset by ID
   * @param rulesetId the id of the ruleset
   * @param user the user requesting the ruleset
   * @param organization the organization the user belongs to
   * @returns the ruleset with the given id
   */
  static async getSingleRuleset(user: User, rulesetId: string, organization: Organization): Promise<Ruleset> {
    if (!(await userHasPermission(user.userId, organization.organizationId, notGuest)))
      throw new AccessDeniedException('Only members and above can view rulesets!');

    const ruleset = await prisma.ruleset.findUnique({
      where: { rulesetId },
      ...getRulesetQueryArgs()
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

    return rulesetTransformer(ruleset);
  }
}
