import { Organization, User } from '@prisma/client';
import RulesService from '../../services/rules.services';

export const seedRulesetType = async (submitter: User, name: string, organization: Organization) => {
  const createdRulesetType = await RulesService.createRulesetType(submitter, name, organization);

  return createdRulesetType;
};
