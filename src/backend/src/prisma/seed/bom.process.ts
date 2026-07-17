import { Material } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationProcess, OrganizationOutput } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import { CarOutput, DateRange } from '../context.js';
import { CarProcess } from './car.process.js';
import {
  generateProjectBOMCount,
  generateAssemblyName,
  generateMaterialName,
  generateMaterialDateCreated,
  generateMaterialStatus,
  assemblyCreateInput,
  materialCreateInput
} from '../factories/bom.factory.js';

type BOMInput = OrganizationOutput & UsersOutput & ConfigDataOutput & WorkPackageOutput & CarOutput;

export type BOMOutput = {
  materialsByProjectId: Record<string, Material[]>;
};

const ASSEMBLY_PROBABILITY = 0.3;
const BATCH_SIZE = 20;
const MATERIAL_BATCH_SIZE = 50;

export class BOMProcess extends SeedProcess<BOMInput, BOMOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ConfigDataProcess, WorkPackageProcess, CarProcess];
  }

  async run({
    projects,
    materialTypes,
    manufacturers,
    units,
    leadership,
    heads,
    admins,
    appAdmins,
    currentYearCar
  }: BOMInput): Promise<BOMOutput> {
    const creators = [...leadership, ...heads, ...admins, ...appAdmins];
    const materialsByProjectId: Record<string, Material[]> = {};
    const now = new Date();

    for (let i = 0; i < projects.length; i += BATCH_SIZE) {
      const batch = projects.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async ({ project, timeline }) => {
          // materials can only ever be created on a project's own WBS element (never a work package's) -
          // BillOfMaterialsService.createMaterial/createAssembly/editMaterial all resolve the target via
          // ProjectsService.getSingleProjectWithQueryArgs, which requires isProjectWbs (workPackageNumber === 0)
          const isCurrentYearCar = project.carId === currentYearCar.car.carId;
          const count = generateProjectBOMCount(this.faker);

          materialsByProjectId[project.projectId] = await this.generateBOMForWbsElement(
            project.wbsElement,
            timeline,
            isCurrentYearCar,
            now,
            count,
            creators,
            materialTypes,
            manufacturers,
            units
          );
        })
      );
    }

    return { materialsByProjectId };
  }

  private async generateBOMForWbsElement(
    wbsElement: { wbsElementId: string; name: string },
    timeline: DateRange,
    isCurrentYearCar: boolean,
    now: Date,
    count: number,
    creators: UsersOutput['leadership'],
    materialTypes: BOMInput['materialTypes'],
    manufacturers: BOMInput['manufacturers'],
    units: BOMInput['units']
  ): Promise<Material[]> {
    if (count === 0) return [];

    const creator = this.faker.helpers.arrayElement(creators);
    const hasAssembly = this.faker.datatype.boolean({ probability: ASSEMBLY_PROBABILITY });

    let assemblyId: string | undefined;

    if (hasAssembly) {
      const { assemblyId: newAssemblyId } = await this.prisma.assembly.create({
        data: assemblyCreateInput(
          generateAssemblyName(this.faker),
          wbsElement.wbsElementId,
          creator.userId,
          generateMaterialDateCreated(this.faker, timeline, now)
        )
      });
      assemblyId = newAssemblyId;
    }

    const materials: Material[] = [];

    for (let i = 0; i < count; i += MATERIAL_BATCH_SIZE) {
      const batchCount = Math.min(MATERIAL_BATCH_SIZE, count - i);

      const batchMaterials = await Promise.all(
        Array.from({ length: batchCount }, () => {
          const materialType = this.faker.helpers.arrayElement(materialTypes);
          const name = generateMaterialName(this.faker, materialType.name);
          const dateCreated = generateMaterialDateCreated(this.faker, timeline, now);
          const status = generateMaterialStatus(this.faker, isCurrentYearCar);
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
              dateCreated,
              assemblyId,
              manufacturer?.id,
              unit?.id,
              quantity,
              price
            )
          });
        })
      );

      materials.push(...batchMaterials);
    }

    return materials;
  }
}
