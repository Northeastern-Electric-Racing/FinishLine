import { Change_Request } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import {
  crCountForProject,
  crCountForWorkPackage,
  createSeedChangeRequest,
  SeedCrParent
} from '../factories/change-request.factory.js';

type ChangeRequestInput = OrganizationOutput & ProjectOutput & UsersOutput & WorkPackageOutput & ConfigDataOutput;

export type ChangeRequestOutput = {
  changeRequests: Change_Request[];
  changeRequestsByWbsElementId: Record<string, Change_Request[]>;
};

export class ChangeRequestProcess extends SeedProcess<ChangeRequestInput, ChangeRequestOutput> {
  private identifierCounter = 1;

  dependencies() {
    return [OrganizationProcess, ProjectProcess, UsersProcess, WorkPackageProcess, ConfigDataProcess];
  }

  private allocateIdentifiers(count: number): number[] {
    const identifiers = Array.from({ length: count }, (_, offset) => this.identifierCounter + offset);
    this.identifierCounter += count;
    return identifiers;
  }

  async run({
    organization,
    projects,
    workPackagesByProjectId,
    members,
    leadership,
    heads,
    admins,
    appAdmins,
    reimbursementProductOtherReasons
  }: ChangeRequestInput): Promise<ChangeRequestOutput> {
    const { organizationId } = organization;

    if (projects.length === 0) {
      throw new Error('ChangeRequestProcess requires at least one project.');
    }

    this.identifierCounter = 1;

    const submitterPool = [...members, ...leadership, ...heads, ...admins, ...appAdmins];
    const reviewerPool = [...leadership, ...heads, ...admins, ...appAdmins];

    if (submitterPool.length === 0 || reviewerPool.length === 0) {
      throw new Error('ChangeRequestProcess requires submitters and reviewers.');
    }

    const generateBudgetReasonId = (): string | undefined =>
      reimbursementProductOtherReasons.length > 0
        ? this.faker.helpers.arrayElement(reimbursementProductOtherReasons).otherReimbursementProductReasonId
        : undefined;

    const changeRequests: Change_Request[] = [];

    for (const { project, timeline } of projects) {
      const projectWorkPackages = workPackagesByProjectId[project.projectId] ?? [];

      // project-scoped CRs (standard / budget / leadership)
      const { leadId: projectLeadId, managerId: projectManagerId } = project.wbsElement;
      const projectParent: SeedCrParent = {
        wbsElementId: project.wbsElementId,
        timeline,
        leadId: projectLeadId ?? undefined,
        managerId: projectManagerId ?? undefined
      };

      const projectCrIdentifiers = this.allocateIdentifiers(crCountForProject(this.faker));

      const projectCrs = await Promise.all(
        projectCrIdentifiers.map((identifier) =>
          this.prisma.change_Request.create({
            data: createSeedChangeRequest(
              this.faker,
              projectParent,
              false,
              identifier,
              organizationId,
              this.faker.helpers.arrayElement(submitterPool).userId,
              this.faker.helpers.arrayElement(reviewerPool).userId,
              generateBudgetReasonId()
            )
          })
        )
      );
      changeRequests.push(...projectCrs);

      const wpCrs = await Promise.all(
        projectWorkPackages.flatMap(({ workPackage, timeline: wpTimeline }) => {
          const { leadId: wpLeadId, managerId: wpManagerId } = workPackage.wbsElement;
          const wpParent: SeedCrParent = {
            wbsElementId: workPackage.wbsElement.wbsElementId,
            timeline: wpTimeline,
            leadId: wpLeadId ?? undefined,
            managerId: wpManagerId ?? undefined
          };

          const wpCrIdentifiers = this.allocateIdentifiers(crCountForWorkPackage(this.faker));

          return wpCrIdentifiers.map((identifier) =>
            this.prisma.change_Request.create({
              data: createSeedChangeRequest(
                this.faker,
                wpParent,
                true,
                identifier,
                organizationId,
                this.faker.helpers.arrayElement(submitterPool).userId,
                this.faker.helpers.arrayElement(reviewerPool).userId,
                undefined
              )
            })
          );
        })
      );
      changeRequests.push(...wpCrs);
    }

    const changeRequestsByWbsElementId = changeRequests.reduce<Record<string, Change_Request[]>>((acc, cr) => {
      if (cr.wbsElementId) {
        acc[cr.wbsElementId] ??= [];
        acc[cr.wbsElementId].push(cr);
      }
      return acc;
    }, {});

    return {
      changeRequests,
      changeRequestsByWbsElementId
    };
  }
}
