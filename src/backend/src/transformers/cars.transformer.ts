import { Prisma } from '@prisma/client';
import { Car, WbsElementStatus } from 'shared';
import { CarQueryArgs } from '../prisma-query-args/cars.query-args.js';
import { descBulletConverter } from '../utils/description-bullets.utils.js';
import { wbsNumOf } from '../utils/utils.js';
import { userTransformer } from './user.transformer.js';

export const carTransformer = (car: Prisma.CarGetPayload<CarQueryArgs>): Car => {
  return {
    wbsElementId: car.wbsElementId,
    id: car.carId,
    wbsNum: wbsNumOf(car.wbsElement),
    dateCreated: car.wbsElement.dateCreated,
    name: car.wbsElement.name,
    links: car.wbsElement.links,
    status: car.wbsElement.status as WbsElementStatus,
    lead: car.wbsElement.lead ? userTransformer(car.wbsElement.lead) : undefined,
    manager: car.wbsElement.manager ? userTransformer(car.wbsElement.manager) : undefined,
    descriptionBullets: car.wbsElement.descriptionBullets.map(descBulletConverter),
    changes: [],
    deleted: car.wbsElement.dateDeleted !== null
  };
};
