import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { carCreateInput, getCarConfigs } from '../factories/car.factory.js';
import { CarContext, CarOutput } from '../context.js';

const CURRENT_YEAR = new Date().getFullYear();

export class CarProcess extends SeedProcess<OrganizationOutput, CarOutput> {
  dependencies() {
    return [OrganizationProcess];
  }

  async run({ organization }: OrganizationOutput): Promise<CarOutput> {
    const { organizationId } = organization;
    const carConfigs = getCarConfigs(this.faker);

    const cars: CarContext[] = await Promise.all(
      carConfigs.map(async ({ name, carNumber, year, dateRange }) => {
        const car = await this.prisma.car.create({
          data: carCreateInput(name, carNumber, organizationId),
          include: { wbsElement: true }
        });

        return { car, year, dateRange };
      })
    );

    const currentYearCar = cars.find((car) => car.year === CURRENT_YEAR)!;

    return { cars, currentYearCar };
  }
}
