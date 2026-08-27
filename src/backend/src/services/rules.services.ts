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
  Ruleset,
  RuleStatus,
  RuleStatusHistoryEntry
} from 'shared';
import prisma from '../prisma/prisma.js';
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
import { isUserPartOfTeams } from '../utils/teams.utils.js';
import {
  getProjectRuleQueryArgs,
  getRulesetQueryArgs,
  getRulePreviewQueryArgs,
  getRulesetTypeQueryArgs,
  getRuleStatusHistoryQueryArgs
} from '../prisma-query-args/rules.query-args.js';
import { getTeamPreviewQueryArgs } from '../prisma-query-args/teams.query-args.js';
import {
  ruleTransformer,
  projectRuleTransformer,
  rulesetTransformer,
  rulesetTypeTransformer,
  ruleStatusHistoryTransformer
} from '../transformers/rules.transformer.js';
import { ParsedRule, parseRulesFromPdf } from '../utils/parse.utils.js';
import { uploadFile, downloadFile } from '../utils/google-integration.utils.js';

export default class RulesService {
  /**
   * Gets the active ruleset for the given ruleset type ID and car
   * @param user a user who is requesting for the active ruleset
   * @param rulesetTypeId the given ruleset type id
   * @param organization the organization for permission check
   * @param carNumber the car number to scope the active ruleset to, since each car can have its own active ruleset per type
   * @returns a ruleset with the given id if it exists, otherwise throws an error
   */
  static async getActiveRuleset(user: User, rulesetTypeId: string, organization: Organization, carNumber?: number) {
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

    let carId: string | undefined;
    if (carNumber !== undefined) {
      const car = await prisma.car.findFirst({
        where: {
          wbsElement: {
            carNumber,
            organizationId: organization.organizationId,
            dateDeleted: null
          }
        }
      });

      if (!car) {
        throw new NotFoundException('Car', carNumber);
      }

      ({ carId } = car);
    }

    const activeRuleset = await prisma.ruleset.findFirst({
      where: { rulesetTypeId, deletedByUserId: null, active: true, ...(carId && { carId }) },
      ...getRulesetQueryArgs()
    });

    if (!activeRuleset) {
      throw new NotFoundException('Active Ruleset for given Ruleset Type', rulesetTypeId);
    }

    return rulesetTransformer(activeRuleset);
  }

  /**
   * Throws if a rule with the given code already exists in the given ruleset
   * @param rulesetId The ruleset to check for an existing rule code
   * @param ruleCode The trimmed rule code to check
   */
  private static async assertRuleCodeAvailable(rulesetId: string, ruleCode: string) {
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
  }

  /**
   * Compute a rule's status given the statuses of its children.
   * @param childStatuses the statuses of the child rules
   * @returns status of the parent rule based on its children's statuses
   */
  private static computeRolledUpStatus(childStatuses: RuleStatus[]): RuleStatus {
    // If any children FAIL, the parent fails.
    if (childStatuses.includes(RuleStatus.FAIL)) return RuleStatus.FAIL;
    // If no children FAIL, and any children are PENDING, the parent is PENDING.
    if (childStatuses.includes(RuleStatus.PENDING)) return RuleStatus.PENDING;
    // If all children PASS, the parent passes.
    return RuleStatus.PASS;
  }

  /**
   * Recomputes and saves ruleId's status, then repeats up the parent chain.
   * @param ruleId the rule to recompute the status for
   * @returns the updated status of the rule
   */
  private static async recalculateRuleStatusChain(ruleId: string | null): Promise<void> {
    if (!ruleId) return;

    const children = await prisma.rule.findMany({
      where: { parentRuleId: ruleId, dateDeleted: null },
      select: { status: true }
    });

    // a rule with no remaining children has no rolled-up status to derive; reset it to Pending
    // and keep walking up so its own parent's rollup reflects the change
    const status =
      children.length === 0
        ? RuleStatus.PENDING
        : RulesService.computeRolledUpStatus(children.map((child) => child.status as RuleStatus));

    const { parentRuleId } = await prisma.rule.update({
      where: { ruleId },
      data: { status },
      select: { parentRuleId: true }
    });

    await RulesService.recalculateRuleStatusChain(parentRuleId);
  }

