import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationProcess, OrganizationOutput } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import { Material_Status } from '@prisma/client';
import {
  generateProjectBOMCount,
  splitBOMCount,
  generateAssemblyName,
  generateMaterialName,
  assemblyCreateInput,
  materialCreateInput
} from '../factories/bom.factory.js';

type BOMInput = OrganizationOutput & UsersOutput & ConfigDataOutput & ProjectOutput & WorkPackageOutput;

const ASSEMBLY_PROBABILITY = 0.3;
const BATCH_SIZE = 20;

export class BOMProcess extends SeedProcess<BOMInput, Record<string, never>> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ConfigDataProcess, ProjectProcess, WorkPackageProcess];
  }

  async run({
    projects,
    workPackagesByProjectId,
    materialTypes,
    manufacturers,
    units,
    leadership,
    heads,
    admins,
    appAdmins
  }: BOMInput): Promise<Record<string, never>> {
    const creators = [...leadership, ...heads, ...admins, ...appAdmins];

    for (let i = 0; i < projects.length; i += BATCH_SIZE) {
      const batch = projects.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(({ project }) => {
          const projectWPs = workPackagesByProjectId[project.projectId] ?? [];
          const allWbsElements = [project.wbsElement, ...projectWPs.map(({ workPackage }) => workPackage.wbsElement)];

          const totalCount = generateProjectBOMCount(this.faker);
          const counts = splitBOMCount(this.faker, totalCount, allWbsElements.length);

          return Promise.all(
            allWbsElements.map((wbsElement, index) =>
              this.generateBOMForWbsElement(wbsElement, counts[index], creators, materialTypes, manufacturers, units)
            )
          );
        })
      );
    }

    return {};
  }

  private async generateBOMForWbsElement(
    wbsElement: { wbsElementId: string; name: string },
    count: number,
    creators: UsersOutput['leadership'],
    materialTypes: BOMInput['materialTypes'],
    manufacturers: BOMInput['manufacturers'],
    units: BOMInput['units']
  ) {
    if (count === 0) return;

    const creator = this.faker.helpers.arrayElement(creators);
    const hasAssembly = this.faker.datatype.boolean({ probability: ASSEMBLY_PROBABILITY });

    let assemblyId: string | undefined;

    if (hasAssembly) {
      const { assemblyId: newAssemblyId } = await this.prisma.assembly.create({
        data: assemblyCreateInput(generateAssemblyName(this.faker), wbsElement.wbsElementId, creator.userId)
      });
      assemblyId = newAssemblyId;
    }

    await Promise.all(
      Array.from({ length: count }, () => {
        const materialType = this.faker.helpers.arrayElement(materialTypes);
        const name = generateMaterialName(this.faker, materialType.name);
        const status = this.faker.helpers.arrayElement(Object.values(Material_Status));
        const manufacturer = this.faker.helpers.maybe(() => this.faker.helpers.arrayElement(manufacturers), {
          probability: 0.6
        });
        const unit = this.faker.helpers.maybe(() => this.faker.helpers.arrayElement(units), { probability: 0.5 });
        const quantity = this.faker.helpers.maybe(() => this.faker.number.int({ min: 1, max: 20 }), { probability: 0.7 });
        const price = this.faker.helpers.maybe(() => this.faker.number.int({ min: 10, max: 50000 }), { probability: 0.7 });

        return this.prisma.material.create({
          data: materialCreateInput(
            name,
            wbsElement.wbsElementId,
            creator.userId,
            materialType.id,
            status,
            assemblyId,
            manufacturer?.id,
            unit?.id,
            quantity,
            price
          )
        });
      })
    );
  }
}
