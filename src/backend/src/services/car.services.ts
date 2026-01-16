import { Organization } from '@prisma/client';
import { isAdmin, User } from 'shared';
import { getCarQueryArgs } from '../prisma-query-args/cars.query-args.js';
import prisma from '../prisma/prisma.js';
import { carTransformer } from '../transformers/cars.transformer.js';
import { AccessDeniedAdminOnlyException } from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';

export default class CarsService {
  static async getAllCars(organization: Organization) {
    const cars = await prisma.car.findMany({
      where: {
        wbsElement: {
          organizationId: organization.organizationId
        }
      },
      ...getCarQueryArgs(organization.organizationId)
    });

    return cars.map(carTransformer);
  }

  static async createCar(organization: Organization, user: User, name: string) {
    if (!(await userHasPermission(user.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create a car');

    const numExistingCars = await prisma.car.count({
      where: {
        wbsElement: {
          organizationId: organization.organizationId
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
                organizationId: organization.organizationId
              }
            }
          }
        }
      },
      ...getCarQueryArgs(organization.organizationId)
    });

    return carTransformer(car);
  }
}
