import { Manufacturer, Prisma } from '@prisma/client';
import manufacturerQueryArgs from '../prisma-query-args/manufacturers.query-args';

export const manufacturerTransformer = (manufacturer: Prisma.ManufacturerGetPayload<typeof manufacturerQueryArgs>): Manufacturer => {
   return {
    name: manufacturer.name,
    dateCreated: manufacturer.dateCreated,
    creatorId: manufacturer.creatorId
   }
};