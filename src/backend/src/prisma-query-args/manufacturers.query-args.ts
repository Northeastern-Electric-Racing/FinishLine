import { Prisma } from '@prisma/client';

const manufacturerQueryArgs = Prisma.validator<Prisma.ManufacturerArgs>()({
  include: {
    materials: true
  }
});

export default manufacturerQueryArgs;