import RulesService from '../../src/services/rules.services';
import { Organization, User, Project, Car, Ruleset_Type, Ruleset, Rule_Completion } from '@prisma/client';
import {
  supermanAdmin,
  financeMember,
  wonderwomanGuest,
  batmanAppAdmin,
  aquamanLeadership,
  alfred,
  flashAdmin
} from '../test-data/users.test-data';
import {
  createTestOrganization,
  createTestProject,
  createTestUser,
  resetUsers,
  createTestTeam,
  createTestTeamType
} from '../test-utils';
import prisma from '../../src/prisma/prisma';
import {
  AccessDeniedException,
  DeletedException,
  HttpException,
  NotFoundException,
  AccessDeniedAdminOnlyException,
  InvalidOrganizationException
} from '../../src/utils/errors.utils';

describe('Create Rules Tests', () => {
  let orgId: string;
  let organization: Organization;
  let batman: User;
  let superman: User;
  let aquaman: User;
  let wonderwoman: User;
  let rulesetId: string;
  let carId: string;
  let rulesetType: Ruleset_Type;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    batman = await createTestUser(batmanAppAdmin, orgId);
    superman = await createTestUser(supermanAdmin, orgId);
    aquaman = await createTestUser(aquamanLeadership, orgId);
    wonderwoman = await createTestUser(wonderwomanGuest, orgId);

    const car = await prisma.car.create({
      data: {
        wbsElement: {
          create: {
            name: 'Test Car',
            carNumber: 0,
            projectNumber: 0,
            workPackageNumber: 0,
            organizationId: orgId
          }
        }
      }
    });
    ({ carId } = car);

    rulesetType = await prisma.ruleset_Type.create({
      data: {
        name: 'FSAE Rules',
        createdBy: { connect: { userId: batman.userId } },
        organization: { connect: { organizationId: organization.organizationId } }
      }
    });

    const ruleset = await prisma.ruleset.create({
      data: {
        fileId: 'test-file-id',
        name: '2025 FSAE Rules',
        active: true,
        rulesetType: { connect: { rulesetTypeId: rulesetType.rulesetTypeId } },
        car: { connect: { carId } },
        createdBy: { connect: { userId: batman.userId } }
      }
    });
    ({ rulesetId } = ruleset);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Rule', () => {
    it('successfully creates a basic rule', async () => {
      const rule = await RulesService.createRule(
        batman,
        'T.1.1.1',
        'The vehicle must have four wheels',
        rulesetId,
        organization
      );

      expect(rule.ruleCode).toBe('T.1.1.1');
      expect(rule.ruleContent).toBe('The vehicle must have four wheels');
      expect(rule.parentRule).toBeUndefined();
      expect(rule.subRuleIds).toHaveLength(0);
      expect(rule.referencedRuleIds).toHaveLength(0);
      expect(rule.imageFileIds).toHaveLength(0);
    });

    it('successfully creates a rule with a parent', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.1.1', 'Vehicle Requirements', rulesetId, organization);

      const childRule = await RulesService.createRule(
        superman,
        'T.1.1.1',
        'The vehicle must have four wheels',
        rulesetId,
        organization,
        parentRule.ruleId
      );

      expect(childRule.parentRule?.ruleId).toBe(parentRule.ruleId);
      expect(childRule.ruleCode).toBe('T.1.1.1');
    });

    it('successfully creates a rule with referenced rules', async () => {
      const rule1 = await RulesService.createRule(batman, 'T.1.1', 'Vehicle must have wheels', rulesetId, organization);

      const rule2 = await RulesService.createRule(batman, 'T.1.2', 'Vehicle must have brakes', rulesetId, organization);

      const rule3 = await RulesService.createRule(
        superman,
        'T.2.1',
        'Braking system must work with wheels (see T.1.1 and T.1.2)',
        rulesetId,
        organization,
        undefined,
        [rule1.ruleId, rule2.ruleId]
      );

      expect(rule3.referencedRuleIds).toHaveLength(2);
      expect(rule3.referencedRuleIds).toContain(rule1.ruleId);
      expect(rule3.referencedRuleIds).toContain(rule2.ruleId);
    });

    it('successfully creates a rule with image file IDs', async () => {
      const rule = await RulesService.createRule(
        batman,
        'T.3.1',
        'Chassis must meet specifications',
        rulesetId,
        organization,
        undefined,
        [],
        ['file-id-1', 'file-id-2']
      );

      expect(rule.imageFileIds).toHaveLength(2);
      expect(rule.imageFileIds).toContain('file-id-1');
      expect(rule.imageFileIds).toContain('file-id-2');
    });

    it('fails when guest tries to create a rule', async () => {
      await expect(RulesService.createRule(wonderwoman, 'T.1.1', 'Some rule', rulesetId, organization)).rejects.toThrow(
        new AccessDeniedException('Only members and above can create rules')
      );
    });

    it('fails when ruleset does not exist', async () => {
      await expect(RulesService.createRule(batman, 'T.1.1', 'Some rule', 'fake-ruleset-id', organization)).rejects.toThrow(
        new NotFoundException('Ruleset', 'fake-ruleset-id')
      );
    });

    it('fails when ruleset is deleted', async () => {
      await prisma.ruleset.update({
        where: { rulesetId },
        data: { deletedBy: { connect: { userId: batman.userId } } }
      });

      await expect(RulesService.createRule(batman, 'T.1.1', 'Some rule', rulesetId, organization)).rejects.toThrow(
        new DeletedException('Ruleset', rulesetId)
      );
    });

    it('fails when duplicate rule code in same ruleset', async () => {
      await RulesService.createRule(batman, 'T.1.1', 'First rule', rulesetId, organization);

      await expect(RulesService.createRule(superman, 'T.1.1', 'Duplicate code', rulesetId, organization)).rejects.toThrow(
        new HttpException(400, 'Rule with code T.1.1 already exists in this ruleset')
      );
    });

    it('fails when parent rule does not exist', async () => {
      await expect(
        RulesService.createRule(batman, 'T.1.1', 'Some rule', rulesetId, organization, 'fake-parent-id')
      ).rejects.toThrow(new NotFoundException('Parent Rule', 'fake-parent-id'));
    });

    it('fails when parent rule is deleted', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.1', 'Parent', rulesetId, organization);

      await prisma.rule.update({
        where: { ruleId: parentRule.ruleId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: batman.userId } } }
      });

      await expect(
        RulesService.createRule(superman, 'T.1.1', 'Child', rulesetId, organization, parentRule.ruleId)
      ).rejects.toThrow(new DeletedException('Parent Rule', parentRule.ruleId));
    });

    it('fails when parent rule is in different ruleset', async () => {
      const otherRuleset = await prisma.ruleset.create({
        data: {
          fileId: 'other-file',
          name: 'Other Rules',
          active: true,
          rulesetTypeId: (await prisma.ruleset_Type.findFirst())!.rulesetTypeId,
          carId,
          createdByUserId: batman.userId
        }
      });

      const parentRule = await RulesService.createRule(batman, 'T.1', 'Parent', otherRuleset.rulesetId, organization);

      await expect(
        RulesService.createRule(superman, 'T.1.1', 'Child', rulesetId, organization, parentRule.ruleId)
      ).rejects.toThrow(new HttpException(400, 'Parent rule must be in the same ruleset'));
    });

    it('fails when referenced rule does not exist', async () => {
      await expect(
        RulesService.createRule(batman, 'T.1.1', 'Some rule', rulesetId, organization, undefined, ['fake-rule-id'])
      ).rejects.toThrow(new NotFoundException('Referenced Rule', 'provided IDs'));
    });

    it('fails when referenced rule is deleted', async () => {
      const rule1 = await RulesService.createRule(batman, 'T.1.1', 'Rule 1', rulesetId, organization);

      await prisma.rule.update({
        where: { ruleId: rule1.ruleId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: batman.userId } } }
      });

      await expect(
        RulesService.createRule(superman, 'T.1.2', 'Rule 2', rulesetId, organization, undefined, [rule1.ruleId])
      ).rejects.toThrow(new DeletedException('Referenced Rule', rule1.ruleId));
    });

    it('allows members and above to create rules', async () => {
      await RulesService.createRule(aquaman, 'T.1.1', 'Member created rule', rulesetId, organization);
      await RulesService.createRule(aquaman, 'T.1.2', 'Leadership created rule', rulesetId, organization);
      await RulesService.createRule(superman, 'T.1.3', 'Admin created rule', rulesetId, organization);
    });

    describe('Create ruleset', () => {
      it('successful create ruleset', async () => {
        const ruleset = await RulesService.createRuleset(
          superman,
          organization,
          'ruleset name',
          rulesetType.rulesetTypeId,
          0,
          false,
          'fileId'
        );

        expect(ruleset.name).toEqual('ruleset name');
      });
      it('Create ruleset fails when submitters is not leadership', async () => {
        await expect(
          async () =>
            await RulesService.createRuleset(
              wonderwoman,
              organization,
              'ruleset name',
              rulesetType.rulesetTypeId,
              0,
              false,
              'fileId'
            )
        ).rejects.toThrow(new AccessDeniedException('only leadership and above can create ruleset!'));
      });
      it('Create ruleset fails when given bad ruleset id', async () => {
        await expect(
          async () =>
            await RulesService.createRuleset(superman, organization, 'ruleset name', 'bad ruleset type', 0, false, 'fileId')
        ).rejects.toThrow(new NotFoundException('Ruleset Type', 'bad ruleset type'));
      });
      it('Create ruleset fails when given bad car number', async () => {
        await expect(
          async () =>
            await RulesService.createRuleset(
              superman,
              organization,
              'ruleset name',
              rulesetType.rulesetTypeId,
              12312312,
              false,
              'fileId'
            )
        ).rejects.toThrow(new NotFoundException('Car', 12312312));
      });
    });
  });

  describe('Complex Rule Scenarios', () => {
    it('creates a hierarchical rule structure', async () => {
      const root = await RulesService.createRule(batman, 'T.1', 'Technical Rules', rulesetId, organization);

      const child1 = await RulesService.createRule(
        batman,
        'T.1.1',
        'Vehicle Requirements',
        rulesetId,
        organization,
        root.ruleId
      );

      const child2 = await RulesService.createRule(
        batman,
        'T.1.2',
        'Safety Requirements',
        rulesetId,
        organization,
        root.ruleId
      );

      const grandchild1 = await RulesService.createRule(
        superman,
        'T.1.1.1',
        'Wheels',
        rulesetId,
        organization,
        child1.ruleId
      );

      expect(root.parentRule).toBeUndefined();
      expect(child1.parentRule?.ruleId).toBe(root.ruleId);
      expect(child2.parentRule?.ruleId).toBe(root.ruleId);
      expect(grandchild1.parentRule?.ruleId).toBe(child1.ruleId);
    });

    it('creates rules with cross-references', async () => {
      const wheelRule = await RulesService.createRule(batman, 'T.1.1', 'Wheel specifications', rulesetId, organization);

      const brakeRule = await RulesService.createRule(batman, 'T.1.2', 'Brake specifications', rulesetId, organization);

      const brakingSystemRule = await RulesService.createRule(
        superman,
        'T.2.1',
        'Braking system must comply with T.1.1 and T.1.2',
        rulesetId,
        organization,
        undefined,
        [wheelRule.ruleId, brakeRule.ruleId]
      );

      const wheelRuleFromDb = await prisma.rule.findUnique({
        where: { ruleId: wheelRule.ruleId },
        include: { referencedBy: true }
      });

      expect(wheelRuleFromDb?.referencedBy.some((r) => r.ruleId === brakingSystemRule.ruleId)).toBe(true);
    });
  });

  describe('Get rulesets by ruleset type', () => {
    it('Successful get rulesets by ruleset types', async () => {
      const rulesets = await RulesService.getRulesetsByRulesetType(rulesetType.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(1);
      expect(rulesets[0].name).toBe('2025 FSAE Rules');
      expect(rulesets[0].active).toBeTruthy();
      expect(rulesets[0].assignedPercentage).toBe(0);
    });

    it('Successful get rulesets by ruleset types after deleting ruleset', async () => {
      await RulesService.deleteRuleset(rulesetId, batman.userId, orgId);
      const rulesets = await RulesService.getRulesetsByRulesetType(rulesetType.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(0);
    });

    it('Successful get rulesets by ruleset types after adding ruleset', async () => {
      await prisma.ruleset.create({
        data: {
          fileId: 'test-file-id2',
          name: '2025 FSAE Rules2',
          active: true,
          rulesetType: { connect: { rulesetTypeId: rulesetType.rulesetTypeId } },
          car: { connect: { carId } },
          createdBy: { connect: { userId: batman.userId } }
        }
      });
      const rulesets = await RulesService.getRulesetsByRulesetType(rulesetType.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(2);
      expect(rulesets[0].name).toBe('2025 FSAE Rules');
      expect(rulesets[1].name).toBe('2025 FSAE Rules2');
    });
  });

  describe('Get Child Rules', () => {
    it('Successfully gets child rules for a parent rule', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.1', 'Parent Rule', rulesetId, organization);
      await RulesService.createRule(batman, 'T.1.1', 'Child Rule 1', rulesetId, organization, parentRule.ruleId);
      await RulesService.createRule(batman, 'T.1.2', 'Child Rule 2', rulesetId, organization, parentRule.ruleId);
      const childRules = await RulesService.getChildRules(parentRule.ruleId, organization);
      expect(childRules.length).toBe(2);
      expect(childRules[0].ruleCode).toBe('T.1.1');
      expect(childRules[1].ruleCode).toBe('T.1.2');
    });

    it('Successfully gets child rules after deleting child rule', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.2', 'Parent Rule', rulesetId, organization);
      const childRule = await RulesService.createRule(
        batman,
        'T.2.1',
        'Child Rule',
        rulesetId,
        organization,
        parentRule.ruleId
      );
      await RulesService.deleteRule(childRule.ruleId, batman, organization);
      const childRules = await RulesService.getChildRules(parentRule.ruleId, organization);
      expect(childRules.length).toBe(0);
    });

    it('Successfully gets child rules after adding child rule', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.3', 'Parent Rule', rulesetId, organization);
      await RulesService.createRule(batman, 'T.3.1', 'Child Rule 1', rulesetId, organization, parentRule.ruleId);
      const childRulesAfterOne = await RulesService.getChildRules(parentRule.ruleId, organization);
      expect(childRulesAfterOne.length).toBe(1);
      await RulesService.createRule(batman, 'T.3.2', 'Child Rule 2', rulesetId, organization, parentRule.ruleId);
      const childRulesAfterTwo = await RulesService.getChildRules(parentRule.ruleId, organization);
      expect(childRulesAfterTwo.length).toBe(2);
      expect(childRulesAfterTwo[0].ruleCode).toBe('T.3.1');
      expect(childRulesAfterTwo[1].ruleCode).toBe('T.3.2');
    });

    it('Fails if parent rule does not exist', async () => {
      await expect(async () => await RulesService.getChildRules('fake-rule-id', organization)).rejects.toThrow(
        new NotFoundException('Rule', 'fake-rule-id')
      );
    });

    it('Fails if parent rule is deleted', async () => {
      const parentRule = await RulesService.createRule(batman, 'T.4', 'Parent Rule', rulesetId, organization);
      await RulesService.deleteRule(parentRule.ruleId, batman, organization);
      await expect(async () => await RulesService.getChildRules(parentRule.ruleId, organization)).rejects.toThrow(
        new DeletedException('Rule', parentRule.ruleId)
      );
    });

    it('Fails if parent rule is from another organization', async () => {
      //manually create a user to avoid same googleAuthID as otherBatman
      const otherUser = await prisma.user.create({
        data: {
          firstName: alfred.firstName,
          lastName: alfred.lastName,
          email: alfred.email,
          googleAuthId: alfred.googleAuthId
        }
      });
      const otherOrganization = await prisma.organization.create({
        data: {
          name: 'Other Org',
          description: 'Another organization',
          applicationLink: '',
          userCreated: {
            connect: {
              userId: otherUser.userId
            }
          }
        }
      });
      const otherBatman = await createTestUser(flashAdmin, otherOrganization.organizationId);
      const otherCar = await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              name: 'Other Car',
              carNumber: 2,
              projectNumber: 0,
              workPackageNumber: 0,
              organizationId: otherOrganization.organizationId
            }
          }
        },
        include: { wbsElement: true }
      });

      const otherRuleset = await prisma.ruleset.create({
        data: {
          name: 'Other Ruleset',
          fileId: 'other',
          active: true,
          carId: otherCar.carId,
          createdByUserId: otherBatman.userId,
          rulesetTypeId: rulesetType.rulesetTypeId
        }
      });
      const otherParentRule = await prisma.rule.create({
        data: {
          ruleCode: 'O.1',
          ruleContent: 'Other Parent',
          imageFileIds: [],
          rulesetId: otherRuleset.rulesetId,
          createdByUserId: otherBatman.userId
        }
      });
      await expect(async () => await RulesService.getChildRules(otherParentRule.ruleId, organization)).rejects.toThrow(
        new InvalidOrganizationException('Rule')
      );
    });
  });
});

