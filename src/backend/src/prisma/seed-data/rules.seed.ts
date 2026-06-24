import type { Prisma } from '@prisma/client';
import { Organization, PrismaClient } from '@prisma/client';
import RulesService from '../../services/rules.services.js';
import { User } from 'shared';

// ruleset types
const rulesetTypeFSAE = (userCreatedId: string, organizationId: string): Prisma.Ruleset_TypeCreateInput => {
  return {
    name: 'FSAE',
    createdBy: { connect: { userId: userCreatedId } },
    organization: { connect: { organizationId } }
  };
};

const rulesetTypeFHE = (userCreatedId: string, organizationId: string): Prisma.Ruleset_TypeCreateInput => {
  return {
    name: 'FHE',
    createdBy: { connect: { userId: userCreatedId } },
    organization: { connect: { organizationId } }
  };
};

const mockRulesetType = (userCreatedId: string, organizationId: string): Prisma.Ruleset_TypeCreateInput => {
  return {
    name: 'Mock Ruleset Type',
    createdBy: { connect: { userId: userCreatedId } },
    organization: { connect: { organizationId } }
  };
};

// rulesets
const rulesetFSAE = (carId: string, userCreatedId: string, rulesetTypeId: string): Prisma.RulesetCreateInput => {
  return {
    name: 'Mock FSAE',
    fileId: 'mock-fsae-rules',
    active: true,
    dateCreated: new Date('2025-01-01T10:00:00Z'),
    car: { connect: { carId } },
    createdBy: { connect: { userId: userCreatedId } },
    rulesetType: { connect: { rulesetTypeId } }
  };
};

const rulesetFHE = (carId: string, userCreatedId: string, rulesetTypeId: string): Prisma.RulesetCreateInput => {
  return {
    name: 'Mock FHE',
    fileId: 'mock-fhe-rules',
    active: true,
    dateCreated: new Date('2024-12-31T10:00:00Z'),
    car: { connect: { carId } },
    createdBy: { connect: { userId: userCreatedId } },
    rulesetType: { connect: { rulesetTypeId } }
  };
};

