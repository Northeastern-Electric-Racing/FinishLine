/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';
import materialTypeQueryArgs from '../prisma-query-args/material-type.query-args';
import { MaterialType } from 'shared';

export const materialTypeTransformer = (
  materialType: Prisma.Material_TypeGetPayload<typeof materialTypeQueryArgs>
): MaterialType => {
  return {
    name: materialType.name,
    dateCreated: materialType.dateCreated,
    creatorId: materialType.creatorId
  };
};