describe('Delete Rules Tests', () => {
  let organization: Organization;
  let orgId: string;
  let admin: User;
  let nonLeadership: User;
  let project: Project;
  let fsaeRulesetType: Ruleset_Type;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    admin = await createTestUser(supermanAdmin, organization.organizationId);
    nonLeadership = await createTestUser(financeMember, organization.organizationId);
    project = await createTestProject(admin, organization.organizationId);

    fsaeRulesetType = await prisma.ruleset_Type.create({
      data: {
        name: 'FSAE',
        createdBy: { connect: { userId: admin.userId } },
        organization: { connect: { organizationId: organization.organizationId } }
      }
    });
  });

  afterEach(async () => {
    await resetUsers();
  });

  const createUniqueCar = async (orgId: string) => {
    let carCounter = 1;

    const car = await prisma.car.create({
      data: {
        wbsElement: {
          create: {
            name: `Test Car ${carCounter}`,
            carNumber: carCounter,
            projectNumber: 0,
            workPackageNumber: 0,
            organizationId: orgId
          }
        }
      },
      include: {
        wbsElement: true
      }
    });
    carCounter++;
    return car;
  };

  const setupRules = async (car: Car) => {
    const ruleset1 = await prisma.ruleset.create({
      data: {
        name: 'FSAE Rules 2025',
        fileId: 'fsae-rules-2025',
        active: true,
        dateCreated: new Date(),
        car: { connect: { carId: car.carId } },
        createdBy: { connect: { userId: admin.userId } },
        rulesetType: { connect: { rulesetTypeId: fsaeRulesetType.rulesetTypeId } }
      }
    });

    const topLevelRule = await prisma.rule.create({
      data: {
        ruleCode: 'T',
        ruleContent: 'PART T - GENERAL TECHNICAL REQUIREMENTS',
        imageFileIds: [],
        dateCreated: new Date(),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } }
      }
    });

    const leafRule1 = await prisma.rule.create({
      data: {
        ruleCode: 'T2',
        ruleContent: 'The vehicle must be open-wheeled and open-cockpit...',
        imageFileIds: [],
        dateCreated: new Date(),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } },
        parentRule: { connect: { ruleId: topLevelRule.ruleId } }
      }
    });

    const leafRule2 = await prisma.rule.create({
      data: {
        ruleCode: 'T2.1',
        ruleContent: 'T2.1 Vehicle Configuration',
        imageFileIds: [],
        dateCreated: new Date(),
        ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
        createdBy: { connect: { userId: admin.userId } },
        parentRule: { connect: { ruleId: topLevelRule.ruleId } }
      }
    });

    return { ruleset1, topLevelRule, leafRule1, leafRule2 };
  };

  describe('Create Ruleset Type', () => {
    it('Fails if user is not leadership or above', async () => {
      await expect(
        async () => await RulesService.createRulesetType(await createTestUser(wonderwomanGuest, orgId), 'FSAE', organization)
      ).rejects.toThrow(new AccessDeniedException('only leadership and above can create ruleset types!'));
    });

    it('Succeeds and creates a ruleset type', async () => {
      const result = await RulesService.createRulesetType(await createTestUser(batmanAppAdmin, orgId), 'FSAE', organization);

      expect(result.name).toEqual('FSAE');
    });
  });

  describe('Project Rule endpoints', () => {
    it('Creates a project rule successfully', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, topLevelRule.ruleId, project.projectId);

      expect(projectRule.projectRuleId).toBeDefined();
      expect(projectRule.rule).toBeDefined();
      expect(projectRule.rule.ruleId).toBe(topLevelRule.ruleId);
      expect(projectRule.rule.ruleCode).toBe(topLevelRule.ruleCode);
      expect(projectRule.projectId).toBe(project.projectId);
      expect(projectRule.statusHistory).toEqual([]);
      expect(projectRule.currentStatus).toBe(Rule_Completion.REVIEW);
    });
    it('Creates a project rule successfully for a leaf rule', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);

      expect(projectRule.projectRuleId).toBeDefined();
      expect(projectRule.rule).toBeDefined();
      expect(projectRule.rule.ruleId).toBe(leafRule1.ruleId);
      expect(projectRule.rule.ruleCode).toBe(leafRule1.ruleCode);
      expect(projectRule.projectId).toBe(project.projectId);
      expect(projectRule.statusHistory).toEqual([]);
      expect(projectRule.currentStatus).toBe(Rule_Completion.REVIEW);
    });
    it('Create project rule fails if user does not have permission', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      await expect(
        async () => await RulesService.createProjectRule(nonLeadership, organization, leafRule1.ruleId, project.projectId)
      ).rejects.toThrow(new AccessDeniedException('You do not have permissions to assign rules to projects'));
    });
    it('Create project rule fails if rule was deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule2 } = await setupRules(car);

      await prisma.rule.update({
        where: { ruleId: leafRule2.ruleId },
        data: { dateDeleted: new Date() }
      });
      await expect(
        async () => await RulesService.createProjectRule(admin, organization, leafRule2.ruleId, project.projectId)
      ).rejects.toThrow(new DeletedException('Rule', leafRule2.ruleId));
    });
    it('Create project rule fails if rule does not exist', async () => {
      await expect(
        async () => await RulesService.createProjectRule(admin, organization, '019263825673825738', project.projectId)
      ).rejects.toThrow(new NotFoundException('Rule', '019263825673825738'));
    });
    it('Create project rule fails if project was deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule2 } = await setupRules(car);
      await prisma.project.update({
        where: { projectId: project.projectId },
        data: {
          wbsElement: {
            update: { dateDeleted: new Date() }
          }
        }
      });
      await expect(
        async () => await RulesService.createProjectRule(admin, organization, leafRule2.ruleId, project.projectId)
      ).rejects.toThrow(new DeletedException('Project', project.projectId));
    });
    it('Create project rule fails if project does not exist', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      await expect(RulesService.createProjectRule(admin, organization, leafRule1.ruleId, 'fake-project-id')).rejects.toThrow(
        new NotFoundException('Project', 'fake-project-id')
      );
    });
    it('Create project rule fails if project rule assignment already exists', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);
      await expect(RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId)).rejects.toThrow(
        new HttpException(400, 'This rule is already associated with the project')
      );
    });

    // Updating Project Rule Status
    it('Updates a project rule status successfully', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, topLevelRule.ruleId, project.projectId);

      const updatedProjectRule = await RulesService.editProjectRuleStatus(
        admin,
        organization,
        projectRule.projectRuleId,
        Rule_Completion.COMPLETED
      );

      expect(updatedProjectRule.projectRuleId).toBe(projectRule.projectRuleId);
      expect(updatedProjectRule.currentStatus).toBe(Rule_Completion.COMPLETED);
      expect(updatedProjectRule.statusHistory.length).toBe(1);
      expect(updatedProjectRule.statusHistory[0].newStatus).toBe(Rule_Completion.COMPLETED);
      expect(updatedProjectRule.statusHistory[0].projectRuleId).toBe(projectRule.projectRuleId);
      expect(updatedProjectRule.statusHistory[0].createdBy.userId).toBe(admin.userId);
      expect(new Date(updatedProjectRule.statusHistory[0].dateCreated).getTime()).toBeGreaterThan(Date.now() - 10000);
    });

    it('Updates a project rule status to the same status', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, topLevelRule.ruleId, project.projectId);

      const updatedProjectRule = await RulesService.editProjectRuleStatus(
        admin,
        organization,
        projectRule.projectRuleId,
        Rule_Completion.REVIEW
      );

      expect(updatedProjectRule.projectRuleId).toBe(projectRule.projectRuleId);
      expect(updatedProjectRule.currentStatus).toBe(Rule_Completion.REVIEW);
      expect(updatedProjectRule.statusHistory).toHaveLength(0);
    });

    it('Update project rule fails if user does not have permission', async () => {
      const car = await createUniqueCar(orgId);
      const { topLevelRule } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, topLevelRule.ruleId, project.projectId);

      await expect(
        async () =>
          await RulesService.editProjectRuleStatus(
            nonLeadership,
            organization,
            projectRule.projectRuleId,
            Rule_Completion.REVIEW
          )
      ).rejects.toThrow(new AccessDeniedException('You do not have permissions to update a project rule status'));
    });
  });

  describe('Edit Rule', () => {
    it('Fails if user is not an admin', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      await expect(
        async () =>
          await RulesService.editRule(
            await createTestUser(wonderwomanGuest, orgId),
            'Some rule content',
            leafRule1.ruleId,
            leafRule1.ruleCode,
            ['newfile'],
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit a rule'));
    });

    it('Fails if rule doesn`t exist', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      await expect(
        async () =>
          await RulesService.editRule(
            await createTestUser(batmanAppAdmin, orgId),
            'Some more rule content',
            '1',
            leafRule1.ruleCode,
            ['samefile'],
            organization
          )
      ).rejects.toThrow(new NotFoundException('Rule', 1));
    });

    it('Succeeds and edits a rule', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      const updatedRule = await RulesService.editRule(
        admin,
        'BRAND NEW RULE CONTENT',
        leafRule1.ruleId,
        leafRule1.ruleCode,
        leafRule1.imageFileIds,
        organization
      );

      expect(updatedRule.ruleContent).toEqual('BRAND NEW RULE CONTENT');
    });
  });

  describe('Delete Ruleset', () => {
    it('Deletes a ruleset successfully and returns the correct information', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);
      const totalRules = await prisma.rule.count({
        where: { rulesetId: ruleset1.rulesetId }
      });
      const rulesWithTeams = await prisma.rule.count({
        where: {
          rulesetId: ruleset1.rulesetId,
          teams: { some: {} }
        }
      });
      const expectedPercentage = totalRules > 0 ? (rulesWithTeams / totalRules) * 100 : 0;
      const deleted = await RulesService.deleteRuleset(ruleset1.rulesetId, admin.userId, organization.organizationId);

      expect(deleted).toBeDefined();
      expect(deleted.rulesetId).toBe(ruleset1.rulesetId);
      expect(deleted.assignedPercentage).toBeCloseTo(expectedPercentage, 2);
    });
    it('Delete ruleset fails if user does not have permission', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      await expect(
        async () => await RulesService.deleteRuleset(ruleset1.rulesetId, nonLeadership.userId, organization.organizationId)
      ).rejects.toThrow(new AccessDeniedException('Only admins can delete a ruleset.'));
    });
    it('Delete ruleset fails if ruleset was already deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      await RulesService.deleteRuleset(ruleset1.rulesetId, admin.userId, organization.organizationId);
      await expect(
        async () => await RulesService.deleteRuleset(ruleset1.rulesetId, admin.userId, organization.organizationId)
      ).rejects.toThrow(new DeletedException('Ruleset', ruleset1.rulesetId));
    });
    it('Delete ruleset fails if ruleset does not exist', async () => {
      await expect(
        async () => await RulesService.deleteRuleset('fake-ruleset-id', admin.userId, organization.organizationId)
      ).rejects.toThrow(new NotFoundException('Ruleset', 'fake-ruleset-id'));
    });
  });

  describe('Get all ruleset types', () => {
    it('Successful get all ruleset types', async () => {
      const rulesetTypes = await RulesService.getAllRulesetTypes(organization);
      expect(rulesetTypes.length).toEqual(1);
      expect(rulesetTypes[0].name).toEqual('FSAE');
    });
    it('Get all ruleset types successful after adding ruleset type', async () => {
      await prisma.ruleset_Type.create({
        data: {
          name: 'FSAE2',
          createdByUserId: admin.userId,
          organizationId: orgId
        }
      });
      const rulesetTypes = await RulesService.getAllRulesetTypes(organization);
      expect(rulesetTypes.length).toEqual(2);
      expect(rulesetTypes[1].name).toEqual('FSAE2');
    });
    it('Get all ruleset types successful after deleting ruleset type', async () => {
      await prisma.ruleset_Type.update({
        where: {
          rulesetTypeId: fsaeRulesetType.rulesetTypeId
        },
        data: {
          deletedByUserId: admin.userId
        }
      });
      const rulesetTypes = await RulesService.getAllRulesetTypes(organization);
      expect(rulesetTypes.length).toEqual(0);
    });
  });

  describe('Delete Project Rule', () => {
    it('Deletes a project rule successfully and returns the correct information', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);

      await RulesService.editProjectRuleStatus(admin, organization, projectRule.projectRuleId, Rule_Completion.COMPLETED);
      await RulesService.editProjectRuleStatus(admin, organization, projectRule.projectRuleId, Rule_Completion.INCOMPLETE);

      const deletedProjectRule = await RulesService.deleteProjectRule(projectRule.projectRuleId, admin, organization);

      expect(deletedProjectRule).toBeDefined();
      expect(deletedProjectRule.projectRuleId).toBe(projectRule.projectRuleId);

      const statusChanges = await prisma.rule_Status_Change.findMany({
        where: { projectRuleId: projectRule.projectRuleId }
      });
      expect(statusChanges.length).toBeGreaterThan(0);
      statusChanges.forEach((statusChange) => {
        expect(statusChange.dateDeleted).toBeDefined();
        expect(statusChange.deletedByUserId).toBe(admin.userId);
      });
    });
    it('Delete project rule fails if user does not have permission', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);

      await expect(
        async () => await RulesService.deleteProjectRule(projectRule.projectRuleId, nonLeadership, organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete project rules'));
    });
    it('Delete project rule fails if project rule was already deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { leafRule1 } = await setupRules(car);
      const projectRule = await RulesService.createProjectRule(admin, organization, leafRule1.ruleId, project.projectId);

      await RulesService.deleteProjectRule(projectRule.projectRuleId, admin, organization);
      await expect(
        async () => await RulesService.deleteProjectRule(projectRule.projectRuleId, admin, organization)
      ).rejects.toThrow(new DeletedException('Project Rule', projectRule.projectRuleId));
    });
    it('Delete project rule fails if project rule does not exist', async () => {
      await expect(
        async () => await RulesService.deleteProjectRule('fake-project-rule-id', admin, organization)
      ).rejects.toThrow(new NotFoundException('Project Rule', 'fake-project-rule-id'));
    });
  });

  describe('Delete Ruleset Type', () => {
    it('Fails if user not an admin', async () => {
      await expect(async () => await RulesService.deleteRulesetType(nonLeadership, 'FSAE', organization)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('delete ruleset types')
      );
    });

    it('Fails if the ruleset type has already been deleted', async () => {
      const appAdmin = await createTestUser(batmanAppAdmin, orgId);
      await RulesService.deleteRulesetType(appAdmin, fsaeRulesetType.rulesetTypeId, organization);

      await expect(RulesService.deleteRulesetType(appAdmin, fsaeRulesetType.rulesetTypeId, organization)).rejects.toThrow(
        new DeletedException('Ruleset Type', fsaeRulesetType.rulesetTypeId)
      );
    });

    it('Successfully deletes the ruleset type', async () => {
      let rulesetTypes = await RulesService.getAllRulesetTypes(organization);
      expect(rulesetTypes.length).toEqual(1);

      const appAdmin = await createTestUser(batmanAppAdmin, orgId);
      const result = await RulesService.deleteRulesetType(appAdmin, fsaeRulesetType.rulesetTypeId, organization);

      rulesetTypes = await RulesService.getAllRulesetTypes(organization);

      expect(rulesetTypes.length).toEqual(0);

      expect(result.rulesetTypeId).toBe(fsaeRulesetType.rulesetTypeId);
    });

    it('Successfully deletes all revision files in revision files', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);
      const revFiles: Ruleset[] = [ruleset1];

      const fsaeRulesetType2WithRevisionFiles = await prisma.ruleset_Type.create({
        data: {
          name: 'FSAE2',
          createdBy: { connect: { userId: admin.userId } },
          organization: { connect: { organizationId: organization.organizationId } },
          revisionFiles: { connect: revFiles }
        }
      });

      let rulesets = await RulesService.getRulesetsByRulesetType(fsaeRulesetType2WithRevisionFiles.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(1);
      await RulesService.deleteRulesetType(admin, fsaeRulesetType2WithRevisionFiles.rulesetTypeId, organization);
      rulesets = await RulesService.getRulesetsByRulesetType(fsaeRulesetType2WithRevisionFiles.rulesetTypeId, orgId);
      expect(rulesets.length).toBe(0);
    });
  });

  describe('Get Unassigned Rules', () => {
    it('Successfully gets unassigned rules', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      const unassignedRules = await RulesService.getUnassignedRules(ruleset1.rulesetId, organization);

      expect(unassignedRules.length).toBe(3);
      expect(unassignedRules.map((r) => r.ruleCode)).toContain('T');
      expect(unassignedRules.map((r) => r.ruleCode)).toContain('T2');
      expect(unassignedRules.map((r) => r.ruleCode)).toContain('T2.1');
    });

    it('Returns only rules with no team assignments', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule, leafRule1, leafRule2 } = await setupRules(car);

      const teamType = await createTestTeamType('TestTeamType', orgId);
      const team = await createTestTeam(admin.userId, teamType.teamTypeId, orgId);
      await prisma.rule.update({
        where: { ruleId: topLevelRule.ruleId },
        data: {
          teams: { connect: { teamId: team.teamId } }
        }
      });

      const unassignedRules = await RulesService.getUnassignedRules(ruleset1.rulesetId, organization);

      expect(unassignedRules.length).toBe(2);
      expect(unassignedRules.map((r) => r.ruleId)).not.toContain(topLevelRule.ruleId);
      expect(unassignedRules.map((r) => r.ruleId)).toContain(leafRule1.ruleId);
      expect(unassignedRules.map((r) => r.ruleId)).toContain(leafRule2.ruleId);
    });

    it('Returns only non-deleted rules', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule, leafRule1, leafRule2 } = await setupRules(car);

      // Delete one rule
      await prisma.rule.update({
        where: { ruleId: leafRule1.ruleId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: admin.userId } } }
      });

      const unassignedRules = await RulesService.getUnassignedRules(ruleset1.rulesetId, organization);

      expect(unassignedRules.length).toBe(2);
      expect(unassignedRules.map((r) => r.ruleId)).not.toContain(leafRule1.ruleId);
      expect(unassignedRules.map((r) => r.ruleId)).toContain(topLevelRule.ruleId);
      expect(unassignedRules.map((r) => r.ruleId)).toContain(leafRule2.ruleId);
    });

    it('Returns rules ordered by ruleCode ascending', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      // Create additional rules with different codes
      await prisma.rule.create({
        data: {
          ruleCode: 'A.1',
          ruleContent: 'Rule A',
          imageFileIds: [],
          ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
          createdBy: { connect: { userId: admin.userId } }
        }
      });

      await prisma.rule.create({
        data: {
          ruleCode: 'Z.1',
          ruleContent: 'Rule Z',
          imageFileIds: [],
          ruleset: { connect: { rulesetId: ruleset1.rulesetId } },
          createdBy: { connect: { userId: admin.userId } }
        }
      });

      const unassignedRules = await RulesService.getUnassignedRules(ruleset1.rulesetId, organization);

      expect(unassignedRules.length).toBe(5);
      // Check that rules are sorted by ruleCode
      for (let i = 0; i < unassignedRules.length - 1; i++) {
        expect(unassignedRules[i].ruleCode <= unassignedRules[i + 1].ruleCode).toBe(true);
      }
    });

    it('Returns empty array when all rules are assigned to teams', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule, leafRule1, leafRule2 } = await setupRules(car);

      // Create a team and assign all rules to it
      const teamType = await createTestTeamType('TestTeamType', orgId);
      const team = await createTestTeam(admin.userId, teamType.teamTypeId, orgId);
      await prisma.rule.updateMany({
        where: { rulesetId: ruleset1.rulesetId },
        data: {}
      });

      await prisma.rule.update({
        where: { ruleId: topLevelRule.ruleId },
        data: {
          teams: { connect: { teamId: team.teamId } }
        }
      });

      await prisma.rule.update({
        where: { ruleId: leafRule1.ruleId },
        data: {
          teams: { connect: { teamId: team.teamId } }
        }
      });

      await prisma.rule.update({
        where: { ruleId: leafRule2.ruleId },
        data: {
          teams: { connect: { teamId: team.teamId } }
        }
      });

      const unassignedRules = await RulesService.getUnassignedRules(ruleset1.rulesetId, organization);

      expect(unassignedRules.length).toBe(0);
    });

    it('Returns empty array when all rules are deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule, leafRule1, leafRule2 } = await setupRules(car);

      // Delete all rules
      await prisma.rule.update({
        where: { ruleId: topLevelRule.ruleId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: admin.userId } } }
      });

      await prisma.rule.update({
        where: { ruleId: leafRule1.ruleId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: admin.userId } } }
      });

      await prisma.rule.update({
        where: { ruleId: leafRule2.ruleId },
        data: { dateDeleted: new Date(), deletedBy: { connect: { userId: admin.userId } } }
      });

      const unassignedRules = await RulesService.getUnassignedRules(ruleset1.rulesetId, organization);

      expect(unassignedRules.length).toBe(0);
    });

    it('Fails when ruleset does not exist', async () => {
      await expect(RulesService.getUnassignedRules('fake-ruleset-id', organization)).rejects.toThrow(
        new NotFoundException('Ruleset', 'fake-ruleset-id')
      );
    });

    it('Fails when ruleset is deleted', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1 } = await setupRules(car);

      await RulesService.deleteRuleset(ruleset1.rulesetId, admin.userId, organization.organizationId);

      await expect(RulesService.getUnassignedRules(ruleset1.rulesetId, organization)).rejects.toThrow(
        new DeletedException('Ruleset', ruleset1.rulesetId)
      );
    });

    it('Returns rules with parent and subRules correctly transformed', async () => {
      const car = await createUniqueCar(orgId);
      const { ruleset1, topLevelRule, leafRule1 } = await setupRules(car);

      const unassignedRules = await RulesService.getUnassignedRules(ruleset1.rulesetId, organization);

      const topRule = unassignedRules.find((r) => r.ruleId === topLevelRule.ruleId);
      const leafRule = unassignedRules.find((r) => r.ruleId === leafRule1.ruleId);

      expect(topRule).toBeDefined();
      expect(topRule?.parentRule).toBeUndefined();
      expect(topRule?.subRuleIds).toContain(leafRule1.ruleId);

      expect(leafRule).toBeDefined();
      expect(leafRule?.parentRule?.ruleId).toBe(topLevelRule.ruleId);
      expect(leafRule?.parentRule?.ruleCode).toBe(topLevelRule.ruleCode);
    });
  });
});
