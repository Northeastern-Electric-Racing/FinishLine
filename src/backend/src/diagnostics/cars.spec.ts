import CarsService from '../services/car.services';
import { BenchSpec } from './bench-types';

export const carSpecs: BenchSpec<any>[] = [
  {
    name: 'cars.getAllCars',
    tags: ['cars', 'read'],
    async prepare(ctx) {
      return { inputs: { organization: ctx.organization } };
    },
    async run({ organization }) {
      await CarsService.getAllCars(organization);
    }
  }
];
