/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/** The minimum every consumer of a date marker needs: the admin tools table and the gantt chart lines. Extend it, don't grow it. */
export interface BaseDateMarker {
  dateMarkerId: string;
  name: string;
  date: Date;
}

/** What the frontend sends to create or edit a date marker */
export interface DateMarkerArgs {
  name: string;
  date: Date;
}
