/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Part, Part_Tag } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import {
  COMMON_MISTAKES,
  PART_TAGS,
  PartActor,
  commonMistakeCreateInput,
  partCountForProject,
  partCreateInput,
  partTagCreateInput
} from '../factories/parts.factory.js';

type PartInput = OrganizationOutput & UsersOutput & WorkPackageOutput;

export type PartOutput = {
  parts: Part[];
  partTags: Part_Tag[];
};

export class PartProcess extends SeedProcess<PartInput, PartOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, WorkPackageProcess];
  }

  async run({
    organization,
    members,
    leadership,
    heads,
    admins,
    appAdmins,
    projectsWithTimeline
  }: PartInput): Promise<PartOutput> {
    const { organizationId } = organization;

    const assignablePool: PartActor[] = [...members, ...leadership, ...heads, ...admins, ...appAdmins];
    const reviewers: PartActor[] = [...leadership, ...heads, ...admins, ...appAdmins];
    const leadershipPlusIds = new Set(reviewers.map((user) => user.userId));

    if (assignablePool.length === 0) throw new Error('PartProcess requires member-or-above users to author parts.');
    if (reviewers.length === 0) throw new Error('PartProcess requires leads/heads/admins to review parts.');

    const mistakeAuthor = appAdmins[0] ?? admins[0] ?? heads[0];
    if (!mistakeAuthor) throw new Error('PartProcess requires an admin/head to author common mistakes.');

    const partTags = await Promise.all(
      PART_TAGS.map((tag) => this.prisma.part_Tag.create({ data: partTagCreateInput(organizationId, tag) }))
    );
    const tagIds = partTags.map((tag) => tag.partTagId);

    await Promise.all(
      COMMON_MISTAKES.map((mistake) =>
        this.prisma.part_Review_Common_Mistake.create({
          data: commonMistakeCreateInput(organizationId, mistakeAuthor.userId, mistake)
        })
      )
    );

    // createPart requires the creator to be leadership+ or an actual member/lead/head of one of
    // the project's assigned teams - fetch full team rosters once to build a per-project eligible
    // pool for Part.userCreatedId specifically (assignees/authors/reviewers have no such
    // restriction in the real service, so they keep drawing from the full assignablePool).
    const teamsWithMembers = await this.prisma.team.findMany({
      include: { members: true, leads: true }
    });
    const onTeamUserIdsByTeamId = new Map<string, Set<string>>(
      teamsWithMembers.map((team) => [
        team.teamId,
        new Set([
          ...(team.headId ? [team.headId] : []),
          ...team.leads.map((lead) => lead.userId),
          ...team.members.map((member) => member.userId)
        ])
      ])
    );

    const now = new Date();

    // Parts (and their submissions/reviews/requests) only make sense for projects that have
    // actually started - matches the same skip used by ChangeRequestProcess/
    // ReimbursementRequestProcess/WorkPackageProcess for the same reason.
    const plannedByProject = projectsWithTimeline
      .filter(({ timeline }) => timeline.start.getTime() <= now.getTime())
      .map(({ project, timeline }) => {
        const teamMemberIds = new Set<string>();
        project.teams.forEach((team) => {
          onTeamUserIdsByTeamId.get(team.teamId)?.forEach((userId) => teamMemberIds.add(userId));
        });

        // leadershipPlusIds is always non-empty and always a subset of assignablePool, so this can
        // never come back empty - no fallback needed.
        const eligibleCreatorIds = new Set([...leadershipPlusIds, ...teamMemberIds]);
        const eligibleCreators = assignablePool.filter((user) => eligibleCreatorIds.has(user.userId));

        const count = partCountForProject(this.faker);
        return Array.from({ length: count }, (_, i) =>
          partCreateInput(
            this.faker,
            project.projectId,
            i + 1,
            timeline,
            now,
            eligibleCreators,
            assignablePool,
            reviewers,
            tagIds
          )
        );
      });

    const parts = (
      await Promise.all(
        plannedByProject.map(async (partInputs) => {
          const created: Part[] = [];
          for (const data of partInputs) {
            created.push(await this.prisma.part.create({ data }));
          }
          return created;
        })
      )
    ).flat();

    return { parts, partTags };
  }
}
