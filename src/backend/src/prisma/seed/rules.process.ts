/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Ruleset, Ruleset_Type } from '@prisma/client';
import { User } from 'shared';
import { SeedProcess } from '../processes/seed-process.js';
import { CarOutput } from '../context.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { CarProcess } from './car.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { ruleSeedData, seedFsaeRules } from '../seed-data/rules.seed.js';

type RulesInput = OrganizationOutput & UsersOutput & CarOutput & ProjectOutput;

export type RulesOutput = {
  rulesetTypes: Ruleset_Type[];
  rulesets: Ruleset[];
};

export class RulesProcess extends SeedProcess<RulesInput, RulesOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, CarProcess, ProjectProcess];
  }

  async run({
    organization,
    appAdmins,
    admins,
    heads,
    leadership,
    members,
    cars,
    currentYearCar,
    projects
  }: RulesInput): Promise<RulesOutput> {
    const { organizationId } = organization;

    const author = appAdmins[0] ?? admins[0] ?? heads[0];
    if (!author) throw new Error('RulesProcess requires an app admin/admin/head to author rules.');

    const creatorPool: User[] = [...leadership, ...heads, ...admins, ...appAdmins, ...members];
    if (creatorPool.length === 0) throw new Error('RulesProcess requires at least one user to credit as a rule creator.');

    const creatorAt = (index: number): User => creatorPool[index % creatorPool.length];

    // The rule chain is assigned to a team and then to a project, so take the team from the project itself
    const target = projects.find(({ project }) => project.teams.some((team) => !team.dateArchived));
    if (!target) throw new Error('RulesProcess requires a project with at least one non-archived team.');

    const targetProjectId = target.project.projectId;
    const targetTeamId = target.project.teams.find((team) => !team.dateArchived)!.teamId;

    // Both real rulebooks are scoped to the current car
    const primaryCarId = currentYearCar.car.carId;
    const mockCarId = (cars.find(({ car }) => car.carId !== primaryCarId) ?? currentYearCar).car.carId;

    const [fsaeRulesetType, fheRulesetType, mockRulesetTypeRecord] = await Promise.all([
      this.prisma.ruleset_Type.create({ data: ruleSeedData.rulesetTypeFSAE(author.userId, organizationId) }),
      this.prisma.ruleset_Type.create({ data: ruleSeedData.rulesetTypeFHE(author.userId, organizationId) }),
      this.prisma.ruleset_Type.create({ data: ruleSeedData.mockRulesetType(author.userId, organizationId) })
    ]);

    const [rulesetFSAE, rulesetFHE, rulesetMock] = await Promise.all([
      this.prisma.ruleset.create({
        data: ruleSeedData.rulesetFSAE(primaryCarId, author.userId, fsaeRulesetType.rulesetTypeId)
      }),
      this.prisma.ruleset.create({
        data: ruleSeedData.rulesetFHE(primaryCarId, author.userId, fheRulesetType.rulesetTypeId)
      }),
      this.prisma.ruleset.create({
        data: ruleSeedData.rulesetMock(mockCarId, author.userId, mockRulesetTypeRecord.rulesetTypeId)
      })
    ]);

    await seedFsaeRules(
      this.prisma,
      rulesetFSAE.rulesetId,
      rulesetFHE.rulesetId,
      rulesetMock.rulesetId,
      {
        batman: author,
        thomasEmrax: creatorAt(0),
        joeShmoe: creatorAt(1),
        joeBlow: creatorAt(2),
        superman: creatorAt(3)
      },
      organization,
      targetProjectId,
      targetTeamId
    );

    return {
      rulesetTypes: [fsaeRulesetType, fheRulesetType, mockRulesetTypeRecord],
      rulesets: [rulesetFSAE, rulesetFHE, rulesetMock]
    };
  }
}
