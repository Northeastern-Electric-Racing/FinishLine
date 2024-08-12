import { User } from '@prisma/client';
import { isAdmin } from 'shared';
import { getCarQueryArgs } from '../prisma-query-args/cars.query-args';
import prisma from '../prisma/prisma';
import { carTransformer } from '../transformers/cars.transformer';
import { AccessDeniedAdminOnlyException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { validateOrganizationId } from '../../tests/test-utils';

export default class CarsService {
  static async getAllCars(organizationId: string) {
    const cars = await prisma.car.findMany({
      where: {
        wbsElement: {
          organizationId
        }
      },
      ...getCarQueryArgs(organizationId)
    });

    return cars.map(carTransformer);
  }

  static async createCar(organizationId: string, user: User, name: string) {
    if (!(await userHasPermission(user.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create a car');

    validateOrganizationId(organizationId);

    const numExistingCars = await prisma.car.count({
      where: {
        wbsElement: {
          organizationId
        }
      }
    });

    const car = await prisma.car.create({
      data: {
        wbsElement: {
          create: {
            name,
            carNumber: numExistingCars,
            projectNumber: 0,
            workPackageNumber: 0,
            organization: {
              connect: {
                organizationId
              }
            }
          }
        }
      },
      ...getCarQueryArgs(organizationId)
    });

    return carTransformer(car);
  }
}