  /**
   * Same as recalculateRuleStatusChain, but scoped to one project's assigned rules.
   * Recomputes and saves the status of the project rule for the given ruleId, then repeats up the parent chain.
   * @param projectId the project to scope the status recomputation to
   * @param ruleId the rule to recompute the status for
   * @returns the updated status of the project rule
   */
  private static async recalculateProjectRuleStatusChain(projectId: string, ruleId: string | null): Promise<void> {
    if (!ruleId) return;

    const projectRule = await prisma.project_Rule.findFirst({
      where: { projectId, ruleId, dateDeleted: null },
      select: { projectRuleId: true }
    });

    if (!projectRule) return;

    const children = await prisma.project_Rule.findMany({
      where: { projectId, dateDeleted: null, rule: { parentRuleId: ruleId, dateDeleted: null } },
      select: { status: true }
    });

    // a project rule with no remaining children has no rolled-up status to derive; reset it to Pending
    // and keep walking up so its own parent's rollup reflects the change
    const status =
      children.length === 0
        ? RuleStatus.PENDING
        : RulesService.computeRolledUpStatus(children.map((child) => child.status as RuleStatus));

    await prisma.project_Rule.update({
      where: { projectRuleId: projectRule.projectRuleId },
      data: { status }
    });

    const rule = await prisma.rule.findUnique({ where: { ruleId }, select: { parentRuleId: true } });
    await RulesService.recalculateProjectRuleStatusChain(projectId, rule?.parentRuleId ?? null);
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
    // Check user has permission (leadership and above)
    if (!(await userHasPermission(user.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('Only leadership and above can create rules');
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

    ruleCode = ruleCode.trim();

    // Check for duplicate rule code within the same ruleset
    await RulesService.assertRuleCodeAvailable(rulesetId, ruleCode);

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

    // a fresh child defaults to PENDING, which can flip the parent chain's statuses (e.g. PASS -> PENDING)
    await RulesService.recalculateRuleStatusChain(parentRuleId ?? null);

    return ruleTransformer(rule);
  }

  /**
   * Creates new ruleset type with the given information.
   * Only admin/app admins can create ruleset types through admin tools
   * @param submitter a user who is making this request
   * @param name the name of the ruleset type
   * @param organizationId the organization ID for permission check
   * @returns A newly created ruleset type
   */
  static async createRulesetType(submitter: User, name: string, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create ruleset types');

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

    if (!(await userHasPermission(deleter.userId, org.organizationId, isLeadership))) {
      throw new AccessDeniedException('Only leadership and above can delete rules');
    }

    if (!rule) throw new NotFoundException('Rule', ruleId);
    if (rule.dateDeleted) throw new DeletedException('Rule', ruleId);

    if (rule.ruleset?.car?.wbsElement?.organizationId !== org.organizationId) throw new InvalidOrganizationException('Rule');

    const deletedRuleIds: string[] = [];

    const affectedProjectIds = await prisma.$transaction(async (tx) => {
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

        deletedRuleIds.push(currRuleId);
      };

      await deleteParentChildReferencing(ruleId);

      // A deleted rule must not stay assigned to any project. Left behind it is invisible in the
      // project's rules (those are filtered to undeleted rules) while still counting as a child,
      // which blocks its parent from being removed or having its status set.
      const assignedProjectRules = await tx.project_Rule.findMany({
        where: { ruleId: { in: deletedRuleIds }, dateDeleted: null },
        select: { projectId: true }
      });

      await tx.project_Rule.updateMany({
        where: { ruleId: { in: deletedRuleIds }, dateDeleted: null },
        data: { dateDeleted: new Date(), deletedByUserId: deleter.userId }
      });

      return [...new Set(assignedProjectRules.map((projectRule) => projectRule.projectId))];
    });

    // this rule (and its descendants) are gone, so its old parent chain may update their statuses
    await RulesService.recalculateRuleStatusChain(rule.parentRuleId);

    // the same goes for the parent chain within every project the deleted rules were assigned to
    for (const projectId of affectedProjectIds) {
      await RulesService.recalculateProjectRuleStatusChain(projectId, rule.parentRuleId);
    }

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
        teams: { select: { teamId: true } },
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
      include: { wbsElement: true, teams: { select: { teamId: true } } }
    });

    if (!project) {
      throw new NotFoundException('Project', projectId);
    }
    if (project.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Project');
    }

    if (project.wbsElement.dateDeleted) throw new DeletedException('Project', projectId);

    // A rule can only be assigned to a project if the rule is on one of that project's teams.
    // This should never be reached since the frontend only shows unassigned rules that are assigned to the project's teams
    const projectTeamIds = new Set(project.teams.map((team) => team.teamId));
    if (!rule.teams.some((team) => projectTeamIds.has(team.teamId))) {
      throw new HttpException(400, "Rule must be on one of the project's teams to be assigned to it");
    }

    // Checks if this rule is already actively assigned to this project.
    // A soft-deleted project rule from previous unassignment would be revived instead of creating a new one
    const existingProjectRule = await prisma.project_Rule.findFirst({
      where: { ruleId, projectId, dateDeleted: null }
    });

    if (existingProjectRule) {
      throw new HttpException(400, 'This rule is already associated with the project');
    }

    // ensure we assign all ancestors of a rule to the project
    const ancestorIds: string[] = [];
    const visited = new Set<string>([ruleId]);
    let currentParentId = rule.parentRuleId;

    while (currentParentId && !visited.has(currentParentId)) {
      visited.add(currentParentId);
      const parent = await prisma.rule.findUnique({
        where: { ruleId: currentParentId },
        select: { parentRuleId: true, dateDeleted: true, teams: { select: { teamId: true } } }
      });
      // rule only displays if the full chain to a top-level rule exists, so a missing or deleted
      // ancestor means this rule would not display - do not assign it OR its ancestors to the project
      if (!parent) throw new NotFoundException('Rule', currentParentId);
      if (parent.dateDeleted) throw new DeletedException('Rule', currentParentId);
      // ancestors must also be on one of the project's teams otherwise the chain to the top-level rule would break
      if (!parent.teams.some((team) => projectTeamIds.has(team.teamId))) {
        throw new HttpException(400, "Parent rules must be on one of the project's teams to be assigned to it");
      }
      ancestorIds.push(currentParentId);
      currentParentId = parent.parentRuleId;
    }

    // skip ancestors already assigned to this project
    const existingAncestors = await prisma.project_Rule.findMany({
      where: { projectId, ruleId: { in: ancestorIds }, dateDeleted: null },
      select: { ruleId: true }
    });
    const existingAncestorIds = new Set(existingAncestors.map((projectRule) => projectRule.ruleId));
    const ancestorsToCreate = ancestorIds.filter((id) => !existingAncestorIds.has(id));

    // create (or revive) all project rules. (ruleId, projectId) is unique so
    // soft deleted rules from previous team unassignment would be revived instead of colliding on insert
    const reviveOrCreate = (targetRuleId: string) =>
      // upsert - updates existing record, or inserts if it doesn't exist
      prisma.project_Rule.upsert({
        where: { ruleId_projectId: { ruleId: targetRuleId, projectId } },
        create: {
          ruleId: targetRuleId,
          projectId,
          createdByUserId: submitter.userId
        },
        update: {
          dateDeleted: null,
          deletedByUserId: null,
          createdByUserId: submitter.userId
        }
      });

    await prisma.$transaction([...ancestorsToCreate.map(reviveOrCreate), reviveOrCreate(ruleId)]);

    // new (or revived) project rule leaf defaults to PENDING so parent statuses need to be recomputed
    await RulesService.recalculateProjectRuleStatusChain(projectId, rule.parentRuleId);

    // return only original project rule being assigned (leaf rule)
    const projectRule = await prisma.project_Rule.findUnique({
      where: { ruleId_projectId: { ruleId, projectId } },
      ...getProjectRuleQueryArgs()
    });

    if (!projectRule) {
      throw new NotFoundException('Project Rule', ruleId);
    }

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
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership)))
      throw new AccessDeniedException('Only leadership and above can edit a rule');

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

    if (ruleCode !== undefined) {
      ruleCode = ruleCode.trim();

      if (ruleCode === '') {
        throw new HttpException(400, 'Rule code cannot be empty');
      }

      if (ruleCode !== currentRule.ruleCode) {
        await RulesService.assertRuleCodeAvailable(currentRule.rulesetId, ruleCode);
      }
    }

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

      if (parentRule.rulesetId !== currentRule.rulesetId) {
        throw new HttpException(400, 'Parent rule must be in the same ruleset');
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

    // reparenting moves this rule out of the old parent chain and into the new one, so recompute statuses for both parent chains
    if (parentRuleId && parentRuleId !== currentRule.parentRuleId) {
      await RulesService.recalculateRuleStatusChain(currentRule.parentRuleId);
      await RulesService.recalculateRuleStatusChain(parentRuleId);
    }

    return ruleTransformer(updatedRule);
  }

  /**
   * Adds a referenced rule to an existing rule
   * @param submitter the user making the request
   * @param ruleId the rule receiving the reference
   * @param referencedRuleId the rule ID to add as a reference
   * @param organization the organization the rule belongs to
   * @returns the updated rule
   */
  static async addRuleReferences(submitter: User, ruleId: string, referencedRuleId: string, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership)))
      throw new AccessDeniedException('Only leadership and above can edit a rule');

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

    if (!rule) throw new NotFoundException('Rule', ruleId);
    if (rule.dateDeleted) throw new DeletedException('Rule', ruleId);
    if (rule.ruleset?.car?.wbsElement?.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Rule');

    if (referencedRuleId === ruleId) {
      throw new HttpException(400, 'A rule cannot reference itself');
    }

    // Referenced rules must be in the same ruleset, which guarantees same org
    const referencedRule = await prisma.rule.findUnique({
      where: { ruleId: referencedRuleId, rulesetId: rule.rulesetId }
    });

    if (!referencedRule) throw new NotFoundException('Referenced Rule', referencedRuleId);
    if (referencedRule.dateDeleted) throw new DeletedException('Referenced Rule', referencedRuleId);

    const updatedRule = await prisma.rule.update({
      where: { ruleId },
      data: {
        referencedRule: {
          connect: { ruleId: referencedRuleId }
        },
        dateUpdated: new Date(),
        updatedByUserId: submitter.userId
      },
      ...getRulePreviewQueryArgs()
    });

    return ruleTransformer(updatedRule);
  }

  /**
   * Removes a referenced rule from an existing rule
   * @param submitter the user making the request
   * @param ruleId the rule losing the reference
   * @param referencedRuleId the rule ID to remove from the references
   * @param organization the organization the rule belongs to
   * @returns the updated rule
   */
  static async removeRuleReferences(submitter: User, ruleId: string, referencedRuleId: string, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership)))
      throw new AccessDeniedException('Only leadership and above can edit a rule');

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

    if (!rule) throw new NotFoundException('Rule', ruleId);
    if (rule.dateDeleted) throw new DeletedException('Rule', ruleId);
    if (rule.ruleset?.car?.wbsElement?.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Rule');

    const referencedRule = await prisma.rule.findUnique({
      where: { ruleId: referencedRuleId }
    });

    if (!referencedRule) throw new NotFoundException('Referenced Rule', referencedRuleId);
    if (referencedRule.dateDeleted) throw new DeletedException('Referenced Rule', referencedRuleId);

    const updatedRule = await prisma.rule.update({
      where: { ruleId },
      data: {
        referencedRule: {
          disconnect: { ruleId: referencedRuleId }
        },
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

    // admins can delete any ruleset; leadership and heads can only delete a ruleset they created themselves
    const isCreator = deleterId === ruleset.createdByUserId;
    const hasPermission =
      (await userHasPermission(deleterId, organizationId, isAdmin)) ||
      (isCreator && (await userHasPermission(deleterId, organizationId, isLeadership)));

    if (!hasPermission) {
      throw new AccessDeniedException('You do not have permissions to delete this ruleset.');
    }

    if (ruleset.active) {
      throw new HttpException(400, 'Cannot delete an active ruleset. Please deactivate it first.');
    }

    const deletedRuleset = await prisma.ruleset.update({
      where: { rulesetId },
      data: { dateDeleted: new Date(), deletedBy: { connect: { userId: deleterId } }, active: false },
      ...getRulesetQueryArgs()
    });

    return rulesetTransformer(deletedRuleset);
  }

  static async getAllRulesetTypes(user: User, organization: Organization, carId?: string): Promise<RulesetType[]> {
    if (!(await userHasPermission(user.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedGuestException('view ruleset types');
    }

    const rulesets = await prisma.ruleset_Type.findMany({
      where: {
        organizationId: organization.organizationId,
        deletedByUserId: null
      },
      ...getRulesetTypeQueryArgs(carId)
    });
    return rulesets.map(rulesetTypeTransformer);
  }

  /**
   * Gets a ruleset type for a given ruleset type ID
   * @param user the user requesting the ruleset type
   * @param rulesetTypeId id of ruleset type
   * @param organizationId id of organization
   * @param carId optional id of the car to scope revision file counts to
   * @returns ruleset type associated with provided ruleset type ID
   */
  static async getRulesetType(
    user: User,
    rulesetTypeId: string,
    organizationId: string,
    carId?: string
  ): Promise<RulesetType> {
    if (!(await userHasPermission(user.userId, organizationId, notGuest))) {
      throw new AccessDeniedGuestException('view ruleset types');
    }

    const rulesetType = await prisma.ruleset_Type.findUnique({
      where: {
        rulesetTypeId,
        organizationId,
        deletedBy: null
      },
      ...getRulesetTypeQueryArgs(carId)
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
   * @param user the user requesting the rulesets
   * @param rulesetTypeId id of ruleset type
   * @param organizationId id of organization
   * @param carId optional id of the car to filter rulesets by
   * @returns rulesets associated with provided ruleset type
   */
  static async getRulesetsByRulesetType(
    user: User,
    rulesetTypeId: string,
    organizationId: string,
    carId?: string
  ): Promise<Ruleset[]> {
    if (!(await userHasPermission(user.userId, organizationId, notGuest))) {
      throw new AccessDeniedGuestException('view rulesets');
    }

    const rulesets = await prisma.ruleset.findMany({
      where: {
        rulesetTypeId,
        deletedByUserId: null,
        rulesetType: {
          organizationId
        },
        ...(carId && { carId })
      },
      orderBy: {
        dateCreated: 'desc'
      },
      ...getRulesetQueryArgs()
    });

    return rulesets.map(rulesetTransformer);
  }

  /**
   * Sets a rule's general-view status. This status is independent of any project.
   * It is unaffected by the status of the rule in any project it's assigned to.
   * Only leadership and above can update the general-view status.
   * @param submitter the user updating the status
   * @param organization the organization of the rule
   * @param ruleId the id of the rule to update
   * @param status the new status of the rule
   * @returns the rule with updated status
   */
  static async setRuleStatus(
    submitter: User,
    organization: Organization,
    ruleId: string,
    status: RuleStatus
  ): Promise<SharedRule> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('You do not have permissions to update rule status');
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

    const childRuleCount = await prisma.rule.count({
      where: { parentRuleId: ruleId, dateDeleted: null }
    });

    if (childRuleCount > 0) {
      throw new HttpException(400, 'Only child rule statuses can be updated directly.');
    }

    // only PASS/FAIL are tracked in history; PENDING does not create an entry
    if (status !== RuleStatus.PENDING) {
      await prisma.rule_Status_History.create({
        data: { ruleId, status, updatedByUserId: submitter.userId }
      });
    }

    const updatedRule = await prisma.rule.update({
      where: { ruleId },
      data:
        status === RuleStatus.PENDING
          ? { status, statusUpdatedByUserId: null, statusUpdatedAt: null }
          : { status, statusUpdatedByUserId: submitter.userId, statusUpdatedAt: new Date() },
      ...getRulePreviewQueryArgs()
    });

    // updating a rules status may update the status of its parent chain, so recalculate the parent chain's statuses
    await RulesService.recalculateRuleStatusChain(rule.parentRuleId);

    return ruleTransformer(updatedRule);
  }

  /**
   * Sets a rule's status within a single project. This status is local to that project.
   * It does not affect the rule's general-view status, or its status in any other project.
   * Leadership and above can update it anywhere; members can only update it for a project whose team they're on.
   * @param submitter the user updating the status
   * @param organization the organization of the project rule
   * @param projectRuleId the id of the project rule to update
   * @param status the new status of the rule in this project
   * @returns the project rule with updated status
   */
  static async setProjectRuleStatus(
    submitter: User,
    organization: Organization,
    projectRuleId: string,
    status: RuleStatus
  ): Promise<ProjectRule> {
    const projectRule = await prisma.project_Rule.findUnique({
      where: { projectRuleId },
      include: {
        project: { include: { wbsElement: true, teams: getTeamPreviewQueryArgs(organization.organizationId) } },
        rule: { include: { ruleset: { include: { car: { include: { wbsElement: true } } } } } }
      }
    });

    if (!projectRule) {
      throw new NotFoundException('Project Rule', projectRuleId);
    }

    if (projectRule.dateDeleted) {
      throw new DeletedException('Project Rule', projectRuleId);
    }

    if (
      projectRule.project.wbsElement.organizationId !== organization.organizationId ||
      projectRule.rule.ruleset.car.wbsElement.organizationId !== organization.organizationId
    ) {
      throw new InvalidOrganizationException('Project Rule');
    }

    const hasOrgWidePermission = await userHasPermission(submitter.userId, organization.organizationId, isLeadership);
    if (!hasOrgWidePermission && !isUserPartOfTeams(projectRule.project.teams, submitter)) {
      throw new AccessDeniedException('You do not have permissions to update rule status for this project');
    }

    const childProjectRuleCount = await prisma.project_Rule.count({
      where: {
        projectId: projectRule.projectId,
        dateDeleted: null,
        rule: { parentRuleId: projectRule.ruleId, dateDeleted: null }
      }
    });

    if (childProjectRuleCount > 0) {
      throw new HttpException(400, 'Only child rule statuses can be updated directly.');
    }

    // only PASS/FAIL are tracked in history; PENDING does not create an entry
    if (status !== RuleStatus.PENDING) {
      await prisma.rule_Status_History.create({
        data: { ruleId: projectRule.ruleId, projectRuleId, status, updatedByUserId: submitter.userId }
      });
    }

    const updatedProjectRule = await prisma.project_Rule.update({
      where: { projectRuleId },
      data:
        status === RuleStatus.PENDING
          ? { status, statusUpdatedByUserId: null, statusUpdatedAt: null }
          : { status, statusUpdatedByUserId: submitter.userId, statusUpdatedAt: new Date() },
      ...getProjectRuleQueryArgs()
    });

    // updating a project rule's status may update the status of its parent chain, so recalculate the parent chain's statuses
    await RulesService.recalculateProjectRuleStatusChain(projectRule.projectId, projectRule.rule.parentRuleId);

    return projectRuleTransformer(updatedProjectRule);
  }

  /**
   * Resets every rule's general-view status back to Pending, for a whole ruleset.
   * Does not affect any rule's status within a project. Never creates history entries,
   * since reverting to PENDING is not tracked. Only heads and above can do this.
   * @param submitter the user resetting the statuses
   * @param organization the organization of the ruleset
   * @param rulesetId the id of the ruleset to reset
   * @returns the number of rules that were reset
   */
  static async resetRulesetStatuses(submitter: User, organization: Organization, rulesetId: string): Promise<number> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('You do not have permissions to reset rule status');
    }

    const ruleset = await prisma.ruleset.findUnique({
      where: { rulesetId },
      include: { car: { include: { wbsElement: true } } }
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

    const result = await prisma.rule.updateMany({
      where: { rulesetId, dateDeleted: null, status: { not: RuleStatus.PENDING } },
      data: { status: RuleStatus.PENDING, statusUpdatedByUserId: null, statusUpdatedAt: null }
    });

    return result.count;
  }

  /**
   * Resets every project rule's status back to Pending, for a single project, scoped to a
   * single ruleset (a project can have rules from multiple ruleset types). Does not affect
   * any rule's general-view status, or its status in any other project. Never creates history
   * entries, since reverting to PENDING is not tracked. Allowed for leadership and up.
   * @param submitter the user resetting the statuses
   * @param organization the organization of the project and ruleset
   * @param rulesetId the ruleset to scope the reset to
   * @param projectId the project whose rules should be reset
   * @returns the number of project rules that were reset
   */
  static async resetProjectRuleStatuses(
    submitter: User,
    organization: Organization,
    rulesetId: string,
    projectId: string
  ): Promise<number> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isLeadership))) {
      throw new AccessDeniedException('You do not have permissions to reset project rule status');
    }

    const ruleset = await prisma.ruleset.findUnique({
      where: { rulesetId },
      include: { car: { include: { wbsElement: true } } }
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
      include: { wbsElement: true }
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

    const result = await prisma.project_Rule.updateMany({
      where: {
        projectId,
        dateDeleted: null,
        rule: { rulesetId, dateDeleted: null },
        status: { not: RuleStatus.PENDING }
      },
      data: { status: RuleStatus.PENDING, statusUpdatedByUserId: null, statusUpdatedAt: null }
    });

    return result.count;
  }

  /**
   * Gets the full status history for a rule, every time status was marked PASS or FAIL.
   * Reverting to PENDING does not create history.
   * @param user a user who is requesting the status history
   * @param organization the organization of the rule
   * @param ruleId the id of the rule to get history for
   * @param projectRuleId if provided, scopes the history to just this project rule instead of every context the rule appears in
   * @returns the rule's status history, most recent first
   */
  static async getRuleStatusHistory(
    user: User,
    organization: Organization,
    ruleId: string,
    projectRuleId?: string
  ): Promise<RuleStatusHistoryEntry[]> {
    if (!(await userHasPermission(user.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedGuestException('view rule status history');
    }

    const rule = await prisma.rule.findUnique({
      where: { ruleId },
      include: { ruleset: { include: { car: { include: { wbsElement: true } } } } }
    });

    if (!rule) {
      throw new NotFoundException('Rule', ruleId);
    }

    if (rule.ruleset.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Rule');
    }

    const history = await prisma.rule_Status_History.findMany({
      where: { ruleId, ...(projectRuleId && { projectRuleId }) },
      orderBy: { dateCreated: 'desc' },
      ...getRuleStatusHistoryQueryArgs()
    });

    return history.map(ruleStatusHistoryTransformer);
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
    // Checks that the user is leadership and above
    if (!(await userHasPermission(user.userId, org.organizationId, isLeadership))) {
      throw new AccessDeniedException('Only leadership and above can assign rules to teams');
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
      // teams the rule still belongs to once this team assignment is removed
      const remainingTeamIds = rule.teams
        .filter((currTeam) => currTeam.teamId !== teamId)
        .map((currTeam) => currTeam.teamId);

      // Disconnect the team and soft delete its project rules, ensure we never leave
      // the rule unassigned from the team while its project rules stay active
      await prisma.$transaction(async (tx) => {
        await tx.rule.update({
          where: { ruleId: rule.ruleId },
          data: {
            teams: {
              disconnect: {
                teamId
              }
            }
          }
        });
        // Since a project can belong to multiple teams, only soft delete the project rule
        // when the project shares no remaining team with the rule.
        await tx.project_Rule.updateMany({
          where: {
            ruleId: rule.ruleId,
            dateDeleted: null,
            project: {
              teams: {
                some: { teamId }, // project has the team where the assignment is being removed
                none: { teamId: { in: remainingTeamIds } } // project has no remaining teams that the rule is still assigned to
              }
            }
          },
          data: {
            dateDeleted: new Date(),
            deletedByUserId: user.userId
          }
        });
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
      }
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
      ...getRulesetTypeQueryArgs()
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
      ...getRulesetTypeQueryArgs()
    });

    if (!deletedRule) {
      throw new NotFoundException('Ruleset Type', id);
    }

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

    const { projectId } = projectRule;

    const childProjectRule = await prisma.project_Rule.findFirst({
      where: { projectId, dateDeleted: null, rule: { parentRuleId: projectRule.rule.ruleId, dateDeleted: null } }
    });
    if (childProjectRule) {
      throw new HttpException(400, 'Cannot delete a project rule that has children assigned to this project');
    }

    // first surviving ancestor who still has children assigned to this project, or null if the walk reached the root of the tree
    let currentParentRuleId = projectRule.rule.parentRuleId;

    const deletedProjectRule = await prisma.$transaction(async (tx) => {
      const deleted = await tx.project_Rule.update({
        where: { projectRuleId },
        data: {
          dateDeleted: new Date(),
          deletedByUserId: deleter.userId
        },
        ...getProjectRuleQueryArgs()
      });

      // Walk up the rule tree, removing ancestor project rules that no longer have
      // any remaining children assigned to this project
      while (currentParentRuleId) {
        // If parent rule still has remaining children in this project, do not soft delete
        const remainingChild = await tx.project_Rule.findFirst({
          where: { projectId, dateDeleted: null, rule: { parentRuleId: currentParentRuleId, dateDeleted: null } }
        });
        if (remainingChild) break;

        // If parent project rule doesn't exist or was already deleted, do not soft delete
        const parentProjectRule = await tx.project_Rule.findUnique({
          where: { ruleId_projectId: { ruleId: currentParentRuleId, projectId } },
          include: { rule: true }
        });
        if (!parentProjectRule || parentProjectRule.dateDeleted) break;

        // soft delete the project rule
        await tx.project_Rule.update({
          where: { projectRuleId: parentProjectRule.projectRuleId },
          data: { dateDeleted: new Date(), deletedByUserId: deleter.userId }
        });

        // continue up the rule tree
        currentParentRuleId = parentProjectRule.rule.parentRuleId;
      }

      return deleted;
    });

    // the deleted project rule, and any ancestors removed along with it, no longer count towards
    // the surviving ancestors' status calculations
    await RulesService.recalculateProjectRuleStatusChain(projectId, currentParentRuleId);

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
          carId: rulesetExists.carId,
          rulesetType: {
            rulesetTypeId: rulesetExists.rulesetTypeId,
            organizationId
          },
          deletedByUserId: null
        }
      });

      if (activeRuleset) {
        throw new HttpException(400, 'There is already an active ruleset for this ruleset type and car');
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
   * @param user the user requesting the child rules
   * @param ruleId the ID of the parent rule
   * @param organization the organization the rule belongs to
   * @returns an array of all child rules (the Rule object)
   */
  static async getChildRules(user: User, ruleId: string, organization: Organization): Promise<SharedRule[]> {
    if (!(await userHasPermission(user.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedGuestException('view rules');
    }

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
      orderBy: { ruleCode: 'asc' },
      ...getRulePreviewQueryArgs()
    });

    return subRules.map((rule) => ruleTransformer(rule));
  }

  /**
   * Gets rules assignable to a project that are not already assigned to it.
   * A project can belong to multiple teams, so rules from all of its teams are shown.
   * @param user the user requesting the unassigned rules
   * @param rulesetId ruleset the rules are in
   * @param projectId the project the rules would be assigned to
   * @param organizationId the organization id
   * @returns the rules on one of the project's teams that are not already actively assigned to this project
   */
  static async getUnassignedRulesForProjectRuleset(
    user: User,
    rulesetId: string,
    projectId: string,
    organizationId: string
  ) {
    if (!(await userHasPermission(user.userId, organizationId, notGuest))) {
      throw new AccessDeniedGuestException('view unassigned rules');
    }

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

    const project = await prisma.project.findUnique({
      where: { projectId },
      select: {
        wbsElement: { select: { organizationId: true } },
        teams: { select: { teamId: true } }
      }
    });

    if (!project) {
      throw new NotFoundException('Project', projectId);
    }

    if (project.wbsElement.organizationId !== organizationId) {
      throw new InvalidOrganizationException('Project');
    }

    const projectTeamIds = project.teams.map((team) => team.teamId);

    const rules = await prisma.rule.findMany({
      where: {
        rulesetId,
        // rule is on at least one of the project's teams
        teams: {
          some: {
            teamId: { in: projectTeamIds },
            organizationId
          }
        },
        // only hide it from a project that already has it actively assigned
        projects: {
          none: { projectId, dateDeleted: null }
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
   * @param user the user requesting the project rules
   * @param rulesetId the id of the ruleset
   * @param projectId the id of the project
   * @param organization the organization the project and ruleset belong to
   * @returns Array of ProjectRule objects
   */
  static async getProjectRules(
    user: User,
    rulesetId: string,
    projectId: string,
    organization: Organization
  ): Promise<ProjectRule[]> {
    if (!(await userHasPermission(user.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedGuestException('view project rules');
    }

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
      orderBy: { rule: { ruleCode: 'asc' } },
      ...getProjectRuleQueryArgs()
    });

    return projectRules.map(projectRuleTransformer);
  }

  /**
   * Gets all rules with no parent id
   * @param user the user requesting the top-level rules
   * @param rulesetId id of ruleset
   * @returns an array of rules with no parent Id
   */
  static async getTopLevelRules(user: User, rulesetId: string, organizationId: string) {
    if (!(await userHasPermission(user.userId, organizationId, notGuest))) {
      throw new AccessDeniedGuestException('view rules');
    }

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
      orderBy: { ruleCode: 'asc' },
      ...getRulePreviewQueryArgs()
    });

    return rules.map((rule) => ruleTransformer(rule));
  }

  /**
   * Gets every rule in a ruleset in a single query instead of walking it level by level.
   * @param user the user requesting the rules
   * @param rulesetId id of ruleset
   * @param organizationId the organization the ruleset belongs to
   * @returns a flat array of every rule in the ruleset
   */
  static async getAllRulesForRuleset(user: User, rulesetId: string, organizationId: string): Promise<SharedRule[]> {
    if (!(await userHasPermission(user.userId, organizationId, notGuest))) {
      throw new AccessDeniedGuestException('view rules');
    }

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
        dateDeleted: null
      },
      orderBy: { ruleCode: 'asc' },
      ...getRulePreviewQueryArgs()
    });

    return rules.map((rule) => ruleTransformer(rule));
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
   * @param firstRulePage 1-indexed page rules start on; pages before this are skipped instead of parsed
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
    parserType: 'FSAE' | 'FHE',
    firstRulePage?: number
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
      parsedRules = await parseRulesFromPdf(buffer, parserType, firstRulePage);
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
