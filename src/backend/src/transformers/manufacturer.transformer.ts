/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';
import { Manufacturer } from 'shared';
import { ManufacturerQueryArgs } from '../prisma-query-args/manufacturers.query-args';
import { materialPreviewTransformer } from './material.transformer';
import { userTransformer } from './user.transformer';

const manufacturerTransformer = (manufacturer: Prisma.ManufacturerGetPayload<ManufacturerQueryArgs>): Manufacturer => {
  return {
    name: manufacturer.name,
    dateCreated: manufacturer.dateCreated,
    userCreated: userTransformer(manufacturer.userCreated),
    dateDeleted: manufacturer.dateDeleted ?? undefined,
    materials: manufacturer.materials.map(materialPreviewTransformer)
  };
};

export default manufacturerTransformer;
