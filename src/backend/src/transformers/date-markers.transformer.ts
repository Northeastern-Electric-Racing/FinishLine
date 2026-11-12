import { Prisma } from '@prisma/client';
import { BaseDateMarker } from 'shared';
import { BaseDateMarkerQueryArgs } from '../prisma-query-args/date-markers.query-args.js';

export const baseDateMarkerTransformer = (
  dateMarker: Prisma.Date_MarkerGetPayload<BaseDateMarkerQueryArgs>
): BaseDateMarker => ({
  dateMarkerId: dateMarker.dateMarkerId,
  name: dateMarker.name,
  date: dateMarker.date
});
