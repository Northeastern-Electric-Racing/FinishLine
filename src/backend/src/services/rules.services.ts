import { isLeadership } from 'shared';
import prisma from '../prisma/prisma';
import { User, Organization } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import { AccessDeniedException } from '../utils/errors.utils';

export default class RulesService {
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
        createdByUserId: submitter.userId
      }
    });

    return rulesetType;
  }
}
