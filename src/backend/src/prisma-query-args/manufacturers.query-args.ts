/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';

const manufacturerQueryArgs = Prisma.validator<Prisma.ManufacturerArgs>()({
  include: {
    materials: true
  }
});

export default manufacturerQueryArgs;
