import { Prisma } from '@prisma/client';

export type BaseDateMarkerQueryArgs = ReturnType<typeof getBaseDateMarkerQueryArgs>;

export const getBaseDateMarkerQueryArgs = () =>
  Prisma.validator<Prisma.Date_MarkerDefaultArgs>()({
    select: {
      dateMarkerId: true,
      name: true,
      date: true
    }
  });
