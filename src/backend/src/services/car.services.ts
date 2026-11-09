import { Competition, Organization, Term } from '@prisma/client';
import { isAdmin, User } from 'shared';
import { getCarQueryArgs } from '../prisma-query-args/cars.query-args.js';
import prisma from '../prisma/prisma.js';
import { carTransformer } from '../transformers/cars.transformer.js';
import { AccessDeniedAdminOnlyException, NotFoundException } from '../utils/errors.utils.js';
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
        },
        executiveSummary: {
          create: {
            userCreated: {
              connect: {
                userId: user.userId
              }
            },
            // every executive summary starts with an empty performance per competition, an empty documents
            // summary, and an empty recruitment cycle per term, all of which are filled in later
            competitionPerformances: {
              create: Object.values(Competition).map((competition) => ({ competition }))
            },
            competitionDocumentsSummary: {
              create: {}
            },
            recruitmentCycles: {
              create: Object.values(Term).map((term) => ({ term }))
            }
          }
        }
      },
      ...getCarQueryArgs(organization.organizationId)
    });

    return carTransformer(car);
  }

  static async editCar(carId: string, organization: Organization, user: User, name: string) {
    if (!(await userHasPermission(user.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('edit a car');

    const car = await prisma.car.findFirst({
      where: { carId, wbsElement: { organizationId: organization.organizationId } }
    });

    if (!car) throw new NotFoundException('Car', carId);

    const editedCar = await prisma.car.update({
      where: { carId: car.carId },
      data: {
        wbsElement: {
          update: { name }
        }
      },
      ...getCarQueryArgs(organization.organizationId)
    });

    return carTransformer(editedCar);
  }
}
