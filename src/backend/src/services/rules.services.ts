import { Organization, User } from '@prisma/client';
import prisma from '../prisma/prisma';
import { AccessDeniedException, DeletedException, HttpException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { notGuest } from 'shared';
import { getRuleQueryArgs } from '../prisma-query-args/rules.query-args';
import { ruleTransformer } from '../transformers/rules.transformer';

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
      ...getRuleQueryArgs(organization.organizationId)
    });

    return ruleTransformer(rule);
  }
}