const rulesetMock = (carId: string, userCreatedId: string, rulesetTypeId: string): Prisma.RulesetCreateInput => {
  return {
    name: 'Mock Ruleset',
    fileId: 'mock-rules',
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

/**
 * Seeds the FSAE and FHE rulesets, including parent/child relationships and
 * cross-references between rules. Also assigns a leaf rule to the given project
 * and marks it complete to demonstrate project rules and global rule completion.
 *
 * @param prisma the prisma client used by the seed script
 * @param fsaeRulesetId fsae mock ruleset the bulk of the rules belong to
 * @param fheRulesetId fhe mock ruleset
 * @param mockRulesetId a mock ruleset used for testing
 * @param users the users credited as rule creators
 * @param organization the organization the rules/project belong to
 * @param projectId the project a leaf rule is assigned to and completed in
 * @param huskyTeamId the team a leaf rule is assigned to
 */
export const seedFsaeRules = async (
  prisma: PrismaClient,
  fsaeRulesetId: string,
  fheRulesetId: string,
  mockRulesetId: string,
  users: { batman: User; thomasEmrax: User; joeShmoe: User; joeBlow: User; superman: User },
  organization: Organization,
  projectId: string,
  huskyTeamId: string
) => {
  const { batman, thomasEmrax, joeShmoe, joeBlow, superman } = users;

  // Technical Rules (from FSAE 2026 rules)
  const topLevelTechnical = await prisma.rule.create({
    data: {
      ruleCode: 'T',
      ruleContent: 'TECHNICAL ASPECTS',
      rulesetId: fsaeRulesetId,
      createdByUserId: batman.userId
    }
  });

  const T1Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T.1',
      ruleContent: 'COCKPIT',
      rulesetId: fsaeRulesetId,
      parentRuleId: topLevelTechnical.ruleId,
      createdByUserId: batman.userId
    }
  });

  const T11Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T.1.1',
      ruleContent: 'Cockpit Opening',
      rulesetId: fsaeRulesetId,
      parentRuleId: T1Rule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'T.1.1.1',
      ruleContent: 'The template shown below must pass through the cockpit opening',
      rulesetId: fsaeRulesetId,
      parentRuleId: T11Rule.ruleId,
      createdByUserId: joeShmoe.userId
    }
  });

  const T112Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T.1.1.2',
      ruleContent:
        'The template will be held horizontally, parallel to the ground, and inserted vertically from a height above any Primary Structure or bodywork that is between the Front Hoop and the Main Hoop until it meets the two of: ( refer to F.6.4 and F.7.5.1 )',
      rulesetId: fsaeRulesetId,
      parentRuleId: T11Rule.ruleId,
      createdByUserId: joeShmoe.userId
    }
  });

  const T112ARule = await prisma.rule.create({
    data: {
      ruleCode: 'T.1.1.2.a',
      ruleContent: 'Has passed 25 mm below the lowest point of the top of the Side Impact Structure',
      rulesetId: fsaeRulesetId,
      parentRuleId: T112Rule.ruleId,
      createdByUserId: joeShmoe.userId
    }
  });

  const T112BRule = await prisma.rule.create({
    data: {
      ruleCode: 'T.1.1.2.b',
      ruleContent: 'Is less than or equal to 320 mm above the lowest point inside the cockpit',
      rulesetId: fsaeRulesetId,
      parentRuleId: T112Rule.ruleId,
      createdByUserId: joeShmoe.userId
    }
  });

  const T12Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T.1.2',
      ruleContent: 'Internal Cross Section',
      rulesetId: fsaeRulesetId,
      parentRuleId: T1Rule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  const T121Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T.1.2.1',
      ruleContent: 'Requirement:',
      rulesetId: fsaeRulesetId,
      parentRuleId: T12Rule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'T.1.2.1.a',
      ruleContent: 'The cockpit must have a free internal cross section',
      rulesetId: fsaeRulesetId,
      parentRuleId: T121Rule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'T.1.2.1.b',
      ruleContent: 'The template shown below must pass through the cockpit',
      rulesetId: fsaeRulesetId,
      parentRuleId: T121Rule.ruleId,
      createdByUserId: thomasEmrax.userId,
      imageFileIds: [] // add image here when implemented (page 56 of FSAE 2026)
    }
  });

  // IC Rules (from FSAE 2026 rules)
  const ICRule = await prisma.rule.create({
    data: {
      ruleCode: 'IC',
      ruleContent: 'INTERNAL COMBUSTION ENGINE VEHICLES',
      rulesetId: fsaeRulesetId,
      createdByUserId: thomasEmrax.userId
    }
  });

  const IC1Rule = await prisma.rule.create({
    data: {
      ruleCode: 'IC.1',
      ruleContent: 'GENERAL REQUIREMENTS',
      rulesetId: fsaeRulesetId,
      parentRuleId: ICRule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  const IC5Rule = await prisma.rule.create({
    data: {
      ruleCode: 'IC.5',
      ruleContent: 'FUEL AND FUEL SYSTEM',
      rulesetId: fsaeRulesetId,
      parentRuleId: ICRule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  const IC56Rule = await prisma.rule.create({
    data: {
      ruleCode: 'IC.5.6',
      ruleContent: 'Venting Systems',
      rulesetId: fsaeRulesetId,
      parentRuleId: IC5Rule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  const IC561Rule = await prisma.rule.create({
    data: {
      ruleCode: 'IC.5.6.1',
      ruleContent:
        'Venting systems for the fuel tank and fuel delivery system must not let fuel spill during hard cornering or acceleration',
      rulesetId: fsaeRulesetId,
      parentRuleId: IC56Rule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  const IC562Rule = await prisma.rule.create({
    data: {
      ruleCode: 'IC.5.6.2',
      ruleContent: 'All fuel vent lines must have a check valve to prevent fuel leakage when the tank is inverted',
      rulesetId: fsaeRulesetId,
      parentRuleId: IC56Rule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  const IC563Rule = await prisma.rule.create({
    data: {
      ruleCode: 'IC.5.6.3',
      ruleContent: 'All fuel vent lines must exit outside the bodywork',
      rulesetId: fsaeRulesetId,
      parentRuleId: IC56Rule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  // Chassis and Structural Rules (from FSAE 2025 rules)
  const FRule = await prisma.rule.create({
    data: {
      ruleCode: 'F',
      ruleContent: 'CHASSIS AND STRUCTURAL',
      rulesetId: fsaeRulesetId,
      createdByUserId: thomasEmrax.userId
    }
  });

  const F3Rule = await prisma.rule.create({
    data: {
      ruleCode: 'F.3',
      ruleContent: 'TUBING AND MATERIAL',
      rulesetId: fsaeRulesetId,
      parentRuleId: FRule.ruleId,
      createdByUserId: joeShmoe.userId
    }
  });

  const F34Rule = await prisma.rule.create({
    data: {
      ruleCode: 'F.3.4',
      ruleContent: 'Steel Tubing and Material',
      rulesetId: fsaeRulesetId,
      parentRuleId: F3Rule.ruleId,
      createdByUserId: joeBlow.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'F.3.4.1',
      ruleContent:
        'Minimum Requirements for Steel Tubing. A tube must have all four minimum requirements for each Size specified:',
      rulesetId: fsaeRulesetId,
      parentRuleId: F34Rule.ruleId,
      createdByUserId: batman.userId,
      imageFileIds: [] // table FSAE 2025 page 26
    }
  });

  const F342Rule = await prisma.rule.create({
    data: {
      ruleCode: 'F.3.4.2',
      ruleContent: 'Properties for ANY steel material for calculations submitted in an SES must be:',
      rulesetId: fsaeRulesetId,
      parentRuleId: F34Rule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'F.3.4.2.a',
      ruleContent:
        'Non Welded Properties for continuous material calculations: Young’s Modulus (E) = 200 GPa (29,000 ksi) Yield Strength (Sy) = 305 MPa (44.2 ksi) Ultimate Strength (Su) = 365 MPa (52.9 ksi)',
      rulesetId: fsaeRulesetId,
      parentRuleId: F342Rule.ruleId,
      createdByUserId: batman.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'F.3.4.2.b',
      ruleContent:
        'Welded Properties for discontinuous material such as joint calculations: Yield Strength (Sy) = 180 MPa (26 ksi) Ultimate Strength (Su) = 300 MPa (43.5 ksi)',
      rulesetId: fsaeRulesetId,
      parentRuleId: F342Rule.ruleId,
      createdByUserId: batman.userId
    }
  });

  const F32Rule = await prisma.rule.create({
    data: {
      ruleCode: 'F.3.2',
      ruleContent: 'Tubing Requirements',
      rulesetId: fsaeRulesetId,
      parentRuleId: F3Rule.ruleId,
      createdByUserId: batman.userId
    }
  });

  const F321Rule = await prisma.rule.create({
    data: {
      ruleCode: 'F.3.2.1',
      ruleContent: 'Requirements by Application',
      rulesetId: fsaeRulesetId,
      parentRuleId: F32Rule.ruleId,
      createdByUserId: batman.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'F.3.2.1.b',
      ruleContent: 'Front Bulkhead Support Size C Yes', // info is part of first table from FSAE page 26
      rulesetId: fsaeRulesetId,
      parentRuleId: F321Rule.ruleId,
      createdByUserId: batman.userId
    }
  });

  // Referenced later by F.5.7.1
  const F321cRule = await prisma.rule.create({
    data: {
      ruleCode: 'F.3.2.1.c',
      ruleContent: 'Front Hoop Size A Yes', // info is part of first table from FSAE page 26
      rulesetId: fsaeRulesetId,
      parentRuleId: F321Rule.ruleId,
      createdByUserId: batman.userId
    }
  });

  // F siblings
  const F5Rule = await prisma.rule.create({
    data: {
      ruleCode: 'F.5',
      ruleContent: 'CHASSIS REQUIREMENTS',
      rulesetId: fsaeRulesetId,
      parentRuleId: FRule.ruleId,
      createdByUserId: joeShmoe.userId
    }
  });

  const F57Rule = await prisma.rule.create({
    data: {
      ruleCode: 'F.5.7',
      ruleContent: 'Front Hoop',
      rulesetId: fsaeRulesetId,
      parentRuleId: F5Rule.ruleId,
      createdByUserId: joeShmoe.userId
    }
  });

  // Rule F.5.7.1 references F.3.2.1.c
  const F571Rule = await prisma.rule.create({
    data: {
      ruleCode: 'F.5.7.1',
      ruleContent: 'The Front Hoop must be constructed of closed section metal tubing meeting F.3.2.1.c',
      rulesetId: fsaeRulesetId,
      parentRuleId: F57Rule.ruleId,
      createdByUserId: joeShmoe.userId,
      referencedRule: {
        connect: [{ ruleId: F321cRule.ruleId }] // Referenced rule
      }
    }
  });

  // Dynamic Events (from FSAE 2025 rules)
  const DRule = await prisma.rule.create({
    data: {
      ruleCode: 'D',
      ruleContent: 'DYNAMIC EVENTS',
      rulesetId: fsaeRulesetId,
      createdByUserId: batman.userId
    }
  });

  const D3Rule = await prisma.rule.create({
    data: {
      ruleCode: 'D.3',
      ruleContent: 'DRIVING',
      rulesetId: fsaeRulesetId,
      parentRuleId: DRule.ruleId,
      createdByUserId: superman.userId
    }
  });

  const D35Rule = await prisma.rule.create({
    data: {
      ruleCode: 'D.3.5',
      ruleContent: 'Driver Equipment',
      rulesetId: fsaeRulesetId,
      parentRuleId: D3Rule.ruleId,
      createdByUserId: superman.userId
    }
  });

  const D351Rule = await prisma.rule.create({
    data: {
      ruleCode: 'D.3.5.1',
      ruleContent: 'All Driver Equipment and Harness must be worn by the driver anytime in the cockpit with:',
      rulesetId: fsaeRulesetId,
      parentRuleId: D35Rule.ruleId,
      createdByUserId: batman.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'D.3.5.1.a',
      ruleContent: '(IC) Engine running or (EV) Tractive System Active',
      rulesetId: fsaeRulesetId,
      parentRuleId: D351Rule.ruleId,
      createdByUserId: batman.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'D.3.5.1.b',
      ruleContent: 'Anytime between starting a Dynamic run and finishing or abandoning that Dynamic run',
      rulesetId: fsaeRulesetId,
      parentRuleId: D351Rule.ruleId,
      createdByUserId: batman.userId
    }
  });

  // Technical Requirements from FHE 2026
  const TRule = await prisma.rule.create({
    data: {
      ruleCode: 'T',
      ruleContent: 'PART T - GENERAL TECHNICAL REQUIREMENTS',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId
    }
  });

  const T2Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T2',
      ruleContent: 'ARTICLE T2 - GENERAL DESIGN REQUIREMENTS',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId,
      parentRuleId: TRule.ruleId
    }
  });

  const T21Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T2.1',
      ruleContent: 'Vehicle Configuration',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId,
      parentRuleId: T2Rule.ruleId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'T2.1.1',
      ruleContent:
        'The vehicle must be open-wheeled and open-cockpit (a formula style body) with four (4) wheels that are not in a straight line.',
      rulesetId: fheRulesetId,
      parentRuleId: T21Rule.ruleId,
      createdByUserId: thomasEmrax.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'T2.2',
      ruleContent:
        'Bodywork There must be no openings through the bodywork into the driver compartment from the front of the vehicle back to the roll bar main hoop or firewall other than that required for the cockpit opening. Minimal openings around the front suspension components are allowed.',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId,
      parentRuleId: T2Rule.ruleId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: 'T2.3',
      ruleContent:
        'Wheelbase The car must have a wheelbase of at least 1524 mm. The wheelbase is measured from the center of ground contact of the front and rear tires with the wheels pointed straight ahead.',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId,
      parentRuleId: T2Rule.ruleId
    }
  });

  const T3Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T3',
      ruleContent: 'ARTICLE T3 - SAFETY REQUIREMENTS',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId,
      parentRuleId: TRule.ruleId
    }
  });

  const T33Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T3.3',
      ruleContent: 'Minimum Material Requirements',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId,
      parentRuleId: T3Rule.ruleId
    }
  });

  const T332Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T3.3.2',
      ruleContent:
        'When a cutout, or a hole greater in diameter than 3/16 inch (4 mm), is made in a regulated tube, e.g. to mount the safety harness or suspension and steering components, in order to regain the baseline, cold rolled strength of the original tubing, the tubing must be reinforced by the use of a welded insert or other reinforcement. The welded strength figures given above must be used for the additional material. And the details, including dimensioned drawings, must be included in the SES.',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId,
      parentRuleId: T33Rule.ruleId
    }
  });

  const T331Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T3.3.1',
      ruleContent:
        'Baseline Steel Material The Primary Structure of the car must be constructed of: Either: Round, mild or alloy, steel tubing (minimum 0.1% carbon) of the minimum dimensions specified in Table 4 . Or: Approved alternatives per Rules T3.3, T3.3.2, T3.5 and T3.6.',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId,
      parentRuleId: T33Rule.ruleId,
      referencedRule: {
        connect: [{ ruleId: T33Rule.ruleId }, { ruleId: T332Rule.ruleId }] // add other references later
      }
    }
  });

  const T312Rule = await prisma.rule.create({
    data: {
      ruleCode: 'T3.12',
      ruleContent: 'Main Hoop Bracing',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId,
      parentRuleId: T3Rule.ruleId
    }
  });

  // T3.12.1 references T3.3.1
  await prisma.rule.create({
    data: {
      ruleCode: 'T3.12.1',
      ruleContent: 'Main Hoop braces must be constructed of closed section steel tubing per Rule T3.3.1.',
      rulesetId: fheRulesetId,
      createdByUserId: batman.userId,
      parentRuleId: T312Rule.ruleId,
      referencedRule: {
        connect: [{ ruleId: T331Rule.ruleId }] // Referenced rule
      }
    }
  });

  // Add mock rules to mock ruleset for depth testing

  const rule1 = await prisma.rule.create({
    data: {
      ruleCode: '1',
      ruleContent: '',
      rulesetId: mockRulesetId,
      createdByUserId: superman.userId
    }
  });

  const rule2 = await prisma.rule.create({
    data: {
      ruleCode: '1.1',
      ruleContent: '',
      rulesetId: mockRulesetId,
      parentRuleId: rule1.ruleId,
      createdByUserId: superman.userId
    }
  });

  const rule3 = await prisma.rule.create({
    data: {
      ruleCode: '1.1.1',
      ruleContent: '',
      rulesetId: mockRulesetId,
      parentRuleId: rule2.ruleId,
      createdByUserId: superman.userId
    }
  });

  const rule4 = await prisma.rule.create({
    data: {
      ruleCode: '1.1.1.1',
      ruleContent: '',
      rulesetId: mockRulesetId,
      parentRuleId: rule3.ruleId,
      createdByUserId: superman.userId
    }
  });

  const rule5 = await prisma.rule.create({
    data: {
      ruleCode: '1.1.1.1.1',
      ruleContent: '',
      rulesetId: mockRulesetId,
      parentRuleId: rule4.ruleId,
      createdByUserId: superman.userId
    }
  });

  await prisma.rule.create({
    data: {
      ruleCode: '1.1.1.1.1.1',
      ruleContent: '',
      rulesetId: mockRulesetId,
      parentRuleId: rule5.ruleId,
      createdByUserId: superman.userId
    }
  });

  // Add rule to husky team and then bodywork project and mark as completed
  await RulesService.toggleRuleTeam(T112ARule.ruleId, huskyTeamId, batman, organization);
  await RulesService.createProjectRule(batman, organization, T112ARule.ruleId, projectId);
  await RulesService.setRuleCompletion(batman, organization, T112ARule.ruleId, true, projectId);
};

export const ruleSeedData = {
  rulesetTypeFHE,
  rulesetTypeFSAE,
  mockRulesetType,
  rulesetFSAE,
  rulesetFHE,
  rulesetMock,
  projectRule1,
  projectRule2
};
