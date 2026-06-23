import type { Prisma } from '@prisma/client';
import { Organization } from '@prisma/client';
import RulesService from '../../services/rules.services.js';
import { User } from 'shared';

// rules
const topLevelRule = (rulesetId: string, userCreatedId: string): Prisma.RuleCreateInput => {
  return {
    ruleCode: 'T',
    ruleContent: 'PART T - GENERAL TECHNICAL REQUIREMENTS',
    imageFileIds: [],
    dateCreated: new Date('2025-09-01T10:00:00Z'),
    ruleset: { connect: { rulesetId } },
    createdBy: { connect: { userId: userCreatedId } }
  };
};

const secondLevelRule = (rulesetId: string, userCreatedId: string, parentRuleId: string): Prisma.RuleCreateInput => {
  return {
    ruleCode: 'T2',
    ruleContent: 'ARTICLE T2 GENERAL DESIGN REQUIREMENTS',
    imageFileIds: [],
    dateCreated: new Date('2025-09-01T10:00:00Z'),
    ruleset: { connect: { rulesetId } },
    createdBy: { connect: { userId: userCreatedId } },
    parentRule: { connect: { ruleId: parentRuleId } }
  };
};

const thirdLevelRule = (rulesetId: string, userCreatedId: string, parentRuleId: string): Prisma.RuleCreateInput => {
  return {
    ruleCode: 'T2.1',
    ruleContent: 'T2.1 Vehicle Configuration',
    imageFileIds: [],
    dateCreated: new Date('2025-09-01T10:00:00Z'),
    ruleset: { connect: { rulesetId } },
    createdBy: { connect: { userId: userCreatedId } },
    parentRule: { connect: { ruleId: parentRuleId } }
  };
};

const leafRule = (rulesetId: string, userCreatedId: string, parentRuleId: string): Prisma.RuleCreateInput => {
  return {
    ruleCode: 'T2.1.1',
    ruleContent:
      'The vehicle must be open-wheeled and open-cockpit (a formula style body) with four (4) wheels that are not in a straight line.',
    imageFileIds: [],
    dateCreated: new Date('2025-09-01T10:00:00Z'),
    ruleset: { connect: { rulesetId } },
    createdBy: { connect: { userId: userCreatedId } },
    parentRule: { connect: { ruleId: parentRuleId } }
  };
};

// ruleset types
const rulesetType1 = (userCreatedId: string, organizationId: string): Prisma.Ruleset_TypeCreateInput => {
  return {
    name: 'FSAE',
    createdBy: { connect: { userId: userCreatedId } },
    organization: { connect: { organizationId } }
  };
};

const rulesetType2 = (userCreatedId: string, organizationId: string): Prisma.Ruleset_TypeCreateInput => {
  return {
    name: 'FHE',
    createdBy: { connect: { userId: userCreatedId } },
    organization: { connect: { organizationId } }
  };
};

const emptyRulesetType = (userCreatedId: string, organizationId: string): Prisma.Ruleset_TypeCreateInput => {
  return {
    name: 'Empty Ruleset Type',
    createdBy: { connect: { userId: userCreatedId } },
    organization: { connect: { organizationId } }
  };
};

// rulesets
const ruleset1 = (carId: string, userCreatedId: string, rulesetTypeId: string): Prisma.RulesetCreateInput => {
  return {
    name: 'FSAE Rules 2025',
    fileId: 'fsae-rules-2025',
    active: true,
    dateCreated: new Date('2025-01-01T10:00:00Z'),
    car: { connect: { carId } },
    createdBy: { connect: { userId: userCreatedId } },
    rulesetType: { connect: { rulesetTypeId } }
  };
};

const secondActiveRuleset = (carId: string, userCreatedId: string, rulesetTypeId: string): Prisma.RulesetCreateInput => {
  return {
    name: 'Another Active FSAE Rules 2025 Revision',
    fileId: '2active-fsae-rules-2025',
    active: true,
    dateCreated: new Date('2024-12-31T10:00:00Z'),
    car: { connect: { carId } },
    createdBy: { connect: { userId: userCreatedId } },
    rulesetType: { connect: { rulesetTypeId } }
  };
};

// project rules
const projectRule1 = (projectId: string, ruleId: string, createdByUserId: string): Prisma.Project_RuleCreateInput => {
  return {
    rule: { connect: { ruleId } },
    project: { connect: { projectId } },
    createdBy: { connect: { userId: createdByUserId } }
  };
};

const projectRule2 = (projectId: string, ruleId: string, createdByUserId: string): Prisma.Project_RuleCreateInput => {
  return {
    rule: { connect: { ruleId } },
    project: { connect: { projectId } },
    createdBy: { connect: { userId: createdByUserId } }
  };
};

export const seedRulesetType = async (submitter: User, name: string, organization: Organization) => {
  const createdRulesetType = await RulesService.createRulesetType(submitter, name, organization);
  return createdRulesetType;
};

export const ruleSeedData = {
  topLevelRule,
  secondLevelRule,
  thirdLevelRule,
  leafRule,
  rulesetType1,
  rulesetType2,
  emptyRulesetType,
  ruleset1,
  secondActiveRuleset,
  projectRule1,
  projectRule2
};
