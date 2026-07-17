import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationProcess, OrganizationOutput } from './organization.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import {
  generateDescriptionBulletCount,
  generateDescriptionBulletText,
  descriptionBulletCreateInput
} from '../factories/description-bullet.factory.js';

type DescriptionBulletInput = OrganizationOutput & ConfigDataOutput & WorkPackageOutput;

export class DescriptionBulletProcess extends SeedProcess<DescriptionBulletInput, Record<string, never>> {
  dependencies() {
    return [OrganizationProcess, ConfigDataProcess, WorkPackageProcess];
  }

  async run({ projects, workPackages, descriptionBulletTypes }: DescriptionBulletInput): Promise<Record<string, never>> {
    const [bulletType] = descriptionBulletTypes;

    await Promise.all([
      ...projects.map(({ project }) =>
        this.createBulletsForWbsElement(project.wbsElement.wbsElementId, project.wbsElement.name, bulletType.id)
      ),
      ...workPackages.map(({ workPackage }) =>
        this.createBulletsForWbsElement(workPackage.wbsElement.wbsElementId, workPackage.wbsElement.name, bulletType.id)
      )
    ]);

    return {};
  }

  private async createBulletsForWbsElement(wbsElementId: string, name: string, bulletTypeId: string) {
    const count = generateDescriptionBulletCount(this.faker);
    const usedDetails = new Set<string>();

    for (let i = 0; i < count; i++) {
      let detail = generateDescriptionBulletText(this.faker, name);
      while (usedDetails.has(detail)) {
        detail = generateDescriptionBulletText(this.faker, name);
      }
      usedDetails.add(detail);

      await this.prisma.description_Bullet.create({
        data: descriptionBulletCreateInput(detail, bulletTypeId, wbsElementId)
      });
    }
  }
}
