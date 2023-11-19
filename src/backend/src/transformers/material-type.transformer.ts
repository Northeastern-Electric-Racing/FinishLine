/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Material_Type, Prisma } from '@prisma/client';
import materialTypeQueryArgs from '../prisma-query-args/material-type.query-args';

export const materialTypeTransformer = (
  materialType: Prisma.Material_TypeGetPayload<typeof materialTypeQueryArgs>
): Material_Type => {
  return {
    name: materialType.name,
    dateCreated: materialType.dateCreated,
    creatorId: materialType.creatorId
  };
};
