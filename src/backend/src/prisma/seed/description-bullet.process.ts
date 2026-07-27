import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationProcess, OrganizationOutput } from './organization.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import { DateRange } from '../context.js';
import {
  generateDescriptionBulletCount,
  generateDescriptionBulletDateAdded,
  generateDescriptionBulletText,
  descriptionBulletCreateInput
} from '../factories/description-bullet.factory.js';

type DescriptionBulletInput = OrganizationOutput & ConfigDataOutput & ProjectOutput & WorkPackageOutput;

export class DescriptionBulletProcess extends SeedProcess<DescriptionBulletInput, Record<string, never>> {
  dependencies() {
    return [OrganizationProcess, ConfigDataProcess, ProjectProcess, WorkPackageProcess];
  }

  async run({ projects, workPackages, descriptionBulletTypes }: DescriptionBulletInput): Promise<Record<string, never>> {
    const [bulletType] = descriptionBulletTypes;
    const now = new Date();

    await Promise.all([
      ...projects.map(({ project, timeline }) =>
        this.createBulletsForWbsElement(
          project.wbsElement.wbsElementId,
          project.wbsElement.name,
          bulletType.id,
          timeline,
          now
        )
      ),
      ...workPackages.map(({ workPackage, timeline }) =>
        this.createBulletsForWbsElement(
          workPackage.wbsElement.wbsElementId,
          workPackage.wbsElement.name,
          bulletType.id,
          timeline,
          now
        )
      )
    ]);

    return {};
  }

  private async createBulletsForWbsElement(
    wbsElementId: string,
    name: string,
    bulletTypeId: string,
    timeline: DateRange,
    now: Date
  ) {
    const count = generateDescriptionBulletCount(this.faker);
    const usedDetails = new Set<string>();

    for (let i = 0; i < count; i++) {
      let detail = generateDescriptionBulletText(this.faker, name);
      while (usedDetails.has(detail)) {
        detail = generateDescriptionBulletText(this.faker, name);
      }
      usedDetails.add(detail);

      const dateAdded = generateDescriptionBulletDateAdded(this.faker, timeline, now);

      await this.prisma.description_Bullet.create({
        data: descriptionBulletCreateInput(detail, bulletTypeId, wbsElementId, dateAdded)
      });
    }
  }
}
